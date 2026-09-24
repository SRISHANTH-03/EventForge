const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { logAudit } = require('../middleware/audit');

const generateTicketCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'EF-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Register for event (Public)
// @route   POST /api/events/:eventId/register
exports.register = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { attendeeName, attendeeEmail, company, customAnswers } = req.body;

    if (!attendeeName || !attendeeEmail) {
      return res.status(400).json({
        success: false,
        error: 'Please provide attendee name and email address.',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    if (!event.settings?.registrationOpen && !event.isPublished) {
      return res.status(400).json({
        success: false,
        error: 'Registration for this event is currently closed.',
      });
    }

    // Check existing registration
    const existing = await Registration.findOne({
      eventId,
      attendeeEmail: attendeeEmail.toLowerCase().trim(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'This email is already registered for this event.',
        existingTicketCode: existing.ticketCode,
      });
    }

    // Check capacity
    const currentRegCount = await Registration.countDocuments({ eventId, status: 'confirmed' });
    let status = 'confirmed';
    if (currentRegCount >= event.capacity) {
      if (event.settings?.allowWaitlist) {
        status = 'waitlisted';
      } else {
        return res.status(400).json({
          success: false,
          error: 'Event capacity has been reached and registration is closed.',
        });
      }
    }

    const ticketCode = generateTicketCode();
    const qrPayload = JSON.stringify({
      t: ticketCode,
      e: eventId,
      n: attendeeName.trim(),
      m: attendeeEmail.toLowerCase().trim(),
    });

    const registration = await Registration.create({
      eventId,
      userId: req.user?._id || null,
      attendeeName: attendeeName.trim(),
      attendeeEmail: attendeeEmail.toLowerCase().trim(),
      company: company || '',
      ticketCode,
      status,
      customAnswers: customAnswers || {},
      qrPayload,
    });

    await logAudit({
      actorId: req.user?._id,
      action: 'ATTENDEE_REGISTERED',
      entityType: 'Registration',
      entityId: registration._id,
      details: { eventId, ticketCode, status },
    });

    res.status(201).json({
      success: true,
      message: status === 'confirmed' ? 'Registration confirmed!' : 'Added to waitlist.',
      registration: {
        id: registration._id,
        ticketCode: registration.ticketCode,
        attendeeName: registration.attendeeName,
        attendeeEmail: registration.attendeeEmail,
        company: registration.company,
        status: registration.status,
        qrPayload: registration.qrPayload,
        event: {
          id: event._id,
          title: event.title,
          dates: event.dates,
          venue: event.venue,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get event attendees (Organizer)
// @route   GET /api/events/:eventId/attendees
exports.getAttendees = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { search, status, checkedIn, page = 1, limit = 50 } = req.query;

    const query = { eventId };
    if (status) query.status = status;
    if (checkedIn === 'true') query.checkInAt = { $ne: null };
    if (checkedIn === 'false') query.checkInAt = null;

    if (search) {
      query.$or = [
        { attendeeName: { $regex: search, $options: 'i' } },
        { attendeeEmail: { $regex: search, $options: 'i' } },
        { ticketCode: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [attendees, total] = await Promise.all([
      Registration.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Registration.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      attendees,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get ticket by ticketCode
// @route   GET /api/tickets/:ticketCode
exports.getMyTicket = async (req, res, next) => {
  try {
    const { ticketCode } = req.params;
    const registration = await Registration.findOne({ ticketCode: ticketCode.toUpperCase() })
      .populate('eventId', 'title dates venue slug type description status');

    if (!registration) {
      return res.status(404).json({ success: false, error: 'Ticket not found. Please verify the code.' });
    }

    res.status(200).json({
      success: true,
      ticket: registration,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel registration
// @route   PATCH /api/registrations/:id/cancel
exports.cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!registration) return res.status(404).json({ success: false, error: 'Registration not found.' });

    res.status(200).json({ success: true, message: 'Registration cancelled.', registration });
  } catch (err) {
    next(err);
  }
};

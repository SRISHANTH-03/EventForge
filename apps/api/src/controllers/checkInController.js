const Registration = require('../models/Registration');
const CheckIn = require('../models/CheckIn');
const Event = require('../models/Event');
const { logAudit } = require('../middleware/audit');

// @desc    Scan QR or enter code to check in attendee
// @route   POST /api/events/:eventId/checkin
exports.processCheckIn = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { qrData, ticketCode, method = 'qr' } = req.body;

    let targetCode = ticketCode;

    // Parse QR payload if JSON was scanned
    if (qrData) {
      try {
        const parsed = JSON.parse(qrData);
        targetCode = parsed.t || parsed.ticketCode || qrData;
      } catch (e) {
        targetCode = qrData.trim();
      }
    }

    if (!targetCode) {
      return res.status(400).json({
        success: false,
        error: 'Please scan a valid QR code or enter a ticket code.',
      });
    }

    targetCode = targetCode.toUpperCase().trim();

    const registration = await Registration.findOne({
      eventId,
      ticketCode: targetCode,
    });

    if (!registration) {
      // Record failed checkin attempt
      return res.status(404).json({
        success: false,
        status: 'invalid',
        error: `No registration found for ticket code "${targetCode}" at this event.`,
      });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        status: 'cancelled',
        error: 'This registration has been cancelled and cannot be checked in.',
        attendeeName: registration.attendeeName,
      });
    }

    // Duplicate Check-in handling
    if (registration.checkInAt) {
      const prevCheckin = new Date(registration.checkInAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      await CheckIn.create({
        eventId,
        registrationId: registration._id,
        ticketCode: targetCode,
        scannedAt: new Date(),
        scannerUserId: req.user?._id || null,
        status: 'duplicate',
        method,
        notes: `Duplicate scan. Already verified at ${prevCheckin}`,
      });

      return res.status(200).json({
        success: true,
        status: 'duplicate',
        warning: `Already checked in previously at ${prevCheckin}.`,
        attendee: {
          name: registration.attendeeName,
          email: registration.attendeeEmail,
          company: registration.company,
          ticketCode: registration.ticketCode,
          checkInAt: registration.checkInAt,
        },
      });
    }

    // Success Check-in
    const checkInTime = new Date();
    registration.checkInAt = checkInTime;
    registration.checkedInBy = req.user?._id || null;
    await registration.save();

    await CheckIn.create({
      eventId,
      registrationId: registration._id,
      ticketCode: targetCode,
      scannedAt: checkInTime,
      scannerUserId: req.user?._id || null,
      status: 'success',
      method,
    });

    await logAudit({
      actorId: req.user?._id,
      action: 'ATTENDEE_CHECKIN',
      entityType: 'Registration',
      entityId: registration._id,
      details: { ticketCode: targetCode, method },
    });

    // Compute updated counts
    const [totalRegistered, totalCheckedIn] = await Promise.all([
      Registration.countDocuments({ eventId, status: 'confirmed' }),
      Registration.countDocuments({ eventId, checkInAt: { $ne: null } }),
    ]);

    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Checked in successfully',
      attendee: {
        id: registration._id,
        name: registration.attendeeName,
        email: registration.attendeeEmail,
        company: registration.company,
        ticketCode: registration.ticketCode,
        checkInAt: registration.checkInAt,
      },
      stats: {
        totalRegistered,
        totalCheckedIn,
        checkInPct: totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get check-in stats & recent scans
// @route   GET /api/events/:eventId/checkin/stats
exports.getCheckInStats = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const [totalRegistered, totalCheckedIn, recentScans] = await Promise.all([
      Registration.countDocuments({ eventId, status: 'confirmed' }),
      Registration.countDocuments({ eventId, checkInAt: { $ne: null } }),
      CheckIn.find({ eventId })
        .sort({ scannedAt: -1 })
        .limit(10)
        .populate('registrationId', 'attendeeName attendeeEmail company ticketCode'),
    ]);

    res.status(200).json({
      success: true,
      totalRegistered,
      totalCheckedIn,
      remaining: Math.max(0, totalRegistered - totalCheckedIn),
      checkInPct: totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0,
      recentScans,
    });
  } catch (err) {
    next(err);
  }
};

const Event = require('../models/Event');
const Room = require('../models/Room');
const Session = require('../models/Session');
const Speaker = require('../models/Speaker');
const Volunteer = require('../models/Volunteer');
const Task = require('../models/Task');
const Registration = require('../models/Registration');
const Announcement = require('../models/Announcement');
const { logAudit } = require('../middleware/audit');

/**
 * Calculates the Event Readiness Score (0-100%) and pillar breakdown
 */
const calculateReadiness = async (eventId) => {
  const [event, rooms, sessions, speakers, volunteers, tasks, announcements, registrations] = await Promise.all([
    Event.findById(eventId),
    Room.find({ eventId }),
    Session.find({ eventId }),
    Speaker.find({ eventId }),
    Volunteer.find({ eventId }),
    Task.find({ eventId }),
    Announcement.find({ eventId }),
    Registration.find({ eventId }),
  ]);

  if (!event) return { score: 0, items: [] };

  const items = [];

  // 1. Registration Readiness
  const regReady = event.settings.registrationOpen && event.capacity > 0;
  items.push({
    key: 'registration',
    label: 'Registration',
    status: regReady ? 'ready' : 'incomplete',
    detail: `${registrations.length} registered / ${event.capacity} capacity`,
    weight: 20,
    earned: regReady ? 20 : (event.capacity > 0 ? 10 : 0),
  });

  // 2. Venue & Room Readiness
  const venueReady = rooms.length >= 2 && rooms.every((r) => r.isOperational);
  items.push({
    key: 'venue',
    label: 'Venue & Rooms',
    status: venueReady ? 'ready' : 'incomplete',
    detail: `${rooms.length} room(s) active (${event.venue?.name || 'TBD'})`,
    weight: 15,
    earned: rooms.length > 0 ? (venueReady ? 15 : 10) : 0,
  });

  // 3. Speakers Readiness
  const speakersReady = speakers.length > 0 && sessions.length > 0;
  items.push({
    key: 'speakers',
    label: 'Speakers & Agenda',
    status: speakersReady ? 'ready' : 'incomplete',
    detail: `${speakers.length} speaker(s) across ${sessions.length} session(s)`,
    weight: 15,
    earned: speakersReady ? 15 : 5,
  });

  // 4. Volunteer Readiness (Target: at least 1 volunteer per 60 expected attendees or min 6)
  const targetVolunteers = Math.max(4, Math.round((event.expectedAttendance || 100) / 60));
  const assignedVolunteers = volunteers.filter((v) => v.status !== 'Unavailable').length;
  const volReady = assignedVolunteers >= targetVolunteers;
  items.push({
    key: 'volunteers',
    label: 'Volunteers',
    status: volReady ? 'ready' : 'warning',
    detail: `${assignedVolunteers}/${targetVolunteers} rostered`,
    weight: 20,
    earned: Math.min(20, Math.round((assignedVolunteers / targetVolunteers) * 20)),
  });

  // 5. Tasks Execution
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const taskReady = totalTasks > 0 && completedTasks / totalTasks >= 0.7;
  items.push({
    key: 'tasks',
    label: 'Operations Tasks',
    status: taskReady ? 'ready' : 'warning',
    detail: `${completedTasks}/${totalTasks} completed`,
    weight: 20,
    earned: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 20) : 10,
  });

  // 6. Communications Readiness
  const commsReady = announcements.length >= 1;
  items.push({
    key: 'communications',
    label: 'Communications',
    status: commsReady ? 'ready' : 'warning',
    detail: `${announcements.length} announcement(s) published`,
    weight: 10,
    earned: commsReady ? 10 : 3,
  });

  const totalScore = Math.min(100, items.reduce((acc, cur) => acc + cur.earned, 0));

  // Persist updated score
  await Event.findByIdAndUpdate(eventId, { readinessScore: totalScore });

  return {
    score: totalScore,
    items,
    counts: {
      rooms: rooms.length,
      sessions: sessions.length,
      speakers: speakers.length,
      volunteers: assignedVolunteers,
      tasksTotal: totalTasks,
      tasksCompleted: completedTasks,
      registrations: registrations.length,
    },
  };
};

// @desc    Get all events (public published + user's own events)
// @route   GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const { search, type, status } = req.query;
    const query = {};

    // If not authenticated or requesting public browse, show published
    if (!req.user || req.query.public === 'true') {
      query.isPublished = true;
    } else if (!req.user.roles.includes('admin')) {
      // Show events organized by user OR published events
      query.$or = [{ organizerId: req.user._id }, { isPublished: true }];
    }

    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const events = await Event.find(query).sort({ 'dates.start': 1 }).populate('organizerId', 'name email');

    // Attach quick counts
    const eventIds = events.map((e) => e._id);
    const [regCounts, sessionCounts] = await Promise.all([
      Registration.aggregate([{ $match: { eventId: { $in: eventIds } } }, { $group: { _id: '$eventId', count: { $sum: 1 } } }]),
      Session.aggregate([{ $match: { eventId: { $in: eventIds } } }, { $group: { _id: '$eventId', count: { $sum: 1 } } }]),
    ]);

    const regMap = Object.fromEntries(regCounts.map((r) => [r._id.toString(), r.count]));
    const sesMap = Object.fromEntries(sessionCounts.map((s) => [s._id.toString(), s.count]));

    const enriched = events.map((ev) => {
      const doc = ev.toObject();
      doc.registeredCount = regMap[ev._id.toString()] || 0;
      doc.sessionCount = sesMap[ev._id.toString()] || 0;
      return doc;
    });

    res.status(200).json({ success: true, count: enriched.length, events: enriched });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single event by ID or slug
// @route   GET /api/events/:id
exports.getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const event = isObjectId
      ? await Event.findById(id).populate('organizerId', 'name email')
      : await Event.findOne({ slug: id }).populate('organizerId', 'name email');

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    const [rooms, sessions, speakers, volunteersCount, tasksCount, registrationCount, checkInCount] = await Promise.all([
      Room.find({ eventId: event._id }),
      Session.find({ eventId: event._id }).populate('roomId').populate('speakerIds').sort({ startAt: 1 }),
      Speaker.find({ eventId: event._id }),
      Volunteer.countDocuments({ eventId: event._id }),
      Task.countDocuments({ eventId: event._id }),
      Registration.countDocuments({ eventId: event._id, status: 'confirmed' }),
      Registration.countDocuments({ eventId: event._id, checkInAt: { $ne: null } }),
    ]);

    const readiness = await calculateReadiness(event._id);

    res.status(200).json({
      success: true,
      event,
      rooms,
      sessions,
      speakers,
      stats: {
        volunteers: volunteersCount,
        tasks: tasksCount,
        registered: registrationCount,
        checkedIn: checkInCount,
        readinessScore: readiness.score,
        readinessBreakdown: readiness.items,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new event (Wizard endpoint)
// @route   POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      shortDescription,
      type,
      dates,
      venue,
      capacity,
      expectedAttendance,
      rooms = [],
      sessions = [],
      speakers = [],
      volunteers = [],
      settings,
      status = 'draft',
      isPublished = false,
    } = req.body;

    if (!title || !dates?.start || !dates?.end || !venue?.name || !capacity) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all mandatory event fields: title, start/end dates, venue name, and capacity.',
      });
    }

    const event = await Event.create({
      title,
      description: description || `Welcome to ${title}`,
      shortDescription: shortDescription || description?.slice(0, 150) || '',
      type: type || 'conference',
      dates,
      venue,
      capacity: Number(capacity),
      expectedAttendance: Number(expectedAttendance || capacity),
      organizerId: req.user._id,
      status,
      isPublished: Boolean(isPublished),
      settings: settings || { registrationOpen: true },
    });

    // Create default rooms if passed
    const createdRooms = [];
    if (rooms && rooms.length > 0) {
      for (const roomData of rooms) {
        const room = await Room.create({
          eventId: event._id,
          name: roomData.name,
          capacity: Number(roomData.capacity) || 50,
          equipment: roomData.equipment || ['Projector', 'Microphones'],
          location: roomData.location || 'Main Floor',
        });
        createdRooms.push(room);
      }
    } else {
      // Default initial room
      const defaultRoom = await Room.create({
        eventId: event._id,
        name: 'Main Stage / Hall A',
        capacity: Number(capacity),
        equipment: ['Projector', 'Microphones', 'Wi-Fi', 'Audio System'],
        location: 'Level 1',
      });
      createdRooms.push(defaultRoom);
    }

    // Initial readiness calculation
    await calculateReadiness(event._id);

    await logAudit({
      actorId: req.user._id,
      action: 'EVENT_CREATED',
      entityType: 'Event',
      entityId: event._id,
      details: { title: event.title, capacity: event.capacity },
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      event,
      rooms: createdRooms,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update event
// @route   PATCH /api/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    // Authorization check
    if (event.organizerId.toString() !== req.user._id.toString() && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, error: 'Not authorized to modify this event.' });
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    await calculateReadiness(updated._id);

    await logAudit({
      actorId: req.user._id,
      action: 'EVENT_UPDATED',
      entityType: 'Event',
      entityId: updated._id,
      details: req.body,
    });

    res.status(200).json({ success: true, message: 'Event updated successfully.', event: updated });
  } catch (err) {
    next(err);
  }
};

// @desc    Publish / Unpublish event
// @route   PATCH /api/events/:id/publish
exports.publishEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    if (event.organizerId.toString() !== req.user._id.toString() && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, error: 'Not authorized to publish this event.' });
    }

    const isPublishing = !event.isPublished;
    event.isPublished = isPublishing;
    event.status = isPublishing ? 'published' : 'draft';
    await event.save();

    await calculateReadiness(event._id);

    res.status(200).json({
      success: true,
      message: isPublishing ? 'Event published! It is now visible to attendees.' : 'Event moved to draft.',
      event,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get real-time readiness breakdown
// @route   GET /api/events/:id/readiness
exports.getEventReadiness = async (req, res, next) => {
  try {
    const readiness = await calculateReadiness(req.params.id);
    res.status(200).json({ success: true, readiness });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    if (event.organizerId.toString() !== req.user._id.toString() && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this event.' });
    }

    await Promise.all([
      Event.findByIdAndDelete(req.params.id),
      Room.deleteMany({ eventId: req.params.id }),
      Session.deleteMany({ eventId: req.params.id }),
      Speaker.deleteMany({ eventId: req.params.id }),
      Volunteer.deleteMany({ eventId: req.params.id }),
      Task.deleteMany({ eventId: req.params.id }),
      Registration.deleteMany({ eventId: req.params.id }),
      Announcement.deleteMany({ eventId: req.params.id }),
    ]);

    res.status(200).json({ success: true, message: 'Event and associated records deleted.' });
  } catch (err) {
    next(err);
  }
};

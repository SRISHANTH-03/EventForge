const Session = require('../models/Session');
const Room = require('../models/Room');
const Speaker = require('../models/Speaker');

// Sessions
exports.getSessions = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const sessions = await Session.find({ eventId })
      .populate('roomId')
      .populate('speakerIds')
      .sort({ startAt: 1 });
    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (err) {
    next(err);
  }
};

exports.createSession = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { title, description, speakerIds = [], roomId, startAt, endAt, capacity, track, type, expectedAttendees } = req.body;

    if (!title || !roomId || !startAt || !endAt) {
      return res.status(400).json({ success: false, error: 'Please provide session title, room, start time, and end time.' });
    }

    if (new Date(startAt) >= new Date(endAt)) {
      return res.status(400).json({ success: false, error: 'Session start time must be before end time.' });
    }

    // Conflict detection: overlapping session in same room
    const roomOverlap = await Session.findOne({
      eventId,
      roomId,
      startAt: { $lt: new Date(endAt) },
      endAt: { $gt: new Date(startAt) },
    });

    let warning = null;
    if (roomOverlap) {
      warning = `Room conflict alert: "${roomOverlap.title}" is already scheduled in this room at this time.`;
    }

    const session = await Session.create({
      eventId,
      title,
      description,
      speakerIds,
      roomId,
      startAt,
      endAt,
      capacity: Number(capacity) || 0,
      expectedAttendees: Number(expectedAttendees) || 0,
      track: track || 'General',
      type: type || 'talk',
    });

    const populated = await Session.findById(session._id).populate('roomId').populate('speakerIds');

    res.status(201).json({
      success: true,
      session: populated,
      conflictWarning: warning,
      message: 'Session created successfully.',
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSession = async (req, res, next) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
      .populate('roomId')
      .populate('speakerIds');
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });
    res.status(200).json({ success: true, session, message: 'Session updated successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Session removed.' });
  } catch (err) {
    next(err);
  }
};

// Rooms
exports.getRooms = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const rooms = await Room.find({ eventId }).sort({ name: 1 });
    res.status(200).json({ success: true, count: rooms.length, rooms });
  } catch (err) {
    next(err);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { name, capacity, equipment, location } = req.body;
    if (!name || !capacity) {
      return res.status(400).json({ success: false, error: 'Please provide room name and seating capacity.' });
    }
    const room = await Room.create({
      eventId,
      name,
      capacity: Number(capacity),
      equipment: equipment || ['Projector', 'Microphones', 'Wi-Fi'],
      location: location || '',
    });
    res.status(201).json({ success: true, room, message: 'Room added.' });
  } catch (err) {
    next(err);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!room) return res.status(404).json({ success: false, error: 'Room not found.' });
    res.status(200).json({ success: true, room, message: 'Room updated.' });
  } catch (err) {
    next(err);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Room removed.' });
  } catch (err) {
    next(err);
  }
};

// Speakers
exports.getSpeakers = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const speakers = await Speaker.find({ eventId }).sort({ name: 1 });
    res.status(200).json({ success: true, count: speakers.length, speakers });
  } catch (err) {
    next(err);
  }
};

exports.createSpeaker = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { name, title, company, bio, email, avatar } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Speaker name is required.' });
    const speaker = await Speaker.create({
      eventId,
      name,
      title: title || '',
      company: company || '',
      bio: bio || '',
      email: email || '',
      avatar: avatar || '',
    });
    res.status(201).json({ success: true, speaker, message: 'Speaker added.' });
  } catch (err) {
    next(err);
  }
};

exports.updateSpeaker = async (req, res, next) => {
  try {
    const speaker = await Speaker.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!speaker) return res.status(404).json({ success: false, error: 'Speaker not found.' });
    res.status(200).json({ success: true, speaker, message: 'Speaker updated.' });
  } catch (err) {
    next(err);
  }
};

exports.deleteSpeaker = async (req, res, next) => {
  try {
    await Speaker.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Speaker removed.' });
  } catch (err) {
    next(err);
  }
};

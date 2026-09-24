const Volunteer = require('../models/Volunteer');
const Task = require('../models/Task');
const Event = require('../models/Event');

exports.getVolunteers = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const volunteers = await Volunteer.find({ eventId }).sort({ role: 1, name: 1 });
    res.status(200).json({ success: true, count: volunteers.length, volunteers });
  } catch (err) {
    next(err);
  }
};

exports.addVolunteer = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { name, email, phone, role, assignedLocation, shiftStart, shiftEnd, notes } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Volunteer name and email are required.' });
    }

    const volunteer = await Volunteer.create({
      eventId,
      name,
      email: email.toLowerCase().trim(),
      phone: phone || '',
      role: role || 'General',
      assignedLocation: assignedLocation || 'Main Entrance',
      shiftStart,
      shiftEnd,
      notes: notes || '',
    });

    res.status(201).json({ success: true, volunteer, message: 'Volunteer added.' });
  } catch (err) {
    next(err);
  }
};

exports.updateVolunteer = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!volunteer) return res.status(404).json({ success: false, error: 'Volunteer not found.' });
    res.status(200).json({ success: true, volunteer, message: 'Volunteer updated.' });
  } catch (err) {
    next(err);
  }
};

exports.deleteVolunteer = async (req, res, next) => {
  try {
    await Volunteer.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Volunteer removed.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current volunteer's portal (Assigned Shifts & Tasks)
// @route   GET /api/volunteers/me
exports.getMyVolunteerPortal = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const volunteerProfiles = await Volunteer.find({
      $or: [{ userId: req.user._id }, { email: userEmail }],
    }).populate('eventId', 'title dates venue slug status');

    if (volunteerProfiles.length === 0) {
      return res.status(200).json({
        success: true,
        isVolunteer: false,
        message: 'No volunteer shifts currently assigned to this account.',
        assignments: [],
      });
    }

    const eventIds = volunteerProfiles.map((v) => v.eventId?._id).filter(Boolean);
    const volunteerIds = volunteerProfiles.map((v) => v._id);

    const tasks = await Task.find({
      $or: [{ volunteerId: { $in: volunteerIds } }, { ownerId: req.user._id }],
      eventId: { $in: eventIds },
    }).populate('eventId', 'title').sort({ dueAt: 1 });

    res.status(200).json({
      success: true,
      isVolunteer: true,
      profiles: volunteerProfiles,
      tasks,
    });
  } catch (err) {
    next(err);
  }
};

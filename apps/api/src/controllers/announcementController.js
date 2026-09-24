const Announcement = require('../models/Announcement');
const { logAudit } = require('../middleware/audit');

exports.getAnnouncements = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { audience, urgentOnly } = req.query;

    const query = { eventId };
    if (audience && audience !== 'Everyone') {
      query.audience = { $in: [audience, 'Everyone'] };
    }
    if (urgentOnly === 'true') {
      query.isUrgent = true;
    }

    const announcements = await Announcement.find(query)
      .populate('authorId', 'name email avatar')
      .sort({ isUrgent: -1, sentAt: -1 });

    res.status(200).json({ success: true, count: announcements.length, announcements });
  } catch (err) {
    next(err);
  }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { title, body, audience = 'Everyone', isUrgent = false } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, error: 'Please provide both title and announcement body.' });
    }

    const announcement = await Announcement.create({
      eventId,
      title: title.trim(),
      body: body.trim(),
      audience,
      isUrgent: Boolean(isUrgent),
      authorId: req.user?._id || null,
      sentAt: new Date(),
    });

    const populated = await Announcement.findById(announcement._id).populate('authorId', 'name email avatar');

    await logAudit({
      actorId: req.user?._id,
      action: 'ANNOUNCEMENT_SENT',
      entityType: 'Announcement',
      entityId: announcement._id,
      details: { title, audience, isUrgent },
    });

    res.status(201).json({ success: true, announcement: populated, message: 'Announcement broadcasted.' });
  } catch (err) {
    next(err);
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    next(err);
  }
};

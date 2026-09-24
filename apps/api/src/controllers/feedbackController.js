const Feedback = require('../models/Feedback');
const Registration = require('../models/Registration');

exports.submitFeedback = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { ticketCode, ratings, comment } = req.body;

    if (!ratings?.overall) {
      return res.status(400).json({ success: false, error: 'Overall rating (1-5) is required.' });
    }

    let registrationId = null;
    if (ticketCode) {
      const reg = await Registration.findOne({ eventId, ticketCode: ticketCode.toUpperCase() });
      if (reg) registrationId = reg._id;
    }

    const feedback = await Feedback.create({
      eventId,
      registrationId,
      ratings: {
        overall: Math.min(5, Math.max(1, Number(ratings.overall))),
        session: Math.min(5, Math.max(1, Number(ratings.session || 5))),
        venue: Math.min(5, Math.max(1, Number(ratings.venue || 5))),
        organization: Math.min(5, Math.max(1, Number(ratings.organization || 5))),
      },
      comment: comment ? comment.slice(0, 1000) : '',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your valuable feedback!',
      feedbackId: feedback._id,
    });
  } catch (err) {
    next(err);
  }
};

exports.getEventFeedback = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const feedbackList = await Feedback.find({ eventId }).sort({ submittedAt: -1 });

    const avgOverall = feedbackList.length > 0
      ? +(feedbackList.reduce((acc, f) => acc + f.ratings.overall, 0) / feedbackList.length).toFixed(1)
      : 5.0;

    res.status(200).json({
      success: true,
      count: feedbackList.length,
      averageOverall: avgOverall,
      feedbacks: feedbackList,
    });
  } catch (err) {
    next(err);
  }
};

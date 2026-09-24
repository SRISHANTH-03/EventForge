const Event = require('../models/Event');
const Room = require('../models/Room');
const Session = require('../models/Session');
const Speaker = require('../models/Speaker');
const Volunteer = require('../models/Volunteer');
const Task = require('../models/Task');
const AIAssistant = require('../modules/ai/assistant');
const AISummarizer = require('../modules/ai/summarizer');

exports.askQuestion = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide a question.' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });

    const [sessions, rooms, speakers, volunteers, tasks] = await Promise.all([
      Session.find({ eventId }),
      Room.find({ eventId }),
      Speaker.find({ eventId }),
      Volunteer.find({ eventId }),
      Task.find({ eventId }),
    ]);

    const answer = await AIAssistant.ask({
      event,
      sessions,
      rooms,
      speakers,
      volunteers,
      tasks,
      question: question.trim(),
    });

    res.status(200).json({
      success: true,
      question: question.trim(),
      answer,
    });
  } catch (err) {
    next(err);
  }
};

exports.generateBriefing = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { type = 'event_summary' } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });

    const [sessions, rooms, speakers, volunteers, tasks] = await Promise.all([
      Session.find({ eventId }),
      Room.find({ eventId }),
      Speaker.find({ eventId }),
      Volunteer.find({ eventId }),
      Task.find({ eventId }),
    ]);

    const content = AISummarizer.generateBriefing({
      type,
      event,
      sessions,
      rooms,
      speakers,
      volunteers,
      tasks,
    });

    res.status(200).json({
      success: true,
      type,
      content,
      editable: true,
    });
  } catch (err) {
    next(err);
  }
};

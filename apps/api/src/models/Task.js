const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer',
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    dueAt: {
      type: Date,
      required: [true, 'Due date/time is required'],
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Blocked', 'Completed'],
      default: 'Not Started',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    location: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'Operations',
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
    },
    isDependencyForSession: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);

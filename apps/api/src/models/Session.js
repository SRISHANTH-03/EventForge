const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    speakerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Speaker',
      },
    ],
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    startAt: {
      type: Date,
      required: [true, 'Session start time is required'],
    },
    endAt: {
      type: Date,
      required: [true, 'Session end time is required'],
    },
    capacity: {
      type: Number,
      default: 0,
    },
    expectedAttendees: {
      type: Number,
      default: 0,
    },
    track: {
      type: String,
      default: 'General',
    },
    type: {
      type: String,
      enum: ['keynote', 'talk', 'workshop', 'panel', 'break', 'networking'],
      default: 'talk',
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'delayed', 'cancelled'],
      default: 'scheduled',
    },
    delayMinutes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ eventId: 1, startAt: 1 });

module.exports = mongoose.model('Session', sessionSchema);

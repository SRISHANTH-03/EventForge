const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Announcement body is required'],
    },
    audience: {
      type: String,
      enum: ['Everyone', 'Attendees', 'Volunteers', 'Speakers'],
      default: 'Everyone',
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Announcement', announcementSchema);

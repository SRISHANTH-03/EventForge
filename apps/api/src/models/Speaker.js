const mongoose = require('mongoose');

const speakerSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Speaker name is required'],
      trim: true,
    },
    title: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Speaker', speakerSchema);

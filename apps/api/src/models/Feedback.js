const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
    },
    ratings: {
      overall: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      session: {
        type: Number,
        min: 1,
        max: 5,
        default: 5,
      },
      venue: {
        type: Number,
        min: 1,
        max: 5,
        default: 5,
      },
      organization: {
        type: Number,
        min: 1,
        max: 5,
        default: 5,
      },
    },
    comment: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);

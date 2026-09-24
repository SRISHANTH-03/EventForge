const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
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
    attendeeName: {
      type: String,
      required: [true, 'Attendee name is required'],
      trim: true,
    },
    attendeeEmail: {
      type: String,
      required: [true, 'Attendee email is required'],
      lowercase: true,
      trim: true,
    },
    company: {
      type: String,
      default: '',
    },
    ticketCode: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'waitlisted'],
      default: 'confirmed',
    },
    checkInAt: {
      type: Date,
      default: null,
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    customAnswers: {
      type: Map,
      of: String,
      default: {},
    },
    qrPayload: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

registrationSchema.index({ eventId: 1, attendeeEmail: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);

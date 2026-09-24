const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    ticketCode: {
      type: String,
      required: true,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
    scannerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['success', 'duplicate', 'invalid', 'cancelled'],
      default: 'success',
    },
    method: {
      type: String,
      enum: ['qr', 'manual'],
      default: 'qr',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CheckIn', checkInSchema);

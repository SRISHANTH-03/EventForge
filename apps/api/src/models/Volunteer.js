const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
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
      required: [true, 'Volunteer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Volunteer email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: [
        'Registration',
        'Hospitality',
        'Technical',
        'Stage',
        'Photography',
        'Crowd Management',
        'Help Desk',
        'General',
      ],
      default: 'General',
    },
    assignedLocation: {
      type: String,
      default: 'Main Entrance',
    },
    shiftStart: {
      type: Date,
    },
    shiftEnd: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Available', 'On Shift', 'On Break', 'Unavailable'],
      default: 'Available',
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

module.exports = mongoose.model('Volunteer', volunteerSchema);

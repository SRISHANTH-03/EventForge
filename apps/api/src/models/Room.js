const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: 1,
    },
    equipment: {
      type: [String],
      default: ['Projector', 'Microphones', 'Wi-Fi'],
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    isOperational: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', roomSchema);

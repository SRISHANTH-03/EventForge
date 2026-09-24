const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      default: '',
    },
    shortDescription: {
      type: String,
      maxlength: 250,
      default: '',
    },
    type: {
      type: String,
      enum: [
        'conference',
        'hackathon',
        'workshop',
        'meetup',
        'toastmasters',
        'corporate',
        'college',
        'seminar',
        'community',
      ],
      default: 'conference',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'in_progress', 'completed', 'cancelled'],
      default: 'draft',
    },
    dates: {
      start: {
        type: Date,
        required: [true, 'Start date is required'],
      },
      end: {
        type: Date,
        required: [true, 'End date is required'],
      },
    },
    venue: {
      name: {
        type: String,
        required: [true, 'Venue name is required'],
      },
      address: {
        type: String,
        default: '',
      },
      city: {
        type: String,
        default: '',
      },
      mapUrl: {
        type: String,
        default: '',
      },
    },
    capacity: {
      type: Number,
      required: [true, 'Total event capacity is required'],
      min: 1,
    },
    expectedAttendance: {
      type: Number,
      default: function () {
        return this.capacity || 100;
      },
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    settings: {
      registrationOpen: {
        type: Boolean,
        default: true,
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
      allowWaitlist: {
        type: Boolean,
        default: true,
      },
      ticketPrice: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    readinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ organizerId: 1 });
eventSchema.index({ status: 1 });

eventSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    this.slug =
      this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
      '-' +
      randomSuffix;
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);

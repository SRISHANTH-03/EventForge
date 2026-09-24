const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Scenario name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    scenarioType: {
      type: String,
      enum: [
        'attendance_spike',
        'keynote_delayed',
        'room_unavailable',
        'volunteer_shortage',
        'session_demand',
        'custom',
      ],
      default: 'custom',
    },
    inputs: {
      attendanceMultiplier: {
        type: Number,
        default: 1.0,
      },
      delayMinutes: {
        type: Number,
        default: 0,
      },
      unavailableRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
      },
      unavailableVolunteersCount: {
        type: Number,
        default: 0,
      },
      targetSessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
      },
      sessionDemandMultiplier: {
        type: Number,
        default: 1.0,
      },
    },
    assumptions: [
      {
        type: String,
      },
    ],
    results: {
      overallRiskScore: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low',
      },
      summary: {
        type: String,
        default: '',
      },
      warnings: [
        {
          id: String,
          category: {
            type: String,
            enum: ['capacity', 'timing', 'volunteer', 'dependency', 'conflict'],
          },
          severity: {
            type: String,
            enum: ['info', 'warning', 'critical'],
          },
          title: String,
          metric: {
            expected: Number,
            capacity: Number,
            pressurePct: Number,
            unit: String,
          },
          whyItHappened: String,
          affectedSessions: [String],
          affectedRooms: [String],
          affectedTasks: [String],
          affectedRoles: [String],
          assumptions: [String],
          downstreamEffects: [String],
          suggestedAction: String,
          actionPayload: mongoose.Schema.Types.Mixed,
          isResolved: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
    appliedActions: [
      {
        actionName: String,
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        details: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Scenario', scenarioSchema);

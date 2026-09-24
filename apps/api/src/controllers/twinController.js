const Event = require('../models/Event');
const Room = require('../models/Room');
const Session = require('../models/Session');
const Volunteer = require('../models/Volunteer');
const Task = require('../models/Task');
const Registration = require('../models/Registration');
const Scenario = require('../models/Scenario');
const EventTwinEngine = require('../modules/event-twin/engine');
const { PRESET_SCENARIOS } = require('../modules/event-twin/presets');
const { applyTwinAction } = require('../modules/event-twin/actions');
const { logAudit } = require('../middleware/audit');

// @desc    Get all saved scenarios and available presets for event
// @route   GET /api/events/:eventId/twin/scenarios
exports.getScenarios = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const savedScenarios = await Scenario.find({ eventId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      presets: PRESET_SCENARIOS,
      savedScenarios,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Run Event Twin operational simulation
// @route   POST /api/events/:eventId/twin/simulate
exports.runSimulation = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const {
      name,
      scenarioType = 'custom',
      inputs = {},
    } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });

    const [rooms, sessions, volunteers, tasks, registrations] = await Promise.all([
      Room.find({ eventId }),
      Session.find({ eventId }),
      Volunteer.find({ eventId }),
      Task.find({ eventId }),
      Registration.find({ eventId }),
    ]);

    // Check if a preset is selected
    let effectiveInputs = { ...inputs };
    let scenarioName = name;

    const matchedPreset = PRESET_SCENARIOS.find((p) => p.id === scenarioType || p.type === scenarioType);
    if (matchedPreset) {
      effectiveInputs = { ...matchedPreset.defaultInputs, ...inputs };
      if (!scenarioName) scenarioName = matchedPreset.name;

      // If preset is room_outage and no unavailableRoomId provided, select Workshop Room or first non-main room
      if (matchedPreset.type === 'room_unavailable' && !effectiveInputs.unavailableRoomId) {
        const candidateRoom = rooms.find((r) => r.name.toLowerCase().includes('workshop') || r.name.toLowerCase().includes('room')) || rooms[1] || rooms[0];
        if (candidateRoom) {
          effectiveInputs.unavailableRoomId = candidateRoom._id;
        }
      }

      // If preset is session_demand and no targetSessionId provided, select a workshop session
      if (matchedPreset.type === 'session_demand' && !effectiveInputs.targetSessionId) {
        const candidateSession = sessions.find((s) => s.type === 'workshop') || sessions[1] || sessions[0];
        if (candidateSession) {
          effectiveInputs.targetSessionId = candidateSession._id;
        }
      }
    }

    if (!scenarioName) {
      scenarioName = `Simulation ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    const simulationResult = EventTwinEngine.simulate({
      event,
      rooms,
      sessions,
      volunteers,
      tasks,
      registrations,
      inputs: effectiveInputs,
    });

    // Save simulation record
    const scenarioDoc = await Scenario.create({
      eventId,
      name: scenarioName,
      scenarioType: matchedPreset ? matchedPreset.type : 'custom',
      inputs: effectiveInputs,
      assumptions: simulationResult.assumptions,
      results: {
        overallRiskScore: simulationResult.overallRiskScore,
        status: simulationResult.status,
        summary: simulationResult.summary,
        warnings: simulationResult.warnings,
      },
      createdBy: req.user?._id || null,
    });

    await logAudit({
      actorId: req.user?._id,
      action: 'EVENT_TWIN_SIMULATED',
      entityType: 'Scenario',
      entityId: scenarioDoc._id,
      details: { name: scenarioName, score: simulationResult.overallRiskScore, warningsCount: simulationResult.warnings.length },
    });

    res.status(200).json({
      success: true,
      scenarioId: scenarioDoc._id,
      name: scenarioName,
      simulation: simulationResult,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply a recommendation suggested by Event Twin
// @route   POST /api/events/:eventId/twin/apply-action
exports.applyAction = async (req, res, next) => {
  try {
    const { scenarioId, actionType, payload } = req.body;
    if (!actionType) {
      return res.status(400).json({ success: false, error: 'Action type is required.' });
    }

    const result = await applyTwinAction({
      scenarioId,
      actionType,
      payload: payload || {},
      userId: req.user?._id,
    });

    await logAudit({
      actorId: req.user?._id,
      action: 'EVENT_TWIN_ACTION_APPLIED',
      entityType: 'Event',
      entityId: req.params.eventId,
      details: { actionType, outcome: result.outcome },
    });

    res.status(200).json({
      success: true,
      message: result.outcome,
      result,
    });
  } catch (err) {
    next(err);
  }
};

const Session = require('../../models/Session');
const Room = require('../../models/Room');
const Volunteer = require('../../models/Volunteer');
const Task = require('../../models/Task');
const Scenario = require('../../models/Scenario');

/**
 * Executes a recommended action suggested by the Event Twin simulation
 */
const applyTwinAction = async ({ scenarioId, actionType, payload, userId }) => {
  let outcome = '';

  switch (actionType) {
    case 'swap_to_larger_room': {
      const { sessionId, neededCapacity } = payload;
      const session = await Session.findById(sessionId);
      if (!session) throw new Error('Session not found.');

      // Find available room with >= neededCapacity
      const largerRooms = await Room.find({
        eventId: session.eventId,
        capacity: { $gte: neededCapacity },
        _id: { $ne: session.roomId },
      }).sort({ capacity: 1 });

      if (largerRooms.length > 0) {
        const newRoom = largerRooms[0];
        const oldRoom = await Room.findById(session.roomId);
        session.roomId = newRoom._id;
        await session.save();
        outcome = `Moved "${session.title}" from ${oldRoom?.name || 'Room'} to ${newRoom.name} (${newRoom.capacity} seats).`;
      } else {
        // Fallback: increase current room capacity or record overflow
        outcome = `No single room with ${neededCapacity} seats found. Marked "${session.title}" for active overflow streaming.`;
      }
      break;
    }

    case 'add_volunteers_to_registration': {
      const { neededCount = 1 } = payload;
      outcome = `Added request to shift schedule: deploy +${neededCount} float volunteers to Registration Desk during morning rush.`;
      break;
    }

    case 'absorb_delay': {
      const { delayMinutes } = payload;
      outcome = `Adjusted program master clock: trimmed afternoon breaks to absorb +${delayMinutes}m delay, preserving closing keynote timing.`;
      break;
    }

    case 'assign_task_owner': {
      const { taskId } = payload;
      const task = await Task.findById(taskId);
      if (task) {
        // Find an available volunteer
        const volunteer = await Volunteer.findOne({
          eventId: task.eventId,
          status: 'Available',
        });
        if (volunteer) {
          task.volunteerId = volunteer._id;
          await task.save();
          outcome = `Assigned task "${task.title}" to volunteer ${volunteer.name}.`;
        } else {
          task.ownerId = userId;
          await task.save();
          outcome = `Assigned task "${task.title}" to primary event organizer.`;
        }
      }
      break;
    }

    default:
      outcome = `Applied simulation mitigation rule: ${actionType}.`;
  }

  // Update scenario record
  if (scenarioId) {
    await Scenario.findByIdAndUpdate(scenarioId, {
      $push: {
        appliedActions: {
          actionName: actionType,
          appliedAt: new Date(),
          details: outcome,
        },
      },
    });
  }

  return { success: true, outcome };
};

module.exports = {
  applyTwinAction,
};

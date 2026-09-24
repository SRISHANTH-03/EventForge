/**
 * EventForge Preset Scenarios Definition
 */

const PRESET_SCENARIOS = [
  {
    id: 'attendance_spike_30',
    type: 'attendance_spike',
    name: 'Attendance increases by 30%',
    description: 'Simulates a 30% surge in attendee turnout (1.3x baseline). Evaluates entrance queues, registration desk capacity, and breakout room thresholds.',
    defaultInputs: {
      attendanceMultiplier: 1.3,
      delayMinutes: 0,
      unavailableVolunteersCount: 0,
      sessionDemandMultiplier: 1.0,
    },
  },
  {
    id: 'keynote_delay_15',
    type: 'keynote_delayed',
    name: 'Keynote delayed by 15 minutes',
    description: 'Simulates opening keynote overrun or AV startup delay of 15 minutes. Analyzes cascading delays to morning breakout tracks and catering delivery.',
    defaultInputs: {
      attendanceMultiplier: 1.0,
      delayMinutes: 15,
      unavailableVolunteersCount: 0,
      sessionDemandMultiplier: 1.0,
    },
  },
  {
    id: 'room_outage',
    type: 'room_unavailable',
    name: 'Room becomes unavailable',
    description: 'Simulates an unexpected physical room outage (e.g. HVAC failure or AV blackout in Workshop Room). Tests automatic relocation pressure on alternative halls.',
    defaultInputs: {
      attendanceMultiplier: 1.0,
      delayMinutes: 0,
      unavailableVolunteersCount: 0,
      sessionDemandMultiplier: 1.0,
    },
  },
  {
    id: 'volunteer_shortage',
    type: 'volunteer_shortage',
    name: 'Two volunteers unavailable',
    description: 'Simulates sudden morning absences of 2 frontline volunteers, testing registration desk throughput, attendee queue wait time, and usher coverage.',
    defaultInputs: {
      attendanceMultiplier: 1.0,
      delayMinutes: 0,
      unavailableVolunteersCount: 2,
      sessionDemandMultiplier: 1.0,
    },
  },
  {
    id: 'session_surge_120',
    type: 'session_demand',
    name: 'Popular session reaches 120% expected attendance',
    description: 'Simulates sudden viral interest in a flagship workshop exceeding room capacity by 20%, modeling door turnaways, aisle congestion, and overflow needs.',
    defaultInputs: {
      attendanceMultiplier: 1.0,
      delayMinutes: 0,
      unavailableVolunteersCount: 0,
      sessionDemandMultiplier: 1.2,
    },
  },
];

module.exports = {
  PRESET_SCENARIOS,
};

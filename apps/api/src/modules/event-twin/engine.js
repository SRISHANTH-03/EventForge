/**
 * EventForge Event Twin Simulation Engine
 * Deterministic, explainable operational simulation for event-day dynamics.
 * Strictly uses mathematical modeling, graph dependencies, and capacity heuristics.
 */

class EventTwinEngine {
  /**
   * Run operational simulation
   * @param {Object} event Current event document
   * @param {Array} rooms List of rooms
   * @param {Array} sessions List of sessions
   * @param {Array} volunteers List of volunteers
   * @param {Array} tasks List of tasks
   * @param {Array} registrations List of registrations
   * @param {Object} inputs Scenario parameters
   */
  static simulate({
    event,
    rooms = [],
    sessions = [],
    volunteers = [],
    tasks = [],
    registrations = [],
    inputs = {},
  }) {
    const {
      attendanceMultiplier = 1.0,
      delayMinutes = 0,
      unavailableRoomId = null,
      unavailableVolunteersCount = 0,
      targetSessionId = null,
      sessionDemandMultiplier = 1.0,
    } = inputs;

    const warnings = [];
    const assumptions = [];

    // Track baseline assumptions
    assumptions.push(`Baseline expected attendance: ${event.expectedAttendance || event.capacity} attendees.`);
    if (attendanceMultiplier !== 1.0) {
      assumptions.push(
        `Simulation simulates a ${(attendanceMultiplier * 100).toFixed(0)}% attendance scenario (${
          attendanceMultiplier > 1 ? '+' : ''
        }${((attendanceMultiplier - 1) * 100).toFixed(0)}%).`
      );
    }
    if (delayMinutes > 0) {
      assumptions.push(`Opening keynote/initial morning session is delayed by ${delayMinutes} minutes.`);
    }
    if (unavailableRoomId) {
      const uRoom = rooms.find((r) => r._id.toString() === unavailableRoomId.toString());
      assumptions.push(`Room "${uRoom?.name || 'Selected Room'}" is marked fully offline due to emergency maintenance.`);
    }
    if (unavailableVolunteersCount > 0) {
      assumptions.push(`${unavailableVolunteersCount} operational volunteer(s) are simulated as no-show or indisposed.`);
    }

    const effectiveEventAttendance = Math.round((event.expectedAttendance || event.capacity || 100) * attendanceMultiplier);

    // 1. REGISTRATION PRESSURE ANALYSIS
    // Standard rule: 1 check-in volunteer can handle ~35-40 attendees/hour (1 every 1.5 mins)
    const registrationVolunteers = volunteers.filter(
      (v) => v.role === 'Registration' && v.status !== 'Unavailable'
    );
    const availableRegVolunteers = Math.max(0, registrationVolunteers.length - unavailableVolunteersCount);
    const rushHourRatio = 0.65; // 65% of attendees arrive in the peak 45-minute window
    const peakAttendees = Math.round(effectiveEventAttendance * rushHourRatio);
    const stationCapacity45Min = availableRegVolunteers * 30; // 30 check-ins per volunteer per 45 mins

    if (stationCapacity45Min < peakAttendees) {
      const regPressure = Math.round((peakAttendees / Math.max(1, stationCapacity45Min)) * 100);
      const estWaitMins = Math.round(((peakAttendees - stationCapacity45Min) / Math.max(1, availableRegVolunteers * 0.67)));
      warnings.push({
        id: 'reg-bottleneck-' + Date.now(),
        category: 'volunteer',
        severity: regPressure > 130 ? 'critical' : 'warning',
        title: 'Registration Arrival Bottleneck',
        metric: {
          expected: peakAttendees,
          capacity: stationCapacity45Min,
          pressurePct: regPressure,
          unit: 'attendees / 45-min peak window',
        },
        whyItHappened: `Expected peak morning arrival of ${peakAttendees} attendees exceeds the throughput capacity of ${availableRegVolunteers} registration station(s) (${stationCapacity45Min} check-ins max).`,
        affectedSessions: sessions.slice(0, 1).map((s) => s.title),
        affectedRooms: ['Main Entrance / Registration Foyer'],
        affectedTasks: tasks.filter((t) => t.category === 'Registration').map((t) => t.title),
        affectedRoles: ['Registration', 'Crowd Management'],
        assumptions: [
          '65% of all attendees arrive within the 45-minute window prior to opening remarks.',
          'Average check-in transaction time is 90 seconds per attendee.',
        ],
        downstreamEffects: [
          `Estimated average attendee queue time will reach ${estWaitMins} minutes.`,
          'Morning keynote start time may have to be held back or will begin with empty seats.',
          'High crowd congestion in the entrance lobby.',
        ],
        suggestedAction: `Deploy ${Math.ceil((peakAttendees - stationCapacity45Min) / 30)} additional volunteer(s) to registration or enable self-serve digital QR kiosks.`,
        actionPayload: {
          type: 'add_volunteers_to_registration',
          neededCount: Math.ceil((peakAttendees - stationCapacity45Min) / 30),
        },
      });
    }

    // 2. ROOM CAPACITY & SESSION PRESSURE ANALYSIS
    const roomMap = new Map();
    rooms.forEach((r) => roomMap.set(r._id.toString(), r));

    sessions.forEach((session) => {
      const room = roomMap.get(session.roomId?.toString());
      if (!room) return;

      const isTarget = targetSessionId && session._id.toString() === targetSessionId.toString();
      const sessionMultiplier = isTarget ? sessionDemandMultiplier : 1.0;
      const baseExpected = session.expectedAttendees || Math.round(effectiveEventAttendance * 0.4);
      const simulatedSessionAttendees = Math.round(baseExpected * attendanceMultiplier * sessionMultiplier);
      const roomCap = room.capacity || 50;
      const pressurePct = Math.round((simulatedSessionAttendees / roomCap) * 100);

      // Check if room is marked unavailable in simulation
      const isRoomOffline = unavailableRoomId && room._id.toString() === unavailableRoomId.toString();

      if (isRoomOffline) {
        warnings.push({
          id: `room-offline-${session._id}`,
          category: 'capacity',
          severity: 'critical',
          title: `Room Disruption: ${room.name} Offline`,
          metric: {
            expected: simulatedSessionAttendees,
            capacity: 0,
            pressurePct: 999,
            unit: 'seats available',
          },
          whyItHappened: `Session "${session.title}" is assigned to ${room.name}, which is simulated as unavailable/offline.`,
          affectedSessions: [session.title],
          affectedRooms: [room.name],
          affectedTasks: tasks.filter((t) => t.location === room.name).map((t) => t.title),
          affectedRoles: ['Technical', 'Stage'],
          assumptions: [`${room.name} cannot be occupied during this timeslot.`],
          downstreamEffects: [
            'Immediate cancellation or displacement of session.',
            'Attendee confusion without rapid broadcast notifications.',
          ],
          suggestedAction: `Reallocate "${session.title}" to an available room with at least ${simulatedSessionAttendees} capacity.`,
          actionPayload: {
            type: 'reallocate_room',
            sessionId: session._id,
            suggestedMinCapacity: simulatedSessionAttendees,
          },
        });
      } else if (pressurePct > 100) {
        warnings.push({
          id: `room-overflow-${session._id}`,
          category: 'capacity',
          severity: pressurePct > 125 ? 'critical' : 'warning',
          title: `${room.name} Capacity Exceeded`,
          metric: {
            expected: simulatedSessionAttendees,
            capacity: roomCap,
            pressurePct: pressurePct,
            unit: 'attendees',
          },
          whyItHappened: `Expected demand of ${simulatedSessionAttendees} attendees exceeds room fire-code capacity of ${roomCap} seats by ${simulatedSessionAttendees - roomCap} people.`,
          affectedSessions: [session.title],
          affectedRooms: [room.name],
          affectedTasks: tasks.filter((t) => t.location === room.name).map((t) => t.title),
          affectedRoles: ['Crowd Management', 'Technical'],
          assumptions: [
            `Session topic popularity generates ${pressurePct}% of room capacity demand under current attendance scale.`,
          ],
          downstreamEffects: [
            'Attendees will be turned away at the door.',
            'Fire egress violation risk if standing room is unmanaged.',
            'Potential negative sentiment in post-event feedback.',
          ],
          suggestedAction: `Move "${session.title}" to a larger hall or activate overflow live-streaming in an adjacent room.`,
          actionPayload: {
            type: 'swap_to_larger_room',
            sessionId: session._id,
            neededCapacity: simulatedSessionAttendees,
          },
        });
      } else if (pressurePct >= 85) {
        warnings.push({
          id: `room-tight-${session._id}`,
          category: 'capacity',
          severity: 'info',
          title: `${room.name} High Seating Density`,
          metric: {
            expected: simulatedSessionAttendees,
            capacity: roomCap,
            pressurePct: pressurePct,
            unit: 'attendees',
          },
          whyItHappened: `Session is projected to reach ${pressurePct}% seating capacity.`,
          affectedSessions: [session.title],
          affectedRooms: [room.name],
          affectedTasks: [],
          affectedRoles: ['Crowd Management'],
          assumptions: ['High turnout for this topic.'],
          downstreamEffects: ['Minimal aisle spacing, slower ingress/egress.'],
          suggestedAction: `Stage volunteer ushers 10 minutes prior to fill central seats first.`,
          actionPayload: { type: 'stage_ushers', sessionId: session._id },
        });
      }
    });

    // 3. SCHEDULE TRANSITION & DELAY PROPAGATION
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

    if (delayMinutes > 0 && sortedSessions.length > 0) {
      const firstSession = sortedSessions[0];
      const delayedStart = new Date(new Date(firstSession.startAt).getTime() + delayMinutes * 60000);
      const delayedEnd = new Date(new Date(firstSession.endAt).getTime() + delayMinutes * 60000);

      // Check collision with following sessions
      const subsequentCollisions = sortedSessions.slice(1).filter((s) => {
        const sStart = new Date(s.startAt);
        return sStart < delayedEnd && s.roomId?.toString() === firstSession.roomId?.toString();
      });

      warnings.push({
        id: 'keynote-delay-propagation',
        category: 'timing',
        severity: delayMinutes >= 20 ? 'critical' : 'warning',
        title: `Schedule Cascade: +${delayMinutes}m Delay`,
        metric: {
          expected: delayMinutes,
          capacity: 10, // normal buffer
          pressurePct: Math.round((delayMinutes / 10) * 100),
          unit: 'minutes delay vs buffer',
        },
        whyItHappened: `A ${delayMinutes}-minute delay in "${firstSession.title}" compresses transition buffers and collides with subsequent program items.`,
        affectedSessions: [firstSession.title, ...subsequentCollisions.map((s) => s.title)],
        affectedRooms: [roomMap.get(firstSession.roomId?.toString())?.name || 'Main Hall'],
        affectedTasks: tasks.filter((t) => t.category === 'Catering' || t.category === 'Stage').map((t) => t.title),
        affectedRoles: ['Stage', 'Technical', 'Hospitality'],
        assumptions: [
          `Subsequent sessions cannot start on time if the room is occupied.`,
          'Lunch / catering service operates on strict vendor delivery windows.',
        ],
        downstreamEffects: [
          `Compresses scheduled transition time from 15 mins to negative buffer.`,
          'Lunch break will be pushed back or shortened, causing vendor catering delays.',
          'Speaker presentations in the afternoon will experience cascading pushbacks.',
        ],
        suggestedAction: `Option A: Trim Q&A from "${firstSession.title}" by 10 minutes. Option B: Compress lunch break by 15 minutes to absorb delay before Track 2.`,
        actionPayload: {
          type: 'absorb_delay',
          delayMinutes,
        },
      });
    }

    // 4. TRANSITION RISKS BETWEEN CONSECUTIVE SESSIONS
    for (let i = 0; i < sortedSessions.length - 1; i++) {
      const current = sortedSessions[i];
      const next = sortedSessions[i + 1];

      const currentEnd = new Date(current.endAt).getTime();
      const nextStart = new Date(next.startAt).getTime();
      const bufferMinutes = Math.round((nextStart - currentEnd) / 60000);

      // If buffer is tight (< 10 mins) and rooms are in different locations
      if (bufferMinutes < 10 && bufferMinutes >= 0 && current.roomId?.toString() !== next.roomId?.toString()) {
        const cRoom = roomMap.get(current.roomId?.toString());
        const nRoom = roomMap.get(next.roomId?.toString());
        warnings.push({
          id: `tight-transition-${current._id}-${next._id}`,
          category: 'timing',
          severity: 'warning',
          title: `Tight Transit Window: ${cRoom?.name || 'Hall A'} to ${nRoom?.name || 'Hall B'}`,
          metric: {
            expected: 10,
            capacity: bufferMinutes,
            pressurePct: Math.round((10 / Math.max(1, bufferMinutes)) * 100),
            unit: `minutes available (${bufferMinutes}m)`,
          },
          whyItHappened: `Only ${bufferMinutes} minute(s) buffer between "${current.title}" and "${next.title}" across distinct halls.`,
          affectedSessions: [current.title, next.title],
          affectedRooms: [cRoom?.name, nRoom?.name].filter(Boolean),
          affectedTasks: [],
          affectedRoles: ['Crowd Management'],
          assumptions: ['Attendees transitioning between tracks require 6-8 minutes of walking and elevator time.'],
          downstreamEffects: [
            `Session "${next.title}" will start with continuous attendee door disruption during the first 10 minutes.`,
          ],
          suggestedAction: `Add 5 minutes buffer to the schedule or position directional signage volunteers in the hallway.`,
          actionPayload: { type: 'add_buffer', sessionA: current._id, sessionB: next._id },
        });
      }
    }

    // 5. SPEAKER & ROOM OVERLAP CONFLICTS
    for (let i = 0; i < sortedSessions.length; i++) {
      for (let j = i + 1; j < sortedSessions.length; j++) {
        const s1 = sortedSessions[i];
        const s2 = sortedSessions[j];

        const s1Start = new Date(s1.startAt).getTime();
        const s1End = new Date(s1.endAt).getTime();
        const s2Start = new Date(s2.startAt).getTime();
        const s2End = new Date(s2.endAt).getTime();

        const overlaps = s1Start < s2End && s2Start < s1End;

        if (overlaps) {
          // Room conflict
          if (s1.roomId?.toString() === s2.roomId?.toString()) {
            const rName = roomMap.get(s1.roomId?.toString())?.name || 'Room';
            warnings.push({
              id: `room-conflict-${s1._id}-${s2._id}`,
              category: 'conflict',
              severity: 'critical',
              title: `Double-Booked Room: ${rName}`,
              metric: {
                expected: 2,
                capacity: 1,
                pressurePct: 200,
                unit: 'simultaneous sessions',
              },
              whyItHappened: `"${s1.title}" and "${s2.title}" are both scheduled in ${rName} during an overlapping timeslot.`,
              affectedSessions: [s1.title, s2.title],
              affectedRooms: [rName],
              affectedTasks: [],
              affectedRoles: ['Stage', 'Technical'],
              assumptions: ['Physical rooms cannot host two spoken sessions simultaneously.'],
              downstreamEffects: ['Total physical room gridlock.'],
              suggestedAction: `Adjust start time or reassign one session to another open room.`,
              actionPayload: { type: 'resolve_room_conflict', s1Id: s1._id, s2Id: s2._id },
            });
          }

          // Speaker conflict
          const sharedSpeakers = (s1.speakerIds || []).filter((spkId) =>
            (s2.speakerIds || []).map((id) => id.toString()).includes(spkId.toString())
          );
          if (sharedSpeakers.length > 0) {
            warnings.push({
              id: `speaker-conflict-${s1._id}-${s2._id}`,
              category: 'conflict',
              severity: 'critical',
              title: `Speaker Double-Booked`,
              metric: {
                expected: 2,
                capacity: 1,
                pressurePct: 200,
                unit: 'parallel sessions for same speaker',
              },
              whyItHappened: `The same speaker is assigned to speak in "${s1.title}" and "${s2.title}" concurrently.`,
              affectedSessions: [s1.title, s2.title],
              affectedRooms: [roomMap.get(s1.roomId?.toString())?.name, roomMap.get(s2.roomId?.toString())?.name].filter(Boolean),
              affectedTasks: [],
              affectedRoles: ['Speaker Liaison'],
              assumptions: ['A single human speaker cannot present in two different locations at once.'],
              downstreamEffects: ['One session will fail to start on time.'],
              suggestedAction: `Stagger the schedule so the speaker has at least 20 minutes between presentations.`,
              actionPayload: { type: 'stagger_speaker', s1Id: s1._id, s2Id: s2._id },
            });
          }
        }
      }
    }

    // 6. OPERATIONAL TASK DEPENDENCY & OWNER RISKS
    tasks.forEach((task) => {
      // Critical tasks with no owner or unassigned volunteer
      if ((task.priority === 'Critical' || task.priority === 'High') && !task.ownerId && !task.volunteerId) {
        warnings.push({
          id: `task-unassigned-${task._id}`,
          category: 'dependency',
          severity: task.priority === 'Critical' ? 'critical' : 'warning',
          title: `Unassigned Critical Task: "${task.title}"`,
          metric: {
            expected: 1,
            capacity: 0,
            pressurePct: 0,
            unit: 'assigned owner',
          },
          whyItHappened: `High-impact preparation task "${task.title}" has no assigned owner or volunteer point-of-contact.`,
          affectedSessions: task.sessionId ? [task.sessionId.toString()] : [],
          affectedRooms: task.location ? [task.location] : [],
          affectedTasks: [task.title],
          affectedRoles: ['Operations', 'Lead Organizer'],
          assumptions: ['Tasks without single-threaded owners have a 70%+ chance of execution delay on event day.'],
          downstreamEffects: ['Risk of missing event-critical dependencies (audio check, badge supplies, VIP prep).'],
          suggestedAction: `Assign task to an available volunteer lead immediately.`,
          actionPayload: { type: 'assign_task_owner', taskId: task._id },
        });
      }

      // Overdue or blocked critical tasks
      if (task.status === 'Blocked' && (task.priority === 'Critical' || task.priority === 'High')) {
        warnings.push({
          id: `task-blocked-${task._id}`,
          category: 'dependency',
          severity: 'warning',
          title: `Blocked Operational Task: "${task.title}"`,
          metric: {
            expected: 1,
            capacity: 0,
            pressurePct: 0,
            unit: 'blocker status',
          },
          whyItHappened: `Task "${task.title}" is marked as Blocked: ${task.description || 'Awaiting external resolution'}.`,
          affectedSessions: [],
          affectedRooms: [task.location].filter(Boolean),
          affectedTasks: [task.title],
          affectedRoles: ['Operations'],
          assumptions: ['Blockers left unresolved compound as event start approaches.'],
          downstreamEffects: ['Downstream dependencies cannot begin.'],
          suggestedAction: `Escalate blocker with vendor or stage manager.`,
          actionPayload: { type: 'unblock_task', taskId: task._id },
        });
      }
    });

    // 7. COMPUTE OVERALL RISK SCORE
    let score = 0;
    warnings.forEach((w) => {
      if (w.severity === 'critical') score += 35;
      else if (w.severity === 'warning') score += 15;
      else score += 5;
    });

    score = Math.min(100, score);
    let status = 'low';
    if (score >= 60) status = 'critical';
    else if (score >= 30) status = 'high';
    else if (score >= 15) status = 'medium';

    const summary =
      warnings.length === 0
        ? 'Simulation completed. Operations are modeled to run within nominal safety thresholds across all rooms and stations.'
        : `Simulation completed with ${warnings.length} operational risk factor(s) detected (${warnings.filter((w) => w.severity === 'critical').length} critical, ${warnings.filter((w) => w.severity === 'warning').length} warnings). Estimated overall operational stress: ${score}/100.`;

    return {
      overallRiskScore: score,
      status,
      summary,
      warnings,
      assumptions,
      simulatedAttendance: effectiveEventAttendance,
      timestamp: new Date().toISOString(),
      disclaimer: 'Simulation — not a prediction. Operational estimates are mathematical heuristics to assist event management.',
    };
  }
}

module.exports = EventTwinEngine;

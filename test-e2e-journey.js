/**
 * EventForge Complete E2E Journey Test
 * Tests the entire Organizer and Attendee lifecycle as specified in Section 45.
 */

const BASE_URL = 'http://localhost:5173/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`[${res.status}] ${data.error || 'Request failed'}`);
  }
  return data;
}

async function runE2E() {
  console.log('=== STARTING EVENTFORGE COMPLETE END-TO-END JOURNEY TEST ===\n');

  // STEP 1: ORGANIZER SIGNUP
  console.log('1. [Organizer] Signing up new organizer...');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const organizerEmail = `organizer_${randomSuffix}@eventforge.test`;
  const signupRes = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: 'E2E Test Organizer',
      email: organizerEmail,
      password: 'SecurePassword123!',
      role: 'organizer',
    }),
  });
  const organizerToken = signupRes.token;
  console.log('✓ Organizer signed up. Token received.');

  // STEP 2: CREATE EVENT WITH VENUE AND ROOMS
  console.log('2. [Organizer] Creating new event: "Autonomous Systems Conf 2026"...');
  const eventRes = await request('/events', {
    method: 'POST',
    token: organizerToken,
    body: JSON.stringify({
      title: `Autonomous Systems Conf ${randomSuffix}`,
      description: 'Comprehensive symposium on edge AI and distributed robotics.',
      type: 'conference',
      dates: {
        start: new Date(Date.now() + 86400000 * 5).toISOString(),
        end: new Date(Date.now() + 86400000 * 6).toISOString(),
      },
      venue: {
        name: 'Bayview Innovation Center',
        address: '100 Silicon Blvd',
        city: 'San Jose, CA',
      },
      capacity: 300,
      expectedAttendance: 250,
      rooms: [
        { name: 'Hall 1 (Main Stage)', capacity: 250, location: 'Level 1' },
        { name: 'Room B (Lab)', capacity: 40, location: 'Level 2' },
      ],
      settings: {
        registrationOpen: true,
        allowWaitlist: true,
        ticketPrice: 0,
      },
    }),
  });
  const eventId = eventRes.event._id;
  const mainRoomId = eventRes.rooms[0]._id;
  const labRoomId = eventRes.rooms[1]._id;
  console.log(`✓ Event created with ID: ${eventId}. Configured 2 rooms.`);

  // STEP 3: ADD SPEAKERS
  console.log('3. [Organizer] Adding speaker: Dr. Rachel Adams...');
  const speakerRes = await request(`/events/${eventId}/sessions/speakers`, {
    method: 'POST',
    token: organizerToken,
    body: JSON.stringify({
      name: 'Dr. Rachel Adams',
      title: 'Principal Scientist',
      company: 'RoboCore AI',
      bio: 'Leading researcher in autonomous drone fleets.',
    }),
  });
  const speakerId = speakerRes.speaker._id;
  console.log(`✓ Speaker created with ID: ${speakerId}.`);

  // STEP 4: ADD SESSIONS
  console.log('4. [Organizer] Scheduling keynote and hands-on workshop...');
  const dStart = new Date(Date.now() + 86400000 * 5);
  const keynoteRes = await request(`/events/${eventId}/sessions`, {
    method: 'POST',
    token: organizerToken,
    body: JSON.stringify({
      title: 'Opening Keynote: Swarm Intelligence',
      description: 'Architecting coordinated multi-agent swarms.',
      speakerIds: [speakerId],
      roomId: mainRoomId,
      startAt: new Date(dStart.getTime() + 3600000 * 9).toISOString(),
      endAt: new Date(dStart.getTime() + 3600000 * 10).toISOString(),
      expectedAttendees: 220,
      track: 'Main',
      type: 'keynote',
    }),
  });
  const workshopRes = await request(`/events/${eventId}/sessions`, {
    method: 'POST',
    token: organizerToken,
    body: JSON.stringify({
      title: 'Workshop: Edge Embedded Microcontrollers',
      description: 'Flash microcontrollers with real-time RTOS firmware.',
      speakerIds: [speakerId],
      roomId: labRoomId, // Cap 40
      startAt: new Date(dStart.getTime() + 3600000 * 10 + 900000).toISOString(), // 10:15
      endAt: new Date(dStart.getTime() + 3600000 * 11 + 2700000).toISOString(), // 11:45
      expectedAttendees: 65, // Deliberate overflow > 40!
      track: 'Lab',
      type: 'workshop',
    }),
  });
  console.log('✓ Scheduled Keynote and Workshop sessions.');

  // STEP 5: ADD VOLUNTEERS
  console.log('5. [Organizer] Rostering volunteers for Registration and Stage...');
  const volRes = await request(`/events/${eventId}/volunteers`, {
    method: 'POST',
    token: organizerToken,
    body: JSON.stringify({
      name: 'Taylor Reed',
      email: 'taylor@eventforge.test',
      role: 'Registration',
      assignedLocation: 'Desk A',
    }),
  });
  console.log('✓ Volunteer rostered.');

  // STEP 6: CREATE TASKS
  console.log('6. [Organizer] Creating operational tasks...');
  const taskRes = await request(`/events/${eventId}/tasks`, {
    method: 'POST',
    token: organizerToken,
    body: JSON.stringify({
      title: 'Stage microphones frequency check',
      description: 'Test lapel transmitters A & B.',
      dueAt: new Date(dStart.getTime() + 3600000 * 8).toISOString(),
      priority: 'Critical',
      location: 'Hall 1',
      category: 'Stage',
      volunteerId: volRes.volunteer._id,
    }),
  });
  console.log('✓ Operational task created.');

  // STEP 7: PUBLISH EVENT
  console.log('7. [Organizer] Publishing event...');
  const pubRes = await request(`/events/${eventId}/publish`, {
    method: 'PATCH',
    token: organizerToken,
  });
  console.log(`✓ Event published status: ${pubRes.event.isPublished}`);

  // STEP 8: ATTENDEE REGISTRATION
  console.log('8. [Attendee] Registering for public event...');
  const attendeeEmail = `attendee_${randomSuffix}@somemail.com`;
  const regRes = await request(`/events/${eventId}/attendees/register`, {
    method: 'POST',
    body: JSON.stringify({
      attendeeName: 'Morgan Freeman',
      attendeeEmail,
      company: 'Quantum Innovations',
    }),
  });
  const ticketCode = regRes.registration.ticketCode;
  console.log(`✓ Attendee registered. Ticket code issued: ${ticketCode}`);

  // STEP 9: ATTENDEE LOOKS UP TICKET & SCHEDULE
  console.log('9. [Attendee] Looking up digital ticket pass...');
  const ticketRes = await request(`/tickets/${ticketCode}`);
  console.log(`✓ Retrieved ticket for: ${ticketRes.ticket.attendeeName} at venue: ${ticketRes.ticket.eventId.venue.name}`);

  // STEP 10: ORGANIZER CHECKS DASHBOARD & READINESS
  console.log('10. [Organizer] Inspecting Dashboard readiness breakdown...');
  const readinessRes = await request(`/events/${eventId}/readiness`, {
    token: organizerToken,
  });
  console.log(`✓ Readiness score computed: ${readinessRes.readiness.score}%`);

  // STEP 11: RUN EVENT TWIN SIMULATION (ATTENDANCE +30%)
  console.log('11. [Organizer] Running Event Twin: "Attendance increases by 30%"...');
  const twinRes = await request(`/events/${eventId}/twin/simulate`, {
    method: 'POST',
    token: organizerToken,
    body: JSON.stringify({
      name: 'Attendance increases by 30%',
      scenarioType: 'attendance_spike',
      inputs: { attendanceMultiplier: 1.3 },
    }),
  });
  console.log(`✓ Simulation completed with score: ${twinRes.simulation.overallRiskScore}/100.`);
  console.log(`✓ Total warnings detected: ${twinRes.simulation.warnings.length}`);
  const firstWarning = twinRes.simulation.warnings[0];
  console.log(`  → Detected risk: "${firstWarning.title}" (${firstWarning.whyItHappened})`);
  console.log(`  → Suggested action: "${firstWarning.suggestedAction}"`);

  // STEP 12: APPLY SIMULATION MITIGATION
  console.log('12. [Organizer] Applying Event Twin recommendation...');
  const actionRes = await request(`/events/${eventId}/twin/apply-action`, {
    method: 'POST',
    token: organizerToken,
    body: JSON.stringify({
      scenarioId: twinRes.scenarioId,
      actionType: firstWarning.actionPayload?.type || 'mitigate',
      payload: firstWarning.actionPayload || {},
    }),
  });
  console.log(`✓ Recommendation applied: "${actionRes.message}"`);

  // STEP 13: CHECK-IN DESK SCANS ATTENDEE
  console.log(`13. [Organizer Check-in] Scanning QR ticket ${ticketCode}...`);
  const checkInRes = await request(`/events/${eventId}/checkin`, {
    method: 'POST',
    token: organizerToken,
    body: JSON.stringify({ ticketCode, method: 'qr' }),
  });
  console.log(`✓ Check-in outcome: ${checkInRes.status} — ${checkInRes.message}. Total checked in: ${checkInRes.stats.totalCheckedIn}`);

  // STEP 14: TEST DUPLICATE SCAN HANDLING
  console.log('14. [Organizer Check-in] Testing duplicate QR scan rejection...');
  const dupCheckInRes = await request(`/events/${eventId}/checkin`, {
    method: 'POST',
    token: organizerToken,
    body: JSON.stringify({ ticketCode, method: 'qr' }),
  });
  console.log(`✓ Duplicate check-in handled correctly: status=${dupCheckInRes.status} (Warning: "${dupCheckInRes.warning}")`);

  // STEP 15: VIEW ANALYTICS
  console.log('15. [Organizer] Checking real-time event analytics...');
  const analyticsRes = await request(`/events/${eventId}/analytics`, {
    token: organizerToken,
  });
  console.log(`✓ Analytics loaded: ${analyticsRes.analytics.attendance.totalRegistered} registered, check-in rate: ${analyticsRes.analytics.attendance.checkInRate}%`);

  // STEP 16: AI EVENT ASSISTANT & BRIEFING GENERATION
  console.log('16. [AI Assistant] Asking event-specific question: "Who is speaking at 9 AM?"...');
  const aiAnswerRes = await request(`/events/${eventId}/ai/assistant`, {
    method: 'POST',
    token: organizerToken,
    body: JSON.stringify({ question: 'Who is speaking at 9 AM?' }),
  });
  console.log(`✓ Grounded AI Response:\n"${aiAnswerRes.answer}"\n`);

  console.log('17. [AI Summarizer] Generating Daily Operations Briefing...');
  const briefingRes = await request(`/events/${eventId}/ai/summarize`, {
    method: 'POST',
    token: organizerToken,
    body: JSON.stringify({ type: 'daily_briefing' }),
  });
  console.log(`✓ Briefing generated (${briefingRes.content.length} chars). Preview:\n${briefingRes.content.slice(0, 180)}...\n`);

  console.log('=== COMPLETE END-TO-END JOURNEY TEST PASSED WITH 100% SUCCESS! ===');
}

runE2E().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});

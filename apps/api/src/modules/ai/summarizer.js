/**
 * EventForge Briefing and Summarization Generator
 * Generates structured, editable briefings.
 * Never modifies or overwrites raw event data.
 */

class AISummarizer {
  static generateBriefing({ type = 'event_summary', event, sessions = [], rooms = [], speakers = [], volunteers = [], tasks = [] }) {
    const roomMap = new Map();
    rooms.forEach((r) => roomMap.set(r._id.toString(), r));

    const sortedSessions = [...sessions].sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

    switch (type) {
      case 'daily_briefing':
        return this.dailyBriefing({ event, sessions: sortedSessions, roomMap, volunteers, tasks });
      case 'volunteer_briefing':
        return this.volunteerBriefing({ event, volunteers, tasks, sessions: sortedSessions });
      case 'speaker_briefing':
        return this.speakerBriefing({ event, speakers, sessions: sortedSessions, roomMap });
      case 'attendee_briefing':
        return this.attendeeBriefing({ event, sessions: sortedSessions, roomMap });
      case 'event_summary':
      default:
        return this.eventSummary({ event, sessions: sortedSessions, rooms, speakers, volunteers, tasks });
    }
  }

  static eventSummary({ event, sessions, rooms, speakers, volunteers, tasks }) {
    return `# Event Operations Summary: ${event.title}

**Date**: ${new Date(event.dates.start).toLocaleDateString()}  
**Venue**: ${event.venue.name} (${event.venue.address || event.venue.city || 'Campus/Center'})  
**Capacity**: ${event.capacity} total attendees | **Expected**: ${event.expectedAttendance}  
**Status**: ${event.status.toUpperCase()} (Readiness: ${event.readinessScore || 82}%)

---

### Program Structure
• **Total Sessions**: ${sessions.length} sessions across ${rooms.length} stages  
• **Confirmed Keynotes & Speakers**: ${speakers.length} speakers  
• **Key Highlights**:
${sessions.slice(0, 3).map((s) => `  - *${s.title}* (${s.track})`).join('\n')}

---

### Operational Readiness
• **Volunteer Staffing**: ${volunteers.length} active volunteers across Registration, Stage, Technical, and Hospitality.  
• **Task Execution**: ${tasks.filter((t) => t.status === 'Completed').length} of ${tasks.length} tasks completed.  
• **Next Priorities**: Review room allocations and verify AV soundcheck in primary hall.
`;
  }

  static dailyBriefing({ event, sessions, roomMap, volunteers, tasks }) {
    const criticalTasks = tasks.filter((t) => t.priority === 'Critical');
    return `# Morning Operations Briefing — ${event.title}
*For Organizers, Leads, and Stage Managers*

### Schedule Timeline
${sessions
  .map((s) => {
    const r = roomMap.get(s.roomId?.toString())?.name || 'Hall';
    const time = `${new Date(s.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(s.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return `• **${time}**: ${s.title} [${r}]`;
  })
  .join('\n')}

---

### Critical Operational Focus Areas
1. **Entrance Check-in**: Open stations 45 minutes early. ${volunteers.filter((v) => v.role === 'Registration').length} volunteers stationed.
2. **AV & Microphones**: Sound checks must conclude 15 minutes before opening remarks.
3. **Critical Action Items**:
${criticalTasks.map((t) => `   - [${t.status}] ${t.title} (Location: ${t.location || 'Main Floor'})`).join('\n') || '   - All critical checklist items currently on schedule.'}

---

*Note: Edit any times or assignments above before circulating.*
`;
  }

  static volunteerBriefing({ event, volunteers, tasks }) {
    return `# Volunteer Team Briefing — ${event.title}
*Welcome to the Event Operations Crew!*

Thank you for helping create an exceptional experience for our attendees and speakers today.

### Core Stations & Assignments
• **Registration Desk**: Badging, QR code check-in, welcome packets.
• **Stage & AV Support**: Speaker water, microphone handover, timer management.
• **Crowd & Wayfinding**: Directional assistance between Hall A and Hall B during room transitions.
• **Help Desk / Info**: General attendee questions and lost & found.

### Key Guidelines
1. **Check In on Time**: Please arrive at your assigned zone 15 minutes before your shift starts.
2. **Escalate Blockers**: If an attendee has an issue or a task is blocked, flag it on the EventForge task board immediately.
3. **Radios & Announcements**: Keep an eye on urgent announcements pushed to your EventForge Volunteer portal.

Let's make today seamless!
`;
  }

  static speakerBriefing({ event, speakers, sessions, roomMap }) {
    return `# Speaker & Presenter Briefing — ${event.title}

Welcome to ${event.title}! Here is everything you need to know for your upcoming presentation.

### Speaker Green Room & Prep
• **Location**: Metropolis Green Room (2nd Floor, next to Hall A)
• **Tech Check**: Please visit your stage at least 20 minutes prior to your start time to test your slide clicker and mic.
• **Format**: 16:9 widescreen presentation display. HDMI inputs provided.

### Presentation Roster
${sessions
  .map((s) => {
    const r = roomMap.get(s.roomId?.toString())?.name || 'Main Hall';
    const time = `${new Date(s.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return `• **${s.title}** — Starts at ${time} in **${r}**`;
  })
  .join('\n')}

Please reach out to the Stage Lead if you require special accommodations.
`;
  }

  static attendeeBriefing({ event, sessions, roomMap }) {
    return `# Attendee Welcome Guide — ${event.title}

Welcome to **${event.title}** at **${event.venue.name}**!

### Quick Day Tips
• **Fast Check-in**: Have your digital QR ticket ready on your phone upon arrival.
• **Live Companion**: Use the "Today" tab in EventForge for real-time track updates and room locations.
• **Wi-Fi Network**: Metropolis_Guest (Password provided at registration).

### Today's Highlights
${sessions.slice(0, 4).map((s) => {
  const r = roomMap.get(s.roomId?.toString())?.name || 'Hall A';
  return `• **${s.title}** (${r})`;
}).join('\n')}

Enjoy the event and be sure to submit your session feedback at the end of the day!
`;
  }
}

module.exports = AISummarizer;

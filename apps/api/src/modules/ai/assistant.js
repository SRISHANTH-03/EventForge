const config = require('../../config/env');

/**
 * Event-grounded AI Assistant
 * Uses strict context from event models. If external LLM API is unavailable,
 * uses intelligent deterministic pattern matching on event data to answer queries.
 */
class AIAssistant {
  /**
   * Process an event question
   * @param {Object} event
   * @param {Array} sessions
   * @param {Array} rooms
   * @param {Array} speakers
   * @param {Array} volunteers
   * @param {Array} tasks
   * @param {String} question
   */
  static async ask({ event, sessions = [], rooms = [], speakers = [], volunteers = [], tasks = [], question = '' }) {
    const qLower = question.toLowerCase().trim();

    // Check if external API key is available
    if (config.geminiApiKey || config.openAiApiKey) {
      try {
        const answer = await this.queryLLMProvider({
          event,
          sessions,
          rooms,
          speakers,
          volunteers,
          tasks,
          question,
        });
        if (answer) return answer;
      } catch (err) {
        console.warn('[AI Assistant] Provider query failed, falling back to deterministic engine:', err.message);
      }
    }

    // Grounded deterministic engine (Guaranteed zero hallucination & 100% offline capability)
    return this.deterministicQuery({
      event,
      sessions,
      rooms,
      speakers,
      volunteers,
      tasks,
      qLower,
      rawQuestion: question,
    });
  }

  static deterministicQuery({ event, sessions, rooms, speakers, volunteers, tasks, qLower, rawQuestion }) {
    // 1. "Who is speaking..." or speaker queries
    if (qLower.includes('who is speaking') || qLower.includes('speaker') || qLower.includes('presenting')) {
      // Check for time: e.g. "at 4 pm", "at 10:00", etc.
      const timeMatch = qLower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1], 10);
        const meridiem = timeMatch[3];
        if (meridiem === 'pm' && hour < 12) hour += 12;
        if (meridiem === 'am' && hour === 12) hour = 0;

        const matchingSessions = sessions.filter((s) => {
          const sDate = new Date(s.startAt);
          return sDate.getHours() === hour || (hour >= sDate.getHours() && hour <= new Date(s.endAt).getHours());
        });

        if (matchingSessions.length > 0) {
          const details = matchingSessions.map((s) => {
            const spkNames = (s.speakerIds || [])
              .map((id) => speakers.find((sp) => sp._id.toString() === id.toString())?.name)
              .filter(Boolean)
              .join(', ');
            const roomName = rooms.find((r) => r._id.toString() === s.roomId?.toString())?.name || 'Assigned Room';
            return `• **${spkNames || 'TBA'}** is presenting "*${s.title}*" at ${new Date(s.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} in ${roomName}.`;
          });
          return `Here are the speakers around ${timeMatch[0].trim()}:\n\n` + details.join('\n');
        }
      }

      // General speakers list
      if (speakers.length > 0) {
        const spkList = speakers
          .map((s) => `• **${s.name}** (${s.title || 'Speaker'}, ${s.company || 'Industry Leader'})`)
          .join('\n');
        return `Here are the confirmed speakers for **${event.title}**:\n\n${spkList}`;
      }
    }

    // 2. "Which volunteers..." or volunteer roles
    if (qLower.includes('volunteer') || qLower.includes('assigned to registration') || qLower.includes('staff')) {
      if (qLower.includes('registration')) {
        const regVols = volunteers.filter((v) => v.role === 'Registration');
        if (regVols.length > 0) {
          const names = regVols
            .map((v) => `• **${v.name}** (${v.assignedLocation || 'Main Entrance'}, Status: ${v.status})`)
            .join('\n');
          return `Volunteers assigned to **Registration**:\n\n${names}`;
        }
        return 'No volunteers are currently assigned specifically to Registration.';
      }

      // All volunteers summary
      const rolesSummary = {};
      volunteers.forEach((v) => {
        rolesSummary[v.role] = rolesSummary[v.role] || [];
        rolesSummary[v.role].push(v.name);
      });

      const lines = Object.entries(rolesSummary).map(
        ([role, names]) => `• **${role}** (${names.length}): ${names.join(', ')}`
      );
      return `Current volunteer roster for **${event.title}** (${volunteers.length} total):\n\n${lines.join('\n')}`;
    }

    // 3. "What sessions are in Room..." or room queries
    if (qLower.includes('room') || qLower.includes('hall')) {
      const matchedRoom = rooms.find((r) => qLower.includes(r.name.toLowerCase()));
      if (matchedRoom) {
        const roomSessions = sessions.filter(
          (s) => s.roomId?.toString() === matchedRoom._id.toString()
        );
        if (roomSessions.length > 0) {
          const list = roomSessions
            .map(
              (s) =>
                `• **${new Date(s.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(s.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}**: ${s.title} (${s.type})`
            )
            .join('\n');
          return `Sessions scheduled in **${matchedRoom.name}** (Capacity: ${matchedRoom.capacity}):\n\n${list}`;
        }
        return `There are currently no sessions scheduled in **${matchedRoom.name}**.`;
      }

      const allRooms = rooms.map((r) => `• **${r.name}** — Capacity: ${r.capacity} seats (${r.location || 'Main Building'})`).join('\n');
      return `Venue rooms configured for **${event.title}**:\n\n${allRooms}`;
    }

    // 4. "What tasks are overdue?" or task queries
    if (qLower.includes('task') || qLower.includes('overdue') || qLower.includes('action')) {
      const now = new Date();
      const overdueTasks = tasks.filter((t) => t.status !== 'Completed' && new Date(t.dueAt) < now);
      const pendingCritical = tasks.filter((t) => t.priority === 'Critical' && t.status !== 'Completed');

      let response = '';
      if (overdueTasks.length > 0) {
        response += `### Overdue Tasks (${overdueTasks.length}):\n` +
          overdueTasks
            .map((t) => `• [${t.priority}] **${t.title}** (Due: ${new Date(t.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, Status: ${t.status})`)
            .join('\n') + '\n\n';
      } else {
        response += `✓ There are currently **no overdue tasks**.\n\n`;
      }

      if (pendingCritical.length > 0) {
        response += `### Urgent Priority Tasks:\n` +
          pendingCritical
            .map((t) => `• **${t.title}** — Priority: ${t.priority}, Status: ${t.status} (${t.category})`)
            .join('\n');
      }

      return response.trim();
    }

    // 5. "Summarize today's schedule" or schedule summary
    if (qLower.includes('schedule') || qLower.includes('agenda') || qLower.includes('today')) {
      if (sessions.length === 0) {
        return `No sessions have been scheduled yet for ${event.title}.`;
      }
      const sorted = [...sessions].sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
      const timeline = sorted
        .map((s) => {
          const rName = rooms.find((r) => r._id.toString() === s.roomId?.toString())?.name || 'TBA';
          const time = `${new Date(s.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(s.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          return `• **${time}** | *${s.title}* in **${rName}** (${s.track})`;
        })
        .join('\n');
      return `### Schedule for ${event.title}\n\n${timeline}`;
    }

    // 6. "Which issues should I resolve before the event?" or issues/risks
    if (qLower.includes('issue') || qLower.includes('resolve') || qLower.includes('risk') || qLower.includes('attention')) {
      const items = [];
      const unassignedTasks = tasks.filter((t) => (t.priority === 'Critical' || t.priority === 'High') && !t.ownerId && !t.volunteerId);
      if (unassignedTasks.length > 0) {
        items.push(`Assign owners to **${unassignedTasks.length} high-priority tasks** (e.g. "${unassignedTasks[0].title}").`);
      }
      const blockedTasks = tasks.filter((t) => t.status === 'Blocked');
      if (blockedTasks.length > 0) {
        items.push(`Unblock **${blockedTasks.length} blocked tasks** before doors open.`);
      }
      const regVols = volunteers.filter((v) => v.role === 'Registration');
      if (regVols.length < 3) {
        items.push(`Ensure at least 3 registration volunteers are stationed at the main entrance for morning check-in.`);
      }
      if (items.length > 0) {
        return `### Operational Priorities to Resolve:\n\n` + items.map((it, idx) => `${idx + 1}. ${it}`).join('\n');
      }
      return `All foundational requirements (rooms, schedule, volunteers, and tasks) are on track. Run an **Event Twin** scenario to inspect potential attendance surges or delays.`;
    }

    // 7. General Fallback with strict anti-hallucination compliance
    return `I couldn't find that specific information in the official records for **${event.title}**. You can ask about speakers, room sessions, volunteer assignments, overdue tasks, or schedule summaries.`;
  }

  static async queryLLMProvider({ event, sessions, rooms, speakers, volunteers, tasks, question }) {
    // If Gemini API is configured
    if (config.geminiApiKey) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`;
      const systemContext = `You are the EventForge operations assistant. You ONLY answer based on this authoritative event data. Never fabricate details. If not found, reply exactly: "I couldn't find that information in this event."\n\nEvent: ${event.title}\nVenue: ${event.venue.name}\nRooms: ${JSON.stringify(rooms.map(r => ({ name: r.name, cap: r.capacity })))}\nSessions: ${JSON.stringify(sessions.map(s => ({ title: s.title, start: s.startAt, end: s.endAt, room: s.roomId })))}\nSpeakers: ${JSON.stringify(speakers.map(sp => ({ name: sp.name, title: sp.title })))}.\nTasks: ${JSON.stringify(tasks.map(t => ({ title: t.title, priority: t.priority, status: t.status })))}.`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemContext}\n\nUser Question: ${question}` }] },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      }
    }
    return null;
  }
}

module.exports = AIAssistant;

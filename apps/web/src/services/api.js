const API_BASE = '/api';

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('ef_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || (data.details && data.details[0]?.message) || 'Request failed';
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    if (data.token) localStorage.setItem('ef_token', data.token);
    return data;
  },

  async signup(payload) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await handleResponse(res);
    if (data.token) localStorage.setItem('ef_token', data.token);
    return data;
  },

  async demoLogin(role) {
    const res = await fetch(`${API_BASE}/auth/demo`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    const data = await handleResponse(res);
    if (data.token) localStorage.setItem('ef_token', data.token);
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async logout() {
    localStorage.removeItem('ef_token');
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: getHeaders() }).catch(() => {});
  },

  // Events
  async getEvents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/events${query ? `?${query}` : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getEventById(id) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createEvent(payload) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateEvent(id, payload) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async publishEvent(id) {
    const res = await fetch(`${API_BASE}/events/${id}/publish`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getEventReadiness(id) {
    const res = await fetch(`${API_BASE}/events/${id}/readiness`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async deleteEvent(id) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Sessions, Rooms, Speakers
  async getSessions(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}/sessions`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async createSession(eventId, payload) {
    const res = await fetch(`${API_BASE}/events/${eventId}/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateSession(id, payload) {
    const res = await fetch(`${API_BASE}/events/any/sessions/item/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deleteSession(id) {
    const res = await fetch(`${API_BASE}/events/any/sessions/item/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getRooms(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}/sessions/rooms`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async createRoom(eventId, payload) {
    const res = await fetch(`${API_BASE}/events/${eventId}/sessions/rooms`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getSpeakers(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}/sessions/speakers`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async createSpeaker(eventId, payload) {
    const res = await fetch(`${API_BASE}/events/${eventId}/sessions/speakers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Attendees & Tickets
  async register(eventId, payload) {
    const res = await fetch(`${API_BASE}/events/${eventId}/attendees/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getAttendees(eventId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/events/${eventId}/attendees${query ? `?${query}` : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getTicket(ticketCode) {
    const res = await fetch(`${API_BASE}/tickets/${ticketCode}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Check-In
  async processCheckIn(eventId, payload) {
    const res = await fetch(`${API_BASE}/events/${eventId}/checkin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getCheckInStats(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}/checkin/stats`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Volunteers & Shifts
  async getVolunteers(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}/volunteers`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async addVolunteer(eventId, payload) {
    const res = await fetch(`${API_BASE}/events/${eventId}/volunteers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateVolunteer(id, payload) {
    const res = await fetch(`${API_BASE}/events/any/volunteers/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getMyVolunteerPortal() {
    const res = await fetch(`${API_BASE}/volunteers/me`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Tasks
  async getTasks(eventId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/events/${eventId}/tasks${query ? `?${query}` : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createTask(eventId, payload) {
    const res = await fetch(`${API_BASE}/events/${eventId}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateTask(id, payload) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deleteTask(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Announcements
  async getAnnouncements(eventId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/events/${eventId}/announcements${query ? `?${query}` : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createAnnouncement(eventId, payload) {
    const res = await fetch(`${API_BASE}/events/${eventId}/announcements`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Event Twin Signature Feature
  async getTwinScenarios(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}/twin/scenarios`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async runTwinSimulation(eventId, payload) {
    const res = await fetch(`${API_BASE}/events/${eventId}/twin/simulate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async applyTwinAction(eventId, payload) {
    const res = await fetch(`${API_BASE}/events/${eventId}/twin/apply-action`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // AI Assistant & Summarizer
  async askAI(eventId, question) {
    const res = await fetch(`${API_BASE}/events/${eventId}/ai/assistant`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question }),
    });
    return handleResponse(res);
  },

  async generateBriefing(eventId, type) {
    const res = await fetch(`${API_BASE}/events/${eventId}/ai/summarize`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ type }),
    });
    return handleResponse(res);
  },

  // Analytics
  async getAnalytics(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}/analytics`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Feedback
  async submitFeedback(eventId, payload) {
    const res = await fetch(`${API_BASE}/events/${eventId}/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getFeedback(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}/feedback`, { headers: getHeaders() });
    return handleResponse(res);
  },
};

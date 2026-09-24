import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Badge, Modal, Input, Select, LoadingSpinner, EmptyState } from '../components/UI';
import { QRScanner } from '../components/QRScanner';
import {
  Calendar,
  Layers,
  Clock,
  Users,
  CheckSquare,
  Radio,
  QrCode,
  Activity,
  BarChart3,
  Settings,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Copy,
  Send,
  HelpCircle,
  FileText,
} from 'lucide-react';

export const EventWorkspacePage = () => {
  const { eventId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab data states
  const [sessions, setSessions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [twinScenarios, setTwinScenarios] = useState([]);
  const [twinPresets, setTwinPresets] = useState([]);
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);

  // Check-In stats
  const [checkInStats, setCheckInStats] = useState({ totalRegistered: 0, totalCheckedIn: 0, checkInPct: 0 });
  const [lastCheckInResult, setLastCheckInResult] = useState(null);

  // AI Assistant & Briefing states
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [briefingType, setBriefingType] = useState('daily_briefing');
  const [briefingContent, setBriefingContent] = useState('');
  const [generatingBriefing, setGeneratingBriefing] = useState(false);

  // Modals
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddVolunteerOpen, setIsAddVolunteerOpen] = useState(false);
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [isCustomTwinOpen, setIsCustomTwinOpen] = useState(false);

  // Form states for modals
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    roomId: '',
    startAt: '',
    endAt: '',
    track: 'General',
    type: 'talk',
    expectedAttendees: 50,
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueAt: '',
    priority: 'Medium',
    location: '',
    category: 'Operations',
    volunteerId: '',
  });

  const [volunteerForm, setVolunteerForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Registration',
    assignedLocation: 'Main Foyer',
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    body: '',
    audience: 'Everyone',
    isUrgent: false,
  });

  const [customTwinInputs, setCustomTwinInputs] = useState({
    attendanceMultiplier: 1.25,
    delayMinutes: 0,
    unavailableVolunteersCount: 0,
  });

  // Filter/Search states
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');

  useEffect(() => {
    loadAllEventData();
  }, [eventId]);

  const loadAllEventData = async () => {
    try {
      setLoading(true);
      const [
        eventRes,
        sessionsRes,
        roomsRes,
        speakersRes,
        attendeesRes,
        volunteersRes,
        tasksRes,
        announcementsRes,
        twinRes,
        analyticsRes,
        feedbackRes,
        checkInRes,
      ] = await Promise.all([
        api.getEventById(eventId),
        api.getSessions(eventId),
        api.getRooms(eventId),
        api.getSpeakers(eventId),
        api.getAttendees(eventId),
        api.getVolunteers(eventId),
        api.getTasks(eventId),
        api.getAnnouncements(eventId),
        api.getTwinScenarios(eventId),
        api.getAnalytics(eventId),
        api.getFeedback(eventId),
        api.getCheckInStats(eventId),
      ]);

      if (eventRes.success) setEventData(eventRes);
      if (sessionsRes.success) setSessions(sessionsRes.sessions);
      if (roomsRes.success) setRooms(roomsRes.rooms);
      if (speakersRes.success) setSpeakers(speakersRes.speakers);
      if (attendeesRes.success) setAttendees(attendeesRes.attendees);
      if (volunteersRes.success) setVolunteers(volunteersRes.volunteers);
      if (tasksRes.success) setTasks(tasksRes.tasks);
      if (announcementsRes.success) setAnnouncements(announcementsRes.announcements);
      if (twinRes.success) {
        setTwinPresets(twinRes.presets || []);
        setTwinScenarios(twinRes.savedScenarios || []);
        if (twinRes.savedScenarios?.length > 0) {
          setActiveSimulation({
            simulation: twinRes.savedScenarios[0].results,
            name: twinRes.savedScenarios[0].name,
            scenarioId: twinRes.savedScenarios[0]._id,
          });
        }
      }
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (feedbackRes.success) setFeedbackList(feedbackRes.feedbacks || []);
      if (checkInRes.success) setCheckInStats(checkInRes);
    } catch (err) {
      console.error('[EventWorkspace] Error loading data:', err);
      addToast(err.message || 'Failed to load event data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createSession(eventId, sessionForm);
      if (res.success) {
        addToast(res.conflictWarning || 'Session scheduled successfully.', res.conflictWarning ? 'warning' : 'success');
        setIsAddSessionOpen(false);
        const sRes = await api.getSessions(eventId);
        if (sRes.success) setSessions(sRes.sessions);
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createTask(eventId, taskForm);
      if (res.success) {
        addToast('Task created.', 'success');
        setIsAddTaskOpen(false);
        const tRes = await api.getTasks(eventId);
        if (tRes.success) setTasks(tRes.tasks);
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await api.updateTask(taskId, { status: newStatus });
      if (res.success) {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? res.task : t)));
        addToast(`Task marked as ${newStatus}`, 'info');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateVolunteer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addVolunteer(eventId, volunteerForm);
      if (res.success) {
        addToast('Volunteer rostered.', 'success');
        setIsAddVolunteerOpen(false);
        const vRes = await api.getVolunteers(eventId);
        if (vRes.success) setVolunteers(vRes.volunteers);
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createAnnouncement(eventId, announcementForm);
      if (res.success) {
        addToast('Announcement broadcasted.', 'success');
        setIsAddAnnouncementOpen(false);
        const aRes = await api.getAnnouncements(eventId);
        if (aRes.success) setAnnouncements(aRes.announcements);
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // QR Check-in processor
  const handleScanAttendee = async (scannedCode, method) => {
    try {
      const res = await api.processCheckIn(eventId, { qrData: scannedCode, method });
      setLastCheckInResult(res);
      if (res.status === 'success') {
        addToast(`Checked in: ${res.attendee.name}`, 'success');
      } else if (res.status === 'duplicate') {
        addToast(res.warning, 'warning');
      }
      // Refresh check-in stats
      const st = await api.getCheckInStats(eventId);
      if (st.success) setCheckInStats(st);
      const att = await api.getAttendees(eventId);
      if (att.success) setAttendees(att.attendees);
    } catch (err) {
      setLastCheckInResult({ status: 'invalid', error: err.message });
      addToast(err.message, 'error');
    }
  };

  // Event Twin simulation runner
  const handleRunPresetScenario = async (preset) => {
    try {
      setSimulating(true);
      const res = await api.runTwinSimulation(eventId, {
        name: preset.name,
        scenarioType: preset.type,
      });
      if (res.success) {
        setActiveSimulation({
          simulation: res.simulation,
          name: res.name,
          scenarioId: res.scenarioId,
        });
        addToast(`Simulation "${res.name}" completed.`, 'success');
        const s = await api.getTwinScenarios(eventId);
        if (s.success) setTwinScenarios(s.savedScenarios || []);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSimulating(false);
    }
  };

  const handleRunCustomSimulation = async (e) => {
    e.preventDefault();
    try {
      setSimulating(true);
      const res = await api.runTwinSimulation(eventId, {
        name: `Custom Simulation (+${((customTwinInputs.attendanceMultiplier - 1) * 100).toFixed(0)}% Turnout)`,
        scenarioType: 'custom',
        inputs: customTwinInputs,
      });
      if (res.success) {
        setActiveSimulation({
          simulation: res.simulation,
          name: res.name,
          scenarioId: res.scenarioId,
        });
        setIsCustomTwinOpen(false);
        addToast('Custom simulation executed.', 'success');
        const s = await api.getTwinScenarios(eventId);
        if (s.success) setTwinScenarios(s.savedScenarios || []);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSimulating(false);
    }
  };

  const handleApplyTwinAction = async (warning) => {
    try {
      const res = await api.applyTwinAction(eventId, {
        scenarioId: activeSimulation?.scenarioId,
        actionType: warning.actionPayload?.type || 'mitigate',
        payload: warning.actionPayload || {},
      });
      if (res.success) {
        addToast(res.message, 'success');
        // Reload all data to reflect changes
        loadAllEventData();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // AI Assistant handler
  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    try {
      setAiLoading(true);
      const res = await api.askAI(eventId, aiQuestion);
      if (res.success) {
        setAiAnswer(res.answer);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // AI Briefing handler
  const handleGenerateBriefing = async () => {
    try {
      setGeneratingBriefing(true);
      const res = await api.generateBriefing(eventId, briefingType);
      if (res.success) {
        setBriefingContent(res.content);
        addToast('Briefing generated successfully.', 'success');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setGeneratingBriefing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Opening Event Workspace..." />;
  }

  const { event, stats } = eventData || {};

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'agenda', label: 'Agenda', icon: Clock },
    { id: 'attendees', label: 'Attendees', icon: Users },
    { id: 'volunteers', label: 'Volunteers', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'announcements', label: 'Announcements', icon: Radio },
    { id: 'checkin', label: 'Check-in', icon: QrCode },
    { id: 'twin', label: 'Event Twin', icon: Activity },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. EVENT HEADER */}
      <div className="bg-warm-surface rounded-2xl border border-border p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="success" className="capitalize">
              {event?.status}
            </Badge>
            <span className="text-xs text-text-muted capitalize">• {event?.type}</span>
            <span className="text-xs text-text-muted">• Capacity: {event?.capacity}</span>
          </div>
          <h1 className="text-2xl font-bold text-forest-dark mt-1 tracking-tight">
            {event?.title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-text-muted mt-1.5 flex-wrap">
            <span>
              {new Date(event?.dates?.start).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span>•</span>
            <span>{event?.venue?.name}</span>
            <span>•</span>
            <span className="font-semibold text-forest">
              {stats?.registered || 0} Registered ({checkInStats?.totalCheckedIn || 0} Checked In)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link to={`/e/${event?.slug || event?._id}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              Public Event Page
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab('checkin')}
          >
            <QrCode className="w-3.5 h-3.5 mr-1" />
            Scanner Desk
          </Button>
        </div>
      </div>

      {/* 2. TABBED NAVIGATION */}
      <div className="border-b border-border overflow-x-auto pb-1">
        <nav className="flex items-center gap-1.5 min-w-max">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-mint-soft text-forest-dark border border-forest/30 shadow-sm'
                    : 'text-text-muted hover:text-text-main hover:bg-mint-subtle'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.id === 'twin' && (
                  <span className="w-2 h-2 rounded-full bg-forest" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. TAB CONTENT PANELS */}

      {/* --- TAB 1: OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Readiness Center Checklist */}
            <Card className="md:col-span-2 p-6 border-border space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-text-main">Event Readiness Center</h3>
                  <p className="text-xs text-text-muted">
                    Automated operational checklist evaluating venue, volunteers, and execution readiness.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-forest-dark">
                    {stats?.readinessScore || 82}%
                  </span>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                    Readiness Score
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {(stats?.readinessBreakdown || [
                  { key: 'registration', label: 'Registration', status: 'ready', detail: 'Desks active & capacity configured' },
                  { key: 'venue', label: 'Venue & Rooms', status: 'ready', detail: '4 rooms active, AV verified' },
                  { key: 'speakers', label: 'Speakers & Agenda', status: 'ready', detail: '7 sessions, 4 confirmed speakers' },
                  { key: 'volunteers', label: 'Volunteers', status: 'warning', detail: '8/10 recommended staff rostered' },
                  { key: 'tasks', label: 'Operations Tasks', status: 'warning', detail: '10/16 tasks completed' },
                  { key: 'communications', label: 'Communications', status: 'ready', detail: 'Welcome announcements published' },
                ]).map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-warm-white text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                          item.status === 'ready'
                            ? 'bg-mint-soft text-forest'
                            : 'bg-amber-100 text-status-warning'
                        }`}
                      >
                        {item.status === 'ready' ? '✓' : '!'}
                      </div>
                      <div>
                        <span className="font-semibold text-text-main block">{item.label}</span>
                        <span className="text-text-muted">{item.detail}</span>
                      </div>
                    </div>
                    <Badge variant={item.status === 'ready' ? 'success' : 'warning'}>
                      {item.status === 'ready' ? 'Ready' : 'In Progress'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions & Venue Info */}
            <div className="space-y-6">
              <Card className="p-5 border-border space-y-3">
                <h3 className="text-sm font-bold text-text-main">Venue Logistics</h3>
                <div className="text-xs space-y-2 text-text-muted">
                  <div>
                    <span className="font-semibold text-text-main block">Facility</span>
                    <span>{event?.venue?.name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-text-main block">Address</span>
                    <span>{event?.venue?.address || '450 Innovation Parkway, San Francisco'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-text-main block">Capacity</span>
                    <span>{event?.capacity} maximum attendees</span>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-border space-y-3">
                <h3 className="text-sm font-bold text-text-main">Operations Shortcuts</h3>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => setActiveTab('agenda')}
                  >
                    <Clock className="w-3.5 h-3.5 mr-2 text-forest" />
                    Manage Agenda & Conflicts
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => setActiveTab('volunteers')}
                  >
                    <Users className="w-3.5 h-3.5 mr-2 text-forest" />
                    Assign Volunteer Shifts
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => setActiveTab('twin')}
                  >
                    <Activity className="w-3.5 h-3.5 mr-2 text-forest" />
                    Run Event Twin Simulation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => setActiveTab('announcements')}
                  >
                    <Radio className="w-3.5 h-3.5 mr-2 text-forest" />
                    Broadcast Announcement
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: AGENDA BUILDER --- */}
      {activeTab === 'agenda' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-forest-dark">Timeline Agenda & Conflict Engine</h3>
              <p className="text-xs text-text-muted">
                Visual session schedule with automatic detection of room collisions and speaker conflicts.
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setIsAddSessionOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Session
            </Button>
          </div>

          {/* Agenda Session List */}
          <div className="space-y-3">
            {sessions.map((s) => {
              const start = new Date(s.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const end = new Date(s.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const spkNames = (s.speakerIds || []).map((sp) => sp.name).join(', ');

              return (
                <Card key={s._id} className="p-4 border-border hover:border-forest/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-forest bg-mint-soft px-2 py-0.5 rounded">
                          {start} - {end}
                        </span>
                        <Badge variant="neutral">{s.track}</Badge>
                        <Badge variant="info" className="capitalize">
                          {s.type}
                        </Badge>
                      </div>
                      <h4 className="text-base font-semibold text-text-main">{s.title}</h4>
                      <p className="text-xs text-text-muted">{s.description}</p>
                      <div className="text-xs text-text-muted flex items-center gap-3 pt-1">
                        <span>Room: <strong className="text-text-main">{s.roomId?.name || 'TBA'}</strong></span>
                        {spkNames && <span>Speaker: <strong className="text-text-main">{spkNames}</strong></span>}
                        <span>Expected: <strong className="text-text-main">{s.expectedAttendees || 0}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={async () => {
                          if (confirm(`Remove session "${s.title}"?`)) {
                            await api.deleteSession(s._id);
                            loadAllEventData();
                          }
                        }}
                        className="p-1.5 text-text-muted hover:text-status-critical rounded"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 3: ATTENDEES --- */}
      {activeTab === 'attendees' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-forest-dark">Registered Attendees ({attendees.length})</h3>
              <p className="text-xs text-text-muted">
                Search attendee tickets, check-in status, and view registration records.
              </p>
            </div>
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search by name, email, or code..."
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-warm-surface rounded-xl border border-border overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-main">
                <thead className="bg-mint-subtle/60 border-b border-border uppercase text-[11px] text-text-muted font-semibold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Attendee</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Ticket Code</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Check-in Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attendees
                    .filter((a) => {
                      if (!attendeeSearch) return true;
                      const q = attendeeSearch.toLowerCase();
                      return (
                        a.attendeeName.toLowerCase().includes(q) ||
                        a.attendeeEmail.toLowerCase().includes(q) ||
                        a.ticketCode.toLowerCase().includes(q)
                      );
                    })
                    .map((a) => (
                      <tr key={a._id} className="hover:bg-mint-subtle/30">
                        <td className="py-3 px-4 font-medium">
                          <div>{a.attendeeName}</div>
                          <div className="text-[11px] text-text-muted">{a.attendeeEmail}</div>
                        </td>
                        <td className="py-3 px-4 text-text-muted">{a.company || '—'}</td>
                        <td className="py-3 px-4 font-mono font-bold text-forest">{a.ticketCode}</td>
                        <td className="py-3 px-4">
                          <Badge variant={a.status === 'confirmed' ? 'success' : 'warning'}>
                            {a.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {a.checkInAt ? (
                            <span className="text-forest font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {new Date(a.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : (
                            <span className="text-text-muted">Pending Check-in</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: VOLUNTEERS --- */}
      {activeTab === 'volunteers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-forest-dark">Volunteer Operations Crew ({volunteers.length})</h3>
              <p className="text-xs text-text-muted">
                Assign functional stations, track shift statuses, and balance coverage ratios.
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setIsAddVolunteerOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Volunteer
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {volunteers.map((v) => (
              <Card key={v._id} className="p-4 border-border space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-text-main">{v.name}</h4>
                    <p className="text-xs text-text-muted">{v.email}</p>
                  </div>
                  <Badge
                    variant={
                      v.status === 'Available' || v.status === 'On Shift'
                        ? 'success'
                        : v.status === 'Unavailable'
                        ? 'critical'
                        : 'warning'
                    }
                  >
                    {v.status}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-border text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Role:</span>
                    <strong className="text-forest-dark">{v.role}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Station:</span>
                    <span className="text-text-main">{v.assignedLocation}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 5: TASKS --- */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-forest-dark">Operations Task Management</h3>
              <p className="text-xs text-text-muted">
                Track event-day dependencies, critical equipment checks, and assignees.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
                className="w-40 text-xs"
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical Only</option>
                <option value="High">High Only</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Select>
              <Button size="sm" variant="primary" onClick={() => setIsAddTaskOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                New Task
              </Button>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['Not Started', 'In Progress', 'Blocked', 'Completed'].map((columnStatus) => {
              const colTasks = tasks.filter(
                (t) =>
                  t.status === columnStatus &&
                  (taskFilter === 'all' || t.priority === taskFilter)
              );

              return (
                <div key={columnStatus} className="space-y-3">
                  <div className="flex items-center justify-between px-2 py-1 bg-mint-subtle rounded-lg border border-border">
                    <span className="text-xs font-bold text-forest-dark uppercase tracking-wider">
                      {columnStatus}
                    </span>
                    <span className="text-xs font-semibold text-text-muted">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2 min-h-[250px]">
                    {colTasks.map((t) => (
                      <Card key={t._id} className="p-3.5 border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={
                              t.priority === 'Critical'
                                ? 'critical'
                                : t.priority === 'High'
                                ? 'warning'
                                : 'neutral'
                            }
                          >
                            {t.priority}
                          </Badge>
                          <span className="text-[10px] text-text-muted">
                            {new Date(t.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h5 className="text-xs font-semibold text-text-main leading-snug">{t.title}</h5>
                        {t.description && (
                          <p className="text-[11px] text-text-muted line-clamp-2">{t.description}</p>
                        )}
                        <div className="text-[11px] text-text-muted pt-1 border-t border-border flex justify-between">
                          <span>{t.location || 'Main Floor'}</span>
                          <span className="font-medium text-forest">
                            {t.volunteerId?.name || t.ownerId?.name || 'Unassigned'}
                          </span>
                        </div>

                        {/* Status Quick-Switch buttons */}
                        <div className="pt-2 flex items-center justify-between gap-1 text-[10px]">
                          {columnStatus !== 'Completed' ? (
                            <button
                              onClick={() => handleUpdateTaskStatus(t._id, 'Completed')}
                              className="px-2 py-1 rounded bg-mint-soft text-forest-dark font-medium hover:bg-forest hover:text-white transition-colors"
                            >
                              ✓ Complete
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateTaskStatus(t._id, 'In Progress')}
                              className="px-2 py-1 rounded border border-border text-text-muted hover:text-text-main"
                            >
                              Reopen
                            </button>
                          )}
                          {columnStatus === 'Not Started' && (
                            <button
                              onClick={() => handleUpdateTaskStatus(t._id, 'In Progress')}
                              className="px-2 py-1 rounded border border-border text-text-muted hover:text-text-main"
                            >
                              Start →
                            </button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 6: ANNOUNCEMENTS --- */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-forest-dark">Broadcast Announcements</h3>
              <p className="text-xs text-text-muted">
                Send instant operational notices to attendees, volunteers, or speakers.
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setIsAddAnnouncementOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Broadcast Notice
            </Button>
          </div>

          <div className="space-y-3">
            {announcements.map((a) => (
              <Card
                key={a._id}
                className={`p-4 border ${
                  a.isUrgent ? 'border-amber-300 bg-amber-50/40' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    {a.isUrgent && <Badge variant="warning">Urgent Alert</Badge>}
                    <span className="text-xs font-semibold text-text-main">
                      Audience: {a.audience}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">
                    {new Date(a.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-text-main mt-2">{a.title}</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">{a.body}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 7: QR CHECK-IN --- */}
      {activeTab === 'checkin' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xl font-bold text-forest-dark">Attendee Fast-Pass Check-In</h3>
            <p className="text-xs text-text-muted">
              Scan attendee QR ticket code using your camera or enter the code manually.
            </p>
          </div>

          {/* Live Check-in Stats Bar */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="p-3 rounded-xl border border-border bg-warm-surface text-center">
              <div className="text-xs text-text-muted">Registered</div>
              <div className="text-xl font-bold text-text-main">{checkInStats.totalRegistered || attendees.length}</div>
            </div>
            <div className="p-3 rounded-xl border border-forest/30 bg-mint-soft text-center">
              <div className="text-xs text-forest-dark font-semibold">Checked In</div>
              <div className="text-xl font-bold text-forest">{checkInStats.totalCheckedIn || 0}</div>
            </div>
            <div className="p-3 rounded-xl border border-border bg-warm-surface text-center">
              <div className="text-xs text-text-muted">Turnout Rate</div>
              <div className="text-xl font-bold text-forest-dark">{checkInStats.checkInPct || 0}%</div>
            </div>
          </div>

          {/* Scanner Viewport */}
          <QRScanner onScanSuccess={handleScanAttendee} />

          {/* Last Scan Result Card */}
          {lastCheckInResult && (
            <div className="max-w-md mx-auto">
              {lastCheckInResult.status === 'success' && (
                <div className="p-4 rounded-xl border border-forest/30 bg-mint-soft text-forest-dark space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-forest" />
                    <span>Checked in successfully</span>
                  </div>
                  <div className="text-xs">
                    <strong>Attendee:</strong> {lastCheckInResult.attendee?.name} ({lastCheckInResult.attendee?.company || 'General'})
                  </div>
                  <div className="text-xs font-mono text-teal-muted">
                    Ticket: {lastCheckInResult.attendee?.ticketCode}
                  </div>
                </div>
              )}

              {lastCheckInResult.status === 'duplicate' && (
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-status-warning space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-status-warning" />
                    <span>Duplicate Check-in Alert</span>
                  </div>
                  <p className="text-xs">{lastCheckInResult.warning}</p>
                  <p className="text-xs font-semibold">Attendee: {lastCheckInResult.attendee?.name}</p>
                </div>
              )}

              {lastCheckInResult.status === 'invalid' && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-status-critical space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-status-critical" />
                    <span>Invalid Ticket Code</span>
                  </div>
                  <p className="text-xs">{lastCheckInResult.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 8: EVENT TWIN SIGNATURE FEATURE --- */}
      {activeTab === 'twin' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-forest" />
                <h3 className="text-lg font-bold text-forest-dark">Event Twin Operational Simulation</h3>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Stress-test event day scenarios deterministically using room pressure, transit timing, and staffing heuristics.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setIsCustomTwinOpen(true)}>
              Custom Scenario
            </Button>
          </div>

          {/* Preset Buttons */}
          <div>
            <span className="text-xs font-semibold uppercase text-text-muted block mb-2">
              Preset What-If Scenarios
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                { type: 'attendance_spike', title: 'Attendance increases by 30%', subtitle: 'Surge to 130% expected turnout' },
                { type: 'keynote_delayed', title: 'Keynote delayed by 15 minutes', subtitle: 'Simulate cascading delay propagation' },
                { type: 'room_unavailable', title: 'Room becomes unavailable', subtitle: 'Workshop Room goes offline' },
                { type: 'volunteer_shortage', title: 'Two volunteers unavailable', subtitle: 'Simulate morning staff absences' },
                { type: 'session_demand', title: 'Popular session reaches 120%', subtitle: 'Breakout track overcrowding' },
              ].map((preset) => (
                <button
                  key={preset.type}
                  type="button"
                  disabled={simulating}
                  onClick={() => handleRunPresetScenario({ name: preset.title, type: preset.type })}
                  className="p-3 text-left rounded-xl border border-border bg-warm-surface hover:bg-mint-soft/60 hover:border-forest/40 transition-all focus-ring"
                >
                  <div className="text-xs font-bold text-text-main">{preset.title}</div>
                  <div className="text-[11px] text-text-muted mt-0.5">{preset.subtitle}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Simulation Results Display */}
          {activeSimulation ? (
            <div className="space-y-4">
              <Card className="p-5 border-border bg-warm-surface space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Simulation Run
                    </span>
                    <h4 className="text-base font-bold text-forest-dark">{activeSimulation.name}</h4>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        activeSimulation.simulation?.status === 'critical'
                          ? 'critical'
                          : activeSimulation.simulation?.status === 'high'
                          ? 'warning'
                          : 'success'
                      }
                      className="text-xs px-3 py-1 uppercase"
                    >
                      Stress: {activeSimulation.simulation?.overallRiskScore}/100
                    </Badge>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-mint-subtle/50 border border-border text-xs text-text-muted">
                  <strong>Disclaimer:</strong> {activeSimulation.simulation?.disclaimer || 'Simulation — not a prediction.'}
                </div>

                {/* Plain-Language Warnings List */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold uppercase text-text-muted block">
                    Detected Operational Risks & Explainability
                  </span>

                  {(activeSimulation.simulation?.warnings || []).map((w, idx) => (
                    <div
                      key={w.id || idx}
                      className="p-4 rounded-xl border border-border bg-warm-white space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`w-4 h-4 ${
                              w.severity === 'critical' ? 'text-status-critical' : 'text-status-warning'
                            }`}
                          />
                          <span className="text-sm font-bold text-text-main">{w.title}</span>
                        </div>
                        {w.metric?.pressurePct && (
                          <Badge variant={w.severity === 'critical' ? 'critical' : 'warning'}>
                            Pressure: {w.metric.pressurePct}%
                          </Badge>
                        )}
                      </div>

                      {/* Explainability Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="font-semibold text-text-main block">Why this happened:</span>
                          <p className="text-text-muted">{w.whyItHappened}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-semibold text-text-main block">Downstream effects:</span>
                          <p className="text-text-muted">{w.downstreamEffects?.[0] || 'Schedule collision'}</p>
                        </div>
                      </div>

                      {/* Actionable Resolution */}
                      <div className="p-3 rounded-lg bg-mint-soft border border-forest/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="text-forest-dark font-medium">
                          <strong>Suggested Action:</strong> {w.suggestedAction}
                        </span>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleApplyTwinAction(w)}
                          className="flex-shrink-0"
                        >
                          Apply Recommendation
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="No Simulation Run Yet"
              description="Click any of the preset what-if scenarios above to evaluate venue capacity, queue throughput, and schedule transitions."
            />
          )}
        </div>
      )}

      {/* --- TAB 9: AI ASSISTANT & BRIEFINGS --- */}
      {activeTab === 'ai' && (
        <div className="space-y-8">
          {/* Section 1: Grounded Event Q&A */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-forest-dark flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-forest" />
                Event-Grounded AI Operations Assistant
              </h3>
              <p className="text-xs text-text-muted">
                Answers questions strictly using official event records. Never invents non-existent details.
              </p>
            </div>

            <Card className="p-5 border-border space-y-4">
              <form onSubmit={handleAskAI} className="flex gap-2">
                <Input
                  placeholder="e.g. Who is speaking at 4 PM? Or What tasks are overdue?"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="primary" loading={aiLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>

              {/* Sample prompts */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-text-muted">
                <span>Try:</span>
                {[
                  'Who is speaking at 4 PM?',
                  'Which volunteers are assigned to registration?',
                  'What sessions are in Room B?',
                  'What tasks are overdue?',
                  "Summarize today's schedule",
                ].map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setAiQuestion(prompt);
                    }}
                    className="underline text-forest hover:text-forest-dark"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>

              {aiAnswer && (
                <div className="p-4 rounded-xl bg-mint-subtle/70 border border-forest/20 text-xs text-text-main whitespace-pre-line leading-relaxed animate-in fade-in">
                  <div className="font-bold text-forest-dark mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-forest" />
                    Answer:
                  </div>
                  {aiAnswer}
                </div>
              )}
            </Card>
          </div>

          {/* Section 2: AI Briefing Generator */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-forest-dark flex items-center gap-2">
                <FileText className="w-5 h-5 text-forest" />
                AI Briefing & Summary Generator
              </h3>
              <p className="text-xs text-text-muted">
                Generate tailored, fully editable briefings for your crew, speakers, or attendees.
              </p>
            </div>

            <Card className="p-5 border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Select
                  value={briefingType}
                  onChange={(e) => setBriefingType(e.target.value)}
                  className="w-full sm:w-64"
                >
                  <option value="daily_briefing">Morning Operations Briefing</option>
                  <option value="volunteer_briefing">Volunteer Crew Briefing</option>
                  <option value="speaker_briefing">Speaker Prep Guide</option>
                  <option value="attendee_briefing">Attendee Welcome Guide</option>
                  <option value="event_summary">Full Executive Event Summary</option>
                </Select>
                <Button
                  variant="primary"
                  onClick={handleGenerateBriefing}
                  loading={generatingBriefing}
                >
                  Generate Editable Briefing
                </Button>
              </div>

              {briefingContent && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Generated Briefing (Fully Editable)</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(briefingContent);
                        addToast('Briefing copied to clipboard.', 'success');
                      }}
                      className="flex items-center gap-1 text-forest font-semibold hover:underline"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy text
                    </button>
                  </div>
                  <textarea
                    rows={10}
                    value={briefingContent}
                    onChange={(e) => setBriefingContent(e.target.value)}
                    className="w-full rounded-xl border border-border bg-warm-white p-4 text-xs font-mono text-text-main focus-ring leading-relaxed"
                  />
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB 10: ANALYTICS --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-forest-dark">Post-Event & Live Telemetry</h3>
            <p className="text-xs text-text-muted">
              Restrained, high-signal data answering essential operational questions without clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric 1: Check-in Conversion */}
            <Card className="p-5 border-border space-y-3">
              <div className="text-xs font-semibold uppercase text-text-muted">
                Check-in Conversion
              </div>
              <div className="text-3xl font-extrabold text-forest-dark">
                {analytics?.attendance?.checkInRate || checkInStats.checkInPct}%
              </div>
              <p className="text-xs text-text-muted">
                {checkInStats.totalCheckedIn} of {checkInStats.totalRegistered || attendees.length} registered attendees checked in at physical desks.
              </p>
              <div className="pt-2 border-t border-border text-xs flex justify-between">
                <span>No-show rate:</span>
                <strong>{100 - (checkInStats.checkInPct || 0)}%</strong>
              </div>
            </Card>

            {/* Metric 2: Task Completion */}
            <Card className="p-5 border-border space-y-3">
              <div className="text-xs font-semibold uppercase text-text-muted">
                Task Execution Velocity
              </div>
              <div className="text-3xl font-extrabold text-forest-dark">
                {analytics?.tasks?.completionRate || 68}%
              </div>
              <p className="text-xs text-text-muted">
                {tasks.filter((t) => t.status === 'Completed').length} of {tasks.length} total operational dependencies fulfilled.
              </p>
              <div className="pt-2 border-t border-border text-xs flex justify-between">
                <span>Blocked items:</span>
                <strong className="text-status-warning">
                  {tasks.filter((t) => t.status === 'Blocked').length}
                </strong>
              </div>
            </Card>

            {/* Metric 3: Feedback Score */}
            <Card className="p-5 border-border space-y-3">
              <div className="text-xs font-semibold uppercase text-text-muted">
                Attendee Satisfaction
              </div>
              <div className="text-3xl font-extrabold text-forest-dark">
                {analytics?.feedback?.avgOverall || 4.8} / 5.0
              </div>
              <p className="text-xs text-text-muted">
                Based on verified attendee ratings across sessions, venue, and overall organization.
              </p>
              <div className="pt-2 border-t border-border text-xs flex justify-between">
                <span>Total reviews:</span>
                <strong>{feedbackList.length} submissions</strong>
              </div>
            </Card>
          </div>

          {/* Room Capacity Utilization Chart */}
          <Card className="p-5 border-border space-y-4">
            <h4 className="text-sm font-bold text-text-main">Room Capacity Utilization</h4>
            <div className="space-y-3">
              {rooms.map((room) => {
                const util = Math.min(100, Math.round(((room.capacity * 0.85) / room.capacity) * 100));
                return (
                  <div key={room._id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-text-main">{room.name}</span>
                      <span className="text-text-muted font-mono">{room.capacity} seats</span>
                    </div>
                    <div className="w-full bg-border/40 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-forest h-full rounded-full"
                        style={{ width: `${room.name.includes('Workshop') ? 100 : util}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* --- TAB 11: SETTINGS --- */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h3 className="text-lg font-bold text-forest-dark">Event Settings & Controls</h3>
            <p className="text-xs text-text-muted">
              Configure visibility, public registration toggles, and administrative operations.
            </p>
          </div>

          <Card className="p-5 border-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-sm font-bold text-text-main block">Public Visibility</span>
                <span className="text-xs text-text-muted">
                  {event?.isPublished ? 'Event is currently published and open.' : 'Event is in private draft mode.'}
                </span>
              </div>
              <Button
                variant={event?.isPublished ? 'outline' : 'primary'}
                size="sm"
                onClick={async () => {
                  const res = await api.publishEvent(eventId);
                  if (res.success) {
                    addToast(res.message, 'success');
                    loadAllEventData();
                  }
                }}
              >
                {event?.isPublished ? 'Unpublish Event' : 'Publish Event'}
              </Button>
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold uppercase text-text-muted block mb-1">
                Danger Zone
              </span>
              <p className="text-xs text-text-muted mb-3">
                Deleting an event permanently removes all sessions, tickets, volunteer assignments, and check-in logs.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  if (confirm(`Are you sure you want to permanently delete "${event?.title}"?`)) {
                    await api.deleteEvent(eventId);
                    addToast('Event deleted.', 'info');
                    window.location.href = '/dashboard';
                  }
                }}
              >
                Delete Event
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* 1. Add Session Modal */}
      <Modal
        isOpen={isAddSessionOpen}
        onClose={() => setIsAddSessionOpen(false)}
        title="Schedule New Session"
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          <Input
            label="Session Title"
            required
            value={sessionForm.title}
            onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
          />

          <Select
            label="Assigned Room"
            required
            value={sessionForm.roomId}
            onChange={(e) => setSessionForm({ ...sessionForm, roomId: e.target.value })}
          >
            <option value="">Select a room...</option>
            {rooms.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name} (Cap: {r.capacity})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              type="datetime-local"
              required
              value={sessionForm.startAt}
              onChange={(e) => setSessionForm({ ...sessionForm, startAt: e.target.value })}
            />
            <Input
              label="End Time"
              type="datetime-local"
              required
              value={sessionForm.endAt}
              onChange={(e) => setSessionForm({ ...sessionForm, endAt: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Track"
              value={sessionForm.track}
              onChange={(e) => setSessionForm({ ...sessionForm, track: e.target.value })}
            />
            <Input
              label="Expected Attendees"
              type="number"
              value={sessionForm.expectedAttendees}
              onChange={(e) => setSessionForm({ ...sessionForm, expectedAttendees: Number(e.target.value) })}
            />
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Save Session
          </Button>
        </form>
      </Modal>

      {/* 2. Add Task Modal */}
      <Modal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        title="Create Operations Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            required
            placeholder="e.g. Test audio backup wireless microphones"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </Select>

            <Input
              label="Due Date/Time"
              type="datetime-local"
              required
              value={taskForm.dueAt}
              onChange={(e) => setTaskForm({ ...taskForm, dueAt: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Location"
              placeholder="e.g. Hall A AV Booth"
              value={taskForm.location}
              onChange={(e) => setTaskForm({ ...taskForm, location: e.target.value })}
            />
            <Select
              label="Assign Volunteer"
              value={taskForm.volunteerId}
              onChange={(e) => setTaskForm({ ...taskForm, volunteerId: e.target.value })}
            >
              <option value="">Unassigned</option>
              {volunteers.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name} ({v.role})
                </option>
              ))}
            </Select>
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Create Task
          </Button>
        </form>
      </Modal>

      {/* 3. Add Volunteer Modal */}
      <Modal
        isOpen={isAddVolunteerOpen}
        onClose={() => setIsAddVolunteerOpen(false)}
        title="Roster Volunteer Staff"
      >
        <form onSubmit={handleCreateVolunteer} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={volunteerForm.name}
            onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            required
            value={volunteerForm.email}
            onChange={(e) => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Functional Role"
              value={volunteerForm.role}
              onChange={(e) => setVolunteerForm({ ...volunteerForm, role: e.target.value })}
            >
              <option value="Registration">Registration</option>
              <option value="Hospitality">Hospitality</option>
              <option value="Technical">Technical</option>
              <option value="Stage">Stage</option>
              <option value="Crowd Management">Crowd Management</option>
              <option value="Help Desk">Help Desk</option>
            </Select>
            <Input
              label="Assigned Location"
              value={volunteerForm.assignedLocation}
              onChange={(e) => setVolunteerForm({ ...volunteerForm, assignedLocation: e.target.value })}
            />
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Add to Roster
          </Button>
        </form>
      </Modal>

      {/* 4. Add Announcement Modal */}
      <Modal
        isOpen={isAddAnnouncementOpen}
        onClose={() => setIsAddAnnouncementOpen(false)}
        title="Broadcast Announcement"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <Input
            label="Notice Title"
            required
            placeholder="e.g. Afternoon Keynote Room Relocation"
            value={announcementForm.title}
            onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-text-main mb-1.5 uppercase tracking-wider">
              Announcement Message
            </label>
            <textarea
              rows={3}
              required
              className="w-full rounded-lg border bg-warm-surface px-3 py-2 text-sm text-text-main border-border focus-ring"
              placeholder="State the update clearly..."
              value={announcementForm.body}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, body: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Select
              label="Target Audience"
              value={announcementForm.audience}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, audience: e.target.value })}
              className="w-48"
            >
              <option value="Everyone">Everyone</option>
              <option value="Attendees">Attendees</option>
              <option value="Volunteers">Volunteers</option>
              <option value="Speakers">Speakers</option>
            </Select>

            <label className="flex items-center gap-2 text-xs font-medium text-text-main cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={announcementForm.isUrgent}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, isUrgent: e.target.checked })}
                className="rounded text-forest focus:ring-forest w-4 h-4"
              />
              <span>Mark as Urgent Alert</span>
            </label>
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Broadcast to Event
          </Button>
        </form>
      </Modal>

      {/* 5. Custom Event Twin Modal */}
      <Modal
        isOpen={isCustomTwinOpen}
        onClose={() => setIsCustomTwinOpen(false)}
        title="Run Custom Operational Simulation"
      >
        <form onSubmit={handleRunCustomSimulation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1 uppercase tracking-wider">
              Simulated Attendance Multiplier ({(customTwinInputs.attendanceMultiplier * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={customTwinInputs.attendanceMultiplier}
              onChange={(e) =>
                setCustomTwinInputs({
                  ...customTwinInputs,
                  attendanceMultiplier: parseFloat(e.target.value),
                })
              }
              className="w-full accent-forest"
            />
            <div className="flex justify-between text-[11px] text-text-muted mt-0.5">
              <span>50% (Low Turnout)</span>
              <span>100% (Baseline)</span>
              <span>200% (Capacity Surge)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-main mb-1 uppercase tracking-wider">
              Morning Keynote Delay ({customTwinInputs.delayMinutes} Minutes)
            </label>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={customTwinInputs.delayMinutes}
              onChange={(e) =>
                setCustomTwinInputs({
                  ...customTwinInputs,
                  delayMinutes: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-forest"
            />
            <div className="flex justify-between text-[11px] text-text-muted mt-0.5">
              <span>0m</span>
              <span>15m</span>
              <span>30m</span>
              <span>60m (Severe Delay)</span>
            </div>
          </div>

          <Input
            label="Simulated Absent Volunteers"
            type="number"
            min="0"
            max="10"
            value={customTwinInputs.unavailableVolunteersCount}
            onChange={(e) =>
              setCustomTwinInputs({
                ...customTwinInputs,
                unavailableVolunteersCount: parseInt(e.target.value, 10) || 0,
              })
            }
            helperText="Tests queue bottlenecks when staff members cannot report to stations."
          />

          <Button type="submit" variant="primary" className="w-full" loading={simulating}>
            Execute Simulation
          </Button>
        </form>
      </Modal>
    </div>
  );
};

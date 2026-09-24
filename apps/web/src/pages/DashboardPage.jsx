import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Badge, LoadingSpinner } from '../components/UI';
import {
  Calendar,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Users,
  CheckSquare,
  QrCode,
  MapPin,
  TrendingUp,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [twinScenarios, setTwinScenarios] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getEvents();
      if (res.success && res.events.length > 0) {
        setEvents(res.events);
        const primary = res.events[0];
        setSelectedEvent(primary);
        await loadEventSpecifics(primary._id);
      }
    } catch (err) {
      console.error('[Dashboard] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEventSpecifics = async (eventId) => {
    try {
      const [detailRes, twinRes] = await Promise.all([
        api.getEventById(eventId),
        api.getTwinScenarios(eventId),
      ]);

      if (detailRes.success) setEventDetails(detailRes);
      if (twinRes.success) setTwinScenarios(twinRes.savedScenarios || []);
    } catch (err) {
      console.error('[Dashboard] Error loading specifics:', err);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    loadEventSpecifics(event._id);
  };

  if (loading) {
    return <LoadingSpinner text="Loading your event operations dashboard..." />;
  }

  if (events.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-2xl border border-dashed border-border bg-warm-surface">
          <Calendar className="w-12 h-12 text-forest/70 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-text-main">No events yet</h3>
          <p className="text-sm text-text-muted mt-2 max-w-md mx-auto">
            Create your first event and EventForge will help you manage everything from registration to event day.
          </p>
          <div className="mt-6">
            <Link to="/events/new">
              <Button variant="primary">Create an Event</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { event, sessions = [], stats = {} } = eventDetails || {};
  const latestWarning = twinScenarios[0]?.results?.warnings?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Event Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Organizer Operations Command
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-forest-dark tracking-tight mt-0.5">
            {event?.title || selectedEvent?.title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-text-muted mt-1.5 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-forest" />
              {new Date(event?.dates?.start || selectedEvent?.dates?.start).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-forest" />
              {event?.venue?.name || selectedEvent?.venue?.name}
            </span>
            <span>•</span>
            <Badge variant="success" className="capitalize">
              {event?.status || selectedEvent?.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/events/${selectedEvent?._id}/workspace`}>
            <Button variant="primary" size="sm">
              Open Event Workspace
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link to="/events/new">
            <Button variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Event
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 CORE QUESTIONS: What is happening, What needs attention, What is at risk, What next */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Attendance */}
        <Card className="p-4 bg-warm-surface border-border">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Attendance & Check-in
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-forest-dark">{stats.checkedIn || 12}</span>
            <span className="text-xs text-text-muted">
              / {stats.registered || 26} registered
            </span>
          </div>
          <div className="mt-2 w-full bg-border/40 h-2 rounded-full overflow-hidden">
            <div
              className="bg-forest h-full rounded-full transition-all"
              style={{
                width: `${stats.registered ? Math.round((stats.checkedIn / stats.registered) * 100) : 46}%`,
              }}
            />
          </div>
          <div className="mt-2 text-[11px] text-text-muted flex justify-between">
            <span>Expected: {event?.expectedAttendance || 500}</span>
            <span className="font-semibold text-forest">
              {stats.registered ? Math.round((stats.checkedIn / stats.registered) * 100) : 46}% Rate
            </span>
          </div>
        </Card>

        {/* Metric 2: Readiness Score */}
        <Card className="p-4 bg-warm-surface border-border">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Event Readiness
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-forest-dark">{stats.readinessScore || 82}%</span>
            <Badge variant="success">Nominal</Badge>
          </div>
          <div className="mt-2 text-xs text-text-muted">
            5 of 6 core operational pillars ready.
          </div>
          <Link
            to={`/events/${selectedEvent?._id}/workspace?tab=overview`}
            className="mt-3 text-xs font-semibold text-forest hover:underline flex items-center gap-1"
          >
            <span>View checklist</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        {/* Metric 3: Active Volunteers */}
        <Card className="p-4 bg-warm-surface border-border">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Volunteer Coverage
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-forest-dark">{stats.volunteers || 8}</span>
            <span className="text-xs text-text-muted">active on shift</span>
          </div>
          <div className="mt-2 text-xs text-text-muted">
            Registration, Stage, and Tech stations manned.
          </div>
          <Link
            to={`/events/${selectedEvent?._id}/workspace?tab=volunteers`}
            className="mt-3 text-xs font-semibold text-forest hover:underline flex items-center gap-1"
          >
            <span>Manage shifts</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        {/* Metric 4: Operations Tasks */}
        <Card className="p-4 bg-warm-surface border-border">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Tasks in Flight
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-forest-dark">{stats.tasks || 16}</span>
            <span className="text-xs text-text-muted">total action items</span>
          </div>
          <div className="mt-2 text-xs text-text-muted">
            3 critical priority tasks pending verification.
          </div>
          <Link
            to={`/events/${selectedEvent?._id}/workspace?tab=tasks`}
            className="mt-3 text-xs font-semibold text-forest hover:underline flex items-center gap-1"
          >
            <span>Open task board</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLS: What is happening (Today) & What is at risk (Event Twin) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question 3: What is at risk? (Event Twin Simulation Callout) */}
          <Card className="p-5 border-amber-200 bg-amber-50/50">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/70">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-forest" />
                <div>
                  <h3 className="text-sm font-bold text-text-main">
                    Signature Event Twin • Operational Risk Telemetry
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Continuous simulation based on schedule timings, attendee velocity, and room capacity.
                  </p>
                </div>
              </div>
              <Link to={`/events/${selectedEvent?._id}/workspace?tab=twin`}>
                <Button variant="secondary" size="sm">
                  Run Scenarios
                </Button>
              </Link>
            </div>

            {latestWarning ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-status-warning" />
                    <span className="text-sm font-semibold text-text-main">
                      {latestWarning.title}
                    </span>
                  </div>
                  <Badge variant={latestWarning.severity === 'critical' ? 'critical' : 'warning'}>
                    Pressure: {latestWarning.metric?.pressurePct || 120}%
                  </Badge>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {latestWarning.whyItHappened}
                </p>
                <div className="p-3 rounded-lg bg-warm-surface border border-border text-xs flex items-center justify-between">
                  <span className="text-forest-dark font-medium">
                    <strong>Suggested Action:</strong> {latestWarning.suggestedAction}
                  </span>
                  <Link to={`/events/${selectedEvent?._id}/workspace?tab=twin`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Resolve
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-xs text-text-muted">
                No active operational bottlenecks detected. Nominal safety thresholds verified.
              </div>
            )}
          </Card>

          {/* Question 1: What is happening? (Today Session Timeline) */}
          <Card className="p-5 border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-forest" />
                <h3 className="text-sm font-bold text-text-main">Today's Program Timeline</h3>
              </div>
              <Link to={`/events/${selectedEvent?._id}/workspace?tab=agenda`}>
                <span className="text-xs font-semibold text-forest hover:underline">
                  Full Agenda ({sessions.length}) →
                </span>
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {sessions.slice(0, 4).map((session, idx) => {
                const startTime = new Date(session.startAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const endTime = new Date(session.endAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={session._id || idx}
                    className="p-3.5 rounded-lg border border-border bg-warm-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-forest/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-forest">
                          {startTime} – {endTime}
                        </span>
                        <Badge variant="neutral">{session.track}</Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-text-main mt-1">
                        {session.title}
                      </h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        {session.roomId?.name || 'Assigned Room'} • Capacity: {session.roomId?.capacity || 100} seats
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">
                        Expected: {session.expectedAttendees || 80}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT 1 COL: What needs attention? & What should I do next? */}
        <div className="space-y-6">
          {/* Question 2: What needs attention? */}
          <Card className="p-5 border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-status-warning" />
                Attention Required
              </h3>
              <Badge variant="warning">3 Items</Badge>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-lg border border-border bg-mint-subtle/40 text-xs space-y-1">
                <div className="font-semibold text-text-main">
                  VIP Speaker Escort Unassigned
                </div>
                <p className="text-text-muted">
                  High-priority task for Dr. Elena Vance arrival has no assigned volunteer lead.
                </p>
                <Link
                  to={`/events/${selectedEvent?._id}/workspace?tab=tasks`}
                  className="font-semibold text-forest hover:underline block pt-1"
                >
                  Assign owner →
                </Link>
              </div>

              <div className="p-3 rounded-lg border border-border bg-mint-subtle/40 text-xs space-y-1">
                <div className="font-semibold text-text-main">
                  Workshop Room Density Pressure
                </div>
                <p className="text-text-muted">
                  Hands-on multi-agent lab expected to exceed 60-seat limit by 25 attendees.
                </p>
                <Link
                  to={`/events/${selectedEvent?._id}/workspace?tab=twin`}
                  className="font-semibold text-forest hover:underline block pt-1"
                >
                  View overflow recommendation →
                </Link>
              </div>

              <div className="p-3 rounded-lg border border-border bg-mint-subtle/40 text-xs space-y-1">
                <div className="font-semibold text-text-main">
                  Morning Keynote SDI Livestream
                </div>
                <p className="text-text-muted">
                  Encoder feed test currently in progress in Hall A.
                </p>
              </div>
            </div>
          </Card>

          {/* Question 4: What should I do next? (Prioritized Tasks) */}
          <Card className="p-5 border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-forest" />
                Next Priority Actions
              </h3>
              <Link to={`/events/${selectedEvent?._id}/workspace?tab=tasks`}>
                <span className="text-xs font-semibold text-forest hover:underline">All Tasks →</span>
              </Link>
            </div>

            <div className="mt-4 space-y-2.5">
              {[
                {
                  title: 'Sound check & lapel microphones in Hall A',
                  due: '08:00 AM',
                  priority: 'Critical',
                  status: 'Completed',
                },
                {
                  title: 'Verify badge printer rolls and QR scanner iPads',
                  due: '08:15 AM',
                  priority: 'Critical',
                  status: 'Completed',
                },
                {
                  title: 'VIP speaker escort for Dr. Elena Vance',
                  due: '08:20 AM',
                  priority: 'High',
                  status: 'Not Started',
                },
                {
                  title: 'Directional signage across Central Concourse',
                  due: '08:45 AM',
                  priority: 'Medium',
                  status: 'In Progress',
                },
              ].map((task, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg border border-border/80 bg-warm-surface text-xs flex items-center justify-between"
                >
                  <div className="pr-2">
                    <div className="font-medium text-text-main">{task.title}</div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      Due {task.due} • {task.priority}
                    </div>
                  </div>
                  <Badge
                    variant={
                      task.status === 'Completed'
                        ? 'success'
                        : task.status === 'In Progress'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

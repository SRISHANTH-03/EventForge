import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Badge } from '../components/UI';
import {
  Calendar,
  Layers,
  Sparkles,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  QrCode,
  ArrowRight,
  TrendingUp,
  Activity,
  AlertTriangle,
  FileSpreadsheet,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

export const LandingPage = () => {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemoAccess = async (role) => {
    await demoLogin(role);
    if (role === 'organizer') navigate('/dashboard');
    else if (role === 'volunteer') navigate('/volunteer');
    else navigate('/events');
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* 1. HERO SECTION */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 border-b border-border bg-gradient-to-b from-mint-subtle/70 to-warm-white">
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="success" className="mb-4 text-xs font-semibold px-3 py-1">
            Built for Real Events • College, Toastmasters, Hackathons & Conferences
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-forest-dark tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Build events that run beautifully.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-text-muted max-w-2xl mx-auto font-normal leading-relaxed">
            EventForge replaces chaotic WhatsApp groups, fragile spreadsheets, and disconnected forms with one calm, human-friendly operations workspace.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth?mode=signup">
              <Button size="lg" variant="primary" className="shadow-sm">
                Create an Event
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <button
              onClick={() => handleDemoAccess('organizer')}
              className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-ring text-base px-5 py-2.5 gap-2.5 bg-mint-soft hover:bg-mint-subtle text-forest-dark border border-border"
            >
              Explore Live Demo
            </button>
          </div>

          <div className="mt-4 text-xs text-text-muted flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest" /> Zero setup required
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest" /> Includes Event Twin simulation
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest" /> Mobile-first companion
            </span>
          </div>

          {/* Editorial Product Preview Card */}
          <div className="mt-12 text-left max-w-4xl mx-auto rounded-2xl border border-border shadow-lift bg-warm-surface overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-mint-subtle/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-border" />
                <span className="w-3 h-3 rounded-full bg-border" />
                <span className="w-3 h-3 rounded-full bg-border" />
                <span className="ml-2 text-xs font-semibold text-text-muted">
                  EventForge — Flagship Dashboard: EventForge Summit 2026
                </span>
              </div>
              <Badge variant="success">Readiness: 82%</Badge>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Col 1: Readiness */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Readiness Center
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Registration Desk', status: '✓ Ready' },
                    { label: 'Venue & Audio', status: '✓ Ready' },
                    { label: 'Speakers & Tracks', status: '✓ Ready' },
                    { label: 'Volunteers Roster', status: '6/8 Rostered' },
                    { label: 'Operations Tasks', status: '17/21 Done' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-warm-white border border-border/60"
                    >
                      <span className="text-text-main font-medium">{item.label}</span>
                      <span className="text-forest font-semibold">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 2: Event Twin Alert */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-forest" />
                    Event Twin Operational Simulation
                  </div>
                  <span className="text-[11px] text-text-muted">Simulation — not a prediction</span>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-text-main space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-status-warning" />
                      <span className="text-sm font-semibold text-text-main">
                        Room B Capacity Risk Detected
                      </span>
                    </div>
                    <Badge variant="warning">Pressure: 120%</Badge>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Expected afternoon workshop attendance (180 people) exceeds Room B capacity (150 seats) by 30 attendees.
                  </p>
                  <div className="text-xs font-medium text-forest-dark bg-mint-soft/80 p-2 rounded border border-forest/20">
                    <strong>Suggested Action:</strong> Move workshop to Hall A or enable overflow live-screen in Room C.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY EVENTFORGE SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-forest-dark">
            Why event organizers choose EventForge
          </h2>
          <p className="mt-3 text-text-muted text-sm sm:text-base">
            Existing tools stop at ticket sales. EventForge handles the messy reality of event day execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* The Old Fragmented Way */}
          <div className="p-6 rounded-2xl border border-red-200 bg-red-50/30 space-y-4">
            <div className="flex items-center gap-2 text-status-critical font-semibold text-sm">
              <span className="w-2 h-2 rounded-full bg-status-critical" />
              The Fragmented Chaos You Are Used To
            </div>
            <ul className="space-y-3 text-sm text-text-main">
              <li className="flex items-start gap-2.5">
                <span className="text-status-critical font-bold">✕</span>
                <span>Important attendee questions buried across 5 different WhatsApp groups.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-status-critical font-bold">✕</span>
                <span>Desperately syncing Google Forms into out-of-date spreadsheets at midnight.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-status-critical font-bold">✕</span>
                <span>Volunteers unsure of their shift times, designated rooms, or task owners.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-status-critical font-bold">✕</span>
                <span>Discovering room overcapacity and AV delays after the crowd has already arrived.</span>
              </li>
            </ul>
          </div>

          {/* The EventForge Way */}
          <div className="p-6 rounded-2xl border border-forest/30 bg-mint-soft/50 space-y-4">
            <div className="flex items-center gap-2 text-forest-dark font-semibold text-sm">
              <span className="w-2 h-2 rounded-full bg-forest" />
              The Calm, Unified EventForge Workspace
            </div>
            <ul className="space-y-3 text-sm text-text-main">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                <span>Single source of truth for schedule, speakers, rooms, and registrations.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                <span>Event Twin operational simulation to catch bottlenecks before doors open.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                <span>Mobile-first attendee companion with QR tickets, live updates, and feedback.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                <span>Volunteer assignment board with 1-tap mobile task progress tracking.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. EVENT PLANNING WORKFLOW */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-border bg-mint-subtle/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-forest-dark">
              Five structured stages of event mastery
            </h2>
            <p className="mt-3 text-text-muted text-sm sm:text-base">
              From initial room planning to real-time check-in and post-event analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Plan',
                desc: 'Configure venue, rooms, tracks, capacity, and ticket rules.',
              },
              {
                step: '02',
                title: 'Coordinate',
                desc: 'Assign speakers, volunteer shifts, and prioritize operational tasks.',
              },
              {
                step: '03',
                title: 'Simulate',
                desc: 'Run Event Twin scenarios to test attendance surges and room outages.',
              },
              {
                step: '04',
                title: 'Execute',
                desc: 'Live QR check-in, real-time announcements, and schedule updates.',
              },
              {
                step: '05',
                title: 'Analyze',
                desc: 'Review turnout velocity, room utilization, and attendee ratings.',
              },
            ].map((st, i) => (
              <Card key={i} className="p-5 border-border relative">
                <span className="text-xs font-bold text-teal-muted font-mono">{st.step}</span>
                <h3 className="text-base font-bold text-text-main mt-1">{st.title}</h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">{st.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SIGNATURE FEATURE — EVENT TWIN EXPLAINED */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="success" className="mb-3">
              Signature Innovation
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-dark tracking-tight">
              Event Twin: Test event day before it happens.
            </h2>
            <p className="mt-4 text-text-muted leading-relaxed text-sm sm:text-base">
              Event Twin creates a mathematical simulation model of your physical venue and program schedule. It tests what happens when things go wrong — before attendees ever arrive.
            </p>

            <div className="mt-6 space-y-3">
              {[
                { title: 'Attendance surges', desc: 'Models check-in lines and room fire-code thresholds at +30% turnout.' },
                { title: 'Cascade delays', desc: 'Simulates the downstream effect of a 15-minute keynote overrun on catering.' },
                { title: 'Room outages', desc: 'Instantly identifies alternative spaces if a hall undergoes technical failure.' },
                { title: 'Volunteer shortages', desc: 'Pinpoints queue bottlenecks when staff members are indisposed.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-mint-soft flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-main">{item.title}</h4>
                    <p className="text-xs text-text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button
                onClick={() => handleDemoAccess('organizer')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-forest-dark"
              >
                <span>Run an Event Twin simulation in the demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-warm-surface rounded-2xl border border-border p-6 shadow-lift space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-semibold uppercase text-text-muted">Preset What-If Scenario</span>
              <Badge variant="warning">Overall Risk: 65/100</Badge>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-text-main">
                Scenario: "Attendance increases by 30%"
              </div>
              <div className="text-xs text-text-muted">
                Assumes uniform 65% morning rush arrival and +30% turnout across all breakout rooms.
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-mint-subtle/60 text-xs space-y-2">
                <div className="font-semibold text-forest-dark flex items-center justify-between">
                  <span>1. Registration Station Bottleneck</span>
                  <span className="text-status-critical font-bold">145% Capacity</span>
                </div>
                <p className="text-text-muted">
                  Queue throughput of 2 active desks cannot process 325 morning arrivals without 25-minute wait times.
                </p>
                <div className="text-forest-dark font-medium">
                  → Recommendation: Assign 2 float volunteers to Registration Desk 1 & 2.
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-mint-subtle/60 text-xs space-y-2">
                <div className="font-semibold text-forest-dark flex items-center justify-between">
                  <span>2. Workshop Room Seating Deficit</span>
                  <span className="text-status-warning font-bold">120% Capacity</span>
                </div>
                <p className="text-text-muted">
                  72 attendees expected for 60-seat Workshop Room hands-on lab.
                </p>
                <div className="text-forest-dark font-medium">
                  → Recommendation: Open Room C overflow stream.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ORGANIZER & ATTENDEE FEATURES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border bg-mint-subtle/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-forest-dark">
              Engineered for both sides of the lanyard
            </h2>
            <p className="mt-3 text-text-muted text-sm sm:text-base">
              A command center for organizers, and a clean one-handed companion for attendees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 border-border space-y-4">
              <div className="w-10 h-10 rounded-xl bg-mint-soft flex items-center justify-center text-forest">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-text-main">Organizer Operations Command</h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Everything required to steer high-stakes event days smoothly without spreadsheet sync errors.
              </p>
              <ul className="space-y-2 text-xs text-text-main">
                <li className="flex items-center gap-2">✓ Multi-stage Event Creation Wizard with draft saving</li>
                <li className="flex items-center gap-2">✓ Timeline Agenda Builder with automatic conflict detection</li>
                <li className="flex items-center gap-2">✓ Volunteer Roster with shift allocation and task board</li>
                <li className="flex items-center gap-2">✓ Live QR check-in camera scanner with duplicate alerts</li>
                <li className="flex items-center gap-2">✓ Grounded AI Assistant answering questions from event data</li>
              </ul>
            </Card>

            <Card className="p-6 border-border space-y-4">
              <div className="w-10 h-10 rounded-xl bg-mint-soft flex items-center justify-center text-forest">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-text-main">Mobile Attendee Companion</h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Designed for one-hand operation on mobile phones in crowded hallways.
              </p>
              <ul className="space-y-2 text-xs text-text-main">
                <li className="flex items-center gap-2">✓ 10-second frictionless registration</li>
                <li className="flex items-center gap-2">✓ High-contrast digital QR ticket for instant badge pickup</li>
                <li className="flex items-center gap-2">✓ "Today" live tab showing current and next session locations</li>
                <li className="flex items-center gap-2">✓ Pinned urgent announcements (room switches, announcements)</li>
                <li className="flex items-center gap-2">✓ Simple post-session feedback rating</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. INSTANT DEMO CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-3xl border border-border bg-mint-soft/80 shadow-card">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-dark">
            Ready to experience EventForge in action?
          </h2>
          <p className="mt-3 text-text-muted text-sm sm:text-base max-w-xl mx-auto">
            Try the live pre-seeded event "EventForge Summit 2026" with realistic sessions, attendees, volunteers, and operational risks.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleDemoAccess('organizer')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-forest hover:bg-forest-dark text-white transition-colors"
            >
              Sign in as Organizer
            </button>
            <button
              onClick={() => handleDemoAccess('volunteer')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-warm-surface hover:bg-mint-subtle text-text-main border border-border transition-colors"
            >
              Sign in as Volunteer
            </button>
            <button
              onClick={() => handleDemoAccess('attendee')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-warm-surface hover:bg-mint-subtle text-text-main border border-border transition-colors"
            >
              Sign in as Attendee
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8 bg-warm-surface text-xs text-text-muted">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-forest flex items-center justify-center text-white font-bold text-xs">
              E
            </div>
            <span className="font-semibold text-text-main">EventForge Operations Platform</span>
          </div>
          <div>Calm, human-centered event software. Strict zero-purple design system.</div>
          <div>© 2026 EventForge. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

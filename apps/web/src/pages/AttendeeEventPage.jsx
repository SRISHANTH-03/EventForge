import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Input, Card, Badge, LoadingSpinner } from '../components/UI';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Ticket,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AttendeeEventPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [regForm, setRegForm] = useState({
    attendeeName: user?.name || '',
    attendeeEmail: user?.email || '',
    company: '',
  });

  const [registeredTicket, setRegisteredTicket] = useState(null);

  useEffect(() => {
    loadEvent();
  }, [slug]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const res = await api.getEventById(slug);
      if (res.success) {
        setEventData(res);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load event details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.attendeeName.trim() || !regForm.attendeeEmail.trim()) {
      addToast('Please enter your full name and email.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.register(eventData.event._id, regForm);
      if (res.success) {
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
        setRegisteredTicket(res.registration);
        addToast('Registration confirmed!', 'success');
      }
    } catch (err) {
      if (err.message.includes('already registered')) {
        addToast(err.message, 'warning');
      } else {
        addToast(err.message || 'Registration failed.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading event details..." />;
  }

  if (!eventData || !eventData.event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h3 className="text-xl font-bold text-text-main">Event Not Found</h3>
        <p className="text-sm text-text-muted mt-2">
          The requested event may be in draft mode or no longer available.
        </p>
        <Link to="/events" className="mt-4 inline-block">
          <Button variant="primary">Browse Events</Button>
        </Link>
      </div>
    );
  }

  const { event, sessions = [], speakers = [] } = eventData;

  return (
    <div className="min-h-screen bg-warm-white pb-20">
      {/* Editorial Header */}
      <section className="bg-mint-soft/50 border-b border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="success" className="capitalize">
              {event.type}
            </Badge>
            <span className="text-xs text-text-muted">
              Organized by {event.organizerId?.name || 'EventForge'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-forest-dark tracking-tight leading-tight">
            {event.title}
          </h1>

          <p className="text-base text-text-muted leading-relaxed max-w-2xl">
            {event.shortDescription || event.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-text-main max-w-xl">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-forest flex-shrink-0" />
              <span>
                {new Date(event.dates.start).toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-forest flex-shrink-0" />
              <span>{event.venue.name} ({event.venue.city || 'Campus/Center'})</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Registration Box */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details & Schedule Highlight */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-forest-dark mb-2">About the Event</h3>
            <p className="text-sm text-text-main whitespace-pre-line leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Speakers */}
          {speakers.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-forest-dark mb-3">Featured Speakers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {speakers.map((spk) => (
                  <Card key={spk._id} className="p-3.5 border-border flex items-center gap-3">
                    <img
                      src={spk.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={spk.name}
                      className="w-12 h-12 rounded-full object-cover border border-border"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-text-main">{spk.name}</h4>
                      <p className="text-[11px] text-text-muted">{spk.title}</p>
                      <p className="text-[11px] font-semibold text-teal-muted">{spk.company}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Program Highlights */}
          {sessions.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-forest-dark mb-3">Program Highlights</h3>
              <div className="space-y-2.5">
                {sessions.slice(0, 5).map((s) => (
                  <div
                    key={s._id}
                    className="p-3 rounded-lg border border-border bg-warm-surface flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-forest">
                        {new Date(s.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <h5 className="font-semibold text-text-main mt-0.5">{s.title}</h5>
                      <span className="text-text-muted">{s.roomId?.name || 'TBA'}</span>
                    </div>
                    <Badge variant="neutral">{s.track}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Registration Widget */}
        <div className="space-y-4">
          <Card className="p-6 border-border shadow-card sticky top-24">
            {registeredTicket ? (
              <div className="space-y-4 text-center animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-mint-soft flex items-center justify-center text-forest mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-forest-dark">You're Registered!</h3>
                <p className="text-xs text-text-muted">
                  Your digital ticket and entry pass are ready.
                </p>
                <div className="p-3 rounded-lg bg-warm-white border border-border font-mono font-bold text-sm text-forest">
                  {registeredTicket.ticketCode}
                </div>
                <Link to={`/tickets/${registeredTicket.ticketCode}`}>
                  <Button variant="primary" className="w-full">
                    <Ticket className="w-4 h-4 mr-2" />
                    Open My QR Ticket
                  </Button>
                </Link>
                <Link to={`/portal/${event.slug || event._id}?ticket=${registeredTicket.ticketCode}`}>
                  <Button variant="outline" className="w-full text-xs">
                    Open Attendee Day Companion
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="border-b border-border pb-3">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Registration
                  </span>
                  <div className="text-lg font-bold text-text-main mt-0.5">
                    {event.settings?.ticketPrice === 0 ? 'Free Registration' : `$${event.settings?.ticketPrice}`}
                  </div>
                </div>

                <Input
                  label="Full Name"
                  placeholder="e.g. Alex Mercer"
                  required
                  value={regForm.attendeeName}
                  onChange={(e) => setRegForm({ ...regForm, attendeeName: e.target.value })}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. alex@example.com"
                  required
                  value={regForm.attendeeEmail}
                  onChange={(e) => setRegForm({ ...regForm, attendeeEmail: e.target.value })}
                />

                <Input
                  label="Company / Affiliation"
                  placeholder="e.g. University / Company"
                  value={regForm.company}
                  onChange={(e) => setRegForm({ ...regForm, company: e.target.value })}
                />

                <Button type="submit" variant="primary" className="w-full" loading={submitting}>
                  Register in 10 Seconds
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <p className="text-[11px] text-text-muted text-center leading-tight">
                  Instant QR ticket delivery upon submission. No credit card required.
                </p>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

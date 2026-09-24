import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button, Card, Badge, LoadingSpinner, Input } from '../components/UI';
import {
  Calendar,
  Clock,
  MapPin,
  Radio,
  Star,
  Ticket,
  AlertTriangle,
  Send,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const AttendeePortalPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const ticketCode = searchParams.get('ticket');
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'schedule' | 'updates' | 'feedback'
  const [eventData, setEventData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feedback form
  const [feedback, setFeedback] = useState({
    overall: 5,
    session: 5,
    venue: 5,
    organization: 5,
    comment: '',
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    loadPortalData();
  }, [slug]);

  const loadPortalData = async () => {
    try {
      setLoading(true);
      const res = await api.getEventById(slug);
      if (res.success) {
        setEventData(res);
        const aRes = await api.getAnnouncements(res.event._id, { audience: 'Attendees' });
        if (aRes.success) setAnnouncements(aRes.announcements);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load attendee portal.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.submitFeedback(eventData.event._id, {
        ticketCode,
        ratings: feedback,
        comment: feedback.comment,
      });
      if (res.success) {
        setFeedbackSubmitted(true);
        addToast(res.message, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit feedback.', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to live event companion..." />;
  }

  const { event, sessions = [] } = eventData || {};
  const currentSession = sessions[0];
  const nextSession = sessions[1];
  const urgentAnnouncements = announcements.filter((a) => a.isUrgent);

  return (
    <div className="min-h-screen bg-warm-white pb-24 max-w-lg mx-auto px-4 pt-4">
      {/* Mobile Top App Bar */}
      <div className="bg-warm-surface rounded-2xl border border-border p-4 shadow-subtle flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold text-forest uppercase tracking-wider">
            Live Companion
          </span>
          <h2 className="text-base font-bold text-forest-dark leading-tight">{event?.title}</h2>
          <div className="text-[11px] text-text-muted mt-0.5">
            {event?.venue?.name}
          </div>
        </div>

        {ticketCode && (
          <Link to={`/tickets/${ticketCode}`}>
            <Button size="sm" variant="secondary">
              <Ticket className="w-3.5 h-3.5 mr-1" />
              My Ticket
            </Button>
          </Link>
        )}
      </div>

      {/* Urgent Broadcast Notice Pin */}
      {urgentAnnouncements.length > 0 && (
        <div className="mb-4 space-y-2">
          {urgentAnnouncements.map((a) => (
            <div
              key={a._id}
              className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 text-xs text-text-main space-y-1 animate-in fade-in"
            >
              <div className="flex items-center gap-1.5 font-bold text-status-warning">
                <AlertTriangle className="w-4 h-4" />
                <span>Urgent Event Notice</span>
              </div>
              <div className="font-semibold">{a.title}</div>
              <p className="text-text-muted leading-relaxed">{a.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Subnav Pills */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-mint-subtle rounded-xl border border-border mb-4">
        {[
          { id: 'today', label: 'Today', icon: Clock },
          { id: 'schedule', label: 'Schedule', icon: Calendar },
          { id: 'updates', label: 'Updates', icon: Radio },
          { id: 'feedback', label: 'Feedback', icon: Star },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 text-xs font-semibold rounded-lg transition-colors flex flex-col items-center gap-1 ${
                active
                  ? 'bg-warm-surface text-forest-dark shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. TODAY TAB (Current & Next Session, Venue Directions) */}
      {activeTab === 'today' && (
        <div className="space-y-4 animate-in fade-in">
          {/* NOW PLAYING */}
          {currentSession && (
            <Card className="p-4 border-forest/30 bg-mint-soft/40 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="success">Happening Now</Badge>
                <span className="font-mono text-xs text-forest-dark font-bold">
                  {new Date(currentSession.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(currentSession.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="text-base font-bold text-text-main leading-snug">
                {currentSession.title}
              </h3>
              <p className="text-xs text-text-muted line-clamp-2">{currentSession.description}</p>
              <div className="pt-2 border-t border-forest/20 text-xs flex items-center justify-between font-medium">
                <span className="flex items-center gap-1 text-forest-dark">
                  <MapPin className="w-3.5 h-3.5" />
                  {currentSession.roomId?.name || 'Main Hall'}
                </span>
                <span className="text-text-muted">Track: {currentSession.track}</span>
              </div>
            </Card>
          )}

          {/* UP NEXT */}
          {nextSession && (
            <Card className="p-4 border-border bg-warm-surface space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="neutral">Up Next</Badge>
                <span className="font-mono text-xs text-text-muted">
                  Starts {new Date(nextSession.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h4 className="text-sm font-bold text-text-main">{nextSession.title}</h4>
              <div className="text-xs text-text-muted flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-forest" />
                <span>{nextSession.roomId?.name || 'Assigned Room'}</span>
              </div>
            </Card>
          )}

          {/* Quick Wi-Fi & Venue Info */}
          <Card className="p-4 border-border bg-warm-white text-xs space-y-2">
            <span className="font-semibold text-text-main uppercase text-[10px] tracking-wider block">
              Venue Quick Info
            </span>
            <div className="flex justify-between">
              <span className="text-text-muted">Wi-Fi SSID:</span>
              <strong className="text-forest-dark">Metropolis_Guest</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Help Desk:</span>
              <span>Info Counter (Central Foyer)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Emergency Exit:</span>
              <span>Follow lighted green exit signs</span>
            </div>
          </Card>
        </div>
      )}

      {/* 2. SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <div className="space-y-3 animate-in fade-in">
          {sessions.map((s) => (
            <Card key={s._id} className="p-3.5 border-border space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-forest">
                  {new Date(s.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(s.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <Badge variant="neutral">{s.track}</Badge>
              </div>
              <h4 className="text-sm font-semibold text-text-main">{s.title}</h4>
              <div className="text-xs text-text-muted flex items-center gap-1">
                <MapPin className="w-3 h-3 text-forest" />
                <span>{s.roomId?.name || 'TBA'}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 3. UPDATES TAB */}
      {activeTab === 'updates' && (
        <div className="space-y-3 animate-in fade-in">
          {announcements.length > 0 ? (
            announcements.map((a) => (
              <Card
                key={a._id}
                className={`p-4 border ${a.isUrgent ? 'border-amber-300 bg-amber-50/50' : 'border-border'}`}
              >
                <div className="flex items-center justify-between text-xs text-text-muted pb-1">
                  <span>{new Date(a.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {a.isUrgent && <Badge variant="warning">Urgent</Badge>}
                </div>
                <h4 className="text-sm font-bold text-text-main mt-1">{a.title}</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">{a.body}</p>
              </Card>
            ))
          ) : (
            <p className="text-center text-xs text-text-muted py-8">
              No broadcast announcements yet.
            </p>
          )}
        </div>
      )}

      {/* 4. FEEDBACK TAB */}
      {activeTab === 'feedback' && (
        <div className="space-y-4 animate-in fade-in">
          <Card className="p-5 border-border space-y-4">
            <div>
              <h3 className="text-base font-bold text-forest-dark">Event Feedback</h3>
              <p className="text-xs text-text-muted">
                Help the organizing team improve future events.
              </p>
            </div>

            {feedbackSubmitted ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-forest mx-auto" />
                <h4 className="text-sm font-bold text-text-main">Thank You!</h4>
                <p className="text-xs text-text-muted">Your feedback has been submitted to the organizers.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
                {['overall', 'session', 'venue', 'organization'].map((category) => (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between font-semibold text-text-main capitalize">
                      <span>{category} Rating</span>
                      <span className="text-forest font-bold">{feedback[category]} / 5</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedback({ ...feedback, [category]: star })}
                          className={`p-2 rounded-lg border text-sm flex-1 font-bold ${
                            feedback[category] >= star
                              ? 'bg-mint-soft border-forest text-forest'
                              : 'bg-warm-surface border-border text-text-muted'
                          }`}
                        >
                          ★ {star}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block font-semibold text-text-main mb-1">
                    Optional Comments or Suggestions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="What did you enjoy most? What could run smoother?"
                    value={feedback.comment}
                    onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                    className="w-full rounded-lg border border-border bg-warm-surface p-2 text-xs text-text-main focus-ring"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full">
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Submit Feedback
                </Button>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

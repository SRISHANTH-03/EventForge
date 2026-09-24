import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button, Card, Badge, LoadingSpinner } from '../components/UI';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Download,
  Share2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const AttendeeTicketPage = () => {
  const { ticketCode } = useParams();
  const { addToast } = useToast();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTicket();
  }, [ticketCode]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const res = await api.getTicket(ticketCode);
      if (res.success) {
        setTicket(res.ticket);
      }
    } catch (err) {
      addToast(err.message || 'Ticket not found.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Rendering your digital ticket..." />;
  }

  if (!ticket) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h3 className="text-lg font-bold text-text-main">Ticket Not Found</h3>
        <p className="text-xs text-text-muted mt-1">Please verify the ticket code.</p>
        <Link to="/events" className="mt-4 inline-block">
          <Button variant="primary" size="sm">Browse Events</Button>
        </Link>
      </div>
    );
  }

  const { eventId: event } = ticket;
  const isCheckedIn = !!ticket.checkInAt;

  return (
    <div className="min-h-screen bg-warm-white py-10 px-4 sm:px-6">
      <div className="max-w-sm mx-auto space-y-4">
        {/* Ticket Header & Status */}
        <div className="text-center space-y-1">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Official Entry Pass
          </span>
          <h2 className="text-lg font-bold text-forest-dark">Your Digital Ticket</h2>
        </div>

        {/* Physical Badge Card Design */}
        <div className="bg-warm-surface rounded-3xl border border-border shadow-lift overflow-hidden">
          {/* Header Banner */}
          <div className="bg-forest p-6 text-warm-white text-center space-y-1">
            <span className="text-[11px] uppercase tracking-widest text-mint-soft/80 font-bold">
              {event?.type || 'Conference'}
            </span>
            <h1 className="text-xl font-extrabold tracking-tight">{event?.title}</h1>
            <p className="text-xs text-mint-soft/90 pt-1">
              {new Date(event?.dates?.start).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Attendee Info */}
          <div className="p-6 text-center space-y-4">
            <div>
              <h3 className="text-xl font-bold text-text-main">{ticket.attendeeName}</h3>
              <p className="text-xs text-text-muted">{ticket.company || ticket.attendeeEmail}</p>
            </div>

            {/* High-Contrast QR Code */}
            <div className="p-4 bg-white rounded-2xl border border-border inline-block shadow-sm">
              <QRCodeSVG
                value={ticket.qrPayload || ticket.ticketCode}
                size={180}
                level="H"
                fgColor="#0E4F42" // Deep green
                bgColor="#FFFFFF"
              />
            </div>

            {/* Ticket Code & Status */}
            <div>
              <div className="font-mono text-sm font-bold tracking-wider text-forest-dark">
                {ticket.ticketCode}
              </div>
              <div className="mt-2 flex justify-center">
                {isCheckedIn ? (
                  <Badge variant="success" className="gap-1 px-3 py-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified & Checked In
                  </Badge>
                ) : (
                  <Badge variant="neutral" className="px-3 py-1">
                    Confirmed • Ready for Check-in
                  </Badge>
                )}
              </div>
            </div>

            {/* Venue Footer inside card */}
            <div className="pt-4 border-t border-dashed border-border text-xs text-text-muted space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-medium text-text-main">
                <MapPin className="w-3.5 h-3.5 text-forest" />
                <span>{event?.venue?.name}</span>
              </div>
              <p className="text-[11px]">{event?.venue?.address || event?.venue?.city}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Link to={`/portal/${event?.slug || event?._id}?ticket=${ticket.ticketCode}`} className="block">
            <Button variant="primary" className="w-full">
              Open Attendee Day Companion
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${event?.title} Ticket`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                addToast('Ticket link copied to clipboard.', 'success');
              }
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Ticket Link
          </Button>
        </div>
      </div>
    </div>
  );
};

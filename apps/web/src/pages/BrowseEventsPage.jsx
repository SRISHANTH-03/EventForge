import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Badge, Input, Select, LoadingSpinner, EmptyState } from '../components/UI';
import { Calendar, MapPin, Users, Clock, Search, Plus, ArrowRight } from 'lucide-react';

export const BrowseEventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadEvents();
  }, [typeFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter) params.type = typeFilter;
      const res = await api.getEvents(params);
      if (res.success) {
        setEvents(res.events || []);
      }
    } catch (err) {
      console.error('[BrowseEvents] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = events.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.venue?.name?.toLowerCase().includes(q) ||
      e.type?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-forest-dark tracking-tight">
            Explore Events
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Browse upcoming conferences, hackathons, workshops, and community meetups.
          </p>
        </div>

        {user && (
          <Link to="/events/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by title, venue, or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Formats</option>
            <option value="conference">Conferences</option>
            <option value="workshop">Workshops</option>
            <option value="hackathon">Hackathons</option>
            <option value="meetup">Meetups</option>
            <option value="toastmasters">Toastmasters</option>
          </Select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <LoadingSpinner text="Loading published events..." />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ev) => (
            <Card key={ev._id} className="p-5 border-border flex flex-col justify-between hover:border-forest/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="success" className="capitalize">
                    {ev.type}
                  </Badge>
                  <span className="text-xs text-text-muted font-medium">
                    {ev.registeredCount || 0} / {ev.capacity} spots
                  </span>
                </div>

                <h3 className="text-lg font-bold text-text-main line-clamp-1">
                  {ev.title}
                </h3>

                <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                  {ev.shortDescription || ev.description}
                </p>

                <div className="pt-2 border-t border-border text-xs text-text-muted space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-forest" />
                    <span>
                      {new Date(ev.dates.start).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-forest" />
                    <span>{ev.venue.name}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                <Link to={`/e/${ev.slug || ev._id}`}>
                  <Button variant="primary" size="sm">
                    View & Register
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>

                <Link
                  to={`/events/${ev._id}/workspace`}
                  className="text-xs font-semibold text-forest hover:underline"
                >
                  Workspace →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No Events Found"
          description="There are currently no events matching your search criteria."
          actionText="Clear Filters"
          onAction={() => {
            setSearch('');
            setTypeFilter('');
          }}
        />
      )}
    </div>
  );
};

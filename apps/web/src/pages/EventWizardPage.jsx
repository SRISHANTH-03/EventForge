import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button, Input, Select, Card, Badge } from '../components/UI';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Layers,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Check,
} from 'lucide-react';

export const EventWizardPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State across the 8 steps
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    type: 'conference',
    dates: {
      start: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
      end: new Date(Date.now() + 86400000 * 8).toISOString().slice(0, 16),
    },
    venue: {
      name: '',
      address: '',
      city: '',
    },
    capacity: 250,
    expectedAttendance: 200,
    rooms: [
      { name: 'Main Hall', capacity: 200, location: 'Ground Floor' },
      { name: 'Breakout Room A', capacity: 50, location: 'Level 2' },
    ],
    sessions: [
      {
        title: 'Opening Remarks & Keynote',
        track: 'Main',
        type: 'keynote',
        startAt: new Date(Date.now() + 86400000 * 7 + 3600000 * 9).toISOString().slice(0, 16),
        endAt: new Date(Date.now() + 86400000 * 7 + 3600000 * 10).toISOString().slice(0, 16),
      },
    ],
    speakers: [
      { name: '', title: '', company: '', bio: '' },
    ],
    volunteers: [
      { name: '', email: '', role: 'Registration' },
    ],
    settings: {
      registrationOpen: true,
      allowWaitlist: true,
      ticketPrice: 0,
      currency: 'USD',
    },
  });

  const STEPS = [
    { num: 1, title: 'Basics' },
    { num: 2, title: 'Venue & Dates' },
    { num: 3, title: 'Rooms' },
    { num: 4, title: 'Agenda' },
    { num: 5, title: 'Speakers' },
    { num: 6, title: 'Volunteers' },
    { num: 7, title: 'Registration' },
    { num: 8, title: 'Review & Publish' },
  ];

  const handleNext = () => {
    // Basic validation per step
    if (currentStep === 1 && !formData.title.trim()) {
      addToast('Please provide an event title before continuing.', 'warning');
      return;
    }
    if (currentStep === 2 && (!formData.venue.name.trim() || !formData.dates.start || !formData.dates.end)) {
      addToast('Please provide venue name and event dates.', 'warning');
      return;
    }
    if (currentStep === 3 && (!formData.capacity || formData.rooms.length === 0)) {
      addToast('Please specify event capacity and at least one room.', 'warning');
      return;
    }

    setCurrentStep((prev) => Math.min(8, prev + 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSaveDraft = async (publish = false) => {
    try {
      setSubmitting(true);
      if (!formData.title.trim()) {
        addToast('Please provide an event title to save.', 'warning');
        return;
      }

      const payload = {
        ...formData,
        status: publish ? 'published' : 'draft',
        isPublished: publish,
      };

      const res = await api.createEvent(payload);
      if (res.success) {
        addToast(
          publish ? 'Event published successfully!' : 'Event draft saved.',
          'success'
        );
        navigate(`/events/${res.event._id}/workspace`);
      }
    } catch (err) {
      addToast(err.message || 'Failed to save event.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic Room Rows
  const addRoom = () => {
    setFormData({
      ...formData,
      rooms: [...formData.rooms, { name: '', capacity: 50, location: '' }],
    });
  };

  const removeRoom = (index) => {
    const updated = formData.rooms.filter((_, i) => i !== index);
    setFormData({ ...formData, rooms: updated });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Step Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Step {currentStep} of 8
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-forest-dark">
              {STEPS[currentStep - 1].title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSaveDraft(false)}
              disabled={submitting}
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              Save Draft
            </Button>
          </div>
        </div>

        {/* Stepper circles */}
        <div className="mt-4 flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {STEPS.map((step) => {
            const isDone = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className={`flex items-center gap-1.5 text-xs font-medium py-1 px-2 rounded-lg transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'bg-forest text-white'
                    : isDone
                    ? 'bg-mint-soft text-forest-dark'
                    : 'text-text-muted hover:bg-mint-subtle'
                }`}
              >
                <span>{step.num}.</span>
                <span>{step.title}</span>
                {isDone && <Check className="w-3 h-3 text-forest" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-6 border-border shadow-card min-h-[380px]">
        {/* STEP 1: EVENT BASICS */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <Input
              label="Event Title"
              placeholder="e.g. Pacific Tech Conference 2026"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <Select
              label="Event Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="conference">Conference</option>
              <option value="hackathon">Hackathon</option>
              <option value="workshop">Workshop</option>
              <option value="meetup">Meetup / Community</option>
              <option value="toastmasters">Toastmasters</option>
              <option value="college">College / University Event</option>
              <option value="corporate">Corporate Seminar</option>
            </Select>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5 uppercase tracking-wider">
                Full Description
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border bg-warm-surface px-3 py-2 text-sm text-text-main border-border focus-ring"
                placeholder="Describe the goals, audience, and program..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <Input
              label="Short Tagline (Mobile Preview)"
              placeholder="e.g. Two days of distributed architecture and AI agent workshops."
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            />
          </div>
        )}

        {/* STEP 2: DATE AND VENUE */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Start Date & Time"
                type="datetime-local"
                required
                value={formData.dates.start}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dates: { ...formData.dates, start: e.target.value },
                  })
                }
              />
              <Input
                label="End Date & Time"
                type="datetime-local"
                required
                value={formData.dates.end}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dates: { ...formData.dates, end: e.target.value },
                  })
                }
              />
            </div>

            <Input
              label="Venue Name"
              placeholder="e.g. City Science & Innovation Center"
              required
              value={formData.venue.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  venue: { ...formData.venue, name: e.target.value },
                })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Street Address"
                placeholder="e.g. 500 University Ave"
                value={formData.venue.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    venue: { ...formData.venue, address: e.target.value },
                  })
                }
              />
              <Input
                label="City, State / Region"
                placeholder="e.g. San Francisco, CA"
                value={formData.venue.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    venue: { ...formData.venue, city: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )}

        {/* STEP 3: CAPACITY AND ROOMS */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Total Event Capacity"
                type="number"
                min="1"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                helperText="Maximum total attendees allowed by venue fire code"
              />
              <Input
                label="Expected Attendance Target"
                type="number"
                min="1"
                value={formData.expectedAttendance}
                onChange={(e) =>
                  setFormData({ ...formData, expectedAttendance: Number(e.target.value) })
                }
                helperText="Target turnout used for Event Twin initial calculations"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Configured Breakout Rooms & Halls
                </span>
                <Button size="sm" variant="outline" onClick={addRoom}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Room
                </Button>
              </div>

              <div className="space-y-2">
                {formData.rooms.map((room, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 rounded-lg border border-border bg-mint-subtle/30"
                  >
                    <Input
                      placeholder="Room Name (e.g. Hall A)"
                      value={room.name}
                      onChange={(e) => {
                        const updated = [...formData.rooms];
                        updated[idx].name = e.target.value;
                        setFormData({ ...formData, rooms: updated });
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Capacity"
                      className="w-28"
                      value={room.capacity}
                      onChange={(e) => {
                        const updated = [...formData.rooms];
                        updated[idx].capacity = Number(e.target.value);
                        setFormData({ ...formData, rooms: updated });
                      }}
                    />
                    {formData.rooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoom(idx)}
                        className="p-2 text-text-muted hover:text-status-critical"
                        title="Remove room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: AGENDA */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <p className="text-xs text-text-muted">
              Add your initial program session. You can refine, add more tracks, and resolve conflicts anytime in the visual Agenda Builder.
            </p>
            <Input
              label="Opening Session Title"
              value={formData.sessions[0]?.title || ''}
              onChange={(e) => {
                const s = [...formData.sessions];
                s[0] = { ...s[0], title: e.target.value };
                setFormData({ ...formData, sessions: s });
              }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Start Time"
                type="datetime-local"
                value={formData.sessions[0]?.startAt || ''}
                onChange={(e) => {
                  const s = [...formData.sessions];
                  s[0] = { ...s[0], startAt: e.target.value };
                  setFormData({ ...formData, sessions: s });
                }}
              />
              <Input
                label="End Time"
                type="datetime-local"
                value={formData.sessions[0]?.endAt || ''}
                onChange={(e) => {
                  const s = [...formData.sessions];
                  s[0] = { ...s[0], endAt: e.target.value };
                  setFormData({ ...formData, sessions: s });
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 5: SPEAKERS */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <p className="text-xs text-text-muted">
              Add your keynote speaker or featured presenter.
            </p>
            <Input
              label="Speaker Name"
              placeholder="e.g. Dr. Jane Goodall"
              value={formData.speakers[0]?.name || ''}
              onChange={(e) => {
                const spk = [...formData.speakers];
                spk[0] = { ...spk[0], name: e.target.value };
                setFormData({ ...formData, speakers: spk });
              }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Professional Title"
                placeholder="e.g. Chief Research Scientist"
                value={formData.speakers[0]?.title || ''}
                onChange={(e) => {
                  const spk = [...formData.speakers];
                  spk[0] = { ...spk[0], title: e.target.value };
                  setFormData({ ...formData, speakers: spk });
                }}
              />
              <Input
                label="Company / Organization"
                placeholder="e.g. Stanford University"
                value={formData.speakers[0]?.company || ''}
                onChange={(e) => {
                  const spk = [...formData.speakers];
                  spk[0] = { ...spk[0], company: e.target.value };
                  setFormData({ ...formData, speakers: spk });
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 6: VOLUNTEERS */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <p className="text-xs text-text-muted">
              Add an initial volunteer team lead.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Volunteer Name"
                placeholder="e.g. Samantha Wu"
                value={formData.volunteers[0]?.name || ''}
                onChange={(e) => {
                  const v = [...formData.volunteers];
                  v[0] = { ...v[0], name: e.target.value };
                  setFormData({ ...formData, volunteers: v });
                }}
              />
              <Input
                label="Volunteer Email"
                type="email"
                placeholder="e.g. samantha@eventforge.demo"
                value={formData.volunteers[0]?.email || ''}
                onChange={(e) => {
                  const v = [...formData.volunteers];
                  v[0] = { ...v[0], email: e.target.value };
                  setFormData({ ...formData, volunteers: v });
                }}
              />
            </div>
            <Select
              label="Assigned Role"
              value={formData.volunteers[0]?.role || 'Registration'}
              onChange={(e) => {
                const v = [...formData.volunteers];
                v[0] = { ...v[0], role: e.target.value };
                setFormData({ ...formData, volunteers: v });
              }}
            >
              <option value="Registration">Registration & Check-In</option>
              <option value="Hospitality">Hospitality & VIP Lounge</option>
              <option value="Technical">Technical & Audio/Visual</option>
              <option value="Stage">Stage & Speaker Liaison</option>
              <option value="Crowd Management">Crowd Management & Directional</option>
              <option value="Help Desk">Help Desk & Info</option>
            </Select>
          </div>
        )}

        {/* STEP 7: REGISTRATION SETTINGS */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border bg-mint-subtle/40 space-y-3">
              <label className="flex items-center gap-2.5 text-sm font-medium text-text-main cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.settings.registrationOpen}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      settings: { ...formData.settings, registrationOpen: e.target.checked },
                    })
                  }
                  className="rounded text-forest focus:ring-forest w-4 h-4"
                />
                <span>Open public registration immediately</span>
              </label>

              <label className="flex items-center gap-2.5 text-sm font-medium text-text-main cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.settings.allowWaitlist}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      settings: { ...formData.settings, allowWaitlist: e.target.checked },
                    })
                  }
                  className="rounded text-forest focus:ring-forest w-4 h-4"
                />
                <span>Enable automatic waitlist when capacity is reached</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Ticket Price (0 for Free Event)"
                type="number"
                min="0"
                value={formData.settings.ticketPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, ticketPrice: Number(e.target.value) },
                  })
                }
              />
              <Select
                label="Currency"
                value={formData.settings.currency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, currency: e.target.value },
                  })
                }
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </Select>
            </div>
          </div>
        )}

        {/* STEP 8: REVIEW AND PUBLISH */}
        {currentStep === 8 && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl border border-border bg-warm-white space-y-3">
              <h3 className="text-base font-bold text-forest-dark">{formData.title}</h3>
              <p className="text-xs text-text-muted">{formData.description || 'No description provided.'}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-border">
                <div>
                  <span className="text-text-muted block">Format</span>
                  <span className="font-semibold capitalize text-text-main">{formData.type}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Capacity</span>
                  <span className="font-semibold text-text-main">{formData.capacity} attendees</span>
                </div>
                <div>
                  <span className="text-text-muted block">Rooms</span>
                  <span className="font-semibold text-text-main">{formData.rooms.length} configured</span>
                </div>
                <div>
                  <span className="text-text-muted block">Venue</span>
                  <span className="font-semibold text-text-main">{formData.venue.name || 'TBD'}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Ticket</span>
                  <span className="font-semibold text-text-main">
                    {formData.settings.ticketPrice === 0 ? 'Free' : `$${formData.settings.ticketPrice}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-forest/20 bg-mint-soft text-xs text-forest-dark flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-forest" />
              <span>
                All basic pillars validated. You can publish now to make it available for attendee registration, or keep it as a private draft.
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Buttons */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1 || submitting}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {currentStep < 8 ? (
            <Button variant="primary" onClick={handleNext}>
              Next Step
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleSaveDraft(false)}
                loading={submitting}
              >
                Save as Draft
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSaveDraft(true)}
                loading={submitting}
              >
                Publish Event
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

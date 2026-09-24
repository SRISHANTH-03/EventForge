import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Card, Badge, LoadingSpinner, EmptyState } from '../components/UI';
import {
  Users,
  CheckSquare,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Radio,
  ArrowRight,
} from 'lucide-react';

export const VolunteerPortalPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [volunteerData, setVolunteerData] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadPortal();
  }, []);

  const loadPortal = async () => {
    try {
      setLoading(true);
      const res = await api.getMyVolunteerPortal();
      if (res.success) {
        setVolunteerData(res);
        setTasks(res.tasks || []);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load volunteer shifts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await api.updateTask(taskId, { status: newStatus });
      if (res.success) {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? res.task : t)));
        addToast(`Task updated to ${newStatus}`, 'info');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading volunteer assignment board..." />;
  }

  const primaryProfile = volunteerData?.profiles?.[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header Profile Card */}
      <div className="bg-warm-surface rounded-2xl border border-border p-5 shadow-subtle flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold text-forest uppercase tracking-wider">
            Volunteer Operations Desk
          </span>
          <h1 className="text-xl font-bold text-forest-dark mt-0.5">
            Welcome, {user?.name}
          </h1>
          {primaryProfile ? (
            <div className="text-xs text-text-muted mt-2 space-y-1">
              <div>
                Event: <strong className="text-text-main">{primaryProfile.eventId?.title}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span>Role: <strong className="text-forest-dark">{primaryProfile.role}</strong></span>
                <span>•</span>
                <span>Station: <strong className="text-text-main">{primaryProfile.assignedLocation}</strong></span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-muted mt-1">
              No shifts currently linked to this email. You can browse active events or request assignment.
            </p>
          )}
        </div>

        {primaryProfile && (
          <Badge variant="success" className="px-3 py-1">
            {primaryProfile.status}
          </Badge>
        )}
      </div>

      {/* Assigned Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-forest-dark flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-forest" />
              My Assigned Tasks ({tasks.length})
            </h3>
            <p className="text-xs text-text-muted">
              Tap status to update execution progress in real time.
            </p>
          </div>
        </div>

        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task._id} className="p-4 border-border space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      task.priority === 'Critical'
                        ? 'critical'
                        : task.priority === 'High'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {task.priority} Priority
                  </Badge>
                  <span className="text-xs font-mono text-text-muted">
                    Due {new Date(task.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-text-main">{task.title}</h4>
                  {task.description && (
                    <p className="text-xs text-text-muted mt-1">{task.description}</p>
                  )}
                  {task.location && (
                    <div className="text-[11px] text-teal-muted font-medium mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {task.location}
                    </div>
                  )}
                </div>

                {/* 1-Tap Status Button Row */}
                <div className="pt-2 border-t border-border flex items-center justify-between gap-1 text-xs">
                  <span className="text-text-muted font-medium">Status:</span>
                  <div className="flex items-center gap-1.5">
                    {['Not Started', 'In Progress', 'Completed'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateStatus(task._id, st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          task.status === st
                            ? 'bg-forest text-white shadow-sm'
                            : 'bg-warm-white border border-border text-text-muted hover:text-text-main'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title="All Clear"
            description="You have no outstanding tasks assigned at this moment."
          />
        )}
      </div>
    </div>
  );
};

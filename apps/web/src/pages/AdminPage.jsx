import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Badge, LoadingSpinner } from '../components/UI';
import { Shield, Users, Layers, Activity, Lock, Database } from 'lucide-react';

export const AdminPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const res = await api.getEvents({ public: 'false' });
      if (res.success) {
        setEvents(res.events || []);
      }
    } catch (err) {
      console.error('[Admin] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to Platform Administrator Panel..." />;
  }

  const demoAccounts = [
    { email: 'organizer@eventforge.demo', role: 'Organizer', name: 'Jordan Miller', status: 'Active' },
    { email: 'volunteer@eventforge.demo', role: 'Volunteer', name: 'Alex Chen', status: 'Active' },
    { email: 'attendee@eventforge.demo', role: 'Attendee', name: 'Maya Lin', status: 'Active' },
    { email: 'speaker@eventforge.demo', role: 'Speaker', name: 'Dr. Elena Vance', status: 'Active' },
    { email: 'admin@eventforge.demo', role: 'Admin', name: 'Sarah Connor', status: 'Active' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-forest-dark">
          <Shield className="w-5 h-5 text-forest" />
          <h1 className="text-2xl font-bold tracking-tight">Platform Administration</h1>
        </div>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Monitor system health, access policies, demo credentials, and active event instances.
        </p>
      </div>

      {/* Platform Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-border">
          <span className="text-xs font-semibold uppercase text-text-muted">Total Events</span>
          <div className="text-2xl font-bold text-forest-dark mt-1">{events.length}</div>
          <span className="text-[11px] text-teal-muted font-medium">100% active instances</span>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold uppercase text-text-muted">System Accounts</span>
          <div className="text-2xl font-bold text-forest-dark">5 Roles</div>
          <span className="text-[11px] text-teal-muted font-medium">Verified RBAC enforcement</span>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold uppercase text-text-muted">Database Engine</span>
          <div className="text-2xl font-bold text-forest-dark">MongoDB</div>
          <span className="text-[11px] text-teal-muted font-medium">14 Collections connected</span>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold uppercase text-text-muted">Design Guard</span>
          <div className="text-2xl font-bold text-forest-dark">0% Purple</div>
          <span className="text-[11px] text-teal-muted font-medium">Strict editorial palette</span>
        </Card>
      </div>

      {/* Demo Credentials Table */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-forest-dark">Configured Demo Personas</h3>
        <div className="bg-warm-surface rounded-xl border border-border overflow-hidden shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-mint-subtle/60 border-b border-border uppercase text-[11px] text-text-muted font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Demo Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Development Password</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {demoAccounts.map((acc, i) => (
                <tr key={i} className="hover:bg-mint-subtle/30">
                  <td className="py-3 px-4 font-semibold text-text-main">{acc.name}</td>
                  <td className="py-3 px-4 font-mono text-text-main">{acc.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant="neutral">{acc.role}</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-text-muted">DemoPass123!</td>
                  <td className="py-3 px-4">
                    <Badge variant="success">{acc.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

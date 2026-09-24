import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card, Select } from '../components/UI';
import { Sparkles, Shield, UserCheck, Calendar, Users, ArrowRight } from 'lucide-react';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signup, demoLogin } = useAuth();

  const isSignup = searchParams.get('mode') === 'signup';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'organizer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(formData);
      } else {
        await login(formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSwitch = async (role) => {
    setError('');
    try {
      await demoLogin(role);
      if (role === 'organizer') navigate('/dashboard');
      else if (role === 'volunteer') navigate('/volunteer');
      else if (role === 'admin') navigate('/admin');
      else navigate('/events');
    } catch (err) {
      setError(err.message || 'Failed to switch demo account.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-warm-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 focus-ring rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center text-warm-white font-bold text-lg">
              E
            </div>
            <span className="font-bold text-2xl text-forest-dark tracking-tight">EventForge</span>
          </Link>
          <h2 className="text-xl font-bold text-text-main">
            {isSignup ? 'Create your EventForge account' : 'Sign in to your event workspace'}
          </h2>
          <p className="text-xs text-text-muted">
            {isSignup
              ? 'Start planning and executing flawless events today.'
              : 'Enter your credentials or choose a quick demo account below.'}
          </p>
        </div>

        {/* Demo Fast-Switch Card */}
        <Card className="p-4 bg-mint-subtle/70 border-forest/20">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-forest-dark mb-2">
            <Sparkles className="w-3.5 h-3.5 text-forest" />
            <span>Instant Demo Logins (Click to Enter)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {[
              { role: 'organizer', label: 'Organizer' },
              { role: 'volunteer', label: 'Volunteer' },
              { role: 'attendee', label: 'Attendee' },
              { role: 'speaker', label: 'Speaker' },
              { role: 'admin', label: 'Admin' },
            ].map(({ role, label }) => (
              <button
                key={role}
                type="button"
                onClick={() => handleDemoSwitch(role)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-warm-surface hover:bg-mint-soft text-text-main transition-colors text-left flex items-center justify-between"
              >
                <span>{label}</span>
                <span className="text-[10px] text-teal-muted">→</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Main Auth Form */}
        <Card className="p-6 border-border shadow-card">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-status-critical font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <Input
                label="Full Name"
                placeholder="e.g. Jordan Miller"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. organizer@eventforge.demo"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              helperText={isSignup ? 'Must be at least 6 characters' : undefined}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            {isSignup && (
              <Select
                label="Primary Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="organizer">Event Organizer</option>
                <option value="volunteer">Volunteer Staff</option>
                <option value="attendee">Attendee</option>
                <option value="speaker">Speaker</option>
              </Select>
            )}

            <Button type="submit" variant="primary" className="w-full" loading={loading}>
              {isSignup ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-border text-center text-xs text-text-muted">
            {isSignup ? (
              <span>
                Already have an account?{' '}
                <Link to="/auth?mode=login" className="font-semibold text-forest hover:underline">
                  Sign in
                </Link>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <Link to="/auth?mode=signup" className="font-semibold text-forest hover:underline">
                  Create one now
                </Link>
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

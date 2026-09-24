import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './UI';
import {
  Calendar,
  Layers,
  Users,
  Shield,
  LogOut,
  LogIn,
  Menu,
  X,
  UserCheck,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, demoLogin, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleDemoSwitch = async (role) => {
    setDemoMenuOpen(false);
    setMobileMenuOpen(false);
    await demoLogin(role);
    if (role === 'organizer') navigate('/dashboard');
    else if (role === 'volunteer') navigate('/volunteer');
    else if (role === 'admin') navigate('/admin');
    else navigate('/events');
  };

  const navLinks = [
    { label: 'Browse Events', path: '/events', icon: Calendar },
    ...(user && (hasRole('organizer') || hasRole('admin'))
      ? [{ label: 'Organizer Hub', path: '/dashboard', icon: Layers }]
      : []),
    ...(user && hasRole('volunteer')
      ? [{ label: 'Volunteer Portal', path: '/volunteer', icon: Users }]
      : []),
    ...(user && hasRole('admin')
      ? [{ label: 'Platform Admin', path: '/admin', icon: Shield }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-warm-surface/95 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 focus-ring rounded-lg py-1">
            <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center text-warm-white font-bold text-lg shadow-sm">
              E
            </div>
            <span className="font-bold text-xl text-forest-dark tracking-tight">EventForge</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'bg-mint-soft text-forest-dark font-semibold'
                      : 'text-text-muted hover:text-text-main hover:bg-mint-subtle'
                  }`}
                >
                  <item.icon className="w-4 h-4 opacity-75" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right: Demo Switcher & User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Instant Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-border bg-mint-subtle hover:bg-mint-soft text-forest-dark transition-colors"
                title="Switch demo persona instantly"
              >
                <Sparkles className="w-3.5 h-3.5 text-forest" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3 h-3 text-forest opacity-70" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-warm-surface border border-border shadow-lift py-1.5 z-50 animate-in fade-in">
                  <div className="px-3 py-1 text-[11px] font-semibold text-text-light uppercase tracking-wider">
                    Instant Demo Login
                  </div>
                  {['organizer', 'volunteer', 'attendee', 'speaker', 'admin'].map((role) => (
                    <button
                      key={role}
                      onClick={() => handleDemoSwitch(role)}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-text-main hover:bg-mint-soft flex items-center justify-between capitalize"
                    >
                      <span>{role}</span>
                      {user?.roles?.includes(role) && (
                        <span className="w-2 h-2 rounded-full bg-forest" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-border">
                <div className="text-right">
                  <div className="text-xs font-semibold text-text-main leading-tight">{user.name}</div>
                  <div className="text-[11px] text-text-muted capitalize">
                    {user.roles?.[0] || 'member'}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-text-muted hover:text-status-critical rounded-lg hover:bg-red-50 transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth?mode=login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button variant="primary" size="sm">
                    Create an Event
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-main rounded-lg hover:bg-mint-subtle"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-warm-surface px-4 pt-2 pb-4 space-y-3">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-text-main hover:bg-mint-subtle"
              >
                <item.icon className="w-4 h-4 text-forest" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Demo Switcher */}
          <div className="pt-2 border-t border-border">
            <div className="text-xs font-semibold text-text-muted uppercase mb-2">Instant Demo Personas</div>
            <div className="grid grid-cols-2 gap-1.5">
              {['organizer', 'volunteer', 'attendee', 'speaker', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleDemoSwitch(role)}
                  className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-text-main hover:bg-mint-soft text-left capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Auth actions */}
          <div className="pt-2 border-t border-border">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-text-main">{user.name}</div>
                  <div className="text-xs text-text-muted capitalize">{user.roles?.join(', ')}</div>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/auth?mode=login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

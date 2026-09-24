import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { EventWizardPage } from './pages/EventWizardPage';
import { EventWorkspacePage } from './pages/EventWorkspacePage';
import { BrowseEventsPage } from './pages/BrowseEventsPage';
import { AttendeeEventPage } from './pages/AttendeeEventPage';
import { AttendeeTicketPage } from './pages/AttendeeTicketPage';
import { AttendeePortalPage } from './pages/AttendeePortalPage';
import { VolunteerPortalPage } from './pages/VolunteerPortalPage';
import { AdminPage } from './pages/AdminPage';
import { LoadingSpinner, Button } from './components/UI';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Checking authentication status..." />;
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (roles.length > 0 && !hasRole(...roles)) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <h3 className="text-xl font-bold text-text-main">Access Restricted</h3>
        <p className="text-xs text-text-muted mt-2">
          This area requires {roles.join(' or ')} privileges.
        </p>
        <div className="mt-4">
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return children;
};

const NotFoundPage = () => (
  <div className="max-w-md mx-auto py-24 px-4 text-center">
    <div className="text-4xl font-extrabold text-forest">404</div>
    <h2 className="text-lg font-bold text-text-main mt-2">Page Not Found</h2>
    <p className="text-xs text-text-muted mt-1">
      The requested page does not exist or has been relocated.
    </p>
    <div className="mt-6">
      <a href="/">
        <Button variant="primary" size="sm">
          Return Home
        </Button>
      </a>
    </div>
  </div>
);

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-warm-white text-text-main">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Marketing & Browse */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/events" element={<BrowseEventsPage />} />

                {/* Public Attendee Flow */}
                <Route path="/e/:slug" element={<AttendeeEventPage />} />
                <Route path="/tickets/:ticketCode" element={<AttendeeTicketPage />} />
                <Route path="/portal/:slug" element={<AttendeePortalPage />} />

                {/* Organizer & Operations Flow */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute roles={['organizer', 'admin']}>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/new"
                  element={
                    <ProtectedRoute roles={['organizer', 'admin']}>
                      <EventWizardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/:eventId/workspace"
                  element={
                    <ProtectedRoute roles={['organizer', 'admin', 'volunteer']}>
                      <EventWorkspacePage />
                    </ProtectedRoute>
                  }
                />

                {/* Volunteer Portal */}
                <Route
                  path="/volunteer"
                  element={
                    <ProtectedRoute roles={['volunteer', 'organizer', 'admin']}>
                      <VolunteerPortalPage />
                    </ProtectedRoute>
                  }
                />

                {/* Platform Admin */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

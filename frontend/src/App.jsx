import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './pages/Dashboard';
import InternalAssessment from './pages/InternalAssessment';
import UniversityResults from './pages/UniversityResults';
import StudentProfiles from './pages/StudentProfiles';
import ArrearHistory from './pages/ArrearHistory';
import Reports from './pages/Reports';
import Diagnostics from './pages/Diagnostics';
import Login from './pages/Login';
import StudentPortal from './pages/StudentPortal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { healthApi } from './services/api';

function MainApp() {
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginRole, setLoginRole] = useState('student');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [healthSummary, setHealthSummary] = useState({
    status: 'connecting',
    isError: false,
    latency: null,
  });

  const checkServerHealth = async () => {
    setIsLoadingHealth(true);
    const start = performance.now();
    try {
      const res = await healthApi.getHealth();
      const latency = Math.round(performance.now() - start);
      setHealthData(res);
      setHealthSummary({
        status: res?.data?.status || 'healthy',
        isError: false,
        latency,
      });
    } catch (err) {
      console.warn('Backend connection standby:', err.message);
      setHealthSummary({
        status: 'offline',
        isError: true,
        latency: null,
      });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkServerHealth();
    const interval = setInterval(checkServerHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Open the student sign-in screen (register number + e-mailed OTP)
  const handleOpenStudentLogin = () => {
    setLoginRole('student');
    setActiveTab('dashboard');
    logout();
  };

  // Return from a student session to the faculty / admin sign-in screen
  const handleOpenStaffLogin = () => {
    setLoginRole('faculty');
    setActiveTab('dashboard');
    logout();
  };

  // If user is not authenticated, display login view
  if (!isAuthenticated) {
    return (
      <Login
        initialRole={loginRole}
        onLoginSuccess={() => setActiveTab('dashboard')}
      />
    );
  }

  // Students get their own scoped self-service portal
  if (user?.role === 'student') {
    return <StudentPortal onExitToStaff={handleOpenStaffLogin} />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            healthData={healthData}
            isLoadingHealth={isLoadingHealth}
            onRefreshHealth={checkServerHealth}
            onNavigateTab={setActiveTab}
          />
        );
      case 'module-a':
        return <InternalAssessment />;
      case 'module-b':
        return <UniversityResults />;
      case 'students':
        return <StudentProfiles />;
      case 'arrears':
        return <ArrearHistory />;
      case 'reports':
        return <Reports />;
      case 'diagnostics':
        return (
          <Diagnostics
            healthData={healthData}
            isLoadingHealth={isLoadingHealth}
            onRefreshHealth={checkServerHealth}
          />
        );
      default:
        return (
          <Dashboard
            healthData={healthData}
            isLoadingHealth={isLoadingHealth}
            onRefreshHealth={checkServerHealth}
            onNavigateTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-full min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Top Navigation Bar with Live Health Status */}
      <Navbar
        healthState={healthSummary}
        onRefreshHealth={checkServerHealth}
        isRefreshing={isLoadingHealth}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onStudentLogin={handleOpenStudentLogin}
      />

      {/* Main Content Area with Sidebar & Responsive Mobile Padding */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />
        
        <main 
          className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 pb-24 md:pb-8 touch-scroll bg-gradient-to-b from-slate-900/40 via-slate-950 to-slate-950"
          style={{
            paddingLeft: 'max(env(safe-area-inset-left, 0px), 0.875rem)',
            paddingRight: 'max(env(safe-area-inset-right, 0px), 0.875rem)',
          }}
        >
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile-First Bottom Navigation Bar (< 768px) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMenu={() => setMobileMenuOpen(true)}
        isMenuOpen={mobileMenuOpen}
      />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Runtime Error Caught:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('academic_analyzer_user');
      localStorage.removeItem('academic_analyzer_token');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-full min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-white p-2 mx-auto flex items-center justify-center shadow-lg border border-slate-200 ring-2 ring-sky-500/20">
              <img
                src="/branding/college_emblem.png"
                alt="INFO Institute of Engineering"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">INFO Institute of Engineering</h2>
              <p className="text-xs text-slate-400 mt-0.5">Academic Intelligence Portal</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono text-left break-words">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                Reset &amp; Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <MainApp />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

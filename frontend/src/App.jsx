import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import InternalAssessment from './pages/InternalAssessment';
import UniversityResults from './pages/UniversityResults';
import StudentProfiles from './pages/StudentProfiles';
import ArrearHistory from './pages/ArrearHistory';
import Reports from './pages/Reports';
import Diagnostics from './pages/Diagnostics';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { healthApi } from './services/api';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
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

  // If user is not authenticated, display login view
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setActiveTab('dashboard')} />;
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar with Live Health Status */}
      <Navbar
        healthState={healthSummary}
        onRefreshHealth={checkServerHealth}
        isRefreshing={isLoadingHealth}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gradient-to-b from-slate-900/40 via-slate-950 to-slate-950">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </AuthProvider>
  );
}

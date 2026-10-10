import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginView from './components/LoginView';
import OverviewView from './components/OverviewView';
import IngestionView from './components/IngestionView';
import WorkspaceView from './components/WorkspaceView';
import ConflictRadarView from './components/ConflictRadarView';
import { Layers, ShieldCheck, ArrowRight } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [simulatedClearance, setSimulatedClearance] = useState('LEVEL_2');
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore authenticated session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('verion_token');
    const savedUser = localStorage.getItem('verion_user');

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setAuthToken(savedToken);
        setSimulatedClearance(parsed.clearance);
      } catch (e) {
        localStorage.removeItem('verion_token');
        localStorage.removeItem('verion_user');
      }
    }
    setIsInitializing(false);
  }, []);

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    setSimulatedClearance(user.clearance);
  };

  const handleLogout = () => {
    localStorage.removeItem('verion_token');
    localStorage.removeItem('verion_user');
    setCurrentUser(null);
    setAuthToken(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-mono text-slate-500">
        INITIALIZING VERION AI TERMINAL...
      </div>
    );
  }

  // Not authenticated -> Render Login Page
  if (!currentUser || !authToken) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen ambient-mesh flex flex-col font-sans">
      {/* Top Persistent Header */}
      <Header
        currentUser={currentUser}
        simulatedClearance={simulatedClearance}
        setSimulatedClearance={setSimulatedClearance}
        onLogout={handleLogout}
      />

      {/* Main Body with Sidebar + Active Canvas */}
      <div className="flex-1 flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
        />

        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
          {activeTab === 'overview' && (
            <OverviewView
              currentUser={currentUser}
              simulatedClearance={simulatedClearance}
            />
          )}

          {activeTab === 'ingestion' && (
            <IngestionView
              currentUser={currentUser}
              simulatedClearance={simulatedClearance}
            />
          )}

          {activeTab === 'workspace' && (
            <WorkspaceView
              currentUser={currentUser}
              simulatedClearance={simulatedClearance}
            />
          )}

          {activeTab === 'conflicts' && (
            <ConflictRadarView
              currentUser={currentUser}
              simulatedClearance={simulatedClearance}
            />
          )}

          {!['overview', 'ingestion', 'workspace', 'conflicts'].includes(activeTab) && (
            <div className="bg-white border border-slate-200 p-8 shadow-xs text-center space-y-4 my-12 max-w-xl mx-auto">
              <div className="w-10 h-10 bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Module Ready For Next Phase
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  You are viewing the roadmap anchor for <strong>{activeTab.toUpperCase()}</strong>.
                  This module connects in subsequent phases with full on-prem pipeline integration.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-mono uppercase tracking-wider font-semibold apple-press inline-flex items-center gap-2"
              >
                Return to Overview & KPIs <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

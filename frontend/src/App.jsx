import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginView from './components/LoginView';
import OverviewView from './components/OverviewView';
import CaseManagerView from './components/CaseManagerView';
import IngestionView from './components/IngestionView';
import WorkspaceView from './components/WorkspaceView';
import ConflictRadarView from './components/ConflictRadarView';
import DossierView from './components/DossierView';
import AuditView from './components/AuditView';
import { Layers, ShieldCheck, ArrowRight } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [simulatedClearance, setSimulatedClearance] = useState('LEVEL_2');
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeCase, setActiveCase] = useState(null);
  // Bumped every time a new case is created — child components key on this to force re-mount
  const [caseVersion, setCaseVersion] = useState(0);
  // Bumped whenever analysis is executed or evidence uploaded to keep tabs synchronized
  const [analysisVersion, setAnalysisVersion] = useState(0);

  // Fetch the currently active case from the backend
  const fetchActiveCase = useCallback(async () => {
    const token = localStorage.getItem('verion_token');
    if (!token) return;
    try {
      const res = await fetch('/api/case/current', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveCase(data);
      }
    } catch (err) {
      console.error('Failed to fetch active case:', err);
    }
  }, []);

  // Called by IngestionView after successfully creating a new case
  const handleCaseChanged = useCallback(() => {
    setCaseVersion((v) => v + 1);
    setAnalysisVersion((v) => v + 1);
    fetchActiveCase();
  }, [fetchActiveCase]);

  const handleAnalysisRan = useCallback(() => {
    setAnalysisVersion((v) => v + 1);
  }, []);

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

  // Fetch active case once authenticated
  useEffect(() => {
    if (currentUser && authToken) {
      fetchActiveCase();
    }
  }, [currentUser, authToken, fetchActiveCase]);

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
    setActiveCase(null);
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
        activeCase={activeCase}
      />

      {/* Main Body with Sidebar + Active Canvas */}
      <div className="flex-1 flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
        />

        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
          <div style={{ display: activeTab === 'cases' ? 'block' : 'none' }}>
            <CaseManagerView
              key={`cases-${caseVersion}`}
              currentUser={currentUser}
              onCaseChanged={handleCaseChanged}
            />
          </div>

          <div style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
            <OverviewView
              key={`overview-${caseVersion}`}
              currentUser={currentUser}
              simulatedClearance={simulatedClearance}
              analysisVersion={analysisVersion}
              activeTab={activeTab}
            />
          </div>

          <div style={{ display: activeTab === 'ingestion' ? 'block' : 'none' }}>
            <IngestionView
              key={`ingestion-${caseVersion}`}
              currentUser={currentUser}
              simulatedClearance={simulatedClearance}
              onCaseChanged={handleCaseChanged}
              onUploadSuccess={handleAnalysisRan}
              analysisVersion={analysisVersion}
              activeTab={activeTab}
            />
          </div>

          <div style={{ display: activeTab === 'workspace' ? 'block' : 'none' }}>
            <WorkspaceView
              key={`workspace-${caseVersion}`}
              currentUser={currentUser}
              simulatedClearance={simulatedClearance}
              onAnalysisRan={handleAnalysisRan}
              analysisVersion={analysisVersion}
              activeTab={activeTab}
            />
          </div>

          <div style={{ display: activeTab === 'conflicts' ? 'block' : 'none' }}>
            <ConflictRadarView
              key={`conflicts-${caseVersion}`}
              currentUser={currentUser}
              simulatedClearance={simulatedClearance}
              analysisVersion={analysisVersion}
              activeTab={activeTab}
            />
          </div>

          <div style={{ display: activeTab === 'dossier' ? 'block' : 'none' }}>
            <DossierView
              key={`dossier-${caseVersion}`}
              currentUser={currentUser}
              simulatedClearance={simulatedClearance}
              analysisVersion={analysisVersion}
              activeTab={activeTab}
            />
          </div>

          <div style={{ display: activeTab === 'audit' ? 'block' : 'none' }}>
            <AuditView
              key={`audit-${caseVersion}`}
              currentUser={currentUser}
              simulatedClearance={simulatedClearance}
              analysisVersion={analysisVersion}
              activeTab={activeTab}
            />
          </div>

          {!['cases', 'overview', 'ingestion', 'workspace', 'conflicts', 'dossier', 'audit'].includes(activeTab) && (
            <div className="bg-white border border-slate-200 p-8 shadow-xs text-center space-y-4 my-12 max-w-xl mx-auto rounded-2xl">
              <div className="w-10 h-10 bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase font-mono tracking-wider">
                  View Unavailable
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  The selected view is not recognized. Please return to the investigation overview.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-mono uppercase tracking-wider font-semibold apple-press inline-flex items-center gap-2 rounded-xl"
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


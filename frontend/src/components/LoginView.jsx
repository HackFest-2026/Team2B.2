import React, { useState } from 'react';
import { Shield, Lock, User, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    id: 'officer_lead',
    name: 'Marcus Vance',
    role: 'Evidence Custodian & Lead Officer',
    clearance: 'LEVEL_2',
    clearanceLabel: 'Classified (Level 2) + Upload Admin',
    badgeColor: 'border-blue-500 text-blue-700 bg-blue-50/60',
    dotColor: 'bg-blue-600',
    username: 'officer_lead',
    password: 'Verion2026!'
  },
  {
    id: 'investigator_l2',
    name: 'Elena Rostova',
    role: 'Senior Forensic Investigator',
    clearance: 'LEVEL_2',
    clearanceLabel: 'Classified (Level 2) Full Dossier',
    badgeColor: 'border-rose-400 text-rose-700 bg-rose-50/60',
    dotColor: 'bg-rose-600',
    username: 'investigator_l2',
    password: 'Investigate2026!'
  },
  {
    id: 'auditor_l1',
    name: 'David Thorne',
    role: 'Public Compliance Auditor',
    clearance: 'LEVEL_1',
    clearanceLabel: 'Unclassified (Level 1) Sanitized',
    badgeColor: 'border-emerald-500 text-emerald-700 bg-emerald-50/60',
    dotColor: 'bg-emerald-600',
    username: 'auditor_l1',
    password: 'Audit2026!'
  }
];

export default function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('officer_lead');
  const [password, setPassword] = useState('Verion2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e, customUser = null, customPass = null) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const targetUser = customUser || username;
    const targetPass = customPass || password;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: targetUser, password: targetPass })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Authentication failed');
      }

      const data = await response.json();
      localStorage.setItem('verion_token', data.access_token);
      localStorage.setItem('verion_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.access_token);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (acc) => {
    setUsername(acc.username);
    setPassword(acc.password);
    handleLogin(null, acc.username, acc.password);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      {/* Top Technical Metadata */}
      <div className="w-full max-w-4xl mb-6 flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">
        <span>System: Verion AI Incident Engine</span>
        <span>Build: Local On-Prem // Zero-Cloud</span>
        <span>Security Spec: 2B Multi-Source</span>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Mission & Persona Select */}
        <div className="md:col-span-7 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 border border-blue-600/30 bg-blue-50 text-blue-700 text-[10px] font-mono uppercase tracking-widest font-semibold mb-3">
              <Shield className="w-3 h-3" /> Zero-Spillage Provenance Architecture
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Verion AI
            </h1>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Cryptographically verified incident reconciliation pipeline. Reconciling scanned records, witness testimony, and immutable machine syslogs into a single verifiable dossier.
            </p>
          </div>

          {/* Quick Persona Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-500">
                1-Click Role Login (Demo Ready)
              </span>
              <span className="text-[10px] font-mono text-slate-400">Select to authenticate</span>
            </div>

            <div className="space-y-2.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickSelect(acc)}
                  className="w-full text-left p-3.5 bg-white border border-slate-200 hover:border-blue-500 transition-all duration-150 apple-press flex items-start justify-between group shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${acc.dotColor}`} />
                      <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {acc.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 pl-4">
                      {acc.name} • <span className="font-mono text-[11px]">{acc.username}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border ${acc.badgeColor} font-semibold`}>
                      {acc.clearance}
                    </span>
                    <span className="text-[10px] text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Log In <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Authentic Credentials Form */}
        <div className="md:col-span-5 bg-white border border-slate-200 p-6 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" /> Secure Terminal Login
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter user credentials or select a persona on the left.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-600 mb-1">
                Username / Identifier
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/50 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-600 mb-1">
                Authentication Secret
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/50 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-mono uppercase tracking-wider font-semibold transition-colors duration-150 apple-press flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>Verifying Signature...</>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Authenticate & Access
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>AUTH STANDARD:</span>
              <span className="text-slate-600 font-semibold">HMAC-SHA256</span>
            </div>
            <div className="flex justify-between">
              <span>CLEARANCE GATE:</span>
              <span className="text-slate-600 font-semibold">PRE-RETRIEVAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

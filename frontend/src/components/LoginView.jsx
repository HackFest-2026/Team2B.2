import React, { useState } from 'react';
import LiquidGlass from './ui/LiquidGlass';
import { Shield, Lock, User, KeyRound, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    id: 'officer_lead',
    name: 'Marcus Vance',
    role: 'Evidence Custodian & Lead Officer',
    clearance: 'LEVEL_2',
    clearanceLabel: 'Classified (Level 2) + Upload Admin',
    badgeColor: 'border-blue-300 text-blue-700 bg-blue-50/80',
    dotColor: 'bg-blue-600',
    glowColor: 'rgba(0, 113, 227, 0.25)',
    username: 'officer_lead',
    password: 'Verion2026!'
  },
  {
    id: 'investigator_l2',
    name: 'Elena Rostova',
    role: 'Senior Forensic Investigator',
    clearance: 'LEVEL_2',
    clearanceLabel: 'Classified (Level 2) Full Dossier',
    badgeColor: 'border-rose-300 text-rose-700 bg-rose-50/80',
    dotColor: 'bg-rose-600',
    glowColor: 'rgba(225, 29, 72, 0.25)',
    username: 'investigator_l2',
    password: 'Investigate2026!'
  },
  {
    id: 'auditor_l1',
    name: 'David Thorne',
    role: 'Public Compliance Auditor',
    clearance: 'LEVEL_1',
    clearanceLabel: 'Unclassified (Level 1) Sanitized',
    badgeColor: 'border-emerald-300 text-emerald-700 bg-emerald-50/80',
    dotColor: 'bg-emerald-600',
    glowColor: 'rgba(16, 185, 129, 0.25)',
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
    <div className="min-h-screen ambient-mesh flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting orbs (visionOS style) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Glass Navigation Bar */}
      <div className="w-full max-w-4xl mb-8 flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-slate-500 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>VERION AI // ON-PREM SECURE DOCK</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>SPEC 2B MULTI-SOURCE</span>
          <span>FIPS 180-4 SHA-256</span>
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch relative z-10">
        {/* Left Column: Mission & Liquid Glass Persona Selectors */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 text-blue-700 text-[10px] font-mono uppercase tracking-widest font-semibold backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Zero-Spillage Ground Truth Engine</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Verion AI
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
              Reconciles fragmented PDFs, conversational testimony, and immutable machine syslogs into a single, verifiable investigation dossier with cryptographic citation provenance.
            </p>
          </div>

          {/* Quick Persona Selector Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-500">
                1-Click Role Login (Demo Ready)
              </span>
              <span className="text-[10px] font-mono text-slate-400">Click card to authenticate</span>
            </div>

            <div className="space-y-2.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <LiquidGlass
                  key={acc.id}
                  variant="card"
                  interactive={true}
                  glowColor={acc.glowColor}
                  onClick={() => handleQuickSelect(acc)}
                  className="p-4"
                >
                  <div className="flex items-start justify-between">
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
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-bold ${acc.badgeColor}`}>
                        {acc.clearance}
                      </span>
                      <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Enter <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </LiquidGlass>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Liquid Glass Terminal Login Form */}
        <div className="md:col-span-5 flex flex-col justify-center">
          <LiquidGlass variant="panel" className="p-6 space-y-5 border-white/90">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" /> Secure Terminal Login
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authenticates session credentials locally with HMAC-SHA256.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
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
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white/60 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono rounded-lg transition-all"
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
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white/60 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono rounded-lg transition-all"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-mono uppercase tracking-wider font-semibold rounded-lg transition-all duration-150 apple-press flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isLoading ? (
                  <>Verifying Cryptographic Stamp...</>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Authenticate & Access
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>INFERENCE ENGINE:</span>
                <span className="text-slate-700 font-semibold">LOCAL ON-PREM</span>
              </div>
              <div className="flex justify-between">
                <span>SECURITY CLEARANCE:</span>
                <span className="text-slate-700 font-semibold">PRE-RETRIEVAL GATE</span>
              </div>
            </div>
          </LiquidGlass>
        </div>
      </div>
    </div>
  );
}

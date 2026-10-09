import React from 'react';
import { Shield, ShieldAlert, Cpu, LogOut, Eye, UserCheck } from 'lucide-react';

export default function Header({ currentUser, simulatedClearance, setSimulatedClearance, onLogout }) {
  const isLevel2 = simulatedClearance === 'LEVEL_2';

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Branding & Case Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            V
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900">
            VERION AI
          </span>
        </div>

        <div className="h-4 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">ACTIVE DOSSIER:</span>
          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 border border-slate-200">
            CASE-2026-ALPHA // DB EXFILTRATION
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 border border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-600">
          <Cpu className="w-3 h-3 text-emerald-600" />
          <span>ON-PREM INFERENCE: READY</span>
        </div>
      </div>

      {/* Right: Security Clearance State & User Profile */}
      <div className="flex items-center gap-4">
        {/* Live Clearance Simulator Toggle */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-1">
            <Eye className="w-3 h-3 text-slate-400" /> View Clearance:
          </span>
          <button
            type="button"
            onClick={() => setSimulatedClearance('LEVEL_1')}
            className={`px-2 py-0.5 text-[10px] font-mono font-semibold transition-all apple-press ${
              !isLevel2
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            L1 (Unclass)
          </button>
          <button
            type="button"
            disabled={currentUser?.clearance === 'LEVEL_1'}
            onClick={() => setSimulatedClearance('LEVEL_2')}
            className={`px-2 py-0.5 text-[10px] font-mono font-semibold transition-all apple-press ${
              isLevel2
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            L2 (Secret)
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-200" />

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {currentUser?.full_name}
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              {currentUser?.title}
            </div>
          </div>

          <div
            className={`px-2 py-1 text-[10px] font-mono font-bold border uppercase tracking-wider flex items-center gap-1 ${
              currentUser?.clearance === 'LEVEL_2'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {currentUser?.clearance === 'LEVEL_2' ? (
              <ShieldAlert className="w-3 h-3 text-rose-600" />
            ) : (
              <Shield className="w-3 h-3 text-emerald-600" />
            )}
            {currentUser?.clearance}
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Terminate Session"
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors apple-press cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

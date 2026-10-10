import React from 'react';
import LiquidGlass from './ui/LiquidGlass';
import { Shield, ShieldAlert, Cpu, LogOut, Eye, CheckCircle2 } from 'lucide-react';

export default function Header({ currentUser, simulatedClearance, setSimulatedClearance, onLogout }) {
  const isLevel2 = simulatedClearance === 'LEVEL_2';

  return (
    <header className="h-16 liquid-glass px-6 flex items-center justify-between sticky top-0 z-30 border-b border-white/60">
      {/* Left: Branding & Active Case Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-black shadow-xs">
            V
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">
              VERION AI
            </span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
              Forensic Core
            </span>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 text-[11px]">CASE DOSSIER:</span>
          <span className="font-semibold text-slate-800 bg-slate-100/80 px-2.5 py-0.5 rounded-md border border-slate-200/80">
            CASE-2026-ALPHA // EXFILTRATION
          </span>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50/70 text-[10px] font-mono text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>ON-PREM LOCAL AI: READY</span>
        </div>
      </div>

      {/* Right: Apple Segmented Clearance Selector & Profile */}
      <div className="flex items-center gap-4">
        {/* Apple Segmented Control for Clearance Simulation */}
        <div className="flex items-center gap-2 apple-segmented-control">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider pl-2 flex items-center gap-1">
            <Eye className="w-3 h-3 text-slate-400" /> View Clearance:
          </span>
          <button
            type="button"
            onClick={() => setSimulatedClearance('LEVEL_1')}
            className={`px-3 py-1 text-[11px] font-mono font-semibold rounded-md transition-all apple-press cursor-pointer ${
              !isLevel2
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            L1 (Unclass)
          </button>
          <button
            type="button"
            disabled={currentUser?.clearance === 'LEVEL_1'}
            onClick={() => setSimulatedClearance('LEVEL_2')}
            className={`px-3 py-1 text-[11px] font-mono font-semibold rounded-md transition-all apple-press cursor-pointer ${
              isLevel2
                ? 'bg-white text-rose-700 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            L2 (Secret)
          </button>
        </div>

        <div className="h-5 w-[1px] bg-slate-200" />

        {/* User Profile Capsule */}
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
            className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-full border uppercase tracking-wider flex items-center gap-1 shadow-2xs ${
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
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all apple-press cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

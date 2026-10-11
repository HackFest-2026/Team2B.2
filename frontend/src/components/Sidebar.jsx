import React from 'react';
import {
  FolderOpen,
  LayoutDashboard,
  UploadCloud,
  Layers,
  AlertTriangle,
  FileCheck2,
  Fingerprint,
  Lock,
  ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'cases', label: 'Case Management', icon: FolderOpen },
  { id: 'overview', label: 'Overview & KPIs', icon: LayoutDashboard },
  { id: 'ingestion', label: 'Evidence Ingestion', icon: UploadCloud },
  { id: 'workspace', label: 'Investigation Workspace', icon: Layers },
  { id: 'conflicts', label: 'Conflict Radar', icon: AlertTriangle },
  { id: 'dossier', label: 'Synthesized Dossier', icon: FileCheck2 },
  { id: 'audit', label: 'Audit & Provenance', icon: Fingerprint }
];

export default function Sidebar({ activeTab, setActiveTab, currentUser }) {
  return (
    <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-slate-200/80 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none z-20">
      <div className="p-4 space-y-6">
        {/* Navigation Category */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold px-3 py-1">
            Investigation Modules
          </div>

          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 apple-press cursor-pointer border ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20 border-blue-500'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Apple-style Role Privilege Glass Card */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            <span>Security Directives</span>
            <Lock className="w-3 h-3 text-slate-400" />
          </div>
          <div className="space-y-1 text-xs text-slate-700">
            <div className="flex justify-between items-center text-[11px]">
              <span>Ingestion Right:</span>
              <span className={`font-mono font-bold ${currentUser?.can_upload ? 'text-blue-600' : 'text-slate-400'}`}>
                {currentUser?.can_upload ? 'ENABLED' : 'RESTRICTED'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>Active Clearance:</span>
              <span className="font-mono font-bold text-slate-900">{currentUser?.clearance}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>Zero-Spillage Gate:</span>
              <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200/80 text-[10px] font-mono text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>KLE HACKFEST 2026</span>
          <span className="text-slate-700 font-bold">PROBLEM 2B</span>
        </div>
        <div className="flex justify-between">
          <span>PIPELINE:</span>
          <span className="text-blue-600 font-bold">LOCAL-FIRST</span>
        </div>
      </div>
    </aside>
  );
}

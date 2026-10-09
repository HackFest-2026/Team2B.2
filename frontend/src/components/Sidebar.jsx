import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  Layers,
  AlertTriangle,
  FileCheck2,
  Fingerprint,
  Lock,
  ExternalLink
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview & KPIs', icon: LayoutDashboard, phase: 'Phase 1' },
  { id: 'ingestion', label: 'Evidence Ingestion', icon: UploadCloud, phase: 'Phase 2' },
  { id: 'workspace', label: 'Investigation Workspace', icon: Layers, phase: 'Phase 3' },
  { id: 'conflicts', label: 'Conflict Radar', icon: AlertTriangle, phase: 'Phase 3' },
  { id: 'dossier', label: 'Synthesized Dossier', icon: FileCheck2, phase: 'Phase 4' },
  { id: 'audit', label: 'Audit & Provenance', icon: Fingerprint, phase: 'Phase 5' }
];

export default function Sidebar({ activeTab, setActiveTab, currentUser }) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-3.5rem)] sticky top-14 select-none">
      <div className="p-4 space-y-6">
        {/* Navigation Category */}
        <div className="space-y-1">
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
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-all apple-press cursor-pointer border ${
                    isActive
                      ? 'bg-blue-50/60 border-blue-500 text-blue-700 font-bold'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 border ${
                      isActive
                        ? 'border-blue-300 bg-white text-blue-600'
                        : 'border-slate-200 text-slate-400'
                    }`}
                  >
                    {item.phase}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Role Privileges Card */}
        <div className="p-3 bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            <span>Role Permissions</span>
            <Lock className="w-3 h-3 text-slate-400" />
          </div>
          <div className="space-y-1 text-xs text-slate-700">
            <div className="flex justify-between items-center text-[11px]">
              <span>Ingestion Access:</span>
              <span className={`font-mono font-bold ${currentUser?.can_upload ? 'text-blue-600' : 'text-slate-400'}`}>
                {currentUser?.can_upload ? 'AUTHORISED' : 'RESTRICTED'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>Clearance Level:</span>
              <span className="font-mono font-bold text-slate-900">{currentUser?.clearance}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>Zero-Spillage Gate:</span>
              <span className="font-mono font-bold text-emerald-600">ENFORCED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 text-[10px] font-mono text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>KLE HACKFEST 2026</span>
          <span className="text-slate-600 font-bold">PROBLEM 2B</span>
        </div>
        <div className="flex justify-between">
          <span>STATUS:</span>
          <span className="text-emerald-600 font-bold">PHASE 1 VERIFIED</span>
        </div>
      </div>
    </aside>
  );
}

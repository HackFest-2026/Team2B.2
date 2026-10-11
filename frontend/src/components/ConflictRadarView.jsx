import React, { useState, useEffect } from 'react';
import LiquidGlass from './ui/LiquidGlass';
import {
  AlertOctagon,
  FileSpreadsheet,
  FileCode,
  ArrowRight,
  ShieldAlert,
  Hash,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Clock,
  RefreshCw,
  Compass
} from 'lucide-react';

export default function ConflictRadarView({ currentUser, simulatedClearance, analysisVersion, activeTab }) {
  const [conflicts, setConflicts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('verion_token');

  const fetchConflicts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/analysis/conflicts?simulate_clearance=${simulatedClearance}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConflicts(data.conflicts || []);
      }
    } catch (err) {
      console.error('Failed to load conflicts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, [simulatedClearance, analysisVersion]);

  useEffect(() => {
    if (activeTab === 'conflicts' && conflicts.length === 0 && !isLoading) {
      fetchConflicts();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-rose-700 uppercase tracking-widest font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>CROSS-EXAMINATION RADAR • STAGE 4</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Automated Cross-Source Conflict Radar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Detects discrepancies between human testimony and immutable machine records. Does not silently resolve conflicts; surfaces both for investigator decision.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>{conflicts.length} CRITICAL CONTRADICTIONS SURFACED</span>
          </div>

          <button
            type="button"
            onClick={fetchConflicts}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-400 text-xs font-mono font-semibold text-slate-700 rounded-lg transition-colors apple-press flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Discrepancy Cards Loop */}
      <div className="space-y-6">
        {isLoading && conflicts.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
              Cross-Examining Witness Statements Against Machine Records with On-Prem Intelligence...
            </p>
          </div>
        )}

        {!isLoading && conflicts.length === 0 && (
          <LiquidGlass variant="panel" className="p-12 text-center space-y-4 border-slate-200">
            <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-mono">
                No Contradictions Currently Surfaced
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No active discrepancies detected between sworn statements and technical records. Ensure evidence is uploaded and on-prem AI intelligence has been executed.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchConflicts}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-mono font-bold tracking-wider uppercase apple-press cursor-pointer inline-flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-Scan Evidence Conflicts
            </button>
          </LiquidGlass>
        )}

        {conflicts.map((conf, idx) => (
          <LiquidGlass
            key={conf.conflict_id || idx}
            variant="panel"
            className="p-6 space-y-5 border-rose-200/80 shadow-md"
          >
            {/* Conflict Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-rose-600 text-white">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-rose-700">{conf.conflict_id}</span>
                    <span className="text-sm font-extrabold text-slate-900">{conf.title}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Category: {conf.category} • Severity: <strong className="text-rose-700">{conf.severity}</strong>
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-mono text-xs font-bold border border-rose-200 self-start sm:self-auto">
                HIGH INCONSISTENCY
              </span>
            </div>

            {/* Side-by-Side Contradiction Comparator */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left: Claim A (Human Statement) */}
              <div className="p-4 rounded-xl bg-white/95 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>CLAIM A: HUMAN DEPOSITION</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    {conf.claim_a.classification}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-slate-500 font-mono text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Stated Time: <strong>{conf.claim_a.claimed_time}</strong></span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Speaker: <strong className="text-slate-800">{conf.claim_a.speaker}</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 font-sans italic leading-relaxed">
                  "{conf.claim_a.statement}"
                </div>

                <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Source: {conf.claim_a.source_file}</span>
                  <span className="truncate max-w-[140px] flex items-center gap-1">
                    <Hash className="w-2.5 h-2.5" /> {conf.claim_a.sha256}
                  </span>
                </div>
              </div>

              {/* Right: Claim B (Machine Syslog Audit) */}
              <div className="p-4 rounded-xl bg-white/95 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <FileCode className="w-4 h-4 text-rose-600" />
                    <span>CLAIM B: IMMUTABLE AUDIT SYSLOG</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                    {conf.claim_b.classification}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-slate-500 font-mono text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Recorded Time: <strong>{conf.claim_b.recorded_time}</strong></span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Component: <strong className="text-slate-800">{conf.claim_b.speaker}</strong>
                  </div>
                </div>

                <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200 text-xs font-mono text-slate-900 leading-relaxed font-semibold">
                  {conf.claim_b.record}
                </div>

                <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Source: {conf.claim_b.source_file}</span>
                  <span className="truncate max-w-[140px] flex items-center gap-1">
                    <Hash className="w-2.5 h-2.5" /> {conf.claim_b.sha256}
                  </span>
                </div>
              </div>
            </div>

            {/* Forensic Verdict & Investigator Action Directive */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                <Scale className="w-4 h-4 text-blue-600" /> Forensic Cross-Examination Analysis
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {conf.forensic_verdict}
              </p>
              <div className="pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-600 flex items-start gap-2">
                <strong className="text-slate-900 shrink-0">RECOMMENDED ACTION:</strong>
                <span>{conf.investigator_action}</span>
              </div>
            </div>
          </LiquidGlass>
        ))}
      </div>
    </div>
  );
}

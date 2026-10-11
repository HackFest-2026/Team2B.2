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
  UserCheck,
  Server,
  Quote,
  Terminal,
  Copy,
  Check
} from 'lucide-react';

export default function ConflictRadarView({ currentUser, simulatedClearance, analysisVersion, activeTab }) {
  const [conflicts, setConflicts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(null);

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

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
            <span>Forensic Cross-Examination Engine • Stage 4</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Automated Cross-Source Conflict Radar
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
            Rigorous algorithmic cross-examination correlating subjective human witness depositions against immutable machine audit logs and sensor telemetry. Never silently resolves contradictions; surfaces all discrepancies for judicial evaluation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 bg-rose-50/90 border border-rose-300 text-rose-900 rounded-xl text-sm font-mono font-bold flex items-center gap-2 shadow-xs">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>{conflicts.length} CONTRADICTIONS FLAGGED</span>
          </div>

          <button
            type="button"
            onClick={fetchConflicts}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:border-slate-500 text-sm font-mono font-semibold text-slate-800 rounded-xl transition-all apple-press flex items-center gap-2 cursor-pointer shadow-xs hover:shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Scan</span>
          </button>
        </div>
      </div>

      {/* Discrepancies List Container */}
      <div className="space-y-8">
        {/* Loading State */}
        {isLoading && conflicts.length === 0 && (
          <div className="py-24 text-center space-y-4 bg-white/80 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-mono font-bold uppercase tracking-widest text-slate-700">
                Cross-Examining Evidence with On-Prem Intelligence...
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Correlating timestamps, identity anchors, and machine telemetry
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && conflicts.length === 0 && (
          <LiquidGlass variant="panel" className="p-16 text-center space-y-5 border-slate-200">
            <div className="w-14 h-14 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 font-mono">
                No Contradictions Currently Surfaced
              </h3>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                The active case evidence has no detected discrepancies between witness depositions and machine logs. If you uploaded new files, make sure to execute On-Prem AI Intelligence in the Workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchConflicts}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-mono font-bold tracking-wider uppercase apple-press cursor-pointer inline-flex items-center gap-2 mx-auto shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Re-Scan Evidence Conflicts
            </button>
          </LiquidGlass>
        )}

        {/* Individual Conflict Cards */}
        {conflicts.map((conf, idx) => (
          <LiquidGlass
            key={conf.conflict_id || idx}
            variant="panel"
            className="p-6 md:p-8 space-y-7 border-2 border-rose-200/90 shadow-md rounded-2xl transition-all"
          >
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 pb-5">
              <div className="flex items-start md:items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-sm shrink-0">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-extrabold px-2.5 py-1 bg-rose-100 text-rose-800 rounded-md border border-rose-200">
                      {conf.conflict_id}
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                      {conf.title}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs font-mono text-slate-500">
                    <span>Category: <strong className="text-slate-800">{conf.category}</strong></span>
                    <span>•</span>
                    <span>Severity: <strong className="text-rose-700 uppercase font-black">{conf.severity}</strong></span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-rose-100/90 text-rose-800 font-mono text-xs font-bold border border-rose-300 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  TEMPORAL / FACTUAL ANOMALY
                </span>
              </div>
            </div>

            {/* Split Claims Comparison Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Left Panel: Claim A (Human Statement / Deposition) */}
              <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-950 font-mono">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                      <span>CLAIM A: WITNESS DEPOSITION</span>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      {conf.claim_a.classification}
                    </span>
                  </div>

                  {/* Speaker and Time Metadata */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{conf.claim_a.speaker}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 font-mono text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Stated Time: <strong>{conf.claim_a.claimed_time}</strong></span>
                    </div>
                  </div>

                  {/* Quoted Statement */}
                  <div className="relative pl-5 pr-4 py-4 rounded-xl bg-amber-50/60 border-l-4 border-emerald-500 text-slate-900 font-serif italic text-base md:text-lg leading-relaxed shadow-2xs">
                    <Quote className="w-4 h-4 text-emerald-600/40 absolute top-2 left-1.5" />
                    "{conf.claim_a.statement}"
                  </div>
                </div>

                {/* Provenance Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-500">
                  <span className="font-semibold text-slate-700">Source: {conf.claim_a.source_file}</span>
                  <div className="flex items-center gap-1.5 truncate max-w-[220px]" title={conf.claim_a.sha256}>
                    <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{conf.claim_a.sha256}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(conf.claim_a.sha256)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Copy Chunk Hash"
                    >
                      {copiedHash === conf.claim_a.sha256 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Panel: Claim B (Immutable Machine Syslog / Audit) */}
              <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-rose-950 font-mono">
                      <Terminal className="w-5 h-5 text-rose-600" />
                      <span>CLAIM B: DETERMINISTIC AUDIT LOG</span>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                      {conf.claim_b.classification}
                    </span>
                  </div>

                  {/* Machine Telemetry Metadata */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <Server className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{conf.claim_b.speaker}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 font-mono text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Audit Timestamp: <strong>{conf.claim_b.recorded_time}</strong></span>
                    </div>
                  </div>

                  {/* Machine Audit Record Block */}
                  <div className="p-4 rounded-xl bg-slate-900 text-rose-200 border border-slate-800 shadow-inner font-mono text-sm md:text-base leading-relaxed break-words font-medium">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-800 mb-2">
                      SYS_EVENT_TELEMETRY // VERIFIED RECORD
                    </div>
                    {conf.claim_b.record}
                  </div>
                </div>

                {/* Provenance Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-500">
                  <span className="font-semibold text-slate-700">Source: {conf.claim_b.source_file}</span>
                  <div className="flex items-center gap-1.5 truncate max-w-[220px]" title={conf.claim_b.sha256}>
                    <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{conf.claim_b.sha256}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(conf.claim_b.sha256)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Copy Chunk Hash"
                    >
                      {copiedHash === conf.claim_b.sha256 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Forensic Verdict & Investigator Directive */}
            <div className="p-6 md:p-7 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border-2 border-slate-200 space-y-4">
              <div className="flex items-center gap-2.5 text-sm md:text-base font-extrabold text-slate-900 font-mono uppercase tracking-wider">
                <Scale className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Forensic Cross-Examination Verdict</span>
              </div>

              <p className="text-sm md:text-base text-slate-800 leading-relaxed font-sans">
                {conf.forensic_verdict}
              </p>

              <div className="p-4 rounded-xl bg-blue-100/70 border border-blue-200 text-blue-950 flex items-start gap-3 shadow-xs">
                <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm leading-relaxed">
                  <div className="font-mono font-extrabold text-blue-900 text-xs uppercase tracking-wider">
                    MANDATED INVESTIGATIVE ACTION
                  </div>
                  <div className="font-medium text-slate-900">
                    {conf.investigator_action}
                  </div>
                </div>
              </div>
            </div>
          </LiquidGlass>
        ))}
      </div>
    </div>
  );
}

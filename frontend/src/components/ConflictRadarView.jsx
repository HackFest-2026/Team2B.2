import React, { useState, useEffect } from 'react';
import LiquidGlass from './ui/LiquidGlass';
import {
  AlertOctagon,
  FileSpreadsheet,
  Terminal,
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
  Copy,
  Check,
  Zap,
  Filter,
  Eye,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck
} from 'lucide-react';

/**
 * Extracts punchy, high-impact clash points so any viewer can grasp
 * the exact contradiction at first sight (in 1.5 seconds) without reading dense text.
 */
function getClashMeta(conf) {
  if (conf?.clash_summary) {
    return {
      claimedAnchor: conf.clash_summary.claimed_anchor,
      provenAnchor: conf.clash_summary.proven_anchor,
      discrepancyDelta: conf.clash_summary.discrepancy_delta,
      takeaway: conf.clash_summary.takeaway,
      claimHighlight: conf.clash_summary.claim_highlight,
      proofHighlight: conf.clash_summary.proof_highlight,
    };
  }

  const title = (conf?.title || '').toLowerCase();
  const id = conf?.conflict_id || '';

  if (id.includes('001') || title.includes('departure') || title.includes('timestamp')) {
    return {
      claimedAnchor: 'Logged off completely and left office at 21:00 UTC',
      provenAnchor: 'Active SSH session authenticated at 21:14:22 UTC',
      discrepancyDelta: '⚡ +14 MINUTE UNACCOUNTED GAP',
      takeaway: 'Alice Chen swore she logged off at 21:00 UTC, yet gateway audit logs prove an active SSH terminal session 14 minutes later.',
      claimHighlight: '21:00 UTC',
      proofHighlight: '21:14:22',
    };
  }

  if (id.includes('002') || title.includes('database') || title.includes('access denial')) {
    return {
      claimedAnchor: 'Sworn denial of database touch or remote admin session',
      provenAnchor: 'PostgreSQL pg_dump query executed under session 184 (21:18)',
      discrepancyDelta: '⚡ SWORN DENIAL VS 8.4 MB AUDIT DUMP',
      takeaway: 'Sworn denial of database contact directly refuted by immutable PostgreSQL audit log recording a full table dump.',
      claimHighlight: 'did not touch the database',
      proofHighlight: 'SELECT pg_dump_table',
    };
  }

  if (id.includes('H01') || title.includes('cinema') || title.includes('alibi')) {
    return {
      claimedAnchor: 'Deposes continuous presence inside cinema 21:00-23:15 UTC',
      provenAnchor: 'ANPR Cam-04 logs personal SUV entering crime alley at 21:48:02 UTC',
      discrepancyDelta: '⚡ ALIBI DESTROYED BY SENSOR GRID',
      takeaway: 'Alibi refutation: Camera sensors record suspect vehicle at crime scene alley during claimed cinema movie.',
      claimHighlight: '21:00 until 23:15',
      proofHighlight: '21:48:02',
    };
  }

  if (id.includes('H02') || title.includes('trace') || title.includes('fiber')) {
    return {
      claimedAnchor: 'Autopsy recovers cobalt-blue nylon fibers under victim nails',
      provenAnchor: 'Suspect admitted driving Sapphire Blue SUV with matching interior',
      discrepancyDelta: '⚡ PHYSICAL STRUGGLE TRACE MATCH',
      takeaway: 'Defensive struggle nylon fibers recovered under victim fingernails match suspect vehicle interior.',
      claimHighlight: 'cobalt-blue synthetic nylon',
      proofHighlight: 'identical interior upholstery',
    };
  }

  return {
    claimedAnchor: conf?.claim_a?.statement?.slice(0, 90) + '...' || 'Primary assertion in evidence',
    provenAnchor: conf?.claim_b?.record?.slice(0, 90) + '...' || 'Contradictory machine record',
    discrepancyDelta: '⚡ IRRECONCILABLE CONTRADICTION',
    takeaway: conf?.forensic_verdict?.slice(0, 140) + '...' || 'Cross-source conflict requires judicial evaluation.',
    claimHighlight: '',
    proofHighlight: '',
  };
}

export default function ConflictRadarView({ currentUser, simulatedClearance, analysisVersion, activeTab }) {
  const [conflicts, setConflicts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(null);
  const [copiedVerdict, setCopiedVerdict] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL'); // 'ALL' | 'TEMPORAL' | 'FACTUAL'
  const [expandedVerbatim, setExpandedVerbatim] = useState({}); // { [id]: boolean }

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

  const handleCopy = (text, type = 'hash') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'hash') {
      setCopiedHash(text);
      setTimeout(() => setCopiedHash(null), 2000);
    } else {
      setCopiedVerdict(text);
      setTimeout(() => setCopiedVerdict(null), 2000);
    }
  };

  const toggleVerbatim = (id) => {
    setExpandedVerbatim((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const scrollToConflict = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filtered conflicts list
  const filteredConflicts = conflicts.filter((c) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'TEMPORAL') {
      return (c.category || '').toUpperCase().includes('TEMPORAL');
    }
    if (filterCategory === 'FACTUAL') {
      return !(c.category || '').toUpperCase().includes('TEMPORAL');
    }
    return true;
  });

  const temporalCount = conflicts.filter((c) => (c.category || '').toUpperCase().includes('TEMPORAL')).length;
  const factualCount = conflicts.length - temporalCount;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* ============================================================ */}
      {/* 1. TOP COMMAND HEADER                                         */}
      {/* ============================================================ */}
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
            Algorithmic cross-examination correlating subjective human witness depositions against immutable machine audit logs and sensor telemetry. Never silently resolves contradictions; surfaces all discrepancies for judicial evaluation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-mono font-bold flex items-center gap-2 shadow-sm">
            <AlertOctagon className="w-4 h-4" />
            <span>{conflicts.length} CRITICAL CONFLICTS</span>
          </div>

          <button
            type="button"
            onClick={fetchConflicts}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:border-slate-500 text-sm font-mono font-semibold text-slate-800 rounded-xl transition-all apple-press flex items-center gap-2 cursor-pointer shadow-xs hover:shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-Scan Evidence</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. RADAR HUD & QUICK JUMP FILTER BAR                        */}
      {/* ============================================================ */}
      <div className="bg-slate-900 rounded-2xl p-4 md:p-5 text-white shadow-md border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-rose-400" /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setFilterCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              filterCategory === 'ALL'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            All Contradictions ({conflicts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('TEMPORAL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              filterCategory === 'TEMPORAL'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            ⏱️ Temporal Anomaly ({temporalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('FACTUAL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              filterCategory === 'FACTUAL'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            🛡️ Factual Denial ({factualCount})
          </button>
        </div>

        {/* Right: Quick Jump Navigator */}
        {conflicts.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider shrink-0">
              Quick Jump:
            </span>
            {conflicts.map((c, i) => (
              <button
                key={c.conflict_id || i}
                type="button"
                onClick={() => scrollToConflict(c.conflict_id || `conf-${i}`)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all shrink-0 cursor-pointer"
              >
                {c.conflict_id || `CONF-${i + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. LOADING & EMPTY STATES                                     */}
      {/* ============================================================ */}
      {isLoading && conflicts.length === 0 && (
        <div className="py-24 text-center space-y-4 bg-white/80 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <p className="text-base font-mono font-bold uppercase tracking-widest text-slate-800">
              Cross-Examining Evidence with On-Prem Intelligence...
            </p>
            <p className="text-sm text-slate-500 font-mono">
              Juxtaposing timestamps, identity anchors, and machine telemetry
            </p>
          </div>
        </div>
      )}

      {!isLoading && conflicts.length === 0 && (
        <LiquidGlass variant="panel" className="p-16 text-center space-y-5 border-slate-200">
          <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 font-mono">
              No Contradictions Currently Surfaced
            </h3>
            <p className="text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
              The active case evidence has no detected discrepancies between witness depositions and machine logs. Execute On-Prem AI Intelligence in the Workspace if new evidence was uploaded.
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

      {/* ============================================================ */}
      {/* 4. REDESIGNED CONFLICT SHOWCASE CARDS                        */}
      {/* ============================================================ */}
      <div className="space-y-10">
        {filteredConflicts.map((conf, idx) => {
          const id = conf.conflict_id || `conf-${idx}`;
          const clash = getClashMeta(conf);
          const isVerbatimOpen = expandedVerbatim[id] ?? false;

          return (
            <div
              key={id}
              id={id}
              className="bg-white rounded-3xl border-2 border-rose-200 shadow-xl overflow-hidden transition-all hover:border-rose-300 scroll-mt-24"
            >
              {/* CARD TITLE & SEVERITY HEADER */}
              <div className="p-6 md:p-8 bg-gradient-to-r from-rose-50/80 via-white to-rose-50/40 border-b border-rose-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-sm font-black px-3 py-1 bg-rose-600 text-white rounded-lg shadow-2xs tracking-wide">
                      {conf.conflict_id}
                    </span>
                    <span className="font-mono text-xs font-extrabold px-3 py-1 bg-rose-100 text-rose-800 rounded-lg border border-rose-300">
                      {conf.category}
                    </span>
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 bg-slate-900 text-rose-300 rounded-lg">
                      SEVERITY: {conf.severity}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    {conf.title}
                  </h2>
                </div>

                {/* Big Discrepancy Highlight Pill */}
                <div className="shrink-0">
                  <div className="px-5 py-3 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 text-white font-mono text-sm md:text-base font-black shadow-md flex items-center gap-2 border border-rose-400">
                    <Zap className="w-5 h-5 text-amber-300 animate-bounce" />
                    <span>{clash.discrepancyDelta}</span>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* ⚡ HERO SHOWDOWN CLASH ARENA (Visible in 1.5 Seconds)     */}
              {/* ======================================================== */}
              <div className="p-6 md:p-8 bg-slate-950 text-white relative overflow-hidden">
                {/* Ambient glow in background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Eyebrow strip */}
                <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-400 pb-4 mb-6 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertOctagon className="w-4 h-4" />
                    <span>DIRECT EVIDENCE CLASH • AT-A-GLANCE SHOWDOWN</span>
                  </div>
                  <span className="text-slate-500 hidden sm:inline">
                    IRRECONCILABLE CONTRADICTION DETECTED
                  </span>
                </div>

                {/* 3-Column Collision Grid: [ Claimed ] vs [ VS Pill ] vs [ Proven ] */}
                <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center relative z-10">
                  {/* LEFT COCKPIT: WHAT WAS CLAIMED (Human Testimony) */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-900/90 rounded-2xl p-5 md:p-6 border-2 border-emerald-500/40 shadow-inner space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                        <UserCheck className="w-4 h-4" />
                        <span>CLAIM A: WITNESS TESTIMONY</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {conf.claim_a.classification}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-bold text-slate-200">
                        {conf.claim_a.speaker}
                      </div>
                      <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Stated Time: <strong className="text-emerald-300">{conf.claim_a.claimed_time}</strong></span>
                      </div>
                    </div>

                    {/* HERO CLAIM ASSERTION (Huge 20-22px font) */}
                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 font-serif text-lg md:text-xl font-bold leading-snug">
                      "{clash.claimedAnchor}"
                    </div>

                    <div className="text-xs font-mono text-slate-400 flex items-center justify-between pt-1">
                      <span className="truncate max-w-[200px]" title={conf.claim_a.source_file}>
                        📄 {conf.claim_a.source_file}
                      </span>
                      <span className="text-slate-500">HUMAN DEPOSITION</span>
                    </div>
                  </div>

                  {/* CENTER COLLISION PILL: THE VS LIGHTNING BRIDGE */}
                  <div className="lg:col-span-1 flex flex-col items-center justify-center my-2 lg:my-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center font-black text-xl shadow-[0_0_35px_rgba(225,29,72,0.6)] border-2 border-rose-300 animate-pulse shrink-0">
                      VS
                    </div>
                    <div className="mt-2 text-center hidden lg:block">
                      <span className="text-[10px] font-mono font-black text-rose-400 uppercase tracking-widest block">
                        CLASH
                      </span>
                    </div>
                  </div>

                  {/* RIGHT COCKPIT: WHAT WAS PROVEN (Immutable Machine Audit) */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-900/90 rounded-2xl p-5 md:p-6 border-2 border-rose-500/40 shadow-inner space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-wider text-rose-400">
                        <Terminal className="w-4 h-4" />
                        <span>CLAIM B: IMMUTABLE AUDIT LOG</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        {conf.claim_b.classification}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-bold text-slate-200">
                        {conf.claim_b.speaker}
                      </div>
                      <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Audit Time: <strong className="text-rose-300">{conf.claim_b.recorded_time}</strong></span>
                      </div>
                    </div>

                    {/* HERO PROVEN AUDIT (Huge 20-22px font) */}
                    <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 font-mono text-base md:text-lg font-bold leading-snug">
                      {clash.provenAnchor}
                    </div>

                    <div className="text-xs font-mono text-slate-400 flex items-center justify-between pt-1">
                      <span className="truncate max-w-[200px]" title={conf.claim_b.source_file}>
                        🖥️ {conf.claim_b.source_file}
                      </span>
                      <span className="text-rose-400 font-bold">VERIFIED SYSLOG</span>
                    </div>
                  </div>
                </div>

                {/* THE UNMISSABLE EXECUTIVE BOTTOM-LINE RIBBON */}
                <div className="mt-7 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 border-2 border-rose-500/60 flex items-start sm:items-center gap-4 shadow-lg">
                  <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 shadow-xs">
                    <AlertOctagon className="w-6 h-6" />
                  </div>
                  <div className="text-sm md:text-base text-rose-100 font-sans leading-relaxed">
                    <span className="font-mono font-black text-rose-300 uppercase tracking-wider mr-2 text-xs md:text-sm">
                      💥 DIRECT CONTRADICTION:
                    </span>
                    <strong className="text-white font-semibold">{clash.takeaway}</strong>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* 5. FORENSIC VERDICT & INVESTIGATIVE DIRECTIVE            */}
              {/* ======================================================== */}
              <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-200 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Forensic Cross-Examination Verdict */}
                  <div className="p-5 md:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm md:text-base font-extrabold text-slate-900 font-mono uppercase tracking-wider">
                        <Scale className="w-5 h-5 text-blue-600 shrink-0" />
                        <span>Judicial Cross-Examination Verdict</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(conf.forensic_verdict, 'verdict')}
                        className="text-xs font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                        title="Copy Verdict Text"
                      >
                        {copiedVerdict === conf.forensic_verdict ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span>
                        ) : (
                          <span className="flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Copy</span>
                        )}
                      </button>
                    </div>

                    <p className="text-sm md:text-base text-slate-800 leading-relaxed">
                      {conf.forensic_verdict}
                    </p>
                  </div>

                  {/* Right: Mandated Investigative Action */}
                  <div className="p-5 md:p-6 bg-blue-50/70 rounded-2xl border border-blue-200 text-blue-950 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-sm md:text-base font-extrabold text-blue-900 font-mono uppercase tracking-wider">
                      <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0" />
                      <span>Mandated Investigative Action</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/90 border border-blue-200 text-sm md:text-base text-slate-900 font-medium leading-relaxed">
                      {conf.investigator_action}
                    </div>

                    <div className="text-xs font-mono text-blue-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <span>Actionable directive generated for investigating officer</span>
                    </div>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* 6. VERBATIM SOURCE RECORDS & CRYPTOGRAPHIC PROVENANCE     */}
                {/* ======================================================== */}
                <div className="pt-2 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => toggleVerbatim(id)}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs md:text-sm font-mono font-bold flex items-center justify-between cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-slate-600" />
                      <span>
                        {isVerbatimOpen ? 'Hide' : 'Inspect'} Verbatim Raw Evidence & SHA-256 Provenance Hashes
                      </span>
                    </div>
                    {isVerbatimOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-600" />
                    )}
                  </button>

                  {/* Expanded Verbatim Area */}
                  {isVerbatimOpen && (
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
                      {/* Left: Verbatim Witness Statement */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-xs font-mono font-bold text-slate-700">
                            FULL WITNESS EXCERPT
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            Source: {conf.claim_a.source_file}
                          </span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-emerald-500 text-slate-800 font-serif italic text-sm md:text-base leading-relaxed">
                          "{conf.claim_a.statement}"
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-500">
                          <span className="truncate max-w-[240px]" title={conf.claim_a.sha256}>
                            SHA-256: {conf.claim_a.sha256}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(conf.claim_a.sha256, 'hash')}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 cursor-pointer flex items-center gap-1"
                            title="Copy SHA-256 Hash"
                          >
                            {copiedHash === conf.claim_a.sha256 ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Right: Verbatim Raw Machine Syslog */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-xs font-mono font-bold text-slate-700">
                            RAW TELEMETRY / MACHINE SYSLOG
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            Source: {conf.claim_b.source_file}
                          </span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900 text-rose-200 border border-slate-800 font-mono text-xs md:text-sm leading-relaxed break-words font-medium">
                          {conf.claim_b.record}
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-500">
                          <span className="truncate max-w-[240px]" title={conf.claim_b.sha256}>
                            SHA-256: {conf.claim_b.sha256}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(conf.claim_b.sha256, 'hash')}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 cursor-pointer flex items-center gap-1"
                            title="Copy SHA-256 Hash"
                          >
                            {copiedHash === conf.claim_b.sha256 ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

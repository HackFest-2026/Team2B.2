import React, { useState, useEffect } from 'react';
import LiquidGlass from './ui/LiquidGlass';
import {
  Layers,
  Clock,
  User,
  Server,
  Hash,
  AlertTriangle,
  CheckCircle2,
  Play,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function WorkspaceView({ currentUser, simulatedClearance, onAnalysisRan, analysisVersion, activeTab }) {
  const [timeline, setTimeline] = useState([]);
  const [entities, setEntities] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const token = localStorage.getItem('verion_token');

  const fetchWorkspaceData = async () => {
    try {
      setIsLoading(true);
      const [tlRes, entRes] = await Promise.all([
        fetch(`/api/analysis/timeline?simulate_clearance=${simulatedClearance}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/analysis/entities?simulate_clearance=${simulatedClearance}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (tlRes.ok) {
        const tlData = await tlRes.json();
        setTimeline(tlData.events || []);
      }
      if (entRes.ok) {
        const entData = await entRes.json();
        setEntities(entData);
      }
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [simulatedClearance, analysisVersion]);

  useEffect(() => {
    if (activeTab === 'workspace' && timeline.length === 0 && !isLoading) {
      fetchWorkspaceData();
    }
  }, [activeTab]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(`/api/analysis/run?simulate_clearance=${simulatedClearance}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchWorkspaceData();
        if (onAnalysisRan) {
          onAnalysisRan();
        }
      }
    } catch (err) {
      console.error('Analysis trigger failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredEvents = timeline.filter(evt => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CONFLICTS') return evt.conflict_anchor;
    return evt.source_type === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
            <span>Unified Investigation Workspace</span> • <span>Stage 2 & 3</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Chronological Incident Timeline & Entity Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Correlates witness statements, official response records, and machine syslogs into a single sequence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchWorkspaceData}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-400 text-xs font-mono font-semibold text-slate-700 transition-colors apple-press flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            type="button"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-semibold transition-colors apple-press flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Play className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-pulse' : ''}`} /> Run AI Extraction
          </button>
        </div>
      </div>

      {/* Cross-Source Resolved Entity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Actors */}
        <LiquidGlass variant="card" className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100 pb-2">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" /> Resolved Actors
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
              {entities?.total_actors || 0}
            </span>
          </div>
          <div className="space-y-2">
            {entities?.actors?.map((actor, idx) => (
              <div key={idx} className="p-2 bg-slate-50/80 border border-slate-100 rounded-lg text-xs space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>{actor.name}</span>
                  <span className="text-[9px] font-mono text-slate-400 font-semibold">{actor.type}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Aliases: {actor.aliases?.join(', ')} • Mentions: {actor.mentions_count}
                </div>
              </div>
            ))}
          </div>
        </LiquidGlass>

        {/* Systems */}
        <LiquidGlass variant="card" className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100 pb-2">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-600" /> Target Systems
            </span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
              {entities?.total_systems || 0}
            </span>
          </div>
          <div className="space-y-2">
            {entities?.systems?.map((sys, idx) => (
              <div key={idx} className="p-2 bg-slate-50/80 border border-slate-100 rounded-lg text-xs space-y-0.5">
                <div className="font-bold text-slate-900 font-mono">{sys.hostname}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Role: {sys.type} • Linked Chunks: {sys.source_chunks?.length}
                </div>
              </div>
            ))}
          </div>
        </LiquidGlass>

        {/* IP Subnets (with dynamic clearance masking) */}
        <LiquidGlass variant="card" className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100 pb-2">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-emerald-600" /> IP Infrastructure
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
              {entities?.total_ips || 0}
            </span>
          </div>
          <div className="space-y-2">
            {entities?.ip_addresses?.map((ip, idx) => (
              <div key={idx} className="p-2 bg-slate-50/80 border border-slate-100 rounded-lg text-xs space-y-0.5">
                <div className="font-bold text-slate-900 font-mono flex items-center justify-between">
                  <span>{ip.address}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${ip.classification === 'LEVEL_2' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {ip.classification}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {ip.is_internal ? 'Internal Datacenter Subnet' : 'External / Gateway VPN'}
                </div>
              </div>
            ))}
          </div>
        </LiquidGlass>
      </div>

      {/* Unified Chronological Event Timeline */}
      <LiquidGlass variant="panel" className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Unified Chronological Sequence
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reconciled across reports, witness depositions, and network syslogs in strict chronological order.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {['ALL', 'CONFLICTS', 'SYSLOG', 'TRANSCRIPT', 'PDF'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1 rounded-md border font-semibold transition-all apple-press cursor-pointer ${
                  activeFilter === tab
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {tab === 'CONFLICTS' ? '⚠️ Discrepancies Only' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Event Cards */}
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 before:z-0">
          {filteredEvents.map((evt, idx) => (
            <div
              key={evt.event_id || idx}
              className={`relative z-10 pl-10 transition-all ${
                evt.conflict_anchor ? 'scale-[1.01]' : ''
              }`}
            >
              {/* Timeline dot */}
              <div
                className={`absolute left-2.5 top-3.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                  evt.conflict_anchor
                    ? 'bg-rose-600 ring-4 ring-rose-100'
                    : evt.source_type === 'SYSLOG'
                    ? 'bg-blue-600'
                    : evt.source_type === 'TRANSCRIPT'
                    ? 'bg-emerald-600'
                    : 'bg-slate-600'
                }`}
              />

              <div
                className={`p-4 rounded-xl border transition-all ${
                  evt.conflict_anchor
                    ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                    : 'bg-white/90 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs md:text-sm font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      {evt.display_time}
                    </span>
                    <span className="font-bold text-base text-slate-900">{evt.title}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    {evt.conflict_anchor && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-xs flex items-center gap-1 border border-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> CONFLICT ANCHOR
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-600 uppercase px-2.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-semibold">
                      {evt.source_type}
                    </span>
                  </div>
                </div>

                <p className="text-sm md:text-base text-slate-800 leading-relaxed font-sans mb-3">
                  {evt.description}
                </p>

                <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-2 border-t border-slate-100">
                  <span className="text-slate-600">
                    Source: <strong className="text-slate-800">{evt.source_file}</strong> • Anchor: <strong className="text-blue-700">{evt.chunk_id}</strong>
                  </span>
                  <span className="truncate max-w-[200px] flex items-center gap-1">
                    <Hash className="w-2.5 h-2.5 text-slate-400" /> {evt.sha256}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </LiquidGlass>
    </div>
  );
}

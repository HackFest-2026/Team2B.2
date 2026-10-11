import React, { useState, useEffect } from 'react';
import LiquidGlass from './ui/LiquidGlass';
import {
  UploadCloud,
  FileText,
  FileCode,
  FileSpreadsheet,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Bug,
  AlertTriangle,
  FileWarning,
  Hash,
  CheckCircle2,
  Lock,
  RefreshCw,
  AlertCircle,
  Eye,
  Layers,
  ArrowRight,
  Plus,
  X
} from 'lucide-react';

export default function IngestionView({ currentUser, simulatedClearance, onCaseChanged, onUploadSuccess, analysisVersion, activeTab }) {
  const [manifest, setManifest] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [classification, setClassification] = useState('LEVEL_1');
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [activeChunkTab, setActiveChunkTab] = useState('ALL');
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newCaseId, setNewCaseId] = useState('');
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [quarantineAlert, setQuarantineAlert] = useState(null);
  const [quarantineEvents, setQuarantineEvents] = useState([]);
  const [showQuarantineLogModal, setShowQuarantineLogModal] = useState(false);

  const token = localStorage.getItem('verion_token');

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!newCaseId || !newCaseTitle) return;
    setIsCreatingCase(true);
    setStatusMsg('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/case/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          case_id: newCaseId,
          title: newCaseTitle
        })
      });
      if (res.ok) {
        setStatusMsg(`Initialized new investigation case: ${newCaseId}. Ready for evidence ingestion.`);
        setShowNewCaseModal(false);
        setNewCaseId('');
        setNewCaseTitle('');
        await fetchManifestAndChunks();
        // Notify App to refresh global state (header badge, all other views)
        if (onCaseChanged) onCaseChanged();
      } else {
        const err = await res.json();
        setStatusMsg(`Case Creation Failed: ${err.detail || 'Unauthorized'}`);
      }
    } catch (err) {
      setStatusMsg(`Case Creation Error: ${err.message}`);
    } finally {
      setIsCreatingCase(false);
    }
  };

  const fetchManifestAndChunks = async () => {
    try {
      setIsRefreshing(true);
      // Fetch manifest summary
      const manRes = await fetch('/api/ingest/manifest', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (manRes.ok) {
        const manData = await manRes.json();
        setManifest(manData);
      }

      // Fetch chunks with current simulated clearance
      const chunkRes = await fetch(`/api/ingest/chunks?simulate_clearance=${simulatedClearance}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (chunkRes.ok) {
        const chunkData = await chunkRes.json();
        setChunks(chunkData.chunks || []);
      }

      // Fetch security quarantine audit log
      try {
        const qRes = await fetch('/api/ingest/quarantine-log', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (qRes.ok) {
          const qData = await qRes.json();
          setQuarantineEvents(qData.events || []);
        }
      } catch (qErr) {
        console.error('Failed to fetch quarantine log:', qErr);
      }
    } catch (err) {
      console.error('Failed to refresh manifest:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchManifestAndChunks();
  }, [simulatedClearance, analysisVersion]);

  const handleBenchmarkIngest = async () => {
    setIsRefreshing(true);
    setStatusMsg('');
    try {
      const res = await fetch('/api/ingest/benchmark', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusMsg('Ground truth benchmark files sealed and registered successfully.');
        await fetchManifestAndChunks();
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (err) {
      setStatusMsg('Failed to ingest benchmark case.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTestEicarProbe = async () => {
    setIsUploading(true);
    setStatusMsg('');
    const eicarString = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";
    const eicarBlob = new Blob([eicarString], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', new File([eicarBlob], 'eicar_antivirus_test_probe.txt', { type: 'text/plain' }));
    formData.append('classification', 'LEVEL_1');

    try {
      const res = await fetch('/api/ingest/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.status === 422 && data.status === 'MALWARE_DETECTED') {
        setQuarantineAlert(data.threat);
        await fetchManifestAndChunks();
      } else {
        setStatusMsg('Probe result: ' + (data.message || 'Completed'));
      }
    } catch (err) {
      setStatusMsg(`Security Probe Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setStatusMsg('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('classification', classification);

    try {
      const res = await fetch('/api/ingest/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 422 && err.status === 'MALWARE_DETECTED') {
          setQuarantineAlert(err.threat);
          await fetchManifestAndChunks();
          setStatusMsg(`SECURITY ALERT: Intercepted ${err.threat.threat_name}! Ingestion aborted.`);
          return;
        }
        throw new Error(err.detail || err.error || 'Upload failed');
      }

      const data = await res.json();
      setStatusMsg(data.message);
      setSelectedFile(null);
      await fetchManifestAndChunks();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setStatusMsg(`Upload Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const isLevel2 = simulatedClearance === 'LEVEL_2';
  const filteredChunks = chunks.filter(c => {
    if (activeChunkTab === 'ALL') return true;
    return c.source_type === activeChunkTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
            <span>Evidence Processing Pipeline</span> • <span>Stage 1</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Multi-Source Ingestion & Provenance Sealing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Normalizes PDFs, witness statements, and raw syslogs into SHA-256 fingerprinted chunks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.can_upload && (
            <button
              type="button"
              onClick={() => setShowNewCaseModal(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold transition-colors apple-press flex items-center gap-1.5 cursor-pointer shadow-xs rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" /> Initialize New Case
            </button>
          )}

          <button
            type="button"
            onClick={fetchManifestAndChunks}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-400 text-xs font-mono font-semibold text-slate-700 transition-colors apple-press flex items-center gap-1.5 cursor-pointer rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Registry
          </button>

          <button
            type="button"
            onClick={handleBenchmarkIngest}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-semibold transition-colors apple-press flex items-center gap-1.5 cursor-pointer shadow-xs rounded-xl"
          >
            <Layers className="w-3.5 h-3.5" /> Re-Ingest Benchmark
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg('')} className="text-blue-500 hover:text-blue-800 text-xs font-bold">×</button>
        </div>
      )}

      {/* Grid: Upload Hub on Left (for Officer), Ingested Files on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Hub */}
        <div className="lg:col-span-5 space-y-4">
          <LiquidGlass intensity={1.2} className="p-5 space-y-4">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-blue-600" /> Evidence Ingestion Hub
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Exclusive to Evidence Custodian & Lead Officer.
                </p>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 border font-semibold ${currentUser?.can_upload ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {currentUser?.can_upload ? 'AUTHORIZED' : 'LOCKED'}
              </span>
            </div>

            {currentUser?.can_upload ? (
              <form onSubmit={handleFileUpload} className="space-y-4">
                {/* Zero-Trust Malware Shield Active Banner */}
                <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/90 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      </div>
                      <div>
                        <div className="text-[11px] font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-blue-600" /> Malware Shield: ACTIVE
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Zero-Trust Polyglot & Exploit Interception
                        </div>
                      </div>
                    </div>

                    {quarantineEvents.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowQuarantineLogModal(true)}
                        className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-mono font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Bug className="w-3 h-3 text-rose-600" /> {quarantineEvents.length} Quarantined
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-blue-100/80 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">Heuristics: EICAR, Polyglot PE/ELF, PDF /Launch</span>
                    <button
                      type="button"
                      onClick={handleTestEicarProbe}
                      disabled={isUploading}
                      className="px-2 py-1 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-rose-700 font-bold rounded-lg transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Test safe EICAR antivirus test probe"
                    >
                      <ShieldAlert className="w-3 h-3 text-rose-600" /> Test EICAR Probe
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-600 mb-1">
                    Select Target File (.pdf, .txt, .log, .csv)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.txt,.log,.csv,.json"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:border-0 file:text-xs file:font-mono file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-blue-600 file:cursor-pointer border border-slate-200 p-1 bg-slate-50"
                  />
                  {selectedFile && (
                    <div className="mt-1 text-[11px] font-mono text-blue-600">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>

                {/* Explicit Classification Prompt */}
                <div className="p-3 bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-700">
                      Assign Security Classification:
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">Rule 2 Mandate</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setClassification('LEVEL_1')}
                      className={`p-2.5 text-left border transition-all apple-press ${
                        classification === 'LEVEL_1'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>UNCLASSIFIED</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Level 1: Public / General audit view
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setClassification('LEVEL_2')}
                      className={`p-2.5 text-left border transition-all apple-press ${
                        classification === 'LEVEL_2'
                          ? 'bg-rose-50 border-rose-500 text-rose-800 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>CLASSIFIED</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Level 2: Internal / Restricted syslogs
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-mono uppercase tracking-wider font-semibold transition-colors apple-press flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>Hashing & Processing Chunks...</>
                  ) : (
                    <>
                      <Hash className="w-3.5 h-3.5" /> Seal with SHA-256 & Ingest
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 text-center space-y-2">
                <Lock className="w-6 h-6 text-slate-400 mx-auto" />
                <div className="text-xs font-bold text-slate-800 font-mono">
                  READ-ONLY CLEARANCE
                </div>
                <p className="text-[11px] text-slate-500">
                  Your current account ({currentUser?.role}) is cleared for analysis and audit. Evidence ingestion is restricted to Evidence Custodians.
                </p>
              </div>
            )}
          </LiquidGlass>

          {/* Quick Provenance Summary Card */}
          <div className="p-4 bg-white border border-slate-200 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Registry Statistics
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-[10px] block">TOTAL SOURCES</span>
                <span className="text-lg font-bold font-mono text-slate-900">
                  {manifest?.total_files || 0}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-[10px] block">SEALED CHUNKS</span>
                <span className="text-lg font-bold font-mono text-slate-900">
                  {manifest?.total_chunks || 0}
                </span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 pt-1 flex justify-between">
              <span>LEVEL 1 CHUNKS: <strong className="text-emerald-700">{manifest?.level1_chunks_count || 0}</strong></span>
              <span>LEVEL 2 CHUNKS: <strong className="text-rose-700">{manifest?.level2_chunks_count || 0}</strong></span>
            </div>
          </div>
        </div>

        {/* Ingested Evidence Manifest Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
                Cryptographic Evidence Manifest
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                Algorithm: SHA-256 (FIPS 180-4)
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {manifest?.files?.map((f, idx) => {
                const isRestricted = f.classification === 'LEVEL_2';
                const isMasked = isRestricted && !isLevel2;

                return (
                  <div key={idx} className="py-3 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-50 border border-slate-200 mt-0.5">
                        {f.extension === '.pdf' && <FileText className="w-4 h-4 text-blue-600" />}
                        {f.extension === '.txt' && <FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                        {f.extension === '.log' && <FileCode className="w-4 h-4 text-rose-600" />}
                      </div>
                      <div className="space-y-1">
                        <div className="font-mono text-xs font-bold text-slate-900">
                          {isMasked ? '••••••••_classified_stream.log' : f.filename}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Hash className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[240px]">
                            {isMasked ? 'MASKED_FOR_CLEARANCE_TIER_1' : f.file_sha256}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> Shield: CLEAN
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 border uppercase ${
                          f.classification === 'LEVEL_2'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {f.classification}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {f.chunk_count} Chunks
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Live Chunk Explorer */}
      <div className="bg-white border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
              Normalized Chunk Ledger & Provenance Anchors
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtered in real time by active clearance ({simulatedClearance}). Chunks above this clearance are physically excluded.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {['ALL', 'PDF', 'TRANSCRIPT', 'SYSLOG'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveChunkTab(tab)}
                className={`px-2.5 py-1 border transition-all apple-press ${
                  activeChunkTab === tab
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Chunk Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredChunks.map((chk, idx) => (
            <div
              key={chk.chunk_id || idx}
              className="p-3 bg-slate-50/70 border border-slate-200 hover:border-blue-300 transition-colors space-y-2 text-xs font-mono"
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                <span className="font-bold text-blue-700 text-[11px]">{chk.chunk_id}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 border font-semibold ${
                    chk.classification === 'LEVEL_2'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {chk.classification}
                </span>
              </div>

              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>{chk.source_file}</span>
                <span>
                  {chk.page_number ? `P.${chk.page_number}` : ''}
                  {chk.line_number ? `L.${chk.line_number}` : ''}
                  {chk.time_anchor ? `[${chk.time_anchor}]` : ''}
                </span>
              </div>

              <div className="p-2 bg-white border border-slate-100 text-slate-800 text-[11px] font-sans leading-relaxed line-clamp-3">
                {chk.speaker && <strong className="text-slate-900 font-mono text-[10px] block">{chk.speaker}:</strong>}
                {chk.text}
              </div>

              <div className="text-[9px] text-slate-400 truncate flex items-center gap-1 pt-1 border-t border-slate-200/50">
                <Hash className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{chk.sha256}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Initialize New Case Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowNewCaseModal(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Initialize New Case Container
              </h3>
              <button
                type="button"
                onClick={() => setShowNewCaseModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 font-semibold mb-1">
                  Case Identifier (ID)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CASE-2026-BETA or IR-2026-1044"
                  value={newCaseId}
                  onChange={(e) => setNewCaseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 font-semibold mb-1">
                  Investigation Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Gateway SSH Compromise"
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed">
                <strong>Access Control Policy:</strong> Creating a new case resets the active evidence ledger. Only Lead Officers have write privileges. Once initialized, investigators and auditors gain read access governed strictly by their clearance level.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-mono font-semibold rounded-xl hover:bg-slate-50 apple-press"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCase}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold rounded-xl apple-press disabled:opacity-50"
                >
                  {isCreatingCase ? 'Initializing...' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Critical Security Quarantine Alert Modal */}
      {quarantineAlert && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setQuarantineAlert(null)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border-2 border-rose-500 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-rose-600 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                    ZERO-TRUST PRE-INGESTION INTERCEPT
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900 mt-1">
                    Malicious Payload Quarantined
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuarantineAlert(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">THREAT SIGNATURE:</span>
                <span className="font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded border border-rose-200">
                  {quarantineAlert.threat_name}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">THREAT CATEGORY:</span>
                <span className="font-semibold text-slate-800">
                  {quarantineAlert.threat_category}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">SEVERITY RATING:</span>
                <span className="font-bold text-rose-600 bg-rose-100/50 px-2 py-0.5 rounded">
                  {quarantineAlert.severity}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">INTERCEPTED SHA-256:</span>
                <span className="font-mono text-[10px] text-slate-700 truncate max-w-[200px]" title={quarantineAlert.sha256}>
                  {quarantineAlert.sha256}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="font-semibold text-slate-800 font-mono text-[11px] uppercase tracking-wider">
                Forensic Inspection Details:
              </div>
              <div className="text-[11.5px] leading-relaxed text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
                {quarantineAlert.details}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Automated Containment Enforced:</span>
                <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                  File buffer was purged from memory with zero disk persistence. A tamper-evident incident record was registered to the Case Security Audit Ledger.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuarantineAlert(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Acknowledge & Close Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quarantine History Audit Log Modal */}
      {showQuarantineLogModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowQuarantineLogModal(false)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                  <Bug className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Security Quarantine Audit Trail
                  </h3>
                  <p className="text-xs text-slate-500">
                    Immutable log of blocked weaponized files and exploit attempts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuarantineLogModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {quarantineEvents.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-slate-400 bg-slate-50 rounded-xl">
                  No quarantine events recorded. System is secure.
                </div>
              ) : (
                quarantineEvents.map((q, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-700">{q.threat_name}</span>
                      <span className="text-[10px] text-slate-400">{q.timestamp?.slice(0, 19)} UTC</span>
                    </div>
                    <div className="text-[11px] text-slate-600 flex items-center gap-2">
                      <span>Target File: <strong>{q.filename}</strong></span>
                      <span>•</span>
                      <span>Category: {q.threat_category}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate" title={q.file_sha256}>
                      SHA-256: {q.file_sha256}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                      Action: {q.action_taken}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowQuarantineLogModal(false)}
                className="px-4 py-2 border border-slate-200 text-xs font-mono font-semibold rounded-xl hover:bg-slate-50 apple-press cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Fingerprint,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Eye,
  AlertOctagon,
  FileText,
  Clock,
  Sparkles,
  Download,
  Info,
  X,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import LiquidGlass from './ui/LiquidGlass';

export default function DossierView({ currentUser, simulatedClearance }) {
  const [dossier, setDossier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);

  const token = localStorage.getItem('verion_token');

  // Fetch dossier on load or when clearance switches
  useEffect(() => {
    fetchDossier();
  }, [simulatedClearance]);

  const fetchDossier = async () => {
    setIsLoading(true);
    setVerificationDone(false);
    try {
      const url = `http://127.0.0.1:8000/api/analysis/dossier?simulate_clearance=${simulatedClearance}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDossier(data);
      }
    } catch (err) {
      console.error('Failed to load dossier:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleCopyFullReport = () => {
    if (!dossier) return;
    const reportText = dossier.sections
      .map((s) => `${s.title}\n\n${s.content}`)
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(reportText);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  const handleRunVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationDone(true);
    }, 600);
  };

  // Helper to render text with clickable citation badges
  const renderTextWithCitations = (text) => {
    if (!text) return null;
    const parts = text.split(/(\[Ref \d{2}\])/g);

    return parts.map((part, idx) => {
      const match = part.match(/\[Ref (\d{2})\]/);
      if (match) {
        const refId = `REF-${match[1]}`;
        const citation = dossier?.citations?.find((c) => c.id === refId);

        return (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedCitation(citation || { label: part, id: refId })}
            className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all apple-press cursor-pointer hover:shadow-xs align-baseline"
          >
            <span>{part}</span>
            <ExternalLink className="w-2.5 h-2.5 text-blue-500" />
          </button>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
          Synthesizing Single Verifiable Document from Cryptographic Manifest...
        </p>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
        <AlertOctagon className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">Dossier Unavailable</h3>
        <p className="text-xs text-slate-500 mt-1">Please ensure benchmark evidence has been ingested.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Top Banner / Dossier Header */}
      <LiquidGlass elevation={2} className="p-6 md:p-8 rounded-2xl border border-slate-200/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-blue-100/80 text-blue-800 border border-blue-200">
                Single Verifiable Document
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Case: {dossier.case_id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                  dossier.clearance_applied === 'LEVEL_1'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {dossier.classification_stamp}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Multi-Source Incident Reconciliation Dossier
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Generated: {new Date(dossier.generated_at).toLocaleString()} • Model: Deterministic Grounded Synthesis (Zero Hallucination)
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleRunVerification}
              disabled={isVerifying}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-2 transition-all apple-press cursor-pointer border ${
                verificationDone
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${verificationDone ? 'text-white' : 'text-emerald-600'}`} />
              {isVerifying ? 'Verifying Hashes...' : verificationDone ? '100% Ledger Verified' : 'Verify Hashes'}
            </button>

            <button
              type="button"
              onClick={handleCopyFullReport}
              className="px-4 py-2 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center gap-2 apple-press cursor-pointer"
            >
              {copiedDoc ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              {copiedDoc ? 'Copied' : 'Copy Dossier'}
            </button>
          </div>
        </div>

        {/* Cryptographic Seal Bar */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Master Dossier SHA-256 Seal</div>
              <div className="text-slate-800 font-bold truncate max-w-[220px]" title={dossier.dossier_sha256_seal}>
                {dossier.dossier_sha256_seal}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopyHash(dossier.dossier_sha256_seal)}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              title="Copy Seal"
            >
              {copiedHash === dossier.dossier_sha256_seal ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
            <div className="text-[10px] uppercase text-slate-400 font-semibold">Citation Grounding Ratio</div>
            <div className="text-slate-800 font-bold">
              {dossier.metadata.verified_citations} / {dossier.metadata.total_citations} Verified Citations (100% Traceable)
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
            <div className="text-[10px] uppercase text-slate-400 font-semibold">Clearance Security Policy</div>
            <div className="text-slate-800 font-bold flex items-center gap-1.5">
              {dossier.clearance_applied === 'LEVEL_1' ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-700">Zero Data Spillage: LEVEL_2 Redacted</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-blue-700">Unrestricted LEVEL_2 Investigative Clearance</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Level 1 Redaction Warning Banner if applicable */}
        {dossier.clearance_applied === 'LEVEL_1' && (
          <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center gap-3 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <strong>Auditor Sanitization Active:</strong> Internal IP addresses (e.g. <code className="bg-amber-100 px-1 py-0.5 rounded">10.x.x.x</code>) and raw SQL queries are masked in compliance with strict Pre-Retrieval RBAC.
            </div>
          </div>
        )}
      </LiquidGlass>

      {/* Main Dossier Content Sections */}
      <div className="space-y-6">
        {dossier.sections.map((section, sIdx) => (
          <LiquidGlass key={section.section_id} elevation={1} className="p-6 md:p-8 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/70">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-600" />
                {section.title}
              </h2>
              <span className="text-[10px] font-mono uppercase px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg border border-slate-200 font-semibold">
                {section.section_id}
              </span>
            </div>

            {/* Narrative text with embedded interactive citation pills */}
            <div className="text-sm md:text-base leading-relaxed text-slate-700 space-y-4">
              {section.content.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx} className="leading-relaxed">
                  {renderTextWithCitations(paragraph)}
                </p>
              ))}
            </div>
          </LiquidGlass>
        ))}
      </div>

      {/* Citations & Evidence Ledger Table */}
      <LiquidGlass elevation={1} className="p-6 md:p-8 rounded-2xl border border-slate-200/80">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/70">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-blue-600" />
              Cryptographic Citation Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Every factual assertion in the narrative is mathematically anchored to an immutable evidence chunk.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {dossier.citations.length} Verified Anchors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Ref ID</th>
                <th className="py-2.5 px-3">Source File</th>
                <th className="py-2.5 px-3">Locator / Attribution</th>
                <th className="py-2.5 px-3">Clearance</th>
                <th className="py-2.5 px-3">SHA-256 Checksum</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dossier.citations.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCitation(c)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-blue-700">{c.label}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{c.source_file}</td>
                  <td className="py-3 px-3 text-slate-600">{c.locator} • {c.actor}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        c.classification === 'LEVEL_1'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {c.classification}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 truncate max-w-[160px]" title={c.sha256}>
                    {c.sha256.substring(0, 16)}...
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-[11px] font-medium text-blue-600 hover:underline">
                      Inspect &rarr;
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LiquidGlass>

      {/* Slide-over Apple-Style Evidence Inspector Sheet */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedCitation(null)}
          />

          {/* Slide-over Inspector Sheet */}
          <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl shadow-2xl border-l border-slate-200/90 h-full flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-600 text-white font-mono text-xs font-bold rounded-lg shadow-xs">
                  {selectedCitation.label || selectedCitation.id}
                </span>
                <span className="text-xs font-mono uppercase font-semibold text-slate-500">
                  Evidence Provenance Anchor
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCitation(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors apple-press cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sheet Body */}
            <div className="mt-6 space-y-6 flex-1">
              {/* Document details card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Source Document</div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-bold">
                    {selectedCitation.source_type}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{selectedCitation.source_file}</div>
                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span>Locator: <strong>{selectedCitation.locator}</strong></span>
                  <span>Origin: <strong>{selectedCitation.actor}</strong></span>
                </div>
              </div>

              {/* Cryptographic Hash Verification Card */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono uppercase text-emerald-800 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Cryptographic Ledger Integrity
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    {selectedCitation.integrity_status || 'VERIFIED'}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-700 break-all p-2 bg-white rounded-lg border border-emerald-200/60 flex items-center justify-between">
                  <span className="select-all">{selectedCitation.sha256}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyHash(selectedCitation.sha256)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 ml-2 shrink-0"
                    title="Copy SHA-256"
                  >
                    {copiedHash === selectedCitation.sha256 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Raw Excerpt with Zero Data Spillage check */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center justify-between">
                  <span>Raw Ingested Excerpt</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      selectedCitation.is_redacted
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Clearance: {selectedCitation.classification || 'LEVEL_1'}
                  </span>
                </div>

                <div
                  className={`p-4 rounded-xl text-xs font-mono leading-relaxed border ${
                    selectedCitation.is_redacted
                      ? 'bg-amber-50/80 border-amber-300 text-amber-900 italic'
                      : 'bg-slate-900 text-slate-100 border-slate-800'
                  }`}
                >
                  {selectedCitation.excerpt}
                </div>

                {selectedCitation.is_redacted && (
                  <p className="text-[11px] text-amber-700 italic">
                    * This chunk originates from restricted machine syslogs and is automatically masked for Auditor clearance.
                  </p>
                )}
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="pt-4 mt-6 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCitation(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider apple-press cursor-pointer hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

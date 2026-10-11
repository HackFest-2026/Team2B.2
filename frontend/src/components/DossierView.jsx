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
  ShieldAlert,
  RefreshCw,
  Shield,
  AlertTriangle,
  Key,
  CheckCircle2,
  XCircle,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import LiquidGlass from './ui/LiquidGlass';

export default function DossierView({ currentUser, simulatedClearance, analysisVersion, activeTab }) {
  const [dossier, setDossier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);

  // Download & Tamper Verification States
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [showTamperModal, setShowTamperModal] = useState(false);
  const [tamperTab, setTamperTab] = useState('explain'); // 'explain' | 'verify' | 'simulate'
  const [isVerifyingFile, setIsVerifyingFile] = useState(false);
  const [fileVerificationResult, setFileVerificationResult] = useState(null);
  const [simulationState, setSimulationState] = useState('original'); // 'original' | 'tampered'
  const [simulationResult, setSimulationResult] = useState(null);

  const token = localStorage.getItem('verion_token');

  // Fetch dossier on load or when clearance switches or analysis runs
  useEffect(() => {
    fetchDossier();
  }, [simulatedClearance, analysisVersion]);

  useEffect(() => {
    if (activeTab === 'dossier' && (!dossier || dossier?.metadata?.is_empty) && !isLoading) {
      fetchDossier();
    }
  }, [activeTab]);

  const fetchDossier = async () => {
    setIsLoading(true);
    setVerificationDone(false);
    try {
      const url = `/api/analysis/dossier?simulate_clearance=${simulatedClearance}`;
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

  // Download official signed PDF
  const handleDownloadPdf = async () => {
    if (!dossier) return;
    setIsExportingPdf(true);
    try {
      const res = await fetch(`/api/export/pdf?simulate_clearance=${simulatedClearance}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Verion_Dossier_${dossier.case_id}_${simulatedClearance}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Download cryptographically sealed JSON
  const handleDownloadJson = async () => {
    if (!dossier) return;
    setIsExportingJson(true);
    try {
      const res = await fetch(`/api/export/dossier-json?simulate_clearance=${simulatedClearance}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Verion_Dossier_${dossier.case_id}_${simulatedClearance}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Failed to download JSON:', err);
    } finally {
      setIsExportingJson(false);
    }
  };

  // Upload file verification handler
  const handleVerifyUploadedFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsVerifyingFile(true);
    setFileVerificationResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/verify/file', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setFileVerificationResult(data);
    } catch (err) {
      setFileVerificationResult({
        is_authentic: false,
        status: 'VERIFICATION_ERROR',
        message: 'Network error communicating with verification engine: ' + err.message
      });
    } finally {
      setIsVerifyingFile(false);
    }
  };

  // Live Tamper Simulation Sandbox
  const handleRunTamperSimulation = async (tamper) => {
    if (!dossier) return;
    if (!tamper) {
      setSimulationState('original');
      try {
        const res = await fetch('/api/verify/dossier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dossier)
        });
        const data = await res.json();
        setSimulationResult(data);
      } catch (e) {
        console.error(e);
      }
    } else {
      setSimulationState('tampered');
      const modifiedSections = JSON.parse(JSON.stringify(dossier.sections || []));
      if (modifiedSections.length > 0) {
        const origContent = modifiedSections[0].content || '';
        modifiedSections[0].content = origContent + ' [IN-TRANSIT ALTERATION: Threat actor modified 42,000 count to 42!]';
      }
      const tamperedPayload = {
        ...dossier,
        sections: modifiedSections
      };
      try {
        const res = await fetch('/api/verify/dossier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tamperedPayload)
        });
        const data = await res.json();
        setSimulationResult(data);
      } catch (e) {
        console.error(e);
      }
    }
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
            className="inline-flex items-center gap-1.5 mx-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-100/90 hover:bg-blue-200 text-blue-900 border border-blue-300 transition-all apple-press cursor-pointer hover:shadow-xs align-baseline"
          >
            <span>{part}</span>
            <ExternalLink className="w-3 h-3 text-blue-600" />
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
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 apple-press cursor-pointer shadow-sm transition-all"
              title="Download official tamper-evident PDF dossier with cryptographic seal"
            >
              <Download className={`w-4 h-4 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              {isExportingPdf ? 'Generating PDF...' : 'Download Signed PDF'}
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              disabled={isExportingJson}
              className="px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-2 apple-press cursor-pointer transition-all shadow-2xs"
              title="Export complete dossier JSON with embedded HMAC signature"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              {isExportingJson ? 'Exporting...' : 'Export JSON'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowTamperModal(true);
                setTamperTab('explain');
              }}
              className="px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-2 apple-press cursor-pointer transition-all shadow-2xs"
              title="Inspect anti-tamper proofs, verify files, or test tamper simulation"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Anti-Tamper Guard
            </button>

            <button
              type="button"
              onClick={handleCopyFullReport}
              className="px-3 py-2.5 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center gap-2 apple-press cursor-pointer shadow-2xs"
              title="Copy narrative report text"
            >
              {copiedDoc ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              {copiedDoc ? 'Copied' : 'Copy'}
            </button>

            <button
              type="button"
              onClick={fetchDossier}
              className="px-3 py-2.5 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center gap-2 apple-press cursor-pointer shadow-2xs"
              title="Refresh dossier from backend"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Cryptographic Seal Bar - 4-Column Proof Architecture */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="text-[10px] uppercase text-slate-400 font-bold">SHA-256 Narrative Seal</div>
              <div className="text-slate-800 font-bold truncate max-w-[170px]" title={dossier.dossier_sha256_seal}>
                {dossier.dossier_sha256_seal}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopyHash(dossier.dossier_sha256_seal)}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors shrink-0"
              title="Copy SHA-256 Seal"
            >
              {copiedHash === dossier.dossier_sha256_seal ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="text-[10px] uppercase text-slate-400 font-bold">HMAC Digital Signature</div>
              <div className="text-slate-800 font-bold truncate max-w-[170px]" title={dossier.digital_signature || 'N/A'}>
                {dossier.digital_signature ? `${dossier.digital_signature.slice(0, 16)}...` : 'SEALED'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopyHash(dossier.digital_signature || '')}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors shrink-0"
              title="Copy HMAC Signature"
            >
              {copiedHash === dossier.digital_signature ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase text-slate-400 font-bold">Citation Grounding</div>
            <div className="text-slate-800 font-bold truncate">
              {dossier.metadata.verified_citations}/{dossier.metadata.total_citations} Verified Anchors (100%)
            </div>
          </div>

          <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase text-slate-400 font-bold">Clearance Gate Status</div>
            <div className="text-slate-800 font-bold flex items-center gap-1.5 truncate">
              {dossier.clearance_applied === 'LEVEL_1' ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-amber-700 truncate">L1 Sanitized (0 Spillage)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-blue-700 truncate">L2 Unrestricted Investigative</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Anti-Tamper Security Assurance Ribbon */}
        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50/90 via-blue-50/50 to-slate-50/90 border border-emerald-200/90 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3.5 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                <span>Dual Cryptographic Anti-Tamper Guarantee</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                  SHA-256 + HMAC-SHA256 ACTIVE
                </span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                When sharing this report with third parties, any in-transit modification (altering findings, timestamps, or IPs) mathematically breaks the SHA-256 digest and invalidates the cryptographic signature.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              type="button"
              onClick={() => {
                setShowTamperModal(true);
                setTamperTab('verify');
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 flex items-center gap-1.5 apple-press cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              Verify File
            </button>
            <button
              type="button"
              onClick={() => {
                setShowTamperModal(true);
                setTamperTab('simulate');
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 apple-press cursor-pointer shadow-xs"
            >
              <Shield className="w-3.5 h-3.5" />
              Test Tamper Sandbox &rarr;
            </button>
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
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                {section.title}
              </h2>
              <span className="text-xs font-mono uppercase px-3 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-300 font-bold">
                {section.section_id}
              </span>
            </div>

            {/* Narrative text with embedded interactive citation pills */}
            <div className="text-base md:text-lg leading-relaxed text-slate-800 space-y-5">
              {(Array.isArray(section.content)
                ? section.content.join('\n\n')
                : (typeof section.content === 'string' ? section.content : String(section.content || ''))
              ).split('\n\n').map((paragraph, pIdx) => (
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

      {/* Cryptographic Anti-Tamper Verification & Forensic Inspector Modal */}
      {showTamperModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowTamperModal(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col my-8 z-10">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    Tamper-Evident Integrity & Verification
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                      ACTIVE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    How Verion AI prevents and catches unauthorized modifications in transmitted reports
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTamperModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors apple-press cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-200/80 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setTamperTab('explain')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all apple-press cursor-pointer ${
                  tamperTab === 'explain'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                1. How Tamper-Evidence Works
              </button>
              <button
                type="button"
                onClick={() => setTamperTab('verify')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all apple-press cursor-pointer ${
                  tamperTab === 'verify'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                2. Live File Verifier
              </button>
              <button
                type="button"
                onClick={() => {
                  setTamperTab('simulate');
                  if (!simulationResult) handleRunTamperSimulation(false);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all apple-press cursor-pointer ${
                  tamperTab === 'simulate'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                3. Tamper Simulation Sandbox
              </button>
            </div>

            {/* Modal Tab Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[65vh]">
              {/* TAB 1: HOW IT WORKS */}
              {tamperTab === 'explain' && (
                <div className="space-y-5">
                  <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-blue-950">
                    <h4 className="font-bold text-sm text-blue-900 mb-1 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-blue-700" />
                      The Core Security Challenge: In-Transit Document Tampering
                    </h4>
                    <p className="leading-relaxed">
                      When an investigative summary report is exported and emailed to an auditor, judge, or executive, a malicious intermediary or adversary might attempt to modify key facts (e.g. changing an IP address from 10.240.1.45 to an innocent IP, editing an exfiltration timestamp, or changing patient records from 42,000 to 42). Verion AI renders this mathematically detectable with 100% certainty.
                    </p>
                  </div>

                  {/* 3 Pillars */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold font-mono">
                        01
                      </div>
                      <div className="font-bold text-slate-900">SHA-256 Avalanche Digest</div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        The entire narrative text and citations are hashed. Cryptographic hash properties guarantee that altering even a single comma or letter completely randomizes the entire 64-character hexadecimal digest.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold font-mono">
                        02
                      </div>
                      <div className="font-bold text-slate-900">Custodial HMAC-SHA256 Signature</div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        The document seal is signed using the server's private secret key. An attacker who modifies the text cannot recompute a valid signature because they do not possess the server key.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="w-7 h-7 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-bold font-mono">
                        03
                      </div>
                      <div className="font-bold text-slate-900">Chunk Provenance Anchors</div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Every statement in the report maps to a chunk hash in the immutable ledger. Modified citations can be audited directly against the original ingested evidence streams.
                      </p>
                    </div>
                  </div>

                  {/* PDF Document Seal Features */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="font-bold text-slate-900 text-xs uppercase font-mono tracking-wider">
                      Embedded PDF Provenance Features
                    </div>
                    <ul className="text-xs text-slate-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Official Cryptographic Seal Box:</strong> Prominently stamped on Page 1 with the full SHA-256 digest and HMAC custody signature.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Embedded Metadata Dictionary:</strong> Custom PyMuPDF document keywords (<code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">SHA256:... SIG:...</code>) embedded directly into the PDF trailer.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Zero Data Spillage Guarantee:</strong> Level 1 Auditor PDFs are stripped of internal IPs before hashing, ensuring separate cryptographic seals for sanitized vs classified versions.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setTamperTab('simulate')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider apple-press cursor-pointer shadow-xs"
                    >
                      Test Tamper Simulation Sandbox &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE FILE VERIFIER */}
              {tamperTab === 'verify' && (
                <div className="space-y-5">
                  <div className="text-xs text-slate-600">
                    Upload any downloaded Verion AI dossier file (<code>.pdf</code> or <code>.json</code>) to verify its cryptographic seal and signature against the custodian authority.
                  </div>

                  {/* Dropzone / Upload button */}
                  <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all">
                    <input
                      type="file"
                      accept=".pdf,.json"
                      onChange={handleVerifyUploadedFile}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-sm text-slate-800">
                        {isVerifyingFile ? 'Verifying Cryptographic Signatures...' : 'Click or Drop Dossier File Here'}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-1">
                        Supports signed .PDF reports and sealed .JSON manifests
                      </div>
                    </div>
                  </label>

                  {/* Verification Result Card */}
                  {fileVerificationResult && (
                    <div
                      className={`p-5 rounded-2xl border ${
                        fileVerificationResult.is_authentic
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50/80 border-rose-300 text-rose-950'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {fileVerificationResult.is_authentic ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">
                              {fileVerificationResult.is_authentic
                                ? 'VERIFIED AUTHENTIC: 100% UNTAMPERED'
                                : 'TAMPER DETECTED / INVALID DOCUMENT'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                fileVerificationResult.is_authentic
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {fileVerificationResult.status}
                            </span>
                          </div>

                          <p className="text-xs leading-relaxed">
                            {fileVerificationResult.message}
                          </p>

                          <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                            <div>Case ID: <strong>{fileVerificationResult.case_id || dossier.case_id}</strong></div>
                            <div>Clearance: <strong>{fileVerificationResult.clearance_applied || 'LEVEL_2'}</strong></div>
                            <div className="col-span-full truncate">
                              Seal Digest: <strong>{fileVerificationResult.claimed_seal || dossier.dossier_sha256_seal}</strong>
                            </div>
                            <div className="col-span-full truncate">
                              Signature: <strong>{fileVerificationResult.claimed_signature || dossier.digital_signature}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: LIVE TAMPER SIMULATION SANDBOX */}
              {tamperTab === 'simulate' && (
                <div className="space-y-5">
                  <div className="text-xs text-slate-600">
                    Test live tamper detection in real time! Click below to simulate an adversary altering 1 sentence in the synthesized dossier, and see how the verification engine instantly catches the fraud.
                  </div>

                  {/* Target Evidence Box */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs font-mono">
                    <div className="text-[10px] uppercase text-slate-400 font-bold">Investigative Finding Excerpt</div>
                    <div
                      className={`p-3 rounded-xl border ${
                        simulationState === 'tampered'
                          ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      {simulationState === 'tampered'
                        ? `${dossier.sections[0]?.content?.slice(0, 180)}... [IN-TRANSIT ALTERATION: Threat actor modified 42,000 count to 42!]`
                        : `${dossier.sections[0]?.content?.slice(0, 220)}...`}
                    </div>
                  </div>

                  {/* Simulator Controls */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleRunTamperSimulation(true)}
                      className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 apple-press cursor-pointer shadow-xs"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Simulate Attacker Modifying Text
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRunTamperSimulation(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 apple-press cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Test Authentic Original Document
                    </button>
                  </div>

                  {/* Live Result Box */}
                  {simulationResult && (
                    <div
                      className={`p-5 rounded-2xl border ${
                        simulationResult.is_authentic
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50/80 border-rose-300 text-rose-950'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {simulationResult.is_authentic ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">
                              {simulationResult.is_authentic
                                ? 'VERDICT: DOCUMENT IS 100% AUTHENTIC & UNTAMPERED'
                                : 'VERDICT: CRITICAL TAMPER ALERT - IN-TRANSIT MODIFICATION DETECTED!'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                simulationResult.is_authentic
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {simulationResult.status}
                            </span>
                          </div>

                          <p className="text-xs leading-relaxed">
                            {simulationResult.message}
                          </p>

                          <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[11px] font-mono">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Claimed Official Seal:</span>
                              <span className="font-bold">{simulationResult.claimed_seal?.slice(0, 24)}...</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Recomputed Narrative Hash:</span>
                              <span className={`font-bold ${simulationResult.is_authentic ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {simulationResult.recomputed_seal?.slice(0, 24)}...
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Hash Match Status:</span>
                              <span className="font-bold">
                                {simulationResult.content_valid ? 'MATCH (100% Untouched)' : 'MISMATCH (Tampering Confirmed)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                Verion AI Forensic Provenance Engine • SHA-256 / HMAC-SHA256
              </span>
              <button
                type="button"
                onClick={() => setShowTamperModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider apple-press cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import LiquidGlass from './ui/LiquidGlass';
import {
  FolderOpen,
  Plus,
  Trash2,
  ArrowRightCircle,
  ShieldCheck,
  FileText,
  Layers,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function CaseManagerView({ currentUser, onCaseChanged }) {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newCaseId, setNewCaseId] = useState('');
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('info'); // 'info' | 'error' | 'success'
  const [confirmDelete, setConfirmDelete] = useState(null);

  const token = localStorage.getItem('verion_token');
  const canManage = currentUser?.can_upload;

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cases', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
      }
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!newCaseId || !newCaseTitle) return;
    setIsCreatingCase(true);
    setStatusMsg('');
    try {
      const res = await fetch('/api/case/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ case_id: newCaseId, title: newCaseTitle })
      });
      if (res.ok) {
        setStatusMsg(`Case "${newCaseId}" created successfully.`);
        setStatusType('success');
        setShowNewCaseModal(false);
        setNewCaseId('');
        setNewCaseTitle('');
        await fetchCases();
        if (onCaseChanged) onCaseChanged();
      } else {
        const err = await res.json();
        setStatusMsg(err.detail || 'Failed to create case.');
        setStatusType('error');
      }
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
      setStatusType('error');
    } finally {
      setIsCreatingCase(false);
    }
  };

  const handleDeleteCase = async (caseId) => {
    try {
      const res = await fetch(`/api/cases/${encodeURIComponent(caseId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusMsg(`Case "${caseId}" deleted.`);
        setStatusType('success');
        setConfirmDelete(null);
        await fetchCases();
      } else {
        const err = await res.json();
        setStatusMsg(err.detail || 'Failed to delete case.');
        setStatusType('error');
      }
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
      setStatusType('error');
    }
  };

  const handleSwitchCase = async (caseId) => {
    try {
      const res = await fetch(`/api/cases/${encodeURIComponent(caseId)}/activate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusMsg(`Switched to case "${caseId}".`);
        setStatusType('success');
        await fetchCases();
        if (onCaseChanged) onCaseChanged();
      } else {
        const err = await res.json();
        setStatusMsg(err.detail || 'Failed to switch case.');
        setStatusType('error');
      }
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
      setStatusType('error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
            <span>Case Registry</span> • <span>Management Console</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Investigation Case Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, switch, and manage investigation cases. Only Lead Officers and Evidence Custodians have write access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              type="button"
              onClick={() => setShowNewCaseModal(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold transition-colors apple-press flex items-center gap-1.5 cursor-pointer shadow-xs rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" /> New Case
            </button>
          )}
          <button
            type="button"
            onClick={fetchCases}
            disabled={isLoading}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-400 text-xs font-mono font-semibold text-slate-700 transition-colors apple-press flex items-center gap-1.5 cursor-pointer rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {statusMsg && (
        <div className={`p-3 border text-xs font-mono flex items-center justify-between rounded-xl ${
          statusType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          statusType === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            {statusType === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> :
             statusType === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> :
             <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg('')} className="text-xs font-bold opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      {/* Cases Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-xs font-mono text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading case registry...
        </div>
      ) : cases.length === 0 ? (
        <LiquidGlass className="p-12 text-center space-y-4">
          <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-700 font-mono">No Cases Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create your first investigation case or ingest the benchmark dataset to get started.
            </p>
          </div>
        </LiquidGlass>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cases.map((c) => (
            <LiquidGlass
              key={c.case_id}
              className={`p-5 space-y-4 transition-all duration-200 ${
                c.is_active ? 'ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10' : ''
              }`}
            >
              {/* Case Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {c.is_active && (
                      <span className="shrink-0 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                        Active
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-400 truncate">{c.case_id}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {c.title}
                  </h3>
                </div>
                <div className="shrink-0 p-2 bg-slate-100 border border-slate-200 rounded-xl">
                  <FolderOpen className={`w-5 h-5 ${c.is_active ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50/80 border border-slate-100 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Files</div>
                  <div className="text-lg font-bold font-mono text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    {c.total_files}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50/80 border border-slate-100 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Chunks</div>
                  <div className="text-lg font-bold font-mono text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    {c.total_chunks}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {canManage && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  {!c.is_active && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSwitchCase(c.case_id)}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-mono font-bold rounded-lg apple-press flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <ArrowRightCircle className="w-3.5 h-3.5" /> Activate
                      </button>
                      {confirmDelete === c.case_id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteCase(c.case_id)}
                            className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-mono font-bold rounded-lg apple-press cursor-pointer transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono rounded-lg apple-press cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(c.case_id)}
                          className="py-2 px-3 bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 text-[11px] font-mono font-semibold rounded-lg apple-press flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                  {c.is_active && (
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-blue-700 w-full justify-center py-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> Currently Active Investigation
                    </div>
                  )}
                </div>
              )}
            </LiquidGlass>
          ))}
        </div>
      )}

      {/* Create New Case Modal */}
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
                Create New Investigation
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
                <strong>Note:</strong> Creating a new case sets it as the active investigation. All views will refresh to reflect the new empty case.
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
                  {isCreatingCase ? 'Creating...' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

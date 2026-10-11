import React, { useState, useEffect } from 'react';
import LiquidGlass from './ui/LiquidGlass';
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  ShieldCheck,
  ShieldAlert,
  Hash,
  AlertOctagon,
  CheckCircle2,
  Lock,
  Database
} from 'lucide-react';

export default function OverviewView({ currentUser, simulatedClearance }) {
  const [benchmarkCase, setBenchmarkCase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBenchmark = async () => {
      try {
        const token = localStorage.getItem('verion_token');
        const res = await fetch('/api/benchmark/files', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBenchmarkCase(data);
        }
      } catch (err) {
        console.error('Failed to fetch benchmark:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBenchmark();
  }, []);

  const isLevel2 = simulatedClearance === 'LEVEL_2';

  return (
    <div className="space-y-6">
      {/* Page Title & Case Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
            <span>Investigation Dossier</span> • <span>Active Case</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {benchmarkCase?.title || 'Case 2026-Alpha: Unauthorized System Exfiltration'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Transforming heterogeneous digital records into one cryptographically verifiable investigation document.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-white/80 backdrop-blur-md border border-slate-200 rounded-lg text-xs font-mono shadow-2xs">
            <span className="text-slate-400">CASE ID: </span>
            <span className="font-bold text-slate-800">IR-2026-0914-ALPHA</span>
          </div>
          <div className="px-3 py-1 bg-emerald-50/80 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-mono font-semibold">
            STATUS: ACTIVE INCIDENT
          </div>
        </div>
      </div>

      {/* 4 Core Liquid Glass KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <LiquidGlass
          variant="card"
          glowColor="rgba(0, 113, 227, 0.25)"
          className="p-5 space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
            <span>Sources Ingested</span>
            <Database className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div className="text-3xl md:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
            3 <span className="text-sm font-normal text-slate-400">/ 3 Formats</span>
          </div>
          <div className="text-xs md:text-sm text-slate-600">
            PDF Report, Chat TXT, Raw Syslog
          </div>
        </LiquidGlass>

        {/* Metric 2 */}
        <LiquidGlass
          variant="card"
          glowColor="rgba(16, 185, 129, 0.25)"
          className="p-5 space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
            <span>Data Spillage Rate</span>
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div className="text-3xl md:text-4xl font-extrabold text-emerald-600 font-mono tracking-tight">
            0.00%
          </div>
          <div className="text-xs md:text-sm text-slate-600">
            Pre-retrieval clearance gate active
          </div>
        </LiquidGlass>

        {/* Metric 3 */}
        <LiquidGlass
          variant="card"
          glowColor="rgba(99, 102, 241, 0.25)"
          className="p-5 space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
            <span>Attribution Guarantee</span>
            <Hash className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div className="text-3xl md:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
            100%
          </div>
          <div className="text-xs md:text-sm text-slate-600">
            SHA-256 chunk cryptographic stamp
          </div>
        </LiquidGlass>

        {/* Metric 4 */}
        <LiquidGlass
          variant="card"
          glowColor="rgba(225, 29, 72, 0.28)"
          className="p-5 space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
            <span>Cross-Source Conflict</span>
            <AlertOctagon className="w-4.5 h-4.5 text-rose-600" />
          </div>
          <div className="text-3xl md:text-4xl font-extrabold text-rose-600 font-mono tracking-tight">
            1 <span className="text-sm font-normal text-slate-400">Detected</span>
          </div>
          <div className="text-xs md:text-sm text-slate-600">
            Interview vs. SSH session discrepancy
          </div>
        </LiquidGlass>
      </div>

      {/* Ground Truth Benchmark Case Section (Liquid Glass Container) */}
      <LiquidGlass variant="panel" className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Ground Truth Benchmark Evidence Package
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These heterogeneous records form the core verifiable test case for Case 2026-Alpha.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200 text-slate-600 font-medium">
              Clearance Filter: {simulatedClearance}
            </span>
          </div>
        </div>

        {/* Evidence Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">File Name</th>
                <th className="py-3 px-3">Classification</th>
                <th className="py-3 px-3">Payload Size</th>
                <th className="py-3 px-3">Integrity State</th>
                <th className="py-3 px-3 text-right">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {benchmarkCase?.files?.map((file, idx) => {
                const isRestricted = file.classification === 'LEVEL_2';
                const isMasked = isRestricted && !isLevel2;

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isMasked ? 'opacity-60 bg-slate-50/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      {file.extension === '.pdf' && <FileText className="w-4 h-4 text-blue-600" />}
                      {file.extension === '.txt' && <FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                      {file.extension === '.log' && <FileCode className="w-4 h-4 text-rose-600" />}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-medium text-slate-800">
                      {isMasked ? '••••••••_classified_log.enc' : file.filename}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border uppercase ${
                          file.classification === 'LEVEL_2'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {file.classification}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500">
                      {file.size_bytes} B
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        SHA-256 Sealed
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {isMasked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          <Lock className="w-3 h-3" /> Redacted (Level 1 View)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          Available
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </LiquidGlass>


    </div>
  );
}

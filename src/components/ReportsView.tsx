/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Award,
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Candidate, JobRequisition } from '../types';

interface ReportsViewProps {
  candidates: Candidate[];
  activeRequisitions: JobRequisition[];
  historicalRequisitions: JobRequisition[];
  onExportExcel: () => void;
  onExportCSV: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  candidates,
  activeRequisitions,
  historicalRequisitions,
  onExportExcel,
  onExportCSV,
}) => {
  const allRequisitions = [...activeRequisitions, ...historicalRequisitions];
  const total = candidates.length;
  const shortlisted = candidates.filter((c) => c.status === 'shortlisted').length;
  const onHold = candidates.filter((c) => c.status === 'on_hold').length;
  const rejected = candidates.filter((c) => c.status === 'rejected').length;
  const pending = candidates.filter((c) => c.status === 'pending').length;

  // Score brackets
  const perfect = candidates.filter((c) => c.score >= 85).length;
  const better = candidates.filter((c) => c.score >= 70 && c.score < 85).length;
  const goodAverage = candidates.filter((c) => c.score >= 55 && c.score < 70).length;
  const irrelevant = candidates.filter((c) => c.score < 55).length;

  return (
    <div className="space-y-6 text-[#e6edf3]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#30363d]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold text-[#e6edf3]">Recruitment Analytics & Compliance Reports</h1>
          </div>
          <p className="text-xs text-[#8b949e] mt-1">
            Data-driven HR overview of match scoring distributions, candidate pipeline velocities, and RMG talent sourcing metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel (.xlsx)</span>
          </button>
          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#21262d] p-5 rounded-xl border border-[#30363d] space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
            Shortlist Conversion
          </span>
          <div className="text-3xl font-black text-emerald-400">
            {total > 0 ? Math.round((shortlisted / total) * 100) : 0}%
          </div>
          <p className="text-xs text-[#8b949e]">{shortlisted} out of {total} candidates shortlisted</p>
        </div>

        <div className="bg-[#21262d] p-5 rounded-xl border border-[#30363d] space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
            High Match Ratio (&ge;70%)
          </span>
          <div className="text-3xl font-black text-indigo-400">
            {total > 0 ? Math.round(((perfect + better) / total) * 100) : 0}%
          </div>
          <p className="text-xs text-[#8b949e]">{perfect + better} top tier candidates</p>
        </div>

        <div className="bg-[#21262d] p-5 rounded-xl border border-[#30363d] space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
            Total Requisitions
          </span>
          <div className="text-3xl font-black text-[#e6edf3]">
            {allRequisitions.length}
          </div>
          <p className="text-xs text-[#8b949e]">{activeRequisitions.length} active &bull; {historicalRequisitions.length} archived</p>
        </div>

        <div className="bg-[#21262d] p-5 rounded-xl border border-[#30363d] space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
            Human Review Completion
          </span>
          <div className="text-3xl font-black text-amber-400">
            {total > 0 ? Math.round(((total - pending) / total) * 100) : 0}%
          </div>
          <p className="text-xs text-[#8b949e]">{total - pending} decisions finalized</p>
        </div>
      </div>

      {/* Match Score Distribution Breakdown */}
      <div className="bg-[#21262d] rounded-2xl border border-[#30363d] p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#e6edf3]">AI Match Verdict & Score Distribution</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">Perfect Matched (&ge;85%)</span>
              <span className="font-mono font-bold text-emerald-300">{perfect}</span>
            </div>
            <div className="w-full bg-[#161b22] h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${total > 0 ? (perfect / total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8b949e]">Direct interview priority</p>
          </div>

          <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-400">Better (70 - 84%)</span>
              <span className="font-mono font-bold text-teal-300">{better}</span>
            </div>
            <div className="w-full bg-[#161b22] h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full"
                style={{ width: `${total > 0 ? (better / total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8b949e]">Strong candidate fit</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400">Good / Average (55 - 69%)</span>
              <span className="font-mono font-bold text-amber-300">{goodAverage}</span>
            </div>
            <div className="w-full bg-[#161b22] h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${total > 0 ? (goodAverage / total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8b949e]">Consider with reservations</p>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400">Irrelevant (&lt;55%)</span>
              <span className="font-mono font-bold text-rose-300">{irrelevant}</span>
            </div>
            <div className="w-full bg-[#161b22] h-2 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${total > 0 ? (irrelevant / total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8b949e]">Skills / experience gap</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  Archive,
  ArrowRight,
  Award,
  BarChart3,
  Briefcase,
  Building2,
  CalendarCheck,
  Check,
  CheckCircle,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Flame,
  FolderArchive,
  Layers,
  PauseCircle,
  Pencil,
  Plus,
  Scale,
  Search,
  Sliders,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { Candidate, CurrentOperationalStage, HiringCategory, JobRequisition, NavigationMenuTab, RequisitionStatus, UltimateRequisitionStatus } from '../types';
import { getVerdictBadge } from '../utils/scoringCardHelper';
import { EditPositionModal } from './EditPositionModal';
import { PositionDetailsModal } from './PositionDetailsModal';
import { GRADING_LADDER } from '../data/gradingLadder';
import { HiringTrackerTable } from './HiringTrackerTable';

interface DashboardHomeViewProps {
  activeRequisitions: JobRequisition[];
  historicalRequisitions: JobRequisition[];
  candidates: Candidate[];
  onSelectRequisition: (req: JobRequisition) => void;
  onNavigateTab: (tab: NavigationMenuTab) => void;
  onOpenNewJobModal: () => void;
  onOpenSalaryMatrix: () => void;
  onOpenIndustryPolicy: () => void;
  onOpenCandidateDetail: (candidate: Candidate) => void;
  onUpdateRequisitionStatus?: (reqId: string, newStatus: RequisitionStatus) => void;
  onUpdateRequisitionPriority?: (reqId: string, priority: HiringCategory) => void;
  onUpdateRequisition?: (updated: JobRequisition) => void;
  onDeletePosition?: (reqId: string) => void;
  trackerRecords?: import('../data/hiringTrackerData').HiringTrackerRecord[];
  onAddTrackerRecord?: (record: import('../data/hiringTrackerData').HiringTrackerRecord) => void;
  onUpdateTrackerRecord?: (id: string, field: keyof import('../data/hiringTrackerData').HiringTrackerRecord, value: any) => void;
  onDeleteTrackerRecord?: (id: string) => void;
  onSaveAllTrackerRecords?: () => void;
  companyName: string;
}

export const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({
  activeRequisitions,
  historicalRequisitions,
  candidates,
  onSelectRequisition,
  onNavigateTab,
  onOpenNewJobModal,
  onOpenSalaryMatrix,
  onOpenIndustryPolicy,
  onOpenCandidateDetail,
  onUpdateRequisitionStatus,
  onUpdateRequisitionPriority,
  onUpdateRequisition,
  onDeletePosition,
  trackerRecords,
  onAddTrackerRecord,
  onUpdateTrackerRecord,
  onDeleteTrackerRecord,
  onSaveAllTrackerRecords,
  companyName,
}) => {
  // Combine all jobs for metrics
  const allRequisitions = [...activeRequisitions, ...historicalRequisitions];

  const [editingPosition, setEditingPosition] = useState<JobRequisition | null>(null);
  const [viewingPosition, setViewingPosition] = useState<JobRequisition | null>(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedCadreFilter, setSelectedCadreFilter] = useState<string>('all');

  // Compute live status counters for Tier 1 ("Dashboard")
  const trackerList = trackerRecords ?? [];
  const totalJobOpenings =
    trackerList.length > 0 ? trackerList.length : allRequisitions.length;
  const runningCount =
    trackerList.length > 0
      ? trackerList.filter((r) => r.currentStatus === 'RUNNING').length
      : activeRequisitions.filter(
          (r) => r.status === 'open' || r.status === 'active'
        ).length;
  const waitingForJoiningCount = trackerList.filter(
    (r) => r.currentStatus === 'WAITING'
  ).length;
  const closedCount =
    trackerList.length > 0
      ? trackerList.filter(
          (r) => r.currentStatus === 'CLOSED' || r.currentStatus === 'DONE'
        ).length
      : [
          ...historicalRequisitions,
          ...activeRequisitions.filter(
            (r) =>
              r.status === 'closed' ||
              r.status === 'filled' ||
              r.status === 'cancelled'
          ),
        ].length;
  const onHoldCount =
    trackerList.length > 0
      ? trackerList.filter((r) => r.currentStatus === 'ON - HOLD').length
      : activeRequisitions.filter((r) => r.status === 'on_hold').length;

  // Compute live KPI metrics for Tier 3 ("KPI Metrics")
  const interviewedCount = candidates.filter(
    (c) => c.status === 'interview'
  ).length;
  const selectedCount = candidates.filter(
    (c) => c.status === 'selected' || c.status === 'shortlisted'
  ).length;
  const closureRate =
    totalJobOpenings > 0
      ? `${Math.round((closedCount / totalJobOpenings) * 100)}%`
      : '0%';
  const selectionYield =
    interviewedCount + selectedCount > 0
      ? `${Math.round(
          (selectedCount / (interviewedCount + selectedCount)) * 100
        )}%`
      : '0%';

  return (
    <div className="space-y-6 text-[#e6edf3]">
      {/* Top Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#30363d]/60">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#e6edf3] tracking-tight whitespace-nowrap truncate">
              HR Recruitment Management System
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-[#8b949e] font-medium truncate mt-0.5">
            Enterprise RMG Screening, 3-Pillar Tri-Match &amp; Requisition Management
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowGradingModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] shadow-sm transition cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Grading Ladder &amp; KRA Matrix</span>
          </button>
        </div>
      </div>

      {/* TIER 1: Top Section — "Dashboard" (Status Counters Tier | Emerald / Cyan Palette) */}
      <section className="bg-[#111c24] rounded-2xl border border-cyan-500/20 p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cyan-500/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-[#0d1117] shadow-[0_0_14px_rgba(16,185,129,0.4)] shrink-0">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-[#f8fafc] tracking-tight">
                  Dashboard
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Status Counters Tier
                </span>
              </div>
              <p className="text-xs text-[#8b949e]">
                Live requisition status overview across all active and archived job openings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('jobs')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Jobs</span>
          </button>
        </div>

        {/* 5 Dynamic Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Total Job Openings (#f8fafc Crisp White / Neutral) */}
          <div className="p-4 rounded-xl bg-[#0d161d] border border-cyan-500/20 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f8fafc]">
                Total Job Openings
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#f8fafc]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#f8fafc]">
              {totalJobOpenings}
            </div>
            <span className="text-[11px] text-[#8b949e]">All Requisitions</span>
          </div>

          {/* 2. Running (#10b981 Vibrant Emerald) */}
          <div className="p-4 rounded-xl bg-[#0d161d] border border-[#10b981]/30 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#10b981]">
                Running
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#10b981]">
              {runningCount}
            </div>
            <span className="text-[11px] text-[#8b949e]">Active Sourcing</span>
          </div>

          {/* 3. Waiting for Joining (#38bdf8 Bright Sky Blue) */}
          <div className="p-4 rounded-xl bg-[#0d161d] border border-[#38bdf8]/30 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8]">
                Waiting for Joining
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#38bdf8]">
              {waitingForJoiningCount}
            </div>
            <span className="text-[11px] text-[#8b949e]">Offer Accepted</span>
          </div>

          {/* 4. Closed (#64748b Slate Muted Gray) */}
          <div className="p-4 rounded-xl bg-[#0d161d] border border-[#64748b]/40 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                Closed
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#94a3b8]">
              {closedCount}
            </div>
            <span className="text-[11px] text-[#8b949e]">Filled / Completed</span>
          </div>

          {/* 5. On Hold (#f59e0b Amber / Warning Orange) */}
          <div className="p-4 rounded-xl bg-[#0d161d] border border-[#f59e0b]/30 flex flex-col justify-between gap-2 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f59e0b]">
                On Hold
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#f59e0b]">
              {onHoldCount}
            </div>
            <span className="text-[11px] text-[#8b949e]">Temporarily Paused</span>
          </div>
        </div>

        {/* Clean Slate Empty Banner when Total Jobs = 0 */}
        {totalJobOpenings === 0 && (
          <div className="p-3.5 rounded-xl bg-[#0d161d] border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-[#c9d1d9]">
              <Briefcase className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                No active jobs yet. Create your first job posting under &lsquo;Jobs&rsquo;.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('jobs')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition cursor-pointer self-start sm:self-auto"
            >
              <span>Go to Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* TIER 2: Middle Section — "Hiring Tracking" (Indigo / Royal Violet Palette) */}
      <HiringTrackerTable
        candidates={candidates}
        activeRequisitions={activeRequisitions}
        trackerRecords={trackerRecords}
        onAddTrackerRecord={onAddTrackerRecord}
        onUpdateTrackerRecord={onUpdateTrackerRecord}
        onDeleteTrackerRecord={onDeleteTrackerRecord}
        onSaveAllTrackerRecords={onSaveAllTrackerRecords}
        onSelectRequisition={onSelectRequisition}
        onNavigateTab={onNavigateTab}
      />



      {/* 5. In-line / Modal Position Editor (Configuring 3 Pillars: JD, Requirements, Company Criteria) */}
      <EditPositionModal
        isOpen={!!editingPosition}
        onClose={() => setEditingPosition(null)}
        requisition={editingPosition}
        onSave={(updated) => {
          onUpdateRequisition?.(updated);
          // Also update active or historical requisitions if status changed
          if (onUpdateRequisitionStatus && updated.status !== editingPosition?.status) {
            onUpdateRequisitionStatus(updated.id, updated.status);
          }
        }}
      />

      {/* Position Details Modal (Only non-empty parameters displayed) */}
      {viewingPosition && (
        <PositionDetailsModal
          isOpen={!!viewingPosition}
          requisition={viewingPosition}
          onClose={() => setViewingPosition(null)}
          onEditPosition={(req) => setEditingPosition(req)}
          onScreenPosition={(req) => {
            onSelectRequisition(req);
            onNavigateTab('screening');
          }}
        />
      )}

      {/* 6. Organizational Grading Ladder & KRA/KSA Master Matrix Reference Modal */}
      {showGradingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden text-[#e6edf3]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#30363d] bg-[#21262d]/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Award className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#e6edf3] flex items-center gap-2">
                      Organizational Hierarchy &amp; Grading Ladder Master Matrix
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        ME-1 to NME-21
                      </span>
                    </h3>
                    <p className="text-xs text-[#8b949e]">
                      Automated screening rules engine reference, mandatory service lengths, benchmark score hurdles, and layer competencies.
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGradingModal(false)}
                className="p-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Hurdle Summary Cards */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#0d1117] border-b border-[#30363d]/60 text-xs">
              <div className="p-3 rounded-xl bg-[#161b22] border border-amber-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-300">GM Cadre (ME-1 ~ 5)</span>
                  <span className="px-2 py-0.5 rounded-full font-mono font-bold bg-amber-500/20 text-amber-300 text-[11px]">≥ 85% Hurdle</span>
                </div>
                <p className="text-[11px] text-[#8b949e]">14.5 to 26+ Years (172 - 312+ Mos)</p>
                <p className="text-[11px] text-[#8b949e]">Strategic &amp; Policy: Budget &amp; Risk Oversight, Cross-SBU Governance.</p>
              </div>

              <div className="p-3 rounded-xl bg-[#161b22] border border-indigo-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-indigo-300">Managerial (ME-6 ~ 9)</span>
                  <span className="px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-500/20 text-indigo-300 text-[11px]">≥ 70% Hurdle</span>
                </div>
                <p className="text-[11px] text-[#8b949e]">6.5 to 12.5 Years (78 - 148 Mos)</p>
                <p className="text-[11px] text-[#8b949e]">Operational &amp; Supervision: Process Control, Line Lead, Vendor Management.</p>
              </div>

              <div className="p-3 rounded-xl bg-[#161b22] border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-300">Executive (ME-10 ~ 13)</span>
                  <span className="px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/20 text-emerald-300 text-[11px]">≥ 55% Hurdle</span>
                </div>
                <p className="text-[11px] text-[#8b949e]">0 to 4.5 Years (0 - 54 Mos)</p>
                <p className="text-[11px] text-[#8b949e]">Execution &amp; Process: Daily Task Follow-up, Data Entry, Checklist Execution.</p>
              </div>

              <div className="p-3 rounded-xl bg-[#161b22] border border-sky-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sky-300">Staff &amp; Workers</span>
                  <span className="px-2 py-0.5 rounded-full font-mono font-bold bg-sky-500/20 text-sky-300 text-[11px]">50% - 55% Hurdle</span>
                </div>
                <p className="text-[11px] text-[#8b949e]">ME-14~17 (Staff) | NME-18~21 (Workers)</p>
                <p className="text-[11px] text-[#8b949e]">Operational Support: Sewing, Cutting, Finishing, Helper &amp; Security.</p>
              </div>
            </div>

            {/* Cadre Filter Pills */}
            <div className="p-3 border-b border-[#30363d] flex items-center justify-between gap-3 flex-wrap bg-[#161b22]">
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                {['all', 'GM Cadre', 'Managerial Cadre', 'Executive Cadre', 'Service Staff Cadre', 'Worker Cadre'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCadreFilter(c)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      selectedCadreFilter === c
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d]'
                    }`}
                  >
                    {c === 'all' ? 'All Cadres (21 Grades)' : c}
                  </button>
                ))}
              </div>
              <span className="text-xs text-[#8b949e]">
                Applicable SBUs: <strong className="text-indigo-300">SFCO, SFF, SFJ, SFW</strong>
              </span>
            </div>

            {/* Master Matrix Table */}
            <div className="overflow-y-auto flex-1 p-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#30363d] text-[#8b949e] uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Grade Code</th>
                    <th className="py-2.5 px-3">Designation / Title</th>
                    <th className="py-2.5 px-3">Cadre &amp; Layer</th>
                    <th className="py-2.5 px-3">Min Service Length</th>
                    <th className="py-2.5 px-3">Target Score Hurdle</th>
                    <th className="py-2.5 px-3">Key Hard Skills</th>
                    <th className="py-2.5 px-3">Sample KPIs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]/50">
                  {GRADING_LADDER.filter((g) => selectedCadreFilter === 'all' || g.cadre === selectedCadreFilter).map((grade) => (
                    <tr key={grade.code} className="hover:bg-[#21262d]/50 transition">
                      <td className="py-3 px-3">
                        <span className="font-mono font-extrabold text-indigo-300 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30">
                          {grade.code}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-[#e6edf3]">{grade.designationTitle}</p>
                        <p className="text-[11px] text-[#8b949e]">{grade.shortTitle}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-[#c9d1d9] font-medium">{grade.cadre}</p>
                        <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full bg-[#30363d] text-[#8b949e]">
                          {grade.layer}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-[#e6edf3]">{grade.minServiceYears} Years</p>
                        <p className="text-[10px] font-mono text-[#8b949e]">({grade.minServiceMonths} Months)</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md font-mono font-bold text-xs ${
                          grade.benchmarkScore >= 85
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : grade.benchmarkScore >= 70
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          ≥ {grade.benchmarkScore}%
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {grade.keyHardSkills.slice(0, 3).map((skill) => (
                            <span key={skill} className="px-1.5 py-0.5 rounded text-[10px] bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <ul className="list-disc list-inside text-[11px] text-[#8b949e] space-y-0.5">
                          {grade.sampleKpis.slice(0, 2).map((kpi, idx) => (
                            <li key={idx} className="truncate" title={kpi}>{kpi}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-[#30363d] bg-[#21262d]/60 flex items-center justify-between text-xs text-[#8b949e]">
              <span>Rule Enforcement: Evaluates candidate experience length against minServiceYears and marks "Qualified", "Promising (Tenure Gap)", or "Below Hurdle".</span>
              <button
                type="button"
                onClick={() => setShowGradingModal(false)}
                className="px-4 py-2 rounded-xl font-bold bg-[#30363d] hover:bg-[#3c444d] text-white transition cursor-pointer"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

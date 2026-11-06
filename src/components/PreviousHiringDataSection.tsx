/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Archive,
  ArrowUpRight,
  Award,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { Candidate, JobRequisition } from '../types';
import { exportCandidatesToExcel, exportCandidatesToCSV } from '../utils/excelExport';

interface PreviousHiringDataSectionProps {
  historicalRequisitions: JobRequisition[];
  onRestoreRequisition: (req: JobRequisition) => void;
  onUseAsTemplate: (req: JobRequisition) => void;
  onDeleteHistoricalRequisition: (id: string) => void;
  onOpenCandidateDetail: (candidate: Candidate) => void;
  companyName: string;
}

export const PreviousHiringDataSection: React.FC<PreviousHiringDataSectionProps> = ({
  historicalRequisitions,
  onRestoreRequisition,
  onUseAsTemplate,
  onDeleteHistoricalRequisition,
  onOpenCandidateDetail,
  companyName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'filled' | 'closed' | 'cancelled'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [expandedReqId, setExpandedReqId] = useState<string | null>(
    historicalRequisitions[0]?.id || null
  );

  // Confirmation modal states
  const [confirmRestoreReq, setConfirmRestoreReq] = useState<JobRequisition | null>(null);
  const [confirmDeleteReq, setConfirmDeleteReq] = useState<JobRequisition | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Extract departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    historicalRequisitions.forEach((r) => {
      if (r.department) set.add(r.department);
    });
    return Array.from(set);
  }, [historicalRequisitions]);

  // Filtered requisitions
  const filteredRequisitions = useMemo(() => {
    return historicalRequisitions.filter((req) => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (deptFilter !== 'all' && req.department !== deptFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inId = req.id.toLowerCase().includes(q);
        const inTitle = req.title.toLowerCase().includes(q);
        const inDept = req.department.toLowerCase().includes(q);
        const inNotes = (req.archiveNotes || '').toLowerCase().includes(q);
        const inHired = (req.hiredCandidateName || '').toLowerCase().includes(q);
        const inCandidate = (req.historicalCandidates || []).some((c) =>
          c.name.toLowerCase().includes(q)
        );
        if (!inId && !inTitle && !inDept && !inNotes && !inHired && !inCandidate) {
          return false;
        }
      }

      return true;
    });
  }, [historicalRequisitions, statusFilter, deptFilter, searchQuery]);

  const totalFilled = historicalRequisitions.filter((r) => r.status === 'filled').length;
  const totalClosed = historicalRequisitions.filter((r) => r.status === 'closed').length;
  const totalCancelled = historicalRequisitions.filter((r) => r.status === 'cancelled').length;
  const totalArchivedCandidates = historicalRequisitions.reduce(
    (acc, r) => acc + (r.historicalCandidates?.length || 0),
    0
  );

  const getStatusBadge = (status: JobRequisition['status']) => {
    switch (status) {
      case 'filled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Filled / Hired
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-200 text-zinc-800 border border-zinc-300">
            <Archive className="w-3.5 h-3.5 text-zinc-600" />
            Closed / Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700">
            Archived
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Historical Section Header */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-zinc-900">
                  Previous Hiring Data & Historical Requisitions
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                  Historical Archive
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Dedicated repository of completed, filled, and closed recruitment cycles. Preserves job descriptions, candidate evaluations, scores, and HR decision audit dates.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-center">
              <div className="text-[10px] uppercase font-bold text-zinc-400">Archived Requisitions</div>
              <div className="text-base font-black text-zinc-900">{historicalRequisitions.length}</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Positions Filled</div>
              <div className="text-base font-black text-emerald-800">{totalFilled}</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5 text-center">
              <div className="text-[10px] uppercase font-bold text-purple-700">Retained Candidates</div>
              <div className="text-base font-black text-purple-800">{totalArchivedCandidates}</div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search historical requisitions by title, ID, department, or candidate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-zinc-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-500 font-medium">Status:</span>
              <select
                aria-label="Filter by Archive Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent font-bold text-zinc-800 outline-none cursor-pointer"
              >
                <option value="all">All Statuses ({historicalRequisitions.length})</option>
                <option value="filled">Filled ({totalFilled})</option>
                <option value="closed">Closed ({totalClosed})</option>
                <option value="cancelled">Cancelled ({totalCancelled})</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-zinc-500 font-medium">Department:</span>
              <select
                aria-label="Filter by Department"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-transparent font-bold text-zinc-800 outline-none cursor-pointer max-w-[150px]"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Advisory Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 px-4 flex items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-sm">⚖️</span>
          <span className="font-semibold">
            Historical Recruitment Archive: Evaluated candidates and rankings in this folder reflect closed hiring periods and are kept separate from active recruitment.
          </span>
        </div>
        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 shrink-0 hidden sm:inline">
          Archived Records
        </span>
      </div>

      {/* Requisitions List */}
      {filteredRequisitions.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-zinc-300 p-12 text-center space-y-3">
          <Archive className="w-10 h-10 text-zinc-400 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-800">No Historical Requisitions Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            No archived job positions match the selected filters or search terms.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequisitions.map((req) => {
            const isExpanded = expandedReqId === req.id;
            const candidates = req.historicalCandidates || [];

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden transition-all duration-200"
              >
                {/* Requisition Card Header */}
                <div
                  className="p-5 bg-zinc-50/60 border-b border-zinc-200 cursor-pointer select-none hover:bg-zinc-50 transition"
                  onClick={() => setExpandedReqId(isExpanded ? null : req.id)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 border border-zinc-300">
                          {req.id}
                        </span>
                        <h3 className="text-base font-bold text-zinc-900">{req.title}</h3>
                        {getStatusBadge(req.status)}
                        {req.hiringCategory === 'top_priority' && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            Was Top Priority
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                        <span>
                          <strong>Dept:</strong> {req.department}
                        </span>
                        <span>
                          <strong>Period:</strong> {req.createdAt} to {req.closedAt || req.archivedAt || 'Closed'}
                        </span>
                        <span>
                          <strong>Experience Level:</strong> {req.experienceLevel}
                        </span>
                        {req.hiredCandidateName && (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Hired: {req.hiredCandidateName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      className="flex items-center gap-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Use as Template */}
                      <button
                        type="button"
                        onClick={() => onUseAsTemplate(req)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-lg transition shadow-2xs cursor-pointer"
                        title="Create a new active requisition using this job description as a template"
                      >
                        <Copy className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Use as Template</span>
                      </button>

                      {/* Restore to Active Hiring */}
                      <button
                        type="button"
                        onClick={() => setConfirmRestoreReq(req)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition shadow-2xs cursor-pointer"
                        title="Restore this requisition to active hiring pool"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Restore to Active</span>
                      </button>

                      {/* Permanent Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDeleteReq(req);
                          setDeleteConfirmationText('');
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Permanently delete historical requisition (Data Retention Policy)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Chevron */}
                      <button
                        type="button"
                        onClick={() => setExpandedReqId(isExpanded ? null : req.id)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-200 transition cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {req.archiveNotes && (
                    <div className="mt-2 text-xs text-zinc-600 bg-white/70 p-2 rounded-lg border border-zinc-200">
                      <strong>HR Archive Notes:</strong> {req.archiveNotes}
                    </div>
                  )}
                </div>

                {/* Expanded Historical Dossier */}
                {isExpanded && (
                  <div className="p-5 space-y-5">
                    {/* Job Description Summary */}
                    <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                          Historical Job Description & Requirements
                        </h4>
                        <span className="text-[11px] text-zinc-400">
                          Requisition {req.id} · {req.department}
                        </span>
                      </div>
                      <div className="max-h-36 overflow-y-auto text-xs text-zinc-700 font-mono whitespace-pre-wrap bg-white p-3 rounded-lg border border-zinc-200">
                        {req.content}
                      </div>
                    </div>

                    {/* Evaluated Candidates Header & Export */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span>Historical Evaluated Candidates ({candidates.length})</span>
                        </h4>
                        <p className="text-xs text-zinc-500">
                          Ranked by total match score obtained during this recruitment cycle.
                        </p>
                      </div>

                      {candidates.length > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              exportCandidatesToExcel(
                                candidates,
                                `Historical_${req.id}_Rankings`,
                                false,
                                companyName
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Export Excel</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              exportCandidatesToCSV(
                                candidates,
                                `Historical_${req.id}_Rankings`,
                                false,
                                companyName
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Export CSV</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Historical Candidates Table */}
                    {candidates.length === 0 ? (
                      <div className="bg-zinc-50 rounded-xl p-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-200">
                        No candidate evaluation files were linked to this archived requisition.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-zinc-200">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase text-[11px]">
                              <th className="py-2.5 px-3 text-center w-14">Rank</th>
                              <th className="py-2.5 px-3 min-w-[150px]">Candidate Name</th>
                              <th className="py-2.5 px-3 text-center min-w-[90px]">Score /100</th>
                              <th className="py-2.5 px-3 min-w-[100px]">Experience</th>
                              <th className="py-2.5 px-3 min-w-[160px]">Key Verified Skills</th>
                              <th className="py-2.5 px-3 min-w-[120px]">HR Decision</th>
                              <th className="py-2.5 px-3 min-w-[100px]">Decision Date</th>
                              <th className="py-2.5 px-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200">
                            {candidates.map((cand, idx) => (
                              <tr key={cand.id} className="hover:bg-zinc-50/70 transition">
                                <td className="py-2.5 px-3 text-center font-black">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded ${
                                      (cand.rank ?? idx + 1) === 1
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : 'bg-zinc-100 text-zinc-700'
                                    }`}
                                  >
                                    #{cand.rank ?? idx + 1}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="font-bold text-zinc-900">{cand.name}</div>
                                  <div className="text-[11px] text-zinc-400 font-mono truncate max-w-[180px]">
                                    {cand.fileName}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span
                                    className={`inline-block px-2.5 py-0.5 rounded-lg font-black border ${
                                      cand.score >= 85
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : cand.score >= 70
                                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                                          : 'bg-amber-100 text-amber-800 border-amber-300'
                                    }`}
                                  >
                                    {cand.score}/100
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="font-semibold text-zinc-800">
                                    {(cand.relevantExperienceYears ?? cand.totalYearsExperience ?? 0).toFixed(1)} Yrs
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                                    {(cand.matchingQualifications || cand.skills || [])
                                      .slice(0, 2)
                                      .map((s, i) => (
                                        <span
                                          key={i}
                                          className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] truncate max-w-[180px]"
                                        >
                                          ✓ {s}
                                        </span>
                                      ))}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
                                      cand.status === 'shortlisted'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : cand.status === 'on_hold'
                                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                                          : cand.status === 'rejected'
                                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                                            : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                                    }`}
                                  >
                                    {cand.status === 'shortlisted'
                                      ? 'Shortlisted'
                                      : cand.status === 'on_hold'
                                        ? 'On Hold'
                                        : cand.status === 'rejected'
                                          ? 'Rejected'
                                          : 'Pending Review'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px]">
                                  {cand.hrDecisionDate || req.closedAt || '—'}
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => onOpenCandidateDetail(cand)}
                                    className="p-1.5 text-zinc-600 hover:text-indigo-600 hover:bg-zinc-100 rounded-md transition cursor-pointer"
                                    title="View Historical 6-Criteria Dossier & CV Text"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal: Restore Requisition */}
      {confirmRestoreReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  Restore Requisition to Active Hiring?
                </h3>
                <p className="text-xs text-zinc-500">Requisition ID: {confirmRestoreReq.id}</p>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5 text-xs text-zinc-700">
              <div>
                <strong>Job Position:</strong> {confirmRestoreReq.title}
              </div>
              <div>
                <strong>Department:</strong> {confirmRestoreReq.department}
              </div>
              <p className="text-zinc-500 text-[11px] pt-1 border-t border-zinc-200">
                Restoring this requisition moves it back into the active hiring pool as <strong>Current Hiring</strong>. Historical candidate decisions remain preserved in the archive record. You can upload new candidate CVs or initiate a fresh evaluation against updated requirements.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRestoreReq(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onRestoreRequisition(confirmRestoreReq);
                  setConfirmRestoreReq(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs cursor-pointer"
              >
                Confirm & Restore Requisition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Permanent Delete */}
      {confirmDeleteReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  Permanent Record Deletion
                </h3>
                <p className="text-xs text-zinc-500">Data Retention Policy Verification</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-2">
              <p className="font-semibold">
                Are you sure you want to permanently delete requisition &quot;{confirmDeleteReq.id} — {confirmDeleteReq.title}&quot;?
              </p>
              <p className="text-[11px] text-rose-700">
                This action is irreversible and permanently purges all historical candidate scoring and decision records. Ensure this complies with organizational HR document retention guidelines.
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-zinc-700">
                Type <span className="font-mono font-bold text-rose-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteReq(null);
                  setDeleteConfirmationText('');
                }}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText !== 'DELETE'}
                onClick={() => {
                  if (deleteConfirmationText === 'DELETE') {
                    onDeleteHistoricalRequisition(confirmDeleteReq.id);
                    setConfirmDeleteReq(null);
                    setDeleteConfirmationText('');
                  }
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  deleteConfirmationText === 'DELETE'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                }`}
              >
                Permanently Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

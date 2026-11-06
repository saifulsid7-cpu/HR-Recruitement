/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Archive,
  Briefcase,
  Eye,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import {
  Candidate,
  HiringCategory,
  JobRequisition,
  NavigationMenuTab,
  RequisitionStatus,
} from '../types';
import { EditPositionModal } from './EditPositionModal';
import { PositionDetailsModal } from './PositionDetailsModal';
import { NewRequisitionModal } from './NewRequisitionModal';

interface JobsManagementViewProps {
  activeRequisitions: JobRequisition[];
  historicalRequisitions: JobRequisition[];
  candidates: Candidate[];
  onSelectRequisitionForScreening: (req: JobRequisition) => void;
  onUpdateRequisitionStatus: (reqId: string, newStatus: RequisitionStatus) => void;
  onUpdateRequisitionPriority?: (reqId: string, priority: HiringCategory) => void;
  onCreateRequisition: (req: JobRequisition) => void;
  onUpdateRequisition?: (updated: JobRequisition) => void;
  onDeletePosition?: (reqId: string) => void;
  onOpenNewJobModal?: () => void;
  onOpenArchiveModal: (req: JobRequisition) => void;
  onNavigateTab: (tab: NavigationMenuTab) => void;
}

export const JobsManagementView: React.FC<JobsManagementViewProps> = ({
  activeRequisitions,
  historicalRequisitions,
  candidates,
  onSelectRequisitionForScreening,
  onUpdateRequisitionStatus,
  onCreateRequisition,
  onUpdateRequisition,
  onDeletePosition,
  onOpenNewJobModal,
  onOpenArchiveModal,
  onNavigateTab,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'open' | 'on_hold' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocalCreateOpen, setIsLocalCreateOpen] = useState(false);
  const [editingRequisition, setEditingRequisition] = useState<JobRequisition | null>(null);
  const [viewingRequisition, setViewingRequisition] = useState<JobRequisition | null>(null);

  const allRequisitions = [...activeRequisitions, ...historicalRequisitions];

  const openCount = activeRequisitions.filter(
    (r) => r.status === 'open' || r.status === 'active'
  ).length;
  const onHoldCount = activeRequisitions.filter((r) => r.status === 'on_hold').length;
  const closedCount = [
    ...historicalRequisitions,
    ...activeRequisitions.filter(
      (r) => r.status === 'closed' || r.status === 'filled' || r.status === 'cancelled'
    ),
  ].length;

  const filteredList = allRequisitions.filter((req) => {
    if (filterTab === 'open' && !(req.status === 'open' || req.status === 'active')) {
      return false;
    }
    if (filterTab === 'on_hold' && req.status !== 'on_hold') {
      return false;
    }
    if (
      filterTab === 'closed' &&
      !(req.status === 'closed' || req.status === 'filled' || req.status === 'cancelled')
    ) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (req.title || '').toLowerCase().includes(q);
      const matchDept = (req.department || '').toLowerCase().includes(q);
      const matchReqNo = (req.requisitionNo || '').toLowerCase().includes(q);
      const matchLoc = (req.sbuUnit || '').toLowerCase().includes(q);
      const matchGrade = (req.targetGradeCode || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDept && !matchReqNo && !matchLoc && !matchGrade) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6 text-[#e6edf3]">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#30363d]">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold text-[#e6edf3]">
              Job Requisition Management
            </h1>
          </div>
          <p className="text-xs text-[#8b949e] mt-1">
            Create, edit, and synchronize job requisitions bi-directionally with the Hiring Tracker.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onOpenNewJobModal) {
              onOpenNewJobModal();
            } else {
              setIsLocalCreateOpen(true);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/40 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Position</span>
        </button>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              filterTab === 'all'
                ? 'bg-[#21262d] text-white border border-indigo-500/50'
                : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]/50'
            }`}
          >
            All Jobs ({allRequisitions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('open')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              filterTab === 'open'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50'
                : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]/50'
            }`}
          >
            Open ({openCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('on_hold')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              filterTab === 'on_hold'
                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/50'
                : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]/50'
            }`}
          >
            On Hold ({onHoldCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('closed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              filterTab === 'closed'
                ? 'bg-[#21262d] text-[#8b949e] border border-[#30363d]'
                : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]/50'
            }`}
          >
            Closed ({closedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, req no, dept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#161b22] border border-[#30363d] rounded-lg text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Dynamic Clean Job Cards Grid (Displays ONLY filled-in criteria; hides all blank/unfilled fields) */}
      {filteredList.length === 0 ? (
        <div className="bg-[#21262d] rounded-2xl border border-[#30363d] p-10 text-center space-y-3">
          <Briefcase className="w-8 h-8 text-[#8b949e]/60 mx-auto" />
          <p className="text-sm font-semibold text-[#e6edf3]">
            No job requisitions found
          </p>
          <p className="text-xs text-[#8b949e] max-w-md mx-auto">
            Click &ldquo;Create New Position&rdquo; to add a job requisition or add an entry in the Hiring Tracker.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredList.map((req) => {
            const candidateCount = candidates.filter(
              (c) =>
                c.requisitionId === req.id ||
                (req.title &&
                  c.appliedPosition
                    .toLowerCase()
                    .includes(req.title.toLowerCase().slice(0, 10)))
            ).length;

            // Extract ONLY non-empty fields among the 18 designated parameters
            const reqNo = req.requisitionNo?.trim();
            const dept = req.department?.trim();
            const salary = req.salaryRange?.trim();
            const location = req.sbuUnit?.trim();
            const kra = (req.keyResponsibilities || req.jobDescription || '').trim();
            const ksa = (req.keyKSA || req.jobRequirements || '').trim();
            const academics =
              req.academicDegrees && req.academicDegrees.length > 0
                ? req.academicDegrees
                : null;
            const experience =
              req.experienceLevel && req.experienceLevel !== 'Any Experience'
                ? req.experienceLevel.trim()
                : req.minExperienceYears !== undefined
                  ? `${req.minExperienceYears} Years`
                  : '';
            const industries =
              req.industries && req.industries.length > 0
                ? req.industries
                : req.companyFit?.industrySegment &&
                    req.companyFit.industrySegment.length > 0
                  ? req.companyFit.industrySegment
                  : null;
            const rmgType =
              req.rmgType && req.rmgType.length > 0
                ? req.rmgType
                : req.companyFit?.rmgDivisions &&
                    req.companyFit.rmgDivisions.length > 0
                  ? req.companyFit.rmgDivisions
                  : null;
            const rmgProducts =
              req.rmgProducts && req.rmgProducts.length > 0
                ? req.rmgProducts
                : null;
            const buyers =
              req.buyerPortfolio && req.buyerPortfolio.length > 0
                ? req.buyerPortfolio
                : null;
            const hardSkills =
              req.hardTechnicalSkills && req.hardTechnicalSkills.length > 0
                ? req.hardTechnicalSkills
                : req.softwareTools && req.softwareTools.length > 0
                  ? req.softwareTools
                  : null;
            const companyName = req.companyName?.trim();
            const companyType = (
              req.companyType ||
              req.companyFit?.workplaceNature ||
              ''
            ).trim();
            const jobType = req.jobType?.trim();
            const jobGrade = req.targetGradeCode?.trim();
            const benefits = req.compensationBenefits?.trim();

            const filledMetadata: { label: string; value: string; mono?: boolean }[] = [
              ...(dept ? [{ label: 'Department', value: dept }] : []),
              ...(location ? [{ label: 'Job Location', value: location, mono: true }] : []),
              ...(salary ? [{ label: 'Salary Range', value: salary, mono: true }] : []),
              ...(experience ? [{ label: 'Experience', value: experience }] : []),
              ...(jobType ? [{ label: 'Job Type', value: jobType }] : []),
              ...(companyName ? [{ label: 'Company', value: companyName }] : []),
              ...(companyType ? [{ label: 'Company Type', value: companyType }] : []),
              ...(jobGrade ? [{ label: 'Job Grade', value: jobGrade }] : []),
            ];

            return (
              <div
                key={req.id}
                className="bg-[#21262d] rounded-2xl border border-[#30363d] hover:border-indigo-500/40 p-5 flex flex-col justify-between gap-4 transition shadow-sm"
              >
                {/* Card Header: Position Title + Optional Requisition No + Status + Edit Button */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {reqNo && (
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-500/40">
                            {reqNo}
                          </span>
                        )}
                        <select
                          aria-label="Requisition status"
                          value={req.status}
                          onChange={(e) =>
                            onUpdateRequisitionStatus(
                              req.id,
                              e.target.value as RequisitionStatus
                            )
                          }
                          className={`text-[11px] font-bold rounded-lg px-2 py-0.5 border transition cursor-pointer outline-none ${
                            req.status === 'open' || req.status === 'active'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                              : req.status === 'on_hold'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                : 'bg-[#161b22] text-[#8b949e] border-[#30363d]'
                          }`}
                        >
                          <option value="open">Open</option>
                          <option value="on_hold">On Hold</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>

                      <h3 className="text-base font-extrabold text-[#e6edf3] truncate">
                        {req.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingRequisition(req)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#161b22] hover:bg-[#30363d] text-indigo-300 border border-[#30363d] hover:border-indigo-500/50 transition cursor-pointer shrink-0"
                      title="Edit Position"
                    >
                      <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Filled Metadata Grid (Only rendered if at least 1 metadata field is non-empty) */}
                  {filledMetadata.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {filledMetadata.map((item) => (
                        <div
                          key={item.label}
                          className="px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d]/80"
                        >
                          <span className="text-[10px] text-[#8b949e] font-semibold block">
                            {item.label}
                          </span>
                          <span
                            className={`text-xs font-bold text-[#e6edf3] block truncate ${
                              item.mono ? 'font-mono text-indigo-300' : ''
                            }`}
                            title={item.value}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Filled Tag Groups (Academic Qualifications, Industries, RMG Type, RMG Products, Buyer Name) */}
                  {(academics || industries || rmgType || rmgProducts || buyers) && (
                    <div className="space-y-2 pt-1">
                      {academics && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase text-[#8b949e]">
                            Academic:
                          </span>
                          {academics.map((deg) => (
                            <span
                              key={deg}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                            >
                              {deg}
                            </span>
                          ))}
                        </div>
                      )}

                      {industries && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase text-[#8b949e]">
                            Industries:
                          </span>
                          {industries.map((ind) => (
                            <span
                              key={ind}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-500/30"
                            >
                              {ind}
                            </span>
                          ))}
                        </div>
                      )}

                      {(rmgType || rmgProducts) && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase text-[#8b949e]">
                            RMG:
                          </span>
                          {rmgType?.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-500/30"
                            >
                              {t}
                            </span>
                          ))}
                          {rmgProducts?.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950/60 text-indigo-200 border border-indigo-500/30"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}

                      {buyers && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase text-[#8b949e]">
                            Buyers:
                          </span>
                          {buyers.map((b) => (
                            <span
                              key={b}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      )}

                      {hardSkills && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase text-[#8b949e]">
                            Hard Skills:
                          </span>
                          {hardSkills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/30"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Filled KRA / KSA / Compensation & Benefits */}
                  {kra && (
                    <div className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d]/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[#8b949e] block">
                        Job Responsibilities (KRA)
                      </span>
                      <p className="text-xs text-[#c9d1d9] whitespace-pre-wrap line-clamp-3 leading-relaxed">
                        {kra}
                      </p>
                    </div>
                  )}

                  {ksa && (
                    <div className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d]/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[#8b949e] block">
                        Job Specification (KSA)
                      </span>
                      <p className="text-xs text-[#c9d1d9] whitespace-pre-wrap line-clamp-3 leading-relaxed">
                        {ksa}
                      </p>
                    </div>
                  )}

                  {benefits && (
                    <div className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d]/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[#8b949e] block">
                        Compensation &amp; Benefits
                      </span>
                      <p className="text-xs text-[#c9d1d9] whitespace-pre-wrap line-clamp-2 leading-relaxed">
                        {benefits}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-[#30363d] flex items-center justify-between gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRequisitionForScreening(req);
                      onNavigateTab('screening');
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#161b22] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{candidateCount} Attached</span>
                  </button>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setViewingRequisition(req)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#161b22] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
                      title="View Full Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectRequisitionForScreening(req);
                        onNavigateTab('screening');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition cursor-pointer"
                      title="Open in CV Screening Engine"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Screen CVs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenArchiveModal(req)}
                      className="p-1.5 rounded-lg text-[#8b949e] hover:text-amber-300 hover:bg-[#161b22] transition cursor-pointer"
                      title="Archive Requisition"
                    >
                      <Archive className="w-4 h-4" />
                    </button>

                    {onDeletePosition && (
                      <button
                        type="button"
                        onClick={() => onDeletePosition(req.id)}
                        className="p-1.5 rounded-lg text-[#8b949e] hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                        title="Delete Position"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Local Create Modal fallback */}
      <NewRequisitionModal
        isOpen={isLocalCreateOpen}
        onClose={() => setIsLocalCreateOpen(false)}
        onCreateRequisition={onCreateRequisition}
      />

      {/* Edit Position Modal */}
      <EditPositionModal
        isOpen={!!editingRequisition}
        requisition={editingRequisition}
        onClose={() => setEditingRequisition(null)}
        onSave={(updated) => {
          if (onUpdateRequisition) {
            onUpdateRequisition(updated);
          }
        }}
      />

      {/* View Position Details Modal */}
      <PositionDetailsModal
        isOpen={!!viewingRequisition}
        requisition={viewingRequisition}
        onClose={() => setViewingRequisition(null)}
        onEditPosition={(req) => setEditingRequisition(req)}
        onScreenPosition={(req) => {
          onSelectRequisitionForScreening(req);
          onNavigateTab('screening');
        }}
      />
    </div>
  );
};

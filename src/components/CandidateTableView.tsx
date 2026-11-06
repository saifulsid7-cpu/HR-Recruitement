/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Mail,
  Phone,
  Scale,
  ShieldAlert,
  Sparkles,
  Tag,
  XCircle,
  Zap,
} from 'lucide-react';
import { Candidate, CandidateStatus, STATUS_LABELS } from '../types';
import {
  getCandidateActionOpinion,
  getCandidateScoreBreakdown,
  getCandidateStrengthsAndGaps,
  getVerdictBadge,
} from '../utils/scoringCardHelper';
import { TriMatchCardSection } from './TriMatchCardSection';
import { evaluateGradeFitAndTenure } from '../utils/gradeFitHelper';

interface CandidateTableViewProps {
  candidates: Candidate[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onUpdateStatus: (id: string, status: CandidateStatus) => void;
  onOpenDetailModal: (candidate: Candidate) => void;
  onOpenOfferMemo: (candidate: Candidate) => void;
  onOpenRejectionNotice: (candidate: Candidate) => void;
  onOpenSalaryAdjustModal: (candidate: Candidate) => void;
  onOpenMovePosition?: (candidate: Candidate) => void;
  blindMode: boolean;
  companyName: string;
}

export const CandidateTableView: React.FC<CandidateTableViewProps> = ({
  candidates,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onUpdateStatus,
  onOpenDetailModal,
  onOpenOfferMemo,
  onOpenRejectionNotice,
  onOpenSalaryAdjustModal,
  onOpenMovePosition,
  blindMode,
  companyName,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getCompletenessBadge = (completeness?: Candidate['evidenceCompleteness']) => {
    if (!completeness) {
      return <span className="text-[#8b949e] text-xs font-medium">N/A</span>;
    }

    const pct = completeness.percentage ?? 80;
    let barColor = 'bg-rose-500';
    let textColor = 'text-rose-400';
    if (pct >= 80) {
      barColor = 'bg-emerald-500';
      textColor = 'text-emerald-400';
    } else if (pct >= 65) {
      barColor = 'bg-teal-500';
      textColor = 'text-teal-400';
    } else if (pct >= 50) {
      barColor = 'bg-amber-500';
      textColor = 'text-amber-400';
    }

    return (
      <div className="flex flex-col gap-1 min-w-[90px]">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className={textColor}>{completeness.level || 'High'}</span>
          <span className="font-mono text-[#8b949e]">{pct}%</span>
        </div>
        <div className="w-full bg-[#161b22] h-1.5 rounded-full overflow-hidden border border-[#30363d]">
          <div className={`h-full ${barColor} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  const allSelected = candidates.length > 0 && selectedIds.length === candidates.length;

  return (
    <div className="bg-[#21262d] rounded-xl border border-[#30363d] shadow-sm overflow-hidden text-[#e6edf3]">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#161b22] border-b border-[#30363d] text-[#8b949e] font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  aria-label="Select all candidates"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="rounded border-[#30363d] bg-[#0d1117] text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 w-16 text-center">Rank</th>
              <th className="py-3 px-4 min-w-[170px]">Candidate Name</th>
              <th className="py-3 px-4 min-w-[160px]">Applied Position</th>
              <th className="py-3 px-3 text-center min-w-[120px]">Match & Verdict</th>
              <th className="py-3 px-3 min-w-[100px]">Relevant Exp.</th>
              <th className="py-3 px-4 min-w-[190px]">Key Strengths</th>
              <th className="py-3 px-4 min-w-[190px]">Critical Gaps</th>
              <th className="py-3 px-3 min-w-[100px]">Evidence</th>
              <th className="py-3 px-3 min-w-[160px]">HR Decision Status</th>
              <th className="py-3 px-3 text-right min-w-[110px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363d]">
            {candidates.map((candidate, idx) => {
              const isSelected = selectedIds.includes(candidate.id);
              const isExpanded = expandedId === candidate.id;
              const displayName = blindMode ? `Candidate #${candidate.rank ?? idx + 1}` : candidate.name;
              const expYears = candidate.relevantExperienceYears ?? candidate.totalYearsExperience ?? 0;
              const verdictConfig = getVerdictBadge(candidate.score);
              const breakdown = getCandidateScoreBreakdown(candidate);
              const actionOpinion = getCandidateActionOpinion(candidate);
              const { strengths, gaps } = getCandidateStrengthsAndGaps(candidate);
              const gradeFit = candidate.gradeFit || evaluateGradeFitAndTenure({
                actualYears: candidate.totalYearsExperience ?? 0,
                candidateScore: candidate.score ?? 50,
                targetPositionTitle: candidate.appliedPosition || candidate.category,
                lastCompany: candidate.lastCompany,
                lastDesignation: candidate.lastDesignation,
              });

              return (
                <React.Fragment key={candidate.id}>
                  <tr
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-indigo-950/30'
                        : candidate.status === 'shortlisted'
                          ? 'bg-emerald-950/15 hover:bg-emerald-950/25'
                          : candidate.status === 'on_hold'
                            ? 'bg-amber-950/15 hover:bg-amber-950/25'
                            : candidate.status === 'rejected'
                              ? 'bg-rose-950/15 hover:bg-rose-950/25'
                              : 'hover:bg-[#161b22]/70'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center align-middle">
                      <input
                        type="checkbox"
                        aria-label={`Select ${displayName}`}
                        checked={isSelected}
                        onChange={() => onToggleSelect(candidate.id)}
                        className="rounded border-[#30363d] bg-[#0d1117] text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>

                    {/* Rank */}
                    <td className="py-3 px-3 text-center align-middle">
                      <div className="flex flex-col items-center">
                        <span
                          className={`inline-flex items-center justify-center font-black rounded-md px-2 py-0.5 text-xs ${
                            (candidate.rank ?? idx + 1) === 1
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold'
                              : (candidate.rank ?? idx + 1) <= 3
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-bold'
                                : 'bg-[#161b22] text-[#8b949e] border border-[#30363d]'
                          }`}
                        >
                          #{(candidate.rank ?? idx + 1)}
                        </span>
                        {candidate.isTied && (
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-tighter mt-0.5">
                            Tied
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Candidate Name & Contact */}
                    <td className="py-3 px-4 align-middle">
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => onOpenDetailModal(candidate)}
                          className="font-bold text-[#e6edf3] hover:text-indigo-400 hover:underline cursor-pointer text-left block text-sm"
                        >
                          {displayName}
                        </button>
                        {/* Candidate's Actual Designation from CV */}
                        <div className="text-[11px] font-semibold text-indigo-300 truncate max-w-[170px]" title="Actual Career Track">
                          {candidate.lastDesignation || candidate.experience?.[0]?.role || 'Professional'}
                          {candidate.lastCompany ? ` • ${candidate.lastCompany}` : ''}
                        </div>
                        {!blindMode && candidate.email && (
                          <div className="text-[11px] text-[#8b949e] flex items-center gap-1 truncate max-w-[160px]">
                            <Mail className="w-3 h-3 text-[#8b949e] shrink-0" />
                            <span className="truncate">{candidate.email}</span>
                          </div>
                        )}
                        <span className="text-[10px] text-[#8b949e] font-mono truncate block max-w-[170px]" title={candidate.fileName}>
                          {candidate.fileName}
                        </span>
                      </div>
                    </td>

                    {/* Applied Position */}
                    <td className="py-3 px-4 align-middle">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[#161b22] text-[#e6edf3] border border-[#30363d]">
                            Target: {candidate.appliedPosition || candidate.category}
                          </span>
                          {candidate.workEnvironment && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                              {candidate.workEnvironment}
                            </span>
                          )}
                        </div>

                        {gradeFit && (
                          <div className="flex items-center gap-1">
                            <span className="inline-block text-[10px] font-bold text-indigo-300 bg-indigo-950/70 px-1.5 py-0.5 rounded border border-indigo-700/50">
                              {gradeFit.targetGradeCode} ({gradeFit.targetGradeTitle})
                            </span>
                          </div>
                        )}

                        {/* Product Specialization tags */}
                        {candidate.productSpecialization && candidate.productSpecialization.length > 0 && (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {candidate.productSpecialization.slice(0, 2).map((p, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/60"
                              >
                                {p}
                              </span>
                            ))}
                            {candidate.productSpecialization.length > 2 && (
                              <span className="text-[9px] text-[#8b949e]">
                                +{candidate.productSpecialization.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {candidate.salaryFixation && (
                          <div className="text-[11px] text-blue-400 font-medium">
                            {candidate.salaryFixation.grade} · TK {candidate.salaryFixation.fixedSalary?.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Match Score & Verdict Badge */}
                    <td className="py-3 px-3 text-center align-middle">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black border bg-[#161b22] ${verdictConfig.borderClass} ${verdictConfig.textClass}`}
                        >
                          {candidate.score.toFixed(0)}%
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold border ${verdictConfig.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${verdictConfig.dotClass}`} />
                          <span>{verdictConfig.label}</span>
                        </span>
                      </div>
                    </td>

                    {/* Relevant Experience */}
                    <td className="py-3 px-3 align-middle">
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#e6edf3]">
                          {expYears.toFixed(1)} Yrs
                        </span>
                        <span className="text-[11px] text-[#8b949e] block">
                          ({Math.round(expYears * 12)} mos)
                        </span>
                        {candidate.jobStability?.isFrequentJobChanger && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60">
                            &lt; 1.5y tenure
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Key Strengths */}
                    <td className="py-3 px-4 align-middle">
                      <div className="space-y-1 max-w-[210px]">
                        {strengths.slice(0, 2).map((skill, i) => (
                          <div
                            key={i}
                            className="text-[11px] text-[#e6edf3] flex items-start gap-1 truncate"
                            title={skill}
                          >
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span className="truncate">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Critical Gaps */}
                    <td className="py-3 px-4 align-middle">
                      <div className="space-y-1 max-w-[210px]">
                        {gaps.slice(0, 2).map((gap, i) => (
                          <div
                            key={i}
                            className="text-[11px] text-[#8b949e] flex items-start gap-1 truncate"
                            title={gap}
                          >
                            <span className="text-amber-400 font-bold shrink-0">⚠</span>
                            <span className="truncate">{gap}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Evidence Completeness */}
                    <td className="py-3 px-3 align-middle">
                      {getCompletenessBadge(candidate.evidenceCompleteness)}
                    </td>

                    {/* HR Decision Status (Human Controlled) */}
                    <td className="py-3 px-3 align-middle">
                      <div className="space-y-1">
                        <select
                          aria-label={`HR Decision Status for ${displayName}`}
                          value={candidate.status}
                          onChange={(e) => onUpdateStatus(candidate.id, e.target.value as CandidateStatus)}
                          className={`w-full text-xs font-bold rounded-lg px-2 py-1 border transition cursor-pointer outline-none ${
                            candidate.status === 'shortlisted'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                              : candidate.status === 'on_hold'
                                ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                                : candidate.status === 'rejected'
                                  ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                                  : 'bg-[#161b22] text-[#e6edf3] border-[#30363d]'
                          }`}
                        >
                          <option value="pending" className="bg-[#161b22] text-[#e6edf3]">
                            Pending HR Review
                          </option>
                          <option value="shortlisted" className="bg-[#161b22] text-emerald-300">
                            Shortlisted by HR
                          </option>
                          <option value="on_hold" className="bg-[#161b22] text-amber-300">
                            On Hold by HR
                          </option>
                          <option value="rejected" className="bg-[#161b22] text-rose-300">
                            Rejected by HR
                          </option>
                        </select>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right align-middle">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : candidate.id)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            isExpanded
                              ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                              : 'bg-[#161b22] text-[#8b949e] border-[#30363d] hover:text-[#e6edf3]'
                          }`}
                          title={isExpanded ? 'Collapse Candidate Breakdown' : 'Expand 4-Category Breakdown & Evidence'}
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenDetailModal(candidate)}
                          className="p-1.5 rounded-lg bg-[#161b22] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
                          title="Open Full Candidate Dossier"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenOfferMemo(candidate)}
                          className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 transition cursor-pointer"
                          title="Generate Selection / Offer Memo"
                        >
                          <Award className="w-3.5 h-3.5" />
                        </button>

                        {onOpenMovePosition && (
                          <button
                            type="button"
                            onClick={() => onOpenMovePosition(candidate)}
                            className="p-1.5 rounded-lg bg-[#161b22] hover:bg-[#30363d] text-blue-400 border border-[#30363d] transition cursor-pointer"
                            title="Assign / Move Candidate to Another Position"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Breakdown & Action Opinion Row */}
                  {isExpanded && (
                    <tr className="bg-[#161b22]/90 border-b border-[#30363d]">
                      <td colSpan={11} className="p-4">
                        <div className="bg-[#21262d] rounded-xl border border-[#30363d] p-4 space-y-4">
                          {/* 3-Pillar Tri-Match Architecture */}
                          <div className="p-3.5 rounded-xl border border-[#30363d] bg-[#161b22]">
                            <TriMatchCardSection candidate={candidate} />
                          </div>

                          {/* 4-Category Match Score Breakdown Grid */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold uppercase text-[#8b949e] block">
                              4-Category Match Score Breakdown (out of 100%):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                              <div className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-[#8b949e]">Domain Experience</span>
                                  <span className="text-blue-400">{breakdown.domainExperience.obtained}/{breakdown.domainExperience.max} ({breakdown.domainExperience.percentage}%)</span>
                                </div>
                                <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${breakdown.domainExperience.percentage}%` }} />
                                </div>
                              </div>

                              <div className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-[#8b949e]">KSA & Daily Duties</span>
                                  <span className="text-indigo-400">{breakdown.ksaDailyDuties.obtained}/{breakdown.ksaDailyDuties.max} ({breakdown.ksaDailyDuties.percentage}%)</span>
                                </div>
                                <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${breakdown.ksaDailyDuties.percentage}%` }} />
                                </div>
                              </div>

                              <div className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-[#8b949e]">Education</span>
                                  <span className="text-emerald-400">{breakdown.education.obtained}/{breakdown.education.max} ({breakdown.education.percentage}%)</span>
                                </div>
                                <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${breakdown.education.percentage}%` }} />
                                </div>
                              </div>

                              <div className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-[#8b949e]">Buyer & Software</span>
                                  <span className="text-purple-400">{breakdown.buyerSoftwareKnowledge.obtained}/{breakdown.buyerSoftwareKnowledge.max} ({breakdown.buyerSoftwareKnowledge.percentage}%)</span>
                                </div>
                                <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${breakdown.buyerSoftwareKnowledge.percentage}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Key Strengths vs Critical Gaps */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                              <span className="font-bold text-emerald-400 block">Key Strengths:</span>
                              <ul className="space-y-1 text-[#e6edf3]">
                                {strengths.map((str, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-emerald-400 font-bold">•</span>
                                    <span>{str}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                              <span className="font-bold text-amber-400 block">Critical Gaps:</span>
                              <ul className="space-y-1 text-[#8b949e]">
                                {gaps.map((gap, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-amber-400 font-bold">•</span>
                                    <span>{gap}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Quick Toolbar inside expanded row */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#30363d] text-xs">
                            <div className="text-[11px] text-[#8b949e]">
                              Advisory assessment · AI never makes recruitment decisions. All selections are strictly controlled by HR.
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onOpenDetailModal(candidate)}
                                className="px-3 py-1 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer text-xs"
                              >
                                View Complete Dossier
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Advisory Notice Table Footer */}
      <div className="px-4 py-2.5 bg-[#161b22] border-t border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-2xs text-[#8b949e]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#e6edf3]">Compliance Notice:</span>
          <span>AI-generated evaluation for HR review only. Scores and rankings are advisory and do not constitute a hiring decision.</span>
        </div>
        <span className="font-mono text-[11px] text-[#8b949e]">Showing {candidates.length} evaluated profiles</span>
      </div>
    </div>
  );
};

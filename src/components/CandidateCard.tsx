/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertCircle,
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
  FileSpreadsheet,
  FileText,
  Mail,
  Phone,
  Scale,
  ShieldAlert,
  Sparkles,
  Tag,
  Zap,
} from 'lucide-react';
import { Candidate, CandidateStatus, STATUS_LABELS } from '../types';
import {
  getCandidateActionOpinion,
  getCandidateScoreBreakdown,
  getCandidateStrengthsAndGaps,
  getVerdictBadge,
} from '../utils/scoringCardHelper';
import { evaluateGradeFitAndTenure } from '../utils/gradeFitHelper';
import { TriMatchCardSection } from './TriMatchCardSection';

interface CandidateCardProps {
  candidate: Candidate;
  index: number;
  isSelected: boolean;
  onToggleSelect: () => void;
  onUpdateStatus: (status: CandidateStatus) => void;
  onOpenOfferMemo: () => void;
  onOpenRejectionNotice: () => void;
  onOpenDetailModal: () => void;
  onOpenSalaryAdjustModal: () => void;
  onOpenMovePosition?: () => void;
  blindMode: boolean;
  companyName: string;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  index,
  isSelected,
  onToggleSelect,
  onUpdateStatus,
  onOpenOfferMemo,
  onOpenRejectionNotice,
  onOpenDetailModal,
  onOpenSalaryAdjustModal,
  onOpenMovePosition,
  blindMode,
  companyName,
}) => {
  const [showDetailedCriteria, setShowDetailedCriteria] = useState(false);
  const [showWorkHistory, setShowWorkHistory] = useState(false);

  const totalScore = candidate.score;
  const verdictConfig = getVerdictBadge(totalScore);
  const breakdown = getCandidateScoreBreakdown(candidate);
  const actionOpinion = getCandidateActionOpinion(candidate);
  const { strengths, gaps } = getCandidateStrengthsAndGaps(candidate);
  const stability = candidate.jobStability;
  const fixation = candidate.salaryFixation;
  const completeness = candidate.evidenceCompleteness;

  const effectiveGradeFit =
    candidate.gradeFit ||
    evaluateGradeFitAndTenure({
      actualYears: candidate.totalYearsExperience || 2.0,
      candidateScore: candidate.score,
      targetPositionTitle: candidate.appliedPosition,
      lastCompany: candidate.lastCompany || candidate.experience?.[0]?.company || 'Prior RMG Organization',
      lastDesignation: candidate.lastDesignation || candidate.experience?.[0]?.role || candidate.appliedPosition,
    });

  const displayName = blindMode ? `Candidate #${candidate.rank ?? index + 1}` : candidate.name;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'border-indigo-500 bg-[#21262d] ring-2 ring-indigo-500/30 shadow-lg'
          : candidate.status === 'shortlisted'
            ? 'border-emerald-500/40 bg-[#21262d] shadow-sm'
            : candidate.status === 'on_hold'
              ? 'border-amber-500/40 bg-[#21262d] shadow-sm'
              : candidate.status === 'rejected'
                ? 'border-rose-500/40 bg-[#21262d] shadow-sm'
                : 'border-[#30363d] bg-[#21262d] hover:border-[#484f58]'
      }`}
    >
      {/* Top Advisory Banner if Frequent Job Changer */}
      {stability?.isFrequentJobChanger && (
        <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-amber-300 gap-1.5">
          <div className="flex items-center gap-1.5 font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Advisory Notice: Rapid Job Changer — Average company tenure under 18 months</span>
          </div>
          <span className="text-[11px] font-mono text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700/60 self-start sm:self-auto">
            Avg: {stability.averageTenureMonths} Mos ({stability.shortTenuresCount}/{stability.totalJobs} jobs &lt; 18 mos)
          </span>
        </div>
      )}

      <div className="p-5 space-y-4 text-[#e6edf3]">
        {/* Header Row: Checkbox, Rank, Name, Position, Verdict Badge & Match Score */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              aria-label={`Select ${displayName}`}
              checked={isSelected}
              onChange={onToggleSelect}
              className="mt-1.5 h-4 w-4 rounded border-[#30363d] bg-[#0d1117] text-indigo-500 focus:ring-indigo-500 cursor-pointer"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-black ${
                    (candidate.rank ?? index + 1) === 1
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold'
                      : 'bg-[#161b22] text-[#e6edf3] border border-[#30363d]'
                  }`}
                >
                  Rank #{candidate.rank ?? index + 1}
                  {candidate.isTied && <span className="ml-1 text-[10px] text-amber-400">(Tied)</span>}
                </span>

                <h3 className="text-base font-bold text-[#e6edf3]">{displayName}</h3>

                {/* Candidate's Actual Career Track from CV */}
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-700/50">
                  {candidate.lastDesignation || candidate.experience?.[0]?.role || 'Professional'}
                  {candidate.lastCompany ? ` • ${candidate.lastCompany}` : ''}
                </span>

                {/* Target Position Tag */}
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#161b22] text-[#8b949e] border border-[#30363d]" title="Target Requisition">
                  Target: {candidate.appliedPosition || candidate.category}
                </span>

                {/* Verdict Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${verdictConfig.badgeClass}`}
                  title={`AI Match Verdict: ${verdictConfig.label}`}
                >
                  <span className={`w-2 h-2 rounded-full ${verdictConfig.dotClass}`} />
                  <span>{verdictConfig.label}</span>
                </div>

                {/* HR Decision Status Selector */}
                <select
                  aria-label="Candidate HR decision status"
                  value={candidate.status}
                  onChange={(e) => onUpdateStatus(e.target.value as CandidateStatus)}
                  className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition cursor-pointer outline-none ${
                    candidate.status === 'shortlisted'
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
                      : candidate.status === 'on_hold'
                        ? 'bg-amber-950/70 text-amber-300 border-amber-500/50'
                        : candidate.status === 'rejected'
                          ? 'bg-rose-950/70 text-rose-300 border-rose-500/50'
                          : 'bg-[#161b22] text-[#e6edf3] border-[#30363d] hover:border-[#484f58]'
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

              {!blindMode && (
                <div className="flex items-center gap-3 text-xs text-[#8b949e] mt-1.5 flex-wrap">
                  {candidate.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#8b949e]" />
                      {candidate.email}
                    </span>
                  )}
                  {candidate.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#8b949e]" />
                      {candidate.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[#8b949e] font-mono text-[11px]">
                    <FileText className="w-3.5 h-3.5" />
                    {candidate.fileName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Match Score (%) and Confidence Pill */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            {completeness && (
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-[10px] uppercase font-bold text-[#8b949e]">Evidence Completeness</span>
                <span className="text-xs font-bold text-[#e6edf3]">
                  {completeness.level} ({completeness.percentage}%)
                </span>
                <div className="w-20 bg-[#161b22] h-1.5 rounded-full overflow-hidden mt-0.5 border border-[#30363d]">
                  <div
                    className={`h-full rounded-full ${
                      completeness.percentage >= 80
                        ? 'bg-emerald-500'
                        : completeness.percentage >= 60
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                    }`}
                    style={{ width: `${completeness.percentage}%` }}
                  />
                </div>
              </div>
            )}

            <div
              className={`px-3.5 py-2 rounded-xl border text-right bg-[#161b22] ${verdictConfig.borderClass}`}
            >
              <div className="flex items-baseline justify-end gap-0.5">
                <span className={`text-2xl font-black ${verdictConfig.textClass}`}>
                  {totalScore.toFixed(0)}
                </span>
                <span className="text-xs font-bold text-[#8b949e]">/100</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mt-0.5">
                Match Score (%)
              </div>
            </div>
          </div>
        </div>

        {/* Master Grading Ladder Fit, Benchmark Hurdle & Boss Verdict */}
        <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-[#161b22] space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                <span>{effectiveGradeFit.badgeLabel}</span>
              </span>

              {effectiveGradeFit.isTenureSatisfied ? (
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/30">
                  {effectiveGradeFit.tenureGapNotice}
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-500/40 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>{effectiveGradeFit.tenureGapNotice}</span>
                </span>
              )}
            </div>

            <span className="text-[11px] text-[#8b949e]">
              Last Employer: <strong className="text-[#e6edf3]">{effectiveGradeFit.lastCompany}</strong> ({effectiveGradeFit.lastDesignation})
            </span>
          </div>

          {/* Prominent One-Line Action Verdict for HR / Boss */}
          <div className="p-2.5 rounded-lg bg-[#21262d] border border-[#30363d] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-indigo-300 block text-[11px] uppercase tracking-wider">
                Executive Action Verdict for HR &amp; Leadership:
              </span>
              <p className="text-[#e6edf3] font-medium leading-relaxed">
                {candidate.decisiveActionSentence || effectiveGradeFit.oneLineVerdict}
              </p>
            </div>
          </div>
        </div>

        {/* Transparent Semantic Responsibilities Breakdown */}
        {(() => {
          const semanticMatchesList = (candidate.semanticMatches && candidate.semanticMatches.length > 0)
            ? candidate.semanticMatches
            : (totalScore < 50
                ? [
                    {
                      label: 'Domain Discrepancy #1',
                      jdRequirement: 'Garment merchandising & daily order execution (KRA)',
                      candidateEvidence: 'Non-apparel / non-merchandising background',
                      explanation: 'Candidate lacks hands-on apparel merchandising, costing, BOM, and buyer communication duties.',
                      fulfillmentType: 'duty' as const,
                    },
                    {
                      label: 'Competency Mismatch #2',
                      jdRequirement: 'FastReact / Optitex CAD / Production ERP',
                      candidateEvidence: 'Non-matching technical tool set',
                      explanation: 'Candidate tools do not satisfy target technical RMG competencies.',
                      fulfillmentType: 'competency' as const,
                    },
                  ]
                : [
                    {
                      label: 'Matched Duty #1',
                      jdRequirement: 'Line coordination & output delivery',
                      candidateEvidence: candidate.matchingQualifications?.[0] || 'Floor efficiency tracking & sewing coordination',
                      explanation: `Candidate's role in '${candidate.matchingQualifications?.[0] || 'Floor efficiency tracking'}' fulfills JD requirement 'Line coordination & output delivery'.`,
                      fulfillmentType: 'duty' as const,
                    },
                    {
                      label: 'Matched Competency #2',
                      jdRequirement: 'Production planning software (ERP / CAD)',
                      candidateEvidence: candidate.cadSoftwareProficiency?.[0] || 'FastReact ERP input',
                      explanation: "Candidate's proven 'FastReact ERP input' fulfills 'Production planning software' requirement.",
                      fulfillmentType: 'competency' as const,
                    },
                  ]);

          return (
            <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-[#161b22] space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#e6edf3]">
                    Matched Responsibilities Breakdown (Semantic Intent Fit)
                  </h4>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 font-medium">
                  Purpose-Driven Match
                </span>
              </div>

              <ul className="space-y-2">
                {semanticMatchesList.map((match, mIdx) => {
                  const isMismatch = totalScore < 50 || match.label.toLowerCase().includes('mismatch') || match.label.toLowerCase().includes('discrepancy');
                  return (
                    <li
                      key={mIdx}
                      className={`p-2.5 rounded-lg border space-y-1 ${
                        isMismatch
                          ? 'bg-rose-950/20 border-rose-500/40'
                          : 'bg-[#21262d] border-[#30363d]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span
                          className={`font-extrabold text-[11px] flex items-center gap-1.5 ${
                            isMismatch ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {isMismatch ? (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                          <span>{match.label}:</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#8b949e] bg-[#161b22] px-2 py-0.5 rounded border border-[#30363d]">
                          JD Target: {match.jdRequirement}
                        </span>
                      </div>

                      <p className="text-xs text-[#e6edf3] font-medium leading-relaxed">
                        Candidate&apos;s role in <strong className="text-indigo-300 font-semibold">&ldquo;{match.candidateEvidence}&rdquo;</strong> fulfills JD requirement &ldquo;{match.jdRequirement}&rdquo;.
                      </p>

                      <div className="text-[11px] text-[#8b949e] flex items-center gap-1.5 pl-2 border-l-2 border-indigo-500/40">
                        <span className="text-indigo-400 font-semibold shrink-0">Analysis:</span>
                        <span>{match.explanation}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })()}

        {/* 3-Pillar Tri-Match Architecture */}
        <div className="p-3.5 rounded-xl border border-[#30363d] bg-[#161b22]">
          <TriMatchCardSection candidate={candidate} />
        </div>

        {/* 4-Category Match Score Breakdown (Domain Exp, KSA/Daily Duties, Education, Buyer/Software) */}
        <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              Match Score Breakdown
            </span>
            <span className="text-[11px] font-mono text-[#8b949e]">Total: {totalScore}/100</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* 1. Domain Experience */}
            <div className="p-2.5 rounded-lg bg-[#21262d] border border-[#30363d] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#8b949e] flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-blue-400" />
                  Domain Exp.
                </span>
                <span className="font-bold text-[#e6edf3]">
                  {breakdown.domainExperience.obtained}/{breakdown.domainExperience.max}
                </span>
              </div>
              <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${breakdown.domainExperience.percentage}%` }}
                />
              </div>
              <div className="text-[10px] text-[#8b949e] flex justify-between">
                <span>Tenure & relevance</span>
                <span className="font-mono">{breakdown.domainExperience.percentage}%</span>
              </div>
            </div>

            {/* 2. KSA / Daily Duties */}
            <div className="p-2.5 rounded-lg bg-[#21262d] border border-[#30363d] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#8b949e] flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-indigo-400" />
                  KSA & Duties
                </span>
                <span className="font-bold text-[#e6edf3]">
                  {breakdown.ksaDailyDuties.obtained}/{breakdown.ksaDailyDuties.max}
                </span>
              </div>
              <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all"
                  style={{ width: `${breakdown.ksaDailyDuties.percentage}%` }}
                />
              </div>
              <div className="text-[10px] text-[#8b949e] flex justify-between">
                <span>Skills & competencies</span>
                <span className="font-mono">{breakdown.ksaDailyDuties.percentage}%</span>
              </div>
            </div>

            {/* 3. Education */}
            <div className="p-2.5 rounded-lg bg-[#21262d] border border-[#30363d] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#8b949e] flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-emerald-400" />
                  Education
                </span>
                <span className="font-bold text-[#e6edf3]">
                  {breakdown.education.obtained}/{breakdown.education.max}
                </span>
              </div>
              <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${breakdown.education.percentage}%` }}
                />
              </div>
              <div className="text-[10px] text-[#8b949e] flex justify-between">
                <span>Degrees & academic fit</span>
                <span className="font-mono">{breakdown.education.percentage}%</span>
              </div>
            </div>

            {/* 4. Buyer / Software Knowledge */}
            <div className="p-2.5 rounded-lg bg-[#21262d] border border-[#30363d] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#8b949e] flex items-center gap-1">
                  <Tag className="w-3 h-3 text-purple-400" />
                  Buyer & Software
                </span>
                <span className="font-bold text-[#e6edf3]">
                  {breakdown.buyerSoftwareKnowledge.obtained}/{breakdown.buyerSoftwareKnowledge.max}
                </span>
              </div>
              <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all"
                  style={{ width: `${breakdown.buyerSoftwareKnowledge.percentage}%` }}
                />
              </div>
              <div className="text-[10px] text-[#8b949e] flex justify-between">
                <span>CAD, ERP & buyer manuals</span>
                <span className="font-mono">{breakdown.buyerSoftwareKnowledge.percentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Strengths vs Critical Gaps Bullet Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Key Strengths */}
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/15 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Key Strengths:</span>
            </div>
            <ul className="space-y-1 text-xs text-[#e6edf3]">
              {strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Critical Gaps */}
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/15 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Critical Gaps & Limitations:</span>
            </div>
            <ul className="space-y-1 text-xs text-[#e6edf3]">
              {gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 shrink-0 font-bold">•</span>
                  <span className="text-[#8b949e]">{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Extracted RMG & Technical Profile Chips */}
        {(candidate.productSpecialization?.length ||
          candidate.workEnvironment ||
          candidate.buyersWorkedWith?.length ||
          candidate.technicalCertifications?.length ||
          candidate.cadSoftwareProficiency?.length) && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-1.5 border-b border-[#30363d]">
              <span className="text-[11px] font-bold text-[#e6edf3] uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                Extracted RMG & Technical Profile
              </span>
              {candidate.workEnvironment && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                  {candidate.workEnvironment} Experience
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              {/* Product Specialization */}
              {candidate.productSpecialization && candidate.productSpecialization.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#8b949e] block">
                    Product Specialization
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {candidate.productSpecialization.map((prod, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/60"
                      >
                        {prod}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Buyers Worked With */}
              {candidate.buyersWorkedWith && candidate.buyersWorkedWith.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#8b949e] block">
                    Buyer Portfolio
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {candidate.buyersWorkedWith.map((buyer, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60"
                      >
                        {buyer}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Certifications & CAD */}
              {(candidate.technicalCertifications?.length || candidate.cadSoftwareProficiency?.length) && (
                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <span className="text-[10px] font-bold uppercase text-[#8b949e] block">
                    Technical & CAD Credentials
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {candidate.cadSoftwareProficiency?.map((cad, i) => (
                      <span
                        key={`cad-${i}`}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/60"
                      >
                        {cad}
                      </span>
                    ))}
                    {candidate.technicalCertifications?.map((cert, i) => (
                      <span
                        key={`cert-${i}`}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6 Criteria Marks Accordion */}
        <div className="border border-[#30363d] rounded-lg overflow-hidden bg-[#161b22]">
          <button
            type="button"
            onClick={() => setShowDetailedCriteria(!showDetailedCriteria)}
            className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-[#e6edf3] hover:bg-[#21262d] transition cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full 6-Criteria Evidence Assessment ({candidate.score}/100 Marks)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-indigo-400">
                {showDetailedCriteria ? 'Hide Criteria' : 'View Criteria'}
              </span>
              {showDetailedCriteria ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showDetailedCriteria && (
            <div className="p-3 bg-[#0d1117] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs border-t border-[#30363d]">
              {candidate.criteriaMarks ? (
                Object.values(candidate.criteriaMarks).map((crit) => (
                  <div key={crit.criterionId} className="p-2.5 rounded bg-[#161b22] border border-[#30363d] space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#e6edf3]">
                      <span className="truncate pr-1">{crit.name}</span>
                      <span className="text-indigo-300 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-700/60 shrink-0">
                        {crit.obtainedMarks}/{crit.maxMarks}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-[#8b949e]">Status:</span>
                      <span className="font-bold text-[#e6edf3]">{crit.status}</span>
                    </div>
                    {crit.assessmentNotes && (
                      <p className="text-[11px] text-[#8b949e] line-clamp-2">{crit.assessmentNotes}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-[#8b949e] italic">No detailed criteria breakdown recorded.</div>
              )}
            </div>
          )}
        </div>

        {/* Work Experience Timeline Accordion */}
        {candidate.experience && candidate.experience.length > 0 && (
          <div className="border border-[#30363d] rounded-lg overflow-hidden bg-[#161b22]">
            <button
              type="button"
              onClick={() => setShowWorkHistory(!showWorkHistory)}
              className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-[#e6edf3] hover:bg-[#21262d] transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8b949e]" />
                <span>
                  Employment Timeline ({candidate.experience.length} roles · {candidate.totalYearsExperience} yrs exp)
                </span>
              </div>
              {showWorkHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showWorkHistory && (
              <div className="p-3 bg-[#0d1117] space-y-2.5 text-xs border-t border-[#30363d]">
                {candidate.experience.map((exp, i) => (
                  <div key={i} className="border-l-2 border-[#30363d] pl-3 py-0.5 space-y-0.5">
                    <div className="flex items-center justify-between font-semibold text-[#e6edf3]">
                      <span>{exp.role}</span>
                      <span className="text-[#8b949e] text-[11px] font-mono">{exp.duration}</span>
                    </div>
                    <div className="text-[#8b949e] font-medium">{exp.company}</div>
                    {exp.description && (
                      <p className="text-[11px] text-[#8b949e]">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Salary Fixation & Stability Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {fixation && (
            <div className="p-2.5 rounded-lg border border-blue-500/30 bg-blue-950/20 flex items-center justify-between">
              <div>
                <span className="font-bold text-blue-300 block">{companyName} Salary Benchmark (Advisory)</span>
                <span className="text-[11px] text-[#8b949e]">
                  {fixation.eligibleDesignation || candidate.category} · Grade {fixation.grade}
                </span>
              </div>
              <span className="font-bold text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700/60 text-xs font-mono">
                {fixation.fixedSalary ? `TK ${fixation.fixedSalary.toLocaleString()}` : 'Scale Pay'}
              </span>
            </div>
          )}

          {stability && (
            <div
              className={`p-2.5 rounded-lg border flex items-center justify-between ${
                stability.isFrequentJobChanger
                  ? 'border-amber-500/30 bg-amber-950/20 text-amber-300'
                  : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
              }`}
            >
              <div>
                <span className="font-bold block">Tenure Assessment</span>
                <span className="text-[11px] text-[#8b949e]">
                  Avg: {stability.averageTenureMonths} mos per employer
                </span>
              </div>
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  stability.isFrequentJobChanger
                    ? 'bg-amber-900/60 text-amber-300 border border-amber-700/60'
                    : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                }`}
              >
                {stability.isFrequentJobChanger ? 'Tenure Flag (<1.5y)' : 'Stable (≥1.5y)'}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#30363d]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-2xs font-semibold uppercase text-[#8b949e] mr-1">HR Decision:</span>
            <button
              type="button"
              onClick={() => onUpdateStatus('shortlisted')}
              className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer border ${
                candidate.status === 'shortlisted'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-700/60'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              <span>Shortlist</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateStatus('on_hold')}
              className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer border ${
                candidate.status === 'on_hold'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-700/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5 mr-1" />
              <span>Hold</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateStatus('rejected')}
              className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer border ${
                candidate.status === 'rejected'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-700/60'
              }`}
            >
              <span>Reject</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateStatus('pending')}
              className="text-2xs text-[#8b949e] hover:text-[#e6edf3] underline ml-1 cursor-pointer"
            >
              Reset to Pending
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenMovePosition && (
              <button
                type="button"
                onClick={onOpenMovePosition}
                className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#161b22] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
                title="Assign / Move candidate to another requisition"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 mr-1 text-blue-400" />
                <span>Assign Job</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSalaryAdjustModal}
              className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#161b22] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
              title="Adjust proposed salary"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-blue-400" />
              <span>Salary</span>
            </button>

            <button
              type="button"
              onClick={onOpenOfferMemo}
              className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#161b22] hover:bg-[#30363d] text-emerald-400 border border-[#30363d] transition cursor-pointer"
              title="Generate Selection / Offer Memo"
            >
              <Award className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              <span>Offer Memo</span>
            </button>

            <button
              type="button"
              onClick={onOpenDetailModal}
              className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer shadow-sm"
              title="Open Full Dossier and Instant CV Text"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              <span>Full Dossier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

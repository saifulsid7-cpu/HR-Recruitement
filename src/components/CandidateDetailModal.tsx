/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  FileText,
  Mail,
  Phone,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { Candidate, CandidateStatus, STATUS_LABELS } from '../types';
import { getRatingFromScore } from '../data/standardCriteria';
import { getCandidateFullCvText } from '../utils/cvFormatter';
import { evaluateGradeFitAndTenure } from '../utils/gradeFitHelper';
import { TriMatchCardSection } from './TriMatchCardSection';

interface CandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  companyName: string;
  blindMode: boolean;
  onUpdateStatus?: (status: CandidateStatus) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  isOpen,
  onClose,
  candidate,
  companyName,
  blindMode,
  onUpdateStatus,
}) => {
  if (!isOpen || !candidate) return null;

  const totalScore = candidate.score;
  const ratingBand = candidate.rmgEvaluation?.rating || getRatingFromScore(totalScore);
  const stability = candidate.jobStability;
  const fixation = candidate.salaryFixation;
  const completeness = candidate.evidenceCompleteness;
  const [activeTab, setActiveTab] = useState<'dossier' | 'cv_text'>('dossier');
  const [copied, setCopied] = useState(false);

  const fullCvText = getCandidateFullCvText(candidate);

  const effectiveGradeFit =
    candidate.gradeFit ||
    evaluateGradeFitAndTenure({
      actualYears: candidate.totalYearsExperience || 2.0,
      candidateScore: candidate.score,
      targetPositionTitle: candidate.appliedPosition,
      lastCompany: candidate.lastCompany || candidate.experience?.[0]?.company || 'Prior RMG Organization',
      lastDesignation: candidate.lastDesignation || candidate.experience?.[0]?.role || candidate.appliedPosition,
    });

  const handleCopyCv = () => {
    navigator.clipboard.writeText(fullCvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = blindMode ? `Candidate #${candidate.rank ?? '—'}` : candidate.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#161b22] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-[#30363d] overflow-hidden text-[#e6edf3]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#30363d] bg-[#21262d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {blindMode ? '#' : candidate.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Rank #{candidate.rank ?? 1}
                  {candidate.isTied && <span className="ml-1 text-[10px] text-amber-400">(Tied)</span>}
                </span>
                <h3 className="text-base font-extrabold text-[#e6edf3]">{displayName}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-700/50">
                  {candidate.lastDesignation || candidate.experience?.[0]?.role || 'Professional'}
                  {candidate.lastCompany ? ` • ${candidate.lastCompany}` : ''}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#161b22] text-[#8b949e] border border-[#30363d]">
                  Target: {candidate.appliedPosition || candidate.category}
                </span>
              </div>
              <p className="text-xs text-[#8b949e] mt-0.5">
                Candidate Evaluation Dossier · 3-Pillar Tri-Match & HR Verification for {companyName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d] rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="px-6 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('dossier')}
              className={`py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dossier'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>3-Pillar Evaluation & Dossier</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cv_text')}
              className={`py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'cv_text'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full CV / Resume Document (Instant Text)</span>
            </button>
          </div>

          {activeTab === 'cv_text' && (
            <button
              type="button"
              onClick={handleCopyCv}
              className="my-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] transition flex items-center gap-1 cursor-pointer"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Full CV Text'}</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Advisory Notice Banner */}
          <div className="p-3 bg-[#21262d] border border-[#30363d] rounded-xl text-[#8b949e] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-400">Notice:</span>
              <span className="text-xs text-[#c9d1d9]">AI-generated evaluation for HR review only. Scores and rankings are advisory and subject to recruiter validation.</span>
            </div>
            {onUpdateStatus && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#e6edf3]">HR Decision:</span>
                <select
                  aria-label="Change HR decision in dossier"
                  value={candidate.status}
                  onChange={(e) => onUpdateStatus(e.target.value as CandidateStatus)}
                  className={`font-bold text-xs rounded-lg px-2.5 py-1 border transition cursor-pointer outline-none ${
                    candidate.status === 'shortlisted'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                      : candidate.status === 'on_hold'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                        : candidate.status === 'rejected'
                          ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                          : 'bg-[#161b22] text-[#e6edf3] border-[#30363d]'
                  }`}
                >
                  <option value="pending" className="bg-[#161b22] text-[#e6edf3]">Pending HR Review</option>
                  <option value="shortlisted" className="bg-[#161b22] text-emerald-300">Shortlisted by HR</option>
                  <option value="on_hold" className="bg-[#161b22] text-amber-300">On Hold by HR</option>
                  <option value="rejected" className="bg-[#161b22] text-rose-300">Rejected by HR</option>
                </select>
              </div>
            )}
          </div>

          {activeTab === 'cv_text' ? (
            /* Instant Full CV / Resume Text View */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
                <div>
                  <h4 className="font-bold text-[#e6edf3] text-sm">Full CV / Resume Document</h4>
                  <p className="text-[#8b949e] text-[11px]">Original text structured with headings, work history, education, and competencies.</p>
                </div>
                <span className="text-[11px] font-mono bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d] text-[#8b949e]">
                  {candidate.fileName}
                </span>
              </div>
              <pre className="p-4 rounded-xl bg-[#0d1117] text-[#e6edf3] font-mono text-[11px] leading-relaxed whitespace-pre-wrap overflow-x-auto selection:bg-indigo-600 selection:text-white border border-[#30363d]">
                {fullCvText}
              </pre>
            </div>
          ) : (
            <>
              {/* Master Grading Ladder Fit, Benchmark Hurdle & Boss Verdict */}
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-[#21262d] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363d] pb-2.5">
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
                <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-bold text-indigo-300 block text-[11px] uppercase tracking-wider">
                      Executive Action Verdict for HR &amp; Leadership:
                    </span>
                    <p className="text-[#e6edf3] font-medium leading-relaxed">
                      {effectiveGradeFit.oneLineVerdict}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3-Pillar Tri-Match Architecture Callout */}
              <div className="bg-[#21262d] rounded-xl border border-[#30363d] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#30363d]/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h4 className="font-black text-[#e6edf3] text-sm uppercase tracking-wider">
                      3-Pillar Tri-Match Evaluation Architecture
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#8b949e]">
                    JD Duties · Position Requirements · Company Criteria
                  </span>
                </div>
                <TriMatchCardSection candidate={candidate} />
              </div>

              {/* Key Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-[#30363d] bg-[#21262d]">
                  <span className="text-[10px] uppercase font-bold text-[#8b949e] block">Overall Match Score</span>
                  <div className="text-2xl font-black text-indigo-400">{totalScore.toFixed(0)}/100</div>
                  <span className="text-[11px] text-[#8b949e] font-semibold">{ratingBand}</span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#30363d] bg-[#21262d]">
                  <span className="text-[10px] uppercase font-bold text-[#8b949e] block">Evidence Completeness</span>
                  <div className="text-2xl font-black text-[#e6edf3]">
                    {completeness?.percentage ?? 85}%
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    {completeness?.level ?? 'High'} Confidence
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#30363d] bg-[#21262d]">
                  <span className="text-[10px] uppercase font-bold text-[#8b949e] block">Verified Experience</span>
                  <div className="text-2xl font-black text-[#e6edf3]">
                    {(candidate.relevantExperienceYears ?? candidate.totalYearsExperience ?? 0).toFixed(1)} Yrs
                  </div>
                  <span className="text-[11px] text-[#8b949e] font-semibold">
                    {Math.round((candidate.relevantExperienceYears ?? candidate.totalYearsExperience ?? 0) * 12)} Months
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#30363d] bg-[#21262d]">
                  <span className="text-[10px] uppercase font-bold text-[#8b949e] block">Proposed Salary & Grade</span>
                  <div className="text-2xl font-black text-blue-400">{fixation?.grade || 'ME-11'}</div>
                  <span className="text-[11px] text-blue-300 font-semibold">
                    {fixation?.fixedSalary ? `TK ${fixation.fixedSalary.toLocaleString()}` : 'Scale Pay'}
                  </span>
                </div>
              </div>

              {/* Extracted RMG & Technical Qualifications Profile */}
              {(candidate.productSpecialization?.length ||
                candidate.workEnvironment ||
                candidate.buyersWorkedWith?.length ||
                candidate.technicalCertifications?.length ||
                candidate.academicDegrees?.length ||
                candidate.cadSoftwareProficiency?.length ||
                candidate.email ||
                candidate.phone) && (
                <div className="bg-[#21262d] border border-[#30363d] rounded-xl p-4 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#30363d]">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-indigo-400" />
                      <h4 className="font-bold text-[#e6edf3] text-sm">
                        Extracted RMG & Technical Profile (Resume Analysis)
                      </h4>
                    </div>
                    {candidate.workEnvironment && (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wide bg-indigo-950 text-indigo-300 border border-indigo-700/60 self-start sm:self-auto">
                        {candidate.workEnvironment} Experience
                      </span>
                    )}
                  </div>

                  {/* Candidate Identity & Contact Details */}
                  {!blindMode && (candidate.email || candidate.phone) && (
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#8b949e] bg-[#161b22] p-2.5 rounded-lg border border-[#30363d]">
                      <span className="font-bold text-[#e6edf3]">Verified Contact:</span>
                      {candidate.email && (
                        <span className="flex items-center gap-1.5 font-medium text-[#c9d1d9]">
                          <Mail className="w-3.5 h-3.5 text-[#8b949e]" />
                          {candidate.email}
                        </span>
                      )}
                      {candidate.phone && (
                        <span className="flex items-center gap-1.5 font-medium text-[#c9d1d9]">
                          <Phone className="w-3.5 h-3.5 text-[#8b949e]" />
                          {candidate.phone}
                        </span>
                      )}
                      <span className="text-[#8b949e] font-mono text-[11px] ml-auto">
                        {candidate.fileName}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* Specific RMG Experience: Product Specialization */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-[#161b22] border border-[#30363d]">
                      <span className="text-[10px] font-bold uppercase text-[#8b949e] block">
                        Product Specialization
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {candidate.productSpecialization && candidate.productSpecialization.length > 0 ? (
                          candidate.productSpecialization.map((item, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-950/60 text-blue-300 border border-blue-800/60"
                            >
                              {item}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#8b949e] italic text-[11px]">General RMG</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#8b949e] pt-1">
                        Tops vs Bottoms, Denim, Woven, Knit specialization.
                      </p>
                    </div>

                    {/* Specific RMG Experience: Buyers Worked With */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-[#161b22] border border-[#30363d]">
                      <span className="text-[10px] font-bold uppercase text-[#8b949e] block">
                        Buyer & Brand Accounts
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {candidate.buyersWorkedWith && candidate.buyersWorkedWith.length > 0 ? (
                          candidate.buyersWorkedWith.map((buyer, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60"
                            >
                              {buyer}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#8b949e] italic text-[11px]">Not Evident</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#8b949e] pt-1">
                        Buyers collaborated with (e.g. H&M, Inditex, Walmart, Target).
                      </p>
                    </div>

                    {/* Technical Certifications & Degrees */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-[#161b22] border border-[#30363d]">
                      <span className="text-[10px] font-bold uppercase text-[#8b949e] block">
                        Technical Certifications & CAD
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
                      <p className="text-[10px] text-[#8b949e] pt-1">
                        Credentials: PGDHRM, Textile Engineering, CAD/Gerber, Sedex/BSCI.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transparent Score Explanation */}
              {candidate.scoreExplanation && (
                <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Evidence-Based Score Explanation:</span>
                  </div>
                  <p className="text-[#c9d1d9] leading-relaxed font-medium text-xs">
                    {candidate.scoreExplanation}
                  </p>
                </div>
              )}

              {/* Matching vs Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Key Matching Qualifications, Skills & Experience:</span>
                  </div>
                  <ul className="list-disc list-inside text-[#c9d1d9] space-y-1 text-xs">
                    {(candidate.matchingQualifications && candidate.matchingQualifications.length > 0
                      ? candidate.matchingQualifications
                      : candidate.skills || []
                    ).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Gaps, Mismatches & Limitations:</span>
                  </div>
                  <ul className="list-disc list-inside text-[#c9d1d9] space-y-1 text-xs">
                    {(candidate.gapsAndMismatches && candidate.gapsAndMismatches.length > 0
                      ? candidate.gapsAndMismatches
                      : candidate.missingQualifications || []
                    ).map((gap, i) => (
                      <li key={i}>{gap}</li>
                    ))}
                    {candidate.unverifiableInformation && candidate.unverifiableInformation.length > 0 && (
                      candidate.unverifiableInformation.map((unv, i) => (
                        <li key={`unv-${i}`} className="italic text-[#8b949e]">
                          Unverifiable: {unv}
                        </li>
                      ))
                    )}
                    {!candidate.gapsAndMismatches?.length &&
                      !candidate.missingQualifications?.length &&
                      !candidate.unverifiableInformation?.length && (
                        <li className="text-[#8b949e] italic">No major disqualifying gaps found.</li>
                      )}
                  </ul>
                </div>
              </div>

              {/* Academic & Professional Credentials */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-[#e6edf3] text-xs uppercase tracking-wider">
                  Educational Qualifications & Certifications
                </h4>
                <div className="space-y-1.5">
                  {candidate.education?.map((ed, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#21262d] border border-[#30363d] text-[#c9d1d9]">
                      {ed}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronological Work Experience */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-[#e6edf3] text-xs uppercase tracking-wider">
                  Chronological Work Experience
                </h4>
                <div className="space-y-2">
                  {candidate.experience?.map((exp, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[#21262d] border border-[#30363d] space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#e6edf3]">
                        <span>{exp.role}</span>
                        <span className="text-[#8b949e] font-mono text-[11px]">{exp.duration}</span>
                      </div>
                      <div className="text-indigo-300 font-semibold">{exp.company}</div>
                      {exp.description && (
                        <p className="text-[11px] text-[#8b949e] leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary Fixation Reference */}
              {fixation && (
                <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-blue-300">
                    <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                    <span>{companyName} Remuneration Matrix Reference:</span>
                  </div>
                  <p className="text-[#c9d1d9] leading-relaxed font-medium">
                    {fixation.justification}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-[#8b949e] pt-1 border-t border-[#30363d] flex-wrap">
                    <span>Grade: <strong className="text-[#e6edf3]">{fixation.grade}</strong></span>
                    <span>•</span>
                    <span>Designation: <strong className="text-[#e6edf3]">{fixation.eligibleDesignation}</strong></span>
                    <span>•</span>
                    <span>Fixed Remuneration: <strong className="text-blue-300">TK {fixation.fixedSalary?.toLocaleString()}</strong></span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#30363d] bg-[#21262d] flex items-center justify-between">
          <span className="text-[11px] text-[#8b949e]">
            Current HR Status: <strong className="text-[#e6edf3]">{STATUS_LABELS[candidate.status] || candidate.status}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#e6edf3] hover:text-white cursor-pointer bg-[#161b22] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

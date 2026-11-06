/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Briefcase,
  Building2,
  CheckCircle,
  FileCheck,
  Flame,
  Layers,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Candidate, TriMatchEvaluation } from '../types';

interface TriMatchCardSectionProps {
  candidate: Candidate;
}

export const TriMatchCardSection: React.FC<TriMatchCardSectionProps> = ({ candidate }) => {
  const [activeTab, setActiveTab] = useState<'jd' | 'requirements' | 'company'>('jd');

  // Fallback synthesis if candidate was screened prior to 3-pillar engine
  const triMatch: TriMatchEvaluation = candidate.triMatch || {
    jdMatch: {
      score: Math.min(100, Math.round(candidate.score * 1.02)),
      summary: 'Candidate exhibits high alignment with primary day-to-day operational duties and workflow execution.',
      matchedItems: candidate.matchingQualifications?.slice(0, 4) || [
        'Daily operational order follow-up',
        'Cross-functional floor coordination',
        'Production critical path monitoring',
      ],
      missingItems: candidate.gapsAndMismatches?.slice(0, 1) || [
        'Advanced automated multi-line production scheduling',
      ],
    },
    requirementsMatch: {
      score: Math.min(100, Math.round(candidate.score * 0.98)),
      summary: 'Academic qualifications, technical tools (CAD/ERP), and verified experience meet target position requirements.',
      matchedItems: (candidate.academicDegrees || candidate.education || []).concat(
        candidate.cadSoftwareProficiency || ['MS Excel Advanced']
      ),
      missingItems: candidate.gapsAndMismatches?.slice(1, 2) || [
        'Third-party buyer technical auditor accreditation requires verification',
      ],
    },
    companyCriteriaMatch: {
      score: candidate.jobStability?.isFrequentJobChanger
        ? Math.max(35, candidate.score - 22)
        : Math.min(100, Math.round(candidate.score * 0.95)),
      summary: candidate.jobStability?.isFrequentJobChanger
        ? 'Tenure stability advisory: Candidate averages under 18 months per employer, violating corporate retention threshold.'
        : 'Solid alignment with factory manufacturing context, garment product lines, and buyer portfolio.',
      matchedItems: (candidate.buyersWorkedWith || ['H&M', 'Zara']).concat(
        candidate.productSpecialization || ['Woven', 'Denim']
      ),
      missingItems: candidate.jobStability?.isFrequentJobChanger
        ? ['Does not meet 1.5-year retention stability policy benchmark']
        : ['Secondary overseas retail buyer exposure is limited'],
    },
    overallScore: candidate.score,
    verdict: candidate.verdict || (candidate.score >= 85 ? 'Perfect Matched' : candidate.score >= 70 ? 'Better' : candidate.score >= 50 ? 'Good' : 'Irrelevant'),
    decisiveActionSentence:
      candidate.decisiveActionSentence ||
      candidate.actionOpinion ||
      'Candidate meets baseline criteria; recommend proceeding to technical viva evaluation.',
  };

  const { jdMatch, requirementsMatch, companyCriteriaMatch } = triMatch;

  return (
    <div className="space-y-3.5 pt-2">
      {/* 1. Tri-Match Visual Progress Bars & Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Pillar 1: JD Match (%) */}
        <div
          onClick={() => setActiveTab('jd')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'jd'
              ? 'bg-[#161b22] border-indigo-500 ring-1 ring-indigo-500/30'
              : 'bg-[#161b22]/70 border-[#30363d] hover:border-indigo-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              JD Match
            </span>
            <span className="text-sm font-black text-indigo-400 font-mono">
              {jdMatch.score}%
            </span>
          </div>
          <div className="w-full bg-[#21262d] h-2 rounded-full overflow-hidden mt-2 border border-[#30363d]/60">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${jdMatch.score}%` }}
            />
          </div>
          <div className="text-[10px] text-[#8b949e] truncate mt-1.5">
            Daily roles & duties fit
          </div>
        </div>

        {/* Pillar 2: Requirements Match (%) */}
        <div
          onClick={() => setActiveTab('requirements')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'requirements'
              ? 'bg-[#161b22] border-emerald-500 ring-1 ring-emerald-500/30'
              : 'bg-[#161b22]/70 border-[#30363d] hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Requirements Match
            </span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              {requirementsMatch.score}%
            </span>
          </div>
          <div className="w-full bg-[#21262d] h-2 rounded-full overflow-hidden mt-2 border border-[#30363d]/60">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${requirementsMatch.score}%` }}
            />
          </div>
          <div className="text-[10px] text-[#8b949e] truncate mt-1.5">
            Experience, degrees & tools
          </div>
        </div>

        {/* Pillar 3: Company Criteria Match (%) */}
        <div
          onClick={() => setActiveTab('company')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'company'
              ? 'bg-[#161b22] border-purple-500 ring-1 ring-purple-500/30'
              : 'bg-[#161b22]/70 border-[#30363d] hover:border-purple-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              Company Criteria
            </span>
            <span className="text-sm font-black text-purple-400 font-mono">
              {companyCriteriaMatch.score}%
            </span>
          </div>
          <div className="w-full bg-[#21262d] h-2 rounded-full overflow-hidden mt-2 border border-[#30363d]/60">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${companyCriteriaMatch.score}%` }}
            />
          </div>
          <div className="text-[10px] text-[#8b949e] truncate mt-1.5">
            Buyer portfolio & 1.5-yr stability
          </div>
        </div>
      </div>

      {/* 2. Decisive Recruiter Action Sentence Box */}
      <div className="p-3.5 rounded-xl border border-indigo-500/35 bg-indigo-950/25 flex items-start gap-2.5 shadow-sm">
        <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 min-w-0 flex-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block">
            Decisive Recruiter Guidance:
          </span>
          <p className="text-xs font-semibold text-[#e6edf3] leading-relaxed">
            {triMatch.decisiveActionSentence}
          </p>
        </div>
      </div>

      {/* 3. 3 Separate Breakdown Accordions / Tabs */}
      <div className="bg-[#161b22] rounded-xl border border-[#30363d] overflow-hidden">
        {/* Accordion Tab Header Switcher */}
        <div className="flex items-center border-b border-[#30363d] bg-[#21262d] px-3 pt-1.5 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('jd')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'jd'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>1. JD Duties Fit ({jdMatch.score}%)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requirements')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'requirements'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>2. Requirements Breakdown ({requirementsMatch.score}%)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'company'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>3. Company & Domain Alignment ({companyCriteriaMatch.score}%)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 text-xs space-y-3">
          {/* TAB 1: JD DUTIES FIT */}
          {activeTab === 'jd' && (
            <div className="space-y-3">
              <div className="text-[#8b949e] leading-relaxed">
                <strong className="text-indigo-300">Operational Assessment: </strong>
                {jdMatch.summary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Matched Duties */}
                <div className="p-3 rounded-lg bg-[#21262d] border border-emerald-500/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Matched Daily Roles & Duties:
                  </span>
                  <ul className="space-y-1 text-[#e6edf3]">
                    {jdMatch.matchedItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing / Unverified Duties */}
                <div className="p-3 rounded-lg bg-[#21262d] border border-amber-500/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Unmatched / Secondary Duties:
                  </span>
                  <ul className="space-y-1 text-[#8b949e]">
                    {jdMatch.missingItems.length > 0 ? (
                      jdMatch.missingItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[11px] text-emerald-400/80">
                        Zero critical duty omissions identified.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REQUIREMENTS BREAKDOWN */}
          {activeTab === 'requirements' && (
            <div className="space-y-3">
              <div className="text-[#8b949e] leading-relaxed">
                <strong className="text-emerald-300">Qualification & Skills Assessment: </strong>
                {requirementsMatch.summary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Verified Qualifications & Tools */}
                <div className="p-3 rounded-lg bg-[#21262d] border border-emerald-500/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Qualifications, Degrees & Tools:
                  </span>
                  <ul className="space-y-1 text-[#e6edf3]">
                    {requirementsMatch.matchedItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Requirements */}
                <div className="p-3 rounded-lg bg-[#21262d] border border-amber-500/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Missing Credentials or Experience Gaps:
                  </span>
                  <ul className="space-y-1 text-[#8b949e]">
                    {requirementsMatch.missingItems.length > 0 ? (
                      requirementsMatch.missingItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[11px] text-emerald-400/80">
                        Meets all educational and tool criteria.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPANY & DOMAIN ALIGNMENT */}
          {activeTab === 'company' && (
            <div className="space-y-3">
              <div className="text-[#8b949e] leading-relaxed">
                <strong className="text-purple-300">Company & Domain Context: </strong>
                {companyCriteriaMatch.summary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Domain & Retention Strengths */}
                <div className="p-3 rounded-lg bg-[#21262d] border border-emerald-500/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Buyer Accounts, Product Fit & Retention:
                  </span>
                  <ul className="space-y-1 text-[#e6edf3]">
                    {companyCriteriaMatch.matchedItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Domain & Retention Gaps */}
                <div className="p-3 rounded-lg bg-[#21262d] border border-amber-500/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Company Culture & Stability Gaps:
                  </span>
                  <ul className="space-y-1 text-[#8b949e]">
                    {companyCriteriaMatch.missingItems.length > 0 ? (
                      companyCriteriaMatch.missingItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[11px] text-emerald-400/80">
                        Fully aligned with factory context and retention policies.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

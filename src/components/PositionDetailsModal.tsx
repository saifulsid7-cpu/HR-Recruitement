/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Briefcase,
  FileText,
  GraduationCap,
  Layers,
  Pencil,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { JobRequisition } from '../types';

interface PositionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: JobRequisition | null;
  onEditPosition?: (req: JobRequisition) => void;
  onScreenPosition?: (req: JobRequisition) => void;
}

export const PositionDetailsModal: React.FC<PositionDetailsModalProps> = ({
  isOpen,
  onClose,
  requisition,
  onEditPosition,
  onScreenPosition,
}) => {
  if (!isOpen || !requisition) return null;

  const reqNo = requisition.requisitionNo?.trim();
  const dept = requisition.department?.trim();
  const salary = requisition.salaryRange?.trim();
  const location = requisition.sbuUnit?.trim();
  const kra = (requisition.keyResponsibilities || requisition.jobDescription || '').trim();
  const ksa = (requisition.keyKSA || requisition.jobRequirements || '').trim();
  const academics = requisition.academicDegrees && requisition.academicDegrees.length > 0 ? requisition.academicDegrees : null;
  const experience =
    requisition.experienceLevel && requisition.experienceLevel !== 'Any Experience'
      ? requisition.experienceLevel.trim()
      : requisition.minExperienceYears !== undefined
        ? `${requisition.minExperienceYears} Years`
        : '';
  const industries =
    requisition.industries && requisition.industries.length > 0
      ? requisition.industries
      : requisition.companyFit?.industrySegment && requisition.companyFit.industrySegment.length > 0
        ? requisition.companyFit.industrySegment
        : null;
  const rmgType =
    requisition.rmgType && requisition.rmgType.length > 0
      ? requisition.rmgType
      : requisition.companyFit?.rmgDivisions && requisition.companyFit.rmgDivisions.length > 0
        ? requisition.companyFit.rmgDivisions
        : null;
  const rmgProducts =
    requisition.rmgProducts && requisition.rmgProducts.length > 0
      ? requisition.rmgProducts
      : null;
  const buyers =
    requisition.buyerPortfolio && requisition.buyerPortfolio.length > 0
      ? requisition.buyerPortfolio
      : null;
  const hardSkills =
    requisition.hardTechnicalSkills && requisition.hardTechnicalSkills.length > 0
      ? requisition.hardTechnicalSkills
      : requisition.softwareTools && requisition.softwareTools.length > 0
        ? requisition.softwareTools
        : null;
  const companyName = requisition.companyName?.trim();
  const companyType = (requisition.companyType || requisition.companyFit?.workplaceNature || '').trim();
  const jobType = requisition.jobType?.trim();
  const jobGrade = requisition.targetGradeCode?.trim();
  const benefits = requisition.compensationBenefits?.trim();

  const keyValueItems: { label: string; value: string; mono?: boolean }[] = [
    ...(reqNo ? [{ label: 'Requisition No', value: reqNo, mono: true }] : []),
    ...(dept ? [{ label: 'Department', value: dept }] : []),
    ...(salary ? [{ label: 'Salary Range', value: salary, mono: true }] : []),
    ...(location ? [{ label: 'Job Location', value: location, mono: true }] : []),
    ...(experience ? [{ label: 'Total Years of Experience', value: experience }] : []),
    ...(companyName ? [{ label: 'Company Name', value: companyName }] : []),
    ...(companyType ? [{ label: 'Company Type', value: companyType }] : []),
    ...(jobType ? [{ label: 'Job Type', value: jobType }] : []),
    ...(jobGrade ? [{ label: 'Job Grade', value: jobGrade }] : []),
  ];

  const hasDomainSection = !!(industries || rmgType || rmgProducts || buyers);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#161b22] rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-[#30363d] text-[#e6edf3] shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-[#30363d] bg-[#21262d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {reqNo && (
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                    {reqNo}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    requisition.status === 'open' || requisition.status === 'active'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : requisition.status === 'on_hold'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {requisition.status?.toUpperCase() || 'OPEN'}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-[#e6edf3] tracking-tight mt-1">
                {requisition.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEditPosition && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditPosition(requisition);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161b22] hover:bg-[#30363d] text-indigo-300 border border-[#30363d] hover:border-indigo-500/50 transition cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body - Only renders NON-EMPTY parameters */}
        <div className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          {keyValueItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {keyValueItems.map((item) => (
                <div
                  key={item.label}
                  className="p-3 bg-[#21262d] rounded-xl border border-[#30363d]"
                >
                  <span className="text-[10px] text-[#8b949e] font-bold uppercase tracking-wider block mb-0.5">
                    {item.label}
                  </span>
                  <span
                    className={`font-bold text-[#e6edf3] ${
                      item.mono ? 'font-mono text-indigo-300' : ''
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {academics && (
            <div className="p-4 bg-[#21262d] rounded-xl border border-[#30363d] space-y-2">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#30363d]">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-[#e6edf3]">
                  Academic Qualifications
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {academics.map((deg) => (
                  <span
                    key={deg}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                  >
                    {deg}
                  </span>
                ))}
              </div>
            </div>
          )}

          {kra && (
            <div className="p-4 bg-[#21262d] rounded-xl border border-[#30363d] space-y-2">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#30363d]">
                <FileText className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-[#e6edf3]">
                  Job Responsibilities (KRA)
                </h4>
              </div>
              <pre className="font-sans whitespace-pre-wrap text-xs text-[#e6edf3] leading-relaxed">
                {kra}
              </pre>
            </div>
          )}

          {ksa && (
            <div className="p-4 bg-[#21262d] rounded-xl border border-[#30363d] space-y-2">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#30363d]">
                <Wrench className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-[#e6edf3]">
                  Job Specification (Knowledge, Skills, Attributes - KSA)
                </h4>
              </div>
              <pre className="font-sans whitespace-pre-wrap text-xs text-[#e6edf3] leading-relaxed">
                {ksa}
              </pre>
            </div>
          )}

          {hardSkills && (
            <div className="p-4 bg-[#21262d] rounded-xl border border-[#30363d] space-y-2">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#30363d]">
                <Wrench className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-[#e6edf3]">
                  Hard Technical Skills
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hardSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-500/40"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {hasDomainSection && (
            <div className="p-4 bg-[#21262d] rounded-xl border border-[#30363d] space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#30363d]">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-[#e6edf3]">
                  Industry, RMG Segment &amp; Buyer Portfolio
                </h4>
              </div>

              {industries && (
                <div className="space-y-1">
                  <span className="text-[11px] text-[#8b949e] font-semibold block">
                    Industries:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {industries.map((ind) => (
                      <span
                        key={ind}
                        className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-950/70 text-indigo-300 border border-indigo-500/40"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {rmgType && (
                <div className="space-y-1">
                  <span className="text-[11px] text-[#8b949e] font-semibold block">
                    RMG Type:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rmgType.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-950/70 text-purple-300 border border-purple-500/40"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {rmgProducts && (
                <div className="space-y-1">
                  <span className="text-[11px] text-[#8b949e] font-semibold block">
                    RMG Products:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rmgProducts.map((p) => (
                      <span
                        key={p}
                        className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-950/70 text-indigo-200 border border-indigo-500/40"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {buyers && (
                <div className="space-y-1">
                  <span className="text-[11px] text-[#8b949e] font-semibold block">
                    Buyer Name:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {buyers.map((b) => (
                      <span
                        key={b}
                        className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-500/40"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {benefits && (
            <div className="p-4 bg-[#21262d] rounded-xl border border-[#30363d] space-y-1.5">
              <span className="text-[11px] text-[#8b949e] font-bold uppercase tracking-wider block">
                Compensation &amp; Benefits
              </span>
              <p className="text-xs text-[#e6edf3] whitespace-pre-wrap leading-relaxed">
                {benefits}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-[#30363d] bg-[#21262d] flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-[#8b949e]">
            Created on {requisition.createdAt}
          </span>

          <div className="flex items-center gap-2">
            {onEditPosition && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditPosition(requisition);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#161b22] hover:bg-[#30363d] text-indigo-300 border border-[#30363d] transition cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}

            {onScreenPosition && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onScreenPosition(requisition);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/40 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Screen CVs Against This Position</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

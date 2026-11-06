/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Archive,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Upload,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  ShieldAlert,
  Flame,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { JOB_PRESETS } from '../data/jobPresets';
import { QUICK_POLICY_PRESETS } from '../data/industryPolicies';
import { HiringCategory, JobPreset, JobRequisition, QuickPolicyPreset } from '../types';

interface JobDescriptionSectionProps {
  job: JobPreset;
  onChangeJob: (job: JobPreset) => void;
  activeRequisitions: JobRequisition[];
  selectedRequisition: JobRequisition;
  onSelectRequisition: (req: JobRequisition) => void;
  onChangeHiringCategory: (reqId: string, category: HiringCategory) => void;
  onOpenNewRequisitionModal: () => void;
  onOpenArchiveModal: (req: JobRequisition) => void;
  candidateCountForPosition: number;
  onOpenIndustryGuide: () => void;
  onOpenSalaryMatrix: () => void;
  activePolicyBadge?: string;
  onSetActivePolicyBadge: (badge?: string) => void;
}

export const JobDescriptionSection: React.FC<JobDescriptionSectionProps> = ({
  job,
  onChangeJob,
  activeRequisitions,
  selectedRequisition,
  onSelectRequisition,
  onChangeHiringCategory,
  onOpenNewRequisitionModal,
  onOpenArchiveModal,
  candidateCountForPosition,
  onOpenIndustryGuide,
  onOpenSalaryMatrix,
  activePolicyBadge,
  onSetActivePolicyBadge,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const quick = QUICK_POLICY_PRESETS.find((p) => p.name === val);
    if (quick) {
      applyQuickPreset(quick);
      return;
    }
    const standard = JOB_PRESETS.find((p) => p.title === val);
    if (standard) {
      onChangeJob(standard);
      onSetActivePolicyBadge(undefined);
      setUploadSuccess(`Loaded preset: ${standard.title}`);
    }
  };

  const applyQuickPreset = (preset: QuickPolicyPreset) => {
    onChangeJob({
      title: preset.title,
      department: preset.department,
      category: preset.title,
      experienceLevel: '2 - 5 Years',
      content: preset.content,
    });
    onSetActivePolicyBadge(preset.badge);
    setUploadSuccess(`Applied official standard: ${preset.companyName}`);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setUploadSuccess(null);
    setUploadError(null);

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/extract-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyFile: {
            name: file.name,
            base64,
            mimeType: file.type || 'application/pdf',
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      if (data.policy) {
        const p = data.policy;
        onChangeJob({
          title: p.title || file.name.replace(/\.[^/.]+$/, ''),
          department: p.department || 'HR & Compliance',
          category: p.title || 'General',
          experienceLevel: '2 - 5 Years',
          content: p.formattedContent || p.summary || '',
        });
        onSetActivePolicyBadge(p.companyName || p.title);
        setUploadSuccess(`Successfully extracted & applied policy from "${file.name}"!`);
      }
    } catch (err: any) {
      console.error('Failed to extract policy:', err);
      setUploadError(err.message || 'Failed to extract policy from PDF. Please check the file.');
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const appendStabilityRule = () => {
    const addition = `\n\n### Job Stability & Retention Policy (1.5-Year Rule):
- Candidates must demonstrate a minimum average tenure of 1.5 years (18 months) per previous company.
- Unstable rapid job changers with frequent tenures under 18 months will not be shortlisted.`;
    onChangeJob({
      ...job,
      content: (job.content || '').trim() + addition,
    });
  };

  const appendSalaryFixationRule = () => {
    const addition = `\n\n### Salary Fixation Policy Reference:
- Wages and grade placements are strictly fixed in accordance with verified experience months and candidate screening scores (ME-10 to ME-13 tiers).`;
    onChangeJob({
      ...job,
      content: (job.content || '').trim() + addition,
    });
  };

  const isTopPriority = selectedRequisition.hiringCategory === 'top_priority';

  return (
    <div className="bg-[#21262d] rounded-2xl border border-[#30363d] shadow-sm overflow-hidden transition-all duration-200 text-[#e6edf3]">
      {/* Top Banner / Requisition Bar */}
      <div className="px-5 py-3.5 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Selected Requisition Title & ID */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-700/50 text-indigo-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-[#21262d] text-indigo-300 border border-[#30363d]">
                  {selectedRequisition.id}
                </span>
                <h2 className="text-base font-bold text-[#e6edf3]">
                  {selectedRequisition.title}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] font-semibold border border-[#30363d]">
                  {selectedRequisition.department}
                </span>

                {/* Hiring Priority Status Indicator */}
                {isTopPriority ? (
                  <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-500/40">
                    <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
                    Top Hiring Priority
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-500/40">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    Current Hiring
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-[#8b949e] mt-1 flex-wrap">
                <span>
                  <strong className="text-[#e6edf3]">Target Pool:</strong> Only candidates assigned to this position are evaluated & ranked.
                </span>
                <span className="text-indigo-400 font-semibold">
                  {candidateCountForPosition} active candidate(s) loaded
                </span>
              </div>
            </div>
          </div>

          {/* Quick Controls: Priority Switcher, Archive, New Requisition */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Hiring Category Toggle (Mandatory Requirement 1) */}
            <div className="flex items-center gap-1 bg-[#21262d] border border-[#30363d] rounded-lg p-0.5 text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => onChangeHiringCategory(selectedRequisition.id, 'current')}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                  !isTopPriority
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-[#8b949e] hover:text-[#e6edf3]'
                }`}
                title="Mark as Current Hiring (Standard recruitment urgency)"
              >
                Current Hiring
              </button>
              <button
                type="button"
                onClick={() => onChangeHiringCategory(selectedRequisition.id, 'top_priority')}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                  isTopPriority
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-[#8b949e] hover:text-rose-400'
                }`}
                title="Mark as Top Hiring Priority (Urgent vacancy identified by HR/Management)"
              >
                <Flame className="w-3 h-3" />
                <span>Top Priority</span>
              </button>
            </div>

            {/* Archive Requisition */}
            <button
              type="button"
              onClick={() => onOpenArchiveModal(selectedRequisition)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-300 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 rounded-lg transition cursor-pointer"
              title="Archive completed or closed requisition to Previous Hiring Data folder"
            >
              <Archive className="w-3.5 h-3.5 text-purple-400" />
              <span>Archive Requisition</span>
            </button>

            {/* New Requisition */}
            <button
              type="button"
              onClick={onOpenNewRequisitionModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition shadow cursor-pointer"
              title="Create a new job position requisition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Requisition</span>
            </button>
          </div>
        </div>

        {/* Position Switcher Tabs */}
        <div className="mt-3 pt-3 border-t border-[#30363d] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e] mr-1">
              Select Position Requisition:
            </span>
            {activeRequisitions.map((req) => {
              const isSelected = req.id === selectedRequisition.id;
              const isReqPriority = req.hiringCategory === 'top_priority';
              return (
                <button
                  key={req.id}
                  type="button"
                  onClick={() => onSelectRequisition(req)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xs font-bold'
                      : 'bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] border-[#30363d]'
                  }`}
                >
                  <span>{req.title}</span>
                  {isReqPriority && (
                    <span
                      className={`text-[9px] font-black uppercase px-1 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      Urgent
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs text-[#8b949e] hover:text-[#e6edf3] flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>{isOpen ? 'Collapse Job Description & Criteria' : 'Edit Job Description & Criteria'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-5 space-y-4">
          {/* Quick-Apply Employer Policy Bar */}
          <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Quick-Apply Employer Recruitment Policy Standards:</span>
              </div>
              <button
                type="button"
                onClick={onOpenIndustryGuide}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline cursor-pointer"
              >
                View Full 10 Groups Guide →
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {QUICK_POLICY_PRESETS.map((preset) => {
                const isSelected = activePolicyBadge === preset.badge;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyQuickPreset(preset)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition cursor-pointer border ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                        : 'bg-[#161b22] text-purple-300 border-purple-500/30 hover:bg-purple-950/40'
                    }`}
                  >
                    ⭐ {preset.badge}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Description Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#e6edf3] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Job Description: Core Responsibilities (KRA) &amp; Competencies (KSA)</span>
                <span className="text-emerald-400 font-normal ml-1 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30 text-[10px]">
                  Unified Benchmark
                </span>
              </label>
              <span className="text-[10px] text-[#8b949e]">
                {job.content ? `${job.content.length} characters` : 'Empty'}
              </span>
            </div>

            <textarea
              aria-label="Job Description: Core Responsibilities (KRA) and Competencies (KSA)"
              rows={8}
              value={job.content}
              onChange={(e) => onChangeJob({ ...job, content: e.target.value })}
              placeholder={`1. Daily fabric follow-up, consumption calculation & costing
2. Sample proto development & sewing floor line coordination
3. Direct buyer correspondence (H&M / Inditex / Next) & T&A management
4. ERP / FastReact production tracking & critical order milestone updates
5. Dedicated ownership of garment line efficiency and quality deliverables...`}
              className="w-full text-xs font-mono p-3.5 bg-[#161b22] border border-[#30363d] rounded-xl focus:outline-none focus:border-indigo-500 text-[#e6edf3] leading-relaxed shadow-sm"
            />
          </div>

          {/* Helper Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={appendStabilityRule}
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/40 rounded-lg transition cursor-pointer"
                title="Append standard 1.5-year average tenure stability benchmark"
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-400" />
                <span>+ Insert 1.5-Year Stability Rule</span>
              </button>

              <button
                type="button"
                onClick={appendSalaryFixationRule}
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-300 bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/40 rounded-lg transition cursor-pointer"
                title="Append salary fixation scale benchmark"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-blue-400" />
                <span>+ Insert Salary Fixation Scale</span>
              </button>
            </div>

            {/* Upload PDF Policy */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-[#e6edf3] bg-[#161b22] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-indigo-400" />
                    <span>Extracting PDF...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                    <span>Upload Policy / Circular PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {uploadSuccess && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {uploadError && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

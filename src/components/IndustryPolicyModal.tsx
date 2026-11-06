/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { TOP_10_RMG_COMPANIES, QUICK_POLICY_PRESETS } from '../data/industryPolicies';
import { IndustryCompanyPolicy, JobPreset } from '../types';

interface IndustryPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPolicyToJob: (preset: JobPreset, badge: string) => void;
}

export const IndustryPolicyModal: React.FC<IndustryPolicyModalProps> = ({
  isOpen,
  onClose,
  onApplyPolicyToJob,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(1);

  if (!isOpen) return null;

  const filteredCompanies = TOP_10_RMG_COMPANIES.filter((comp) =>
    comp.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCompany: IndustryCompanyPolicy =
    TOP_10_RMG_COMPANIES.find((c) => c.id === selectedCompanyId) || TOP_10_RMG_COMPANIES[0];

  const handleApply = () => {
    // Find matching quick preset or construct one
    const quick = QUICK_POLICY_PRESETS.find(
      (q) => q.companyName.toLowerCase() === selectedCompany.companyName.toLowerCase()
    );

    if (quick) {
      onApplyPolicyToJob(
        {
          title: quick.title,
          department: quick.department,
          category: quick.title,
          experienceLevel: '2 - 5 Years',
          content: quick.content,
        },
        quick.badge
      );
    } else {
      onApplyPolicyToJob(
        {
          title: `${selectedCompany.companyName} Recruitment Policy Standard`,
          department: 'Garment Operations & Compliance',
          category: 'Operations',
          experienceLevel: '2 - 5 Years',
          content: `Job Title: RMG Executive / Officer
Standard Employer Benchmark: ${selectedCompany.companyName}
Selection Pattern: ${selectedCompany.selectionPattern}

### Official Selection Stages:
${selectedCompany.selectionSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

### Candidate Assessment Criteria:
${selectedCompany.whatCandidatesPrepare.map((c) => `- ${c}`).join('\n')}

### Job Stability & Retention Policy (1.5-Year Rule):
- Candidates must demonstrate a minimum average tenure of 1.5 years (18 months) per previous company.
- Unstable rapid job changers with frequent tenures under 18 months will not be shortlisted.

### Salary Fixation Policy Reference:
- Wages and grade placements are strictly fixed in accordance with verified experience months and candidate screening scores (ME-10 to ME-13 tiers).`,
        },
        selectedCompany.companyName.split(' ')[0]
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Bangladesh Garment Industry Recruitment & Selection Guide
              </h3>
              <p className="text-xs text-zinc-500">
                Verified hiring workflows, test benchmarks & stability requirements across top 10 apparel conglomerates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body: Two columns */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Companies List */}
          <div className="w-full md:w-72 border-r border-zinc-200 flex flex-col bg-zinc-50/50">
            <div className="p-3 border-b border-zinc-200">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter groups (e.g. Ha-Meem)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-1 focus:ring-purple-600 bg-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-zinc-200/60">
              {filteredCompanies.map((c) => {
                const isSelected = c.id === selectedCompany.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCompanyId(c.id)}
                    className={`w-full text-left p-3 text-xs flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-purple-100/70 text-purple-950 font-bold border-l-4 border-purple-700'
                        : 'hover:bg-zinc-100/80 text-zinc-700'
                    }`}
                  >
                    <div>
                      <span className="block">{c.companyName}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">
                        {c.selectionSteps.length} Selection Stages
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Company Detail & Stages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-white">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-zinc-100">
              <div>
                <h4 className="text-lg font-bold text-zinc-900">{selectedCompany.companyName}</h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Corporate HR, Merchandising & Compliance Selection Standard
                </p>
              </div>

              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                <span>Apply {selectedCompany.companyName} Standard</span>
              </button>
            </div>

            {/* Selection Flow Diagram / Steps */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2.5">
                Official Candidate Selection Workflow:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedCompany.selectionSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-purple-100 bg-purple-50/40 text-xs font-medium text-purple-950"
                  >
                    <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-900 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pattern description */}
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1 text-xs">
              <span className="font-bold text-zinc-800 block">Selection Pattern Summary:</span>
              <p className="text-zinc-600 leading-relaxed font-mono text-[11px]">
                {selectedCompany.selectionPattern}
              </p>
            </div>

            {/* Candidate preparation */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-zinc-800 block">
                What Candidates Must Prepare for {selectedCompany.companyName}:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedCompany.whatCandidatesPrepare.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Highlights */}
            <div className="p-3.5 rounded-lg bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 space-y-1">
              <span className="font-bold block">Recruitment Committee Benchmark Notes:</span>
              <p className="leading-relaxed text-indigo-900/90">{selectedCompany.highlights}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

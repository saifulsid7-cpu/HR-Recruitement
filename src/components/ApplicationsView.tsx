/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  CalendarCheck,
  CheckCircle,
  Clock,
  Eye,
  FileCheck,
  Filter,
  Plus,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';
import { Candidate, CandidateStatus } from '../types';
import { getVerdictBadge } from '../utils/scoringCardHelper';

interface ApplicationsViewProps {
  candidates: Candidate[];
  onOpenCandidateDetail: (candidate: Candidate) => void;
  onUpdateStatus: (candidateId: string, status: CandidateStatus) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  candidates,
  onOpenCandidateDetail,
  onUpdateStatus,
}) => {
  const pending = candidates.filter((c) => c.status === 'pending');
  const shortlisted = candidates.filter((c) => c.status === 'shortlisted');
  const onHold = candidates.filter((c) => c.status === 'on_hold');
  const rejected = candidates.filter((c) => c.status === 'rejected');

  const columns = [
    {
      id: 'pending',
      title: 'Pending HR Review',
      count: pending.length,
      color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
      items: pending,
    },
    {
      id: 'shortlisted',
      title: 'Shortlisted for Interview',
      count: shortlisted.length,
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
      items: shortlisted,
    },
    {
      id: 'on_hold',
      title: 'On Hold (Talent Pool)',
      count: onHold.length,
      color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
      items: onHold,
    },
    {
      id: 'rejected',
      title: 'Not Recommended / Rejected',
      count: rejected.length,
      color: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
      items: rejected,
    },
  ];

  return (
    <div className="space-y-6 text-[#e6edf3]">
      {/* Header */}
      <div className="pb-4 border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-indigo-400" />
          <h1 className="text-xl font-bold text-[#e6edf3]">Applications Pipeline</h1>
        </div>
        <p className="text-xs text-[#8b949e] mt-1">
          Review candidates moving through the HR assessment stages from initial CV screening to interview decisions.
        </p>
      </div>

      {/* Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => (
          <div
            key={col.id}
            className="bg-[#21262d] rounded-2xl border border-[#30363d] p-4 space-y-3.5 flex flex-col shadow-sm"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
              <span className="text-xs font-bold text-[#e6edf3]">{col.title}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${col.color}`}>
                {col.count}
              </span>
            </div>

            {/* Candidates in this column */}
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {col.items.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#8b949e] border border-dashed border-[#30363d] rounded-xl">
                  No applicants in this stage
                </div>
              ) : (
                col.items.map((cand) => {
                  const verdict = getVerdictBadge(cand.score);
                  return (
                    <div
                      key={cand.id}
                      className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-indigo-500/40 transition space-y-2.5 shadow-2xs group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[#e6edf3] group-hover:text-indigo-300 transition">
                            {cand.name}
                          </h4>
                          <p className="text-[11px] text-[#8b949e]">{cand.appliedPosition}</p>
                        </div>
                        <span className="text-xs font-black text-emerald-400 font-mono">
                          {cand.score.toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full font-bold border ${verdict.badgeClass}`}>
                          {verdict.label}
                        </span>
                        <span className="text-[#8b949e]">
                          {cand.totalYearsExperience} yrs exp
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-[#30363d] flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenCandidateDetail(cand)}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                        >
                          View Dossier
                        </button>

                        <select
                          aria-label="Change candidate status"
                          value={cand.status}
                          onChange={(e) => onUpdateStatus(cand.id, e.target.value as CandidateStatus)}
                          className="text-[10px] bg-[#21262d] border border-[#30363d] rounded px-1.5 py-0.5 text-[#e6edf3] outline-none cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="shortlisted">Shortlist</option>
                          <option value="on_hold">Hold</option>
                          <option value="rejected">Reject</option>
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

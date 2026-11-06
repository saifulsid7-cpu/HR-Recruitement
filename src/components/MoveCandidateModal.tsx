/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRightLeft, Briefcase, CheckCircle, User, X } from 'lucide-react';
import { Candidate, JobRequisition } from '../types';

interface MoveCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  activeRequisitions: JobRequisition[];
  onConfirmMove: (candidateId: string, targetRequisition: JobRequisition) => void;
}

export const MoveCandidateModal: React.FC<MoveCandidateModalProps> = ({
  isOpen,
  onClose,
  candidate,
  activeRequisitions,
  onConfirmMove,
}) => {
  const [selectedReqId, setSelectedReqId] = useState<string>(activeRequisitions[0]?.id || '');

  if (!isOpen || !candidate) return null;

  const targetReq = activeRequisitions.find((r) => r.id === selectedReqId) || activeRequisitions[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetReq) {
      onConfirmMove(candidate.id, targetReq);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Assign / Move Candidate Position
              </h3>
              <p className="text-xs text-zinc-500">Explicit HR Job Position Assignment</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Candidate Info */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Candidate:</span>
              <span className="font-bold text-zinc-900">{candidate.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Current Position:</span>
              <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 font-semibold text-[11px]">
                {candidate.appliedPosition || candidate.category}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Match Score:</span>
              <span className="font-black text-indigo-700">{candidate.score}/100</span>
            </div>
          </div>

          {/* Target Requisition Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-800 block">
              Target Active Job Requisition <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activeRequisitions.map((req) => {
                const isSelected = req.id === selectedReqId;
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedReqId(req.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 shadow-2xs ring-2 ring-blue-200'
                        : 'bg-white border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-zinc-200 rounded text-zinc-700">
                          {req.id}
                        </span>
                        <span className="font-bold text-zinc-900">{req.title}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {req.department} · {req.hiringCategory === 'top_priority' ? 'Urgent / Top Priority' : 'Current Hiring'}
                      </div>
                    </div>
                    {isSelected && <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
            <strong>Note:</strong> Reassigning updates this candidate&apos;s target position. As mandated by hiring rules, only candidates explicitly assigned to the selected position appear in that position&apos;s active ranking list.
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Confirm Position Assignment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

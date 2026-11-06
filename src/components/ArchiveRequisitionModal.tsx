/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Archive, CheckCircle, FileText, Info, X, XCircle } from 'lucide-react';
import { JobRequisition } from '../types';

interface ArchiveRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: JobRequisition | null;
  onConfirmArchive: (data: {
    reason: 'Filled' | 'Cancelled' | 'Closed' | 'Recruitment Completed';
    notes: string;
    hiredCandidateName?: string;
  }) => void;
  candidateNames: string[];
}

export const ArchiveRequisitionModal: React.FC<ArchiveRequisitionModalProps> = ({
  isOpen,
  onClose,
  requisition,
  onConfirmArchive,
  candidateNames,
}) => {
  const [reason, setReason] = useState<'Filled' | 'Cancelled' | 'Closed' | 'Recruitment Completed'>('Filled');
  const [hiredName, setHiredName] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !requisition) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmArchive({
      reason,
      notes: notes.trim(),
      hiredCandidateName: reason === 'Filled' ? hiredName.trim() : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Archive Job Requisition
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                {requisition.id} · {requisition.title}
              </p>
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
          {/* Requisition Info */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-500">Department:</span>
              <span className="font-semibold text-zinc-800">{requisition.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Hiring Category:</span>
              <span className="font-semibold text-zinc-800">
                {requisition.hiringCategory === 'top_priority' ? 'Top Hiring Priority' : 'Current Hiring'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Active Evaluated Candidates:</span>
              <span className="font-semibold text-zinc-800">{candidateNames.length} candidate(s)</span>
            </div>
          </div>

          {/* Archive Reason */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-800 block">
              Recruitment Completion Status / Reason <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setReason('Filled')}
                className={`p-2.5 rounded-lg border text-center transition cursor-pointer ${
                  reason === 'Filled'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-2 ring-emerald-200'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <CheckCircle className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <span>Filled / Hired</span>
              </button>

              <button
                type="button"
                onClick={() => setReason('Closed')}
                className={`p-2.5 rounded-lg border text-center transition cursor-pointer ${
                  reason === 'Closed'
                    ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold ring-2 ring-zinc-300'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <Archive className="w-4 h-4 mx-auto mb-1 text-zinc-600" />
                <span>Closed</span>
              </button>

              <button
                type="button"
                onClick={() => setReason('Cancelled')}
                className={`p-2.5 rounded-lg border text-center transition cursor-pointer ${
                  reason === 'Cancelled'
                    ? 'bg-rose-50 border-rose-400 text-rose-900 font-bold ring-2 ring-rose-200'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <XCircle className="w-4 h-4 mx-auto mb-1 text-rose-600" />
                <span>Cancelled</span>
              </button>
            </div>
          </div>

          {/* Hired Candidate Name (if reason is Filled) */}
          {reason === 'Filled' && (
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-800 block">
                Hired Candidate Name (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Select or enter hired candidate name"
                  value={hiredName}
                  onChange={(e) => setHiredName(e.target.value)}
                  list="candidate-list"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                <datalist id="candidate-list">
                  {candidateNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-800 block">
              Archive & Resolution Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Position successfully filled at Grade ME-11. Remaining candidate records retained in historical talent archive."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-[11px] flex items-start gap-2">
            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong>Retention Notice:</strong> Archiving moves this requisition and its evaluated candidates into the <strong>Previous Hiring Data</strong> folder. All evaluation scores, criteria marks, rankings, and HR decisions are permanently preserved.
            </div>
          </div>

          {/* Actions */}
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
              className="px-4 py-2 font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Archive className="w-4 h-4" />
              <span>Confirm & Archive Requisition</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

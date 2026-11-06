/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  DollarSign,
  FileSpreadsheet,
  Percent,
  RefreshCw,
  Users,
  X,
} from 'lucide-react';
import { Candidate } from '../types';

interface BulkSalaryAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCandidates: Candidate[];
  onApplyAdjustment: (params: {
    type: 'percentage' | 'fixed_amount' | 'sourcing_switch' | 'grade_override';
    value?: number;
    sourcingType?: 'external' | 'in-house';
    grade?: string;
    reason: string;
  }) => void;
  singleCandidate?: Candidate | null;
}

export const BulkSalaryAdjustModal: React.FC<BulkSalaryAdjustModalProps> = ({
  isOpen,
  onClose,
  selectedCandidates,
  onApplyAdjustment,
  singleCandidate,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<
    'percentage' | 'fixed_amount' | 'sourcing_switch' | 'grade_override'
  >('percentage');
  const [percentVal, setPercentVal] = useState<number>(5);
  const [amountVal, setAmountVal] = useState<number>(2000);
  const [sourcingTypeVal, setSourcingTypeVal] = useState<'external' | 'in-house'>('external');
  const [gradeVal, setGradeVal] = useState<string>('ME-11');
  const [reason, setReason] = useState<string>('Standard annual performance & market review fixation adjustment.');

  if (!isOpen) return null;

  const targets = singleCandidate ? [singleCandidate] : selectedCandidates;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targets.length === 0) return;

    onApplyAdjustment({
      type: adjustmentType,
      value: adjustmentType === 'percentage' ? percentVal : amountVal,
      sourcingType: sourcingTypeVal,
      grade: gradeVal,
      reason,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-700" />
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                {singleCandidate ? `Adjust Salary: ${singleCandidate.name}` : `Bulk Salary Fixation Adjustment`}
              </h3>
              <p className="text-[11px] text-zinc-500">
                Apply remuneration matrix modifications to {targets.length} candidate(s)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 rounded transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {targets.length > 0 && (
            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center gap-2 text-zinc-700">
              <Users className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="truncate">
                Affecting: <strong>{targets.map((c) => c.name).join(', ')}</strong>
              </span>
            </div>
          )}

          {/* Adjustment Type Selector */}
          <div>
            <label className="block font-semibold text-zinc-700 mb-1.5">Adjustment Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('percentage')}
                className={`p-2 rounded-lg border font-medium text-left transition cursor-pointer ${
                  adjustmentType === 'percentage'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold'
                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                <Percent className="w-3.5 h-3.5 mb-1 text-blue-600" />
                <span>Percentage (+/- %)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('fixed_amount')}
                className={`p-2 rounded-lg border font-medium text-left transition cursor-pointer ${
                  adjustmentType === 'fixed_amount'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold'
                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 mb-1 text-emerald-600" />
                <span>Fixed Amount (BDT)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('sourcing_switch')}
                className={`p-2 rounded-lg border font-medium text-left transition cursor-pointer ${
                  adjustmentType === 'sourcing_switch'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold'
                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 mb-1 text-purple-600" />
                <span>Sourcing Tier (Ext / Int)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('grade_override')}
                className={`p-2 rounded-lg border font-medium text-left transition cursor-pointer ${
                  adjustmentType === 'grade_override'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold'
                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mb-1 text-indigo-600" />
                <span>Grade Override</span>
              </button>
            </div>
          </div>

          {/* Conditional input value */}
          {adjustmentType === 'percentage' && (
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Percentage Adjustment (%)
              </label>
              <input
                type="number"
                value={percentVal}
                onChange={(e) => setPercentVal(parseFloat(e.target.value) || 0)}
                step="0.5"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-1 focus:ring-blue-600 font-mono"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Use positive (e.g. +8) for salary increment or negative for reduction.
              </p>
            </div>
          )}

          {adjustmentType === 'fixed_amount' && (
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Fixed BDT Increment / Adjustment
              </label>
              <input
                type="number"
                value={amountVal}
                onChange={(e) => setAmountVal(parseInt(e.target.value, 10) || 0)}
                step="500"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-1 focus:ring-blue-600 font-mono"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Enter amount in Bangladeshi Taka (BDT) (e.g. 2500).
              </p>
            </div>
          )}

          {adjustmentType === 'sourcing_switch' && (
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Sourcing Channel</label>
              <select
                aria-label="Sourcing Channel"
                value={sourcingTypeVal}
                onChange={(e) => setSourcingTypeVal(e.target.value as 'external' | 'in-house')}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              >
                <option value="external">External Market Hire (Official Market Pay Scale)</option>
                <option value="in-house">In-House Promotion / Internal Transfer</option>
              </select>
            </div>
          )}

          {adjustmentType === 'grade_override' && (
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Target Grade</label>
              <select
                aria-label="Target Grade"
                value={gradeVal}
                onChange={(e) => setGradeVal(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              >
                <option value="ME-9">Grade ME-9 (Asst. Manager: ~TK 75k / TK 60k)</option>
                <option value="ME-10">Grade ME-10 (Sr. Executive: ~TK 65k / TK 50k)</option>
                <option value="ME-11">Grade ME-11 (Executive: ~TK 40k-50k)</option>
                <option value="ME-12">Grade ME-12 (Asst. Executive: ~TK 32k-35k)</option>
                <option value="ME-13">Grade ME-13 (Trainee: ~TK 20k-22k)</option>
              </select>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Justification Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              placeholder="e.g. Approved budget revision / panel interview recommendation"
              required
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-zinc-600 hover:text-zinc-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs cursor-pointer"
            >
              Apply Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

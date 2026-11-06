/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Scale, Search, Sliders, X } from 'lucide-react';
import { STANDARD_POSITION_CRITERIA } from '../data/standardCriteria';
import { DEFAULT_CRITERIA_CONFIG } from '../data/evaluationCriteria';
import { EvaluationCriterionConfig } from '../types';

interface StandardCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  criteriaConfig?: EvaluationCriterionConfig[];
  onSaveCriteriaConfig?: (newConfig: EvaluationCriterionConfig[]) => void;
}

export const StandardCriteriaModal: React.FC<StandardCriteriaModalProps> = ({
  isOpen,
  onClose,
  criteriaConfig = DEFAULT_CRITERIA_CONFIG,
  onSaveCriteriaConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'weights' | 'benchmarks'>('weights');
  const [editingWeights, setEditingWeights] = useState<EvaluationCriterionConfig[]>(criteriaConfig);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync when prop updates
  React.useEffect(() => {
    setEditingWeights(criteriaConfig);
  }, [criteriaConfig]);

  if (!isOpen) return null;

  const currentTotal = editingWeights.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  const isValidTotal = currentTotal === 100;

  const handleWeightChange = (id: string, value: number) => {
    setEditingWeights((prev) =>
      prev.map((c) => (c.id === id ? { ...c, weight: Math.max(0, Math.min(100, value)) } : c))
    );
    setSaveSuccess(false);
  };

  const handleSave = () => {
    if (!isValidTotal) return;
    if (onSaveCriteriaConfig) {
      onSaveCriteriaConfig(editingWeights);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleReset = () => {
    setEditingWeights(DEFAULT_CRITERIA_CONFIG);
    if (onSaveCriteriaConfig) {
      onSaveCriteriaConfig(DEFAULT_CRITERIA_CONFIG);
    }
    setSaveSuccess(false);
  };

  const filteredRoles = STANDARD_POSITION_CRITERIA.filter((r) =>
    r.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentRole = STANDARD_POSITION_CRITERIA[selectedRoleIndex] || STANDARD_POSITION_CRITERIA[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-2xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Evaluation Criteria & Scoring Rubric Configuration
              </h3>
              <p className="text-xs text-zinc-500">
                Configure evaluation weights (100 total marks) or inspect position benchmark rubrics
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

        {/* Tab Selector */}
        <div className="px-6 py-2.5 border-b border-zinc-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('weights')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === 'weights'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>HR Criteria Weights (100 Marks)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('benchmarks')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === 'benchmarks'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Position Benchmark Library (9 RMG Roles)</span>
            </button>
          </div>

          {activeTab === 'weights' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500">Total Marks:</span>
              <span
                className={`px-2 py-0.5 rounded font-black text-xs ${
                  isValidTotal ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {currentTotal}/100 Marks
              </span>
            </div>
          )}
        </div>

        {/* Tab 1: HR Criteria Weights Configuration */}
        {activeTab === 'weights' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-zinc-50/40">
            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-2">
              <h4 className="font-bold text-zinc-900 text-sm">Customizable Scoring Allocation</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                HR can configure the marks allocated to each of the 6 core criteria. All evaluations and rankings will adapt to these weights. The sum of all criteria weights must equal exactly <strong>100 marks</strong>.
              </p>
            </div>

            <div className="space-y-3">
              {editingWeights.map((criterion) => (
                <div
                  key={criterion.id}
                  className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 text-xs sm:text-sm">{criterion.name}</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{criterion.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={criterion.weight}
                        onChange={(e) => handleWeightChange(criterion.id, parseInt(e.target.value, 10) || 0)}
                        className="w-16 px-2 py-1.5 text-center text-sm font-bold border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-zinc-50"
                      />
                      <span className="text-xs font-semibold text-zinc-500">marks</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Validation Notice & Actions */}
            <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div className="text-xs">
                {!isValidTotal ? (
                  <span className="font-bold text-rose-600">
                    ⚠ Warning: Total marks currently sum to {currentTotal}. Please adjust weights so they equal exactly 100 marks.
                  </span>
                ) : (
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Weights successfully balanced (100/100 Marks).
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="button"
                  disabled={!isValidTotal}
                  onClick={handleSave}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    isValidTotal
                      ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-2xs'
                      : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  Save Configuration
                </button>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg font-bold text-center">
                ✓ Criteria weights successfully saved! Applied to all screening evaluations.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Position Benchmark Library */}
        {activeTab === 'benchmarks' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Roles list */}
            <div className="w-full md:w-64 border-r border-zinc-200 flex flex-col bg-zinc-50/50">
              <div className="p-3 border-b border-zinc-200">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filter position benchmark..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 focus:outline-hidden bg-white"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-zinc-200/60">
                {filteredRoles.map((role) => {
                  const isSelected = role.position === currentRole.position;
                  return (
                    <button
                      key={role.position}
                      type="button"
                      onClick={() => {
                        const origIndex = STANDARD_POSITION_CRITERIA.findIndex(
                          (r) => r.position === role.position
                        );
                        setSelectedRoleIndex(origIndex);
                      }}
                      className={`w-full text-left p-3 text-xs transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-100/70 text-indigo-950 font-bold border-l-4 border-indigo-700'
                          : 'hover:bg-zinc-100/80 text-zinc-700 font-medium'
                      }`}
                    >
                      <div>{role.position}</div>
                      <div className="text-[10px] text-zinc-400 font-normal">
                        Dept: {role.department}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Criteria table */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
              <div className="pb-3 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-zinc-900">{currentRole.position}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-semibold border border-zinc-200">
                    {currentRole.department}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Standard industry benchmarks for {currentRole.position} (Advisory evaluation guidance)
                </p>
              </div>

              <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-lg overflow-hidden">
                {currentRole.criteria.map((crit) => (
                  <div
                    key={crit.critNumber}
                    className="p-3.5 bg-white hover:bg-zinc-50/50 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {crit.critNumber}
                        </span>
                        <span className="font-bold text-zinc-900">{crit.category}</span>
                      </div>
                      <p className="text-zinc-600 leading-relaxed pl-7">
                        {crit.standardCriterion}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto pl-7 sm:pl-0">
                      <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-800 font-bold text-[11px] border border-indigo-200">
                        Weight: {crit.weight}%
                      </span>
                      <span className="text-[11px] text-zinc-400">Max: 5.0 pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            Advisory Rubric Standards · Scores inform HR review without automated decision making.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-white border border-zinc-300 rounded-lg shadow-2xs hover:bg-zinc-50 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

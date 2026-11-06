/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CheckCircle,
  Eye,
  EyeOff,
  Filter,
  HelpCircle,
  History,
  LayoutGrid,
  List,
  Percent,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';
import { Candidate, CandidateStatus, RatingBand, TieBreakerRule } from '../types';
import { getRatingFromScore } from '../data/standardCriteria';
import { TIE_BREAKER_OPTIONS } from '../data/evaluationCriteria';

interface CandidateFilterToolbarProps {
  filter: {
    status: 'all' | CandidateStatus;
    rating: 'all' | RatingBand;
    category: string;
    stability: 'all' | 'stable' | 'rapid_changer';
    search: string;
    minScore: number;
  };
  onChangeFilter: (newFilter: CandidateFilterToolbarProps['filter']) => void;
  candidates: Candidate[];
  onBulkStatusChange: (status: CandidateStatus) => void;
  selectedCount: number;
  categories: string[];
  onOpenCategoryManager: () => void;
  onOpenBulkActionLog: () => void;
  onOpenBulkSalaryAdjust: () => void;
  bulkActionLogCount: number;
  blindMode: boolean;
  onToggleBlindMode: () => void;
  viewMode: 'table' | 'cards';
  onToggleViewMode: (mode: 'table' | 'cards') => void;
  tieBreaker: TieBreakerRule;
  onChangeTieBreaker: (rule: TieBreakerRule) => void;
}

export const CandidateFilterToolbar: React.FC<CandidateFilterToolbarProps> = ({
  filter,
  onChangeFilter,
  candidates,
  onBulkStatusChange,
  selectedCount,
  categories,
  onOpenCategoryManager,
  onOpenBulkActionLog,
  onOpenBulkSalaryAdjust,
  bulkActionLogCount,
  blindMode,
  onToggleBlindMode,
  viewMode,
  onToggleViewMode,
  tieBreaker,
  onChangeTieBreaker,
}) => {
  const total = candidates.length;
  const shortlistedCount = candidates.filter((c) => c.status === 'shortlisted').length;
  const onHoldCount = candidates.filter((c) => c.status === 'on_hold').length;
  const rejectedCount = candidates.filter((c) => c.status === 'rejected').length;
  const pendingCount = candidates.filter((c) => c.status === 'pending').length;
  const rapidChangerCount = candidates.filter((c) => c.jobStability?.isFrequentJobChanger).length;

  const statusTabs: Array<{ id: 'all' | CandidateStatus; label: string; count: number; color?: string }> = [
    { id: 'all', label: 'All Candidates', count: total },
    { id: 'pending', label: 'Pending HR Review', count: pendingCount, color: 'text-zinc-300 bg-[#161b22]' },
    { id: 'shortlisted', label: 'Shortlisted by HR', count: shortlistedCount, color: 'text-emerald-300 bg-emerald-950/60' },
    { id: 'on_hold', label: 'On Hold by HR', count: onHoldCount, color: 'text-amber-300 bg-amber-950/60' },
    { id: 'rejected', label: 'Rejected by HR', count: rejectedCount, color: 'text-rose-300 bg-rose-950/60' },
  ];

  return (
    <div className="bg-[#21262d] rounded-2xl border border-[#30363d] shadow-sm p-4 space-y-4 text-[#e6edf3]">
      {/* Top Row: Search, View Mode Toggle, Blind Screening, Utility Modals */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search candidates by name, skill, position, or gap..."
            value={filter.search}
            onChange={(e) => onChangeFilter({ ...filter, search: e.target.value })}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#30363d] focus:outline-none focus:border-indigo-500 bg-[#161b22] text-[#e6edf3] placeholder-[#8b949e]"
          />
          {filter.search && (
            <button
              type="button"
              onClick={() => onChangeFilter({ ...filter, search: '' })}
              className="absolute right-2.5 top-2 text-[#8b949e] hover:text-[#e6edf3] text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* View Mode & Utility Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle: Table vs Cards */}
          <div className="inline-flex rounded-lg border border-[#30363d] bg-[#161b22] p-0.5">
            <button
              type="button"
              onClick={() => onToggleViewMode('table')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#21262d] text-white shadow-2xs font-bold border border-indigo-500/40'
                  : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
              title="Switch to Ranked Table View (9 required ranking columns)"
            >
              <List className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ranked Table</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleViewMode('cards')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#21262d] text-white shadow-2xs font-bold border border-indigo-500/40'
                  : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
              title="Switch to Detailed Candidate Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cards View</span>
            </button>
          </div>

          {/* Blind Screening Toggle */}
          <button
            type="button"
            onClick={onToggleBlindMode}
            className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer ${
              blindMode
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xs'
                : 'bg-[#161b22] hover:bg-[#30363d] text-[#e6edf3] border-[#30363d]'
            }`}
            title="Toggle blind screening mode (hides names and personal identifiers for unbiased assessment)"
          >
            {blindMode ? <EyeOff className="w-3.5 h-3.5 mr-1.5" /> : <Eye className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />}
            <span>Blind Screening {blindMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Bulk Salary Adjust */}
          <button
            type="button"
            onClick={onOpenBulkSalaryAdjust}
            className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-blue-300 bg-blue-950/50 border border-blue-500/40 rounded-lg hover:bg-blue-900/50 transition cursor-pointer"
            title="Adjust salary offers across multiple candidates"
          >
            <Percent className="w-3.5 h-3.5 mr-1 text-blue-400" />
            <span>Remuneration Matrix</span>
          </button>

          {/* Bulk Action Log */}
          <button
            type="button"
            onClick={onOpenBulkActionLog}
            className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-indigo-300 bg-indigo-950/50 border border-indigo-500/40 rounded-lg hover:bg-indigo-900/50 transition cursor-pointer"
            title="View audit trail of all HR bulk actions"
          >
            <History className="w-3.5 h-3.5 mr-1 text-indigo-400" />
            <span>Audit Trail</span>
            {bulkActionLogCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-indigo-900 text-indigo-200 border border-indigo-700/50">
                {bulkActionLogCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Row 2: Status Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e] mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-indigo-400" />
          Status:
        </span>
        {statusTabs.map((tab) => {
          const isActive = filter.status === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeFilter({ ...filter, status: tab.id })}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xs font-bold'
                  : 'bg-[#161b22] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] border-[#30363d]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`ml-1.5 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : tab.color || 'bg-[#21262d] text-[#8b949e]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Row 3: Dropdown Filters (Category, Score Band, Tenure, Tie-Breaking Rule) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#30363d]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Position / Category filter */}
          <div className="flex items-center gap-1.5 bg-[#161b22] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs">
            <span className="text-[#8b949e] font-medium">Position:</span>
            <select
              aria-label="Filter by Job Position"
              value={filter.category}
              onChange={(e) => onChangeFilter({ ...filter, category: e.target.value })}
              className="bg-transparent font-bold text-[#e6edf3] outline-none cursor-pointer max-w-[170px]"
            >
              <option value="all" className="bg-[#161b22] text-[#e6edf3]">All Positions ({total})</option>
              {categories.map((cat) => {
                const count = candidates.filter((c) => c.category === cat || c.appliedPosition === cat).length;
                return (
                  <option key={cat} value={cat} className="bg-[#161b22] text-[#e6edf3]">
                    {cat} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Score Range Filter */}
          <div className="flex items-center gap-1.5 bg-[#161b22] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs">
            <span className="text-[#8b949e] font-medium">Score Range:</span>
            <select
              aria-label="Filter by Score Band"
              value={filter.rating}
              onChange={(e) => onChangeFilter({ ...filter, rating: e.target.value as any })}
              className="bg-transparent font-bold text-[#e6edf3] outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#161b22] text-[#e6edf3]">All Match Scores ({total})</option>
              <option value="Highly Recommended" className="bg-[#161b22] text-emerald-300">85 - 100 (Highly Recommended)</option>
              <option value="Recommended" className="bg-[#161b22] text-teal-300">70 - 84.9 (Recommended)</option>
              <option value="Consider with Reservations" className="bg-[#161b22] text-amber-300">50 - 69.9 (With Reservations)</option>
              <option value="Not Recommended" className="bg-[#161b22] text-rose-300">&lt; 50 (Not Recommended)</option>
            </select>
          </div>

          {/* Tenure Stability Filter */}
          <div className="flex items-center gap-1.5 bg-[#161b22] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <select
              aria-label="Filter by Tenure Stability"
              value={filter.stability}
              onChange={(e) => onChangeFilter({ ...filter, stability: e.target.value as any })}
              className="bg-transparent font-medium text-[#e6edf3] outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#161b22] text-[#e6edf3]">All Tenures ({total})</option>
              <option value="stable" className="bg-[#161b22] text-emerald-300">Stable (≥ 1.5 yrs) ({total - rapidChangerCount})</option>
              <option value="rapid_changer" className="bg-[#161b22] text-amber-300">Advisory: Rapid Changers ({rapidChangerCount})</option>
            </select>
          </div>
        </div>

        {/* Tie-breaking rule selector */}
        <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/40 rounded-lg px-2.5 py-1 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-indigo-300 font-bold">Tie-Breaking:</span>
          <select
            aria-label="Candidate Ranking Tie-Breaker"
            value={tieBreaker}
            onChange={(e) => onChangeTieBreaker(e.target.value as TieBreakerRule)}
            className="bg-transparent font-bold text-indigo-200 outline-none cursor-pointer"
            title="Configure transparent job-related tie-breaking logic for equal scores"
          >
            {TIE_BREAKER_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-[#161b22] text-[#e6edf3]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 4: Batch HR Decisions Bar (Human Controlled) */}
      <div className="p-2.5 bg-[#161b22] rounded-xl border border-[#30363d] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-[#e6edf3]">
            {selectedCount > 0
              ? `${selectedCount} candidate(s) selected for HR action`
              : 'Select candidates to apply batch human decision'}
          </span>
        </div>

        {selectedCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#8b949e] font-medium text-[10px] uppercase">Apply HR Action:</span>
            <button
              type="button"
              onClick={() => onBulkStatusChange('shortlisted')}
              className="inline-flex items-center px-2.5 py-1 rounded-md font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 transition cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              <span>Shortlist Selected</span>
            </button>

            <button
              type="button"
              onClick={() => onBulkStatusChange('on_hold')}
              className="inline-flex items-center px-2.5 py-1 rounded-md font-semibold text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1 text-amber-400" />
              <span>Put On Hold</span>
            </button>

            <button
              type="button"
              onClick={() => onBulkStatusChange('rejected')}
              className="inline-flex items-center px-2.5 py-1 rounded-md font-semibold text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 transition cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5 mr-1 text-rose-400" />
              <span>Reject Selected</span>
            </button>

            <button
              type="button"
              onClick={() => onBulkStatusChange('pending')}
              className="inline-flex items-center px-2 py-1 rounded-md font-medium text-[#8b949e] bg-[#21262d] hover:bg-[#30363d] hover:text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
            >
              <span>Reset to Pending</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

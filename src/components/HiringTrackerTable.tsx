/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  HiringTrackerRecord,
  HiringTrackerStatus,
  INITIAL_TRACKER_RECORDS,
  MASTER_DEPARTMENTS,
  MASTER_DIVISIONS,
  MASTER_POSITIONS,
  STATUS_CONFIG,
  getStoredTrackerRecords,
  saveStoredTrackerRecords,
} from '../data/hiringTrackerData';
import {
  exportHiringTrackerToCSV,
  exportHiringTrackerToExcel,
} from '../utils/hiringTrackerExport';
import { Candidate, JobRequisition, NavigationMenuTab } from '../types';

interface HiringTrackerTableProps {
  candidates?: Candidate[];
  activeRequisitions?: JobRequisition[];
  trackerRecords?: HiringTrackerRecord[];
  onAddTrackerRecord?: (record: HiringTrackerRecord) => void;
  onUpdateTrackerRecord?: (id: string, field: keyof HiringTrackerRecord, value: any) => void;
  onDeleteTrackerRecord?: (id: string) => void;
  onSaveAllTrackerRecords?: () => void;
  onSelectRequisition?: (req: JobRequisition) => void;
  onNavigateTab?: (tab: NavigationMenuTab) => void;
}

export const HiringTrackerTable: React.FC<HiringTrackerTableProps> = ({
  candidates = [],
  activeRequisitions = [],
  trackerRecords: externalRecords,
  onAddTrackerRecord,
  onUpdateTrackerRecord,
  onDeleteTrackerRecord,
  onSaveAllTrackerRecords,
  onSelectRequisition,
  onNavigateTab,
}) => {
  // 1. Persistent Records State (uses external lifted state when provided, else local fallback)
  const [localRecords, setLocalRecords] = useState<HiringTrackerRecord[]>(() => {
    return getStoredTrackerRecords();
  });

  const records = externalRecords ?? localRecords;

  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<{ rowId: string; field: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | HiringTrackerStatus>('ALL');
  const [divisionFilter, setDivisionFilter] = useState<string>('ALL');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Combobox position search state
  const [positionDropdownRowId, setPositionDropdownRowId] = useState<string | null>(null);
  const [positionSearchTerm, setPositionSearchTerm] = useState('');
  const positionComboboxRef = useRef<HTMLDivElement | null>(null);

  // Remarks modal expansion
  const [expandedRemarksRecord, setExpandedRemarksRecord] = useState<HiringTrackerRecord | null>(null);
  const [remarksDraft, setRemarksDraft] = useState('');

  // Auto-save to localStorage whenever localRecords change (when in standalone mode)
  useEffect(() => {
    if (!externalRecords) {
      saveStoredTrackerRecords(localRecords);
    }
  }, [localRecords, externalRecords]);

  // Handle outside click for position combobox
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        positionComboboxRef.current &&
        !positionComboboxRef.current.contains(e.target as Node)
      ) {
        setPositionDropdownRowId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. Live Dynamic Status Metrics
  const metrics = useMemo(() => {
    const total = records.length;
    const running = records.filter((r) => r.currentStatus === 'RUNNING').length;
    const waiting = records.filter((r) => r.currentStatus === 'WAITING').length;
    const onHold = records.filter((r) => r.currentStatus === 'ON - HOLD').length;
    const closed = records.filter((r) => r.currentStatus === 'CLOSED').length;
    const done = records.filter((r) => r.currentStatus === 'DONE').length;
    return { total, running, waiting, onHold, closed, done };
  }, [records]);

  // 3. Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Status Filter
      if (statusFilter !== 'ALL' && r.currentStatus !== statusFilter) {
        return false;
      }
      // Division Filter
      if (divisionFilter !== 'ALL' && r.division !== divisionFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchPos = (r.position || '').toLowerCase().includes(q);
        const matchReq = (r.requisitionNo || '').toLowerCase().includes(q);
        const matchDept = (r.department || '').toLowerCase().includes(q);
        const matchDiv = (r.division || '').toLowerCase().includes(q);
        const matchRepl = (r.replacementEmployee || '').toLowerCase().includes(q);
        const matchFinal = (r.finalizedEmployee || '').toLowerCase().includes(q);
        const matchRemarks = (r.remarks || '').toLowerCase().includes(q);
        if (
          !matchPos &&
          !matchReq &&
          !matchDept &&
          !matchDiv &&
          !matchRepl &&
          !matchFinal &&
          !matchRemarks
        ) {
          return false;
        }
      }
      return true;
    });
  }, [records, statusFilter, divisionFilter, searchQuery]);

  // 4. Update Single Field of a Record
  const updateRecordField = (id: string, field: keyof HiringTrackerRecord, value: any) => {
    if (onUpdateTrackerRecord) {
      onUpdateTrackerRecord(id, field, value);
      return;
    }
    setLocalRecords((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            [field]: value,
            isModified: true,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );
  };

  // 5. Add New Track Record (Auto increments SL)
  const handleAddNewRecord = () => {
    const nextSl = records.length > 0 ? Math.max(...records.map((r) => r.sl || 0)) + 1 : 1;
    const newId = `TRACK-${Date.now()}`;
    const newReqNo = `REQ-2026-${String(nextSl).padStart(3, '0')}`;

    const newRecord: HiringTrackerRecord = {
      id: newId,
      sl: nextSl,
      requisitionNo: newReqNo,
      position: 'MERCHANDISER',
      division: 'Merchandising',
      department: 'Merchandising - 1',
      totalResumes: 0,
      conducted: 0,
      shortlisted: 0,
      replacementEmployee: 'New Headcount',
      finalizedEmployee: '',
      finalizedSalary: '',
      joiningDate: '',
      currentStatus: 'RUNNING',
      remarks: 'Newly initiated requisition position trail',
      updatedAt: new Date().toISOString(),
      isModified: true,
    };

    if (onAddTrackerRecord) {
      onAddTrackerRecord(newRecord);
    } else {
      setLocalRecords((prev) => [newRecord, ...prev]);
    }
    setActiveRowId(newId);
    showNotification('New position track record added & synced with Jobs');
  };

  // 6. Delete Record
  const handleDeleteRecord = (id: string, reqNo: string) => {
    if (onDeleteTrackerRecord) {
      onDeleteTrackerRecord(id);
    } else {
      setLocalRecords((prev) => {
        const remaining = prev.filter((r) => r.id !== id);
        return remaining.map((r, idx) => ({
          ...r,
          sl: idx + 1,
        }));
      });
    }
    showNotification(`Record ${reqNo} removed`);
  };

  // 7. Save All Changes
  const handleSaveAll = () => {
    if (onSaveAllTrackerRecords) {
      onSaveAllTrackerRecords();
    } else {
      saveStoredTrackerRecords(localRecords);
      setLocalRecords((prev) => prev.map((r) => ({ ...r, isModified: false })));
    }
    showNotification('All changes successfully saved & synchronized');
  };

  const showNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Filter positions for combobox
  const filteredPositionsForCombobox = useMemo(() => {
    if (!positionSearchTerm.trim()) return MASTER_POSITIONS;
    const term = positionSearchTerm.toLowerCase();
    return MASTER_POSITIONS.filter((p) => p.toLowerCase().includes(term));
  }, [positionSearchTerm]);

  // Format date helper: YYYY-MM-DD -> DD-MM-YYYY display
  const formatDisplayDate = (val: string) => {
    if (!val) return '-';
    if (val.includes('-')) {
      const parts = val.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return val;
  };

  // Pipeline stage counts
  const pipelineStages = useMemo(() => {
    const sourcingCount =
      candidates.length > 0
        ? candidates.length
        : records.reduce((sum, r) => sum + (Number(r.totalResumes) || 0), 0);
    const screeningCount = candidates.filter(
      (c) => c.status === 'pending' || c.status === 'on_hold'
    ).length;
    const interviewingCount =
      candidates.filter((c) => c.status === 'interview').length ||
      records.reduce((sum, r) => sum + (Number(r.conducted) || 0), 0);
    const finalizedCount =
      candidates.filter(
        (c) => c.status === 'selected' || c.status === 'shortlisted'
      ).length ||
      records.filter((r) => r.currentStatus === 'DONE').length;

    return [
      {
        label: 'Sourcing',
        count: sourcingCount,
        dot: 'bg-cyan-400',
        badge: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30',
      },
      {
        label: 'Screening',
        count: screeningCount,
        dot: 'bg-violet-400',
        badge: 'bg-violet-950/60 text-violet-300 border-violet-500/30',
      },
      {
        label: 'Interviewing',
        count: interviewingCount,
        dot: 'bg-amber-400',
        badge: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
      },
      {
        label: 'Finalized',
        count: finalizedCount,
        dot: 'bg-emerald-400',
        badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
      },
    ];
  }, [candidates, records]);

  return (
    <div className="bg-[#14162b] rounded-2xl border border-indigo-500/20 p-4 sm:p-6 space-y-5 shadow-xl text-[#e6edf3]">
      {/* 1. Header Toolbar with Section Title, Glowing Indigo/Purple Badge & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-indigo-500/20">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-[0_0_16px_rgba(99,102,241,0.5)] shrink-0">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#e6edf3] tracking-tight">
              Hiring Tracking
            </h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.45)]">
              {records.length} Active Records
            </span>
          </div>
          <p className="text-xs text-[#8b949e]">
            Real-time interactive requisition ledger, candidate pipeline stages, salary fixation, and joining status.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Button 1: Add New Track Record */}
          <button
            type="button"
            onClick={handleAddNewRecord}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/30 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Track Record</span>
          </button>

          {/* Button 2: Save All Changes */}
          <button
            type="button"
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#21262d] hover:bg-[#30363d] text-emerald-300 border border-emerald-500/40 shadow-xs transition cursor-pointer shrink-0"
            title="Save all row changes to local persistent database"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>💾 Save All Changes</span>
          </button>

          {/* Button 3: Export to Excel/CSV */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] hover:border-purple-500/50 shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>📥 Export Tracker</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8b949e]" />
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-[#1c2128] border border-[#30363d] rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      exportHiringTrackerToExcel(records);
                      setShowExportMenu(false);
                      showNotification('Excel spreadsheet (.xlsx) downloaded');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#21262d] text-emerald-300 transition text-left cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">Export as Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportHiringTrackerToCSV(records);
                      setShowExportMenu(false);
                      showNotification('CSV file (.csv) downloaded');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#21262d] text-[#e6edf3] transition text-left cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold">Export as CSV (.csv)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Stages Bar (Sourcing, Screening, Interviewing, Finalized) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {pipelineStages.map((stage) => (
          <div
            key={stage.label}
            className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between ${stage.badge}`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {stage.label}
              </span>
            </div>
            <span className="text-base font-black font-mono">{stage.count}</span>
          </div>
        ))}
      </div>

      {/* Save Toast Notification */}
      {saveToast && (
        <div className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{saveToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveToast(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Dynamic Live Status KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Total Positions */}
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-purple-950/40 border-purple-500/60 ring-2 ring-purple-500/20'
              : 'bg-[#21262d] border-[#30363d] hover:border-purple-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-[#8b949e] text-[11px] font-bold">
            <span>TOTAL</span>
            <Briefcase className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-extrabold text-[#e6edf3] mt-1">{metrics.total}</div>
          <div className="text-[10px] text-[#8b949e]">All Positions</div>
        </button>

        {/* RUNNING */}
        <button
          type="button"
          onClick={() => setStatusFilter('RUNNING')}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            statusFilter === 'RUNNING'
              ? 'bg-amber-950/40 border-amber-500/60 ring-2 ring-amber-500/20'
              : 'bg-[#21262d] border-[#30363d] hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-amber-400 text-[11px] font-bold">
            <span>RUNNING</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div className="text-xl font-extrabold text-amber-300 mt-1">{metrics.running}</div>
          <div className="text-[10px] text-[#8b949e]">Active Sourcing</div>
        </button>

        {/* WAITING */}
        <button
          type="button"
          onClick={() => setStatusFilter('WAITING')}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            statusFilter === 'WAITING'
              ? 'bg-sky-950/40 border-sky-500/60 ring-2 ring-sky-500/20'
              : 'bg-[#21262d] border-[#30363d] hover:border-sky-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-sky-400 text-[11px] font-bold">
            <span>WAITING</span>
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-extrabold text-sky-300 mt-1">{metrics.waiting}</div>
          <div className="text-[10px] text-[#8b949e]">Waiting for Joining</div>
        </button>

        {/* ON - HOLD */}
        <button
          type="button"
          onClick={() => setStatusFilter('ON - HOLD')}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            statusFilter === 'ON - HOLD'
              ? 'bg-orange-950/40 border-orange-500/60 ring-2 ring-orange-500/20'
              : 'bg-[#21262d] border-[#30363d] hover:border-orange-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-orange-400 text-[11px] font-bold">
            <span>ON - HOLD</span>
            <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-xl font-extrabold text-orange-300 mt-1">{metrics.onHold}</div>
          <div className="text-[10px] text-[#8b949e]">Temporarily Paused</div>
        </button>

        {/* CLOSED */}
        <button
          type="button"
          onClick={() => setStatusFilter('CLOSED')}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            statusFilter === 'CLOSED'
              ? 'bg-slate-800 border-slate-500 ring-2 ring-slate-500/20'
              : 'bg-[#21262d] border-[#30363d] hover:border-slate-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>CLOSED</span>
            <X className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-300 mt-1">{metrics.closed}</div>
          <div className="text-[10px] text-[#8b949e]">Fulfilled / Cancelled</div>
        </button>

        {/* DONE */}
        <button
          type="button"
          onClick={() => setStatusFilter('DONE')}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            statusFilter === 'DONE'
              ? 'bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/20'
              : 'bg-[#21262d] border-[#30363d] hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-400 text-[11px] font-bold">
            <span>DONE</span>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-300 mt-1">{metrics.done}</div>
          <div className="text-[10px] text-[#8b949e]">Joined &amp; Active</div>
        </button>
      </div>

      {/* 3. Search & Quick Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by requisition no, position, department, employee..."
              className="w-full bg-[#111827] text-[#e6edf3] placeholder-[#8b949e] pl-9 pr-3 py-1.5 rounded-xl border border-[#30363d] text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#e6edf3]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Division Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-[#8b949e]" />
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="bg-[#111827] text-[#e6edf3] border border-[#30363d] rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Divisions</option>
            {MASTER_DIVISIONS.map((div) => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </select>
          {(statusFilter !== 'ALL' || divisionFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setDivisionFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold px-2 py-1 rounded hover:bg-[#21262d] transition cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Strict 14-Column Master Hiring Tracker Table */}
      <div className="overflow-x-auto rounded-xl border border-[#6D28D9]/70 shadow-2xl bg-[#111827]">
        <table className="w-full text-left text-xs border-collapse">
          {/* Header Styling: Rich Deep Royal Purple (#5B21B6 / #4C1D95), bold white uppercase, clean crisp cell borders (#6D28D9) */}
          <thead>
            <tr className="bg-gradient-to-r from-[#4C1D95] via-[#5B21B6] to-[#4C1D95] text-white font-extrabold uppercase text-[11px] tracking-wider border-b-2 border-[#6D28D9]">
              {/* 1. SL */}
              <th className="py-3 px-3 text-center border-r border-[#6D28D9]/60 w-12 whitespace-nowrap">
                SL
              </th>

              {/* 2. Requisition No */}
              <th className="py-3 px-3.5 border-r border-[#6D28D9]/60 min-w-[140px] whitespace-nowrap">
                Requisition No
              </th>

              {/* 3. Position */}
              <th className="py-3 px-3.5 border-r border-[#6D28D9]/60 min-w-[210px] whitespace-nowrap">
                Position
              </th>

              {/* 4. Division */}
              <th className="py-3 px-3.5 border-r border-[#6D28D9]/60 min-w-[150px] whitespace-nowrap">
                Division
              </th>

              {/* 5. Department */}
              <th className="py-3 px-3.5 border-r border-[#6D28D9]/60 min-w-[150px] whitespace-nowrap">
                Department
              </th>

              {/* 6. Total Resumes */}
              <th className="py-3 px-3 text-center border-r border-[#6D28D9]/60 min-w-[110px] whitespace-nowrap">
                Total Resumes
              </th>

              {/* 7. Conducted */}
              <th className="py-3 px-3 text-center border-r border-[#6D28D9]/60 min-w-[100px] whitespace-nowrap">
                Conducted
              </th>

              {/* 8. Shortlisted */}
              <th className="py-3 px-3 text-center border-r border-[#6D28D9]/60 min-w-[100px] whitespace-nowrap">
                Shortlisted
              </th>

              {/* 9. Replacement Employee */}
              <th className="py-3 px-3.5 border-r border-[#6D28D9]/60 min-w-[180px] whitespace-nowrap">
                Replacement Employee
              </th>

              {/* 10. Finalized Employee */}
              <th className="py-3 px-3.5 border-r border-[#6D28D9]/60 min-w-[160px] whitespace-nowrap">
                Finalized Employee
              </th>

              {/* 11. Finalized Salary */}
              <th className="py-3 px-3.5 border-r border-[#6D28D9]/60 min-w-[140px] whitespace-nowrap">
                Finalized Salary
              </th>

              {/* 12. Joining Date */}
              <th className="py-3 px-3.5 text-center border-r border-[#6D28D9]/60 min-w-[130px] whitespace-nowrap">
                Joining Date
              </th>

              {/* 13. Current Status */}
              <th className="py-3 px-3.5 text-center border-r border-[#6D28D9]/60 min-w-[140px] whitespace-nowrap">
                Current Status
              </th>

              {/* 14. Remarks */}
              <th className="py-3 px-3.5 border-r border-[#6D28D9]/60 min-w-[200px] whitespace-nowrap">
                Remarks
              </th>

              {/* Row Actions */}
              <th className="py-3 px-3 text-center w-16 whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body: High-contrast alternating modern slate tones (#111827 / #1E293B) with hover highlight (#334155/50) */}
          <tbody className="divide-y divide-[#30363d]/60 font-medium">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-14 text-center text-[#8b949e] bg-[#111827]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Briefcase className="w-8 h-8 text-[#8b949e]/50" />
                    <span className="font-semibold text-sm text-[#e6edf3]">No matching track records</span>
                    <button
                      type="button"
                      onClick={handleAddNewRecord}
                      className="mt-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs"
                    >
                      + Create First Track Record
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((r, index) => {
                const isEven = index % 2 === 0;
                const rowBgClass = isEven ? 'bg-[#111827]' : 'bg-[#1E293B]';
                const isActiveRow = activeRowId === r.id;
                const statusStyle = STATUS_CONFIG[r.currentStatus] || STATUS_CONFIG.RUNNING;

                return (
                  <tr
                    key={r.id}
                    onClick={() => setActiveRowId(r.id)}
                    className={`${rowBgClass} hover:bg-[#334155]/60 transition-colors ${
                      isActiveRow ? 'ring-1 ring-purple-500/50' : ''
                    }`}
                  >
                    {/* 1. SL: Auto-generated Serial Number with centered badge */}
                    <td className="py-2.5 px-2.5 text-center align-middle border-r border-[#30363d]/60">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-bold flex items-center justify-center mx-auto text-xs border border-purple-500/30">
                        {r.sl || index + 1}
                      </div>
                    </td>

                    {/* 2. Requisition No: Fully Editable text field with copy/paste/cut support */}
                    <td className="py-2.5 px-3 align-middle border-r border-[#30363d]/60">
                      <input
                        type="text"
                        value={r.requisitionNo}
                        onChange={(e) => updateRecordField(r.id, 'requisitionNo', e.target.value)}
                        onFocus={() => setActiveCell({ rowId: r.id, field: 'requisitionNo' })}
                        onBlur={() => setActiveCell(null)}
                        className={`w-full bg-transparent font-mono font-bold text-xs px-2 py-1 rounded transition outline-none ${
                          activeCell?.rowId === r.id && activeCell?.field === 'requisitionNo'
                            ? 'bg-[#0d1117] border border-purple-500 text-purple-300 ring-2 ring-purple-500/20'
                            : 'text-purple-300 hover:bg-[#21262d]/50'
                        }`}
                        placeholder="REQ-2026-001"
                      />
                    </td>

                    {/* 3. Position: Searchable Combobox with 70 Master Positions + Free Text */}
                    <td className="py-2.5 px-3 align-middle border-r border-[#30363d]/60 relative">
                      <div className="relative group">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={r.position}
                            onChange={(e) => {
                              updateRecordField(r.id, 'position', e.target.value);
                              setPositionSearchTerm(e.target.value);
                            }}
                            onFocus={() => {
                              setPositionDropdownRowId(r.id);
                              setPositionSearchTerm(r.position || '');
                              setActiveCell({ rowId: r.id, field: 'position' });
                            }}
                            className={`w-full bg-transparent font-bold text-xs px-2 py-1 rounded transition outline-none pr-6 ${
                              activeCell?.rowId === r.id && activeCell?.field === 'position'
                                ? 'bg-[#0d1117] border border-purple-500 text-white ring-2 ring-purple-500/20'
                                : 'text-[#e6edf3] hover:bg-[#21262d]/50'
                            }`}
                            placeholder="Select or type position"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPositionDropdownRowId(positionDropdownRowId === r.id ? null : r.id);
                              setPositionSearchTerm('');
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#e6edf3] p-1 cursor-pointer"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Searchable Dropdown Popover */}
                        {positionDropdownRowId === r.id && (
                          <div
                            ref={positionComboboxRef}
                            className="absolute left-0 top-full mt-1 w-64 max-h-56 overflow-y-auto bg-[#1c2128] border border-[#30363d] rounded-xl shadow-2xl p-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                          >
                            <div className="p-1 border-b border-[#30363d]/60 sticky top-0 bg-[#1c2128]">
                              <input
                                type="text"
                                autoFocus
                                value={positionSearchTerm}
                                onChange={(e) => setPositionSearchTerm(e.target.value)}
                                placeholder="Search 70 RMG positions..."
                                className="w-full bg-[#111827] text-white px-2 py-1 rounded border border-[#30363d] text-xs focus:outline-none focus:border-purple-500"
                              />
                            </div>
                            <div className="py-1">
                              {filteredPositionsForCombobox.slice(0, 40).map((pos) => (
                                <button
                                  key={pos}
                                  type="button"
                                  onClick={() => {
                                    updateRecordField(r.id, 'position', pos);
                                    setPositionDropdownRowId(null);
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded hover:bg-[#21262d] font-semibold transition cursor-pointer flex items-center justify-between ${
                                    r.position === pos ? 'text-purple-300 bg-purple-500/10' : 'text-[#c9d1d9]'
                                  }`}
                                >
                                  <span>{pos}</span>
                                  {r.position === pos && <Check className="w-3.5 h-3.5 text-purple-400" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 4. Division: Dropdown menu populated with Master Divisions */}
                    <td className="py-2.5 px-3 align-middle border-r border-[#30363d]/60">
                      <div className="relative group">
                        <select
                          value={r.division}
                          onChange={(e) => updateRecordField(r.id, 'division', e.target.value)}
                          className="w-full appearance-none bg-transparent hover:bg-[#21262d]/50 text-xs font-semibold px-2 py-1 pr-6 rounded border border-transparent hover:border-[#30363d] focus:border-purple-500 focus:bg-[#0d1117] focus:ring-1 focus:ring-purple-500 outline-none text-[#e6edf3] cursor-pointer transition"
                        >
                          {MASTER_DIVISIONS.map((div) => (
                            <option key={div} value={div} className="bg-[#161b22] text-[#e6edf3]">
                              {div}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[#8b949e] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover:opacity-100 transition" />
                      </div>
                    </td>

                    {/* 5. Department: Dropdown menu populated with Master Departments */}
                    <td className="py-2.5 px-3 align-middle border-r border-[#30363d]/60">
                      <div className="relative group">
                        <select
                          value={r.department}
                          onChange={(e) => updateRecordField(r.id, 'department', e.target.value)}
                          className="w-full appearance-none bg-transparent hover:bg-[#21262d]/50 text-xs font-semibold px-2 py-1 pr-6 rounded border border-transparent hover:border-[#30363d] focus:border-purple-500 focus:bg-[#0d1117] focus:ring-1 focus:ring-purple-500 outline-none text-[#e6edf3] cursor-pointer transition"
                        >
                          {MASTER_DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept} className="bg-[#161b22] text-[#e6edf3]">
                              {dept}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[#8b949e] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover:opacity-100 transition" />
                      </div>
                    </td>

                    {/* 6. Total Resumes: Editable numeric/text cell */}
                    <td className="py-2.5 px-2 text-center align-middle border-r border-[#30363d]/60">
                      <input
                        type="text"
                        value={r.totalResumes}
                        onChange={(e) => updateRecordField(r.id, 'totalResumes', e.target.value)}
                        className="w-16 mx-auto text-center bg-transparent hover:bg-[#21262d]/50 focus:bg-[#0d1117] text-blue-300 font-bold text-xs py-1 px-1 rounded border border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                        placeholder="0"
                      />
                    </td>

                    {/* 7. Conducted: Editable numeric/text cell */}
                    <td className="py-2.5 px-2 text-center align-middle border-r border-[#30363d]/60">
                      <input
                        type="text"
                        value={r.conducted}
                        onChange={(e) => updateRecordField(r.id, 'conducted', e.target.value)}
                        className="w-14 mx-auto text-center bg-transparent hover:bg-[#21262d]/50 focus:bg-[#0d1117] text-purple-300 font-bold text-xs py-1 px-1 rounded border border-transparent focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                        placeholder="0"
                      />
                    </td>

                    {/* 8. Shortlisted: Editable numeric/text cell */}
                    <td className="py-2.5 px-2 text-center align-middle border-r border-[#30363d]/60">
                      <input
                        type="text"
                        value={r.shortlisted}
                        onChange={(e) => updateRecordField(r.id, 'shortlisted', e.target.value)}
                        className="w-14 mx-auto text-center bg-transparent hover:bg-[#21262d]/50 focus:bg-[#0d1117] text-emerald-300 font-bold text-xs py-1 px-1 rounded border border-transparent focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                        placeholder="0"
                      />
                    </td>

                    {/* 9. Replacement Employee: Editable free-text cell */}
                    <td className="py-2.5 px-3 align-middle border-r border-[#30363d]/60">
                      <input
                        type="text"
                        value={r.replacementEmployee}
                        onChange={(e) => updateRecordField(r.id, 'replacementEmployee', e.target.value)}
                        placeholder="e.g. New Headcount or Employee Name"
                        className="w-full bg-transparent hover:bg-[#21262d]/50 focus:bg-[#0d1117] text-xs font-medium px-2 py-1 rounded border border-transparent focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-[#e6edf3] transition"
                      />
                    </td>

                    {/* 10. Finalized Employee: Editable free-text cell */}
                    <td className="py-2.5 px-3 align-middle border-r border-[#30363d]/60">
                      <input
                        type="text"
                        value={r.finalizedEmployee}
                        onChange={(e) => updateRecordField(r.id, 'finalizedEmployee', e.target.value)}
                        placeholder="Final candidate name"
                        className="w-full bg-transparent hover:bg-[#21262d]/50 focus:bg-[#0d1117] text-xs font-semibold px-2 py-1 rounded border border-transparent focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-emerald-300 transition"
                      />
                    </td>

                    {/* 11. Finalized Salary: Editable numeric/currency cell */}
                    <td className="py-2.5 px-3 align-middle border-r border-[#30363d]/60">
                      <input
                        type="text"
                        value={r.finalizedSalary}
                        onChange={(e) => updateRecordField(r.id, 'finalizedSalary', e.target.value)}
                        placeholder="e.g. BDT 50,000"
                        className="w-full bg-transparent hover:bg-[#21262d]/50 focus:bg-[#0d1117] text-xs font-bold px-2 py-1 rounded border border-transparent focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-emerald-400 transition"
                      />
                    </td>

                    {/* 12. Joining Date: Interactive Date input with formatted representation */}
                    <td className="py-2.5 px-2.5 text-center align-middle border-r border-[#30363d]/60">
                      <div className="relative inline-flex items-center justify-center group">
                        <input
                          type="date"
                          value={r.joiningDate || ''}
                          onChange={(e) => updateRecordField(r.id, 'joiningDate', e.target.value)}
                          className="bg-transparent hover:bg-[#21262d]/60 focus:bg-[#0d1117] text-xs font-mono font-semibold px-2 py-1 rounded border border-transparent hover:border-[#30363d] focus:border-purple-500 outline-none text-sky-300 cursor-pointer transition"
                        />
                      </div>
                    </td>

                    {/* 13. Current Status: Fixed Dropdown with color-coded status badges */}
                    <td className="py-2.5 px-3 text-center align-middle border-r border-[#30363d]/60">
                      <div className="relative inline-flex items-center justify-center">
                        <select
                          value={r.currentStatus}
                          onChange={(e) =>
                            updateRecordField(
                              r.id,
                              'currentStatus',
                              e.target.value as HiringTrackerStatus
                            )
                          }
                          className={`appearance-none text-xs font-black uppercase tracking-wider px-3 py-1 pr-6 rounded-full border transition cursor-pointer outline-none shadow-xs ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <option value="RUNNING" className="bg-[#161b22] text-amber-300 font-bold">
                            RUNNING
                          </option>
                          <option value="WAITING" className="bg-[#161b22] text-sky-300 font-bold">
                            WAITING
                          </option>
                          <option value="ON - HOLD" className="bg-[#161b22] text-orange-300 font-bold">
                            ON - HOLD
                          </option>
                          <option value="CLOSED" className="bg-[#161b22] text-slate-300 font-bold">
                            CLOSED
                          </option>
                          <option value="DONE" className="bg-[#161b22] text-emerald-300 font-bold">
                            DONE
                          </option>
                        </select>
                        <ChevronDown className={`w-3.5 h-3.5 absolute right-2 pointer-events-none ${statusStyle.text}`} />
                      </div>
                    </td>

                    {/* 14. Remarks: Editable multiline / expandable note cell */}
                    <td className="py-2.5 px-3 align-middle border-r border-[#30363d]/60">
                      <div className="flex items-center gap-1.5 group">
                        <input
                          type="text"
                          value={r.remarks}
                          onChange={(e) => updateRecordField(r.id, 'remarks', e.target.value)}
                          placeholder="Add comments / tasks..."
                          className="w-full bg-transparent hover:bg-[#21262d]/50 focus:bg-[#0d1117] text-xs px-2 py-1 rounded border border-transparent focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-[#c9d1d9] truncate transition"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedRemarksRecord(r);
                            setRemarksDraft(r.remarks || '');
                          }}
                          className="text-[#8b949e] hover:text-[#e6edf3] p-1 rounded opacity-0 group-hover:opacity-100 transition shrink-0"
                          title="Expand remarks editor"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Actions Column: Row save status & delete button */}
                    <td className="py-2.5 px-2 text-center align-middle whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {r.isModified ? (
                          <span
                            className="w-2 h-2 rounded-full bg-amber-400"
                            title="Modified (Auto-saved locally)"
                          />
                        ) : (
                          <span
                            className="w-2 h-2 rounded-full bg-emerald-400/70"
                            title="Saved"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(r.id, r.requisitionNo)}
                          className="p-1 rounded text-[#8b949e] hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                          title="Delete track record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Remarks Expand Modal */}
      {expandedRemarksRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl p-5 space-y-4 text-[#e6edf3]">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-[#e6edf3]">
                  Remarks &amp; Audit Notes ({expandedRemarksRecord.requisitionNo})
                </h3>
                <p className="text-[11px] text-[#8b949e]">
                  Position: <strong className="text-purple-300">{expandedRemarksRecord.position}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpandedRemarksRecord(null)}
                className="text-[#8b949e] hover:text-[#e6edf3] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={5}
              value={remarksDraft}
              onChange={(e) => setRemarksDraft(e.target.value)}
              placeholder="Enter comprehensive recruiter notes, interview scheduling feedback, negotiation remarks, or verification tasks..."
              className="w-full bg-[#111827] text-xs text-[#e6edf3] p-3 rounded-xl border border-[#30363d] focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
              <button
                type="button"
                onClick={() => setExpandedRemarksRecord(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateRecordField(expandedRemarksRecord.id, 'remarks', remarksDraft);
                  setExpandedRemarksRecord(null);
                  showNotification('Remarks updated');
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

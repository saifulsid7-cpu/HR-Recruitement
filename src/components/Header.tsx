/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  Archive,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Cloud,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Flame,
  FolderArchive,
  Layers,
  RefreshCw,
  RotateCcw,
  Scale,
  Settings,
  Share2,
  Sliders,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { HiringCategory } from '../types';

interface HeaderProps {
  candidateCount: number;
  shortlistedCount: number;
  onHoldCount?: number;
  rejectedCount: number;
  onReset: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onOpenSalaryMatrix: () => void;
  companyName: string;
  onOpenCompanyModal: () => void;
  onOpenCategoryManager: () => void;
  onOpenStandardCriteria: () => void;
  onOpenIndustryPolicy: () => void;
  // Hiring Category & Section Navigation
  activeSection: 'active' | 'history';
  onChangeSection: (section: 'active' | 'history') => void;
  hiringCategoryFilter: 'all' | HiringCategory;
  onChangeHiringCategoryFilter: (cat: 'all' | HiringCategory) => void;
  historicalCount: number;
  topPriorityCount: number;
  // Universal Cloud Persistence & JSON Sync
  cloudSyncStatus?: 'synced' | 'syncing' | 'error' | 'idle';
  lastSyncedTime?: string;
  onOpenSyncModal?: () => void;
  onSyncCloudNow?: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
  candidateCount,
  shortlistedCount,
  onHoldCount = 0,
  rejectedCount,
  onReset,
  onExportExcel,
  onExportCSV,
  onOpenSalaryMatrix,
  companyName,
  onOpenCompanyModal,
  onOpenCategoryManager,
  onOpenStandardCriteria,
  onOpenIndustryPolicy,
  activeSection,
  onChangeSection,
  hiringCategoryFilter,
  onChangeHiringCategoryFilter,
  historicalCount,
  topPriorityCount,
  cloudSyncStatus = 'synced',
  lastSyncedTime,
  onOpenSyncModal,
  onSyncCloudNow,
}) => {
  // 1. Collapsible slide-over drawer state (Closed by default)
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleQuickSync = async () => {
    if (onSyncCloudNow) {
      setIsSyncingLocal(true);
      try {
        await onSyncCloudNow();
      } finally {
        setIsSyncingLocal(false);
      }
    } else if (onOpenSyncModal) {
      onOpenSyncModal();
    }
  };

  return (
    <>
      {/* Sleek, minimal top header bar without duplicate titles or button clusters */}
      <header className="border-b border-[#30363d] bg-[#161b22] sticky top-0 z-30 shadow-md text-[#e6edf3]">
        <div className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Brand Icon: Clean and minimal without redundant company name button */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onOpenCompanyModal}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/40 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              title="Organization Settings"
            >
              <Briefcase className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Right Corner: Single elegant System Actions Dropdown / Popover */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsActionsDropdownOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer border ${
                isActionsDropdownOpen
                  ? 'bg-[#30363d] text-white border-indigo-500/50 ring-2 ring-indigo-500/20'
                  : 'bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] hover:text-white border-[#30363d]'
              }`}
              title="System Actions: HR Tools, Database Sync & JSON Backup"
              aria-expanded={isActionsDropdownOpen}
            >
              <Settings className={`w-4 h-4 text-indigo-400 transition-transform duration-200 ${isActionsDropdownOpen ? 'rotate-90 text-indigo-300' : ''}`} />
              <span className="hidden sm:inline">System Actions</span>
              {/* Cloud Sync State Status Dot */}
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  cloudSyncStatus === 'syncing' || isSyncingLocal
                    ? 'bg-cyan-400 animate-pulse'
                    : cloudSyncStatus === 'synced'
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
                }`}
                title={`Cloud Database: ${cloudSyncStatus}`}
              />
              <ChevronDown className={`w-3.5 h-3.5 text-[#8b949e] transition-transform duration-200 ${isActionsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Backdrop overlay for closing dropdown on outside click */}
            {isActionsDropdownOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsActionsDropdownOpen(false)}
              />
            )}

            {/* Sleek, compact dropdown / popover menu */}
            {isActionsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#1c2128] border border-[#30363d] rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-[#30363d]/60 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">
                    System Actions &amp; Tools
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#21262d] border border-[#30363d] text-[#8b949e]">
                    {companyName}
                  </span>
                </div>

                <div className="space-y-1">
                  {/* 1. HR Workspace Tools */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsActionsDropdownOpen(false);
                      setIsToolsDrawerOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#21262d] text-[#e6edf3] hover:text-white transition cursor-pointer text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FolderArchive className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-[#e6edf3] group-hover:text-indigo-300 transition">
                        🛠️ HR Workspace Tools
                      </div>
                      <div className="text-[10px] text-[#8b949e] truncate">
                        Evaluation criteria, policies &amp; settings
                      </div>
                    </div>
                  </button>

                  {/* 2. Export / Import JSON */}
                  {onOpenSyncModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsDropdownOpen(false);
                        onOpenSyncModal();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#21262d] text-[#e6edf3] hover:text-white transition cursor-pointer text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Database className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-[#e6edf3] group-hover:text-cyan-300 transition">
                          📁 Export / Import JSON
                        </div>
                        <div className="text-[10px] text-[#8b949e] truncate">
                          Backup workspace or restore dataset
                        </div>
                      </div>
                    </button>
                  )}

                  {/* 3. Sync Cloud Database */}
                  <button
                    type="button"
                    onClick={async () => {
                      setIsActionsDropdownOpen(false);
                      await handleQuickSync();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#21262d] text-[#e6edf3] hover:text-white transition cursor-pointer text-left group"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                        cloudSyncStatus === 'syncing' || isSyncingLocal
                          ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                          : cloudSyncStatus === 'synced'
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                      }`}
                    >
                      <Cloud
                        className={`w-4 h-4 ${
                          cloudSyncStatus === 'syncing' || isSyncingLocal ? 'animate-pulse' : ''
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-[#e6edf3] flex items-center justify-between">
                        <span className="group-hover:text-emerald-300 transition">
                          ☁️ Sync Cloud Database
                        </span>
                        {cloudSyncStatus === 'synced' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-[#8b949e] truncate">
                        {cloudSyncStatus === 'syncing' || isSyncingLocal
                          ? 'Syncing with cloud...'
                          : lastSyncedTime
                          ? `Synced at ${lastSyncedTime}`
                          : 'Synchronize requisitions & CV Bank'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-Over Drawer / Collapsible Modal for Clutter-Free Header Tools */}
      {isToolsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsToolsDrawerOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative z-50 w-full max-w-md bg-[#161b22] border-l border-[#30363d] h-full shadow-2xl flex flex-col text-[#e6edf3] animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-[#30363d] bg-[#21262d] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#e6edf3]">
                    HR Workspace Tools &amp; Settings
                  </h2>
                  <p className="text-[11px] text-[#8b949e]">
                    Configuration, evaluation policies &amp; export tools
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsToolsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d] transition cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Advisory Notice inside drawer */}
            <div className="bg-amber-950/30 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Advisory AI evaluation for HR recruitment only. All hiring decisions are strictly human-governed.
              </p>
            </div>

            {/* Drawer Body - Organized Tool Cards */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* SECTION 1: Recruitment Workspace & Scope */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8b949e] block">
                  1. Recruitment Workspace &amp; Requisitions
                </span>

                <div className="bg-[#21262d] p-3 rounded-xl border border-[#30363d] space-y-3">
                  <span className="text-[11px] font-semibold text-[#8b949e] block">
                    Workspace View:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onChangeSection('active')}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        activeSection === 'active'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                          : 'bg-[#161b22] text-[#8b949e] border-[#30363d] hover:text-[#e6edf3]'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Active Jobs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onChangeSection('history')}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        activeSection === 'history'
                          ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                          : 'bg-[#161b22] text-[#8b949e] border-[#30363d] hover:text-[#e6edf3]'
                      }`}
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Previous Data ({historicalCount})</span>
                    </button>
                  </div>

                  {activeSection === 'active' && (
                    <div className="pt-2 border-t border-[#30363d] space-y-2">
                      <span className="text-[11px] font-semibold text-[#8b949e] block">
                        Hiring Priority Filter:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onChangeHiringCategoryFilter('all')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                            hiringCategoryFilter === 'all'
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-[#161b22] text-[#8b949e] border-[#30363d]'
                          }`}
                        >
                          All Positions
                        </button>
                        <button
                          type="button"
                          onClick={() => onChangeHiringCategoryFilter('current')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                            hiringCategoryFilter === 'current'
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-[#161b22] text-blue-300 border-blue-500/30'
                          }`}
                        >
                          Current Hiring
                        </button>
                        <button
                          type="button"
                          onClick={() => onChangeHiringCategoryFilter('top_priority')}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                            hiringCategoryFilter === 'top_priority'
                              ? 'bg-rose-600 text-white border-rose-500'
                              : 'bg-[#161b22] text-rose-300 border-rose-500/30'
                          }`}
                        >
                          <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
                          <span>Top Priority ({topPriorityCount})</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: Policy & Evaluation Configuration */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8b949e] block">
                  2. Policy Guides &amp; Scoring Matrix
                </span>

                <div className="space-y-2">
                  {/* Criteria Weights */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsDrawerOpen(false);
                      onOpenStandardCriteria();
                    }}
                    className="w-full p-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] flex items-center justify-between text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#e6edf3] group-hover:text-indigo-300 transition">
                          Criteria Weights &amp; Benchmarks
                        </div>
                        <p className="text-[11px] text-[#8b949e]">
                          Configure 6-criteria scoring weights (100 Marks total)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8b949e] group-hover:text-indigo-400 transition" />
                  </button>

                  {/* RMG Policy Guide */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsDrawerOpen(false);
                      onOpenIndustryPolicy();
                    }}
                    className="w-full p-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] flex items-center justify-between text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#e6edf3] group-hover:text-purple-300 transition">
                          RMG Industry Policy Guide
                        </div>
                        <p className="text-[11px] text-[#8b949e]">
                          Garment sector standards (Youngone, Ha-Meem, Square)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8b949e] group-hover:text-purple-400 transition" />
                  </button>

                  {/* Salary Matrix */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsDrawerOpen(false);
                      onOpenSalaryMatrix();
                    }}
                    className="w-full p-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] flex items-center justify-between text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#e6edf3] group-hover:text-blue-300 transition">
                          Salary &amp; Grade Remuneration Matrix
                        </div>
                        <p className="text-[11px] text-[#8b949e]">
                          {companyName} staff fixation policies (ME-10, ME-11, etc.)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8b949e] group-hover:text-blue-400 transition" />
                  </button>

                  {/* Role Categories */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsDrawerOpen(false);
                      onOpenCategoryManager();
                    }}
                    className="w-full p-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] flex items-center justify-between text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#e6edf3] group-hover:text-emerald-300 transition">
                          Target Roles &amp; Departments
                        </div>
                        <p className="text-[11px] text-[#8b949e]">
                          Manage categories for Fashion, Merchandising, QA, and HR
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8b949e] group-hover:text-emerald-400 transition" />
                  </button>
                </div>
              </div>

              {/* SECTION 3: Data Actions & Export */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8b949e] block">
                  3. Candidate Operations &amp; Exports
                </span>

                <div className="space-y-2">
                  {/* Reset/Purge Candidates Pool */}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to purge all screened candidates from the workspace?')) {
                        onReset();
                        setIsToolsDrawerOpen(false);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 flex items-center gap-2.5 text-left transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div className="font-bold text-rose-300 text-xs">
                        Purge Screened Candidates Pool
                      </div>
                      <p className="text-[10px] text-[#8b949e]">
                        Wipe current session candidates and reset pool to 0
                      </p>
                    </div>
                  </button>

                  {/* Export Excel & CSV */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onExportExcel();
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>Export Excel (.xlsx)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onExportCSV();
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#8b949e]" />
                      <span>Export CSV</span>
                    </button>
                  </div>

                  {/* Share Link */}
                  <button
                    type="button"
                    onClick={handleShare}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition cursor-pointer ${
                      copied
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border-[#30363d]'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Link Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-indigo-400" />
                        <span>Share Recruitment Workspace</span>
                      </>
                    )}
                  </button>

                  {/* Reset Candidate Pool */}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Reset evaluated candidates and restore sample pool?')) {
                        onReset();
                        setIsToolsDrawerOpen(false);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 border border-rose-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Candidate Evaluations</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#30363d] bg-[#21262d] flex items-center justify-between">
              <span className="text-[11px] text-[#8b949e]">
                {candidateCount} Candidates in Pool
              </span>
              <button
                type="button"
                onClick={() => setIsToolsDrawerOpen(false)}
                className="px-4 py-1.5 text-xs font-bold bg-[#161b22] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] rounded-lg transition cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

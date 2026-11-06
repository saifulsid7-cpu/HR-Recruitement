/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Archive,
  BarChart3,
  Briefcase,
  Building2,
  CalendarCheck,
  ChevronDown,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Flame,
  FolderArchive,
  GraduationCap,
  HelpCircle,
  Layers,
  LayoutDashboard,
  LogOut,
  ScanLine,
  Sliders,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { KpiSegmentId, NavigationMenuTab } from '../types';

export const KPI_SIDEBAR_ITEMS: Array<{
  id: KpiSegmentId;
  label: string;
  dotColor: string;
}> = [
  { id: 'kpi-hiring-yield', label: 'Staff Hiring Yield Ratio (Target: 1:10)', dotColor: 'bg-cyan-400' },
  { id: 'kpi-resume-bank', label: 'Resume Bank Data Insertion Rate (VJCE/OJCE)', dotColor: 'bg-emerald-400' },
  { id: 'kpi-salary-similarity', label: 'Salary Similarity Ratio (Outgoing vs Incoming)', dotColor: 'bg-purple-400' },
  { id: 'kpi-linkedin-growth', label: 'LinkedIn Reach & Employer Branding', dotColor: 'bg-sky-400' },
  { id: 'kpi-job-circulars', label: 'Job Circulars & Sourcing Velocity', dotColor: 'bg-amber-400' },
  { id: 'kpi-bg-check', label: 'Background Check & Verification', dotColor: 'bg-teal-400' },
  { id: 'kpi-engagement-surveys', label: 'People Engagement Surveys (HO)', dotColor: 'bg-rose-400' },
  { id: 'kpi-youth-meetup', label: 'Refresher & Youth Meetup Programs', dotColor: 'bg-indigo-400' },
];

interface SidebarProps {
  currentTab: NavigationMenuTab;
  onSelectTab: (tab: NavigationMenuTab) => void;
  focusedKpiId?: KpiSegmentId | null;
  onSelectKpiSegment?: (kpiId: KpiSegmentId | null) => void;
  openJobsCount: number;
  totalCandidatesCount: number;
  interviewCount?: number;
  fitCandidatesCount?: number;
  companyName: string;
  onOpenCompanyModal: () => void;
  onOpenStandardCriteria: () => void;
  onOpenIndustryPolicy: () => void;
  onOpenSalaryMatrix: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  focusedKpiId = null,
  onSelectKpiSegment,
  openJobsCount,
  totalCandidatesCount,
  interviewCount = 0,
  fitCandidatesCount = 0,
  companyName,
  onOpenCompanyModal,
  onOpenStandardCriteria,
  onOpenIndustryPolicy,
  onOpenSalaryMatrix,
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutNotice, setLogoutNotice] = useState(false);
  const [isKpiMenuOpen, setIsKpiMenuOpen] = useState(false);

  // Strict Sequential Pipeline Flow Order:
  // 1. Dashboard -> 2. Jobs -> 3. Screening -> 4. Interviews -> 5. Candidates -> 6. CV Bank -> 7. Reports
  const menuItems: Array<{
    id: NavigationMenuTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: Briefcase,
      badge: openJobsCount > 0 ? openJobsCount : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'screening',
      label: 'Screening',
      icon: Sparkles,
      badge: 'AI Engine',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30 font-semibold',
    },
    {
      id: 'interviews',
      label: 'Interviews',
      icon: CalendarCheck,
      badge: interviewCount > 0 ? interviewCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'candidates',
      label: 'Candidates',
      icon: Users,
      badge: fitCandidatesCount > 0 ? `${fitCandidatesCount} Fit` : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'cv_bank',
      label: 'CV Bank',
      icon: FolderArchive,
      badge: totalCandidatesCount > 0 ? totalCandidatesCount : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
    },
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setLogoutNotice(true);
    setTimeout(() => setLogoutNotice(false), 3000);
  };

  return (
    <>
      <aside className="w-64 bg-[#161b22] border-r border-[#30363d] flex flex-col shrink-0 min-h-screen text-[#e6edf3] select-none">
        {/* Brand / Logo Area */}
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/40 shrink-0">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-extrabold text-[#e6edf3] tracking-tight leading-tight">
                Enterprise RMS
              </h2>
              <p className="text-[11px] font-medium text-[#8b949e] truncate">
                RMG Recruitment System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">
            Main Navigation
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer group relative ${
                  isActive
                    ? 'bg-[#21262d] text-white font-bold border border-indigo-500/40 shadow-sm'
                    : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-500 rounded-r-md" />
                  )}
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-[#8b949e] group-hover:text-[#e6edf3]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.badgeColor || 'bg-[#0d1117] text-[#8b949e] border-[#30363d]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Dedicated KPI Metrics - Talent Acquisition Section (Directly Below Reports, Collapsible) */}
          <div className="pt-4 mt-2 border-t border-[#30363d]/70 space-y-1">
            <button
              type="button"
              onClick={() => setIsKpiMenuOpen((prev) => !prev)}
              className="w-full px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/90 hover:text-amber-300 flex items-center justify-between cursor-pointer transition gap-1.5"
              aria-expanded={isKpiMenuOpen}
            >
              <span className="truncate">KPI Metrics - Talent Acquisition</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30">
                  2026
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-amber-400 transition-transform duration-200 ${
                    isKpiMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Parent Button: Overview / All Metrics (Full Report) */}
            <button
              type="button"
              onClick={() => {
                setIsKpiMenuOpen((prev) => !prev);
                if (onSelectKpiSegment) {
                  onSelectKpiSegment(null);
                } else {
                  onSelectTab('monthly_kpi_metrics');
                }
              }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer relative ${
                currentTab === 'monthly_kpi_metrics' && !focusedKpiId
                  ? 'bg-[#21262d] text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-[#e6edf3] hover:text-amber-300 hover:bg-[#21262d]/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {currentTab === 'monthly_kpi_metrics' && !focusedKpiId && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r-md" />
                )}
                <BarChart3 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Overview / All Metrics (Full Report)</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#8b949e] shrink-0 transition-transform duration-200 ${
                  isKpiMenuOpen ? 'rotate-180 text-amber-400' : ''
                }`}
              />
            </button>

            {/* 8 Specific KPI Submenu Items (Collapsible) */}
            {isKpiMenuOpen && (
              <div className="pl-2 space-y-0.5 pt-0.5">
                {KPI_SIDEBAR_ITEMS.map((kpi) => {
                  const isKpiActive =
                    currentTab === 'monthly_kpi_metrics' && focusedKpiId === kpi.id;
                  return (
                    <button
                      key={kpi.id}
                      type="button"
                      onClick={() => {
                        if (onSelectKpiSegment) {
                          onSelectKpiSegment(kpi.id);
                        } else {
                          onSelectTab('monthly_kpi_metrics');
                        }
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer text-left ${
                        isKpiActive
                          ? 'bg-[#21262d] text-white font-bold border border-indigo-500/40 shadow-xs'
                          : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]/50'
                      }`}
                      title={kpi.label}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${kpi.dotColor}`} />
                      <span className="truncate">{kpi.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Tools & Policy Section */}
          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">
            HR Resources
          </div>

          <button
            type="button"
            onClick={onOpenStandardCriteria}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]/50 transition cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate">Criteria Weights (100M)</span>
          </button>

          <button
            type="button"
            onClick={onOpenIndustryPolicy}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]/50 transition cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="truncate">RMG Policy Guide</span>
          </button>

          <button
            type="button"
            onClick={onOpenSalaryMatrix}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]/50 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">Salary Matrix (ME-10~13)</span>
          </button>
        </div>

        {/* Sidebar Footer: User Branding & Logout */}
        <div className="p-3 border-t border-[#30363d] bg-[#161b22] space-y-2.5 shrink-0">
          {/* User Branding Badge */}
          <div className="bg-[#21262d] rounded-xl p-2.5 border border-[#30363d] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              HR
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-[#8b949e] font-medium leading-tight">
                Prepared by:
              </p>
              <p className="text-xs font-bold text-[#e6edf3] leading-tight">
                HO HR Team
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/30 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>

          {logoutNotice && (
            <div className="text-[11px] text-emerald-400 text-center font-medium bg-emerald-950/40 border border-emerald-500/30 py-1 rounded">
              Session is secured
            </div>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#21262d] rounded-2xl max-w-sm w-full p-5 border border-[#30363d] text-[#e6edf3] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#e6edf3]">Confirm Logout</h4>
                <p className="text-xs text-[#8b949e]">Exit the HR Recruitment Dashboard?</p>
              </div>
            </div>
            <p className="text-xs text-[#8b949e]">
              Your candidate evaluations, job requisitions, and scoring data are safely saved in local storage.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#161b22] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

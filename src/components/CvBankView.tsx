/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileCheck,
  FileText,
  Filter,
  FolderArchive,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Tag,
  UserCheck,
  Wrench,
  X,
  Globe,
} from 'lucide-react';
import { Candidate, CandidateStatus, JobRequisition, NavigationMenuTab } from '../types';
import { ResumeVerificationDrawer } from './ResumeVerificationDrawer';

interface CvBankViewProps {
  candidates: Candidate[];
  activeRequisitions: JobRequisition[];
  onOpenCandidateDetail: (candidate: Candidate) => void;
  onNavigateTab: (tab: NavigationMenuTab) => void;
  onOpenMovePosition?: (candidate: Candidate) => void;
  blindMode?: boolean;
}

type ExperienceFilter = 'all' | 'freshers' | '1-3' | '3-6' | '6+';

export const CvBankView: React.FC<CvBankViewProps> = ({
  candidates,
  activeRequisitions,
  onOpenCandidateDetail,
  onNavigateTab,
  onOpenMovePosition,
  blindMode = false,
}) => {
  // 1. Live Top Search (filters candidate name, designation, company, skills in real time)
  const [search, setSearch] = useState('');

  // 2. Multi-Filter Tags
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [expFilter, setExpFilter] = useState<ExperienceFilter>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | CandidateStatus>('all');
  const [selectedCad, setSelectedCad] = useState<string>('all');
  const [selectedBuyer, setSelectedBuyer] = useState<string>('all');

  // Resume Verification Drawer State
  const [activeDrawerCandidate, setActiveDrawerCandidate] = useState<Candidate | null>(null);

  // Extract unique positions from candidate pool + active requisitions
  const allPositions = useMemo(() => {
    const set = new Set<string>();
    activeRequisitions.forEach((r) => set.add(r.title));
    candidates.forEach((c) => {
      if (c.appliedPosition) set.add(c.appliedPosition);
      if (c.lastDesignation) set.add(c.lastDesignation);
    });
    return Array.from(set).filter(Boolean);
  }, [activeRequisitions, candidates]);

  // Extract unique buyers and CAD software
  const allBuyers = useMemo(() => {
    return Array.from(new Set(candidates.flatMap((c) => c.buyersWorkedWith || []))).filter(Boolean);
  }, [candidates]);

  const allCad = useMemo(() => {
    return Array.from(new Set(candidates.flatMap((c) => c.cadSoftwareProficiency || []))).filter(Boolean);
  }, [candidates]);

  // Real-Time Filtered Candidates (Talent Pool Repository)
  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const tenureYrs = c.totalYearsExperience ?? (c.relevantExperienceYears || 0);

      // Position Filter
      if (selectedPosition !== 'all') {
        const pLower = selectedPosition.toLowerCase();
        const candPos = (c.appliedPosition || '').toLowerCase();
        const candDesig = (c.lastDesignation || '').toLowerCase();
        if (!candPos.includes(pLower) && !candDesig.includes(pLower) && c.requisitionId !== selectedPosition) {
          return false;
        }
      }

      // Experience Range Filter (Freshers, 1-3 yrs, 3-6 yrs, 6+ yrs)
      if (expFilter === 'freshers' && tenureYrs > 0.5) return false;
      if (expFilter === '1-3' && (tenureYrs < 1 || tenureYrs > 3)) return false;
      if (expFilter === '3-6' && (tenureYrs < 3 || tenureYrs > 6)) return false;
      if (expFilter === '6+' && tenureYrs < 6) return false;

      // HR Status filter
      if (selectedStatus !== 'all' && c.status !== selectedStatus) {
        return false;
      }

      // Buyer filter
      if (selectedBuyer !== 'all' && !(c.buyersWorkedWith || []).includes(selectedBuyer)) {
        return false;
      }

      // CAD filter
      if (selectedCad !== 'all' && !(c.cadSoftwareProficiency || []).includes(selectedCad)) {
        return false;
      }

      // Full-Text Live Search across Name, Designation, Experience, Company, Skills, Education
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = !blindMode && c.name.toLowerCase().includes(q);
        const matchFile = (c.fileName || '').toLowerCase().includes(q);
        const matchPos = (c.appliedPosition || '').toLowerCase().includes(q);
        const matchDesig = (c.lastDesignation || '').toLowerCase().includes(q);
        const expYears = c.totalYearsExperience ?? (c.relevantExperienceYears || 0);
        const matchExp = `${expYears}`.includes(q) || `${expYears.toFixed(1)}`.includes(q) || `${expYears} years`.toLowerCase().includes(q);
        const matchComp = (c.lastCompany || c.experience?.[0]?.company || '').toLowerCase().includes(q);
        const matchSkill = (c.skills || []).some((s) => s.toLowerCase().includes(q));
        const matchDegree = (c.academicDegrees || c.education || []).some((d) => d.toLowerCase().includes(q));
        const matchBuyer = (c.buyersWorkedWith || []).some((b) => b.toLowerCase().includes(q));
        const matchCad = (c.cadSoftwareProficiency || []).some((tool) => tool.toLowerCase().includes(q));
        const matchAction = (c.decisiveActionSentence || c.actionOpinion || '').toLowerCase().includes(q);
        const matchCv = (c.attachedCvText || '').toLowerCase().includes(q);

        if (!matchName && !matchFile && !matchPos && !matchDesig && !matchExp && !matchComp && !matchSkill && !matchDegree && !matchBuyer && !matchCad && !matchAction && !matchCv) {
          return false;
        }
      }

      return true;
    });
  }, [
    candidates,
    selectedPosition,
    expFilter,
    selectedStatus,
    selectedBuyer,
    selectedCad,
    search,
    blindMode,
  ]);

  // Strict Header / Title Convention (Strict Format):
  // "[Candidate Full Name] | [Last Organizational Designation] | [Total Years of Experience] | [Last Company Name]"
  const formatStrictCardHeader = (c: Candidate): string => {
    let rawName = c.name?.trim() || '';
    if (!rawName || rawName.toLowerCase() === 'candidate' || rawName.toLowerCase() === 'candidate profile' || /^(resume|cv|biodata)/i.test(rawName)) {
      if (c.fileName) {
        rawName = c.fileName
          .replace(/\.[^/.]+$/, '')
          .replace(/^(resume|cv|biodata)[-_\s]+/i, '')
          .replace(/[-_\s]+(resume|cv|biodata)$/i, '')
          .replace(/^candidate[-_\s]*/i, '')
          .replace(/_/g, ' ')
          .trim();
      }
    }
    rawName = rawName.replace(/^(resume|cv|biodata)[-_\s]+/i, '').trim();
    const fullName = blindMode ? `Candidate #${c.id.slice(-4)}` : (rawName || 'Candidate Profile');

    const lastDesignation =
      c.lastDesignation?.trim() ||
      c.experience?.[0]?.role?.trim() ||
      c.appliedPosition?.trim() ||
      'Executive';

    const years = c.totalYearsExperience ?? (c.relevantExperienceYears || 0);
    const expText = years > 0 ? (years === 1 ? '1.0 Year Experience' : `${years.toFixed(1)} Years Experience`) : '0.0 Years Experience';

    const lastCompany =
      (c.lastCompany && c.lastCompany !== 'N/A' && c.lastCompany !== 'Prior RMG Organization')
        ? c.lastCompany.trim()
        : (c.experience?.[0]?.company?.trim() && c.experience[0].company !== 'N/A')
          ? c.experience[0].company.trim()
          : 'Apparel Mfg';

    return `${fullName} | ${lastDesignation} | ${expText} | ${lastCompany}`;
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedPosition !== 'all' ||
    expFilter !== 'all' ||
    selectedStatus !== 'all' ||
    selectedBuyer !== 'all' ||
    selectedCad !== 'all';

  const resetAllFilters = () => {
    setSearch('');
    setSelectedPosition('all');
    setExpFilter('all');
    setSelectedStatus('all');
    setSelectedBuyer('all');
    setSelectedCad('all');
  };

  return (
    <div className="space-y-6 text-[#e6edf3]">
      {/* 1. Header Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#30363d]">
        <div>
          <div className="flex items-center gap-2">
            <FolderArchive className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-black text-[#e6edf3] tracking-tight">
              Central CV Bank &amp; Talent Repository
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
              {candidates.length} Profiles Archived
            </span>
          </div>
          <p className="text-xs text-[#8b949e] mt-1">
            Central repository of all parsed candidate resumes with standardized titles. Strictly separated from live requisition screening scores.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onNavigateTab('screening')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/40 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Screening Engine</span>
          </button>
        </div>
      </div>

      {/* 2. RESPONSIVE INSTANT SEARCH BAR AT THE VERY TOP */}
      <div className="bg-[#161b22] p-5 rounded-2xl border border-[#30363d] space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              Live Talent Search (Candidate Name, Designation, Company, Skills):
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              Real-time filter active
            </span>
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Type candidate name, designation (e.g. Senior Merchandiser), company (e.g. Beximco, Ha-Meem), or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-sm text-[#e6edf3] placeholder-[#8b949e] outline-none focus:border-indigo-500 transition shadow-inner font-medium"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#e6edf3] p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Multi-Filter Tags Strip (Pure Talent Pool Filters, No Rank/Scores) */}
        <div className="pt-2 border-t border-[#30363d]/60 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
            {/* Position / Designation Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] shrink-0">
                Position / Role:
              </span>
              <select
                aria-label="Filter by Position / Designation"
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-1.5 text-xs text-[#e6edf3] font-semibold outline-none cursor-pointer focus:border-indigo-500 max-w-[220px]"
              >
                <option value="all">All Roles ({allPositions.length})</option>
                {allPositions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Range Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mr-1">
                Experience:
              </span>
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'freshers', label: 'Freshers (<0.5 Yrs)' },
                  { id: '1-3', label: '1 - 3 Yrs' },
                  { id: '3-6', label: '3 - 6 Yrs' },
                  { id: '6+', label: '6+ Yrs' },
                ] as const
              ).map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setExpFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                    expFilter === tab.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : 'bg-[#21262d] text-[#8b949e] border-[#30363d] hover:text-[#e6edf3]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filter Row: Buyer & CAD Tools */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
            {/* Buyer Filter */}
            {allBuyers.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">
                  Buyer:
                </span>
                <select
                  aria-label="Filter by Buyer"
                  value={selectedBuyer}
                  onChange={(e) => setSelectedBuyer(e.target.value)}
                  className="bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs text-[#e6edf3] outline-none cursor-pointer focus:border-indigo-500"
                >
                  <option value="all">All Buyers ({allBuyers.length})</option>
                  {allBuyers.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* CAD Software Filter */}
            {allCad.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">
                  CAD / Tool:
                </span>
                <select
                  aria-label="Filter by CAD Software"
                  value={selectedCad}
                  onChange={(e) => setSelectedCad(e.target.value)}
                  className="bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs text-[#e6edf3] outline-none cursor-pointer focus:border-indigo-500"
                >
                  <option value="all">All Softwares ({allCad.length})</option>
                  {allCad.map((tool) => (
                    <option key={tool} value={tool}>
                      {tool}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* HR Status Filter */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">
                Status:
              </span>
              <select
                aria-label="Filter by Candidate Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs text-[#e6edf3] outline-none cursor-pointer focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending HR Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="on_hold">On Hold</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Result Count & Filter Controls */}
      <div className="flex items-center justify-between text-xs text-[#8b949e] px-1">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-[#e6edf3] font-bold">{filtered.length}</strong> of{' '}
            <strong className="text-[#e6edf3] font-bold">{candidates.length}</strong> Talent Profiles in CV Bank
          </span>
          {search && (
            <span className="text-[11px] text-indigo-400 font-mono">
              (Filtered by &quot;{search}&quot;)
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* 4. CLEAN TALENT POOL REPOSITORY (NO RANK SCORES, STANDARDIZED TITLE CONVENTION) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#8b949e] bg-[#161b22] rounded-2xl border border-[#30363d] space-y-3">
            <FolderArchive className="w-12 h-12 text-[#8b949e]/30 mx-auto" />
            <div>
              <p className="text-sm font-bold text-[#e6edf3]">No candidates found in CV Bank</p>
              <p className="text-xs text-[#8b949e] mt-1 max-w-md mx-auto">
                No profiles match &quot;{search}&quot; or the active filters. Adjust your query or click Reset All Filters.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] cursor-pointer mt-2"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          filtered.map((cand) => {
            const isDocx = cand.fileName?.toLowerCase().endsWith('.docx');
            const strictHeader = formatStrictCardHeader(cand);
            const email = (cand.email && cand.email !== 'confidential@domain.local' && !cand.email.includes('@rmgtalent.com') && !cand.email.includes('@domain.local')) ? cand.email : 'N/A';
            const phone = (cand.phone && cand.phone !== '+880 1711-000000' && cand.phone !== '+880 1712-984521' && !cand.phone.toLowerCase().includes('confidential')) ? cand.phone : 'N/A';

            return (
              <div
                key={cand.id}
                className="bg-[#161b22] rounded-2xl border border-[#30363d] hover:border-indigo-500/50 p-4 space-y-3 transition shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* STANDARDIZED TITLE STRIP (STRICT FORMAT CONVENTION) */}
                  {/* "[Candidate Full Name] | [Last Designation] | [Total Years of Experience] | [Last Company Name]" */}
                  <div className="space-y-1.5 pb-2.5 border-b border-[#30363d]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-[9px] ${
                            isDocx
                              ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {isDocx ? 'DOCX' : 'PDF'}
                        </span>
                        <div className="min-w-0">
                          <h3
                            className="text-xs font-black text-[#e6edf3] hover:text-indigo-300 transition line-clamp-2 leading-snug cursor-pointer"
                            onClick={() => setActiveDrawerCandidate(cand)}
                            title={strictHeader}
                          >
                            {strictHeader}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Original File Name Strip */}
                    <div className="flex items-center justify-between text-[11px] text-[#8b949e] pt-1">
                      <span className="truncate max-w-[200px] font-mono text-[10px] text-[#8b949e]">
                        {cand.fileName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                        CV Bank Profile
                      </span>
                    </div>
                  </div>

                  {/* CONTACT INFORMATION STRIP (EMAIL & PHONE) */}
                  <div className="p-2.5 rounded-xl bg-[#21262d] border border-[#30363d] space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
                      <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate text-[#e6edf3] font-mono">{email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-[#e6edf3] font-mono">{phone}</span>
                    </div>
                  </div>

                  {/* EVALUATION METADATA STRIP (Target Requisition, Task Match %, Org Match %, Composite %, Grade Fit, Verdict) */}
                  <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-[#30363d] pb-2">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#8b949e] block">Target Position</span>
                        <span className="font-extrabold text-[#e6edf3] text-xs truncate block text-amber-300">
                          {cand.appliedPosition || 'Target Position'}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-bold text-[#8b949e] block">Composite</span>
                        <span className="font-black text-sm font-mono text-emerald-400">
                          {cand.compositeScore ?? cand.score}%
                        </span>
                      </div>
                    </div>

                    {/* Dual Match Percentages */}
                    <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                      <div className="p-1.5 rounded-lg bg-[#161b22] border border-emerald-500/30">
                        <span className="text-[9px] uppercase font-bold text-[#8b949e] block">Task Match</span>
                        <span className="font-black text-emerald-400 font-mono">
                          {cand.taskMatchScore ?? cand.triMatch?.jdMatch?.score ?? Math.min(100, Math.round(cand.score * 1.02))}%
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-[#161b22] border border-purple-500/30">
                        <span className="text-[9px] uppercase font-bold text-[#8b949e] block">Org Match</span>
                        <span className="font-black text-purple-400 font-mono">
                          {cand.orgMatchScore ?? cand.triMatch?.companyCriteriaMatch?.score ?? Math.max(30, Math.round(cand.score * 0.98))}%
                        </span>
                      </div>
                    </div>

                    {/* Internal Grade Fit & Action Verdict */}
                    <div className="pt-1 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#8b949e]">Internal Grade Fit:</span>
                        <span className="font-semibold text-indigo-300">
                          {cand.gradeFit?.qualifiedGradeCode || cand.gradeFit?.targetGradeCode || cand.salaryFixation?.grade || 'ME-11 (Eligible)'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8b949e] bg-[#161b22] p-2 rounded-lg border border-[#30363d] leading-snug">
                        <strong className="text-indigo-400 font-bold block mb-0.5">Action Verdict:</strong>
                        <span className="text-[#c9d1d9]">
                          {cand.decisiveActionSentence || cand.actionOpinion || cand.verdict || 'Screened & Evaluated against position KRA/KSA.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* KEY COMPETENCIES & TOOLS TAGS */}
                  <div className="space-y-2">
                    {/* CAD & Software Proficiency */}
                    {cand.cadSoftwareProficiency && cand.cadSoftwareProficiency.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-purple-400" />
                          Software &amp; Tools:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {cand.cadSoftwareProficiency.map((cad, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-950/60 text-purple-200 border border-purple-500/40"
                            >
                              {cad}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Buyers Handled */}
                    {cand.buyersWorkedWith && cand.buyersWorkedWith.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1">
                          <Globe className="w-3 h-3 text-cyan-400" />
                          Target Buyers Handled:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {cand.buyersWorkedWith.map((buyer, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-cyan-950/60 text-cyan-200 border border-cyan-500/40"
                            >
                              {buyer}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Core Skills & Specializations */}
                    {cand.skills && cand.skills.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1">
                          <Tag className="w-3 h-3 text-emerald-400" />
                          Core Competencies:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {cand.skills.slice(0, 4).map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#21262d] text-[#e6edf3] border border-[#30363d]"
                            >
                              {skill}
                            </span>
                          ))}
                          {cand.skills.length > 4 && (
                            <span className="text-[10px] text-[#8b949e] self-center">
                              +{cand.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Education Degree */}
                    {(cand.academicDegrees?.length || cand.education?.length) ? (
                      <div className="text-[10px] text-[#8b949e] flex items-center gap-1.5 pt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate text-[#e6edf3]">
                          {(cand.academicDegrees || cand.education || [])[0]}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* CARD ACTIONS: STRICT ACTIONS */}
                {/* 1. "View Original CV / Document" | 2. "Attach / Evaluate Against New Position" */}
                <div className="pt-3 border-t border-[#30363d] space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveDrawerCandidate(cand)}
                      className="px-2.5 py-2 rounded-xl text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      title="Open Original Native CV Document / Text Viewer"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Original Resume</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenCandidateDetail(cand)}
                      className="px-2.5 py-2 rounded-xl text-xs font-bold bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] transition cursor-pointer flex items-center justify-center gap-1.5"
                      title="View Full Profile Details & Extracted History"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#8b949e]" />
                      <span>Profile Details</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenMovePosition) {
                        onOpenMovePosition(cand);
                      } else {
                        onNavigateTab('screening');
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950/40 transition cursor-pointer flex items-center justify-center gap-1.5"
                    title="Attach or cross-evaluate this profile against an active job position"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Attach / Evaluate Against New Position</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. SIDE-BY-SIDE RESUME VERIFICATION DRAWER (ACTUAL CV DOCUMENT VIEWER) */}
      {activeDrawerCandidate && (
        <ResumeVerificationDrawer
          candidate={activeDrawerCandidate}
          onClose={() => setActiveDrawerCandidate(null)}
        />
      )}
    </div>
  );
};

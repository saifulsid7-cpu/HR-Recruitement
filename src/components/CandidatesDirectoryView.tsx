/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  Briefcase,
  Check,
  CheckCircle,
  Clock,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Search,
  Sparkles,
  Tag,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { Candidate, CandidateStatus, NavigationMenuTab } from '../types';
import { getVerdictBadge } from '../utils/scoringCardHelper';
import { evaluateGradeFitAndTenure } from '../utils/gradeFitHelper';
import { ResumeVerificationDrawer } from './ResumeVerificationDrawer';

interface CandidatesDirectoryViewProps {
  candidates: Candidate[];
  onOpenCandidateDetail: (candidate: Candidate) => void;
  onOpenOfferMemo: (candidate: Candidate) => void;
  onOpenRejectionNotice: (candidate: Candidate) => void;
  onUpdateStatus: (candidateId: string, status: CandidateStatus) => void;
  onExportExcel: () => void;
  onNavigateTab?: (tab: NavigationMenuTab) => void;
}

export const CandidatesDirectoryView: React.FC<CandidatesDirectoryViewProps> = ({
  candidates,
  onOpenCandidateDetail,
  onOpenOfferMemo,
  onOpenRejectionNotice,
  onUpdateStatus,
  onExportExcel,
  onNavigateTab,
}) => {
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'fit_only' | 'all'>('fit_only');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [drawerCandidate, setDrawerCandidate] = useState<Candidate | null>(null);

  const fitCandidates = candidates.filter(
    (c) => c.status === 'selected' || c.status === 'shortlisted'
  );

  // Extract all unique products
  const products = Array.from(
    new Set(candidates.flatMap((c) => c.productSpecialization || []))
  );

  const scopedCandidates = scopeFilter === 'fit_only' ? fitCandidates : candidates;

  const filteredCandidates = scopedCandidates.filter((c) => {
    if (productFilter !== 'all' && !(c.productSpecialization || []).includes(productFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPos = c.appliedPosition.toLowerCase().includes(q);
      const matchDesig = (c.lastDesignation || '').toLowerCase().includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      const matchBuyer = (c.buyersWorkedWith || []).some((b) => b.toLowerCase().includes(q));
      if (!matchName && !matchPos && !matchDesig && !matchEmail && !matchBuyer) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-[#e6edf3]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#30363d]">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#e6edf3]">
              Finalized Candidates Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
              {fitCandidates.length} Fit &amp; Selected
            </span>
          </div>
          <p className="text-xs text-[#8b949e] mt-1">
            Dedicated master talent pool strictly for candidates who have passed interview assessments and are deemed &apos;Fit / Selected&apos;.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Pipeline Isolation Banner */}
      <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-2 text-emerald-300">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            <strong>Isolated Master Directory:</strong> Displays only candidates who cleared interviews and earned the <strong>Fit / Selected</strong> verdict.
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#161b22] p-1 rounded-lg border border-[#30363d]">
          <button
            type="button"
            onClick={() => setScopeFilter('fit_only')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
              scopeFilter === 'fit_only'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            Fit / Selected Only ({fitCandidates.length})
          </button>
          <button
            type="button"
            onClick={() => setScopeFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
              scopeFilter === 'all'
                ? 'bg-[#21262d] text-[#e6edf3] border border-[#30363d]'
                : 'text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            All Evaluated ({candidates.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#21262d] p-4 rounded-xl border border-[#30363d] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate name, role, buyer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-[#e6edf3] placeholder-[#8b949e] outline-none focus:border-indigo-500"
            />
          </div>

          {/* Product Filter */}
          {products.length > 0 && (
            <select
              aria-label="Filter by product specialization"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="bg-[#161b22] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-[#e6edf3] outline-none cursor-pointer"
            >
              <option value="all">All Product Specializations</option>
              {products.map((prod) => (
                <option key={prod} value={prod}>
                  {prod}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#161b22] p-0.5 rounded-lg border border-[#30363d] self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              viewMode === 'table' ? 'bg-[#21262d] text-emerald-400' : 'text-[#8b949e]'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              viewMode === 'cards' ? 'bg-[#21262d] text-emerald-400' : 'text-[#8b949e]'
            }`}
            title="Cards View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {viewMode === 'table' ? (
        <div className="bg-[#21262d] rounded-2xl border border-[#30363d] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#161b22] text-[#8b949e] uppercase text-[10px] tracking-wider border-b border-[#30363d]">
                  <th className="py-3 px-4 font-bold">Candidate Name</th>
                  <th className="py-3 px-4 font-bold">Career Track</th>
                  <th className="py-3 px-4 font-bold">Target Position</th>
                  <th className="py-3 px-3 font-bold text-center">Score</th>
                  <th className="py-3 px-3 font-bold text-center">Verdict</th>
                  <th className="py-3 px-3 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-[#8b949e]">
                      <Users className="w-10 h-10 text-emerald-400/30 mx-auto mb-2" />
                      <p className="text-sm font-bold text-[#e6edf3]">
                        {scopeFilter === 'fit_only'
                          ? 'No Finalized Candidates Yet'
                          : 'No Candidates Found'}
                      </p>
                      <p className="text-xs text-[#8b949e] mt-1 max-w-md mx-auto">
                        {scopeFilter === 'fit_only'
                          ? 'Screen resumes in Screening, click "Move to Interview", conduct the assessment, and mark candidates as "Fit / Selected" to populate this master pool.'
                          : 'No candidate profiles match the current search or filters.'}
                      </p>
                      {onNavigateTab && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <button
                            type="button"
                            onClick={() => onNavigateTab('screening')}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer shadow-sm"
                          >
                            Go to Screening
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigateTab('interviews')}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#161b22] hover:bg-[#30363d] text-amber-300 border border-[#30363d] transition cursor-pointer"
                          >
                            Go to Interviews
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((cand) => {
                    const verdict = getVerdictBadge(cand.score);
                    const isFit = cand.status === 'selected' || cand.status === 'shortlisted';

                    return (
                      <tr key={cand.id} className="hover:bg-[#161b22]/50 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#e6edf3]">{cand.name}</div>
                          <div className="text-[11px] text-[#8b949e] font-mono">{cand.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-indigo-300">
                            {cand.lastDesignation || cand.experience?.[0]?.role || 'Professional'}
                          </div>
                          <div className="text-[11px] text-[#8b949e]">
                            {cand.lastCompany || cand.experience?.[0]?.company || 'Prior RMG'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#e6edf3]">{cand.appliedPosition}</div>
                          {cand.totalYearsExperience !== undefined && (
                            <div className="text-[10px] text-emerald-400 font-mono">
                              {cand.totalYearsExperience} Years Experience
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-black text-xs text-emerald-400 font-mono">
                            {cand.score.toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${verdict.badgeClass}`}
                          >
                            {verdict.label}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isFit
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            }`}
                          >
                            {isFit && <Check className="w-3 h-3" />}
                            <span>{isFit ? 'Fit / Selected' : cand.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDrawerCandidate(cand)}
                              className="px-2 py-1 rounded text-[11px] font-bold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition cursor-pointer flex items-center gap-1"
                              title="View Authentic CV Document"
                            >
                              <FileText className="w-3 h-3 text-indigo-400" />
                              <span>CV</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenOfferMemo(cand)}
                              className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 transition cursor-pointer"
                            >
                              Offer
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenCandidateDetail(cand)}
                              className="px-2.5 py-1 rounded text-[11px] font-bold bg-[#161b22] text-[#e6edf3] hover:bg-[#30363d] border border-[#30363d] transition cursor-pointer"
                            >
                              Dossier
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.length === 0 ? (
            <div className="col-span-full py-16 text-center text-[#8b949e] bg-[#21262d] rounded-2xl border border-[#30363d] space-y-2">
              <Users className="w-10 h-10 text-emerald-400/30 mx-auto" />
              <p className="text-sm font-bold text-[#e6edf3]">No candidates found</p>
              <p className="text-xs text-[#8b949e]">
                Evaluate resumes and promote them through Interviews to populate this master talent pool.
              </p>
            </div>
          ) : (
            filteredCandidates.map((cand) => {
              const verdict = getVerdictBadge(cand.score);
              const gradeFit =
                cand.gradeFit ||
                evaluateGradeFitAndTenure({
                  actualYears: cand.totalYearsExperience ?? 0,
                  candidateScore: cand.score ?? 50,
                  targetPositionTitle: cand.appliedPosition || cand.category,
                  lastCompany: cand.lastCompany,
                  lastDesignation: cand.lastDesignation,
                });

              return (
                <div
                  key={cand.id}
                  className="bg-[#21262d] rounded-2xl border border-[#30363d] p-5 space-y-3.5 hover:border-emerald-500/40 transition shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-[#e6edf3] truncate">{cand.name}</h3>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </div>
                        <p className="text-xs text-indigo-300 font-bold mt-0.5 truncate">
                          {cand.lastDesignation || cand.experience?.[0]?.role || 'Professional'}
                          {cand.lastCompany ? ` • ${cand.lastCompany}` : ''}
                        </p>
                        <p className="text-[11px] text-[#8b949e] mt-0.5">Target: {cand.appliedPosition}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-lg text-emerald-400 font-mono">
                          {cand.score.toFixed(0)}%
                        </span>
                        <div
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${verdict.badgeClass}`}
                        >
                          {verdict.label}
                        </div>
                      </div>
                    </div>

                    {gradeFit && (
                      <div className="text-[11px] font-semibold text-indigo-300 bg-indigo-950/50 p-2 rounded-lg border border-indigo-700/30">
                        {gradeFit.badgeLabel}
                      </div>
                    )}

                    {/* Product Specialization */}
                    {cand.productSpecialization && (
                      <div className="flex flex-wrap gap-1">
                        {cand.productSpecialization.map((p, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-[#161b22] text-[#8b949e] border border-[#30363d]"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#30363d] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setDrawerCandidate(cand)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition cursor-pointer flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View CV</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenOfferMemo(cand)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 transition cursor-pointer"
                      >
                        Offer
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenCandidateDetail(cand)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#161b22] text-[#e6edf3] hover:bg-[#30363d] border border-[#30363d] transition cursor-pointer"
                      >
                        Dossier
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Side Drawer for Native CV Document Review */}
      {drawerCandidate && (
        <ResumeVerificationDrawer
          candidate={drawerCandidate}
          onClose={() => setDrawerCandidate(null)}
        />
      )}
    </div>
  );
};

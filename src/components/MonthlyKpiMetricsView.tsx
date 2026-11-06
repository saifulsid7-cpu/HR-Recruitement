/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Database,
  DollarSign,
  Download,
  FileSpreadsheet,
  Globe,
  Megaphone,
  Printer,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { KpiSegmentId } from '../types';

interface MonthlyKpiMetricsViewProps {
  focusedKpiId?: KpiSegmentId | null;
  onSelectKpiId?: (id: KpiSegmentId | null) => void;
  onBackToDashboard: () => void;
  companyName?: string;
}

const HIRING_YIELD_DATA = [
  { month: 'Jan', ratio: '1:1.6', compliant: true },
  { month: 'Feb', ratio: '1:2', compliant: true },
  { month: 'Mar', ratio: '1:3', compliant: true },
  { month: 'Apr', ratio: '1:2.04', compliant: true },
  { month: 'May', ratio: '1:2.1', compliant: true },
  { month: 'Jun', ratio: '1:4.21', compliant: true },
  { month: 'Jul', ratio: '1:4', compliant: true },
  { month: 'Aug', ratio: '1:3.04', compliant: true },
  { month: 'Sep', ratio: '1:3', compliant: true },
  { month: 'Oct', ratio: '1:4', compliant: true },
];

const RESUME_BANK_DATA = [
  { month: 'Jan', interviewees: '35', inserted: 12, rate: '34.29%' },
  { month: 'Feb', interviewees: '24', inserted: 7, rate: '29.17%' },
  { month: 'Mar', interviewees: '19', inserted: 14, rate: '73.68%' },
  { month: 'Apr', interviewees: '73', inserted: 27, rate: '36.99%' },
  { month: 'May', interviewees: '21', inserted: 6, rate: '28.57%' },
  { month: 'Jun', interviewees: '109.5', inserted: 16, rate: '14.61%' },
  { month: 'Jul', interviewees: '20', inserted: 20, rate: '100.00%' },
  { month: 'Aug', interviewees: '6', inserted: 5, rate: '83.33%' },
  { month: 'Sep', interviewees: '36', inserted: 29, rate: '80.56%' },
  { month: 'Oct', interviewees: '47', inserted: 40, rate: '85.11%' },
];

const SALARY_SIMILARITY_DATA = [
  { month: 'Jan', out: 'BDT 18,515', inSal: 'BDT 18,192', similarity: '98.25%', pass: true },
  { month: 'Feb', out: 'BDT 20,609', inSal: 'BDT 22,012', similarity: '93.63%', pass: true },
  { month: 'Mar', out: 'BDT 15,908', inSal: 'BDT 23,281', similarity: '68.33%', pass: false },
  { month: 'Apr', out: 'BDT 18,021', inSal: 'BDT 16,747', similarity: '92.93%', pass: true },
  { month: 'May', out: 'BDT 15,935', inSal: 'BDT 19,227', similarity: '82.88%', pass: true },
  { month: 'Jun', out: 'BDT 16,192', inSal: 'BDT 17,065', similarity: '94.88%', pass: true },
  { month: 'Jul', out: 'BDT 19,235', inSal: 'BDT 17,336', similarity: '90.13%', pass: true },
  { month: 'Aug', out: 'BDT 16,960', inSal: 'BDT 18,517', similarity: '91.59%', pass: true },
  { month: 'Sep', out: 'BDT 16,648', inSal: 'BDT 16,128', similarity: '96.88%', pass: true },
];

const LINKEDIN_GROWTH_DATA = [
  { month: 'Jan', followers: '+17', searches: '218', impressions: '260', visitors: '18', engagement: '7.21%' },
  { month: 'Feb', followers: '+3', searches: '128', impressions: '1,159', visitors: '59', engagement: '4.62%' },
  { month: 'Mar', followers: '+25', searches: '135', impressions: '2,030', visitors: '82', engagement: '4.41%' },
  { month: 'Apr', followers: '+18', searches: '211', impressions: '1,726', visitors: '85', engagement: '17.81%' },
  { month: 'May', followers: '+14', searches: '146', impressions: '1,052', visitors: '292', engagement: '7.66%' },
  { month: 'Jun', followers: '+569', searches: '664', impressions: '31,212', visitors: '1,105', engagement: '27.22%' },
  { month: 'Jul', followers: '+1,594', searches: '703', impressions: '79,611', visitors: '715', engagement: '7.59%' },
  { month: 'Aug', followers: '+1,191', searches: '918', impressions: '71,607', visitors: '698', engagement: '9.82%' },
  { month: 'Sep', followers: '+850', searches: '942', impressions: '47,538', visitors: '772', engagement: '5.71%' },
  { month: 'Oct', followers: '+985', searches: '1,304', impressions: '65,447', visitors: '970', engagement: '7.60%' },
];

const JOB_CIRCULARS_DATA = [
  { month: 'Jan', count: 0 },
  { month: 'Feb', count: 0 },
  { month: 'Mar', count: 0 },
  { month: 'Apr', count: 0 },
  { month: 'May', count: 0 },
  { month: 'Jun', count: 7 },
  { month: 'Jul', count: 19 },
  { month: 'Aug', count: 24 },
  { month: 'Sep', count: 12 },
  { month: 'Oct', count: 13 },
];

const BG_CHECK_DATA = [
  { month: 'Jan', hires: 22, bgDone: 19, rate: '86.36%' },
  { month: 'Feb', hires: 13, bgDone: 12, rate: '92.31%' },
  { month: 'Mar', hires: 4, bgDone: 7, rate: '175.00%' },
  { month: 'Apr', hires: 32, bgDone: 29, rate: '90.63%' },
  { month: 'May', hires: 21, bgDone: 20, rate: '95.24%' },
  { month: 'Jun', hires: 25, bgDone: 28, rate: '112.00%' },
  { month: 'Jul', hires: 17, bgDone: 17, rate: '100.00%' },
  { month: 'Aug', hires: 24, bgDone: 20, rate: '83.33%' },
  { month: 'Sep', hires: 22, bgDone: 19, rate: '86.36%' },
  { month: 'Oct', hires: 24, bgDone: 20, rate: '83.33%' },
];

export const MonthlyKpiMetricsView: React.FC<MonthlyKpiMetricsViewProps> = ({
  focusedKpiId,
  onSelectKpiId,
  onBackToDashboard,
  companyName = 'Enterprise RMS',
}) => {
  const [selectedYear, setSelectedYear] = useState('2026 (Jan - Oct Actuals)');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (focusedKpiId && cardRefs.current[focusedKpiId]) {
      cardRefs.current[focusedKpiId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [focusedKpiId]);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryRows = [
      { Segment: '1. Staff Hiring Yield Ratio', Benchmark: 'Within 1:10', Summary: 'YTD Average: 1:2.64 (10 Months, 100% Compliant)' },
      { Segment: '2. Resume Bank Insertion Rate', Benchmark: 'VJCE/OJCE Tracking', Summary: 'Total Interviewees: 390.5 | Total Inserted: 176 | Avg Rate: 56.63%' },
      { Segment: '3. Salary Similarity Ratio', Benchmark: 'Minimum 75%', Summary: 'Mean Outgoing: BDT 17,558 | Mean Incoming: BDT 18,723 | Avg Similarity: 89.94%' },
      { Segment: '4. LinkedIn Reach & Branding', Benchmark: 'Employer Branding', Summary: 'Followers: 5,266 | Searches: 5,369 | Impressions: 301,642 | Visitors: 4,796 | Avg Eng: 9.96%' },
      { Segment: '5. Job Circulars & Sourcing Velocity', Benchmark: '2/week or 8/month', Summary: 'Total Published: 75 Circulars (Jun-Oct Avg: 15/month)' },
      { Segment: '6. Background Check Compliance', Benchmark: '100% Verification', Summary: 'Total New Hires: 204 | BG Checks Done: 191 | Compliance: 93.63%' },
      { Segment: '7. People Engagement Surveys', Benchmark: '2 Surveys at HO', Summary: 'Conducted YTD: 0 (Scheduled for Year-End)' },
      { Segment: '8. Refresher & Youth Meetup Programs', Benchmark: '3 Programs', Summary: 'Completed: 1 Program (18.06.2026 - 3 Attendees) | Remaining: 2 Scheduled' },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'KPI Executive Summary');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(HIRING_YIELD_DATA), '1_Hiring_Yield_Ratio');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(RESUME_BANK_DATA), '2_Resume_Bank_Insertion');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(SALARY_SIMILARITY_DATA), '3_Salary_Similarity');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(LINKEDIN_GROWTH_DATA), '4_LinkedIn_Growth');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(JOB_CIRCULARS_DATA), '5_Job_Circulars');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(BG_CHECK_DATA), '6_Background_Checks');

    XLSX.writeFile(wb, `${companyName.replace(/\s+/g, '_')}_2026_KPI_Report.xlsx`);
    setExportMenuOpen(false);
    setExportNotice('Exported 2026 KPI Report (.xlsx)');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handlePrintPdf = () => {
    setExportMenuOpen(false);
    window.print();
  };

  return (
    <div className="w-full space-y-6 text-[#e6edf3]">
      {/* Prominent Top Action Bar */}
      <div className="bg-[#161b22] rounded-2xl border border-[#30363d] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] hover:border-indigo-500/50 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[#0d1117] shadow-[0_0_16px_rgba(245,158,11,0.35)] shrink-0">
              <BarChart3 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#f8fafc] tracking-tight">
                KPI Metrics - Talent Acquisition
              </h1>
              <p className="text-xs text-[#8b949e]">
                2026 Talent Acquisition Performance, Sourcing Velocity, Compliance &amp; Employer Branding
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls: Year Selector & Export KPI Report */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {focusedKpiId && onSelectKpiId && (
            <button
              type="button"
              onClick={() => onSelectKpiId(null)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-900/60 transition cursor-pointer"
            >
              Show All 8 Segments
            </button>
          )}

          {/* Year Selector */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              aria-label="KPI Reporting Period"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#e6edf3] focus:outline-none cursor-pointer"
            >
              <option value="2026 (Jan - Oct Actuals)" className="bg-[#161b22]">
                2026 (Jan - Oct Actuals)
              </option>
            </select>
          </div>

          {/* Export KPI Report (Excel / PDF) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950/50 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export KPI Report (Excel / PDF)</span>
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-[#1c2128] border border-[#30363d] rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#e6edf3] hover:bg-[#21262d] transition cursor-pointer text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Export as Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#e6edf3] hover:bg-[#21262d] transition cursor-pointer text-left"
                >
                  <Printer className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {exportNotice && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 8 High-Contrast KPI Segment Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 1. Staff Hiring Yield Ratio (Cyan / Blue Theme) */}
        <div
          id="kpi-hiring-yield"
          ref={(el) => {
            cardRefs.current['kpi-hiring-yield'] = el;
          }}
          className={`bg-[#161b22] rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all duration-300 ${
            focusedKpiId === 'kpi-hiring-yield'
              ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_35px_rgba(6,182,212,0.35)]'
              : 'border-cyan-500/30 shadow-lg'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#f8fafc]">
                    Staff Hiring Yield Ratio
                  </h2>
                  <span className="text-xs text-cyan-400 font-semibold">
                    Benchmark: Within 1:10
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                100% Compliant
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-[#0d1117] border border-cyan-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Benchmark
                </span>
                <span className="text-base font-black font-mono text-cyan-300">
                  1:10
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-cyan-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  YTD Average
                </span>
                <span className="text-base font-black font-mono text-[#f8fafc]">
                  1:2.64
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-cyan-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Evaluated
                </span>
                <span className="text-xs font-bold text-cyan-200">
                  10 Months (Jan – Oct 2026)
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#161b22] text-[10px] uppercase font-bold text-[#8b949e]">
                  <th className="py-2 px-3">Month</th>
                  <th className="py-2 px-3">Yield Ratio</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/60">
                {HIRING_YIELD_DATA.map((row) => (
                  <tr key={row.month} className="hover:bg-[#161b22]/60">
                    <td className="py-1.5 px-3 font-bold text-[#e6edf3]">
                      {row.month} 2026
                    </td>
                    <td className="py-1.5 px-3 font-mono font-bold text-cyan-300">
                      {row.ratio}
                    </td>
                    <td className="py-1.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Within 1:10
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Resume Bank Insertion Rate (Emerald / Green Theme) */}
        <div
          id="kpi-resume-bank"
          ref={(el) => {
            cardRefs.current['kpi-resume-bank'] = el;
          }}
          className={`bg-[#161b22] rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all duration-300 ${
            focusedKpiId === 'kpi-resume-bank'
              ? 'border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_35px_rgba(16,185,129,0.35)]'
              : 'border-emerald-500/30 shadow-lg'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#f8fafc]">
                    Resume Bank Insertion Rate
                  </h2>
                  <span className="text-xs text-emerald-400 font-semibold">
                    VJCE / OJCE Candidates Tracking
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                Avg Rate: 56.63%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-[#0d1117] border border-emerald-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Total Interviewees (Sum)
                </span>
                <span className="text-base font-black font-mono text-[#f8fafc]">
                  390.5
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-emerald-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Total Inserted (Sum)
                </span>
                <span className="text-base font-black font-mono text-emerald-400">
                  176
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-emerald-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Average Rate
                </span>
                <span className="text-base font-black font-mono text-emerald-300">
                  56.63%
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#161b22] text-[10px] uppercase font-bold text-[#8b949e]">
                  <th className="py-2 px-3">Month</th>
                  <th className="py-2 px-3 text-right">Interviewees</th>
                  <th className="py-2 px-3 text-right">Inserted Count</th>
                  <th className="py-2 px-3 text-right">% Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/60">
                {RESUME_BANK_DATA.map((row) => (
                  <tr key={row.month} className="hover:bg-[#161b22]/60">
                    <td className="py-1.5 px-3 font-bold text-[#e6edf3]">
                      {row.month}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono text-[#c9d1d9]">
                      {row.interviewees}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-300">
                      {row.inserted}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {row.rate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Salary Similarity Ratio (Violet / Purple Theme) */}
        <div
          id="kpi-salary-similarity"
          ref={(el) => {
            cardRefs.current['kpi-salary-similarity'] = el;
          }}
          className={`bg-[#161b22] rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all duration-300 ${
            focusedKpiId === 'kpi-salary-similarity'
              ? 'border-purple-400 ring-2 ring-purple-400/50 shadow-[0_0_35px_rgba(168,85,247,0.35)]'
              : 'border-purple-500/30 shadow-lg'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#f8fafc]">
                    Salary Similarity Ratio
                  </h2>
                  <span className="text-xs text-purple-400 font-semibold">
                    Benchmark: &ge; 75% (Outgoing vs Incoming)
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-950 text-purple-400 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                Avg Similarity: 89.94%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-purple-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Benchmark
                </span>
                <span className="text-sm font-black font-mono text-purple-300">
                  &ge; 75%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-purple-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Mean Outgoing
                </span>
                <span className="text-xs font-black font-mono text-[#f8fafc]">
                  BDT 17,558
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-purple-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Mean Incoming
                </span>
                <span className="text-xs font-black font-mono text-purple-300">
                  BDT 18,723
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-purple-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Avg Similarity
                </span>
                <span className="text-sm font-black font-mono text-emerald-400">
                  89.94%
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#161b22] text-[10px] uppercase font-bold text-[#8b949e]">
                  <th className="py-2 px-3">Month</th>
                  <th className="py-2 px-3 text-right">Outgoing</th>
                  <th className="py-2 px-3 text-right">Incoming</th>
                  <th className="py-2 px-3 text-right">Similarity %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/60">
                {SALARY_SIMILARITY_DATA.map((row) => (
                  <tr key={row.month} className="hover:bg-[#161b22]/60">
                    <td className="py-1.5 px-3 font-bold text-[#e6edf3]">
                      {row.month}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono text-[#c9d1d9]">
                      {row.out}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono text-purple-300">
                      {row.inSal}
                    </td>
                    <td
                      className={`py-1.5 px-3 text-right font-mono font-bold ${
                        row.pass ? 'text-purple-400' : 'text-amber-400'
                      }`}
                    >
                      {row.similarity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. LinkedIn Reach & Branding Growth (Sky Blue / Cobalt Theme) */}
        <div
          id="kpi-linkedin-growth"
          ref={(el) => {
            cardRefs.current['kpi-linkedin-growth'] = el;
          }}
          className={`bg-[#161b22] rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all duration-300 ${
            focusedKpiId === 'kpi-linkedin-growth'
              ? 'border-sky-400 ring-2 ring-sky-400/50 shadow-[0_0_35px_rgba(56,189,248,0.35)]'
              : 'border-sky-500/30 shadow-lg'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-950 border border-sky-500/40 text-sky-400 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#f8fafc]">
                    LinkedIn Reach &amp; Branding Growth
                  </h2>
                  <span className="text-xs text-sky-400 font-semibold">
                    10-Month Employer Branding &amp; Engagement Analytics
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-sky-950 text-sky-400 border border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
                Avg Engagement: 9.96%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-sky-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  New Followers
                </span>
                <span className="text-xs font-black font-mono text-sky-400">
                  5,266
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-sky-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Searches
                </span>
                <span className="text-xs font-black font-mono text-[#f8fafc]">
                  5,369
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-sky-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Impressions
                </span>
                <span className="text-xs font-black font-mono text-sky-300">
                  301,642
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-sky-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Visitors
                </span>
                <span className="text-xs font-black font-mono text-[#f8fafc]">
                  4,796
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-sky-500/20 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Avg Eng.
                </span>
                <span className="text-xs font-black font-mono text-emerald-400">
                  9.96%
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#161b22] text-[10px] uppercase font-bold text-[#8b949e]">
                  <th className="py-2 px-2.5">Month</th>
                  <th className="py-2 px-2.5 text-right">Followers</th>
                  <th className="py-2 px-2.5 text-right">Searches</th>
                  <th className="py-2 px-2.5 text-right">Impressions</th>
                  <th className="py-2 px-2.5 text-right">Visitors</th>
                  <th className="py-2 px-2.5 text-right">Eng. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/60">
                {LINKEDIN_GROWTH_DATA.map((row) => (
                  <tr key={row.month} className="hover:bg-[#161b22]/60">
                    <td className="py-1.5 px-2.5 font-bold text-[#e6edf3]">
                      {row.month}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-mono font-bold text-sky-400">
                      {row.followers}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-mono text-[#c9d1d9]">
                      {row.searches}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-mono text-sky-300">
                      {row.impressions}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-mono text-[#c9d1d9]">
                      {row.visitors}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-mono font-bold text-emerald-400">
                      {row.engagement}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Job Circulars & Sourcing Velocity (Amber / Gold Theme) */}
        <div
          id="kpi-job-circulars"
          ref={(el) => {
            cardRefs.current['kpi-job-circulars'] = el;
          }}
          className={`bg-[#161b22] rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all duration-300 ${
            focusedKpiId === 'kpi-job-circulars'
              ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_35px_rgba(245,158,11,0.35)]'
              : 'border-amber-500/30 shadow-lg'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#f8fafc]">
                    Job Circulars &amp; Sourcing Velocity
                  </h2>
                  <span className="text-xs text-amber-400 font-semibold">
                    Target: 2/week or 8/month
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-950 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                75 Circulars (Sum)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-[#0d1117] border border-amber-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Total Circulars (Sum)
                </span>
                <span className="text-base font-black font-mono text-amber-400">
                  75 Circulars
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-amber-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Active Avg (Jun–Oct)
                </span>
                <span className="text-base font-black font-mono text-[#f8fafc]">
                  15 / month
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-amber-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Peak Month
                </span>
                <span className="text-xs font-bold font-mono text-amber-300">
                  Aug (24 Circulars)
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#161b22] text-[10px] uppercase font-bold text-[#8b949e]">
                  <th className="py-2 px-3">Month</th>
                  <th className="py-2 px-3 text-right">Circulars Published</th>
                  <th className="py-2 px-3 text-right">Benchmark Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/60">
                {JOB_CIRCULARS_DATA.map((row) => (
                  <tr key={row.month} className="hover:bg-[#161b22]/60">
                    <td className="py-1.5 px-3 font-bold text-[#e6edf3]">
                      {row.month} 2026
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-amber-300">
                      {row.count}
                    </td>
                    <td className="py-1.5 px-3 text-right">
                      {row.count === 0 ? (
                        <span className="text-[11px] text-[#8b949e]">0</span>
                      ) : row.count >= 8 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-500/30">
                          Surpassed ({row.count}/8)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#161b22] text-amber-300 border border-[#30363d]">
                          Active ({row.count}/8)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Background Check Compliance (Teal / Mint Theme) */}
        <div
          id="kpi-bg-check"
          ref={(el) => {
            cardRefs.current['kpi-bg-check'] = el;
          }}
          className={`bg-[#161b22] rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all duration-300 ${
            focusedKpiId === 'kpi-bg-check'
              ? 'border-teal-400 ring-2 ring-teal-400/50 shadow-[0_0_35px_rgba(20,184,166,0.35)]'
              : 'border-teal-500/30 shadow-lg'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-950 border border-teal-500/40 text-teal-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#f8fafc]">
                    Background Check Compliance
                  </h2>
                  <span className="text-xs text-teal-400 font-semibold">
                    Target: 100% Verification Audit
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-teal-950 text-teal-400 border border-teal-500/40 shadow-[0_0_12px_rgba(20,184,166,0.2)]">
                Compliance: 93.63%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-[#0d1117] border border-teal-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Total New Hires (Sum)
                </span>
                <span className="text-base font-black font-mono text-[#f8fafc]">
                  204
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-teal-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Total Checks Done (Sum)
                </span>
                <span className="text-base font-black font-mono text-teal-400">
                  191
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-teal-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Overall Compliance
                </span>
                <span className="text-base font-black font-mono text-teal-300">
                  93.63%
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#161b22] text-[10px] uppercase font-bold text-[#8b949e]">
                  <th className="py-2 px-3">Month</th>
                  <th className="py-2 px-3 text-right">New Hires</th>
                  <th className="py-2 px-3 text-right">BG Done</th>
                  <th className="py-2 px-3 text-right">Compliance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/60">
                {BG_CHECK_DATA.map((row) => (
                  <tr key={row.month} className="hover:bg-[#161b22]/60">
                    <td className="py-1.5 px-3 font-bold text-[#e6edf3]">
                      {row.month}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono text-[#c9d1d9]">
                      {row.hires}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-teal-300">
                      {row.bgDone}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-teal-400">
                      {row.rate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7. People Engagement Surveys (Rose / Coral Theme) */}
        <div
          id="kpi-engagement-surveys"
          ref={(el) => {
            cardRefs.current['kpi-engagement-surveys'] = el;
          }}
          className={`bg-[#161b22] rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all duration-300 ${
            focusedKpiId === 'kpi-engagement-surveys'
              ? 'border-rose-400 ring-2 ring-rose-400/50 shadow-[0_0_35px_rgba(244,63,94,0.35)]'
              : 'border-rose-500/30 shadow-lg'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-950 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#f8fafc]">
                    People Engagement Surveys
                  </h2>
                  <span className="text-xs text-rose-400 font-semibold">
                    Annual Target: 2 Surveys at HO
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-950 text-rose-400 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
                Scheduled for Year-End
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-[#0d1117] border border-rose-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Annual Target
                </span>
                <span className="text-sm font-black text-rose-300">
                  2 Surveys at HO
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-rose-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Conducted YTD
                </span>
                <span className="text-base font-black font-mono text-[#f8fafc]">
                  0 Conducted
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-rose-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Status
                </span>
                <span className="text-xs font-bold text-rose-200">
                  Scheduled for Year-End
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-rose-500/20 flex items-center justify-between text-xs">
            <span className="text-[#c9d1d9]">
              Head Office Engagement Survey Cycle (2026)
            </span>
            <span className="font-mono font-bold text-rose-400">
              0 / 2 Completed
            </span>
          </div>
        </div>

        {/* 8. Refresher & Youth Meetup Programs (Indigo / Deep Blue Theme) */}
        <div
          id="kpi-youth-meetup"
          ref={(el) => {
            cardRefs.current['kpi-youth-meetup'] = el;
          }}
          className={`bg-[#161b22] rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all duration-300 ${
            focusedKpiId === 'kpi-youth-meetup'
              ? 'border-indigo-400 ring-2 ring-indigo-400/50 shadow-[0_0_35px_rgba(99,102,241,0.35)]'
              : 'border-indigo-500/30 shadow-lg'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#f8fafc]">
                    Refresher &amp; Youth Meetup Programs
                  </h2>
                  <span className="text-xs text-indigo-400 font-semibold">
                    Annual Target: 3 Programs
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-950 text-indigo-400 border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
                1 Completed | 2 Scheduled
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-[#0d1117] border border-indigo-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Annual Target
                </span>
                <span className="text-base font-black font-mono text-indigo-300">
                  3 Programs
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-indigo-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Completed
                </span>
                <span className="text-sm font-black text-[#f8fafc]">
                  1 Program (3 Attendees)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-indigo-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Remaining
                </span>
                <span className="text-base font-black font-mono text-indigo-400">
                  2 Scheduled
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#161b22] text-[10px] uppercase font-bold text-[#8b949e]">
                  <th className="py-2 px-3">Program</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3 text-right">Attendees</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/60">
                <tr className="hover:bg-[#161b22]/60">
                  <td className="py-1.5 px-3 font-bold text-[#e6edf3]">
                    Program #1
                  </td>
                  <td className="py-1.5 px-3 font-mono text-indigo-300">
                    18.06.2026
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono font-bold text-[#f8fafc]">
                    3 Attendees
                  </td>
                  <td className="py-1.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      Completed
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#161b22]/60">
                  <td className="py-1.5 px-3 font-bold text-[#c9d1d9]">
                    Programs #2 &amp; #3
                  </td>
                  <td className="py-1.5 px-3 text-[#8b949e]">2026 Schedule</td>
                  <td className="py-1.5 px-3 text-right text-[#8b949e]">—</td>
                  <td className="py-1.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                      Scheduled
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

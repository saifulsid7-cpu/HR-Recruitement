/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Award,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Database,
  DollarSign,
  Globe,
  Megaphone,
  ShieldCheck,
  Users,
} from 'lucide-react';

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

export const KpiMetricsSection: React.FC = () => {
  return (
    <section className="bg-[#0d1117] rounded-2xl border border-[#30363d] p-4 sm:p-6 space-y-6 shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#30363d]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[#0d1117] shadow-[0_0_16px_rgba(245,158,11,0.35)] shrink-0">
            <BarChart3 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-[#f8fafc] tracking-tight">
                KPI Metrics - Talent Acquisition
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                2026 Talent Acquisition Tracking (Jan – Oct)
              </span>
            </div>
            <p className="text-xs text-[#8b949e] mt-0.5">
              8-Segment Recruitment Efficiency, Sourcing Velocity, Compliance &amp; Employer Branding Analytics
            </p>
          </div>
        </div>
      </div>

      {/* 8 Distinct Color-Coded KPI Segment Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* SEGMENT 1: Staff Hiring Yield Ratio (Cyan / Blue Palette) */}
        <div className="bg-[#161b22] rounded-2xl border border-cyan-500/30 p-5 flex flex-col justify-between gap-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#f8fafc]">
                    Staff Hiring Yield Ratio
                  </h3>
                  <span className="text-[11px] text-cyan-400 font-semibold">
                    Objective Benchmark: Within 1:10
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                100% Compliant
              </span>
            </div>

            {/* Aggregated Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-cyan-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Benchmark Target
                </span>
                <span className="text-sm font-black font-mono text-cyan-300">
                  1:10
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-cyan-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  YTD Average Ratio
                </span>
                <span className="text-sm font-black font-mono text-[#f8fafc]">
                  1:2.64
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-cyan-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Months Evaluated
                </span>
                <span className="text-xs font-bold text-cyan-200">
                  10 Months (Jan–Oct)
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-cyan-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Peak Ratio
                </span>
                <span className="text-xs font-bold font-mono text-emerald-400">
                  &le; 1:4.21
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#161b22] text-[10px] uppercase font-bold text-[#8b949e]">
                  <th className="py-2 px-3">Month</th>
                  <th className="py-2 px-3">Yield Ratio</th>
                  <th className="py-2 px-3 text-right">Target Status</th>
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
                        Compliant
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEGMENT 2: Resume Bank Data Insertion Rate (Emerald / Mint Green Palette) */}
        <div className="bg-[#161b22] rounded-2xl border border-emerald-500/30 p-5 flex flex-col justify-between gap-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#f8fafc]">
                    Resume Bank Data Insertion Rate
                  </h3>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    VJCE / OJCE Candidates Tracking
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                Avg: 56.63%
              </span>
            </div>

            {/* Aggregated Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-emerald-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Total Interviewees
                </span>
                <span className="text-sm font-black font-mono text-[#f8fafc]">
                  390.5
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-emerald-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Total Inserted
                </span>
                <span className="text-sm font-black font-mono text-emerald-400">
                  176
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-emerald-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Overall Rate (Avg)
                </span>
                <span className="text-sm font-black font-mono text-emerald-300">
                  56.63%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-emerald-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Peak Months
                </span>
                <span className="text-[11px] font-bold text-emerald-200">
                  Jul (100%), Oct (85.11%)
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#161b22] text-[10px] uppercase font-bold text-[#8b949e]">
                  <th className="py-2 px-3">Month</th>
                  <th className="py-2 px-3 text-right">Interviewees</th>
                  <th className="py-2 px-3 text-right">Data Inserted</th>
                  <th className="py-2 px-3 text-right">Insertion Rate</th>
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

        {/* SEGMENT 3: Salary Similarity Ratio (Violet / Purple Palette) */}
        <div className="bg-[#161b22] rounded-2xl border border-purple-500/30 p-5 flex flex-col justify-between gap-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#f8fafc]">
                    Salary Similarity Ratio
                  </h3>
                  <span className="text-[11px] text-purple-400 font-semibold">
                    Outgoing vs Incoming Average Salary (Min 75% Target)
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-950 text-purple-400 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                89.94% (Surpasses Target)
              </span>
            </div>

            {/* Aggregated Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-purple-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Benchmark Target
                </span>
                <span className="text-xs font-bold text-purple-300">
                  Min 75% Similarity
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-purple-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Outgoing Avg (Mean)
                </span>
                <span className="text-xs font-black font-mono text-[#f8fafc]">
                  BDT 17,558.00
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-purple-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Incoming Avg (Mean)
                </span>
                <span className="text-xs font-black font-mono text-purple-300">
                  BDT 18,722.72
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-purple-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Overall Similarity
                </span>
                <span className="text-sm font-black font-mono text-emerald-400">
                  89.94%
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#161b22] text-[10px] uppercase font-bold text-[#8b949e]">
                  <th className="py-2 px-3">Month</th>
                  <th className="py-2 px-3 text-right">Outgoing Avg</th>
                  <th className="py-2 px-3 text-right">Incoming Avg</th>
                  <th className="py-2 px-3 text-right">Similarity</th>
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

        {/* SEGMENT 4: LinkedIn Reach & Employer Branding Growth (Sky Blue / Royal Blue Palette) */}
        <div className="bg-[#161b22] rounded-2xl border border-sky-500/30 p-5 flex flex-col justify-between gap-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-500/40 text-sky-400 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#f8fafc]">
                    LinkedIn Reach &amp; Employer Branding Growth
                  </h3>
                  <span className="text-[11px] text-sky-400 font-semibold">
                    Organic Reach, Follower Velocity &amp; Page Engagement
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-950 text-sky-400 border border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
                Avg Eng: 9.96%
              </span>
            </div>

            {/* Aggregated Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="p-2 rounded-xl bg-[#0d1117] border border-sky-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  New Followers
                </span>
                <span className="text-xs font-black font-mono text-sky-400">
                  5,266
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#0d1117] border border-sky-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Search Appear.
                </span>
                <span className="text-xs font-black font-mono text-[#f8fafc]">
                  5,369
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#0d1117] border border-sky-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Impressions
                </span>
                <span className="text-xs font-black font-mono text-sky-300">
                  301,642
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#0d1117] border border-sky-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Page Visitors
                </span>
                <span className="text-xs font-black font-mono text-[#f8fafc]">
                  4,796
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#0d1117] border border-sky-500/20 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Avg Engagement
                </span>
                <span className="text-xs font-black font-mono text-emerald-400">
                  9.96%
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
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

        {/* SEGMENT 5: Job Circulars & Sourcing Velocity (Amber / Gold Palette) */}
        <div className="bg-[#161b22] rounded-2xl border border-amber-500/30 p-5 flex flex-col justify-between gap-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#f8fafc]">
                    Job Circulars &amp; Sourcing Velocity
                  </h3>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    Objective Target: 2/week or 8/month
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                75 Circulars Published
              </span>
            </div>

            {/* Aggregated Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-amber-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Total Circulars (Sum)
                </span>
                <span className="text-sm font-black font-mono text-amber-400">
                  75 Circulars
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-amber-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Active Months (Jun–Oct)
                </span>
                <span className="text-sm font-black font-mono text-[#f8fafc]">
                  Avg 15 / month
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-amber-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Peak Publishing Month
                </span>
                <span className="text-xs font-bold font-mono text-amber-300">
                  August (24 Circulars)
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#161b22] text-[10px] uppercase font-bold text-[#8b949e]">
                  <th className="py-2 px-3">Month</th>
                  <th className="py-2 px-3 text-right">Circulars Published</th>
                  <th className="py-2 px-3 text-right">Monthly Benchmark (8)</th>
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
                        <span className="text-[11px] text-[#8b949e]">
                          Pre-Launch (0)
                        </span>
                      ) : row.count >= 8 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-500/30">
                          Surpassed ({row.count}/8)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#161b22] text-amber-300 border border-[#30363d]">
                          Ramp-Up ({row.count}/8)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEGMENT 6: Background Check & Document Verification (Teal / Sea Green Palette) */}
        <div className="bg-[#161b22] rounded-2xl border border-teal-500/30 p-5 flex flex-col justify-between gap-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-950 border border-teal-500/40 text-teal-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#f8fafc]">
                    Background Check &amp; Document Verification
                  </h3>
                  <span className="text-[11px] text-teal-400 font-semibold">
                    Objective Target: 100% Verification
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-950 text-teal-400 border border-teal-500/40 shadow-[0_0_12px_rgba(20,184,166,0.2)]">
                Fulfillment: 93.63%
              </span>
            </div>

            {/* Aggregated Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-teal-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Total New Hires (Sum)
                </span>
                <span className="text-sm font-black font-mono text-[#f8fafc]">
                  204
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-teal-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  BG Checks Done (Sum)
                </span>
                <span className="text-sm font-black font-mono text-teal-400">
                  191
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-teal-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Overall Compliance
                </span>
                <span className="text-sm font-black font-mono text-teal-300">
                  93.63%
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#161b22] text-[10px] uppercase font-bold text-[#8b949e]">
                  <th className="py-2 px-3">Month</th>
                  <th className="py-2 px-3 text-right">New Hires</th>
                  <th className="py-2 px-3 text-right">BG Done</th>
                  <th className="py-2 px-3 text-right">Fulfillment %</th>
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

        {/* SEGMENT 7: People Engagement Surveys (Rose / Coral Palette) */}
        <div className="bg-[#161b22] rounded-2xl border border-rose-500/30 p-5 flex flex-col justify-between gap-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#f8fafc]">
                    People Engagement Surveys
                  </h3>
                  <span className="text-[11px] text-rose-400 font-semibold">
                    Objective Target: 2 Surveys at Head Office
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-950 text-rose-400 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
                In Progress / Scheduled for Year-End
              </span>
            </div>

            {/* Aggregated Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-[#0d1117] border border-rose-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Annual Target
                </span>
                <span className="text-sm font-black text-rose-300">
                  2 Surveys at Head Office
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-rose-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Conducted YTD
                </span>
                <span className="text-sm font-black font-mono text-[#f8fafc]">
                  0 Surveys
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-rose-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Schedule Window
                </span>
                <span className="text-xs font-bold text-rose-200">
                  Pending Q4 Schedule
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-rose-500/20 flex items-center justify-between text-xs">
            <span className="text-[#c9d1d9]">
              Head Office Pulse &amp; Annual Engagement Survey Cycle
            </span>
            <span className="font-mono font-bold text-rose-400">
              0 / 2 Completed
            </span>
          </div>
        </div>

        {/* SEGMENT 8: Refresher & Youth Meetup Programs (Indigo / Deep Blue Palette) */}
        <div className="bg-[#161b22] rounded-2xl border border-indigo-500/30 p-5 flex flex-col justify-between gap-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#f8fafc]">
                    Refresher &amp; Youth Meetup Programs
                  </h3>
                  <span className="text-[11px] text-indigo-400 font-semibold">
                    Objective Target: 3 Programs
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
                1 / 3 Completed
              </span>
            </div>

            {/* Aggregated Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-[#0d1117] border border-indigo-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Annual Target
                </span>
                <span className="text-sm font-black font-mono text-indigo-300">
                  3 Programs
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-indigo-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Completed Programs
                </span>
                <span className="text-sm font-black font-mono text-[#f8fafc]">
                  1 Completed
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-indigo-500/20">
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                  Total Participants
                </span>
                <span className="text-sm font-black font-mono text-emerald-400">
                  3 Participants
                </span>
              </div>
            </div>
          </div>

          {/* Program Execution Breakdown */}
          <div className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#161b22] text-[10px] uppercase font-bold text-[#8b949e]">
                  <th className="py-2 px-3">Program</th>
                  <th className="py-2 px-3">Execution Date</th>
                  <th className="py-2 px-3 text-right">Participants</th>
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
                      Executed
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#161b22]/60">
                  <td className="py-1.5 px-3 font-bold text-[#c9d1d9]">
                    Programs #2 &amp; #3
                  </td>
                  <td className="py-1.5 px-3 text-[#8b949e]">Q4 2026</td>
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
    </section>
  );
};

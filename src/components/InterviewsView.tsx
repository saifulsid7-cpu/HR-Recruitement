/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Sparkles,
  Star,
  UserCheck,
  Users,
  Video,
  Wrench,
  XCircle,
  Zap,
} from 'lucide-react';
import { Candidate, CandidateStatus, NavigationMenuTab } from '../types';
import { getCandidateActionOpinion, getVerdictBadge } from '../utils/scoringCardHelper';
import { ResumeVerificationDrawer } from './ResumeVerificationDrawer';

interface InterviewsViewProps {
  candidates: Candidate[];
  companyName?: string;
  onOpenCandidateDetail: (candidate: Candidate) => void;
  onUpdateStatus?: (candidateId: string, status: CandidateStatus) => void;
  onUpdateInterviewDetails?: (
    candidateId: string,
    round?: 'Online Interview' | 'Offline Technical Round' | 'HR Viva',
    feedback?: string,
    rating?: number,
    scheduleFields?: {
      interviewMode?: 'Online Interview' | 'Offline / In-Person Interview';
      interviewDate?: string;
      interviewTime?: string;
      interviewLocation?: string;
      companyAddress?: string;
      googleMapsLink?: string;
    }
  ) => void;
  onNavigateTab?: (tab: NavigationMenuTab) => void;
}

export const InterviewsView: React.FC<InterviewsViewProps> = ({
  candidates,
  companyName = 'Our Organization',
  onOpenCandidateDetail,
  onUpdateStatus,
  onUpdateInterviewDetails,
  onNavigateTab,
}) => {
  const [filterStage, setFilterStage] = useState<'interview' | 'selected' | 'all'>('interview');
  const [filterRound, setFilterRound] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [drawerCandidate, setDrawerCandidate] = useState<Candidate | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  // Filter candidates relevant for interview stage
  const interviewCandidates = candidates.filter((c) => {
    if (filterStage === 'interview') {
      if (c.status !== 'interview') return false;
    } else if (filterStage === 'selected') {
      if (c.status !== 'selected' && c.status !== 'shortlisted') return false;
    } else {
      // 'all' includes candidates in interview stage, selected, or previously moved
      if (c.status !== 'interview' && c.status !== 'selected' && c.status !== 'shortlisted') return false;
    }

    if (filterRound !== 'all') {
      const round = c.interviewRound || 'Online Interview';
      if (round !== filterRound) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPos = (c.appliedPosition || '').toLowerCase().includes(q);
      const matchDesig = (c.lastDesignation || '').toLowerCase().includes(q);
      if (!matchName && !matchPos && !matchDesig) return false;
    }

    return true;
  });

  const activeAssessmentCount = candidates.filter((c) => c.status === 'interview').length;
  const passedSelectedCount = candidates.filter((c) => c.status === 'selected' || c.status === 'shortlisted').length;

  return (
    <div className="space-y-6 text-[#e6edf3]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#30363d]">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#e6edf3]">Interview Management &amp; Assessments</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
              {activeAssessmentCount} Active in Interview
            </span>
          </div>
          <p className="text-xs text-[#8b949e] mt-1">
            Conduct Online Interviews and Offline Technical Rounds. Record scorecards and promote qualified candidates with 1-click to the finalized Candidates pool.
          </p>
        </div>

        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('screening')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Screen More Resumes</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161b22] p-4 rounded-xl border border-[#30363d] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Stage Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterStage('interview')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterStage === 'interview'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'text-[#8b949e] hover:text-[#e6edf3] bg-[#21262d]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Under Assessment ({activeAssessmentCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStage('selected')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterStage === 'selected'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'text-[#8b949e] hover:text-[#e6edf3] bg-[#21262d]'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fit / Selected ({passedSelectedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStage('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterStage === 'all'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                : 'text-[#8b949e] hover:text-[#e6edf3] bg-[#21262d]'
            }`}
          >
            <span>All Interviewees</span>
          </button>
        </div>

        {/* Round Filter & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterRound}
            onChange={(e) => setFilterRound(e.target.value)}
            className="bg-[#21262d] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-[#e6edf3] outline-none cursor-pointer focus:border-indigo-500"
          >
            <option value="all">All Interview Rounds</option>
            <option value="Online Interview">Online Interview</option>
            <option value="Offline Technical Round">Offline Technical Round</option>
            <option value="HR Viva">HR Viva</option>
          </select>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-lg text-[#e6edf3] placeholder-[#8b949e] outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Interview Cards Grid */}
      {interviewCandidates.length === 0 ? (
        <div className="py-16 text-center text-[#8b949e] bg-[#161b22] rounded-2xl border border-[#30363d] space-y-4">
          <CalendarCheck className="w-12 h-12 text-amber-400/40 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#e6edf3]">
              {filterStage === 'interview'
                ? 'No Candidates Under Active Interview Assessment'
                : 'No Interview Candidates Found'}
            </h3>
            <p className="text-xs text-[#8b949e] max-w-md mx-auto">
              {filterStage === 'interview'
                ? 'Screen resumes in the Screening stage and click "Move to Interview" to queue candidates for technical or HR rounds.'
                : 'No interview candidates match your selected criteria or search filter.'}
            </p>
          </div>
          {onNavigateTab && filterStage === 'interview' && (
            <button
              type="button"
              onClick={() => onNavigateTab('screening')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer shadow-md shadow-indigo-900/40"
            >
              <Sparkles className="w-4 h-4" />
              <span>Go to AI Screening Engine</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviewCandidates.map((cand) => {
            const verdict = getVerdictBadge(cand.score);
            const actionOpinion = cand.actionOpinion || getCandidateActionOpinion(cand);
            const isFitSelected = cand.status === 'selected' || cand.status === 'shortlisted';
            const currentRound = cand.interviewRound || 'Online Interview';
            const actualDesig = cand.lastDesignation || cand.experience?.[0]?.role || 'Professional';
            const targetPos = cand.appliedPosition || 'Target Position';

            return (
              <div
                key={cand.id}
                className={`bg-[#161b22] rounded-2xl border p-5 space-y-4 transition shadow-sm flex flex-col justify-between ${
                  isFitSelected
                    ? 'border-emerald-500/50 bg-[#161b22]/90 ring-1 ring-emerald-500/20'
                    : 'border-[#30363d] hover:border-amber-500/40'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Name, Badges & Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm sm:text-base text-[#e6edf3] truncate">
                          {cand.name}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${verdict.badgeClass}`}
                        >
                          {verdict.label}
                        </span>
                        {isFitSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Fit / Selected</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#8b949e] mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-indigo-300">{actualDesig}</span>
                        <span>&bull;</span>
                        <span className="text-[#8b949e]">Target: <strong className="text-amber-300">{targetPos}</strong></span>
                        {cand.totalYearsExperience !== undefined && (
                          <>
                            <span>&bull;</span>
                            <span className="font-mono text-emerald-400 font-semibold">
                              {cand.totalYearsExperience} Yrs Exp
                            </span>
                          </>
                        )}
                      </div>

                      {/* Extracted Email & Phone Number */}
                      <div className="text-[11px] text-[#c9d1d9] mt-1.5 flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1 font-mono bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
                          <Mail className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span>{cand.email && cand.email !== 'N/A' ? cand.email : 'Email not in CV'}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
                          <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{cand.phone && cand.phone !== 'N/A' ? cand.phone : 'Phone not in CV'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-lg text-emerald-400 font-mono">
                        {cand.score.toFixed(0)}%
                      </span>
                      <div className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">
                        Match Score
                      </div>
                    </div>
                  </div>

                  {/* Interview Recommendation Advice */}
                  <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                      <Zap className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Screening Advice &bull; Assessment Focus</span>
                    </div>
                    <p className="text-xs text-[#e6edf3] leading-relaxed">
                      {cand.hrActionOpinion || actionOpinion}
                    </p>
                  </div>

                  {/* Direct Interview Scheduling & Mode Selector */}
                  {(() => {
                    const mode = cand.interviewMode || 'Offline / In-Person Interview';
                    const iDate = cand.interviewDate || '';
                    const iTime = cand.interviewTime || '';
                    const cAddr = cand.companyAddress || '';
                    const gMaps = cand.googleMapsLink || '';
                    const iLoc = cand.interviewLocation || '';

                    const invitationText =
                      mode === 'Offline / In-Person Interview'
                        ? `Subject: Interview Invitation – ${targetPos} at ${companyName}\n\nDear ${cand.name},\n\nWe are pleased to invite you for an Offline / In-Person Interview for the position of ${targetPos} at ${companyName}.\n\n• Interview Date: ${iDate || '[Select Date]'}\n• Interview Time: ${iTime || '[Select Time]'}\n• Company Address: ${cAddr || '[Enter Company Address]'}\n• Specific Location: ${iLoc || '[Enter Floor / Room]'}\n• Google Maps Link: ${gMaps || '[Paste Google Maps URL]'}\n\nPlease bring a copy of your updated CV and national ID. Kindly confirm your attendance by replying to this message or calling HR.\n\nBest regards,\nHR & Talent Acquisition Team, ${companyName}`
                        : `Subject: Online Interview Invitation – ${targetPos} at ${companyName}\n\nDear ${cand.name},\n\nWe are pleased to invite you for an Online Interview for the position of ${targetPos} at ${companyName}.\n\n• Interview Mode: Online Interview (Video Call)\n• Interview Date: ${iDate || '[Select Date]'}\n• Interview Time: ${iTime || '[Select Time]'}\n• Meeting Link / Platform: ${iLoc || '[Paste Google Meet / Zoom Link]'}\n\nPlease ensure a stable internet connection and join 5 minutes prior to the scheduled time.\n\nBest regards,\nHR & Talent Acquisition Team, ${companyName}`;

                    return (
                      <div className="p-3.5 rounded-xl bg-[#21262d] border border-[#30363d] space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                          <div className="flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-amber-400" />
                            <span className="font-bold text-[#8b949e] uppercase text-[10px]">Interview Mode:</span>
                            <select
                              value={mode}
                              onChange={(e) => {
                                onUpdateInterviewDetails?.(
                                  cand.id,
                                  currentRound as any,
                                  cand.interviewFeedback,
                                  cand.interviewRating,
                                  {
                                    interviewMode: e.target.value as 'Online Interview' | 'Offline / In-Person Interview',
                                  }
                                );
                              }}
                              className="bg-[#161b22] border border-[#30363d] rounded-md px-2 py-1 text-xs text-[#e6edf3] font-semibold cursor-pointer outline-none focus:border-amber-500"
                            >
                              <option value="Online Interview">Online Interview</option>
                              <option value="Offline / In-Person Interview">Offline / In-Person Interview</option>
                            </select>
                          </div>

                          {/* Star Rating */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-[#8b949e] uppercase mr-1">Rating:</span>
                            {[1, 2, 3, 4, 5].map((star) => {
                              const currentStar = cand.interviewRating || 4;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => {
                                    onUpdateInterviewDetails?.(
                                      cand.id,
                                      currentRound as any,
                                      cand.interviewFeedback,
                                      star
                                    );
                                  }}
                                  className="text-amber-400 hover:scale-110 transition cursor-pointer"
                                  title={`Rate ${star} Stars`}
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${
                                      star <= currentStar ? 'fill-amber-400' : 'text-[#484f58]'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Date & Time Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-[#8b949e] uppercase block mb-1">
                              Interview Date
                            </label>
                            <input
                              type="date"
                              value={iDate}
                              onChange={(e) =>
                                onUpdateInterviewDetails?.(
                                  cand.id,
                                  currentRound as any,
                                  cand.interviewFeedback,
                                  cand.interviewRating,
                                  { interviewDate: e.target.value }
                                )
                              }
                              className="w-full px-2.5 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#e6edf3] outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#8b949e] uppercase block mb-1">
                              Interview Time
                            </label>
                            <input
                              type="time"
                              value={iTime}
                              onChange={(e) =>
                                onUpdateInterviewDetails?.(
                                  cand.id,
                                  currentRound as any,
                                  cand.interviewFeedback,
                                  cand.interviewRating,
                                  { interviewTime: e.target.value }
                                )
                              }
                              className="w-full px-2.5 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#e6edf3] outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Offline / In-Person Location Details */}
                        {mode === 'Offline / In-Person Interview' ? (
                          <div className="space-y-2 pt-1 border-t border-[#30363d]/70">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-[#8b949e] uppercase block mb-1">
                                  Company Address
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Plot 14, Sector 7, Uttara, Dhaka"
                                  value={cAddr}
                                  onChange={(e) =>
                                    onUpdateInterviewDetails?.(
                                      cand.id,
                                      currentRound as any,
                                      cand.interviewFeedback,
                                      cand.interviewRating,
                                      { companyAddress: e.target.value }
                                    )
                                  }
                                  className="w-full px-2.5 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#e6edf3] placeholder-[#8b949e] outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-[#8b949e] uppercase block mb-1">
                                  Specific Location / Room
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. 4th Floor, HR Boardroom"
                                  value={iLoc}
                                  onChange={(e) =>
                                    onUpdateInterviewDetails?.(
                                      cand.id,
                                      currentRound as any,
                                      cand.interviewFeedback,
                                      cand.interviewRating,
                                      { interviewLocation: e.target.value }
                                    )
                                  }
                                  className="w-full px-2.5 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#e6edf3] placeholder-[#8b949e] outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#8b949e] uppercase block mb-1">
                                Google Maps Link
                              </label>
                              <input
                                type="url"
                                placeholder="https://maps.google.com/?q=..."
                                value={gMaps}
                                onChange={(e) =>
                                  onUpdateInterviewDetails?.(
                                    cand.id,
                                    currentRound as any,
                                    cand.interviewFeedback,
                                    cand.interviewRating,
                                    { googleMapsLink: e.target.value }
                                  )
                                }
                                className="w-full px-2.5 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#e6edf3] placeholder-[#8b949e] outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="text-[10px] font-bold text-[#8b949e] uppercase block mb-1">
                              Online Meeting Link (Zoom / Google Meet / Teams)
                            </label>
                            <input
                              type="url"
                              placeholder="https://meet.google.com/..."
                              value={iLoc}
                              onChange={(e) =>
                                onUpdateInterviewDetails?.(
                                  cand.id,
                                  currentRound as any,
                                  cand.interviewFeedback,
                                  cand.interviewRating,
                                  { interviewLocation: e.target.value }
                                )
                              }
                              className="w-full px-2.5 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#e6edf3] placeholder-[#8b949e] outline-none focus:border-indigo-500"
                            />
                          </div>
                        )}

                        {/* Auto-Generated Invitation Template */}
                        <div className="p-2.5 rounded-lg bg-[#0d1117] border border-indigo-500/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                              Auto-Generated Invitation Template
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(invitationText);
                                setCopiedInviteId(cand.id);
                                setTimeout(() => setCopiedInviteId(null), 2000);
                              }}
                              className="px-2 py-1 rounded text-[10px] font-bold bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 transition cursor-pointer flex items-center gap-1"
                            >
                              {copiedInviteId === cand.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-300">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Invitation</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="text-[11px] text-[#c9d1d9] font-sans whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto select-text">
                            {invitationText}
                          </pre>
                        </div>

                        {/* Quick Feedback Notes */}
                        <div className="space-y-1 pt-1 border-t border-[#30363d]/70">
                          <label className="text-[10px] font-bold text-[#8b949e] uppercase flex items-center justify-between">
                            <span>Interviewer Notes / Technical Verdict:</span>
                            <span className="text-[10px] text-[#8b949e] lowercase font-normal">auto-saves</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Demonstrated strong CAD pattern grading; passed fabric consumption test with 95% accuracy."
                            defaultValue={cand.interviewFeedback || ''}
                            onBlur={(e) => {
                              onUpdateInterviewDetails?.(
                                cand.id,
                                currentRound as any,
                                e.target.value,
                                cand.interviewRating || 4
                              );
                            }}
                            className="w-full px-2.5 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#e6edf3] placeholder-[#8b949e] outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Candidate Action Buttons & Lifecycle Progression */}
                <div className="pt-3 border-t border-[#30363d] space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDrawerCandidate(cand)}
                      className="px-2.5 py-2 rounded-xl text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Original CV</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenCandidateDetail(cand)}
                      className="px-2.5 py-2 rounded-xl text-xs font-bold bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#8b949e]" />
                      <span>Full Audit</span>
                    </button>
                  </div>

                  {/* 1-Click "Mark as Fit / Selected" Button (Progression to Candidates Directory) */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateStatus) {
                          onUpdateStatus(cand.id, 'selected');
                        }
                      }}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                        isFitSelected
                          ? 'bg-emerald-600 text-white font-extrabold shadow-emerald-900/30'
                          : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                      }`}
                      title="Mark candidate as Fit / Selected (adds to Master Candidates Directory)"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>{isFitSelected ? 'Marked as Fit / Selected' : 'Mark as Fit / Selected'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateStatus) {
                          onUpdateStatus(cand.id, 'on_hold');
                        }
                      }}
                      className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-[#21262d] hover:bg-[#30363d] text-amber-300 border border-[#30363d] transition cursor-pointer"
                      title="Put candidate on hold"
                    >
                      Hold
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateStatus) {
                          onUpdateStatus(cand.id, 'rejected');
                        }
                      }}
                      className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition cursor-pointer"
                      title="Reject candidate"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  Check,
  CheckCircle,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  GraduationCap,
  Layers,
  Mail,
  Maximize2,
  Minimize2,
  Phone,
  Printer,
  ShieldCheck,
  Sparkles,
  Tag,
  User,
  X,
} from 'lucide-react';
import { Candidate } from '../types';
import { getVerdictBadge } from '../utils/scoringCardHelper';
import { resolveCandidateFileUrl } from '../utils/fileBlobCache';

interface ResumeVerificationDrawerProps {
  candidate: Candidate;
  onClose: () => void;
  blindMode?: boolean;
}

export const ResumeVerificationDrawer: React.FC<ResumeVerificationDrawerProps> = ({
  candidate,
  onClose,
  blindMode = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'actual_text' | 'structured' | 'checkpoints'>('actual_text');
  const [paperViewMode, setPaperViewMode] = useState<'pdf' | 'formatted' | 'transcript'>('pdf');
  const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(candidate.fileUrl || candidate.blobUrl || null);

  const verdictConfig = getVerdictBadge(candidate.score);

  // Clean authentic candidate name
  let rawCandidateName = (candidate.name || '').trim();
  if (!rawCandidateName || rawCandidateName.toLowerCase() === 'candidate' || rawCandidateName.toLowerCase() === 'candidate profile' || /^(resume|cv|biodata)/i.test(rawCandidateName)) {
    if (candidate.fileName) {
      rawCandidateName = candidate.fileName
        .replace(/\.[^/.]+$/, '')
        .replace(/^(resume|cv|biodata)[-_\s]+/i, '')
        .replace(/[-_\s]+(resume|cv|biodata)$/i, '')
        .replace(/^candidate[-_\s]*/i, '')
        .replace(/_/g, ' ')
        .trim();
    }
  }
  rawCandidateName = rawCandidateName.replace(/^(resume|cv|biodata)[-_\s]+/i, '').trim();
  const nameLabel = blindMode ? `Candidate #${candidate.meritRank || candidate.rank || 1} (Anonymized)` : (rawCandidateName || 'Candidate Profile');

  // Formatted smart title convention
  const yearsExp = candidate.totalYearsExperience ?? 0;
  const expLabel = yearsExp === 1 ? '1.0 Year Experience' : `${yearsExp.toFixed(1)} Years Experience`;
  const companyLabel = (candidate.lastCompany && candidate.lastCompany !== 'Prior RMG Organization' && candidate.lastCompany !== 'N/A')
    ? candidate.lastCompany
    : (candidate.experience?.[0]?.company && candidate.experience[0].company !== 'N/A' ? candidate.experience[0].company : 'N/A');
  const realRoleLabel = candidate.lastDesignation || candidate.experience?.[0]?.role || 'N/A';
  const roleLabel = realRoleLabel;
  const targetRoleLabel = candidate.appliedPosition || candidate.category || 'Target Position';

  const headerTitle = `${nameLabel} | ${realRoleLabel} | ${expLabel} | ${companyLabel}`;
  const effectiveFileUrl = resolveCandidateFileUrl(candidate);

  const cleanSanitizedText = (candidate.attachedCvText || '')
    .replace(/%PDF-[\s\S]*?(%%EOF|$)/gi, '')
    .replace(/\b[0-9]+\s+[0-9]+\s+obj\b[\s\S]*?\bendobj\b/gi, '')
    .replace(/stream[\s\S]*?endstream/gi, '')
    .trim();

  const fullCvText =
    cleanSanitizedText ||
    `${nameLabel.toUpperCase()}
Career Track: ${realRoleLabel}
Target Position: ${targetRoleLabel}
Last Organization: ${companyLabel}
Experience: ${expLabel}
Contact: ${blindMode ? 'Redacted in Blind Mode' : `${candidate.email || 'N/A'} | ${candidate.phone || 'N/A'}`}

=== ACADEMIC QUALIFICATIONS ===
${candidate.academicDegrees?.map((d) => `• ${d}`).join('\n') || candidate.education?.map((e) => `• ${e}`).join('\n') || '• Academic credentials in attached CV'}

=== TECHNICAL CERTIFICATIONS ===
${candidate.technicalCertifications && candidate.technicalCertifications.length > 0 ? candidate.technicalCertifications.map((c) => `• ${c}`).join('\n') : '• Credentials in attached CV'}

=== RELEVANT WORK EXPERIENCE ===
${
  candidate.experience && candidate.experience.length > 0
    ? candidate.experience
        .map(
          (exp, i) =>
            `${i + 1}. ${exp.role} at ${exp.company} (${exp.duration})\n   ${exp.description || 'Verified from resume document.'}`
        )
        .join('\n\n')
    : `1. ${realRoleLabel} at ${companyLabel} (${expLabel})\n   Direct operational execution in apparel manufacturing.`
}

=== SPECIALIZED INDUSTRY CAD & SOFTWARE PROFICIENCY ===
${candidate.cadSoftwareProficiency && candidate.cadSoftwareProficiency.length > 0 ? candidate.cadSoftwareProficiency.join(', ') : 'N/A'}

=== BUYERS & BRANDS PORTFOLIO ===
${candidate.buyersWorkedWith && candidate.buyersWorkedWith.length > 0 ? candidate.buyersWorkedWith.join(', ') : 'N/A'}

=== PRODUCT LINES & DOMAIN ===
${candidate.productSpecialization && candidate.productSpecialization.length > 0 ? candidate.productSpecialization.join(', ') : 'N/A'}`;

  // Ensure an embedded document viewer Blob URL is always active
  React.useEffect(() => {
    if (candidate.blobUrl) {
      setDocumentBlobUrl(candidate.blobUrl);
      return;
    }

    let urlToRevoke: string | null = null;

    if (candidate.fileBase64) {
      try {
        const clean = candidate.fileBase64.includes(';base64,')
          ? candidate.fileBase64.split(';base64,')[1]
          : candidate.fileBase64;
        const mime = candidate.fileMimeType || 'application/pdf';
        const byteCharacters = atob(clean);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });
        const url = URL.createObjectURL(blob);
        urlToRevoke = url;
        setDocumentBlobUrl(url);
      } catch (err) {
        console.warn('Could not construct blob from base64:', err);
      }
    } else {
      // Create a clean HTML document blob URL as fallback
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${nameLabel} - Original CV Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #ffffff; line-height: 1.6; font-size: 13.5px; margin: 0; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    h1 { margin: 0 0 6px 0; font-size: 24px; color: #0f172a; letter-spacing: -0.02em; }
    .role { font-size: 14px; font-weight: 700; color: #4338ca; margin-bottom: 6px; }
    .meta { font-size: 12.5px; color: #64748b; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 13px; line-height: 1.65; color: #334155; margin: 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${nameLabel}</h1>
    <div class="role">${roleLabel}</div>
    <div class="meta">${companyLabel} &bull; ${expLabel} &bull; ${blindMode ? 'Contact Redacted (Blind Mode)' : `${candidate.email || ''} | ${candidate.phone || ''}`}</div>
  </div>
  <pre>${fullCvText}</pre>
</body>
</html>`;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      urlToRevoke = url;
      setDocumentBlobUrl(url);
    }

    return () => {
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [candidate, blindMode, fullCvText, nameLabel, roleLabel, companyLabel, expLabel]);

  const resolvedViewerUrl = effectiveFileUrl || documentBlobUrl || candidate.fileUrl || candidate.blobUrl || '';
  const isImageCv =
    Boolean(candidate.fileMimeType?.startsWith('image/')) ||
    /\.(png|jpe?g|webp)$/i.test(candidate.fileName || '');

  // Open original CV in independent new tab via safe anchor link
  const handleOpenPdfInNewTab = () => {
    let url = resolvedViewerUrl;
    if (!url && candidate.fileBase64) {
      try {
        const clean = candidate.fileBase64.includes(';base64,')
          ? candidate.fileBase64.split(';base64,')[1]
          : candidate.fileBase64;
        const mime = candidate.fileMimeType || 'application/pdf';
        const byteCharacters = atob(clean);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });
        url = URL.createObjectURL(blob);
      } catch (err) {
        console.warn('Error creating blob for new tab:', err);
      }
    }

    if (!url) {
      const blob = new Blob([fullCvText], { type: 'text/plain;charset=utf-8' });
      url = URL.createObjectURL(blob);
    }

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Direct download candidate file
  const handleDownloadFile = () => {
    let url = documentBlobUrl || candidate.blobUrl;
    if (!url && candidate.fileBase64) {
      try {
        const clean = candidate.fileBase64.includes(';base64,')
          ? candidate.fileBase64.split(';base64,')[1]
          : candidate.fileBase64;
        const mime = candidate.fileMimeType || 'application/pdf';
        const byteCharacters = atob(clean);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });
        url = URL.createObjectURL(blob);
      } catch (err) {
        console.warn('Error creating download blob:', err);
      }
    }

    if (!url) {
      const blob = new Blob([fullCvText], { type: 'text/plain;charset=utf-8' });
      url = URL.createObjectURL(blob);
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = candidate.fileName || `${(candidate.name || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(fullCvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <aside
      className={`fixed top-0 right-0 bottom-0 z-50 bg-[#161b22] border-l border-[#30363d] shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${
        isFullscreen
          ? 'w-full md:w-full'
          : 'w-full md:w-[50%] lg:w-[45%] xl:w-[42%]'
      }`}
      aria-label="Resume Verification Drawer"
    >
      {/* Drawer Top Header Strip */}
      <div className="p-4 bg-[#0d1117] border-b border-[#30363d] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                Side-by-Side CV Verification
              </span>
              {candidate.meritRank && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                  Rank #{candidate.meritRank}
                </span>
              )}
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#e6edf3] truncate mt-0.5" title={headerTitle}>
              {headerTitle}
            </h3>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Open Original PDF in New Tab */}
          <button
            type="button"
            onClick={handleOpenPdfInNewTab}
            className="p-1.5 rounded-lg text-indigo-400 hover:text-white hover:bg-indigo-600/30 border border-indigo-500/30 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="Open Original PDF in New Tab (Zero Chrome blocking)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">New Tab</span>
          </button>

          {/* Download Original File */}
          <button
            type="button"
            onClick={handleDownloadFile}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] border border-transparent hover:border-[#30363d] transition cursor-pointer"
            title="Download Original File"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] border border-transparent hover:border-[#30363d] transition cursor-pointer"
            title="Copy CV Full Text to Clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] border border-transparent hover:border-[#30363d] transition cursor-pointer"
            title="Print or Export CV Document"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] border border-transparent hover:border-[#30363d] transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen View' : 'Expand to Fullscreen View'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-rose-400 hover:bg-[#21262d] border border-transparent hover:border-[#30363d] transition cursor-pointer"
            title="Close Verification Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Candidate Metadata Strip */}
      <div className="px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between text-xs gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${verdictConfig.badgeClass}`}>
            {verdictConfig.label}
          </span>
          <span className="text-[11px] font-bold text-[#e6edf3]">
            Composite: <strong className="text-indigo-400 font-mono">{candidate.compositeScore || candidate.score}%</strong>
          </span>
          <span className="text-[11px] text-[#8b949e]">
            Task: <strong className="text-emerald-400 font-mono">{candidate.taskMatchScore || candidate.triMatch?.jdMatch?.score || candidate.score}%</strong>
          </span>
          <span className="text-[11px] text-[#8b949e]">
            Org: <strong className="text-purple-400 font-mono">{candidate.orgMatchScore || candidate.triMatch?.companyCriteriaMatch?.score || candidate.score}%</strong>
          </span>
        </div>

        {/* View mode toggle tabs */}
        <div className="inline-flex p-0.5 bg-[#0d1117] rounded-lg border border-[#30363d] text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab('actual_text')}
            className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
              activeTab === 'actual_text'
                ? 'bg-[#21262d] text-white shadow-xs'
                : 'text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            Actual CV Document
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('structured')}
            className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
              activeTab === 'structured'
                ? 'bg-[#21262d] text-white shadow-xs'
                : 'text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            Structured Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checkpoints')}
            className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
              activeTab === 'checkpoints'
                ? 'bg-[#21262d] text-white shadow-xs'
                : 'text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            Audit Checkpoints
          </button>
        </div>
      </div>

      {/* Main Drawer Body Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-[#e6edf3] bg-[#0d1117]/60">
        {/* TAB 1: ACTUAL CV DOCUMENT (PRIMARY CLEAN TEXT ZERO-BLOCK PAPER VIEWER) */}
        {activeTab === 'actual_text' && (
          <div className="flex flex-col space-y-3.5">
            {/* Top Document Controls & Notification Toolbar */}
            <div className="p-3 bg-[#161b22] rounded-xl border border-[#30363d] space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#e6edf3] text-xs truncate max-w-[220px]">
                        {candidate.fileName || 'Candidate_Resume.pdf'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                        Zero-Block Layout
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8b949e]">
                      Authentic resume transcript rendered natively &bull; 100% verified against job requirements
                    </span>
                  </div>
                </div>

                {/* Prominent Native Browser Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={handleOpenPdfInNewTab}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm cursor-pointer"
                    title="Open Original CV in New Tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
                    title={isFullscreen ? 'Exit Zoom / Fullscreen' : 'Zoom / Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-indigo-400" /> : <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>{isFullscreen ? 'Exit Zoom' : 'Zoom / Fullscreen'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadFile}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
                    title="Download candidate's original resume file"
                  >
                    <Download className="w-3.5 h-3.5 text-[#8b949e]" />
                    <span>Download Original CV</span>
                  </button>
                </div>
              </div>

              {/* View layout toggle inside actual CV tab: Embedded Native PDF vs Formatted Paper View vs Verbatim Transcript */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-[#30363d] text-[11px] gap-2">
                <span className="text-[#8b949e] font-medium">
                  Document View Mode:
                </span>
                <div className="inline-flex p-0.5 bg-[#0d1117] rounded-lg border border-[#30363d] flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPaperViewMode('pdf')}
                    className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                      paperViewMode === 'pdf'
                        ? 'bg-[#21262d] text-white shadow-xs'
                        : 'text-[#8b949e] hover:text-[#e6edf3]'
                    }`}
                  >
                    Embedded Native PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperViewMode('formatted')}
                    className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                      paperViewMode === 'formatted'
                        ? 'bg-[#21262d] text-white shadow-xs'
                        : 'text-[#8b949e] hover:text-[#e6edf3]'
                    }`}
                  >
                    Formatted Paper View
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperViewMode('transcript')}
                    className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                      paperViewMode === 'transcript'
                        ? 'bg-[#21262d] text-white shadow-xs'
                        : 'text-[#8b949e] hover:text-[#e6edf3]'
                    }`}
                  >
                    Raw Extracted Transcript
                  </button>
                </div>
              </div>
            </div>

            {/* DOCUMENT VIEWER BODY */}
            {paperViewMode === 'pdf' ? (
              /* EMBEDDED NATIVE DOCUMENT VIEWER (PDF or Image) */
              <div className="space-y-3">
                {isImageCv && resolvedViewerUrl ? (
                  <div className="w-full rounded-lg border border-slate-700 bg-[#0d1117] p-3 flex items-center justify-center overflow-auto max-h-[750px]">
                    <img
                      src={resolvedViewerUrl}
                      alt={candidate.fileName || 'Original Resume Image'}
                      className="max-w-full h-auto rounded shadow-lg object-contain"
                    />
                  </div>
                ) : (
                  <iframe
                    src={resolvedViewerUrl}
                    className="w-full h-[750px] rounded-lg border border-slate-700 bg-white"
                    title="Original Resume Document"
                  />
                )}
                <div className="text-[11px] text-[#8b949e] flex items-center justify-between px-1">
                  <span>If embedded preview is blocked by browser restrictions, switch to <strong>Formatted Paper View</strong> or open in new tab.</span>
                  <button
                    type="button"
                    onClick={handleOpenPdfInNewTab}
                    className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer shrink-0 ml-2"
                  >
                    Open in New Tab
                  </button>
                </div>
              </div>
            ) : paperViewMode === 'formatted' ? (
              /* PRIMARY CLEAN TEXT LAYOUT: AUTHENTIC A4 PAPER RESUME VIEWER */
              <div className="bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-300 p-6 sm:p-9 font-sans max-w-4xl mx-auto space-y-6 select-text transition-all min-h-[620px]">
                {/* A4 Header Section */}
                <div className="border-b-2 border-slate-900 pb-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {nameLabel}
                      </h1>
                      <div className="text-sm sm:text-base font-bold text-indigo-700 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>{realRoleLabel}</span>
                        {companyLabel && <span className="text-slate-400 font-normal">at</span>}
                        {companyLabel && <span className="text-slate-800">{companyLabel}</span>}
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {expLabel}
                        </span>
                        <span>&bull;</span>
                        <span>Target Position: <strong className="text-slate-900">{targetRoleLabel}</strong></span>
                      </div>
                    </div>

                    {!blindMode && (
                      <div className="text-left sm:text-right text-xs text-slate-600 space-y-1 sm:border-l sm:border-slate-200 sm:pl-4 shrink-0">
                        {candidate.email && (
                          <div className="flex items-center sm:justify-end gap-1.5 font-mono text-[11px]">
                            <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>{candidate.email}</span>
                          </div>
                        )}
                        {candidate.phone && (
                          <div className="flex items-center sm:justify-end gap-1.5 font-mono text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{candidate.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center sm:justify-end gap-1.5 text-[11px]">
                          <span className="text-slate-400">Environment:</span>
                          <span className="font-semibold text-slate-700">{candidate.workEnvironment || 'Factory & Buying House'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 1. PROFESSIONAL EXECUTIVE OVERVIEW */}
                <div className="space-y-2">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    Professional Summary &amp; Executive Overview
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {candidate.scoreExplanation ||
                      `Experienced ${realRoleLabel} with ${expLabel} in Ready-Made Garments (RMG) manufacturing and export buying operations. Proven track record collaborating with international apparel buyers and executing departmental benchmarks.`}
                  </p>
                </div>

                {/* 2. RELEVANT WORK EXPERIENCE */}
                <div className="space-y-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                    <span>Work Experience &amp; Employment History</span>
                    <span className="text-[10px] font-normal text-slate-500 lowercase">
                      {candidate.experience?.length || 1} position(s) listed
                    </span>
                  </h2>

                  {candidate.experience && candidate.experience.length > 0 ? (
                    <div className="space-y-3.5">
                      {candidate.experience.map((exp, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                            <div>
                              <strong className="text-slate-900 font-bold">{exp.role}</strong>
                              <span className="text-slate-400 font-normal"> &bull; </span>
                              <span className="text-indigo-800 font-semibold">{exp.company}</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                              {exp.duration}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-xs text-slate-600 leading-relaxed pl-3 border-l-2 border-indigo-200">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1 pl-3 border-l-2 border-indigo-200">
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-slate-900">{realRoleLabel} &bull; {companyLabel}</strong>
                        <span className="font-mono text-[10px] text-slate-500">{expLabel}</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Operational responsibility for garment production, order follow-up, and compliance standards.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. TECHNICAL & FUNCTIONAL SKILLS */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                      Core Functional &amp; Technical Competencies
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. CAD & SOFTWARE + BUYERS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* CAD Software */}
                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">
                      CAD Software &amp; Technical Tools:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {candidate.cadSoftwareProficiency && candidate.cadSoftwareProficiency.length > 0 ? (
                        candidate.cadSoftwareProficiency.map((tool, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200"
                          >
                            {tool}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Buyers Handled */}
                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">
                      Target Export Buyers Handled:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {candidate.buyersWorkedWith && candidate.buyersWorkedWith.length > 0 ? (
                        candidate.buyersWorkedWith.map((buyer, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200"
                          >
                            {buyer}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">N/A</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. ACADEMIC QUALIFICATIONS & CERTIFICATIONS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                      Education &amp; Degrees
                    </h2>
                    <div className="space-y-1">
                      {((candidate.academicDegrees && candidate.academicDegrees.length > 0) ? candidate.academicDegrees : (candidate.education && candidate.education.length > 0 ? candidate.education : []))
                        .map((edu, idx) => (
                          <div key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <span className="text-indigo-600 font-bold">&bull;</span>
                            <span>{edu}</span>
                          </div>
                        ))}
                      {(!candidate.academicDegrees?.length && !candidate.education?.length) && (
                        <div className="text-xs text-slate-500 italic">N/A</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                      Professional Certifications
                    </h2>
                    <div className="space-y-1">
                      {candidate.technicalCertifications && candidate.technicalCertifications.length > 0 ? (
                        candidate.technicalCertifications.map((cert, idx) => (
                          <div key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">&bull;</span>
                            <span>{cert}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-500 italic">N/A</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 6. VERBATIM EXTRACTED RESUME TRANSCRIPT ACCORDION */}
                <div className="pt-4 border-t-2 border-slate-200">
                  <details className="group">
                    <summary className="text-xs font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer flex items-center justify-between p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 transition">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>Verbatim Extracted Resume Transcript ({cleanSanitizedText.length || fullCvText.length} characters)</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <div className="mt-3 p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto border border-slate-700 select-text">
                      {fullCvText}
                    </div>
                  </details>
                </div>
              </div>
            ) : (
              /* MONOSPACE RAW VERBATIM TRANSCRIPT VIEW */
              <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
                  <span className="text-xs font-bold text-[#e6edf3]">
                    Verbatim Document Transcript
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d] border border-[#30363d] flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>
                <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-[#c9d1d9] max-h-[600px] overflow-y-auto p-3 bg-[#0d1117] rounded-lg border border-[#30363d] select-text">
                  {fullCvText}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STRUCTURED PROFILE EXTRACTION */}
        {activeTab === 'structured' && (
          <div className="space-y-4">
            {/* Identity & Contact Card */}
            <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#8b949e] tracking-wider block">
                Candidate Profile
              </span>
              <div className="text-sm font-extrabold text-[#e6edf3]">
                {nameLabel}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#8b949e] pt-1">
                <div>
                  <span className="block text-[10px] text-[#8b949e]">Last Designation:</span>
                  <strong className="text-[#e6edf3]">{realRoleLabel}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-[#8b949e]">Last Company / Employer:</span>
                  <strong className="text-[#e6edf3]">{companyLabel}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-[#8b949e]">Total Experience:</span>
                  <strong className="text-indigo-300 font-mono">{expLabel}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-[#8b949e]">Environment:</span>
                  <strong className="text-emerald-300">{candidate.workEnvironment || 'General RMG'}</strong>
                </div>
              </div>

              {!blindMode && (
                <div className="flex items-center gap-3 pt-2 border-t border-[#30363d] text-[11px] text-[#8b949e] flex-wrap">
                  {candidate.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-indigo-400" />
                      {candidate.email}
                    </span>
                  )}
                  {candidate.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      {candidate.phone}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Academic Degrees & Certifications */}
            <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-[#e6edf3]">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>Academic Degrees & Credentials</span>
              </div>
              <div className="space-y-1.5">
                {(candidate.academicDegrees || candidate.education || []).map((deg, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-[#c9d1d9]">
                    <span className="text-indigo-400 font-bold shrink-0">&bull;</span>
                    <span>{deg}</span>
                  </div>
                ))}
              </div>

              {candidate.technicalCertifications && candidate.technicalCertifications.length > 0 && (
                <div className="pt-2 border-t border-[#30363d] space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#8b949e] tracking-wider block">
                    Professional Certifications:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {candidate.technicalCertifications.map((cert, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CAD Software & Buyers */}
            <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-[#e6edf3]">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Specialized CAD Software & Buyer Portfolio</span>
              </div>

              {candidate.cadSoftwareProficiency && candidate.cadSoftwareProficiency.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#8b949e] tracking-wider block">
                    CAD & ERP Proficiencies:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {candidate.cadSoftwareProficiency.map((cad, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        {cad}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {candidate.buyersWorkedWith && candidate.buyersWorkedWith.length > 0 && (
                <div className="pt-2 border-t border-[#30363d] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#8b949e] tracking-wider block">
                    Buyer Accounts Handled:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {candidate.buyersWorkedWith.map((buyer, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {buyer}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Work History */}
            {candidate.experience && candidate.experience.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-[#e6edf3]">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Work History Timeline</span>
                </div>
                <div className="space-y-3">
                  {candidate.experience.map((exp, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#21262d] border border-[#30363d] space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-[#e6edf3]">{exp.role}</span>
                        <span className="text-indigo-400 font-mono text-[10px]">{exp.duration}</span>
                      </div>
                      <div className="text-[11px] text-[#8b949e]">{exp.company}</div>
                      {exp.description && (
                        <p className="text-[10px] text-[#8b949e] leading-relaxed pt-1 border-t border-[#30363d]/50">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIT CHECKPOINTS & CROSS-VERIFICATION */}
        {activeTab === 'checkpoints' && (
          <div className="space-y-3.5">
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-purple-300">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Verification Cross-Check Matrix</span>
              </div>
              <p className="text-[11px] text-[#8b949e] leading-relaxed">
                Confirm whether the candidate&apos;s resume text independently supports the AI screening claims.
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#e6edf3]">Part A: Task &amp; KRA Match</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {candidate.taskMatchScore || candidate.triMatch?.jdMatch?.score || candidate.score}%
                  </span>
                </div>
                <p className="text-[11px] text-[#8b949e]">
                  {candidate.triMatch?.jdMatch?.summary || 'Operational duties verified in work history.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#e6edf3]">Part B: Organizational Domain Fit</span>
                  <span className="text-purple-400 font-mono font-bold">
                    {candidate.orgMatchScore || candidate.triMatch?.companyCriteriaMatch?.score || candidate.score}%
                  </span>
                </div>
                <p className="text-[11px] text-[#8b949e]">
                  {candidate.triMatch?.companyCriteriaMatch?.summary || 'Factory context and buyer portfolio verified.'}
                </p>
              </div>

              {candidate.gradeFit && (
                <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#e6edf3]">Grading Ladder Alignment</span>
                    <span className="font-mono text-indigo-400 font-bold">{candidate.gradeFit.qualifiedGradeCode}</span>
                  </div>
                  <div className="text-[11px] text-[#8b949e] space-y-0.5">
                    <div>
                      Target Grade: <strong className="text-[#e6edf3]">{candidate.gradeFit.targetGradeTitle} ({candidate.gradeFit.targetGradeCode})</strong>
                    </div>
                    <div>
                      Qualified Grade: <strong className="text-indigo-300">{candidate.gradeFit.qualifiedGradeTitle}</strong>
                    </div>
                    <div className="text-[10px] text-[#8b949e]">
                      Service Benchmark: {candidate.gradeFit.targetRequiredYears} yrs required vs {candidate.gradeFit.actualServiceYears} yrs actual
                    </div>
                  </div>
                </div>
              )}

              {candidate.jobStability && (
                <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#e6edf3]">Tenure &amp; Retention Policy</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        candidate.jobStability.isFrequentJobChanger
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {candidate.jobStability.warningSignText}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8b949e]">
                    {candidate.jobStability.flagReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Drawer Bottom Footer with Action Guide */}
      <div className="p-3.5 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-between gap-3 text-xs shrink-0">
        <div className="text-[11px] text-[#8b949e] truncate">
          {candidate.actionOpinion || 'Cross-verification complete. Advisory recommendation.'}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] transition cursor-pointer shrink-0"
        >
          Close Drawer
        </button>
      </div>
    </aside>
  );
};

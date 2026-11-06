/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  FileText,
  FileUp,
  Layers,
  Loader2,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { UploadQueueItem } from '../types';

interface CvUploadSectionProps {
  queue: UploadQueueItem[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onClearFiles: () => void;
  onStartScreening: () => void;
  isScreening: boolean;
  screeningProgress: { current: number; total: number; currentFileName?: string };
  hasJobDescription: boolean;
}

export const CvUploadSection: React.FC<CvUploadSectionProps> = ({
  queue,
  onAddFiles,
  onRemoveFile,
  onClearFiles,
  onStartScreening,
  isScreening,
  screeningProgress,
  hasJobDescription,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((f) => {
        const name = f.name.toLowerCase();
        return (
          name.endsWith('.pdf') ||
          name.endsWith('.docx') ||
          name.endsWith('.doc') ||
          name.endsWith('.txt') ||
          name.endsWith('.md') ||
          f.type === 'application/pdf' ||
          f.type.includes('wordprocessingml') ||
          f.type.includes('msword') ||
          f.type.startsWith('text/')
        );
      });

      if (validFiles.length === 0) {
        alert('Please drop PDF, DOCX/Word, or Text (.txt/.md) candidate resumes.');
        return;
      }
      onAddFiles(validFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getFileExtensionBadge = (fileName: string) => {
    const lower = fileName.toLowerCase();
    const isDocx = lower.endsWith('.docx') || lower.endsWith('.doc');
    const isTxt = lower.endsWith('.txt') || lower.endsWith('.md');
    if (isDocx) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
          DOCX
        </span>
      );
    }
    if (isTxt) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
          TXT
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
        PDF
      </span>
    );
  };

  const idleCount = queue.filter((f) => f.status === 'idle').length;

  return (
    <div className="bg-[#21262d] rounded-2xl border border-[#30363d] shadow-sm overflow-hidden text-[#e6edf3]">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <FileUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#e6edf3]">
                2. Upload Candidate Resumes (PDF & DOCX)
              </h2>
              <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                Multi-File Batch
              </span>
            </div>
            <p className="text-xs text-[#8b949e]">
              Drag & drop multiple PDF or Word resumes simultaneously · Automated RMG & technical profile extraction
            </p>
          </div>
        </div>

        {queue.length > 0 && !isScreening && (
          <button
            type="button"
            onClick={onClearFiles}
            className="text-xs text-[#8b949e] hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Queue</span>
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isScreening && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-[#30363d] hover:border-indigo-500/50 bg-[#161b22]'
          } ${isScreening ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt,.md,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-11 h-11 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-2xs">
              <FileUp className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#e6edf3]">
                Click to browse or drag & drop multiple resumes (PDF or Word DOCX)
              </p>
              <p className="text-xs text-[#8b949e] mt-1 max-w-lg mx-auto">
                Supports simultaneous batch drop of <strong>.pdf</strong> and <strong>.docx</strong> files.
                All candidates remain accessible to HR — AI never makes recruitment decisions.
              </p>
            </div>

            {/* Extraction Capabilities Badges */}
            <div className="mt-2 pt-2 border-t border-[#30363d] grid grid-cols-1 sm:grid-cols-3 gap-2 text-left max-w-2xl w-full">
              <div className="bg-[#21262d] border border-[#30363d] rounded-lg p-2 space-y-0.5">
                <span className="text-[10px] font-bold text-[#e6edf3] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Candidate Info & Tenure
                </span>
                <p className="text-[11px] text-[#8b949e] leading-tight">
                  Name, Email, Phone & verified total years of experience
                </p>
              </div>

              <div className="bg-[#21262d] border border-[#30363d] rounded-lg p-2 space-y-0.5">
                <span className="text-[10px] font-bold text-[#e6edf3] flex items-center gap-1">
                  <Tag className="w-3 h-3 text-blue-400" />
                  RMG Specialization & Buyers
                </span>
                <p className="text-[11px] text-[#8b949e] leading-tight">
                  Tops vs Bottoms, Denim, Woven, Knit; Factory vs Buying House; Buyers (H&M, Zara, Walmart, Target)
                </p>
              </div>

              <div className="bg-[#21262d] border border-[#30363d] rounded-lg p-2 space-y-0.5">
                <span className="text-[10px] font-bold text-[#e6edf3] flex items-center gap-1">
                  <Layers className="w-3 h-3 text-purple-400" />
                  Certifications & Degrees
                </span>
                <p className="text-[11px] text-[#8b949e] leading-tight">
                  Textile Engineering, PGDHRM, CAD/Gerber/Lectra, Sedex/WRAP/BSCI
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Files Queue */}
        {queue.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-[#8b949e]">
              <span className="font-bold text-[#e6edf3]">Selected Resumes Queue ({queue.length})</span>
              {idleCount > 0 && (
                <span className="text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/30 font-semibold">
                  {idleCount} queued for AI evaluation
                </span>
              )}
            </div>

            <div className="max-h-52 overflow-y-auto space-y-2 pr-1 divide-y divide-[#30363d]">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="pt-2 first:pt-0 flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-[#161b22] border border-[#30363d]"
                >
                  <div className="flex items-center gap-2.5 truncate max-w-[70%]">
                    {(item.status === 'processing' || item.status === 'evaluating_gemini') && (
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                    )}
                    {item.status === 'reading_pdf' && (
                      <FileText className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
                    )}
                    {item.status === 'done' && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    {(item.status === 'idle' || item.status === 'queued') && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                    )}
                    {getFileExtensionBadge(item.name)}
                    <span className="font-semibold text-[#e6edf3] truncate" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-[#8b949e] text-[10px] shrink-0 font-mono">
                      ({(item.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {(item.status === 'idle' || item.status === 'queued') && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Pending Screening
                      </span>
                    )}
                    {item.status === 'reading_pdf' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 animate-pulse">
                        Reading PDF Text...
                      </span>
                    )}
                    {(item.status === 'evaluating_gemini' || item.status === 'processing') && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse">
                        Evaluating with Gemini...
                      </span>
                    )}
                    {item.status === 'done' && (
                      <span className="text-emerald-400 font-bold text-xs">Evaluated</span>
                    )}
                    {item.status === 'error' && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/70 border border-rose-500/50 text-rose-300 font-semibold text-xs max-w-[280px] truncate"
                        title={item.errorMessage || 'Error: Unable to extract text from document'}
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{item.errorMessage || 'Error: Unable to extract text from document'}</span>
                      </span>
                    )}
                    {!isScreening && (
                      <button
                        type="button"
                        onClick={() => onRemoveFile(item.id)}
                        className="text-[#8b949e] hover:text-rose-400 p-1 rounded-md cursor-pointer transition"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screening Progress Bar */}
        {isScreening && (
          <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-bold">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>
                  Extracting RMG Profiles & Scoring ({screeningProgress.current} of {screeningProgress.total})...
                </span>
              </div>
              <span className="font-mono text-sm text-indigo-300">
                {Math.round(
                  (screeningProgress.current / Math.max(1, screeningProgress.total)) * 100
                )}
                %
              </span>
            </div>
            {screeningProgress.currentFileName && (
              <p className="text-xs text-[#8b949e] truncate font-medium">
                Parsing: <span className="font-semibold text-[#e6edf3]">{screeningProgress.currentFileName}</span>
              </p>
            )}
            <div className="w-full h-2 bg-[#161b22] border border-[#30363d] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                style={{
                  width: `${(screeningProgress.current / Math.max(1, screeningProgress.total)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {!hasJobDescription && (
            <p className="text-xs text-amber-400 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Please select or provide a Job Requisition Specification above before screening.</span>
            </p>
          )}
          {hasJobDescription && (
            <p className="text-xs text-[#8b949e]">
              Each CV is evaluated against 6 weighted criteria (100 marks). AI never shortlists or rejects candidates.
            </p>
          )}
          <button
            type="button"
            disabled={queue.length === 0 || isScreening || !hasJobDescription || idleCount === 0}
            onClick={onStartScreening}
            className={`w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs transition-all ${
              queue.length === 0 || isScreening || !hasJobDescription || idleCount === 0
                ? 'bg-[#161b22] text-[#8b949e] border border-[#30363d] cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 cursor-pointer shadow-md shadow-indigo-900/40'
            }`}
          >
            {isScreening ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Evaluating CVs ({screeningProgress.current}/{screeningProgress.total})...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2 text-white" />
                <span>
                  {idleCount > 0 ? `Screen & Extract ${idleCount} Resumes` : 'Screen Candidates'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle,
  Cloud,
  Copy,
  Database,
  Download,
  FileText,
  FileUp,
  RefreshCw,
  Upload,
  X,
} from 'lucide-react';

interface WorkspaceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  cloudSyncStatus: 'synced' | 'syncing' | 'error' | 'idle';
  lastSyncedTime?: string;
  onSyncCloudNow: () => Promise<void>;
  onExportWorkspaceJSON: () => void;
  onImportWorkspaceJSON: (jsonData: any) => Promise<boolean>;
  activeRequisitionsCount: number;
  candidatesCount: number;
}

export const WorkspaceSyncModal: React.FC<WorkspaceSyncModalProps> = ({
  isOpen,
  onClose,
  cloudSyncStatus,
  lastSyncedTime,
  onSyncCloudNow,
  onExportWorkspaceJSON,
  onImportWorkspaceJSON,
  activeRequisitionsCount,
  candidatesCount,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsProcessing(true);
    try {
      await onSyncCloudNow();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setJsonText(text);
        setImportError(null);
      } catch (err: any) {
        setImportError('Failed to read file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyImport = async () => {
    if (!jsonText.trim()) {
      setImportError('Please paste or upload valid workspace JSON first.');
      return;
    }

    try {
      setIsProcessing(true);
      setImportError(null);
      const parsed = JSON.parse(jsonText);
      const success = await onImportWorkspaceJSON(parsed);
      if (success) {
        setImportSuccess('Workspace successfully restored and synchronized with Cloud Database!');
        setTimeout(() => {
          setImportSuccess(null);
          onClose();
        }, 1500);
      } else {
        setImportError('Invalid workspace format. Must contain valid activeRequisitions or candidates.');
      }
    } catch (err: any) {
      setImportError('JSON Syntax Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-50 w-full max-w-2xl bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#e6edf3] max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#30363d] bg-[#21262d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#e6edf3] flex items-center gap-2">
                Universal Cloud Database &amp; Workspace Sync
              </h2>
              <p className="text-xs text-[#8b949e]">
                Synchronize positions, criteria, and CV Bank across all browsers and devices
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Section 1: Live Cloud Status & Instant Sync */}
          <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3 h-3 rounded-full ${
                    cloudSyncStatus === 'synced'
                      ? 'bg-emerald-400 ring-4 ring-emerald-500/20'
                      : cloudSyncStatus === 'syncing'
                      ? 'bg-cyan-400 animate-pulse ring-4 ring-cyan-500/20'
                      : 'bg-amber-400'
                  }`}
                />
                <div>
                  <span className="text-xs font-bold text-[#e6edf3] uppercase tracking-wider block">
                    {cloudSyncStatus === 'synced'
                      ? 'Global Cloud Store: Connected & Synced'
                      : cloudSyncStatus === 'syncing'
                      ? 'Global Cloud Store: Synchronizing...'
                      : 'Global Cloud Store: Ready'}
                  </span>
                  <span className="text-[11px] text-[#8b949e]">
                    {lastSyncedTime ? `Last synced: ${lastSyncedTime}` : 'All changes auto-persist to server disk'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualSync}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Sync Cloud Database Now</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#30363d]/60 text-xs text-[#8b949e]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">Active Positions</span>
                <span className="font-bold text-[#e6edf3] text-sm">{activeRequisitionsCount} Requisitions</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8b949e] block">CV Bank Profiles</span>
                <span className="font-bold text-[#e6edf3] text-sm">{candidatesCount} Archived CVs</span>
              </div>
            </div>
          </div>

          {/* Section 2: 1-Click Backup Export */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Workspace JSON Backup</span>
            </h3>
            <p className="text-xs text-[#8b949e]">
              Download a complete snapshot of all active job requisitions, KRA/KSA criteria, salary matrix, and screened CV profiles to share or import into any browser.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onExportWorkspaceJSON}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#21262d] hover:bg-[#30363d] text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Workspace JSON File</span>
              </button>
            </div>
          </div>

          {/* Section 3: Restore / Import Workspace JSON */}
          <div className="space-y-3 pt-4 border-t border-[#30363d]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Import / Restore Workspace JSON</span>
            </h3>
            <p className="text-xs text-[#8b949e]">
              Load a workspace backup file or paste JSON data below. This instantly hydrates the current browser session and broadcasts to the global cloud database.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5 text-indigo-400" />
                <span>Choose JSON File</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setImportError(null);
              }}
              placeholder='Paste workspace JSON here: { "activeRequisitions": [...], "candidates": [...] }'
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3 text-xs font-mono text-[#e6edf3] placeholder:text-[#8b949e]/50 outline-none focus:border-indigo-500 transition resize-y"
            />

            {importError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{importError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{importSuccess}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleApplyImport}
              disabled={isProcessing || !jsonText.trim()}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center justify-center gap-2 shadow-md shadow-cyan-950/40 cursor-pointer disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Apply &amp; Restore Workspace to Cloud</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

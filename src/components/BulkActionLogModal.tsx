/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Download,
  History,
  RotateCcw,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { BulkActionLog } from '../types';
import { exportAuditLogsToCSV } from '../utils/auditLogger';

interface BulkActionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: BulkActionLog[];
  onRollback: (log: BulkActionLog) => void;
  onClearLogs: () => void;
  companyName: string;
}

export const BulkActionLogModal: React.FC<BulkActionLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onRollback,
  onClearLogs,
  companyName,
}) => {
  if (!isOpen) return null;

  const handleExportCSV = () => {
    const csvContent = exportAuditLogsToCSV(logs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${companyName}_Bulk_Action_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Bulk Action & Policy Enforcement Audit Trail
              </h3>
              <p className="text-xs text-zinc-500">
                Full chronological record of batch shortlisting, rapid-changer disqualifications, and salary adjustments
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-zinc-200 bg-white flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-700">
            {logs.length} Logged Action{logs.length === 1 ? '' : 's'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={logs.length === 0}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
              <span>Export Audit CSV</span>
            </button>

            <button
              type="button"
              onClick={onClearLogs}
              disabled={logs.length === 0}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 disabled:opacity-50 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Log list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs">
              No bulk actions recorded yet.
            </div>
          ) : (
            logs.map((log) => {
              const dateStr = new Date(log.timestamp).toLocaleString();
              return (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 transition space-y-2 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          log.actionType === 'POLICY_ENFORCEMENT'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : log.actionType === 'SALARY_ADJUSTMENT'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {log.actionType.replace(/_/g, ' ')}
                      </span>
                      <h4 className="font-bold text-zinc-900">{log.title}</h4>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
                      <span>{dateStr}</span>
                      <button
                        type="button"
                        onClick={() => onRollback(log)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 ml-2 cursor-pointer"
                        title="Revert candidate statuses and salaries back to prior state"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Rollback</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-zinc-600">{log.description}</p>

                  <div className="flex items-center gap-4 text-zinc-500 text-[11px] pt-1 border-t border-zinc-200/60">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{log.affectedCandidatesCount} Candidate(s) Affected:</span>
                      <strong className="text-zinc-800">
                        {log.candidateSnapshots.map((s) => s.name).join(', ')}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>Actor: {log.performedBy}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BulkActionLog, Candidate, CandidateSnapshot, CandidateStatus } from '../types';

const AUDIT_LOG_KEY = 'screener_bulk_action_audit_trail_v1';

export const INITIAL_AUDIT_LOGS: BulkActionLog[] = [
  {
    id: 'log_init_001',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    actionType: 'POLICY_ENFORCEMENT',
    title: 'Disqualification of Rapid Job Changers (<1.5 Yrs Tenure)',
    description:
      'Auto-disqualified 3 applicants with multiple short stints violating the 18-month average stability standard.',
    performedBy: 'Lead Recruiter (xyz@gmail.com)',
    affectedCandidatesCount: 3,
    affectedCandidateIds: ['cand_3', 'cand_7', 'cand_9'],
    candidateSnapshots: [
      {
        id: 'cand_3',
        name: 'Tariqul Islam',
        category: 'Merchandiser',
        previousStatus: 'pending',
        newStatus: 'rejected',
        previousSalary: 40000,
        newSalary: 40000,
        previousGrade: 'ME-11',
        newGrade: 'ME-11',
      },
      {
        id: 'cand_7',
        name: 'Nayeem Hasan',
        category: 'Quality Assurance (QA/QC)',
        previousStatus: 'pending',
        newStatus: 'rejected',
        previousSalary: 35000,
        newSalary: 35000,
        previousGrade: 'ME-11',
        newGrade: 'ME-11',
      },
      {
        id: 'cand_9',
        name: 'Farhan Kabir',
        category: 'Production / Sewing Supervisor',
        previousStatus: 'pending',
        newStatus: 'rejected',
        previousSalary: 35000,
        newSalary: 35000,
        previousGrade: 'ME-11',
        newGrade: 'ME-11',
      },
    ],
    metadata: {
      previousStatus: 'pending',
      newStatus: 'rejected',
      reason: 'Strict enforcement of company policy against frequent job changes (<18 mos/co).',
    },
  },
  {
    id: 'log_init_002',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    actionType: 'MASS_STATUS_CHANGE',
    title: 'Batch Shortlisting of High-Scoring Evaluated Candidates',
    description:
      'Mass status update to "Shortlisted" for top candidates meeting score threshold ≥ 80% and stable retention records.',
    performedBy: 'Lead Recruiter (xyz@gmail.com)',
    affectedCandidatesCount: 2,
    affectedCandidateIds: ['cand_1', 'cand_2'],
    candidateSnapshots: [
      {
        id: 'cand_1',
        name: 'Rahim Ahmed',
        category: 'Merchandiser',
        previousStatus: 'pending',
        newStatus: 'shortlisted',
        previousSalary: 65000,
        newSalary: 65000,
        previousGrade: 'ME-10',
        newGrade: 'ME-10',
      },
      {
        id: 'cand_2',
        name: 'Nazmul Hossain',
        category: 'Fashion Designer / Pattern & CAD',
        previousStatus: 'pending',
        newStatus: 'shortlisted',
        previousSalary: 40000,
        newSalary: 40000,
        previousGrade: 'ME-11',
        newGrade: 'ME-11',
      },
    ],
    metadata: {
      previousStatus: 'pending',
      newStatus: 'shortlisted',
      reason: 'Qualified for panel interviews based on RMG 8-criteria benchmarks.',
    },
  },
];

export function getBulkActionLogs(): BulkActionLog[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    if (!raw) {
      saveBulkActionLogs(INITIAL_AUDIT_LOGS);
      return INITIAL_AUDIT_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_AUDIT_LOGS;
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function saveBulkActionLogs(logs: BulkActionLog[]): void {
  try {
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
  } catch {
    // ignore
  }
}

export function recordBulkActionLog({
  actionType,
  title,
  description,
  performedBy = 'XYZ HR Recruitment (xyz@gmail.com)',
  candidates,
  updatedStatus,
  updatedSalaries,
  metadata,
}: {
  actionType: BulkActionLog['actionType'];
  title: string;
  description: string;
  performedBy?: string;
  candidates: Candidate[];
  updatedStatus?: CandidateStatus;
  updatedSalaries?: Array<{ id: string; newSalary: number; newGrade: string }>;
  metadata?: Record<string, unknown>;
}): BulkActionLog {
  const candidateSnapshots: CandidateSnapshot[] = candidates.map((c) => {
    const salaryUpdate = updatedSalaries?.find((u) => u.id === c.id);
    return {
      id: c.id,
      name: c.name,
      category: c.category,
      previousStatus: c.status,
      newStatus: updatedStatus || c.status,
      previousSalary: c.salaryFixation?.fixedSalary || 0,
      newSalary: salaryUpdate ? salaryUpdate.newSalary : c.salaryFixation?.fixedSalary || 0,
      previousGrade: c.salaryFixation?.grade || 'ME-11',
      newGrade: salaryUpdate?.newGrade || c.salaryFixation?.grade || 'ME-11',
    };
  });

  const newLog: BulkActionLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    actionType,
    title,
    description,
    performedBy,
    affectedCandidatesCount: candidates.length,
    affectedCandidateIds: candidates.map((c) => c.id),
    candidateSnapshots,
    metadata,
  };

  const current = getBulkActionLogs();
  saveBulkActionLogs([newLog, ...current]);
  return newLog;
}

export function exportAuditLogsToCSV(logs: BulkActionLog[]): string {
  const headers = [
    'Log ID',
    'Timestamp',
    'Action Type',
    'Title',
    'Performed By',
    'Candidates Count',
    'Affected Candidate Names',
    'Description',
  ];

  const rows = logs.map((log) => [
    log.id,
    log.timestamp,
    log.actionType,
    `"${(log.title || '').replace(/"/g, '""')}"`,
    `"${(log.performedBy || '').replace(/"/g, '""')}"`,
    log.affectedCandidatesCount,
    `"${log.candidateSnapshots.map((s) => s.name).join('; ').replace(/"/g, '""')}"`,
    `"${(log.description || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

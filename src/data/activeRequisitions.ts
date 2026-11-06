/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JobRequisition } from '../types';

export const STORAGE_ACTIVE_REQUISITIONS_KEY = 'rmg_active_requisitions_v3';

// 100% User-driven architecture: Starts strictly empty (0 Jobs).
// No positions are auto-generated under any circumstance.
export const INITIAL_ACTIVE_REQUISITIONS: JobRequisition[] = [];

// Helper to backfill fields if missing on existing user requisitions
function enrichRequisition(req: JobRequisition): JobRequisition {
  return {
    ...req,
    requisitionNo: req.requisitionNo ?? '',
    unit: req.unit || req.sbuUnit || undefined,
    replacementEmployee: req.replacementEmployee || 'New Headcount',
    currentStageStatus: req.currentStageStatus || 'cv_sourcing',
    ultimateStatus: req.ultimateStatus || (req.status === 'closed' ? 'closed' : req.status === 'on_hold' ? 'on_hold' : 'opening'),
    jobDescription: req.jobDescription || '',
    jobRequirements: req.jobRequirements || '',
    companyCriteria: req.companyCriteria || '',
    keyKSA: req.keyKSA || '',
    salaryRange: req.salaryRange || '',
    vacanciesCount: req.vacanciesCount || 1,
    status: req.status || 'open',
  };
}

export function getStoredActiveRequisitions(): JobRequisition[] {
  try {
    // Purge old storage keys if present
    localStorage.removeItem('rmg_active_requisitions_v1');
    localStorage.removeItem('rmg_active_requisitions_v2');

    const raw = localStorage.getItem(STORAGE_ACTIVE_REQUISITIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any legacy mock job IDs (REQ-2026-001..006, REQ-2025-084)
        const mockIds = new Set([
          'REQ-2026-001',
          'REQ-2026-002',
          'REQ-2026-003',
          'REQ-2026-004',
          'REQ-2026-005',
          'REQ-2026-006',
          'REQ-2025-084',
        ]);
        const filtered = parsed.filter(
          (r: any) => r && r.id && !mockIds.has(r.id) && !r.title?.includes('(Mock)')
        );
        return filtered.map(enrichRequisition);
      }
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveStoredActiveRequisitions(reqs: JobRequisition[]): void {
  try {
    localStorage.setItem(STORAGE_ACTIVE_REQUISITIONS_KEY, JSON.stringify(reqs));
  } catch {
    // ignore
  }
}

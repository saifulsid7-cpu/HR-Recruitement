/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JobRequisition } from '../types';

export const STORAGE_HISTORICAL_REQUISITIONS_KEY = 'rmg_historical_requisitions_v2';

export const INITIAL_HISTORICAL_REQUISITIONS: JobRequisition[] = [];

export function getStoredHistoricalRequisitions(): JobRequisition[] {
  try {
    localStorage.removeItem('rmg_historical_requisitions_v1');
    const raw = localStorage.getItem(STORAGE_HISTORICAL_REQUISITIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const mockHistoricalIds = new Set(['REQ-2025-084', 'REQ-2025-042', 'REQ-2025-019']);
        return parsed.filter((r: any) => r && r.id && !mockHistoricalIds.has(r.id));
      }
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveStoredHistoricalRequisitions(reqs: JobRequisition[]): void {
  try {
    localStorage.setItem(STORAGE_HISTORICAL_REQUISITIONS_KEY, JSON.stringify(reqs));
  } catch {
    // ignore
  }
}

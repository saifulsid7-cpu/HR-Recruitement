/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { HiringTrackerRecord } from '../data/hiringTrackerData';

export function exportHiringTrackerToExcel(
  records: HiringTrackerRecord[],
  fileNamePrefix = 'Hiring_Tracker_Master_Report'
) {
  if (!records || records.length === 0) return;

  const workbook = XLSX.utils.book_new();

  const dataRows = records.map((r, idx) => ({
    'SL': r.sl || idx + 1,
    'Requisition No': r.requisitionNo || `REQ-2026-${String(idx + 1).padStart(3, '0')}`,
    'Position': r.position || '',
    'Division': r.division || '',
    'Department': r.department || '',
    'Total Resumes': r.totalResumes ?? 0,
    'Conducted': r.conducted ?? 0,
    'Shortlisted': r.shortlisted ?? 0,
    'Replacement Employee': r.replacementEmployee || 'New Headcount',
    'Finalized Employee': r.finalizedEmployee || '-',
    'Finalized Salary': r.finalizedSalary || '-',
    'Joining Date': r.joiningDate || '-',
    'Current Status': r.currentStatus || 'RUNNING',
    'Remarks': r.remarks || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  // Column width hints
  worksheet['!cols'] = [
    { wch: 6 },  // SL
    { wch: 18 }, // Requisition No
    { wch: 28 }, // Position
    { wch: 20 }, // Division
    { wch: 20 }, // Department
    { wch: 15 }, // Total Resumes
    { wch: 12 }, // Conducted
    { wch: 12 }, // Shortlisted
    { wch: 26 }, // Replacement Employee
    { wch: 22 }, // Finalized Employee
    { wch: 18 }, // Finalized Salary
    { wch: 14 }, // Joining Date
    { wch: 14 }, // Current Status
    { wch: 40 }, // Remarks
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hiring Tracker');

  const dateStamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${fileNamePrefix}_${dateStamp}.xlsx`);
}

export function exportHiringTrackerToCSV(
  records: HiringTrackerRecord[],
  fileNamePrefix = 'Hiring_Tracker_Report'
) {
  if (!records || records.length === 0) return;

  const headers = [
    'SL',
    'Requisition No',
    'Position',
    'Division',
    'Department',
    'Total Resumes',
    'Conducted',
    'Shortlisted',
    'Replacement Employee',
    'Finalized Employee',
    'Finalized Salary',
    'Joining Date',
    'Current Status',
    'Remarks',
  ];

  const csvRows = [
    headers.join(','),
    ...records.map((r, idx) => {
      const escape = (val: any) => {
        const str = String(val ?? '').replace(/"/g, '""');
        return `"${str}"`;
      };

      return [
        r.sl || idx + 1,
        escape(r.requisitionNo),
        escape(r.position),
        escape(r.division),
        escape(r.department),
        r.totalResumes ?? 0,
        r.conducted ?? 0,
        r.shortlisted ?? 0,
        escape(r.replacementEmployee),
        escape(r.finalizedEmployee),
        escape(r.finalizedSalary),
        escape(r.joiningDate),
        escape(r.currentStatus),
        escape(r.remarks),
      ].join(',');
    }),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStamp = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${fileNamePrefix}_${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

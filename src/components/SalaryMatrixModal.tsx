/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { SalaryMatrixRow } from '../types';
import { DEFAULT_SALARY_MATRIX } from '../data/salaryMatrix';

interface SalaryMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  salaryMatrix: SalaryMatrixRow[];
  onUpdateSalaryMatrix: (matrix: SalaryMatrixRow[]) => void;
}

export const SalaryMatrixModal: React.FC<SalaryMatrixModalProps> = ({
  isOpen,
  onClose,
  companyName,
  salaryMatrix,
  onUpdateSalaryMatrix,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [matrixData, setMatrixData] = useState<SalaryMatrixRow[]>(salaryMatrix);

  if (!isOpen) return null;

  const handleCellChange = (
    index: number,
    field: keyof SalaryMatrixRow,
    value: string
  ) => {
    const updated = [...matrixData];
    updated[index] = { ...updated[index], [field]: value };
    setMatrixData(updated);
    onUpdateSalaryMatrix(updated);
  };

  const handleReset = () => {
    if (confirm('Reset salary fixation matrix back to official company defaults?')) {
      setMatrixData(DEFAULT_SALARY_MATRIX);
      onUpdateSalaryMatrix(DEFAULT_SALARY_MATRIX);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Grade',
      'Category Layer',
      'Designation',
      'Required Experience',
      'Min Required Score Band',
      'Merchandising Salary',
      'Fashion Designing Salary',
      'Accounts & Commercial Salary',
      'QA/QC Salary',
      'Sewing & Cutting Salary',
    ];

    const rows = matrixData.map((r) => [
      r.grade,
      r.categoryLayer,
      `"${r.designation.replace(/"/g, '""')}"`,
      `"${r.requiredExperience.replace(/"/g, '""')}"`,
      `"${r.minRequiredScore.replace(/"/g, '""')}"`,
      `"${r.merchandisingSalary.replace(/"/g, '""')}"`,
      `"${r.fashionDesigningSalary.replace(/"/g, '""')}"`,
      `"${r.accountsCommercialSalary.replace(/"/g, '""')}"`,
      `"${r.qaSalary.replace(/"/g, '""')}"`,
      `"${r.sewingCuttingSalary.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${companyName}_Salary_Matrix_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filtered = matrixData.filter(
    (row) =>
      row.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.categoryLayer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                {companyName} Internal Ranking Grade & Salary Fixation Policy Matrix
              </h3>
              <p className="text-xs text-zinc-500">
                Official pay scale tiers from Executive ME-13 Trainee up to GM ME-2 across Garment Divisions
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
        <div className="p-4 border-b border-zinc-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search grade or designation (e.g. ME-11, Merchandiser)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
              <span>Export Matrix CSV</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-100/80 sticky top-0 border-b border-zinc-200 text-zinc-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-2.5">Grade</th>
                <th className="p-2.5">Layer</th>
                <th className="p-2.5">Eligible Designation</th>
                <th className="p-2.5">Required Exp</th>
                <th className="p-2.5">Passing Score</th>
                <th className="p-2.5">Merchandising (BDT)</th>
                <th className="p-2.5">Fashion Design (BDT)</th>
                <th className="p-2.5">Accounts & Comm</th>
                <th className="p-2.5">QA/QC</th>
                <th className="p-2.5">Sewing & Cutting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-medium">
              {filtered.map((row, i) => (
                <tr
                  key={row.id || row.grade}
                  className={`hover:bg-zinc-50 transition-colors ${
                    row.grade === 'ME-11' || row.grade === 'ME-12' || row.grade === 'ME-10'
                      ? 'bg-blue-50/20'
                      : ''
                  }`}
                >
                  <td className="p-2.5 font-bold text-zinc-900 whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800">
                      {row.grade}
                    </span>
                  </td>
                  <td className="p-2.5 text-zinc-600 whitespace-nowrap">{row.categoryLayer}</td>
                  <td className="p-2.5">
                    <input
                      type="text"
                      value={row.designation}
                      onChange={(e) => handleCellChange(i, 'designation', e.target.value)}
                      className="w-full px-2 py-1 rounded border border-transparent hover:border-zinc-300 focus:border-zinc-900 focus:bg-white bg-transparent outline-none text-xs"
                    />
                  </td>
                  <td className="p-2.5 text-zinc-600 whitespace-nowrap">
                    <input
                      type="text"
                      value={row.requiredExperience}
                      onChange={(e) => handleCellChange(i, 'requiredExperience', e.target.value)}
                      className="w-full px-2 py-1 rounded border border-transparent hover:border-zinc-300 focus:border-zinc-900 focus:bg-white bg-transparent outline-none text-xs"
                    />
                  </td>
                  <td className="p-2.5 text-zinc-600 whitespace-nowrap">{row.minRequiredScore}</td>
                  <td className="p-2.5 font-mono text-[11px] text-blue-900">
                    <input
                      type="text"
                      value={row.merchandisingSalary}
                      onChange={(e) => handleCellChange(i, 'merchandisingSalary', e.target.value)}
                      className="w-full px-2 py-1 rounded border border-transparent hover:border-blue-300 focus:border-blue-600 focus:bg-white bg-transparent outline-none text-xs"
                    />
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-purple-900">
                    <input
                      type="text"
                      value={row.fashionDesigningSalary}
                      onChange={(e) => handleCellChange(i, 'fashionDesigningSalary', e.target.value)}
                      className="w-full px-2 py-1 rounded border border-transparent hover:border-purple-300 focus:border-purple-600 focus:bg-white bg-transparent outline-none text-xs"
                    />
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-zinc-800">
                    <input
                      type="text"
                      value={row.accountsCommercialSalary}
                      onChange={(e) => handleCellChange(i, 'accountsCommercialSalary', e.target.value)}
                      className="w-full px-2 py-1 rounded border border-transparent hover:border-zinc-300 focus:border-zinc-900 focus:bg-white bg-transparent outline-none text-xs"
                    />
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-zinc-800">
                    <input
                      type="text"
                      value={row.qaSalary}
                      onChange={(e) => handleCellChange(i, 'qaSalary', e.target.value)}
                      className="w-full px-2 py-1 rounded border border-transparent hover:border-zinc-300 focus:border-zinc-900 focus:bg-white bg-transparent outline-none text-xs"
                    />
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-zinc-800">
                    <input
                      type="text"
                      value={row.sewingCuttingSalary}
                      onChange={(e) => handleCellChange(i, 'sewingCuttingSalary', e.target.value)}
                      className="w-full px-2 py-1 rounded border border-transparent hover:border-zinc-300 focus:border-zinc-900 focus:bg-white bg-transparent outline-none text-xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Edits made to cells update candidate salary fixation logic and Excel export in real time.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

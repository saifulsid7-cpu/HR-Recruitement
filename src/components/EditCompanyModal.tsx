/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Building2, X } from 'lucide-react';

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCompanyName: string;
  onSaveCompanyName: (name: string) => void;
}

export const EditCompanyModal: React.FC<EditCompanyModalProps> = ({
  isOpen,
  onClose,
  currentCompanyName,
  onSaveCompanyName,
}) => {
  const [name, setName] = useState(currentCompanyName);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSaveCompanyName(name.trim());
      onClose();
    }
  };

  const presets = ['XYZ', 'XYZ Group', 'XYZ Apparels', 'SF', 'SF Apparels', 'Ha-Meem Group'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-zinc-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-zinc-800" />
            <h3 className="text-sm font-bold text-zinc-900">Edit Organization Name</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 rounded transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Company / Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. XYZ, XYZ Group, SF, SF Apparels"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none font-medium"
              autoFocus
              required
            />
            <p className="text-[11px] text-zinc-500 mt-1.5">
              This will update the organization name across all salary policy matrices, evaluation cards, report headers, and Excel exports.
            </p>
          </div>

          <div>
            <span className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Quick Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setName(p)}
                  className={`px-2.5 py-1 text-xs rounded-md border font-medium transition cursor-pointer ${
                    name === p
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-800 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

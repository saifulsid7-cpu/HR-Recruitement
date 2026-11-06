/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, Plus, Trash2, X } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onUpdateCategories,
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [list, setList] = useState<string[]>(categories);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed || list.includes(trimmed)) return;
    const updated = [...list, trimmed];
    setList(updated);
    onUpdateCategories(updated);
    setNewCategory('');
  };

  const handleRemove = (cat: string) => {
    const updated = list.filter((c) => c !== cat);
    setList(updated);
    onUpdateCategories(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-zinc-800" />
            <h3 className="text-sm font-bold text-zinc-900">Manage Candidate Categories</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 rounded transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form to add */}
        <div className="p-5 space-y-4">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Sampling Section Head, Washing Master"
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
            />
            <button
              type="submit"
              disabled={!newCategory.trim()}
              className="inline-flex items-center px-3 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 rounded-lg transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add</span>
            </button>
          </form>

          {/* List of categories */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {list.map((cat) => (
              <div
                key={cat}
                className="flex items-center justify-between px-3 py-2 text-xs rounded-lg bg-zinc-50 border border-zinc-200"
              >
                <span className="font-medium text-zinc-800">{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(cat)}
                  className="text-zinc-400 hover:text-rose-600 p-1 transition cursor-pointer"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-end">
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

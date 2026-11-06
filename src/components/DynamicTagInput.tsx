/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';

interface DynamicTagInputProps {
  label: string;
  icon?: React.ReactNode;
  description?: string;
  selectedTags: string[];
  onAddTag: (tag: string) => void;
  onAddTags?: (tags: string[]) => void;
  onRemoveTag: (tag: string) => void;
  suggestedTags?: string[];
  placeholder?: string;
  colorTheme?: 'indigo' | 'cyan' | 'emerald' | 'purple' | 'amber';
}

export const DynamicTagInput: React.FC<DynamicTagInputProps> = ({
  label,
  icon,
  description,
  selectedTags = [],
  onAddTag,
  onAddTags,
  onRemoveTag,
  suggestedTags = [],
  placeholder = '+ Type and press Enter...',
  colorTheme = 'indigo',
}) => {
  const [inputValue, setInputValue] = useState('');

  const colorStyles = {
    indigo: {
      activeBg: 'bg-indigo-950/70 text-indigo-200 border-indigo-500/50 hover:bg-indigo-900/60',
      pillBorder: 'border-indigo-500/30 text-indigo-400',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      ringFocus: 'focus:border-indigo-500',
    },
    cyan: {
      activeBg: 'bg-cyan-950/70 text-cyan-200 border-cyan-500/50 hover:bg-cyan-900/60',
      pillBorder: 'border-cyan-500/30 text-cyan-400',
      buttonBg: 'bg-cyan-600 hover:bg-cyan-500 text-white',
      ringFocus: 'focus:border-cyan-500',
    },
    emerald: {
      activeBg: 'bg-emerald-950/70 text-emerald-200 border-emerald-500/50 hover:bg-emerald-900/60',
      pillBorder: 'border-emerald-500/30 text-emerald-400',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      ringFocus: 'focus:border-emerald-500',
    },
    purple: {
      activeBg: 'bg-purple-950/70 text-purple-200 border-purple-500/50 hover:bg-purple-900/60',
      pillBorder: 'border-purple-500/30 text-purple-400',
      buttonBg: 'bg-purple-600 hover:bg-purple-500 text-white',
      ringFocus: 'focus:border-purple-500',
    },
    amber: {
      activeBg: 'bg-amber-950/70 text-amber-200 border-amber-500/50 hover:bg-amber-900/60',
      pillBorder: 'border-amber-500/30 text-amber-400',
      buttonBg: 'bg-amber-600 hover:bg-amber-500 text-white',
      ringFocus: 'focus:border-amber-500',
    },
  }[colorTheme];

  const commitBatch = (raw: string) => {
    const parts = raw
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !selectedTags.includes(s));
    const unique = Array.from(new Set(parts));
    if (unique.length === 0) return;
    if (onAddTags) {
      onAddTags(unique);
    } else {
      unique.forEach((t) => onAddTag(t));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
      e.preventDefault();
      onRemoveTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (/[\n,;]/.test(pasted)) {
      e.preventDefault();
      commitBatch(pasted);
      setInputValue('');
    }
  };

  const handleCommit = () => {
    const trimmed = inputValue.trim().replace(/^,+|,+$/g, '');
    if (trimmed) {
      commitBatch(trimmed);
      setInputValue('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <label className="text-[11px] font-bold text-[#e6edf3] flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
          <span className="text-[10px] text-[#8b949e] font-normal">
            ({selectedTags.length} selected)
          </span>
        </label>
        {description && (
          <span className="text-[10px] text-[#8b949e]">{description}</span>
        )}
      </div>

      {/* Selected Active Chips Strip (with instant (x) delete button) */}
      <div className="flex flex-wrap gap-1.5 min-h-[34px] p-2 rounded-xl bg-[#161b22] border border-[#30363d]/80 items-center">
        {selectedTags.length === 0 ? (
          <span className="text-[11px] text-[#8b949e] italic px-1">
            No tags selected. Click suggestions below or type a custom name.
          </span>
        ) : (
          selectedTags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${colorStyles.activeBg}`}
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTag(tag);
                }}
                className="hover:bg-white/20 rounded p-0.5 transition cursor-pointer text-inherit"
                title={`Remove ${tag}`}
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>

      {/* Type-and-Enter Custom Tag Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            className={`w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-1.5 text-xs text-[#e6edf3] placeholder-[#8b949e] outline-none ${colorStyles.ringFocus} transition`}
          />
        </div>
        <button
          type="button"
          onClick={handleCommit}
          disabled={!inputValue.trim()}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${colorStyles.buttonBg}`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Suggested Quick Toggle Chips */}
      {suggestedTags.length > 0 && (
        <div className="space-y-1 pt-0.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b949e] block">
            Suggested Quick Add:
          </span>
          <div className="flex flex-wrap gap-1">
            {suggestedTags.map((sug) => {
              const isSelected = selectedTags.includes(sug);
              return (
                <button
                  type="button"
                  key={sug}
                  onClick={() => {
                    if (isSelected) {
                      onRemoveTag(sug);
                    } else {
                      onAddTag(sug);
                    }
                  }}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium border transition cursor-pointer ${
                    isSelected
                      ? `${colorStyles.activeBg} font-bold`
                      : 'bg-[#21262d] text-[#8b949e] border-[#30363d] hover:text-[#e6edf3] hover:border-[#484f58]'
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : (
                    <Plus className="w-2.5 h-2.5 opacity-60" />
                  )}
                  <span>{sug}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

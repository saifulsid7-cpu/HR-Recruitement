/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, ChevronDown, Sparkles, X } from 'lucide-react';

export interface ComboBoxSuggestion {
  label: string;
  value: string;
  sublabel?: string;
  category?: string;
}

interface EditableComboBoxProps {
  label: string;
  icon?: React.ReactNode;
  description?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  suggestions: (string | ComboBoxSuggestion)[];
  quickChips?: string[];
  datalistId: string;
  colorTheme?: 'indigo' | 'emerald' | 'cyan' | 'purple';
}

export const EditableComboBox: React.FC<EditableComboBoxProps> = ({
  label,
  icon,
  description,
  value,
  onChange,
  placeholder = 'Type custom text or select from suggestions...',
  suggestions,
  quickChips,
  datalistId,
  colorTheme = 'indigo',
}) => {
  const themeClasses = {
    indigo: {
      ringFocus: 'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30',
      activeChip: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/50',
      iconColor: 'text-indigo-400',
    },
    emerald: {
      ringFocus: 'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30',
      activeChip: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50',
      iconColor: 'text-emerald-400',
    },
    cyan: {
      ringFocus: 'focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30',
      activeChip: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50',
      iconColor: 'text-cyan-400',
    },
    purple: {
      ringFocus: 'focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30',
      activeChip: 'bg-purple-950/70 text-purple-300 border-purple-500/50',
      iconColor: 'text-purple-400',
    },
  }[colorTheme];

  const normalizedSuggestions: ComboBoxSuggestion[] = suggestions.map((item) => {
    if (typeof item === 'string') {
      return { label: item, value: item };
    }
    return item;
  });

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-1.5">
        <label className="text-[11px] font-bold text-[#e6edf3] flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
          <span className="text-[10px] text-[#8b949e] font-normal font-sans">
            (100% Free-Text / Editable)
          </span>
        </label>
        {description && (
          <span className="text-[10px] text-[#8b949e] hidden sm:inline">
            {description}
          </span>
        )}
      </div>

      {/* Free-text input connected with HTML5 Datalist */}
      <div className="relative">
        <input
          type="text"
          list={datalistId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#161b22] border border-[#30363d] rounded-xl pl-3 pr-8 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] outline-none ${themeClasses.ringFocus} transition font-medium`}
        />

        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#e6edf3] p-0.5 rounded cursor-pointer"
            title="Clear input"
            aria-label="Clear input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[#8b949e] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
        )}

        <datalist id={datalistId}>
          {normalizedSuggestions.map((item, idx) => (
            <option key={`${item.value}-${idx}`} value={item.value}>
              {item.label !== item.value ? item.label : undefined}
            </option>
          ))}
        </datalist>
      </div>

      {/* Quick Select Suggestion Pills */}
      {quickChips && quickChips.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap pt-0.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b949e] shrink-0 mr-0.5">
            Quick:
          </span>
          {quickChips.map((chip) => {
            const isMatch = value.trim().toLowerCase() === chip.trim().toLowerCase();
            return (
              <button
                type="button"
                key={chip}
                onClick={() => onChange(chip)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition cursor-pointer flex items-center gap-1 ${
                  isMatch
                    ? `${themeClasses.activeChip} font-bold shadow-2xs`
                    : 'bg-[#21262d] text-[#8b949e] border-[#30363d] hover:text-[#e6edf3] hover:border-[#484f58]'
                }`}
                title={`Set to "${chip}"`}
              >
                {isMatch && <Check className="w-2.5 h-2.5" />}
                <span className="truncate max-w-[200px]">{chip}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  Check,
  Copy,
  FileText,
  Printer,
  X,
  XCircle,
} from 'lucide-react';
import { Candidate } from '../types';
import { generateOfferMemo, generateRejectionNotice } from '../data/salaryMatrix';

interface OfferRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  mode: 'offer' | 'rejection';
  companyName: string;
}

export const OfferRejectionModal: React.FC<OfferRejectionModalProps> = ({
  isOpen,
  onClose,
  candidate,
  mode,
  companyName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !candidate) return null;

  const isOffer = mode === 'offer';
  const offerData = isOffer ? generateOfferMemo(candidate, companyName) : null;
  const rejectionData = !isOffer ? generateRejectionNotice(candidate, companyName) : null;

  const fullText = isOffer
    ? offerData?.formalOfferMemo || ''
    : rejectionData?.formalNoticeText || '';

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>${isOffer ? 'Offer Memo' : 'Rejection Notice'} - ${candidate.name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
          </style>
        </head>
        <body>
          <pre>${fullText}</pre>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isOffer ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {isOffer ? <Award className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                {isOffer
                  ? `Candidate Selection Memo — ${candidate.name}`
                  : `Formal Rejection Notice — ${candidate.name}`}
              </h3>
              <p className="text-xs text-zinc-500">
                {isOffer
                  ? 'Official internal appointment recommendation & salary fixation memorandum'
                  : 'Official candidate notification with policy adherence explanation'}
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

        {/* Action Header bar */}
        <div className="px-6 py-2.5 bg-zinc-100/70 border-b border-zinc-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-700">
            {isOffer ? offerData?.headline : rejectionData?.headline}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center px-2.5 py-1 font-semibold rounded border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center px-2.5 py-1 font-semibold rounded border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1 text-zinc-500" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Memo Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Detailed Points */}
          <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs space-y-1.5">
            <span className="font-bold text-zinc-800 block">
              {isOffer ? 'Selection Justification Summary:' : 'Policy Criteria Evaluation Points:'}
            </span>
            <ul className="list-disc list-inside text-zinc-600 space-y-1 text-[11px] leading-relaxed">
              {(isOffer ? offerData?.detailedPoints : rejectionData?.detailedPoints)?.map(
                (point, i) => (
                  <li key={i}>{point}</li>
                )
              )}
            </ul>
          </div>

          {/* Formatted Text Box */}
          <div className="p-4 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs leading-relaxed whitespace-pre-wrap select-all shadow-inner">
            {fullText}
          </div>
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

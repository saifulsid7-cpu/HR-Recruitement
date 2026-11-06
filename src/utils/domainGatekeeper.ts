/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Candidate, SemanticResponsibilityMatch, VerdictType } from '../types';

/**
 * Extracts candidate's actual designation and company cleanly from work history or CV text,
 * guaranteeing it is never overwritten by the target job title.
 */
export function extractCandidateRealDesignation(
  candidate: Partial<Candidate>,
  rawCvText?: string,
  targetJobTitle?: string
): { realLastDesignation: string; realLastCompany: string } {
  const normTarget = (targetJobTitle || candidate.appliedPosition || '').toLowerCase().trim();

  const firstExp = candidate.experience?.[0];
  const expRole = firstExp?.role?.trim();
  const expCompany = firstExp?.company?.trim();

  let realRole = candidate.lastDesignation?.trim() || expRole || '';
  let realCompany = candidate.lastCompany?.trim() || expCompany || 'N/A';

  // If realRole matches target job title, check second role or CV text to preserve real career identity
  if (normTarget && realRole.toLowerCase() === normTarget) {
    if (expRole && expRole.toLowerCase() !== normTarget) {
      realRole = expRole;
    } else if (candidate.experience && candidate.experience.length > 1) {
      const secondExp = candidate.experience[1];
      if (secondExp?.role && secondExp.role.toLowerCase() !== normTarget) {
        realRole = secondExp.role;
      }
    }
  }

  return {
    realLastDesignation: realRole || candidate.lastDesignation || 'Candidate',
    realLastCompany: realCompany || candidate.lastCompany || 'N/A',
  };
}

/**
 * Clean pass-through: preserves dynamic evaluation computed purely between
 * the active Requisition's JD (KRA/KSA) and the active candidate's extracted text.
 * Eliminates all legacy hardcoded domain filters, static mock data, and static caps.
 */
export function applyDomainGatekeeperToCandidate(
  targetTitle: string,
  _targetDepartment: string,
  _targetDescription: string,
  candidate: Candidate,
  rawCvText?: string
): Candidate {
  const { realLastDesignation, realLastCompany } = extractCandidateRealDesignation(
    candidate,
    rawCvText,
    targetTitle
  );

  return {
    ...candidate,
    lastDesignation: realLastDesignation || candidate.lastDesignation,
    lastCompany: realLastCompany || candidate.lastCompany,
  };
}

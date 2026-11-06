/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EvaluationCriterionConfig } from '../types';

export const DEFAULT_CRITERIA_CONFIG: EvaluationCriterionConfig[] = [
  {
    id: 'relevant_experience',
    name: 'Relevant Job Experience',
    description: 'Relevance of previous work responsibilities and experience to the target position.',
    weight: 25,
  },
  {
    id: 'technical_skills',
    name: 'Technical and Functional Skills',
    description: 'Matching of job-specific technical skills, tools, software, and functional competencies.',
    weight: 25,
  },
  {
    id: 'education',
    name: 'Educational Qualifications',
    description: 'Relevance of education and professional qualifications to the job requirements.',
    weight: 15,
  },
  {
    id: 'industry_knowledge',
    name: 'Industry and Product Knowledge',
    description: 'Relevant industry experience, product knowledge, and understanding of the business.',
    weight: 15,
  },
  {
    id: 'competencies',
    name: 'Job-Specific Competencies',
    description: 'Evidence of the competencies explicitly required in the job description.',
    weight: 10,
  },
  {
    id: 'achievements',
    name: 'Achievements and Evidence of Performance',
    description: 'Relevant accomplishments, project outcomes, and demonstrated contributions.',
    weight: 10,
  },
];

const STORAGE_KEY = 'screener_evaluation_criteria_weights_v1';

export function getStoredCriteriaConfig(): EvaluationCriterionConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === DEFAULT_CRITERIA_CONFIG.length) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_CRITERIA_CONFIG;
}

export function saveStoredCriteriaConfig(config: EvaluationCriterionConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export function resetCriteriaConfig(): EvaluationCriterionConfig[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return DEFAULT_CRITERIA_CONFIG;
}

import { Candidate, TieBreakerRule } from '../types';

export const TIE_BREAKER_OPTIONS: Array<{ id: TieBreakerRule; label: string; description: string }> = [
  {
    id: 'none',
    label: 'Standard Tied Ranks (No tie-breaker)',
    description: 'Candidates with identical match scores receive identical rank with a "Tied" indicator.',
  },
  {
    id: 'experience_marks',
    label: 'Tie-Break: Relevant Experience Marks',
    description: 'Prioritizes candidate with higher verified Relevant Job Experience marks.',
  },
  {
    id: 'technical_marks',
    label: 'Tie-Break: Technical & Functional Skills',
    description: 'Prioritizes candidate with higher Technical and Functional Skills marks.',
  },
  {
    id: 'evidence_completeness',
    label: 'Tie-Break: Evidence Completeness %',
    description: 'Prioritizes candidate with higher verifiable CV evidence completeness percentage.',
  },
  {
    id: 'total_experience',
    label: 'Tie-Break: Total Years of Experience',
    description: 'Prioritizes candidate with greater verified aggregate years of experience.',
  },
];

export function rankCandidates(
  candidates: Candidate[],
  tieBreaker: TieBreakerRule = 'none'
): Candidate[] {
  if (!candidates || candidates.length === 0) return [];

  // Clone array
  const list = [...candidates];

  // Sorting
  list.sort((a, b) => {
    // Primary sort: total match score descending
    const scoreDiff = b.score - a.score;
    if (Math.abs(scoreDiff) > 0.001) {
      return scoreDiff;
    }

    // Apply HR-configured job-related tie-breaking rule
    if (tieBreaker === 'experience_marks') {
      const expA = a.criteriaMarks?.relevant_experience?.obtainedMarks ?? 0;
      const expB = b.criteriaMarks?.relevant_experience?.obtainedMarks ?? 0;
      if (expB !== expA) return expB - expA;
    } else if (tieBreaker === 'technical_marks') {
      const techA = a.criteriaMarks?.technical_skills?.obtainedMarks ?? 0;
      const techB = b.criteriaMarks?.technical_skills?.obtainedMarks ?? 0;
      if (techB !== techA) return techB - techA;
    } else if (tieBreaker === 'evidence_completeness') {
      const compA = a.evidenceCompleteness?.percentage ?? 0;
      const compB = b.evidenceCompleteness?.percentage ?? 0;
      if (compB !== compA) return compB - compA;
    } else if (tieBreaker === 'total_experience') {
      const totA = a.totalYearsExperience ?? 0;
      const totB = b.totalYearsExperience ?? 0;
      if (totB !== totA) return totB - totA;
    }

    // Secondary stability: by name alphabetical to be deterministic
    return a.name.localeCompare(b.name);
  });

  // Assign ranks & tied indicators
  const ranked: Candidate[] = [];
  let currentRank = 1;

  for (let i = 0; i < list.length; i++) {
    const cand = list[i];
    const prev = i > 0 ? list[i - 1] : null;

    let isTiedWithNeighbor = false;
    if (tieBreaker === 'none') {
      // If score equals previous candidate's score
      if (prev && Math.abs(prev.score - cand.score) < 0.001) {
        isTiedWithNeighbor = true;
      }
      // Or if score equals next candidate's score
      const next = i < list.length - 1 ? list[i + 1] : null;
      if (next && Math.abs(next.score - cand.score) < 0.001) {
        isTiedWithNeighbor = true;
      }
    }

    if (i === 0) {
      currentRank = 1;
    } else if (prev) {
      if (tieBreaker === 'none' && Math.abs(prev.score - cand.score) < 0.001) {
        // Keep same rank as prev
        // currentRank remains prev's rank
      } else {
        currentRank = i + 1;
      }
    }

    ranked.push({
      ...cand,
      rank: currentRank,
      isTied: isTiedWithNeighbor,
    });
  }

  return ranked;
}


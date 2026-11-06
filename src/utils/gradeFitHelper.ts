/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GRADING_LADDER, type GradeLadderItem, LAYER_COMPETENCY_DICTIONARY } from '../data/gradingLadder.ts';

export interface GradeFitResult {
  cadre: string;
  layer: string;
  targetGradeCode: string;
  targetGradeTitle: string;
  targetRequiredYears: number;
  qualifiedGradeCode: string;
  qualifiedGradeTitle: string;
  qualifiedRequiredYears: number;
  actualServiceYears: number;
  actualServiceMonths: number;
  benchmarkTargetScore: number;
  candidateScore: number;
  isBenchmarkAchieved: boolean;
  isTenureSatisfied: boolean;
  statusText: 'Qualified for Hiring' | 'Promising (Tenure Gap)' | 'Below Hurdle' | 'Eligible for Re-Grading';
  tenureGapNotice: string;
  badgeLabel: string;
  oneLineVerdict: string;
  layerCompetencies: string;
  keyHardSkills: string;
  lastCompany: string;
  lastDesignation: string;
}

/**
 * Infer the target grade code from a job title or target grade override.
 */
export function inferTargetGrade(targetPositionTitle = '', targetGradeCode?: string): GradeLadderItem {
  if (targetGradeCode && targetGradeCode.trim()) {
    const trimmed = targetGradeCode.trim().toUpperCase();
    const exact = GRADING_LADDER.find((g) => g.code.toUpperCase() === trimmed);
    if (exact) return exact;

    const codeMatch = trimmed.match(/\b(ME-\d+|NME-\d+)\b/i);
    if (codeMatch) {
      const codeFound = GRADING_LADDER.find((g) => g.code.toUpperCase() === codeMatch[1].toUpperCase());
      if (codeFound) return codeFound;
    }
  }

  const title = targetPositionTitle.toLowerCase();

  // GM Cadre
  if (title.includes('director') || title.includes('gm-1') || title.includes('executive director')) {
    return GRADING_LADDER[0]; // ME-1
  }
  if (title.includes('sr. general manager') || title.includes('senior general manager') || title.includes('gm-2')) {
    return GRADING_LADDER[1]; // ME-2
  }
  if (title.includes('general manager') || title.includes('gm-3') || (title.includes('gm') && !title.includes('dgm') && !title.includes('agm'))) {
    return GRADING_LADDER[2]; // ME-3
  }
  if (title.includes('dgm') || title.includes('dep. general manager') || title.includes('deputy general manager') || title.includes('gm-4')) {
    return GRADING_LADDER[3]; // ME-4
  }
  if (title.includes('agm') || title.includes('asst. general manager') || title.includes('assistant general manager') || title.includes('gm-5')) {
    return GRADING_LADDER[4]; // ME-5
  }

  // Managerial Cadre
  if (title.includes('sr. manager') || title.includes('senior manager') || title.includes('manager-1')) {
    return GRADING_LADDER[5]; // ME-6
  }
  if (title.includes('dep. manager') || title.includes('deputy manager') || title.includes('manager-3')) {
    return GRADING_LADDER[7]; // ME-8
  }
  if (title.includes('asst. manager') || title.includes('assistant manager') || title.includes('manager-4')) {
    return GRADING_LADDER[8]; // ME-9
  }
  if (title.includes('manager') || title.includes('head') || title.includes('in-charge') || title.includes('in charge')) {
    return GRADING_LADDER[6]; // ME-7 (Manager)
  }

  // Executive Cadre
  if (title.includes('sr. executive') || title.includes('senior executive') || title.includes('executive-1')) {
    return GRADING_LADDER[9]; // ME-10
  }
  if (title.includes('asst. executive') || title.includes('assistant executive') || title.includes('junior executive') || title.includes('executive-3')) {
    return GRADING_LADDER[11]; // ME-12
  }
  if (title.includes('trainee') || title.includes('fresher') || title.includes('intern') || title.includes('executive-4')) {
    return GRADING_LADDER[12]; // ME-13
  }
  if (title.includes('executive') || title.includes('officer') || title.includes('merchandiser') || title.includes('designer') || title.includes('engineer')) {
    return GRADING_LADDER[10]; // ME-11 (Executive)
  }

  // Workers & Staff
  if (title.includes('operator') || title.includes('opa')) {
    return GRADING_LADDER.find((g) => g.code === 'NME-19') || GRADING_LADDER[10];
  }
  if (title.includes('helper')) {
    return GRADING_LADDER.find((g) => g.code === 'NME-21') || GRADING_LADDER[10];
  }

  // Default to Executive-2 (ME-11)
  return GRADING_LADDER[10];
}

/**
 * Finds the highest grade that the candidate's actual service length qualifies for.
 */
export function findQualifiedGrade(actualYears: number): GradeLadderItem {
  // Ladder is ordered from ME-1 (26 yrs) down to ME-13 (0 yrs)
  for (const grade of GRADING_LADDER) {
    if (actualYears >= grade.minServiceYears) {
      return grade;
    }
  }
  return GRADING_LADDER[12]; // ME-13 Freshers fallback
}

/**
 * Core Grade & Tenure Fit Evaluation
 */
export function evaluateGradeFitAndTenure({
  actualYears,
  candidateScore = 75,
  targetPositionTitle = '',
  targetGradeCode,
  lastCompany = 'Prior RMG Organization',
  lastDesignation = 'RMG Professional',
}: {
  actualYears: number;
  candidateScore?: number;
  targetPositionTitle?: string;
  targetGradeCode?: string;
  lastCompany?: string;
  lastDesignation?: string;
}): GradeFitResult {
  const roundedYears = parseFloat(Number(actualYears || 0).toFixed(1));
  const serviceMonths = Math.round(roundedYears * 12);

  const targetGrade = inferTargetGrade(targetPositionTitle, targetGradeCode);
  const qualifiedGrade = findQualifiedGrade(roundedYears);

  const isTenureSatisfied = roundedYears >= targetGrade.minServiceYears;
  const benchmarkTargetScore = targetGrade.benchmarkScore;
  const isBenchmarkAchieved = candidateScore >= benchmarkTargetScore;

  // Build tenure gap text
  let tenureGapNotice = '';
  if (isTenureSatisfied) {
    tenureGapNotice = `Tenure: ${roundedYears} Yrs (Meets ${targetGrade.code} benchmark of ${targetGrade.minServiceYears} Yrs)`;
  } else {
    tenureGapNotice = `Tenure: ${roundedYears} Yrs (Requires ${targetGrade.minServiceYears} Yrs for ${targetGrade.code} | Qualifies for ${qualifiedGrade.code})`;
  }

  // Status computation
  let statusText: GradeFitResult['statusText'] = 'Qualified for Hiring';
  if (!isBenchmarkAchieved) {
    statusText = 'Below Hurdle';
  } else if (!isTenureSatisfied) {
    statusText = 'Promising (Tenure Gap)';
  } else {
    statusText = 'Qualified for Hiring';
  }

  // Badge label formatting
  const effectiveDisplayGrade = isTenureSatisfied ? targetGrade : qualifiedGrade;
  const badgeLabel = `Grade Fit: ${effectiveDisplayGrade.code} (${effectiveDisplayGrade.shortTitle}) | Benchmark Target: ${targetGrade.benchmarkScore}% (Scored: ${candidateScore.toFixed(0)}%) | Status: ${statusText}`;

  // Layer Competency Details
  const layerMeta = LAYER_COMPETENCY_DICTIONARY[effectiveDisplayGrade.layer as keyof typeof LAYER_COMPETENCY_DICTIONARY] || LAYER_COMPETENCY_DICTIONARY['Execution & Process'];
  const layerCompetencies = layerMeta.coreCompetencies.slice(0, 3).join(', ');
  const keyHardSkills = effectiveDisplayGrade.keyHardSkills.slice(0, 3).join(', ');

  // Boss / HR Action Verdict
  let oneLineVerdict = '';
  if (isBenchmarkAchieved && isTenureSatisfied) {
    oneLineVerdict = `Highly Recommended for ${targetGrade.code}: Exceeds ${targetGrade.minServiceYears}-year tenure hurdle, satisfies core RMG KRA/KSA benchmarks (${candidateScore.toFixed(0)}% vs ${benchmarkTargetScore}% target), and demonstrates solid functional proficiency.`;
  } else if (isBenchmarkAchieved && !isTenureSatisfied) {
    oneLineVerdict = `Tenure Gap for ${targetGrade.code} (Requires ${targetGrade.minServiceYears} Yrs): Has ${roundedYears} Yrs service length. Strongly qualified for ${qualifiedGrade.code} (${qualifiedGrade.shortTitle}) at ${candidateScore.toFixed(0)}% score; recommend placement at ${qualifiedGrade.code}.`;
  } else if (!isBenchmarkAchieved && isTenureSatisfied) {
    oneLineVerdict = `Tenure Satisfied (${roundedYears} Yrs) but Below Hurdle for ${targetGrade.code}: Scored ${candidateScore.toFixed(0)}% against ${benchmarkTargetScore}% benchmark; critical technical skills and KRA execution require review before hiring.`;
  } else {
    oneLineVerdict = `Under-Tenured and Below Benchmark for ${targetGrade.code}: Scored ${candidateScore.toFixed(0)}% vs ${benchmarkTargetScore}% target with ${roundedYears} Yrs tenure; consider for ${qualifiedGrade.code} or trainee screening pool.`;
  }

  return {
    cadre: effectiveDisplayGrade.cadre,
    layer: effectiveDisplayGrade.layer,
    targetGradeCode: targetGrade.code,
    targetGradeTitle: targetGrade.shortTitle,
    targetRequiredYears: targetGrade.minServiceYears,
    qualifiedGradeCode: qualifiedGrade.code,
    qualifiedGradeTitle: qualifiedGrade.shortTitle,
    qualifiedRequiredYears: qualifiedGrade.minServiceYears,
    actualServiceYears: roundedYears,
    actualServiceMonths: serviceMonths,
    benchmarkTargetScore,
    candidateScore,
    isBenchmarkAchieved,
    isTenureSatisfied,
    statusText,
    tenureGapNotice,
    badgeLabel,
    oneLineVerdict,
    layerCompetencies,
    keyHardSkills,
    lastCompany: lastCompany || 'Prior RMG Organization',
    lastDesignation: lastDesignation || 'RMG Professional',
  };
}

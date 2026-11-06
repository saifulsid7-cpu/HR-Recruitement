/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Candidate, CandidateScoreBreakdown, VerdictType } from '../types';

export interface VerdictConfig {
  verdict: VerdictType;
  label: string;
  badgeClass: string;
  pillBg: string;
  borderClass: string;
  textClass: string;
  dotClass: string;
}

/**
 * Returns verdict badge configuration according to user requirements:
 * 'Perfect Matched' (Green), 'Better' (Teal), 'Good/Average' (Yellow), or 'Irrelevant' (Red)
 */
export function getVerdictBadge(score: number): VerdictConfig {
  if (score >= 85) {
    return {
      verdict: 'Perfect Matched',
      label: 'Perfect Matched',
      badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-600/60 ring-1 ring-emerald-500/30',
      pillBg: 'bg-emerald-500/15',
      borderClass: 'border-emerald-500/40',
      textClass: 'text-emerald-400',
      dotClass: 'bg-emerald-400',
    };
  }
  if (score >= 70) {
    return {
      verdict: 'Better',
      label: 'Better',
      badgeClass: 'bg-teal-950/70 text-teal-300 border-teal-600/60 ring-1 ring-teal-500/30',
      pillBg: 'bg-teal-500/15',
      borderClass: 'border-teal-500/40',
      textClass: 'text-teal-300',
      dotClass: 'bg-teal-400',
    };
  }
  if (score >= 50) {
    return {
      verdict: 'Good',
      label: 'Good',
      badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-600/60 ring-1 ring-amber-500/30',
      pillBg: 'bg-amber-500/15',
      borderClass: 'border-amber-500/40',
      textClass: 'text-amber-400',
      dotClass: 'bg-amber-400',
    };
  }
  return {
    verdict: 'Irrelevant / Domain Mismatch',
    label: 'Irrelevant / Domain Mismatch',
    badgeClass: 'bg-rose-950/70 text-rose-300 border-rose-600/60 ring-1 ring-rose-500/30',
    pillBg: 'bg-rose-500/15',
    borderClass: 'border-rose-500/40',
    textClass: 'text-rose-400',
    dotClass: 'bg-rose-400',
  };
}

/**
 * Calculates Match Score Breakdown across the 4 required dimensions:
 * a. Core Responsibilities & Duties Match: 40% (Candidate's proven daily operations vs target JD tasks)
 * b. Industry & Product Alignment: 30% (Direct experience in Denim/Woven/Apparel manufacturing vs mismatch)
 * c. Software, Tools & Buyer Portfolio: 15% (FastReact, Optitex, H&M, Inditex, etc.)
 * d. Required Years of Experience & Education: 15%
 */
export function getCandidateScoreBreakdown(candidate: Candidate): CandidateScoreBreakdown {
  if (candidate.scoringBreakdown) {
    return candidate.scoringBreakdown;
  }

  const crit = candidate.criteriaMarks || {};

  // a. Core Responsibilities & Duties Match (Weight: 40)
  const taskObtained = crit.technical_skills?.obtainedMarks ?? Math.round((candidate.score * 0.40));
  const taskMax = 40;
  const taskPct = Math.min(100, Math.round((taskObtained / taskMax) * 100));

  // b. Industry & Product Alignment (Weight: 30)
  const industryObtained = crit.relevant_experience?.obtainedMarks ?? Math.round((candidate.score * 0.30));
  const industryMax = 30;
  const industryPct = Math.min(100, Math.round((industryObtained / industryMax) * 100));

  // c. Software, Tools & Buyer Portfolio (Weight: 15)
  const buyerObtained = crit.industry_knowledge?.obtainedMarks ?? Math.round((candidate.score * 0.15));
  const buyerMax = 15;
  const buyerPct = Math.min(100, Math.round((buyerObtained / buyerMax) * 100));

  // d. Required Years of Experience & Education (Weight: 15)
  const eduObtained = crit.education?.obtainedMarks ?? Math.round((candidate.score * 0.15));
  const eduMax = 15;
  const eduPct = Math.min(100, Math.round((eduObtained / eduMax) * 100));

  return {
    domainExperience: { obtained: industryObtained, max: industryMax, percentage: industryPct },
    ksaDailyDuties: { obtained: taskObtained, max: taskMax, percentage: taskPct },
    education: { obtained: eduObtained, max: eduMax, percentage: eduPct },
    buyerSoftwareKnowledge: { obtained: buyerObtained, max: buyerMax, percentage: buyerPct },
  };
}

/**
 * Computes a concise advice Action Opinion Sentence
 * Dynamically tailored to the active position and candidate's proven competencies.
 */
export function getCandidateActionOpinion(candidate: Candidate): string {
  if (candidate.actionOpinion && candidate.actionOpinion.trim()) {
    return candidate.actionOpinion;
  }

  const score = candidate.score;
  const position = candidate.appliedPosition || candidate.category || 'target position';
  const tools = (candidate.cadSoftwareProficiency && candidate.cadSoftwareProficiency.length > 0)
    ? candidate.cadSoftwareProficiency.slice(0, 2).join(', ')
    : (candidate.skills && candidate.skills.length > 0)
      ? candidate.skills.slice(0, 2).join(', ')
      : 'functional competencies';
  const isTenureFlag = candidate.jobStability?.isFrequentJobChanger;

  if (score >= 85) {
    return `Strong domain match for ${position}; proceed immediately to interview for functional validation and verification of ${tools}.`;
  }
  if (score >= 70) {
    if (isTenureFlag) {
      return `Solid match for ${position}; proceed to 1st round interview with tenure stability evaluation.`;
    }
    return `Good alignment with core requirements for ${position}; recommend scheduling technical / functional interview.`;
  }
  if (score >= 50) {
    if (isTenureFlag) {
      return `Moderate skills match with tenure concerns; retain as backup candidate for ${position}.`;
    }
    return `Meets foundational requirements for ${position} with some skill gaps; consider for secondary review.`;
  }
  return `Core competencies and career track do not match ${position}; retain in CV bank for future opportunities.`;
}

/**
 * Extracts distinct Key Strengths vs Critical Gaps bullet points
 */
export function getCandidateStrengthsAndGaps(candidate: Candidate): {
  strengths: string[];
  gaps: string[];
} {
  // Strengths
  let strengths = candidate.keyStrengths || [];
  if (strengths.length === 0) {
    const list: string[] = [];
    if (candidate.matchingQualifications && candidate.matchingQualifications.length > 0) {
      list.push(...candidate.matchingQualifications.slice(0, 3));
    }
    if (candidate.buyersWorkedWith && candidate.buyersWorkedWith.length > 0) {
      list.push(`Demonstrated buyer exposure: ${candidate.buyersWorkedWith.slice(0, 3).join(', ')}`);
    }
    if (candidate.cadSoftwareProficiency && candidate.cadSoftwareProficiency.length > 0) {
      list.push(`Software proficiency: ${candidate.cadSoftwareProficiency.slice(0, 2).join(', ')}`);
    }
    if (list.length === 0 && candidate.skills?.length) {
      list.push(...candidate.skills.slice(0, 3));
    }
    strengths = list.slice(0, 3);
  }

  // Critical Gaps
  let gaps = candidate.criticalGaps || [];
  if (gaps.length === 0) {
    const list: string[] = [];
    if (candidate.jobStability?.isFrequentJobChanger) {
      list.push(`Tenure stability alert: Average ${candidate.jobStability.averageTenureMonths} mos per employer`);
    }
    if (candidate.gapsAndMismatches && candidate.gapsAndMismatches.length > 0) {
      list.push(...candidate.gapsAndMismatches.slice(0, 2));
    }
    if (candidate.unverifiableInformation && candidate.unverifiableInformation.length > 0) {
      list.push(`Unverified in CV: ${candidate.unverifiableInformation[0]}`);
    }
    if (list.length === 0) {
      list.push('No critical disqualifying technical gaps identified');
    }
    gaps = list.slice(0, 3);
  }

  return { strengths, gaps };
}

export type DualRecommendationBadge =
  | 'Perfect Matched'
  | 'Relevant / Perfect Matched'
  | 'Better'
  | 'Good / Shortlisted (Initial)'
  | 'Good / Average'
  | 'Irrelevant';

export interface DualScoreModelResult {
  pillar1KraScore: number;
  pillar2RequirementsScore: number;
  totalRawScore: number;
  convertedFinalScore: number;
  recommendationBadge: DualRecommendationBadge;
  badgeClass: string;
  pillBg: string;
  borderClass: string;
  textClass: string;
  dotClass: string;
  hrActionOpinion: string;
}

export function getDualBadgeConfig(badgeOrScore: DualRecommendationBadge | number): {
  badge: DualRecommendationBadge;
  badgeClass: string;
  pillBg: string;
  borderClass: string;
  textClass: string;
  dotClass: string;
} {
  let badge: DualRecommendationBadge = 'Good / Average';
  if (typeof badgeOrScore === 'number') {
    if (badgeOrScore >= 85) badge = 'Perfect Matched';
    else if (badgeOrScore >= 70) badge = 'Better';
    else if (badgeOrScore >= 50) badge = 'Good / Average';
    else badge = 'Irrelevant';
  } else {
    badge = badgeOrScore;
  }

  if (badge === 'Perfect Matched' || badge === 'Relevant / Perfect Matched') {
    return {
      badge,
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 ring-1 ring-emerald-500/30',
      pillBg: 'bg-emerald-500/15',
      borderClass: 'border-emerald-500/40',
      textClass: 'text-emerald-400',
      dotClass: 'bg-emerald-400',
    };
  }
  if (badge === 'Better') {
    return {
      badge,
      badgeClass: 'bg-teal-950/80 text-teal-300 border-teal-500/60 ring-1 ring-teal-500/30',
      pillBg: 'bg-teal-500/15',
      borderClass: 'border-teal-500/40',
      textClass: 'text-teal-300',
      dotClass: 'bg-teal-400',
    };
  }
  if (badge === 'Good / Shortlisted (Initial)') {
    return {
      badge,
      badgeClass: 'bg-sky-950/80 text-sky-300 border-sky-500/60 ring-1 ring-sky-500/30',
      pillBg: 'bg-sky-500/15',
      borderClass: 'border-sky-500/40',
      textClass: 'text-sky-300',
      dotClass: 'bg-sky-400',
    };
  }
  if (badge === 'Good / Average') {
    return {
      badge,
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/60 ring-1 ring-amber-500/30',
      pillBg: 'bg-amber-500/15',
      borderClass: 'border-amber-500/40',
      textClass: 'text-amber-400',
      dotClass: 'bg-amber-400',
    };
  }
  return {
    badge: 'Irrelevant',
    badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/60 ring-1 ring-rose-500/30',
    pillBg: 'bg-rose-500/15',
    borderClass: 'border-rose-500/40',
    textClass: 'text-rose-400',
    dotClass: 'bg-rose-400',
  };
}

/**
 * Dual 100-Point Scoring Model (Total 200 Scaled to 100)
 * Evaluates candidate across:
 * - Pillar 1: Tasks, Responsibilities & Competencies (0-100)
 * - Pillar 2: Additional Requirements dynamically weighted based on filled criteria (0-100)
 * - Total Raw Score: Pillar 1 + Pillar 2 (0-200)
 * - Converted Final Score: Total Raw Score / 2 (0-100%)
 */
export function computeDualScoreModel(
  candidate: Candidate,
  targetRequisition?: {
    title?: string;
    department?: string;
    academicDegree?: string;
    yearsOfExperience?: string;
    cadSoftware?: string[];
    buyersWorkedWith?: string[];
    companyType?: string;
    jobRequirements?: string;
    keyResponsibilities?: string;
    keyKSA?: string;
  } | null
): DualScoreModelResult {
  // If already computed by server
  if (
    typeof candidate.pillar1KraScore === 'number' &&
    typeof candidate.pillar2RequirementsScore === 'number' &&
    typeof candidate.totalRawScore === 'number' &&
    typeof candidate.convertedFinalScore === 'number' &&
    candidate.recommendationBadge
  ) {
    const styling = getDualBadgeConfig(candidate.recommendationBadge);
    return {
      pillar1KraScore: candidate.pillar1KraScore,
      pillar2RequirementsScore: candidate.pillar2RequirementsScore,
      totalRawScore: candidate.totalRawScore,
      convertedFinalScore: candidate.convertedFinalScore,
      recommendationBadge: candidate.recommendationBadge,
      ...styling,
      hrActionOpinion: candidate.hrActionOpinion || getCandidateActionOpinion(candidate),
    };
  }

  // 1. Pillar 1: KRA & KSA Score (0-100)
  // Derived from semantic responsibility alignment and technical skills
  const crit = candidate.criteriaMarks || {};
  let pillar1 = 70;
  if (candidate.triMatch?.jdMatch?.score) {
    pillar1 = candidate.triMatch.jdMatch.score;
  } else if (crit.technical_skills?.obtainedMarks && crit.competencies?.obtainedMarks) {
    const techPct = (crit.technical_skills.obtainedMarks / (crit.technical_skills.maxMarks || 20)) * 100;
    const compPct = (crit.competencies.obtainedMarks / (crit.competencies.maxMarks || 15)) * 100;
    pillar1 = Math.round(techPct * 0.6 + compPct * 0.4);
  } else {
    pillar1 = candidate.score;
  }
  pillar1 = Math.max(0, Math.min(100, Math.round(pillar1)));

  // 2. Pillar 2: Additional Requirements (0-100)
  // Dynamically scale points based on filled criteria in target position
  const activeCriteria: Array<{ id: string; evaluate: () => number }> = [];

  // Criteria A: Academic Degree
  if (targetRequisition?.academicDegree || targetRequisition?.jobRequirements?.toLowerCase().includes('degree')) {
    activeCriteria.push({
      id: 'degree',
      evaluate: () => {
        const edu = (candidate.academicDegrees || candidate.education || []).join(' ').toLowerCase();
        const reqEdu = (targetRequisition.academicDegree || '').toLowerCase();
        if (!reqEdu) return 85;
        if (edu.includes('textile') || edu.includes('fashion') || edu.includes('b.sc') || edu.includes('mba') || edu.includes('masters')) {
          return 95;
        }
        return (candidate.education && candidate.education.length > 0) ? 80 : 50;
      },
    });
  }

  // Criteria B: Years of Experience
  if (targetRequisition?.yearsOfExperience || targetRequisition?.jobRequirements?.toLowerCase().includes('year')) {
    activeCriteria.push({
      id: 'experience',
      evaluate: () => {
        const actual = candidate.totalYearsExperience ?? (candidate.relevantExperienceYears || 0);
        let reqNum = 3;
        const match = (targetRequisition.yearsOfExperience || '').match(/(\d+(?:\.\d+)?)/);
        if (match) reqNum = parseFloat(match[1]);
        if (actual >= reqNum) return 100;
        if (actual >= reqNum * 0.7) return 80;
        if (actual >= reqNum * 0.4) return 60;
        return 40;
      },
    });
  }

  // Criteria C: CAD Software / Technical Tools
  if (
    (targetRequisition?.cadSoftware && targetRequisition.cadSoftware.length > 0) ||
    targetRequisition?.jobRequirements?.toLowerCase().includes('cad')
  ) {
    activeCriteria.push({
      id: 'cad_software',
      evaluate: () => {
        const tools = (candidate.cadSoftwareProficiency || candidate.skills || []).join(' ').toLowerCase();
        const targetTools = targetRequisition?.cadSoftware || ['optitex', 'gerber', 'lectra'];
        const matched = targetTools.some((t) => tools.includes(t.toLowerCase()));
        return matched ? 95 : 60;
      },
    });
  }

  // Criteria D: Buyers Worked With or Company Type
  if (
    (targetRequisition?.buyersWorkedWith && targetRequisition.buyersWorkedWith.length > 0) ||
    targetRequisition?.companyType
  ) {
    activeCriteria.push({
      id: 'buyer_company',
      evaluate: () => {
        const candBuyers = candidate.buyersWorkedWith || [];
        const candEnv = (candidate.workEnvironment || '').toLowerCase();
        let pts = 70;
        if (candBuyers.length > 0) pts += 20;
        if (targetRequisition?.companyType && candEnv.includes(targetRequisition.companyType.toLowerCase())) {
          pts += 10;
        }
        return Math.min(100, pts);
      },
    });
  }

  // Dynamic Scaling calculation:
  // If no specific criteria are filled, use standard 4-dimension default (Degree, Experience, Knowledge, Tools)
  let pillar2 = 75;
  if (activeCriteria.length > 0) {
    const pointsPerCriterion = 100 / activeCriteria.length;
    let earnedPoints = 0;
    for (const c of activeCriteria) {
      const percentage = c.evaluate();
      earnedPoints += (percentage / 100) * pointsPerCriterion;
    }
    pillar2 = Math.round(earnedPoints);
  } else {
    // Default evaluation from criteriaMarks or triMatch
    if (candidate.triMatch?.requirementsMatch?.score) {
      pillar2 = candidate.triMatch.requirementsMatch.score;
    } else {
      pillar2 = Math.round(candidate.score * 0.95);
    }
  }
  pillar2 = Math.max(0, Math.min(100, Math.round(pillar2)));

  // Total Raw Score: Pillar 1 + Pillar 2 (out of 200)
  const totalRawScore = pillar1 + pillar2;

  // Converted Final Score: Total Raw Score / 2 (0-100%)
  const convertedFinalScore = Math.round(totalRawScore / 2);

  // Recommendation Badges:
  // 85% - 100%: 'Relevant / Perfect Matched' (Green)
  // 70% - 84%: 'Better' (Teal)
  // 50% - 69%: 'Good / Average' (Yellow)
  // Below 50%: 'Irrelevant' (Red)
  let recommendationBadge: DualRecommendationBadge = 'Good / Average';
  if (convertedFinalScore >= 85) {
    recommendationBadge = 'Relevant / Perfect Matched';
  } else if (convertedFinalScore >= 70) {
    recommendationBadge = 'Better';
  } else if (convertedFinalScore >= 50) {
    recommendationBadge = 'Good / Average';
  } else {
    recommendationBadge = 'Irrelevant';
  }

  const badgeConfig = getDualBadgeConfig(recommendationBadge);

  // 1-sentence HR action opinion
  const pos = targetRequisition?.title || candidate.appliedPosition || 'the role';
  const lastDesig = candidate.lastDesignation || 'Candidate';
  const expYears = (candidate.totalYearsExperience ?? (candidate.relevantExperienceYears || 0)).toFixed(1);
  let hrActionOpinion = '';

  if (convertedFinalScore >= 85) {
    hrActionOpinion = `Direct fit for ${pos} with proven ${lastDesig} operational leadership and ${expYears} yrs experience; prioritize for 1st round interview.`;
  } else if (convertedFinalScore >= 70) {
    hrActionOpinion = `Strong alignment with ${pos} functional duties bringing ${expYears} yrs experience; proceed to interview for technical verification.`;
  } else if (convertedFinalScore >= 50) {
    hrActionOpinion = `Foundational competencies present for ${pos} with development areas; consider as secondary backup or for preliminary review.`;
  } else {
    hrActionOpinion = `Career track and operational deliverables do not align with ${pos}; retain profile in CV Bank for matching verticals.`;
  }

  return {
    pillar1KraScore: pillar1,
    pillar2RequirementsScore: pillar2,
    totalRawScore,
    convertedFinalScore,
    recommendationBadge,
    ...badgeConfig,
    hrActionOpinion,
  };
}


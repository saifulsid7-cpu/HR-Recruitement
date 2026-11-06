/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Candidate,
  JobStability,
  SalaryFixation,
  SalaryMatrixRow,
  TenureRecord,
  WorkExperience,
} from '../types';

export const DEFAULT_SALARY_MATRIX: SalaryMatrixRow[] = [
  {
    id: 'row_me_2',
    designation: 'Senior General Manager',
    categoryLayer: 'GM layer',
    grade: 'ME-2',
    requiredExperience: '23.5 Years',
    minRequiredScore: '85-100%',
    merchandisingSalary: 'TK 275,000',
    fashionDesigningSalary: 'N/A',
    accountsCommercialSalary: 'TK 225,000',
    qaSalary: 'TK 225,000',
    sewingCuttingSalary: 'TK 225,000 (Sewing)',
  },
  {
    id: 'row_me_3',
    designation: 'General Manager',
    categoryLayer: 'GM layer',
    grade: 'ME-3',
    requiredExperience: '20.5 Years',
    minRequiredScore: '85-100%',
    merchandisingSalary: 'TK 250,000',
    fashionDesigningSalary: 'N/A',
    accountsCommercialSalary: 'TK 200,000',
    qaSalary: 'TK 200,000',
    sewingCuttingSalary: 'TK 200,000 (Sewing)',
  },
  {
    id: 'row_me_4',
    designation: 'Deputy General Manager',
    categoryLayer: 'GM layer',
    grade: 'ME-4',
    requiredExperience: '17.5 Years',
    minRequiredScore: '85-100%',
    merchandisingSalary: 'TK 225,000',
    fashionDesigningSalary: 'N/A',
    accountsCommercialSalary: 'TK 175,000',
    qaSalary: 'TK 175,000',
    sewingCuttingSalary: 'TK 175,000 (Sewing)',
  },
  {
    id: 'row_me_5',
    designation: 'Assistant General Manager',
    categoryLayer: 'GM layer',
    grade: 'ME-5',
    requiredExperience: '14.5 Years',
    minRequiredScore: '85-100%',
    merchandisingSalary: 'TK 200,000',
    fashionDesigningSalary: 'N/A',
    accountsCommercialSalary: 'TK 150,000',
    qaSalary: 'TK 150,000',
    sewingCuttingSalary: 'TK 150,000 (Sewing)',
  },
  {
    id: 'row_me_6',
    designation: 'Senior Manager',
    categoryLayer: 'Manager layer',
    grade: 'ME-6',
    requiredExperience: '12.5 Years',
    minRequiredScore: '70-84%',
    merchandisingSalary: 'TK 150,000',
    fashionDesigningSalary: 'TK 105,000',
    accountsCommercialSalary: 'TK 105,000',
    qaSalary: 'TK 105,000',
    sewingCuttingSalary: 'TK 105,000',
  },
  {
    id: 'row_me_7',
    designation: 'Manager',
    categoryLayer: 'Manager layer',
    grade: 'ME-7',
    requiredExperience: '10.5 Years',
    minRequiredScore: '70-84%',
    merchandisingSalary: 'TK 120,000',
    fashionDesigningSalary: 'TK 90,000',
    accountsCommercialSalary: 'TK 90,000',
    qaSalary: 'TK 90,000',
    sewingCuttingSalary: 'TK 90,000',
  },
  {
    id: 'row_me_8',
    designation: 'Deputy Manager',
    categoryLayer: 'Manager layer',
    grade: 'ME-8',
    requiredExperience: '8.5 Years',
    minRequiredScore: '70-84%',
    merchandisingSalary: 'TK 90,000',
    fashionDesigningSalary: 'TK 75,000',
    accountsCommercialSalary: 'TK 75,000',
    qaSalary: 'TK 75,000',
    sewingCuttingSalary: 'TK 75,000',
  },
  {
    id: 'row_me_9',
    designation: 'Assistant Manager',
    categoryLayer: 'Manager layer',
    grade: 'ME-9',
    requiredExperience: '6.5 Years',
    minRequiredScore: '70-84%',
    merchandisingSalary: 'TK 75,000',
    fashionDesigningSalary: 'TK 60,000',
    accountsCommercialSalary: 'TK 60,000',
    qaSalary: 'TK 60,000',
    sewingCuttingSalary: 'TK 60,000',
  },
  {
    id: 'row_me_10',
    designation: 'Senior Executive / Senior Merchandiser / Senior Designer',
    categoryLayer: 'Executive layer',
    grade: 'ME-10',
    requiredExperience: '4.5 Years (55+ mos)',
    minRequiredScore: '55-69%',
    merchandisingSalary: 'TK 65,000 (55 mos & above)',
    fashionDesigningSalary: 'TK 50,000 (Senior Designer)',
    accountsCommercialSalary: 'TK 40,000',
    qaSalary: 'TK 45,000 (In Charge) / TK 35,600',
    sewingCuttingSalary: 'TK 40,000 / TK 44,500 (In Charge)',
  },
  {
    id: 'row_me_11',
    designation: 'Executive / Merchandiser / Designer',
    categoryLayer: 'Executive layer',
    grade: 'ME-11',
    requiredExperience: '3.0 - 4.5 Years',
    minRequiredScore: '55-69%',
    merchandisingSalary: '36-42 mos: TK 40,000 | 43-48 mos: TK 45,000 | 49-54 mos: TK 50,000',
    fashionDesigningSalary: 'TK 40,000 (Designer)',
    accountsCommercialSalary: 'TK 35,000',
    qaSalary: 'TK 29,000 (QC) / TK 29,500 (Auditor)',
    sewingCuttingSalary: 'TK 35,000 / TK 30,000 (Supervisor)',
  },
  {
    id: 'row_me_12',
    designation: 'Assistant Executive / Assistant Merchandiser / Assistant Designer',
    categoryLayer: 'Executive layer',
    grade: 'ME-12',
    requiredExperience: '1.0 - 2.5 Years',
    minRequiredScore: '55-69%',
    merchandisingSalary: '12-18 mos: TK 32,000 | 19-30 mos: TK 34,000',
    fashionDesigningSalary: 'In-House: TK 30,000 | External: TK 35,000',
    accountsCommercialSalary: 'In-House: TK 26,000 | External: TK 27,500',
    qaSalary: 'In-House: TK 25,000 | External: TK 27,000',
    sewingCuttingSalary: 'In-House: TK 26,000 | External: TK 27,500',
  },
  {
    id: 'row_me_13',
    designation: 'Trainee',
    categoryLayer: 'Executive layer',
    grade: 'ME-13',
    requiredExperience: 'Fresher / Irrelevant Exp',
    minRequiredScore: '55%+',
    merchandisingSalary: 'C: TK 20,000 | B: TK 21,000 | A: TK 22,000',
    fashionDesigningSalary: 'C: TK 20,000 | B: TK 21,000 | A: TK 22,000',
    accountsCommercialSalary: 'C: TK 20,000 | B: TK 21,000 | A: TK 22,000',
    qaSalary: 'C: TK 20,000 | B: TK 21,000 | A: TK 22,000',
    sewingCuttingSalary: 'C: TK 20,000 | B: TK 21,000 | A: TK 22,000',
  },
  {
    id: 'row_me_14',
    designation: 'Senior Supervisor / Senior Cutter Supervisor',
    categoryLayer: 'SS layer',
    grade: 'ME-14',
    requiredExperience: 'SS Senior Role',
    minRequiredScore: '55-69%',
    merchandisingSalary: 'N/A',
    fashionDesigningSalary: 'N/A',
    accountsCommercialSalary: 'N/A',
    qaSalary: 'N/A',
    sewingCuttingSalary: 'TK 21,700 - TK 28,000',
  },
  {
    id: 'row_me_15',
    designation: 'Associate / Supervisor / Driver',
    categoryLayer: 'SS layer',
    grade: 'ME-15',
    requiredExperience: 'Staff Level',
    minRequiredScore: '55-69%',
    merchandisingSalary: 'N/A',
    fashionDesigningSalary: 'N/A',
    accountsCommercialSalary: 'TK 18,000 - TK 21,500',
    qaSalary: 'N/A',
    sewingCuttingSalary: 'TK 18,000 - TK 22,800',
  },
];

const MATRIX_STORAGE_KEY = 'screener_salary_matrix_v2';

export function getStoredSalaryMatrix(): SalaryMatrixRow[] {
  try {
    const raw = localStorage.getItem(MATRIX_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((row: Partial<SalaryMatrixRow>, i: number) => ({
          ...row,
          id: row.id || `row_${row.grade?.toLowerCase().replace(/[^a-z0-9]/g, '_') || i}`,
        })) as SalaryMatrixRow[];
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_SALARY_MATRIX;
}

export function saveSalaryMatrix(matrix: SalaryMatrixRow[]): void {
  try {
    localStorage.setItem(MATRIX_STORAGE_KEY, JSON.stringify(matrix));
  } catch {
    // ignore
  }
}

export function resetSalaryMatrix(): SalaryMatrixRow[] {
  try {
    localStorage.removeItem(MATRIX_STORAGE_KEY);
  } catch {
    // ignore
  }
  return DEFAULT_SALARY_MATRIX;
}

export function parseDurationToMonths(durationStr?: string, fallbackMonths = 12): number {
  if (!durationStr || typeof durationStr !== 'string') {
    return fallbackMonths > 0 ? fallbackMonths : 12;
  }
  const text = durationStr.trim().toLowerCase();

  const monthMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:mos|months?|mths?)/i);
  if (monthMatch) return Math.round(parseFloat(monthMatch[1]));

  const yearMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:yrs?|years?)/i);
  if (yearMatch) return Math.round(parseFloat(yearMatch[1]) * 12);

  const yearRangeMatch = text.match(/(\d{4})\s*[-–to]+\s*(\d{4}|present|current)/i);
  if (yearRangeMatch) {
    const startYear = parseInt(yearRangeMatch[1], 10);
    const endYear =
      yearRangeMatch[2] === 'present' || yearRangeMatch[2] === 'current'
        ? new Date().getFullYear()
        : parseInt(yearRangeMatch[2], 10);
    const diff = Math.max(0.5, endYear - startYear);
    return Math.round(diff * 12);
  }

  return fallbackMonths > 0 ? fallbackMonths : 12;
}

export function calculateJobStability(
  experience: WorkExperience[] = [],
  totalYears = 0
): JobStability {
  const totalMonthsFromExp = Math.round(totalYears * 12);
  const totalJobs = experience.length;

  if (totalJobs === 0) {
    return {
      isFrequentJobChanger: false,
      disallowed: false,
      averageTenureMonths: totalMonthsFromExp || 0,
      averageTenureYears: totalYears || 0,
      shortTenuresCount: 0,
      totalJobs: 0,
      tenureBreakdown: [],
      warningSignText: 'Stable / Entry Profile',
      flagReason: 'No previous employment history recorded.',
    };
  }

  const fallbackPerJob = totalMonthsFromExp > 0 ? Math.round(totalMonthsFromExp / totalJobs) : 12;
  const tenureBreakdown: TenureRecord[] = experience.map((item) => {
    const estMonths = parseDurationToMonths(item.duration, fallbackPerJob);
    return {
      role: item.role,
      company: item.company || 'Company',
      duration: item.duration || `${estMonths} mos`,
      estimatedMonths: estMonths,
      isLessThanOneAndHalfYears: estMonths < 18,
    };
  });

  const sumMonths = tenureBreakdown.reduce((acc, curr) => acc + curr.estimatedMonths, 0);
  const averageTenureMonths = Math.round(sumMonths / totalJobs);
  const averageTenureYears = parseFloat((averageTenureMonths / 12).toFixed(1));
  const shortTenuresCount = tenureBreakdown.filter((item) => item.isLessThanOneAndHalfYears).length;

  // Strict 1.5-year retention rule:
  // If candidate has 2 or more previous jobs and average tenure is < 18 months, or has 2+ short tenures
  const isFrequentJobChanger =
    totalJobs >= 2 &&
    (averageTenureMonths < 18 || shortTenuresCount >= 2 || (shortTenuresCount === totalJobs && totalJobs >= 2));
  const disallowed = isFrequentJobChanger;

  let warningSignText = 'Tenure Stable (≥ 1.5 yrs)';
  let flagReason = 'Candidate maintains stable job tenure meeting the 1.5-year retention policy.';

  if (isFrequentJobChanger) {
    warningSignText = '🚫 NOT ALLOWED · Rapid Job Changer (< 1.5 yrs)';
    flagReason = `Policy Violation: Candidate frequently switches jobs with an average tenure of ${averageTenureMonths} months (${averageTenureYears} yrs). ${shortTenuresCount} of ${totalJobs} previous positions lasted less than 1.5 years (18 months). Not allowed under strict retention policy.`;
  } else if (shortTenuresCount === 1 && totalJobs > 1) {
    warningSignText = '⚠️ 1 Short Tenure (< 1.5 yrs)';
    flagReason = `Candidate has 1 position under 1.5 years, but overall average tenure is ${averageTenureMonths} months (${averageTenureYears} yrs).`;
  }

  return {
    isFrequentJobChanger,
    disallowed,
    averageTenureMonths,
    averageTenureYears,
    shortTenuresCount,
    totalJobs,
    tenureBreakdown,
    warningSignText,
    flagReason,
  };
}

function parseSalaryFromCell(
  cellText: string,
  context?: { expMonths: number; sourcingType: 'external' | 'in-house'; score: number }
): number | null {
  if (!cellText || cellText.trim() === '' || cellText.trim().toUpperCase() === 'N/A') {
    return null;
  }
  const str = cellText.trim();
  const expMonths = context?.expMonths ?? 0;
  const sourcingType = context?.sourcingType || 'external';
  const score = context?.score ?? 70;

  // Pattern: "In-House: TK 30,000 | External: TK 35,000"
  if (/in-house/i.test(str) && /external/i.test(str)) {
    const rx =
      sourcingType === 'external'
        ? /external\s*:\s*(?:TK\s*)?([0-9,]+)/i
        : /in-house\s*:\s*(?:TK\s*)?([0-9,]+)/i;
    const match = str.match(rx);
    if (match && match[1]) {
      const val = parseInt(match[1].replace(/,/g, ''), 10);
      if (!isNaN(val)) return val;
    }
  }

  // Pattern: "C: TK 20,000 | B: TK 21,000 | A: TK 22,000"
  if (/A\s*:\s*(?:TK\s*)?[0-9]/i.test(str) && /B\s*:\s*(?:TK\s*)?[0-9]/i.test(str)) {
    const tier = score >= 85 ? 'A' : score >= 70 ? 'B' : 'C';
    const rx = new RegExp(`${tier}\\s*:\\s*(?:TK\\s*)?([0-9,]+)(?:k)?`, 'i');
    const match = str.match(rx);
    if (match && match[1]) {
      let val = parseInt(match[1].replace(/,/g, ''), 10);
      if (val < 1000) val *= 1000;
      if (!isNaN(val)) return val;
    }
  }

  // Pattern: "12-18 mos: TK 32,000 | 19-30 mos: TK 34,000"
  if (/mos/i.test(str) && /\|/i.test(str)) {
    const segments = str.split('|').map((s) => s.trim());
    for (const seg of segments) {
      const rangeMatch = seg.match(/(\d+)\s*-\s*(\d+)\s*mos/i);
      if (rangeMatch) {
        const minM = parseInt(rangeMatch[1], 10);
        const maxM = parseInt(rangeMatch[2], 10);
        if (expMonths >= minM && expMonths <= maxM) {
          const moneyMatch = seg.match(/(?:TK\s*)?([0-9,]+)/i);
          if (moneyMatch && moneyMatch[1]) {
            const val = parseInt(moneyMatch[1].replace(/,/g, ''), 10);
            if (!isNaN(val) && val > 1000) return val;
          }
        }
      }
    }
  }

  // Simple number extraction fallback: "TK 65,000", "TK 40,000"
  const numbers = Array.from(
    str.matchAll(/(?:TK\s*)?([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,6})/gi)
  )
    .map((m) => parseInt(m[1].replace(/,/g, ''), 10))
    .filter((n) => !isNaN(n) && n >= 5000);

  return numbers.length > 0 ? numbers[0] : null;
}

export function calculateSalaryFixation({
  category,
  totalYearsExperience,
  experienceMonths,
  score,
  sourcingType = 'external',
  matrixData,
}: {
  category: string;
  totalYearsExperience: number;
  experienceMonths?: number;
  score: number;
  sourcingType?: 'external' | 'in-house';
  matrixData?: SalaryMatrixRow[];
}): SalaryFixation {
  const matrix = matrixData && matrixData.length > 0 ? matrixData : getStoredSalaryMatrix();
  const getRow = (grade: string) =>
    matrix.find((r) => r.grade.trim().toUpperCase() === grade.trim().toUpperCase());

  const months =
    experienceMonths !== undefined && experienceMonths > 0
      ? experienceMonths
      : Math.round(totalYearsExperience * 12);

  const scoreTierText =
    score >= 85
      ? 'A (Excellent: 85-100%)'
      : score >= 70
        ? 'B (Good: 70-84%)'
        : score >= 55
          ? 'C (Average: 55-69%)'
          : 'Below Minimum (<55%)';

  const catLower = (category || '').toLowerCase();
  const isMerch = category === 'Merchandising' || catLower.includes('merchandis');
  const isFashion =
    category === 'Fashion Designing' || catLower.includes('design') || catLower.includes('fashion');
  const isComm = catLower.includes('account') || catLower.includes('commercial');
  const isQA = catLower.includes('qa') || catLower.includes('quality');
  const isSewing =
    catLower.includes('sew') || catLower.includes('cutting') || catLower.includes('production');

  // Merchandising Scale
  if (isMerch) {
    if (months >= 78 && score >= 70) {
      const row = getRow('ME-9');
      const salary = row
        ? parseSalaryFromCell(row.merchandisingSalary, { expMonths: months, sourcingType, score }) ?? 75000
        : 75000;
      const desig = 'Assistant Manager - Merchandising';
      return {
        department: 'Merchandising',
        category: 'Merchandising',
        grade: 'ME-9',
        categoryLayer: row?.categoryLayer || 'Manager layer',
        eligibleDesignation: desig,
        fixedSalary: salary,
        salaryRangeText: `TK ${salary.toLocaleString()}`,
        experienceMonths: months,
        requiredMinYears: row?.requiredExperience || '6.5 Years',
        minRequiredScoreBand: row?.minRequiredScore || '70-84%',
        sourcingType,
        justification: `Candidate holds ${months} months (~${(months / 12).toFixed(1)} yrs) of merchandising experience and scored ${score}/100. Under Policy ME-9, candidate qualifies for ${desig} fixed at TK ${salary.toLocaleString()} (minimum required score: ${row?.minRequiredScore || '70-84%'}).`,
      };
    }

    if (months >= 55) {
      const row = getRow('ME-10');
      const salary = row
        ? parseSalaryFromCell(row.merchandisingSalary, { expMonths: months, sourcingType, score }) ?? 65000
        : 65000;
      const desig = 'Senior Merchandiser';
      return {
        department: 'Merchandising',
        category: 'Merchandising',
        grade: 'ME-10',
        categoryLayer: row?.categoryLayer || 'Executive layer',
        eligibleDesignation: desig,
        fixedSalary: salary,
        salaryRangeText: `TK ${salary.toLocaleString()} (55 Months & above)`,
        experienceMonths: months,
        requiredMinYears: row?.requiredExperience || '4.5 Years (55 Months)',
        minRequiredScoreBand: row?.minRequiredScore || '55-69%',
        sourcingType,
        justification: `Candidate has ${months} months (~${(months / 12).toFixed(1)} yrs) of relevant apparel merchandising experience. Per Policy Grade ME-10 (${desig}), 55 months & above with min score ${row?.minRequiredScore || '55-69%'} is fixed at TK ${salary.toLocaleString()}.`,
      };
    }

    if (months >= 36) {
      const row = getRow('ME-11');
      let salary = 40000;
      let text = '36 to 42 Months Exp = TK 40,000';
      if (months >= 49) {
        salary = 50000;
        text = '49 to 54 Months Exp = TK 50,000';
      } else if (months >= 43) {
        salary = 45000;
        text = '43 to 48 Months Exp = TK 45,000';
      }
      if (row) {
        const parsed = parseSalaryFromCell(row.merchandisingSalary, {
          expMonths: months,
          sourcingType,
          score,
        });
        if (parsed) {
          salary = parsed;
          text = `TK ${parsed.toLocaleString()}`;
        }
      }
      const desig = 'Merchandiser';
      return {
        department: 'Merchandising',
        category: 'Merchandising',
        grade: 'ME-11',
        categoryLayer: row?.categoryLayer || 'Executive layer',
        eligibleDesignation: desig,
        fixedSalary: salary,
        salaryRangeText: text,
        experienceMonths: months,
        requiredMinYears: row?.requiredExperience || '3.0 - 4.5 Years',
        minRequiredScoreBand: row?.minRequiredScore || '55-69%',
        sourcingType,
        justification: `Candidate holds ${months} months of merchandising experience and scored ${score}/100. Under Policy Grade ME-11, candidates within this experience band receive: ${text}.`,
      };
    }

    if (months >= 12) {
      const row = getRow('ME-12');
      const isSeniorAsst = months >= 19;
      let salary = isSeniorAsst ? 34000 : 32000;
      let text = isSeniorAsst
        ? '19 to 30 Months Exp = TK 34,000 (Grade ME-12)'
        : '12 to 18 Months Exp = TK 32,000 (Grade ME-12)';
      if (row) {
        const parsed = parseSalaryFromCell(row.merchandisingSalary, {
          expMonths: months,
          sourcingType,
          score,
        });
        if (parsed) {
          salary = parsed;
          text = `TK ${parsed.toLocaleString()}`;
        }
      }
      const desig = 'Assistant Merchandiser';
      return {
        department: 'Merchandising',
        category: 'Merchandising',
        grade: 'ME-12',
        categoryLayer: row?.categoryLayer || 'Executive layer',
        eligibleDesignation: desig,
        fixedSalary: salary,
        salaryRangeText: text,
        experienceMonths: months,
        requiredMinYears: row?.requiredExperience || '1.0 - 2.5 Years',
        minRequiredScoreBand: row?.minRequiredScore || '55-69%',
        sourcingType,
        justification: `Candidate has ${months} months (~${(months / 12).toFixed(1)} yrs) of direct merchandising experience. Per Policy Grade ME-12 (${desig}), salary is fixed at ${text}. With a score of ${score}/100, candidate satisfies the ${row?.minRequiredScore || '55-69%'} threshold.`,
      };
    }

    // ME-13 Trainee
    const row = getRow('ME-13');
    let salary = 20000;
    if (score >= 85) salary = 22000;
    else if (score >= 70) salary = 21000;
    if (row) {
      const parsed = parseSalaryFromCell(row.merchandisingSalary, {
        expMonths: months,
        sourcingType,
        score,
      });
      if (parsed) salary = parsed;
    }
    const desig = 'Management Trainee - Merchandising';
    return {
      department: 'Merchandising',
      category: 'Merchandising',
      grade: 'ME-13',
      categoryLayer: row?.categoryLayer || 'Executive layer',
      eligibleDesignation: desig,
      fixedSalary: salary,
      salaryRangeText: `Trainee Rank (${scoreTierText}): TK ${salary.toLocaleString()}`,
      experienceMonths: months,
      requiredMinYears: row?.requiredExperience || 'Fresher / Entry',
      minRequiredScoreBand: row?.minRequiredScore || '55%+',
      sourcingType,
      justification: `Fresher/entry candidate with ${months} months experience. Placement in Grade ME-13 Trainee. Remuneration based on evaluation score tier (${scoreTierText}): TK ${salary.toLocaleString()}.`,
    };
  }

  // Fashion Designing Scale
  if (isFashion) {
    if (months >= 78 && score >= 70) {
      const row = getRow('ME-9');
      const salary = row
        ? parseSalaryFromCell(row.fashionDesigningSalary, { expMonths: months, sourcingType, score }) ?? 60000
        : 60000;
      const desig = 'Assistant Manager - Fashion Design';
      return {
        department: 'Fashion Designing',
        category: 'Fashion Designing',
        grade: 'ME-9',
        categoryLayer: row?.categoryLayer || 'Manager layer',
        eligibleDesignation: desig,
        fixedSalary: salary,
        salaryRangeText: `TK ${salary.toLocaleString()}`,
        experienceMonths: months,
        requiredMinYears: row?.requiredExperience || '6.5 Years',
        minRequiredScoreBand: row?.minRequiredScore || '70-84%',
        sourcingType,
        justification: `With ${months} months (~${(months / 12).toFixed(1)} yrs) in fashion design and score ${score}/100, candidate qualifies for ME-9 ${desig} at TK ${salary.toLocaleString()}.`,
      };
    }

    if (months >= 54) {
      const row = getRow('ME-10');
      const salary = row
        ? parseSalaryFromCell(row.fashionDesigningSalary, { expMonths: months, sourcingType, score }) ?? 50000
        : 50000;
      const desig = 'Senior Designer';
      return {
        department: 'Fashion Designing',
        category: 'Fashion Designing',
        grade: 'ME-10',
        categoryLayer: row?.categoryLayer || 'Executive layer',
        eligibleDesignation: desig,
        fixedSalary: salary,
        salaryRangeText: `TK ${salary.toLocaleString()}`,
        experienceMonths: months,
        requiredMinYears: row?.requiredExperience || '4.5 Years',
        minRequiredScoreBand: row?.minRequiredScore || '55-69%',
        sourcingType,
        justification: `Candidate holds ${months} months (~${(months / 12).toFixed(1)} yrs) of professional fashion design experience. Under Policy Grade ME-10 (Fashion Designing), Senior Designer is fixed at TK ${salary.toLocaleString()} with min score ${row?.minRequiredScore || '55-69%'}.`,
      };
    }

    if (months >= 30) {
      const row = getRow('ME-11');
      const salary = row
        ? parseSalaryFromCell(row.fashionDesigningSalary, { expMonths: months, sourcingType, score }) ?? 40000
        : 40000;
      const desig = 'Fashion Designer (Product Development)';
      return {
        department: 'Fashion Designing',
        category: 'Fashion Designing',
        grade: 'ME-11',
        categoryLayer: row?.categoryLayer || 'Executive layer',
        eligibleDesignation: desig,
        fixedSalary: salary,
        salaryRangeText: `TK ${salary.toLocaleString()} (ME-11 Designer Pay Band)`,
        experienceMonths: months,
        requiredMinYears: row?.requiredExperience || '3.0 - 4.5 Years',
        minRequiredScoreBand: row?.minRequiredScore || '55-69%',
        sourcingType,
        justification: `Candidate has ${months} months (~${(months / 12).toFixed(1)} yrs) in fashion/denim design across leading apparel groups. Under Policy Grade ME-11 (Fashion Designing), full Designer rank is fixed at TK ${salary.toLocaleString()}.`,
      };
    }

    if (months >= 12) {
      const row = getRow('ME-12');
      let salary = sourcingType === 'external' ? 35000 : 30000;
      let text = sourcingType === 'external' ? 'External: TK 35,000' : 'In-House: TK 30,000';
      if (row) {
        const parsed = parseSalaryFromCell(row.fashionDesigningSalary, {
          expMonths: months,
          sourcingType,
          score,
        });
        if (parsed) {
          salary = parsed;
          text = `TK ${parsed.toLocaleString()}`;
        }
      }
      const desig = 'Assistant Fashion Designer';
      return {
        department: 'Fashion Designing',
        category: 'Fashion Designing',
        grade: 'ME-12',
        categoryLayer: row?.categoryLayer || 'Executive layer',
        eligibleDesignation: desig,
        fixedSalary: salary,
        salaryRangeText: text,
        experienceMonths: months,
        requiredMinYears: row?.requiredExperience || '1.0 - 2.5 Years',
        minRequiredScoreBand: row?.minRequiredScore || '55-69%',
        sourcingType,
        justification: `Per Policy Grade ME-12 for Fashion Designing: Assistant Designer through ${sourcingType} sourcing is fixed at TK ${salary.toLocaleString()}. Candidate meets the ${row?.minRequiredScore || '55-69%'} score threshold with a score of ${score}/100.`,
      };
    }

    // ME-13 Trainee
    const row = getRow('ME-13');
    let salary = 20000;
    if (score >= 85) salary = 22000;
    else if (score >= 70) salary = 21000;
    if (row) {
      const parsed = parseSalaryFromCell(row.fashionDesigningSalary, {
        expMonths: months,
        sourcingType,
        score,
      });
      if (parsed) salary = parsed;
    }
    const desig = 'Trainee Fashion Designer';
    return {
      department: 'Fashion Designing',
      category: 'Fashion Designing',
      grade: 'ME-13',
      categoryLayer: row?.categoryLayer || 'Executive layer',
      eligibleDesignation: desig,
      fixedSalary: salary,
      salaryRangeText: `Trainee Rank (${scoreTierText}): TK ${salary.toLocaleString()}`,
      experienceMonths: months,
      requiredMinYears: row?.requiredExperience || 'Fresher / Irrelevant Exp',
      minRequiredScoreBand: row?.minRequiredScore || '55%+',
      sourcingType,
      justification: `Candidate has under 12 months of design experience (${months} mos). Policy fixes Trainee remuneration by evaluation tier: A (85%+) = TK 22k, B (70-84%) = TK 21k, C (55-69%) = TK 20k. Based on score ${score}/100, fixed salary is TK ${salary.toLocaleString()}.`,
    };
  }

  // General / Operations / QA / Commercial Fallback Scale
  let targetGrade = 'ME-12';
  let targetDesig = 'Assistant Executive';
  let targetSalary = 27500;
  let targetText = 'External: TK 27,500';

  if (months >= 54) {
    targetGrade = 'ME-10';
    targetDesig = 'Senior Executive';
    targetSalary = 40000;
    targetText = 'TK 40,000';
  } else if (months >= 36) {
    targetGrade = 'ME-11';
    targetDesig = 'Executive';
    targetSalary = 35000;
    targetText = 'TK 35,000';
  } else if (months < 12) {
    targetGrade = 'ME-13';
    targetDesig = 'Trainee Executive';
    targetSalary = score >= 85 ? 22000 : score >= 70 ? 21000 : 20000;
    targetText = `TK ${targetSalary.toLocaleString()} (Score band tier)`;
  }

  const row = getRow(targetGrade);
  if (row) {
    let sourceCol = row.accountsCommercialSalary;
    if (isQA && row.qaSalary && row.qaSalary !== 'N/A') {
      sourceCol = row.qaSalary;
    } else if (isSewing && row.sewingCuttingSalary && row.sewingCuttingSalary !== 'N/A') {
      sourceCol = row.sewingCuttingSalary;
    } else if (isComm && row.accountsCommercialSalary && row.accountsCommercialSalary !== 'N/A') {
      sourceCol = row.accountsCommercialSalary;
    }
    const parsed = parseSalaryFromCell(sourceCol, { expMonths: months, sourcingType, score });
    if (parsed) {
      targetSalary = parsed;
      targetText = `TK ${parsed.toLocaleString()}`;
    }
  }

  const catLayer = row?.categoryLayer || 'Executive layer';
  return {
    department: category,
    category,
    grade: targetGrade,
    categoryLayer: catLayer,
    eligibleDesignation: targetDesig,
    fixedSalary: targetSalary,
    salaryRangeText: targetText,
    experienceMonths: months,
    requiredMinYears:
      row?.requiredExperience || (targetGrade === 'ME-10' ? '4.5 Years' : targetGrade === 'ME-11' ? '3.0 Years' : '1.0 Year'),
    minRequiredScoreBand: row?.minRequiredScore || '55-69%',
    sourcingType,
    justification: `Candidate evaluated under Policy Scale for ${category}. Based on ${months} months experience and screening score of ${score}/100, placed in Grade ${targetGrade} as ${targetDesig} fixed at ${targetText}.`,
  };
}

export function generateRejectionNotice(candidate: Candidate, companyName = 'XYZ') {
  const customReason = candidate.rejectionExplanation?.trim();
  const stability = candidate.jobStability;
  const score = candidate.rmgEvaluation?.totalWeightedScore ?? candidate.score;

  if (stability?.isFrequentJobChanger) {
    return {
      code: 'TENURE_VIOLATION',
      headline: 'Policy Violation: 1.5-Year Minimum Company Tenure Rule (< 18 Mos)',
      summary:
        customReason ||
        `Applicant disqualified under ${companyName} RMG standard retention policy. The applicant exhibits an unstable employment trajectory with repeated short tenures averaging only ${stability.averageTenureMonths} months (${stability.averageTenureYears} yrs) per company, failing the mandatory 1.5-year (18-month) continuous service requirement.`,
      detailedPoints: [
        'Corporate Policy Standard: Candidates must demonstrate at least 1.5 years (18 months) of continuous tenure per employer to qualify for onboarding.',
        `Tenure Violation: ${stability.shortTenuresCount} of ${stability.totalJobs} recorded positions ended in under 18 months, with an overall average tenure of ${stability.averageTenureMonths} months.`,
        'Production & Order Cycle Risk: Frequent job switching poses severe flight risk during multi-month RMG merchandising, sampling, and shipment delivery cycles.',
        `Decision Verdict: Strictly NOT ALLOWED under ${companyName} retention governance; application rejected.`,
      ],
      formalNoticeText: `Dear ${candidate.name || 'Applicant'},

Thank you for your interest in the ${candidate.category} position at ${companyName}. After careful review of your application and employment records, we regret to inform you that we are unable to advance your candidacy at this time.

Official Reason for Rejection:
Under our RMG Workforce Retention Standard, all prospective hires are required to demonstrate career stability with a minimum tenure benchmark of at least 1.5 years (18 months) per previous company. Your profile reflects recurring short stints (averaging ${stability.averageTenureMonths} months per company), which does not satisfy our corporate retention standard.

We appreciate the time you invested in applying to ${companyName} and wish you the best in your career pursuits.

Sincerely,
Human Resources & Recruitment Division
${companyName} RMG Division`,
    };
  }

  if (score < 50 || candidate.rmgEvaluation?.rating === 'Not Recommended') {
    return {
      code: 'LOW_SCORE',
      headline: 'Disqualified: Below RMG Standard Criteria Passing Score (< 50 pts)',
      summary:
        customReason ||
        `Candidate scored ${score.toFixed(1)}/100 on the RMG 8-Point Weighted Selection Rubric, falling short of the minimum qualifying benchmark of 50.0 points (Rating: Not Recommended).`,
      detailedPoints: [
        `Overall weighted competency score of ${score.toFixed(1)}/100 does not meet the minimum departmental threshold.`,
        `Demonstrated gaps in key technical evaluation criteria for the ${candidate.category} position.`,
        ...(candidate.missingQualifications && candidate.missingQualifications.length > 0
          ? [`Unfulfilled Core Requirements: ${candidate.missingQualifications.join(', ')}`]
          : []),
        'Decision Verdict: Does not meet minimum competency threshold; candidate rejected.',
      ],
      formalNoticeText: `Dear ${candidate.name || 'Applicant'},

Thank you for applying for the ${candidate.category} role at ${companyName}. Following our structured RMG competency evaluation, we regret to inform you that your profile did not attain the benchmark score required for this position.

We encourage you to further strengthen your domain expertise and reapply for suitable openings in the future.

Sincerely,
Talent Acquisition Team
${companyName} RMG Division`,
    };
  }

  return {
    code: 'HR_DISCRETIONARY',
    headline: 'Application Rejected: Standard Sourcing & Eligibility Benchmark',
    summary:
      customReason ||
      `Candidate does not satisfy the current recruitment specifications for the ${candidate.category} opening at this time.`,
    detailedPoints: [
      'Experience and background do not align with current project requirements.',
      ...(candidate.missingQualifications && candidate.missingQualifications.length > 0
        ? [`Missing competencies: ${candidate.missingQualifications.join(', ')}`]
        : []),
      'Decision Verdict: Candidate rejected per recruitment committee review.',
    ],
    formalNoticeText: `Dear ${candidate.name || 'Applicant'},

Thank you for applying for the ${candidate.category} opening at ${companyName}. We have decided not to advance your application at this stage.

We appreciate your interest in our organization and wish you every success in your job search.

Sincerely,
Human Resources & Recruitment Division
${companyName}`,
  };
}

export function generateOfferMemo(candidate: Candidate, companyName = 'XYZ') {
  const customReason = candidate.selectionExplanation?.trim();
  const score = candidate.rmgEvaluation?.totalWeightedScore ?? candidate.score;
  const rating =
    candidate.rmgEvaluation?.rating || (score >= 80 ? 'Highly Recommended' : 'Recommended');
  const stability = candidate.jobStability;
  const fixation = candidate.salaryFixation;
  const gradeStr = fixation?.grade ? `Grade ${fixation.grade}` : 'Standard Grade';
  const designation = fixation?.eligibleDesignation || candidate.category;
  const salaryStr =
    fixation?.salaryRangeText ||
    (fixation?.fixedSalary ? `TK ${fixation.fixedSalary.toLocaleString()}` : 'Per Policy Matrix');

  const headline =
    score >= 80
      ? `Top Candidate: Highly Recommended for Appointment (${score.toFixed(1)}/100)`
      : `Qualified Candidate: Recommended for Appointment (${score.toFixed(1)}/100)`;

  const summary =
    customReason ||
    `Candidate selected for appointment as ${designation} (${gradeStr}) under ${companyName} RMG Recruitment Policy. Demonstrated strong technical alignment (${score.toFixed(1)}/100, ${rating}), stable employment history (average tenure: ${stability?.averageTenureMonths ?? 24} months), and full qualification for Grade ${fixation?.grade || 'ME-11'} at ${salaryStr}.`;

  const detailedPoints = [
    `8-Point RMG Rubric Achievement: Scored ${score.toFixed(1)}/100 across technical skills, education, and domain requirements (Rating: ${rating}).`,
    `Workforce Stability Compliance: Candidate average tenure is ${stability?.averageTenureMonths ?? 24} months (~${stability?.averageTenureYears ?? 2.0} yrs) per company, satisfying the mandatory 1.5-year retention rule.`,
    `Official Salary Fixation Alignment: Verified relevant experience of ${fixation?.experienceMonths ?? Math.round(candidate.totalYearsExperience * 12)} months places candidate in ${gradeStr} (${designation}) at fixed monthly compensation of ${salaryStr}.`,
    `Decision Verdict: Candidate approved for appointment and formal offer letter issuance.`,
  ];

  const formalOfferMemo = `CONFIDENTIAL INTERNAL MEMORANDUM
To: Managing Director / Head of HR, ${companyName}
From: Recruitment & Selection Panel
Subject: Recommendation for Candidate Selection & Appointment — ${designation}

Candidate: ${candidate.name || `Candidate (${candidate.category})`}
Proposed Designation: ${designation}
Proposed Grade & Compensation: ${gradeStr} — ${salaryStr}
Evaluation Score: ${score.toFixed(1)}/100 (${rating})
Career Stability: Compliant (Average tenure: ${stability?.averageTenureMonths ?? 24} months, 1.5-year rule passed)

Selection Justification:
The candidate has undergone structured evaluation against our official 8-point RMG weighted criteria rubric and job stability standards. The candidate demonstrates proven capability in ${candidate.category}, meets all statutory Labour Law and compliance prerequisites, and falls cleanly into our approved salary fixation matrix.

Recommended Action:
Approve for formal offer issuance and final appointment letter onboarding.

Approved by:
Recruitment Committee, ${companyName} RMG Operations`;

  return {
    code: score >= 80 ? 'HIGHLY_RECOMMENDED' : 'RECOMMENDED',
    headline,
    summary,
    detailedPoints,
    formalOfferMemo,
  };
}

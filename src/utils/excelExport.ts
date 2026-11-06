/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { STANDARD_POSITION_CRITERIA, getRatingFromScore } from '../data/standardCriteria';
import { getStoredSalaryMatrix } from '../data/salaryMatrix';
import { Candidate, STATUS_LABELS } from '../types';

export const ADVISORY_NOTICE =
  'AI-generated evaluation for HR review only. Scores and rankings are advisory and do not constitute a hiring decision.';

export function exportCandidatesToExcel(
  candidates: Candidate[],
  fileNamePrefix = 'Candidate_Evaluation_Rankings',
  blindMode = false,
  companyName = 'XYZ'
) {
  if (!candidates || candidates.length === 0) return;

  const workbook = XLSX.utils.book_new();

  // Sheet 1: Candidate Ranking & Advisory Evaluation
  const sortedCandidates = [...candidates].sort((a, b) => {
    const rankA = a.rank ?? 999;
    const rankB = b.rank ?? 999;
    if (rankA !== rankB) return rankA - rankB;
    return b.score - a.score;
  });

  const candidatesData = sortedCandidates.map((c, index) => {
    const candidateName = blindMode ? `Candidate #${c.rank ?? index + 1}` : c.name;
    const crit = c.criteriaMarks || {};

    const row: Record<string, unknown> = {
      Rank: c.isTied ? `#${c.rank ?? index + 1} (Tied)` : `#${c.rank ?? index + 1}`,
      'Candidate Name': candidateName,
      'Applied Position': c.appliedPosition || c.category || 'General',
      'Total Score (out of 100)': c.score,
      'Verdict Badge': c.verdict || (c.score >= 85 ? 'Perfect Matched' : c.score >= 70 ? 'Better' : c.score >= 50 ? 'Good' : 'Irrelevant'),
      'JD Match (%)': c.triMatch ? `${c.triMatch.jdMatch.score}%` : `${Math.min(100, Math.round(c.score * 1.02))}%`,
      'Requirements Match (%)': c.triMatch ? `${c.triMatch.requirementsMatch.score}%` : `${Math.min(100, Math.round(c.score * 0.98))}%`,
      'Company Criteria Match (%)': c.triMatch ? `${c.triMatch.companyCriteriaMatch.score}%` : `${Math.min(100, Math.round(c.score * 0.95))}%`,
      'Decisive Recruiter Action': c.decisiveActionSentence || c.actionOpinion || '',
      'Rating Band': c.rmgEvaluation?.rating || getRatingFromScore(c.score),
      'HR Decision Status': STATUS_LABELS[c.status] || c.status,
      'Relevant Job Experience': `${(c.relevantExperienceYears ?? c.totalYearsExperience ?? 0).toFixed(1)} Yrs`,
      'Product Specialization': (c.productSpecialization || []).join(', ') || 'N/A',
      'Work Environment': c.workEnvironment || 'General RMG',
      'Buyers Worked With': (c.buyersWorkedWith || []).join(', ') || 'N/A',
      'Technical Certifications': (c.technicalCertifications || []).join('; ') || 'N/A',
      'Academic Degrees': (c.academicDegrees || c.education || []).join('; ') || 'N/A',
      'CAD Software Proficiency': (c.cadSoftwareProficiency || []).join(', ') || 'N/A',
      'Key Matching Skills & Experience': (c.matchingQualifications && c.matchingQualifications.length > 0
        ? c.matchingQualifications
        : c.skills || []
      ).join('; '),
      'Main Skill or Experience Gaps': (c.gapsAndMismatches && c.gapsAndMismatches.length > 0
        ? c.gapsAndMismatches
        : c.missingQualifications || []
      ).join('; '),
      'Missing or Unverifiable Info': (c.unverifiableInformation || []).join('; '),
      'Evidence Completeness': c.evidenceCompleteness
        ? `${c.evidenceCompleteness.level} (${c.evidenceCompleteness.percentage}%)`
        : 'N/A',
      'Brief Evidence Score Explanation': c.scoreExplanation || '',
      '1. Relevant Experience Marks': crit.relevant_experience
        ? `${crit.relevant_experience.obtainedMarks}/${crit.relevant_experience.maxMarks} [${crit.relevant_experience.status}]`
        : 'N/A',
      '2. Technical Skills Marks': crit.technical_skills
        ? `${crit.technical_skills.obtainedMarks}/${crit.technical_skills.maxMarks} [${crit.technical_skills.status}]`
        : 'N/A',
      '3. Educational Qualifications Marks': crit.education
        ? `${crit.education.obtainedMarks}/${crit.education.maxMarks} [${crit.education.status}]`
        : 'N/A',
      '4. Industry Knowledge Marks': crit.industry_knowledge
        ? `${crit.industry_knowledge.obtainedMarks}/${crit.industry_knowledge.maxMarks} [${crit.industry_knowledge.status}]`
        : 'N/A',
      '5. Job Competencies Marks': crit.competencies
        ? `${crit.competencies.obtainedMarks}/${crit.competencies.maxMarks} [${crit.competencies.status}]`
        : 'N/A',
      '6. Achievements & Evidence Marks': crit.achievements
        ? `${crit.achievements.obtainedMarks}/${crit.achievements.maxMarks} [${crit.achievements.status}]`
        : 'N/A',
      [`${companyName} Proposed Grade`]: c.salaryFixation?.grade || 'ME-11',
      'Proposed Salary (BDT)': c.salaryFixation?.fixedSalary
        ? `TK ${c.salaryFixation.fixedSalary.toLocaleString()}`
        : 'N/A',
      'Average Company Tenure': c.jobStability
        ? `${c.jobStability.averageTenureMonths} mos (${c.jobStability.averageTenureYears} yrs)`
        : 'N/A',
      'Advisory Notice': ADVISORY_NOTICE,
    };

    if (!blindMode) {
      row['Email'] = c.email || '';
      row['Phone'] = c.phone || '';
      row['Resume File Name'] = c.fileName;
    }

    return row;
  });

  const candidatesSheet = XLSX.utils.json_to_sheet(candidatesData);
  candidatesSheet['!cols'] = [
    { wch: 14 }, // Rank
    { wch: 24 }, // Name
    { wch: 28 }, // Position
    { wch: 16 }, // Score
    { wch: 20 }, // Rating
    { wch: 22 }, // HR Status
    { wch: 18 }, // Experience
    { wch: 38 }, // Matching skills
    { wch: 38 }, // Gaps
    { wch: 30 }, // Unverifiable
    { wch: 22 }, // Completeness
    { wch: 45 }, // Explanation
    { wch: 24 }, // Crit 1
    { wch: 24 }, // Crit 2
    { wch: 24 }, // Crit 3
    { wch: 24 }, // Crit 4
    { wch: 24 }, // Crit 5
    { wch: 24 }, // Crit 6
    { wch: 18 }, // Grade
    { wch: 20 }, // Salary
    { wch: 20 }, // Tenure
    { wch: 60 }, // Advisory
  ];
  XLSX.utils.book_append_sheet(workbook, candidatesSheet, 'Ranked Candidate Evaluation');

  // Sheet 2: Executive Summary & Distribution
  const total = candidates.length;
  const statusSummary = {
    'Pending HR Review': candidates.filter((c) => c.status === 'pending').length,
    'Shortlisted by HR': candidates.filter((c) => c.status === 'shortlisted').length,
    'On Hold by HR': candidates.filter((c) => c.status === 'on_hold').length,
    'Rejected by HR': candidates.filter((c) => c.status === 'rejected').length,
  };

  const summarySheetData = [
    { Section: 'HR CV SCREENING ADVISORY NOTICE', Value: ADVISORY_NOTICE },
    { Section: 'EVALUATION DATE', Value: new Date().toLocaleDateString() },
    { Section: 'ORGANIZATION', Value: companyName },
    { Section: 'TOTAL CANDIDATES EVALUATED', Value: total },
    { Section: '', Value: '' },
    { Section: 'HR DECISION BREAKDOWN', Value: '' },
    ...Object.entries(statusSummary).map(([stat, count]) => ({
      Section: stat,
      Value: `${count} candidate(s) (${total > 0 ? ((count / total) * 100).toFixed(1) : 0}%)`,
    })),
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summarySheetData);
  summarySheet['!cols'] = [{ wch: 38 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

  // Sheet 3: Salary Fixation Reference
  const matrixData = getStoredSalaryMatrix().map((row) => ({
    Grade: row.grade,
    'Category Layer': row.categoryLayer,
    Designation: row.designation,
    'Required Exp': row.requiredExperience,
    'Passing Score': row.minRequiredScore,
    'Merchandising Pay': row.merchandisingSalary,
    'Fashion Design Pay': row.fashionDesigningSalary,
    'Commercial Pay': row.accountsCommercialSalary,
    'QA/QC Pay': row.qaSalary,
    'Sewing/Cutting Pay': row.sewingCuttingSalary,
  }));
  const matrixSheet = XLSX.utils.json_to_sheet(matrixData);
  XLSX.utils.book_append_sheet(workbook, matrixSheet, 'Salary Matrix Reference');

  const fileName = `${companyName}_${fileNamePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportCandidatesToCSV(
  candidates: Candidate[],
  fileNamePrefix = 'Candidate_Rankings',
  blindMode = false,
  companyName = 'XYZ'
) {
  if (!candidates || candidates.length === 0) return;

  const sortedCandidates = [...candidates].sort((a, b) => {
    const rankA = a.rank ?? 999;
    const rankB = b.rank ?? 999;
    if (rankA !== rankB) return rankA - rankB;
    return b.score - a.score;
  });

  const headers = [
    'Rank',
    'Candidate Name',
    'Applied Position',
    'Total Score (out of 100)',
    'Verdict Badge',
    'JD Match (%)',
    'Requirements Match (%)',
    'Company Criteria Match (%)',
    'Decisive Recruiter Action',
    'Relevant Experience',
    'Product Specialization',
    'Work Environment',
    'Buyers Worked With',
    'Technical Certifications',
    'Academic Degrees',
    'CAD Software',
    'Key Matching Skills',
    'Main Gaps or Mismatches',
    'Evidence Completeness',
    'HR Decision Status',
    'Brief Explanation',
    'Grade',
    'Salary Fixation (BDT)',
  ];

  if (!blindMode) {
    headers.push('Email', 'Phone', 'File Name');
  }

  const csvRows: string[] = [];
  // Notice as first line
  csvRows.push(`"# Notice: ${ADVISORY_NOTICE}"`);
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

  sortedCandidates.forEach((c, index) => {
    const candidateName = blindMode ? `Candidate #${c.rank ?? index + 1}` : c.name;
    const rankText = c.isTied ? `#${c.rank ?? index + 1} (Tied)` : `#${c.rank ?? index + 1}`;
    const expText = `${(c.relevantExperienceYears ?? c.totalYearsExperience ?? 0).toFixed(1)} Yrs`;
    const prodSpecializationText = (c.productSpecialization || []).join(', ') || 'N/A';
    const workEnvText = c.workEnvironment || 'General RMG';
    const buyersText = (c.buyersWorkedWith || []).join(', ') || 'N/A';
    const certsText = (c.technicalCertifications || []).join('; ') || 'N/A';
    const degreesText = (c.academicDegrees || c.education || []).join('; ') || 'N/A';
    const cadText = (c.cadSoftwareProficiency || []).join(', ') || 'N/A';
    const skillsText = (c.matchingQualifications && c.matchingQualifications.length > 0
      ? c.matchingQualifications
      : c.skills || []
    ).join('; ');
    const gapsText = (c.gapsAndMismatches && c.gapsAndMismatches.length > 0
      ? c.gapsAndMismatches
      : c.missingQualifications || []
    ).join('; ');
    const completenessText = c.evidenceCompleteness
      ? `${c.evidenceCompleteness.level} (${c.evidenceCompleteness.percentage}%)`
      : 'N/A';
    const statusText = STATUS_LABELS[c.status] || c.status;
    const gradeText = c.salaryFixation?.grade || 'ME-11';
    const salaryText = c.salaryFixation?.fixedSalary ? `TK ${c.salaryFixation.fixedSalary.toLocaleString()}` : 'N/A';
    const verdictText = c.verdict || (c.score >= 85 ? 'Perfect Matched' : c.score >= 70 ? 'Better' : c.score >= 50 ? 'Good' : 'Irrelevant');
    const jdMatchPct = c.triMatch ? `${c.triMatch.jdMatch.score}%` : `${Math.min(100, Math.round(c.score * 1.02))}%`;
    const reqMatchPct = c.triMatch ? `${c.triMatch.requirementsMatch.score}%` : `${Math.min(100, Math.round(c.score * 0.98))}%`;
    const compMatchPct = c.triMatch ? `${c.triMatch.companyCriteriaMatch.score}%` : `${Math.min(100, Math.round(c.score * 0.95))}%`;
    const decisiveActionText = c.decisiveActionSentence || c.actionOpinion || '';

    const row = [
      rankText,
      candidateName,
      c.appliedPosition || c.category || 'General',
      c.score.toFixed(0),
      verdictText,
      jdMatchPct,
      reqMatchPct,
      compMatchPct,
      decisiveActionText,
      expText,
      prodSpecializationText,
      workEnvText,
      buyersText,
      certsText,
      degreesText,
      cadText,
      skillsText,
      gapsText,
      completenessText,
      statusText,
      c.scoreExplanation || '',
      gradeText,
      salaryText,
    ];

    if (!blindMode) {
      row.push(c.email || '', c.phone || '', c.fileName || '');
    }

    csvRows.push(row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','));
  });

  const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${companyName}_${fileNamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

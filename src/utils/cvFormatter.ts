/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Candidate } from '../types';

export function getCandidateFullCvText(candidate: Candidate): string {
  if (candidate.attachedCvText && candidate.attachedCvText.trim().length > 50) {
    return candidate.attachedCvText;
  }

  const lines: string[] = [];
  lines.push(`================================================================================`);
  lines.push(`CURRICULUM VITAE / RESUME`);
  lines.push(`================================================================================`);
  lines.push(``);
  lines.push(`NAME: ${candidate.name}`);
  lines.push(`TARGET POSITION: ${candidate.appliedPosition || candidate.category}`);
  lines.push(`EMAIL: ${candidate.email}`);
  lines.push(`PHONE: ${candidate.phone}`);
  lines.push(`LOCATION: Dhaka, Bangladesh`);
  lines.push(``);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`PROFESSIONAL SUMMARY`);
  lines.push(`--------------------------------------------------------------------------------`);
  if (candidate.scoreExplanation) {
    lines.push(candidate.scoreExplanation);
  } else {
    lines.push(
      `Dedicated professional with ${(candidate.relevantExperienceYears || candidate.totalYearsExperience || 0).toFixed(1)} years of verified expertise in ${candidate.appliedPosition || candidate.category}. Proven track record in high-quality execution, export brand collaboration, and process excellence.`
    );
  }
  lines.push(``);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`KEY SKILLS & TECHNICAL COMPETENCIES`);
  lines.push(`--------------------------------------------------------------------------------`);
  if (candidate.skills && candidate.skills.length > 0) {
    candidate.skills.forEach((skill) => {
      lines.push(`• ${skill}`);
    });
  } else {
    lines.push(`• Technical workflows and industry software`);
  }
  lines.push(``);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`WORK EXPERIENCE`);
  lines.push(`--------------------------------------------------------------------------------`);
  if (candidate.experience && candidate.experience.length > 0) {
    candidate.experience.forEach((exp) => {
      lines.push(`ROLE: ${exp.role}`);
      lines.push(`COMPANY: ${exp.company}`);
      lines.push(`DURATION: ${exp.duration}`);
      if (exp.description) {
        lines.push(`RESPONSIBILITIES & CONTRIBUTIONS:`);
        lines.push(`  ${exp.description}`);
      }
      lines.push(``);
    });
  } else {
    lines.push(`Relevant industrial work experience documented in HR dossier.`);
    lines.push(``);
  }
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`EDUCATIONAL QUALIFICATIONS & CERTIFICATIONS`);
  lines.push(`--------------------------------------------------------------------------------`);
  if (candidate.education && candidate.education.length > 0) {
    candidate.education.forEach((edu) => {
      lines.push(`• ${edu}`);
    });
  }
  lines.push(``);
  if (candidate.matchingQualifications && candidate.matchingQualifications.length > 0) {
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`MATCHING QUALIFICATIONS HIGHLIGHTS`);
    lines.push(`--------------------------------------------------------------------------------`);
    candidate.matchingQualifications.forEach((q) => {
      lines.push(`• ${q}`);
    });
    lines.push(``);
  }
  lines.push(`================================================================================`);
  lines.push(`END OF RESUME - FILE: ${candidate.fileName}`);
  lines.push(`================================================================================`);

  return lines.join('\n');
}

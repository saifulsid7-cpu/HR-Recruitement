/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndustryCompanyPolicy, QuickPolicyPreset } from '../types';

export const TOP_10_RMG_COMPANIES: IndustryCompanyPolicy[] = [
  {
    id: 1,
    companyName: 'Youngone Corporation',
    selectionPattern:
      'Document screening → English proficiency test → 1st professional interview → 2nd executive interview → medical check → final selection.',
    selectionSteps: [
      'Document screening',
      'English proficiency test',
      '1st professional interview',
      '2nd executive interview',
      'Medical check',
      'Final selection',
    ],
    whatCandidatesPrepare: [
      'Job suitability',
      'Professional competency',
      'English communication',
      'Adaptability',
      'Responsibility and integrity',
    ],
    highlights:
      'Its published policy describes fair, non-discriminatory recruitment with strong emphasis on English proficiency and executive interview stages.',
  },
  {
    id: 2,
    companyName: 'Ha-Meem Group',
    selectionPattern:
      'Current career portal supports account/application. Older documented material describes CV screening → written test → oral/board interview → background investigation → offer.',
    selectionSteps: [
      'Account / Career Portal Application',
      'CV screening',
      'Written test',
      'Oral / Board interview',
      'Background investigation',
      'Offer',
    ],
    whatCandidatesPrepare: [
      'JD match',
      'Education / experience verification',
      'Written-test technical proficiency',
      'Board interview performance',
    ],
    highlights:
      'Comprehensive board interview panel with formal background investigation prior to final appointment.',
  },
  {
    id: 3,
    companyName: 'Mondol Group',
    selectionPattern:
      'A published internship/report describes screening based on education and experience followed by interview/selection-panel assessment.',
    selectionSteps: [
      'Education & experience screening',
      'Selection-panel interview assessment',
      'Final appointment',
    ],
    whatCandidatesPrepare: [
      'Education credentials',
      'Relevant apparel/garment experience',
      'Job knowledge',
      'Interview performance',
    ],
    highlights:
      'Focuses heavily on educational qualifications, verified tenure in RMG operations, and direct panel evaluation.',
  },
  {
    id: 4,
    companyName: 'Ananta Companies',
    selectionPattern:
      'Formal Recruitment & Hiring Policy covers document checking, age/fitness/eye/drug screening where applicable, efficiency assessment, written test, wage fixation and appointment.',
    selectionSteps: [
      'Document checking',
      'Age / Fitness / Eye / Drug screening (where applicable)',
      'Efficiency assessment',
      'Written technical test',
      'Wage fixation',
      'Appointment',
    ],
    whatCandidatesPrepare: [
      'Education & official documents',
      'Job-specific technical ability',
      'Integrity and suitability',
      'Efficiency assessment readiness',
    ],
    highlights:
      'Detailed documented hiring policy featuring strict document checking, medical/fitness screening, efficiency assessments, and systematic wage fixation.',
  },
  {
    id: 5,
    companyName: 'DBL Group',
    selectionPattern:
      'Public materials establish formal HR/training and governance structures, but a detailed public candidate-selection workflow was not verified.',
    selectionSteps: [
      'Vacancy-specific JD application',
      'HR governance screening',
      'Competency interview',
      'Onboarding',
    ],
    whatCandidatesPrepare: [
      'Follow vacancy-specific JD instructions',
      'HR technical skills',
      'Sustainability & compliance knowledge',
    ],
    highlights:
      'Renowned for structured HR governance, training academies, and adherence to international sustainability standards.',
  },
  {
    id: 6,
    companyName: 'Pacific Jeans Group',
    selectionPattern:
      'Published HRM material describes management and unit-HR recruitment; screening, medical/age checks, technical testing where relevant and document verification are described.',
    selectionSteps: [
      'Unit-HR & Management recruitment',
      'Screening & document verification',
      'Medical & age check',
      'Technical testing (where relevant)',
      'Final selection',
    ],
    whatCandidatesPrepare: [
      'Technical denim/garment ability',
      'Education / verified experience',
      'Original documents and certificates',
      'Job-specific skills',
    ],
    highlights:
      'Dual unit-HR and central management recruitment flow, mandatory age/medical checks, and hands-on technical testing.',
  },
  {
    id: 7,
    companyName: 'Palmal Group',
    selectionPattern:
      'Current career portal. Published recruitment/hiring policy describes manpower approval → vacancy → application → screening → written/oral/technical tests → selection → grade/salary → appointment.',
    selectionSteps: [
      'Manpower budget approval',
      'Vacancy declaration',
      'Application intake',
      'Screening',
      'Written / Oral / Technical tests',
      'Selection',
      'Grade & Salary fixation',
      'Appointment',
    ],
    whatCandidatesPrepare: [
      'Job requirement alignment',
      'Eligibility credentials',
      'Test and interview performance',
      'Suitability for grade fixation',
    ],
    highlights:
      'Rigorous end-to-end recruitment lifecycle tied to approved manpower requisitions, formal written/technical tests, and standardized grade fixation.',
  },
  {
    id: 8,
    companyName: 'Standard Group',
    selectionPattern:
      'Career page asks applicants to submit CV; company describes seeking talented, qualified, dynamic people who are ambitious and willing to take challenges.',
    selectionSteps: [
      'CV submission via career portal',
      'Profile shortlisting',
      'Personal interview',
      'Offer & placement',
    ],
    whatCandidatesPrepare: [
      'Qualifications',
      'Ambition & leadership mindset',
      'Communication skills',
      'Adaptability & performance potential',
    ],
    highlights:
      'Values dynamic professionals willing to take challenges in fast-paced production and export environments.',
  },
  {
    id: 9,
    companyName: 'BEXIMCO / Bextex',
    selectionPattern:
      'Historical HRM material describes screening → tests → comprehensive interview → background investigation → conditional offer → medical/physical exam. Historical, not verified as current official policy.',
    selectionSteps: [
      'CV screening',
      'Aptitude & technical tests',
      'Comprehensive panel interview',
      'Background investigation',
      'Conditional offer',
      'Medical & physical examination',
      'Final appointment',
    ],
    whatCandidatesPrepare: [
      'JD matching',
      'Test & interview performance',
      'Background history and references',
      'Medical requirements',
    ],
    highlights:
      'Corporate conglomerate structure featuring comprehensive interview panels, background investigations, and conditional offer validation.',
  },
  {
    id: 10,
    companyName: 'Square Fashions / Square Textiles',
    selectionPattern:
      'Current career page exists; published vacancies state only shortlisted candidates are called. Recent HR/Compliance/Payroll vacancy emphasized RMG HR experience, Bangladesh Labour Law, payroll/increment and HR planning.',
    selectionSteps: [
      'Career page application',
      'Strict shortlisting filter',
      'Technical written assessment',
      'Comprehensive interview',
      'Final hiring',
    ],
    whatCandidatesPrepare: [
      'RMG HR operational experience',
      'Bangladesh Labour Law expertise',
      'Payroll & annual increment processing',
      'HR planning & manpower budgeting',
      'Advanced Excel / HRIS systems',
      'Professional communication',
    ],
    highlights:
      'High-standard candidate shortlisting with direct emphasis on Bangladesh Labour Law mastery, HRIS/Excel competence, and large-scale payroll operations.',
  },
];

export const QUICK_POLICY_PRESETS: QuickPolicyPreset[] = [
  {
    id: 'ha_meem',
    name: 'Ha-Meem Group Recruitment & Selection Standard',
    companyName: 'Ha-Meem Group',
    badge: 'Ha-Meem',
    title: 'HR & Factory Compliance Officer',
    department: 'HR, Admin & Compliance',
    content: `Job Title: HR & Factory Compliance Officer
Company Standard: Ha-Meem Group
Selection Pattern: CV screening → Written test (Labour Law & HR) → Oral/Board interview → Background investigation → Offer.

### Core Candidate Requirements & Criteria:
- Written Test Proficiency: Must pass technical examination on Bangladesh Labour Law, EPZ regulations, and wage calculations.
- Experience & Stability: Minimum 3+ years in large-scale RMG manufacturing. Candidates must meet the 1.5-year retention rule per company.
- Social Compliance: Working familiarity with BSCI, SEDEX/SMETA, and buyer audit protocols (H&M, Target, Gap).
- Technical Tools: Advanced Excel (VLOOKUP, PivotTables) for employee master list & monthly reporting.

### Job Stability & Retention Policy (1.5-Year Rule):
- Candidates must demonstrate a minimum average tenure of 1.5 years (18 months) per previous company.
- Unstable rapid job changers with frequent tenures under 18 months will not be shortlisted.

### Salary Fixation Policy Reference:
- Wages and grade placements are strictly fixed in accordance with verified experience months and candidate screening scores (ME-10 to ME-13 tiers).`,
  },
  {
    id: 'youngone',
    name: 'Youngone Corporation Recruitment Standard',
    companyName: 'Youngone Corporation',
    badge: 'Youngone',
    title: 'Merchandiser (Outerwear & Activewear)',
    department: 'Merchandising',
    content: `Job Title: Merchandiser (Outerwear & Activewear)
Company Standard: Youngone Corporation
Selection Pattern: Document screening → English proficiency test → 1st professional interview → 2nd executive interview → Medical check → Final selection.

### Core Candidate Requirements & Criteria:
- English Proficiency: Fluent written & spoken communication for international buyer correspondence (Patagonia, North Face, Lululemon).
- Technical Knowledge: Outerwear/sportswear garment construction, technical fabrics, seam sealing, and FOB costing.
- Work Tenure: Stable career trajectory with average company tenure ≥ 1.5 years (18 months).
- ERP / Systems: Experience in ERP-driven order management, T&A monitoring, and critical path follow-up.

### Job Stability & Retention Policy (1.5-Year Rule):
- Candidates must demonstrate a minimum average tenure of 1.5 years (18 months) per previous company.
- Rapid job hoppers (< 18 months per company) are disqualified.

### Salary Fixation Policy Reference:
- Fixed under Executive Layer Grade ME-11 / ME-12 based on verified experience months.`,
  },
  {
    id: 'square',
    name: 'Square Fashions Recruitment & Selection Policy',
    companyName: 'Square Fashions',
    badge: 'Square',
    title: 'Assistant Manager - HR & Administration',
    department: 'Human Resources',
    content: `Job Title: Assistant Manager - HR & Administration
Company Standard: Square Fashions / Square Group
Selection Pattern: Career portal shortlisting → Technical written test → Comprehensive panel interview → Offer.

### Core Candidate Requirements & Criteria:
- Bangladesh Labour Act 2006 & Rules 2015: Master level understanding of disciplinary actions, domestic inquiry, maternity benefits, and retrenchment.
- Payroll & Compensation: Large-scale monthly factory payroll administration (3,000+ workers), overtime calculations, and increment fixation.
- Advanced Analytics: Excel mastery (XLOOKUP, SUMIFS, COUNTIFS, data validation) and HRIS platforms.
- Professionalism: Impeccable ethical background and demonstrated workforce retention record.

### Job Stability & Retention Policy (1.5-Year Rule):
- Minimum 18-month tenure standard across previous employments (no frequent job hoppers).

### Salary Fixation Policy Reference:
- Aligned with Managerial Layer Grade ME-9 / ME-8 according to years of experience.`,
  },
  {
    id: 'ananta',
    name: 'Ananta Companies Documented Hiring Standard',
    companyName: 'Ananta Companies',
    badge: 'Ananta',
    title: 'Fashion Designer & 3D CAD Specialist',
    department: 'Design & Product Development',
    content: `Job Title: Fashion Designer & 3D CAD Specialist
Company Standard: Ananta Companies
Selection Pattern: Document checking → Age/fitness verification → Efficiency assessment → Written/practical CAD test → Wage fixation → Appointment.

### Core Candidate Requirements & Criteria:
- CAD & 3D Software: Expertise in CLO 3D, Optitex, Browzwear, and Adobe Illustrator for denim and casualwear.
- Pattern & Fit: Hands-on experience with garment construction, tech pack building, and wash development.
- Buyer Exposure: Experience working with global brands (Marks & Spencer, Gap, H&M).
- Career Consistency: Meets mandatory 1.5-year retention requirement per previous employer.

### Job Stability & Retention Policy (1.5-Year Rule):
- Candidates must demonstrate a minimum average tenure of 1.5 years (18 months) per previous company.

### Salary Fixation Policy Reference:
- Grade ME-11 (Designer: TK 40,000) or Grade ME-10 (Senior Designer: TK 50,000).`,
  },
  {
    id: 'standard',
    name: 'Standard Group Selection & Evaluation Policy',
    companyName: 'Standard Group',
    badge: 'Standard',
    title: 'Quality Assurance (QA/QC) Manager',
    department: 'Quality Assurance',
    content: `Job Title: Quality Assurance (QA/QC) Manager
Company Standard: Standard Group
Selection Pattern: CV submission → Profile shortlisting → Personal interview → Technical evaluation → Appointment.

### Core Candidate Requirements & Criteria:
- Quality Governance: Mastery of AQL 1.5/2.5 inspection standards, 4-point fabric inspection, inline, endline, and pre-shipment inspections.
- Buyer Manuals: Thorough understanding of American & European buyer quality manuals (Kohl's, Target, Next, American Eagle).
- Corrective Action Plans (CAP): Root cause analysis and preventive measures.
- Retention: Verified minimum 18-month average tenure standard across previous employments.

### Job Stability & Retention Policy (1.5-Year Rule):
- Candidates must demonstrate a minimum average tenure of 1.5 years (18 months) per previous company.

### Salary Fixation Policy Reference:
- Fixed according to RMG Grade ME-11 / ME-10 based on proven tenure.`,
  },
];

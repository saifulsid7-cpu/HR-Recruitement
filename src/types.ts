/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CandidateStatus = 'pending' | 'interview' | 'selected' | 'shortlisted' | 'on_hold' | 'rejected';

export const STATUS_LABELS: Record<CandidateStatus, string> = {
  pending: 'Screening (Pending)',
  interview: 'In Interview Stage',
  selected: 'Fit / Selected',
  shortlisted: 'Fit / Selected',
  on_hold: 'On Hold by HR',
  rejected: 'Rejected by HR',
};

export type VerdictType = 'Perfect Matched' | 'Better' | 'Good' | 'Good/Average' | 'Irrelevant' | 'Irrelevant / Domain Mismatch';

export interface EvaluatedJobMatch {
  id: string;
  title: string;
  score: number;
  verdict: VerdictType;
  department?: string;
}

export type NavigationMenuTab =
  | 'dashboard'
  | 'jobs'
  | 'candidates'
  | 'applications'
  | 'cv_bank'
  | 'screening'
  | 'interviews'
  | 'reports'
  | 'monthly_kpi_metrics';

export type KpiSegmentId =
  | 'kpi-hiring-yield'
  | 'kpi-resume-bank'
  | 'kpi-salary-similarity'
  | 'kpi-linkedin-growth'
  | 'kpi-job-circulars'
  | 'kpi-bg-check'
  | 'kpi-engagement-surveys'
  | 'kpi-youth-meetup';

export interface ScoreCategoryMetric {
  obtained: number;
  max: number;
  percentage: number;
}

export interface CandidateScoreBreakdown {
  domainExperience: ScoreCategoryMetric;
  ksaDailyDuties: ScoreCategoryMetric;
  education: ScoreCategoryMetric;
  buyerSoftwareKnowledge: ScoreCategoryMetric;
}

// 3-Pillar Tri-Match Screening Architecture
export interface TriMatchPillar {
  score: number; // 0 - 100%
  summary: string;
  matchedItems: string[];
  missingItems: string[];
}

export interface TriMatchEvaluation {
  // 1. Job Description Match (%): Daily roles, primary duties, operational execution
  jdMatch: TriMatchPillar;
  // 2. Job Requirements Match (%): Years of experience, degrees, certifications, technical tools
  requirementsMatch: TriMatchPillar;
  // 3. Company Criteria Match (%): Factory vs buying house, product lines, buyer portfolio, tenure stability
  companyCriteriaMatch: TriMatchPillar;
  // Overall composite score
  overallScore: number;
  verdict: VerdictType;
  decisiveActionSentence: string;
}

export interface SemanticResponsibilityMatch {
  label: string; // e.g. "Matched Duty #1" or "Matched Competency #2"
  jdRequirement: string;
  candidateEvidence: string;
  explanation: string;
  fulfillmentType?: 'duty' | 'competency' | 'objective';
}

export type RatingBand =
  | 'Highly Recommended'
  | 'Recommended'
  | 'Consider with Reservations'
  | 'Not Recommended';

export interface EvaluationCriterionConfig {
  id: 'relevant_experience' | 'technical_skills' | 'education' | 'industry_knowledge' | 'competencies' | 'achievements';
  name: string;
  description: string;
  weight: number; // default marks (sums to 100)
}

export type CriterionEvidenceStatus =
  | 'Fully Evident'
  | 'Partially Evident'
  | 'Not Evident'
  | 'Unable to Verify';

export interface CriterionMark {
  criterionId: string;
  name: string;
  obtainedMarks: number;
  maxMarks: number;
  status: CriterionEvidenceStatus;
  evidenceQuote?: string;
  assessmentNotes: string;
}

export interface EvidenceCompleteness {
  level: 'High' | 'Medium' | 'Partial' | 'Low';
  percentage: number; // e.g. 85%
  verifiedCount: number;
  totalCheckpoints: number;
  missingOrUnverifiable: string[];
}

export interface ScoreBreakdown {
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
}

export interface RMGEvaluation {
  position: string;
  interviewDate: string;
  criterionScores: Record<number, number>; // legacy 1 to 8 support
  totalWeightedScore: number;
  rating: RatingBand;
  notes: string;
}

export interface SalaryFixation {
  department: string;
  category: string;
  grade: string; // e.g. ME-10, ME-11, ME-12, ME-13
  categoryLayer: string; // GM layer, Manager layer, Executive layer, SS layer
  eligibleDesignation: string;
  fixedSalary: number; // in BDT / TK
  salaryRangeText: string;
  experienceMonths: number;
  requiredMinYears: string;
  minRequiredScoreBand: string;
  sourcingType: 'external' | 'in-house';
  justification: string;
}

export interface TenureRecord {
  role: string;
  company: string;
  duration: string;
  estimatedMonths: number;
  isLessThanOneAndHalfYears: boolean;
}

export interface JobStability {
  isFrequentJobChanger: boolean;
  disallowed: boolean;
  averageTenureMonths: number;
  averageTenureYears: number;
  shortTenuresCount: number;
  totalJobs: number;
  tenureBreakdown: TenureRecord[];
  warningSignText: string;
  flagReason: string;
}

export interface WorkExperience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Candidate {
  id: string;
  fileName: string;
  name: string;
  requisitionId?: string; // ID of the specific job requisition (e.g. REQ-2026-001)
  appliedPosition: string; // specifically tied to target job
  category: string;
  email: string;
  phone: string;
  education: string[];
  experience: WorkExperience[];
  totalYearsExperience: number;
  relevantExperienceYears: number;
  skills: string[];
  
  // Total match score out of 100
  score: number;
  rank?: number;
  isTied?: boolean;

  // Dual 100-Point Scoring Model (Total 200 Scaled to 100) & Dual-Mode Screening
  evaluationMode?: 'standard_kra' | 'designation_only';
  matchedTitleAndDept?: string;
  dimensionBreakdown?: {
    designationAlignment: number; // 40% weight in Designation-Only mode
    academicQualifications: number; // 25% weight in Designation-Only mode
    experienceSeniority: number; // 20% weight in Designation-Only mode
    ksaDomainAttributes: number; // 15% weight in Designation-Only mode
  };
  pillar1KraScore?: number; // Pillar 1: Tasks, Responsibilities & Competencies (0-100)
  pillar2RequirementsScore?: number; // Pillar 2: Additional Requirements & Job Specifications (0-100)
  totalRawScore?: number; // Total Raw Score out of 200
  convertedFinalScore?: number; // Converted Final Score out of 100%
  recommendationBadge?:
    | 'Perfect Matched'
    | 'Relevant / Perfect Matched'
    | 'Better'
    | 'Good / Shortlisted (Initial)'
    | 'Good / Average'
    | 'Irrelevant';
  hrActionOpinion?: string; // Crisp 1-sentence HR action opinion
  taskMatchScore?: number; // Part A: Specific Task & KRA Score (0-100%)
  orgMatchScore?: number; // Part B: Overall Organizational Match Score (0-100%)
  compositeScore?: number; // Total Composite Score (0-100%)
  meritRank?: number; // Merit-List Rank (1 to 20+)
  
  // 6 Criteria Detailed Marks
  criteriaMarks: Record<string, CriterionMark>;
  
  // Enhanced Scoring Card Evaluation Fields
  verdict?: VerdictType; // 'Perfect Matched' | 'Better' | 'Good' | 'Irrelevant'
  actionOpinion?: string; // Concise HR action advice sentence
  keyStrengths?: string[]; // Bullet points
  criticalGaps?: string[]; // Bullet points
  scoringBreakdown?: CandidateScoreBreakdown; // Domain Experience, KSA/Daily Duties, Education, Buyer/Software Knowledge

  // Multi-Job Screening Mapping
  matchedRequisitionId?: string;
  allEvaluatedJobs?: EvaluatedJobMatch[];
  isMultiJobScreened?: boolean;

  // Evidence & Transparency
  scoreExplanation: string;
  matchingQualifications: string[];
  gapsAndMismatches: string[];
  unverifiableInformation: string[]; // Marked "Not Evident" or "Unable to Verify"
  evidenceCompleteness: EvidenceCompleteness;
  evidenceSnippets: string[];

  // Legacy compatibility fields
  scoreBreakdown?: ScoreBreakdown;
  rmgEvaluation?: RMGEvaluation;
  shortReason?: string;
  strengths?: string[];
  missingQualifications?: string[];
  attachedCvText?: string; // Full text CV/Resume for instant review
  blobUrl?: string; // Direct browser Blob URL for native document iframe viewer
  fileUrl?: string; // Direct browser File/Blob URL for native document iframe viewer
  fileBase64?: string; // Base64 representation of original file for persistent blob generation
  fileMimeType?: string; // Mime type e.g. application/pdf

  // HR Decision Control (Human-controlled ONLY)
  status: CandidateStatus; // 'pending' | 'interview' | 'selected' | 'shortlisted' | 'on_hold' | 'rejected'
  hrDecisionNotes?: string;
  hrDecisionDate?: string;
  hrDecidedBy?: string;
  interviewRound?: 'Online Interview' | 'Offline Technical Round' | 'HR Viva';
  interviewMode?: 'Online Interview' | 'Offline / In-Person Interview';
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  companyAddress?: string;
  googleMapsLink?: string;
  interviewFeedback?: string;
  interviewScheduledAt?: string;
  interviewRating?: number;

  // 3-Pillar Tri-Match Architecture
  triMatch?: TriMatchEvaluation;
  decisiveActionSentence?: string;

  // Semantic & Purpose-Driven Responsibility Matches
  semanticMatches?: SemanticResponsibilityMatch[];

  // Extracted RMG & Technical Profile (Automatic Extraction)
  productSpecialization?: string[]; // Tops vs Bottoms, Denim, Woven, Knit
  workEnvironment?: 'Factory' | 'Buying House' | 'Both' | 'General RMG';
  buyersWorkedWith?: string[]; // e.g. H&M, Inditex, Walmart, Target, Next, Primark
  technicalCertifications?: string[]; // e.g. PGDHRM, Sedex/WRAP/BSCI compliance, ISO 9001, Six Sigma
  academicDegrees?: string[]; // e.g. B.Sc. in Textile Engineering, B.A. in Fashion Design, MBA
  cadSoftwareProficiency?: string[]; // e.g. Gerber AccuMark, Lectra, Optitex, CLO 3D, FastReact

  // Advisory Reference
  salaryFixation?: SalaryFixation;
  jobStability?: JobStability;
  gradeFit?: CandidateGradeFit;
  lastCompany?: string;
  lastDesignation?: string;
  rejectionExplanation?: string;
  selectionExplanation?: string;
  processedAt: string;
}

export interface CandidateGradeFit {
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

export interface SalaryMatrixRow {
  id: string;
  designation: string;
  categoryLayer: string;
  grade: string;
  requiredExperience: string;
  minRequiredScore: string;
  merchandisingSalary: string;
  fashionDesigningSalary: string;
  accountsCommercialSalary: string;
  qaSalary: string;
  sewingCuttingSalary: string;
}

export interface RMGCriterion {
  critNumber: number;
  category: string;
  weight: number;
  standardCriterion: string;
  maxScore: number;
}

export interface PositionCriteria {
  position: string;
  shortTitle: string;
  department: string;
  criteria: RMGCriterion[];
}

export type HiringCategory = 'current' | 'top_priority';

export type RequisitionStatus = 'open' | 'active' | 'on_hold' | 'filled' | 'cancelled' | 'closed';

export interface RequisitionCompanyFit {
  industrySegment?: string[];
  rmgDivisions?: string[];
  workplaceNature?: string;
  productCategory?: string;
  specificProductItems?: string[];
  monthlyProductionScale?: string;
  minAverageTenureYears?: number;
}

export type CurrentOperationalStage = 'cv_sourcing' | 'interviewing' | 'finalized_selection';
export type UltimateRequisitionStatus = 'opening' | 'closed' | 'on_hold';

export interface JobRequisition {
  id: string; // e.g. 'REQ-2026-RMG-001'
  requisitionNo?: string; // Inline editable requisition number (defaults to id)
  title: string;
  department: string;
  unit?: string; // Operating unit / SBU (e.g. SFCO, SF Factory, Buying House, Washing Plant)
  category: string;
  experienceLevel: string;
  hiringCategory: HiringCategory; // 'current' | 'top_priority'
  content: string; // Full job description & screening criteria summary

  // Section 1: Basic Position & Requisition Overview
  vacanciesCount?: number;
  applicationDeadline?: string;
  salaryMin?: number;
  salaryMax?: number;
  isSalaryNegotiable?: boolean;
  salaryRange?: string; // Formatted or user-entered BDT range e.g. "BDT 45,000 - 65,000 (Negotiable)"
  minExperienceYears?: number;
  targetGradeCode?: string; // e.g. 'ME-9', 'ME-10'
  sbuUnit?: string; // 'SFCO' | 'SFF' | 'SFJ' | 'SFW'
  locations?: string[]; // Multiple locations/SBU units e.g. ['SFCO', 'SFF Factory Floor', 'Buying House']

  // Section 2: Educational & Professional Qualifications
  academicDegrees?: string[];
  professionalCertifications?: string[];
  jobRequirements?: string;

  // Section 3: Key Responsibility Areas (KRA) & Daily Operational Duties
  jobDescription?: string;
  keyResponsibilities?: string;

  // Section 4: Knowledge, Skills & Technical Competencies (KSA)
  keyKSA?: string;
  hardTechnicalSkills?: string[];
  softwareTools?: string[];
  buyerPortfolio?: string[];

  // Section 5: Company, Domain & Cultural Fit Matrix (RMG Context)
  companyCriteria?: string;
  companyFit?: RequisitionCompanyFit;
  industries?: string[];
  rmgType?: string[];
  rmgProducts?: string[];
  companyName?: string;
  companyType?: string;
  jobType?: string;
  compensationBenefits?: string;
  trackerId?: string;

  // Section 6: Operational & Sourcing Tracking Parameters
  totalSourcingCv?: number;
  totalConducted?: number;
  replacementEmployee?: string; // "Replacement (Employee Name/Code)" or "New Headcount"
  currentStageStatus?: CurrentOperationalStage; // 'cv_sourcing' | 'interviewing' | 'finalized_selection'
  ultimateStatus?: UltimateRequisitionStatus; // 'opening' | 'closed' | 'on_hold'

  // Status & lifecycle
  status: RequisitionStatus; // 'open' | 'on_hold' | 'active' for active pool, 'filled' | 'cancelled' | 'closed' for history
  targetHiringDate?: string;
  createdAt: string;
  closedAt?: string;
  archivedAt?: string;
  archiveReason?: 'Filled' | 'Cancelled' | 'Closed' | 'Recruitment Completed';
  archiveNotes?: string;
  hiredCandidateName?: string;
  historicalCandidates?: Candidate[]; // Preserved evaluation records in history
}

export interface JobPreset {
  id?: string;
  title: string;
  department: string;
  category: string;
  experienceLevel: string;
  content: string;
  jobDescription?: string;
  jobRequirements?: string;
  companyCriteria?: string;
  hiringCategory?: HiringCategory;
}

export interface IndustryCompanyPolicy {
  id: number;
  companyName: string;
  selectionPattern: string;
  selectionSteps: string[];
  whatCandidatesPrepare: string[];
  highlights: string;
}

export interface QuickPolicyPreset {
  id: string;
  name: string;
  companyName: string;
  badge: string;
  title: string;
  department: string;
  content: string;
}

export interface CandidateSnapshot {
  id: string;
  name: string;
  category: string;
  previousStatus: CandidateStatus;
  newStatus: CandidateStatus;
  previousSalary: number;
  newSalary: number;
  previousGrade: string;
  newGrade: string;
}

export interface BulkActionLog {
  id: string;
  timestamp: string;
  actionType: 'MASS_STATUS_CHANGE' | 'POLICY_ENFORCEMENT' | 'SALARY_ADJUSTMENT';
  title: string;
  description: string;
  performedBy: string;
  affectedCandidatesCount: number;
  affectedCandidateIds: string[];
  candidateSnapshots: CandidateSnapshot[];
  metadata?: Record<string, unknown>;
}

export type UploadQueueStatus =
  | 'idle'
  | 'queued'
  | 'reading_pdf'
  | 'evaluating_gemini'
  | 'processing'
  | 'done'
  | 'error';

export interface UploadQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: UploadQueueStatus;
  errorMessage?: string;
}

export type TieBreakerRule =
  | 'none'
  | 'experience_marks'
  | 'technical_marks'
  | 'evidence_completeness'
  | 'total_experience';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GradeLadderItem {
  code: string; // e.g. 'ME-1', 'ME-10'
  cadre: 'GM Cadre' | 'Managerial Cadre' | 'Executive Cadre' | 'Service Staff Cadre' | 'Worker Cadre';
  layer: 'Strategic & Policy' | 'Operational & Supervision' | 'Execution & Process' | 'Operational Support';
  designationTitle: string; // e.g. 'GM-1 / Top Executive Director'
  shortTitle: string; // e.g. 'Top Executive Director'
  minServiceYears: number; // e.g. 26
  minServiceMonths: number; // e.g. 312
  benchmarkScore: number; // Minimum hurdle percentage (e.g. 85, 70, 55, 50)
  competencies: string[];
  keyHardSkills: string[];
  sampleKpis: string[];
}

export const GRADING_LADDER: GradeLadderItem[] = [
  // --- GM Cadre (Benchmark Target Score: Minimum 85%) ---
  {
    code: 'ME-1',
    cadre: 'GM Cadre',
    layer: 'Strategic & Policy',
    designationTitle: 'GM-1 / Top Executive Director',
    shortTitle: 'Top Executive Director',
    minServiceYears: 26,
    minServiceMonths: 312,
    benchmarkScore: 85,
    competencies: [
      'Corporate Strategy & Vision',
      'Governance & Policy Setting',
      'Budget & Risk Oversight',
      'Cross-SBU Governance',
      'Strategic Thinking',
      'Global Industry Benchmarking',
    ],
    keyHardSkills: ['Strategic Planning & Budgeting', 'Departmental Analytics & MIS', 'Policy & SOP Design', 'Global Buyer Negotiations'],
    sampleKpis: ['Annual SBU Turnover & Net Margin', 'Cost per Minute Optimization', 'Executive Leadership Retention > 95%', 'SBU Compliance & Safety Zero-Tolerance'],
  },
  {
    code: 'ME-2',
    cadre: 'GM Cadre',
    layer: 'Strategic & Policy',
    designationTitle: 'ME-2 / Senior General Manager',
    shortTitle: 'Senior General Manager',
    minServiceYears: 23.5,
    minServiceMonths: 282,
    benchmarkScore: 85,
    competencies: [
      'Multi-Unit Governance',
      'Strategic Capacity Allocation',
      'Risk Management',
      'Executive Buyer Relations',
      'Cost Rationalization',
    ],
    keyHardSkills: ['Strategic Planning & Budgeting', 'Departmental Analytics & MIS', 'Policy & SOP Design', 'ERP Governance'],
    sampleKpis: ['Multi-Unit Production Target Achievement > 98%', 'Corporate SBU Budget Variance < 3%', 'Buyer Audit Compliance Rating Grade A'],
  },
  {
    code: 'ME-3',
    cadre: 'GM Cadre',
    layer: 'Strategic & Policy',
    designationTitle: 'ME-3 / General Manager',
    shortTitle: 'General Manager',
    minServiceYears: 20.5,
    minServiceMonths: 246,
    benchmarkScore: 85,
    competencies: [
      'SBU Operational Direction',
      'Departmental Policy Enforcement',
      'Strategic Resource Planning',
      'Executive Escalation Handling',
    ],
    keyHardSkills: ['Operational Budgeting', 'Advanced Performance Analytics', 'Process Engineering SOPs', 'High-Level Vendor Management'],
    sampleKpis: ['Overall Equipment Effectiveness (OEE) > 85%', 'CM Achievement Against Plan', 'On-Time In-Full (OTIF) Shipment > 98%'],
  },
  {
    code: 'ME-4',
    cadre: 'GM Cadre',
    layer: 'Strategic & Policy',
    designationTitle: 'ME-4 / Deputy General Manager',
    shortTitle: 'Deputy General Manager',
    minServiceYears: 17.5,
    minServiceMonths: 210,
    benchmarkScore: 85,
    competencies: [
      'Division Operational Leadership',
      'Capacity & Production Balancing',
      'Supply Chain Risk Mitigation',
      'Cross-Departmental Governance',
    ],
    keyHardSkills: ['SBU Master Scheduling', 'Cross-Line Balancing', 'Department Analytics & MIS', 'Labor Cost Analysis'],
    sampleKpis: ['Division Production Efficiency > 68%', 'DHU Control < 1.8%', 'Inter-Departmental SLA Compliance > 95%'],
  },
  {
    code: 'ME-5',
    cadre: 'GM Cadre',
    layer: 'Strategic & Policy',
    designationTitle: 'ME-5 / Assistant General Manager',
    shortTitle: 'Assistant General Manager',
    minServiceYears: 14.5,
    minServiceMonths: 172,
    benchmarkScore: 85,
    competencies: [
      'Tactical Operations Oversight',
      'Sectional Governance & Compliance',
      'Cost Control & Waste Minimization',
      'Managerial Coaching',
    ],
    keyHardSkills: ['Resource Allocation', 'Production SOP Formulation', 'Lean Manufacturing Principles', 'Buyer Correspondence & Grievance'],
    sampleKpis: ['Sectional Cost Variance < 2%', 'Sample to Bulk Conversion Rate > 88%', 'On-Time Sample Approval Rate > 95%'],
  },

  // --- Managerial Cadre (Benchmark Target Score: Minimum 70%) ---
  {
    code: 'ME-6',
    cadre: 'Managerial Cadre',
    layer: 'Operational & Supervision',
    designationTitle: 'ME-6 / Senior Manager',
    shortTitle: 'Senior Manager',
    minServiceYears: 12.5,
    minServiceMonths: 148,
    benchmarkScore: 70,
    competencies: [
      'Operational Management & Team Supervision',
      'Process Control & Workflow Optimization',
      'Vendor & Buyer Technical Coordination',
      'Target Achievement & Milestone Tracking',
    ],
    keyHardSkills: ['Operational Planning & Scheduling', 'Team & Shift Management', 'Vendor/Resource Coordination', 'Root Cause Analysis'],
    sampleKpis: ['Monthly Shipment Target Achievement > 98%', 'Line Stoppage / Bottlenecks < 2%', 'Team Capability Benchmarks Met'],
  },
  {
    code: 'ME-7',
    cadre: 'Managerial Cadre',
    layer: 'Operational & Supervision',
    designationTitle: 'ME-7 / Manager',
    shortTitle: 'Manager',
    minServiceYears: 10.5,
    minServiceMonths: 126,
    benchmarkScore: 70,
    competencies: [
      'Departmental Execution Management',
      'Daily Production / Workflow Monitoring',
      'Vendor & Supplier Management',
      'Root Cause Analysis & Corrective Actions',
    ],
    keyHardSkills: ['FastReact / ERP Operations', 'Team & Line Supervision', 'Quality Management Systems (QMS)', 'Order Critical Path Tracking'],
    sampleKpis: ['Order Critical Path Adherence 100%', 'Defect Rate (DHU) < 2.0%', 'Buyer Sample Approval On-Time > 95%'],
  },
  {
    code: 'ME-8',
    cadre: 'Managerial Cadre',
    layer: 'Operational & Supervision',
    designationTitle: 'ME-8 / Deputy Manager',
    shortTitle: 'Deputy Manager',
    minServiceYears: 8.5,
    minServiceMonths: 102,
    benchmarkScore: 70,
    competencies: [
      'Line Coordination & Supervision',
      'Sectional Target Delivery',
      'Material & Trim In-House Tracking',
      'Inter-Department Liaison',
    ],
    keyHardSkills: ['Work in Progress (WIP) Tracking', 'Technical Sheet Review', 'Line Shift Balancing', 'Excel Pivot Dashboards'],
    sampleKpis: ['Raw Material In-House On-Time > 96%', 'Sewing/Finishing Output vs Target > 95%', 'Zero Line Stoppage from Trims'],
  },
  {
    code: 'ME-9',
    cadre: 'Managerial Cadre',
    layer: 'Operational & Supervision',
    designationTitle: 'ME-9 / Assistant Manager',
    shortTitle: 'Assistant Manager',
    minServiceYears: 6.5,
    minServiceMonths: 78,
    benchmarkScore: 70,
    competencies: [
      'Hands-on Floor / Team Supervision',
      'Buyer Correspondence & Follow-up',
      'Daily Task Planning',
      'Troubleshooting Technical Gaps',
    ],
    keyHardSkills: ['Operational Planning & Scheduling', 'Team Supervision', 'Vendor Coordination', 'Root Cause Analysis', 'Buyer Communication'],
    sampleKpis: ['Daily Production Schedule Met > 95%', 'Sample Dispatch On Schedule', 'Buyer Query Response Time < 4 Hours'],
  },

  // --- Executive Cadre (Benchmark Target Score: Minimum 55%) ---
  {
    code: 'ME-10',
    cadre: 'Executive Cadre',
    layer: 'Execution & Process',
    designationTitle: 'ME-10 / Senior Executive',
    shortTitle: 'Senior Executive',
    minServiceYears: 4.5,
    minServiceMonths: 54,
    benchmarkScore: 55,
    competencies: [
      'Daily Process Execution & Ownership',
      'Documentation & File Maintenance',
      'Compliance & Quality Checklist Monitoring',
      'Cross-Line Coordination',
      'Independent Buyer Email Correspondence',
    ],
    keyHardSkills: ['Advanced Excel (VLOOKUP, Pivot, Dashboards)', 'ERP / FastReact Data Operations', 'Buyer Tech Pack Analysis', 'Flawless Daily Report Submission'],
    sampleKpis: ['Daily Report Accuracy 100%', 'Zero Missed Sample Comments', 'Pre-Production Checklist Verification 100%'],
  },
  {
    code: 'ME-11',
    cadre: 'Executive Cadre',
    layer: 'Execution & Process',
    designationTitle: 'ME-11 / Executive',
    shortTitle: 'Executive',
    minServiceYears: 2.5,
    minServiceMonths: 30,
    benchmarkScore: 55,
    competencies: [
      'Daily Operational Workflows',
      'Order Status Documentation',
      'Sample & Trim Follow-up',
      'Quality Standard Compliance',
    ],
    keyHardSkills: ['MS Excel Operations', 'ERP Data Entry & Tracking', 'CAD/Optitex Marker Checks', 'Professional Communication'],
    sampleKpis: ['Daily Tracker Updates Completed by 5 PM', 'Trim Card Preparation Within 24 Hrs', 'Sampling Timeline Adherence'],
  },
  {
    code: 'ME-12',
    cadre: 'Executive Cadre',
    layer: 'Execution & Process',
    designationTitle: 'ME-12 / Assistant Executive',
    shortTitle: 'Assistant Executive',
    minServiceYears: 0.5,
    minServiceMonths: 6,
    benchmarkScore: 55,
    competencies: [
      'Basic Process Execution Under Guidance',
      'Data Entry & Record Keeping',
      'Floor Sample Movement',
      'Support Senior Executives',
    ],
    keyHardSkills: ['Basic Excel & Word', 'ERP Data Input', 'Sample Tagging', 'Daily Log Keeping'],
    sampleKpis: ['Data Entry Accuracy > 98%', 'Timely Material Chalan Collection', 'Checklist Execution On Time'],
  },
  {
    code: 'ME-13',
    cadre: 'Executive Cadre',
    layer: 'Execution & Process',
    designationTitle: 'ME-13 / Trainee / Fresher',
    shortTitle: 'Trainee / Fresher',
    minServiceYears: 0,
    minServiceMonths: 0,
    benchmarkScore: 55,
    competencies: [
      'Eagerness to Learn RMG Operations',
      'Basic Computer Literacy',
      'Academic Foundation in Textiles/Business',
      'Punctuality & Discipline',
    ],
    keyHardSkills: ['Basic MS Office', 'Communication Skills', 'Textile/Garment Manufacturing Concepts'],
    sampleKpis: ['Trainee Curriculum Progress', 'Weekly Learning Review Score > 75%', 'Attendance & Safety Compliance 100%'],
  },

  // --- Staff & Worker Cadre ---
  {
    code: 'ME-14',
    cadre: 'Service Staff Cadre',
    layer: 'Operational Support',
    designationTitle: 'Staff-1 / Sr. Service Staff',
    shortTitle: 'Sr. Staff',
    minServiceYears: 5,
    minServiceMonths: 60,
    benchmarkScore: 55,
    competencies: ['Floor Log Maintenance', 'Material Handling', 'Shift Register Entry'],
    keyHardSkills: ['Register Maintenance', 'Basic Equipment Check', 'Safety Compliance'],
    sampleKpis: ['Store / Floor Receipt Logs Accuracy 100%'],
  },
  {
    code: 'ME-15',
    cadre: 'Service Staff Cadre',
    layer: 'Operational Support',
    designationTitle: 'Staff-2 / Service Staff',
    shortTitle: 'Service Staff',
    minServiceYears: 3,
    minServiceMonths: 36,
    benchmarkScore: 55,
    competencies: ['Routine Maintenance', 'Dispatch Coordination', 'Attendance Logging'],
    keyHardSkills: ['Documentation Tracking', 'Floor Safety Rules'],
    sampleKpis: ['Zero Unrecorded Dispatches'],
  },
  {
    code: 'ME-16',
    cadre: 'Service Staff Cadre',
    layer: 'Operational Support',
    designationTitle: 'Staff-3 / Junior Staff',
    shortTitle: 'Junior Staff',
    minServiceYears: 1.5,
    minServiceMonths: 18,
    benchmarkScore: 55,
    competencies: ['Supportive Floor Duties', 'Store Moving', 'Record Stamping'],
    keyHardSkills: ['Basic Literacy', 'Number Verification'],
    sampleKpis: ['Daily Task Sheet Execution'],
  },
  {
    code: 'ME-17',
    cadre: 'Service Staff Cadre',
    layer: 'Operational Support',
    designationTitle: 'Staff-4 / Assistant Staff',
    shortTitle: 'Assistant Staff',
    minServiceYears: 0.5,
    minServiceMonths: 6,
    benchmarkScore: 55,
    competencies: ['General Floor Support', 'Safety Protocol Adherence'],
    keyHardSkills: ['Basic Equipment Handling'],
    sampleKpis: ['Safety Guidelines Followed 100%'],
  },

  // --- Worker Cadre ---
  {
    code: 'NME-18',
    cadre: 'Worker Cadre',
    layer: 'Operational Support',
    designationTitle: 'Senior Operator (Senior Opa)',
    shortTitle: 'Senior Operator',
    minServiceYears: 4,
    minServiceMonths: 48,
    benchmarkScore: 50,
    competencies: ['Critical Machine Operation (Overlock, Flatlock, Auto-Pocket)', 'Quality Stitching', 'SMV Target Meeting'],
    keyHardSkills: ['Sewing Machine Handling', 'Zero-Defect Sewing', 'Guide Attachment Setup'],
    sampleKpis: ['Individual Efficiency > 75%', 'Rework Rate < 1.5%'],
  },
  {
    code: 'NME-19',
    cadre: 'Worker Cadre',
    layer: 'Operational Support',
    designationTitle: 'Operator (Opa)',
    shortTitle: 'Operator',
    minServiceYears: 2,
    minServiceMonths: 24,
    benchmarkScore: 50,
    competencies: ['Standard Sewing Operation', 'Operation Target Adherence', 'Cleanliness'],
    keyHardSkills: ['Single Needle / Double Needle', 'Basic Needle Replacement'],
    sampleKpis: ['Daily Piece Target Met > 90%'],
  },
  {
    code: 'NME-20',
    cadre: 'Worker Cadre',
    layer: 'Operational Support',
    designationTitle: 'Junior Operator (Junior Opa)',
    shortTitle: 'Junior Operator',
    minServiceYears: 0.5,
    minServiceMonths: 6,
    benchmarkScore: 50,
    competencies: ['Line Feed Support', 'Basic Operation', 'Safety Device Utilization'],
    keyHardSkills: ['Basic Sewing', 'Trim Cutting'],
    sampleKpis: ['Daily Attendance 100%'],
  },
  {
    code: 'NME-21',
    cadre: 'Worker Cadre',
    layer: 'Operational Support',
    designationTitle: 'Helper',
    shortTitle: 'Helper',
    minServiceYears: 0,
    minServiceMonths: 0,
    benchmarkScore: 50,
    competencies: ['Bundle Moving', 'Trim Snipping', 'Numbering & Tagging'],
    keyHardSkills: ['Material Handling', 'Bundle Sorting'],
    sampleKpis: ['Zero Mixed Bundles'],
  },
];

// --- Core Divisions & Departments (Requirement 2) ---
export const CORE_DIVISIONS_AND_DEPARTMENTS = [
  'Administration, HR, Compliance, Welfare (HR.A.C)',
  'Accounts & Finance',
  'Merchandising (Merchandising-1, Merchandising-2)',
  'CAD, Fashion Designing, Sample',
  'IE (Industrial Engineering) & Planning',
  'Quality Assurance (GPQ, QS, SIS, Quality Assurance)',
  'Production Units: Cutting, Sewing, Finishing, Wash, Embroidery',
  'Supply Chain, Commercial, Procurement, Store',
  'Engineering, Electrical, Maintenance, Safety',
  'I&CT, ERP & MIS, Medical, Transport, Security',
];

// --- Applicable SBU Units (Requirement 2) ---
export interface SBUUnit {
  code: string;
  name: string;
  type: 'Corporate Office' | 'Factory Floor Unit' | 'Washing & Specialty Unit';
  description: string;
}

export const APPLICABLE_SBU_UNITS: SBUUnit[] = [
  {
    code: 'SFCO',
    name: 'SFCO (Corporate Head Office)',
    type: 'Corporate Office',
    description: 'Corporate headquarters, central merchandising, executive HR, accounts & global buyer liaison',
  },
  {
    code: 'SFF',
    name: 'SFF (Factory Floor Unit - Fashions)',
    type: 'Factory Floor Unit',
    description: 'Direct garment manufacturing facility, woven & knit bulk production, cutting & sewing floors',
  },
  {
    code: 'SFJ',
    name: 'SFJ (Factory Floor Unit - Denim & Jeans)',
    type: 'Factory Floor Unit',
    description: 'Heavy denim garment manufacturing, specialized 5-pocket denim sewing & assembly lines',
  },
  {
    code: 'SFW',
    name: 'SFW (Factory Floor Unit - Washing & Dyeing)',
    type: 'Washing & Specialty Unit',
    description: 'Specialized industrial wet/dry garment washing, garment dyeing, enzyme & laser finishing plant',
  },
];

// --- Competency Standards Dictionary by Layer (Requirement 3) ---
export const LAYER_COMPETENCY_DICTIONARY = {
  'Strategic & Policy': {
    cadres: ['GM Cadre (ME-1 to ME-5)'],
    benchmarkScore: 85,
    summary: 'High-level strategy, cross-SBU governance, risk management, and overall organizational direction.',
    coreCompetencies: [
      'Strategy, Governance & Policy Setting',
      'Budget & Risk Oversight',
      'Cross-SBU Governance',
      'Strategic Thinking',
      'Industry Benchmarking',
      'Global Buyer Relations & Commercial Negotiations',
    ],
    keyHardSkills: [
      'Strategic Planning & Budgeting',
      'Departmental Analytics & MIS',
      'Policy & SOP Design',
      'Turnover & Margin Engineering',
    ],
  },
  'Operational & Supervision': {
    cadres: ['Managerial Cadre (ME-6 to ME-9)'],
    benchmarkScore: 70,
    summary: 'Operational management, line coordination, departmental milestone achievement, and vendor/buyer interface.',
    coreCompetencies: [
      'Operational Management & Team Supervision',
      'Process Control & Quality Checkpoints',
      'Vendor / Cross-Department Coordination',
      'Target Achievement & Critical Path Tracking',
      'Root Cause Analysis & Corrective Actions',
    ],
    keyHardSkills: [
      'Operational Planning & Scheduling',
      'Team & Shift Management',
      'Vendor / Resource Coordination',
      'FastReact / ERP Systems',
      'Root Cause Analysis',
    ],
  },
  'Execution & Process': {
    cadres: ['Executive Cadre (ME-10 to ME-13)'],
    benchmarkScore: 55,
    summary: 'Hands-on daily process execution, accurate reporting, buyer communication, and compliance checklists.',
    coreCompetencies: [
      'Daily Process Execution & Follow-up',
      'Accurate Documentation & File Archiving',
      'Data Entry & Daily Progress Report Preparation',
      'Compliance / Quality Checklist Monitoring',
      'Cross-Line Coordination & Buyer Correspondence',
    ],
    keyHardSkills: [
      'MS Excel (VLOOKUP, Pivot, Dashboards)',
      'ERP Operations (AIMS / SAP / FastReact)',
      'Buyer Communication & Tech Pack Analysis',
      'Flawless Daily Report Submission',
    ],
  },
};

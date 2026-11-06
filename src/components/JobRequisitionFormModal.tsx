/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Briefcase,
  Check,
  ChevronDown,
  Search,
  Sliders,
  X,
} from 'lucide-react';
import { JobRequisition, RequisitionCompanyFit } from '../types';
import { MASTER_DEPARTMENTS, MASTER_POSITIONS } from '../data/hiringTrackerData';
import { DynamicTagInput } from './DynamicTagInput';

export const JOB_LOCATION_OPTIONS = ['SFCO', 'SFF', 'SFJ', 'SFW'] as const;

export const BANGLADESHI_ACADEMIC_QUALIFICATIONS = [
  'B.Sc. in Textile Engineering',
  'B.Sc. in CSE',
  'B.Sc. in EEE',
  'B.Sc. in Mechanical Engineering',
  'BBA in Accounting',
  'BBA in Management/Marketing',
  'BSS',
  'BA',
  'MBA',
  'M.Sc.',
  'MSS',
  'PGD in HRM',
  'Supply Chain Management (PGDSCM)',
  'Diploma in Textile',
  'SSC',
  'HSC',
  'Other Equivalent Degree',
] as const;

export const RMG_TYPE_OPTIONS = [
  'Woven',
  'Knit',
  'Dyeing',
  'Denim',
  'Non-Denim',
] as const;

export const RMG_PRODUCTS_OPTIONS = ['Bottom', 'Top'] as const;

export const COMPANY_TYPE_OPTIONS = [
  'Corporate Office',
  'Factory Floor',
  'Factory-Based Head Office',
  'Others Institutes',
] as const;

export const JOB_TYPE_OPTIONS = [
  'Full-Time',
  'Temporary',
  'Contractual',
] as const;

export const JOB_GRADE_MATRIX_OPTIONS = [
  'ME-2 (GM Layer | 23.5 Years Exp | Score: 85-100%)',
  'ME-3 (GM Layer | 20.5 Years Exp | Score: 85-100%)',
  'ME-4 (GM Layer | 17.5 Years Exp | Score: 85-100%)',
  'ME-5 (GM Layer | 14.5 Years Exp | Score: 85-100%)',
  'ME-6 (Manager Layer | 12.5 Years Exp | Score: 70-84%)',
  'ME-7 (Manager Layer | 10.5 Years Exp | Score: 70-84%)',
  'ME-8 (Manager Layer | 8.5 Years Exp | Score: 70-84%)',
  'ME-9 (Manager Layer | 6.5 Years Exp | Score: 70-84%)',
  'ME-10 (Executive Layer | 4.5 Years Exp | Score: 55-69%)',
  'ME-11 (Executive Layer | 2.5 Years Exp | Score: 55-69%)',
  'ME-12 (Executive Layer | 6 Months RMG Exp | Score: 55-69%)',
  'ME-13 (Executive Layer | Fresher / Entry | Score: 55-69%)',
  'ME-14 to ME-17 (Service Staff Layer | Score: 55-69%)',
] as const;

export const SUGGESTED_INDUSTRIES = [
  'RMG & Apparel',
  'Footwear',
  'Textiles',
  'FMCG',
];

export const SUGGESTED_BUYERS = [
  'H&M',
  'Inditex/Zara',
  'Walmart',
  'Target',
  'Next',
  'Marks & Spencer',
  "Levi's",
];

export const SUGGESTED_HARD_TECHNICAL_SKILLS = [
  'FastReact',
  'Optitex CAD',
  'Gerber Accumark',
  'Lectra',
  'ERP / SAP',
  'Advanced MS Excel (Pivot/VLOOKUP)',
  'GSD (General Sewing Data)',
  'Line Balancing & IE Tools',
  'Fabric Consumption & Costing',
  'Pattern Making',
  'Quality AQL Standards',
  'Washing Recipe Formulation',
  'Wet Process Chemistry',
  'Chemical Dosing & Shade Matching',
  'Compliance Auditing (Sedex/WRAP/BSCI)',
  'Labor Law & Payroll',
];

interface JobRequisitionFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialRequisition?: JobRequisition | null;
  onClose: () => void;
  onSubmit: (req: JobRequisition) => void;
}

export const JobRequisitionFormModal: React.FC<JobRequisitionFormModalProps> = ({
  isOpen,
  mode,
  initialRequisition,
  onClose,
  onSubmit,
}) => {
  // 1. Position Title (Primary Identifier - Searchable Combobox + Free Text)
  const [positionTitle, setPositionTitle] = useState('');
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
  const positionComboboxRef = useRef<HTMLDivElement | null>(null);

  // 2. Department
  const [department, setDepartment] = useState('');

  // 3. Requisition No
  const [requisitionNo, setRequisitionNo] = useState('');

  // 4. Salary Range
  const [salaryRange, setSalaryRange] = useState('');

  // 5. Job Location (4 SBU options)
  const [jobLocation, setJobLocation] = useState('');

  // 6. Job Responsibilities (KRA)
  const [jobResponsibilities, setJobResponsibilities] = useState('');

  // Job Specification (KSA)
  const [jobSpecification, setJobSpecification] = useState('');

  // Hard Technical Skills (Optional multi-tag + clickable suggestions)
  const [hardTechnicalSkills, setHardTechnicalSkills] = useState<string[]>([]);

  // 8. Academic Qualifications (Multi-select searchable combobox)
  const [academicQualifications, setAcademicQualifications] = useState<string[]>([]);
  const [isAcademicDropdownOpen, setIsAcademicDropdownOpen] = useState(false);
  const [academicSearch, setAcademicSearch] = useState('');
  const academicComboboxRef = useRef<HTMLDivElement | null>(null);

  // 9. Total Years of Experience
  const [totalYearsExperience, setTotalYearsExperience] = useState('');

  // 10. Industries
  const [industries, setIndustries] = useState<string[]>([]);

  // 11. RMG Type
  const [rmgType, setRmgType] = useState<string[]>([]);

  // 12. RMG Products
  const [rmgProducts, setRmgProducts] = useState<string[]>([]);

  // 13. Buyer Name
  const [buyerNames, setBuyerNames] = useState<string[]>([]);

  // 14. Company Name
  const [companyName, setCompanyName] = useState('');

  // 15. Company Type
  const [companyType, setCompanyType] = useState('');

  // 16. Job Type
  const [jobType, setJobType] = useState('');

  // 17. Job Grade
  const [jobGrade, setJobGrade] = useState('');

  // 18. Compensation & Benefits
  const [compensationBenefits, setCompensationBenefits] = useState('');

  // Populate or reset form when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setIsPositionDropdownOpen(false);
    setIsAcademicDropdownOpen(false);
    setAcademicSearch('');

    if (initialRequisition) {
      setPositionTitle(
        mode === 'create' && initialRequisition.title
          ? `${initialRequisition.title} (Copy)`
          : initialRequisition.title || ''
      );
      setDepartment(initialRequisition.department || '');
      setRequisitionNo(
        mode === 'create' ? '' : initialRequisition.requisitionNo || ''
      );
      setSalaryRange(initialRequisition.salaryRange || '');
      setJobLocation(initialRequisition.sbuUnit || '');
      setJobResponsibilities(
        initialRequisition.keyResponsibilities ||
          initialRequisition.jobDescription ||
          ''
      );
      setJobSpecification(
        initialRequisition.keyKSA || initialRequisition.jobRequirements || ''
      );
      setHardTechnicalSkills(
        initialRequisition.hardTechnicalSkills ||
          initialRequisition.softwareTools ||
          []
      );
      setAcademicQualifications(initialRequisition.academicDegrees || []);
      setTotalYearsExperience(
        initialRequisition.experienceLevel &&
          initialRequisition.experienceLevel !== 'Any Experience'
          ? initialRequisition.experienceLevel
          : initialRequisition.minExperienceYears !== undefined
            ? `${initialRequisition.minExperienceYears} Years`
            : ''
      );
      setIndustries(
        initialRequisition.industries ||
          initialRequisition.companyFit?.industrySegment ||
          []
      );
      setRmgType(
        initialRequisition.rmgType ||
          initialRequisition.companyFit?.rmgDivisions ||
          []
      );
      setRmgProducts(initialRequisition.rmgProducts || []);
      setBuyerNames(initialRequisition.buyerPortfolio || []);
      setCompanyName(initialRequisition.companyName || '');
      setCompanyType(
        initialRequisition.companyType ||
          initialRequisition.companyFit?.workplaceNature ||
          ''
      );
      setJobType(initialRequisition.jobType || '');
      setJobGrade(initialRequisition.targetGradeCode || '');
      setCompensationBenefits(initialRequisition.compensationBenefits || '');
    } else {
      // Strictly empty defaults
      setPositionTitle('');
      setDepartment('');
      setRequisitionNo('');
      setSalaryRange('');
      setJobLocation('');
      setJobResponsibilities('');
      setJobSpecification('');
      setHardTechnicalSkills([]);
      setAcademicQualifications([]);
      setTotalYearsExperience('');
      setIndustries([]);
      setRmgType([]);
      setRmgProducts([]);
      setBuyerNames([]);
      setCompanyName('');
      setCompanyType('');
      setJobType('');
      setJobGrade('');
      setCompensationBenefits('');
    }
  }, [isOpen, mode, initialRequisition]);

  // Outside click handlers for searchable comboboxes
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        positionComboboxRef.current &&
        !positionComboboxRef.current.contains(e.target as Node)
      ) {
        setIsPositionDropdownOpen(false);
      }
      if (
        academicComboboxRef.current &&
        !academicComboboxRef.current.contains(e.target as Node)
      ) {
        setIsAcademicDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPositions = useMemo(() => {
    const q = positionTitle.trim().toLowerCase();
    if (!q) return MASTER_POSITIONS;
    return MASTER_POSITIONS.filter((pos) => pos.toLowerCase().includes(q));
  }, [positionTitle]);

  const filteredAcademics = useMemo(() => {
    const q = academicSearch.trim().toLowerCase();
    if (!q) return BANGLADESHI_ACADEMIC_QUALIFICATIONS;
    return BANGLADESHI_ACADEMIC_QUALIFICATIONS.filter((deg) =>
      deg.toLowerCase().includes(q)
    );
  }, [academicSearch]);

  if (!isOpen) return null;

  const toggleChip = (
    list: string[],
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  const handleSave = () => {
    const finalTitle = positionTitle.trim() || 'Untitled Position';
    const trimmedReqNo = requisitionNo.trim();
    const trimmedDept = department.trim();
    const trimmedSalary = salaryRange.trim();
    const trimmedLocation = jobLocation.trim();
    const trimmedKra = jobResponsibilities.trim();
    const trimmedKsa = jobSpecification.trim();
    const trimmedExp = totalYearsExperience.trim();
    const trimmedCompany = companyName.trim();
    const trimmedCompanyType = companyType.trim();
    const trimmedJobType = jobType.trim();
    const trimmedGrade = jobGrade.trim();
    const trimmedBenefits = compensationBenefits.trim();

    // Parse numeric years if present for downstream screening compatibility
    const expMatch = trimmedExp.match(/(\d+(?:\.\d+)?)/);
    const parsedMinYears = expMatch ? parseFloat(expMatch[1]) : undefined;

    const companyFit: RequisitionCompanyFit | undefined =
      industries.length > 0 ||
      rmgType.length > 0 ||
      rmgProducts.length > 0 ||
      trimmedCompanyType
        ? {
            industrySegment: industries.length > 0 ? industries : undefined,
            rmgDivisions: rmgType.length > 0 ? rmgType : undefined,
            workplaceNature: trimmedCompanyType || undefined,
            specificProductItems:
              rmgProducts.length > 0 ? rmgProducts : undefined,
          }
        : undefined;

    const combinedContentParts = [
      `Position Title: ${finalTitle}`,
      trimmedDept ? `Department: ${trimmedDept}` : '',
      trimmedReqNo ? `Requisition No: ${trimmedReqNo}` : '',
      trimmedLocation ? `Job Location: ${trimmedLocation}` : '',
      trimmedGrade ? `Job Grade: ${trimmedGrade}` : '',
      trimmedExp ? `Total Years of Experience: ${trimmedExp}` : '',
      academicQualifications.length > 0
        ? `Academic Qualifications: ${academicQualifications.join(', ')}`
        : '',
      trimmedKra ? `Job Responsibilities (KRA):\n${trimmedKra}` : '',
      trimmedKsa ? `Job Specification (KSA):\n${trimmedKsa}` : '',
      hardTechnicalSkills.length > 0
        ? `Hard Technical Skills: ${hardTechnicalSkills.join(', ')}`
        : '',
      industries.length > 0 ? `Industries: ${industries.join(', ')}` : '',
      rmgType.length > 0 ? `RMG Type: ${rmgType.join(', ')}` : '',
      rmgProducts.length > 0 ? `RMG Products: ${rmgProducts.join(', ')}` : '',
      buyerNames.length > 0 ? `Buyer Name: ${buyerNames.join(', ')}` : '',
      trimmedCompany ? `Company Name: ${trimmedCompany}` : '',
      trimmedCompanyType ? `Company Type: ${trimmedCompanyType}` : '',
      trimmedJobType ? `Job Type: ${trimmedJobType}` : '',
      trimmedSalary ? `Salary Range: ${trimmedSalary}` : '',
      trimmedBenefits ? `Compensation & Benefits: ${trimmedBenefits}` : '',
    ].filter(Boolean);

    const recordId =
      mode === 'edit' && initialRequisition
        ? initialRequisition.id
        : trimmedReqNo || `REQ-${Date.now()}`;

    const savedReq: JobRequisition = {
      ...(mode === 'edit' && initialRequisition ? initialRequisition : {}),
      id: recordId,
      requisitionNo: trimmedReqNo,
      title: finalTitle,
      department: trimmedDept,
      sbuUnit: trimmedLocation || undefined,
      locations: trimmedLocation ? [trimmedLocation] : undefined,
      unit: trimmedLocation || undefined,
      salaryRange: trimmedSalary || undefined,
      keyResponsibilities: trimmedKra || undefined,
      jobDescription: trimmedKra || undefined,
      keyKSA: trimmedKsa || undefined,
      jobRequirements: trimmedKsa || undefined,
      hardTechnicalSkills:
        hardTechnicalSkills.length > 0 ? hardTechnicalSkills : undefined,
      softwareTools:
        hardTechnicalSkills.length > 0 ? hardTechnicalSkills : undefined,
      academicDegrees:
        academicQualifications.length > 0 ? academicQualifications : undefined,
      experienceLevel: trimmedExp,
      minExperienceYears: parsedMinYears,
      industries: industries.length > 0 ? industries : undefined,
      rmgType: rmgType.length > 0 ? rmgType : undefined,
      rmgProducts: rmgProducts.length > 0 ? rmgProducts : undefined,
      buyerPortfolio: buyerNames.length > 0 ? buyerNames : undefined,
      companyName: trimmedCompany || undefined,
      companyType: trimmedCompanyType || undefined,
      jobType: trimmedJobType || undefined,
      targetGradeCode: trimmedGrade || undefined,
      compensationBenefits: trimmedBenefits || undefined,
      companyFit,
      category: trimmedDept || 'Operations',
      hiringCategory:
        mode === 'edit' && initialRequisition
          ? initialRequisition.hiringCategory
          : 'current',
      status:
        mode === 'edit' && initialRequisition
          ? initialRequisition.status
          : 'open',
      content: combinedContentParts.join('\n'),
      createdAt:
        mode === 'edit' && initialRequisition
          ? initialRequisition.createdAt
          : new Date().toISOString().slice(0, 10),
    };

    onSubmit(savedReq);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#161b22] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-[#30363d] text-[#e6edf3] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#30363d] bg-[#21262d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              {mode === 'edit' ? (
                <Sliders className="w-5 h-5 text-indigo-400" />
              ) : (
                <Briefcase className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#e6edf3]">
                {mode === 'edit'
                  ? 'Edit Job Requisition'
                  : 'Create New Job Requisition'}
              </h2>
              <p className="text-xs text-[#8b949e]">
                Position Title is the primary identifier. All other parameters are optional and sync with Hiring Tracker.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d] transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {/* Row 1: Position Title, Department, Requisition No */}
          <div className="p-4 rounded-xl bg-[#21262d] border border-[#30363d] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Position Title (Searchable Dropdown / Combobox + Free-Text) */}
              <div className="sm:col-span-1 space-y-1.5 relative" ref={positionComboboxRef}>
                <label className="block text-[11px] font-bold text-[#e6edf3]">
                  Position Title <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={positionTitle}
                    onChange={(e) => {
                      setPositionTitle(e.target.value);
                      setIsPositionDropdownOpen(true);
                    }}
                    onFocus={() => setIsPositionDropdownOpen(true)}
                    placeholder="Search or type designation..."
                    className="w-full bg-[#161b22] border border-[#30363d] focus:border-indigo-500 rounded-xl pl-3 pr-14 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:outline-none font-semibold"
                    autoFocus
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {positionTitle && (
                      <button
                        type="button"
                        onClick={() => setPositionTitle('')}
                        className="text-[#8b949e] hover:text-[#e6edf3] p-0.5 cursor-pointer"
                        title="Clear Position Title"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setIsPositionDropdownOpen((prev) => !prev)
                      }
                      className="text-[#8b949e] hover:text-[#e6edf3] p-0.5 cursor-pointer"
                      title="Toggle designations list"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isPositionDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto bg-[#1c2128] border border-[#30363d] rounded-xl shadow-2xl p-1 z-50">
                    {filteredPositions.length === 0 ? (
                      <div className="px-3 py-2 text-[11px] text-[#8b949e]">
                        Custom entry: &ldquo;{positionTitle}&rdquo;
                      </div>
                    ) : (
                      filteredPositions.map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => {
                            setPositionTitle(pos);
                            setIsPositionDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                            positionTitle === pos
                              ? 'bg-indigo-600/20 text-indigo-300'
                              : 'text-[#c9d1d9] hover:bg-[#21262d]'
                          }`}
                        >
                          <span>{pos}</span>
                          {positionTitle === pos && (
                            <Check className="w-3.5 h-3.5 text-indigo-400" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Department (Master Departments Dropdown) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#e6edf3]">
                  Department
                </label>
                <div className="relative">
                  <select
                    aria-label="Department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full appearance-none bg-[#161b22] border border-[#30363d] focus:border-indigo-500 rounded-xl pl-3 pr-8 py-2 text-xs text-[#e6edf3] focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Select Department (Optional) --</option>
                    {department &&
                      !MASTER_DEPARTMENTS.includes(department) && (
                        <option value={department}>{department}</option>
                      )}
                    {MASTER_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8b949e] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Requisition No */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#e6edf3]">
                  Requisition No
                </label>
                <input
                  type="text"
                  value={requisitionNo}
                  onChange={(e) => setRequisitionNo(e.target.value)}
                  placeholder="e.g., REQ-2026-001"
                  className="w-full bg-[#161b22] border border-[#30363d] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-indigo-300 font-mono placeholder-[#8b949e] focus:outline-none"
                />
              </div>
            </div>

            {/* Row 2: Salary Range & Job Grade (Side-by-Side 2-Column Horizontal Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Left Column: Salary Range */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#e6edf3]">
                  Salary Range
                </label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="e.g., 45,000 - 65,000 BDT or Negotiable"
                  className="w-full bg-[#161b22] border border-[#30363d] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:outline-none"
                />
              </div>

              {/* Right Column: Job Grade */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#e6edf3]">
                  Job Grade
                </label>
                <div className="relative">
                  <select
                    aria-label="Job Grade"
                    value={jobGrade}
                    onChange={(e) => setJobGrade(e.target.value)}
                    className="w-full appearance-none bg-[#161b22] border border-[#30363d] focus:border-indigo-500 rounded-xl pl-3 pr-8 py-2 text-xs text-[#e6edf3] focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Select Job Grade (Optional) --</option>
                    {jobGrade &&
                      !JOB_GRADE_MATRIX_OPTIONS.includes(jobGrade as any) && (
                        <option value={jobGrade}>{jobGrade}</option>
                      )}
                    {JOB_GRADE_MATRIX_OPTIONS.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8b949e] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 3: Job Location & Total Years of Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Job Location (Fixed 4 SBU Options) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#e6edf3]">
                  Job Location
                </label>
                <div className="relative">
                  <select
                    aria-label="Job Location"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full appearance-none bg-[#161b22] border border-[#30363d] focus:border-indigo-500 rounded-xl pl-3 pr-8 py-2 text-xs text-[#e6edf3] focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Select Job Location (Optional) --</option>
                    {JOB_LOCATION_OPTIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8b949e] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Total Years of Experience */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#e6edf3]">
                  Total Years of Experience
                </label>
                <input
                  type="text"
                  value={totalYearsExperience}
                  onChange={(e) => setTotalYearsExperience(e.target.value)}
                  placeholder='e.g., "4.5 Years" or "3-5 Years"'
                  className="w-full bg-[#161b22] border border-[#30363d] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Job Responsibilities (KRA) & Job Specification (KSA) */}
          <div className="p-4 rounded-xl bg-[#21262d] border border-[#30363d] space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-[#e6edf3]">
                  Job Responsibilities (KRA)
                </label>
                {jobResponsibilities && (
                  <button
                    type="button"
                    onClick={() => setJobResponsibilities('')}
                    className="text-[10px] text-[#8b949e] hover:text-[#e6edf3] cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                rows={4}
                value={jobResponsibilities}
                onChange={(e) => setJobResponsibilities(e.target.value)}
                placeholder="Write, paste, or edit bullet-pointed daily duties and KRA tasks..."
                className="w-full bg-[#161b22] border border-[#30363d] focus:border-indigo-500 rounded-xl p-3 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:outline-none resize-y leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-[#e6edf3]">
                  Job Specification (Knowledge, Skills, Attributes - KSA)
                </label>
                {jobSpecification && (
                  <button
                    type="button"
                    onClick={() => setJobSpecification('')}
                    className="text-[10px] text-[#8b949e] hover:text-[#e6edf3] cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                rows={4}
                value={jobSpecification}
                onChange={(e) => setJobSpecification(e.target.value)}
                placeholder="Write, paste, or edit bullet-pointed competencies, technical skills, and attributes..."
                className="w-full bg-[#161b22] border border-[#30363d] focus:border-indigo-500 rounded-xl p-3 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:outline-none resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Dedicated Hard Technical Skills Section (Optional) */}
          <div className="p-4 rounded-xl bg-[#21262d] border border-[#30363d]">
            <DynamicTagInput
              label="Hard Technical Skills"
              description="Optional — Type custom skills, paste a list, or click suggestions below"
              selectedTags={hardTechnicalSkills}
              onAddTag={(skill) => {
                if (!hardTechnicalSkills.includes(skill)) {
                  setHardTechnicalSkills([...hardTechnicalSkills, skill]);
                }
              }}
              onAddTags={(skills) => {
                setHardTechnicalSkills((prev) =>
                  Array.from(new Set([...prev, ...skills]))
                );
              }}
              onRemoveTag={(skill) => {
                setHardTechnicalSkills(
                  hardTechnicalSkills.filter((s) => s !== skill)
                );
              }}
              suggestedTags={SUGGESTED_HARD_TECHNICAL_SKILLS}
              placeholder="Type technical skill (e.g., FastReact, Optitex CAD, ERP / SAP) & press Enter..."
              colorTheme="amber"
            />
          </div>

          {/* Academic Qualifications (Multi-select dropdown / searchable combobox) */}
          <div
            className="p-4 rounded-xl bg-[#21262d] border border-[#30363d] space-y-2.5 relative"
            ref={academicComboboxRef}
          >
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-[#e6edf3]">
                Academic Qualifications
              </label>
              <span className="text-[10px] text-[#8b949e]">
                {academicQualifications.length} selected
              </span>
            </div>

            {/* Selected Academic Qualifications Chips */}
            {academicQualifications.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[#161b22] border border-[#30363d]">
                {academicQualifications.map((deg) => (
                  <span
                    key={deg}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/70 text-emerald-200 border border-emerald-500/40"
                  >
                    <span>{deg}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setAcademicQualifications((prev) =>
                          prev.filter((item) => item !== deg)
                        )
                      }
                      className="hover:bg-white/20 rounded p-0.5 cursor-pointer"
                      aria-label={`Remove ${deg}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Searchable Multi-Select Trigger */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={academicSearch}
                onChange={(e) => {
                  setAcademicSearch(e.target.value);
                  setIsAcademicDropdownOpen(true);
                }}
                onFocus={() => setIsAcademicDropdownOpen(true)}
                placeholder="Search & select Bangladeshi academic qualifications..."
                className="w-full bg-[#161b22] border border-[#30363d] focus:border-indigo-500 rounded-xl pl-8 pr-8 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsAcademicDropdownOpen((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#e6edf3] cursor-pointer"
                aria-label="Toggle academic qualifications dropdown"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {isAcademicDropdownOpen && (
              <div className="max-h-52 overflow-y-auto bg-[#1c2128] border border-[#30363d] rounded-xl shadow-2xl p-1.5 space-y-0.5">
                {filteredAcademics.map((deg) => {
                  const isSelected = academicQualifications.includes(deg);
                  return (
                    <button
                      key={deg}
                      type="button"
                      onClick={() =>
                        toggleChip(
                          academicQualifications,
                          deg,
                          setAcademicQualifications
                        )
                      }
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-950/60 text-emerald-300 font-semibold'
                          : 'text-[#c9d1d9] hover:bg-[#21262d]'
                      }`}
                    >
                      <span>{deg}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Industries, RMG Type, RMG Products, Buyer Name */}
          <div className="p-4 rounded-xl bg-[#21262d] border border-[#30363d] space-y-4">
            {/* Industries */}
            <DynamicTagInput
              label="Industries"
              selectedTags={industries}
              onAddTag={(ind) => {
                if (!industries.includes(ind))
                  setIndustries([...industries, ind]);
              }}
              onAddTags={(inds) => {
                setIndustries((prev) => Array.from(new Set([...prev, ...inds])));
              }}
              onRemoveTag={(ind) => {
                setIndustries(industries.filter((i) => i !== ind));
              }}
              suggestedTags={SUGGESTED_INDUSTRIES}
              placeholder="Type industry (e.g., RMG & Apparel, Footwear, Textiles, FMCG) & Enter..."
              colorTheme="indigo"
            />

            {/* RMG Type & RMG Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#e6edf3]">
                  RMG Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {RMG_TYPE_OPTIONS.map((type) => {
                    const isSelected = rmgType.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleChip(rmgType, type, setRmgType)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-purple-950/70 text-purple-200 border-purple-500/50'
                            : 'bg-[#161b22] text-[#8b949e] border-[#30363d] hover:text-[#e6edf3]'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-purple-400" />
                        )}
                        <span>{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#e6edf3]">
                  RMG Products
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {RMG_PRODUCTS_OPTIONS.map((prod) => {
                    const isSelected = rmgProducts.includes(prod);
                    return (
                      <button
                        key={prod}
                        type="button"
                        onClick={() =>
                          toggleChip(rmgProducts, prod, setRmgProducts)
                        }
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-950/70 text-indigo-200 border-indigo-500/50'
                            : 'bg-[#161b22] text-[#8b949e] border-[#30363d] hover:text-[#e6edf3]'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-indigo-400" />
                        )}
                        <span>{prod}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Buyer Name */}
            <DynamicTagInput
              label="Buyer Name"
              selectedTags={buyerNames}
              onAddTag={(buyer) => {
                if (!buyerNames.includes(buyer))
                  setBuyerNames([...buyerNames, buyer]);
              }}
              onAddTags={(buyers) => {
                setBuyerNames((prev) => Array.from(new Set([...prev, ...buyers])));
              }}
              onRemoveTag={(buyer) => {
                setBuyerNames(buyerNames.filter((b) => b !== buyer));
              }}
              suggestedTags={SUGGESTED_BUYERS}
              placeholder="Type buyer name (e.g., H&M, Inditex/Zara, Walmart, Target) & Enter..."
              colorTheme="cyan"
            />
          </div>

          {/* Company Name, Company Type, Job Type, Compensation & Benefits */}
          <div className="p-4 rounded-xl bg-[#21262d] border border-[#30363d] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#e6edf3]">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name..."
                  className="w-full bg-[#161b22] border border-[#30363d] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:outline-none"
                />
              </div>

              {/* Company Type */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#e6edf3]">
                  Company Type
                </label>
                <div className="relative">
                  <select
                    aria-label="Company Type"
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    className="w-full appearance-none bg-[#161b22] border border-[#30363d] focus:border-indigo-500 rounded-xl pl-3 pr-8 py-2 text-xs text-[#e6edf3] focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Select Company Type (Optional) --</option>
                    {COMPANY_TYPE_OPTIONS.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8b949e] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Job Type */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#e6edf3]">
                  Job Type
                </label>
                <div className="relative">
                  <select
                    aria-label="Job Type"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full appearance-none bg-[#161b22] border border-[#30363d] focus:border-indigo-500 rounded-xl pl-3 pr-8 py-2 text-xs text-[#e6edf3] focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Select Job Type (Optional) --</option>
                    {JOB_TYPE_OPTIONS.map((jt) => (
                      <option key={jt} value={jt}>
                        {jt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8b949e] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Compensation & Benefits */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#e6edf3]">
                Compensation &amp; Benefits
              </label>
              <textarea
                rows={2}
                value={compensationBenefits}
                onChange={(e) => setCompensationBenefits(e.target.value)}
                placeholder="e.g., Festival Bonus, Medical Allowance, Provident Fund, Mobile Bill, Subsidized Lunch"
                className="w-full bg-[#161b22] border border-[#30363d] focus:border-indigo-500 rounded-xl p-3 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:outline-none resize-y"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#30363d] bg-[#21262d] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#161b22] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950/40 transition cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{mode === 'edit' ? 'Update & Save' : 'Save Position'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

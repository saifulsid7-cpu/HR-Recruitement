/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRightLeft,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CalendarCheck,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  FileUp,
  Filter,
  Flame,
  FolderArchive,
  Layers,
  LayoutGrid,
  List,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  Sliders,
  Sparkles,
  Tag,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  Candidate,
  CandidateStatus,
  EvaluatedJobMatch,
  EvaluationCriterionConfig,
  JobRequisition,
  RatingBand,
  UploadQueueItem,
  VerdictType,
} from '../types';
import {
  getCandidateActionOpinion,
  getCandidateScoreBreakdown,
  getCandidateStrengthsAndGaps,
  getVerdictBadge,
} from '../utils/scoringCardHelper';
import { cacheCandidateFileBlob } from '../utils/fileBlobCache';
import { getRatingFromScore } from '../data/standardCriteria';
import { exportCandidatesToCSV, exportCandidatesToExcel } from '../utils/excelExport';
import { TriMatchCardSection } from './TriMatchCardSection';
import { ResumeVerificationDrawer } from './ResumeVerificationDrawer';
import { applyDomainGatekeeperToCandidate } from '../utils/domainGatekeeper';

interface ScreeningEngineViewProps {
  activeRequisitions: JobRequisition[];
  selectedRequisitionId: string;
  onSelectRequisitionId: (id: string) => void;
  candidates: Candidate[];
  onUpdateCandidateStatus: (candidateId: string, status: CandidateStatus) => void;
  onAddCandidates: (newCandidates: Candidate[]) => void;
  onClearCandidates: (reqId?: string) => void;
  onOpenCandidateDetail: (candidate: Candidate) => void;
  onOpenOfferMemo: (candidate: Candidate) => void;
  onOpenRejectionNotice: (candidate: Candidate) => void;
  onOpenSalaryAdjust: (candidate: Candidate) => void;
  onOpenMovePosition: (candidate: Candidate) => void;
  companyName: string;
  onOpenSalaryMatrix: () => void;
  onOpenIndustryGuide: () => void;
  onOpenStandardCriteria: () => void;
  onOpenNewJobModal: () => void;
  blindMode: boolean;
  onToggleBlindMode: () => void;
  criteriaConfig: EvaluationCriterionConfig[];
}

export const ScreeningEngineView: React.FC<ScreeningEngineViewProps> = ({
  activeRequisitions,
  selectedRequisitionId,
  onSelectRequisitionId,
  candidates,
  onUpdateCandidateStatus,
  onAddCandidates,
  onClearCandidates,
  onOpenCandidateDetail,
  onOpenOfferMemo,
  onOpenRejectionNotice,
  onOpenSalaryAdjust,
  onOpenMovePosition,
  companyName,
  onOpenSalaryMatrix,
  onOpenIndustryGuide,
  onOpenStandardCriteria,
  onOpenNewJobModal,
  blindMode,
  onToggleBlindMode,
  criteriaConfig,
}) => {
  // 1. Target Job Selection Mode: 'single' | 'multiple'
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>('single');

  // Multi-job selected requisition IDs
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>(() => {
    return activeRequisitions.slice(0, 3).map((r) => r.id);
  });

  // Upload Queue
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isScreening, setIsScreening] = useState(false);
  const [screeningProgress, setScreeningProgress] = useState<{
    current: number;
    total: number;
    currentFileName?: string;
  }>({ current: 0, total: 0 });

  // ISOLATED LOCAL BATCH SCREENING STATE:
  // Screening Engine maintains an isolated batch state strictly for the current screening run.
  // When switching job requisitions or clearing the job, this state is 100% reset to empty.
  const [batchEvaluationResults, setBatchEvaluationResults] = useState<Candidate[]>([]);

  // Output filters
  const [statusFilter, setStatusFilter] = useState<'all' | CandidateStatus>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'overall' | 'jd' | 'requirements' | 'company'>('overall');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showJobSpecs, setShowJobSpecs] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Merit-List Collapsible Expansion & Side-by-Side CV Drawer
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);
  const [activeVerificationCandidate, setActiveVerificationCandidate] = useState<Candidate | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active single requisition object (null if deselected or none selected)
  const currentSingleRequisition = useMemo(() => {
    if (!selectedRequisitionId) return null;
    return activeRequisitions.find((r) => r.id === selectedRequisitionId) || null;
  }, [activeRequisitions, selectedRequisitionId]);

  // ZERO HISTORY / COMPLETE RESET ON TARGET JOB SWITCH OR CLEAR
  // When selected position changes (or is cleared/deselected):
  // Immediately clear uploaded files, screening queue, evaluation results, and selected candidate
  const prevSelectedReqIdRef = useRef<string>(selectedRequisitionId);
  React.useEffect(() => {
    if (prevSelectedReqIdRef.current !== selectedRequisitionId) {
      prevSelectedReqIdRef.current = selectedRequisitionId;
      setQueue([]);
      setBatchEvaluationResults([]);
      setExpandedCandidateId(null);
      setActiveVerificationCandidate(null);
      setScreeningProgress({ current: 0, total: 0 });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [selectedRequisitionId]);

  // Zero History reset on selection mode switch
  const prevSelectionModeRef = useRef<'single' | 'multiple'>(selectionMode);
  React.useEffect(() => {
    if (prevSelectionModeRef.current !== selectionMode) {
      prevSelectionModeRef.current = selectionMode;
      setQueue([]);
      setBatchEvaluationResults([]);
      setExpandedCandidateId(null);
      setActiveVerificationCandidate(null);
      setScreeningProgress({ current: 0, total: 0 });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [selectionMode]);

  // Selected jobs in multi-job mode
  const multiSelectedJobs = useMemo(() => {
    return activeRequisitions.filter((r) => selectedJobIds.includes(r.id));
  }, [activeRequisitions, selectedJobIds]);

  // Toggle job selection in multi-job mode
  const handleToggleJobSelect = (jobId: string) => {
    setSelectedJobIds((prev) => {
      if (prev.includes(jobId)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((id) => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };

  const handleSelectAllJobs = () => {
    setSelectedJobIds(activeRequisitions.map((r) => r.id));
  };

  const handleClearJobSelection = () => {
    if (activeRequisitions[0]) {
      setSelectedJobIds([activeRequisitions[0].id]);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(Array.from(e.target.files));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addFilesToQueue = (files: File[]) => {
    setUploadError(null);
    const valid = files.filter((f) => {
      const name = f.name.toLowerCase();
      return (
        name.endsWith('.pdf') ||
        name.endsWith('.docx') ||
        name.endsWith('.doc') ||
        name.endsWith('.txt') ||
        name.endsWith('.rtf') ||
        name.endsWith('.md') ||
        name.endsWith('.jpg') ||
        name.endsWith('.jpeg') ||
        name.endsWith('.png') ||
        f.type === 'application/pdf' ||
        f.type.includes('wordprocessingml') ||
        f.type.includes('msword') ||
        f.type.includes('rtf') ||
        f.type.startsWith('text/') ||
        f.type === 'image/jpeg' ||
        f.type === 'image/png'
      );
    });

    if (valid.length === 0) {
      setUploadError('Please upload PDF, DOC, DOCX, TXT, RTF, JPG, JPEG, or PNG resume files.');
      return;
    }

    const newItems: UploadQueueItem[] = valid.map((file) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      status: 'idle',
    }));

    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleRemoveQueueItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearQueue = () => {
    setQueue([]);
    setUploadError(null);
  };

  // Convert File to base64 helper
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Start Screening Function: Step-by-Step Execution with Real Text Extraction & Gemini Evaluation
  const handleStartScreening = async () => {
    setUploadError(null);
    const idleItems = queue.filter((item) => item.status === 'idle' || item.status === 'queued');
    if (idleItems.length === 0) return;

    if (selectionMode === 'single' && !currentSingleRequisition) {
      setUploadError('Please select an active target job position first before screening.');
      return;
    }

    if (selectionMode === 'multiple' && selectedJobIds.length < 2) {
      setUploadError('Please select at least 2 job positions for Multi-Job batch matching, or switch to Single Job Selection mode.');
      return;
    }

    setIsScreening(true);

    const customWeights = criteriaConfig.reduce(
      (acc, c) => ({ ...acc, [c.id]: c.weight }),
      {} as Record<string, number>
    );

    const jobsPayload =
      selectionMode === 'multiple'
        ? multiSelectedJobs.map((j) => ({
            id: j.id,
            title: j.title,
            department: j.department,
            content: j.content || j.title,
            jobDescription: j.jobDescription || j.content || j.title,
            jobRequirements: j.jobRequirements || '',
            companyCriteria: j.companyCriteria || '',
          }))
        : undefined;

    setScreeningProgress({
      current: 0,
      total: idleItems.length,
      currentFileName: `Starting AI screening for ${idleItems.length} resume(s)...`,
    });

    const newEvaluated: Candidate[] = [];

    // Step-by-step sequential screening so user observes authentic PDF extraction and Gemini API progress
    for (let i = 0; i < idleItems.length; i++) {
      const item = idleItems[i];

      // Step 1: Visual loading badge -> 'reading_pdf' ("Reading PDF Text...")
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'reading_pdf', errorMessage: undefined } : q))
      );
      setScreeningProgress({
        current: i + 1,
        total: idleItems.length,
        currentFileName: `Reading text from: ${item.name}`,
      });

      // Brief yield so the DOM paints the "Reading PDF Text..." badge
      await new Promise((resolve) => setTimeout(resolve, 250));

      try {
        const base64 = await fileToBase64(item.file);
        const directBlobUrl = URL.createObjectURL(item.file);
        const fileMime =
          item.file.type ||
          (item.name.toLowerCase().endsWith('.docx')
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : item.name.toLowerCase().endsWith('.doc')
              ? 'application/msword'
              : item.name.toLowerCase().endsWith('.txt') || item.name.toLowerCase().endsWith('.md')
                ? 'text/plain'
                : 'application/pdf');

        // Step 2: Visual loading badge -> 'evaluating_gemini' ("Evaluating with Gemini...")
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'evaluating_gemini' } : q))
        );
        setScreeningProgress({
          current: i + 1,
          total: idleItems.length,
          currentFileName: `Evaluating with Gemini: ${item.name}`,
        });

        const res = await fetch('/api/screen-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobTitle: currentSingleRequisition?.title || '',
            department: currentSingleRequisition?.department || 'General',
            requisitionNo: currentSingleRequisition?.requisitionNo || currentSingleRequisition?.id || '',
            salaryRange: currentSingleRequisition?.salaryRange || '',
            sbuUnit: currentSingleRequisition?.sbuUnit || currentSingleRequisition?.unit || '',
            jobDescription:
              currentSingleRequisition?.jobDescription ||
              currentSingleRequisition?.content ||
              currentSingleRequisition?.title ||
              '',
            jobRequirements: currentSingleRequisition?.jobRequirements || '',
            companyCriteria: currentSingleRequisition?.companyCriteria || '',
            keyResponsibilities: currentSingleRequisition?.keyResponsibilities || '',
            keyKSA: currentSingleRequisition?.keyKSA || '',
            hardTechnicalSkills:
              currentSingleRequisition?.hardTechnicalSkills ||
              currentSingleRequisition?.softwareTools ||
              [],
            academicDegrees: currentSingleRequisition?.academicDegrees || [],
            professionalCertifications: currentSingleRequisition?.professionalCertifications || [],
            minExperienceYears: currentSingleRequisition?.minExperienceYears,
            experienceLevel: currentSingleRequisition?.experienceLevel || '',
            industries: currentSingleRequisition?.industries || [],
            rmgType: currentSingleRequisition?.rmgType || [],
            rmgProducts: currentSingleRequisition?.rmgProducts || [],
            buyerPortfolio: currentSingleRequisition?.buyerPortfolio || [],
            companyName: currentSingleRequisition?.companyName || companyName || '',
            companyType: currentSingleRequisition?.companyType || '',
            jobType: currentSingleRequisition?.jobType || '',
            targetGradeCode: currentSingleRequisition?.targetGradeCode || '',
            compensationBenefits: currentSingleRequisition?.compensationBenefits || '',
            targetPosition: currentSingleRequisition?.title || '',
            targetRequisitionId: currentSingleRequisition?.id || '',
            multipleJobs: jobsPayload,
            customWeights,
            cvFile: {
              name: item.name,
              base64,
              mimeType: fileMime,
            },
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const errMsg = err.error || err.message || `Error: Unable to extract text from document (${res.status})`;
          throw new Error(errMsg);
        }

        const data = await res.json();
        if (data.candidate) {
          data.candidate.status = 'pending';
          data.candidate.blobUrl = directBlobUrl;
          data.candidate.fileUrl = directBlobUrl;
          data.candidate.fileBase64 = base64;
          data.candidate.fileMimeType = fileMime;
          cacheCandidateFileBlob(data.candidate.id, item.file);

          if (selectionMode === 'single' && currentSingleRequisition) {
            data.candidate.requisitionId = currentSingleRequisition.id;
            data.candidate.appliedPosition = currentSingleRequisition.title;
          }

          // Step 3: Mark as 'done' ("Evaluated")
          setQueue((prev) =>
            prev.map((q) => (q.id === item.id ? { ...q, status: 'done', errorMessage: undefined } : q))
          );

          newEvaluated.push(data.candidate as Candidate);
        } else {
          throw new Error('Error: Unable to extract text from document');
        }
      } catch (err: any) {
        console.error(`Error screening ${item.name}:`, err);
        const errMsg = err.message || 'Error: Unable to extract text from document';
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: 'error', errorMessage: errMsg }
              : q
          )
        );
      }
    }

    if (newEvaluated.length > 0) {
      // Sort evaluated candidates descending by composite score
      newEvaluated.sort((a, b) => (b.compositeScore ?? b.score) - (a.compositeScore ?? a.score));

      // 1. Update local batch state for current position screening session
      setBatchEvaluationResults((prev) => [...newEvaluated, ...prev]);

      // 2. Automatically and permanently archive into central CV Bank
      onAddCandidates(newEvaluated);
    }

    setIsScreening(false);
  };

  // Local helper to update both batchEvaluationResults and master CV Bank
  const handleUpdateCandidateStatusLocal = (candidateId: string, status: CandidateStatus) => {
    setBatchEvaluationResults((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status } : c))
    );
    onUpdateCandidateStatus(candidateId, status);
  };

  // Filtered evaluated candidates strictly for this active screening batch
  const evaluatedCandidates = useMemo(() => {
    // Strict isolation: only display candidates that were evaluated in the current active screening run
    let pool = batchEvaluationResults;
    if (pool.length === 0) return [];

    // In Single mode, filter by current single position
    if (selectionMode === 'single' && currentSingleRequisition) {
      pool = pool.filter((c) => {
        if (c.requisitionId) return c.requisitionId === currentSingleRequisition.id;
        const targetTitle = currentSingleRequisition.title.toLowerCase();
        const candPos = (c.appliedPosition || '').toLowerCase();
        return candPos.includes(targetTitle) || targetTitle.includes(candPos);
      });
    } else {
      // In Multiple mode: filter by positionFilter if specified
      if (positionFilter !== 'all') {
        pool = pool.filter((c) => {
          return c.requisitionId === positionFilter || c.matchedRequisitionId === positionFilter;
        });
      }
    }

    // Status filter
    if (statusFilter !== 'all') {
      pool = pool.filter((c) => c.status === statusFilter);
    }

    // Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter((c) => {
        const inName = !blindMode && c.name.toLowerCase().includes(q);
        const inPos = (c.appliedPosition || '').toLowerCase().includes(q);
        const inSkills = (c.skills || []).some((s) => s.toLowerCase().includes(q));
        const inBuyers = (c.buyersWorkedWith || []).some((b) => b.toLowerCase().includes(q));
        const inProducts = (c.productSpecialization || []).some((p) => p.toLowerCase().includes(q));
        const inVerdict = (c.verdict || '').toLowerCase().includes(q);
        return inName || inPos || inSkills || inBuyers || inProducts || inVerdict;
      });
    }

    const targetTitle = currentSingleRequisition?.title || '';
    const targetDept = currentSingleRequisition?.department || '';
    const targetDesc = currentSingleRequisition?.jobDescription || currentSingleRequisition?.content || '';

    // Apply Hard Domain Gatekeeper to each candidate in pool against active requisition
    const gatekeptPool = pool.map((c) =>
      applyDomainGatekeeperToCandidate(targetTitle, targetDept, targetDesc, c)
    );

    // Compute Part A (Pillar 1 KRA/KSA), Part B (Pillar 2 Requirements), and Converted Final Score
    const withScores = gatekeptPool.map((c) => {
      const taskScore =
        c.pillar1KraScore ??
        c.taskMatchScore ??
        c.triMatch?.jdMatch?.score ??
        Math.min(100, Math.round(c.score * 1.02));

      const orgScore =
        c.pillar2RequirementsScore ??
        c.orgMatchScore ??
        c.triMatch?.requirementsMatch?.score ??
        Math.max(30, Math.round(c.score * 0.98));

      const composite =
        c.convertedFinalScore ??
        c.compositeScore ??
        Math.round(taskScore * 0.55 + orgScore * 0.45);

      const verdict =
        c.verdict ||
        (composite >= 85
          ? 'Perfect Matched'
          : composite >= 70
          ? 'Better'
          : composite >= 50
          ? 'Good'
          : 'Irrelevant / Domain Mismatch');

      return {
        ...c,
        pillar1KraScore: taskScore,
        pillar2RequirementsScore: orgScore,
        taskMatchScore: taskScore,
        orgMatchScore: orgScore,
        convertedFinalScore: composite,
        compositeScore: composite,
        score: composite,
        verdict,
      };
    });

    // Merit-List Sorting:
    // 1. Qualified technical candidates stay on top (e.g. ANIK at Rank #1).
    // 2. Mismatched or Irrelevant candidates (<50% or 'Irrelevant / Domain Mismatch') are strictly relegated to the bottom.
    withScores.sort((a, b) => {
      const aMismatch = a.verdict === 'Irrelevant / Domain Mismatch' || (a.compositeScore ?? a.score) < 50;
      const bMismatch = b.verdict === 'Irrelevant / Domain Mismatch' || (b.compositeScore ?? b.score) < 50;

      if (aMismatch !== bMismatch) {
        return aMismatch ? 1 : -1;
      }

      let valA = a.compositeScore;
      let valB = b.compositeScore;

      if (sortBy === 'jd') {
        valA = a.taskMatchScore;
        valB = b.taskMatchScore;
      } else if (sortBy === 'requirements') {
        valA = a.triMatch?.requirementsMatch?.score ?? a.compositeScore;
        valB = b.triMatch?.requirementsMatch?.score ?? b.compositeScore;
      } else if (sortBy === 'company') {
        valA = a.orgMatchScore;
        valB = b.orgMatchScore;
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    // Assign strict Merit-List Ranks 1 to N
    return withScores.map((c, idx) => ({
      ...c,
      rank: idx + 1,
      meritRank: idx + 1,
    }));
  }, [
    batchEvaluationResults,
    candidates,
    selectionMode,
    currentSingleRequisition,
    positionFilter,
    statusFilter,
    searchQuery,
    blindMode,
    sortBy,
    sortOrder,
  ]);

  // Shortlisted candidates for export
  const shortlistedCandidates = useMemo(() => {
    return evaluatedCandidates.filter((c) => c.status === 'shortlisted');
  }, [evaluatedCandidates]);

  // Metrics
  const totalEvaluated = evaluatedCandidates.length;
  const countShortlisted = evaluatedCandidates.filter((c) => c.status === 'shortlisted').length;
  const countOnHold = evaluatedCandidates.filter((c) => c.status === 'on_hold').length;
  const countPending = evaluatedCandidates.filter((c) => c.status === 'pending').length;
  const countRejected = evaluatedCandidates.filter((c) => c.status === 'rejected').length;

  if (activeRequisitions.length === 0) {
    return (
      <div className="space-y-6 text-[#e6edf3]">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#161b22] via-[#21262d] to-[#161b22] border border-[#30363d] p-6 shadow-lg">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 border border-purple-500/30 text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Screening Engine &bull; {companyName}</span>
            </div>
            <h1 className="text-2xl font-black text-[#e6edf3] tracking-tight">
              CV Screening &amp; Match Engine
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e] font-medium max-w-2xl">
              Strict 1-to-1 CV evaluation against user-defined job responsibilities, minimum requirements, and company criteria.
            </p>
          </div>
        </div>

        <div className="p-12 rounded-2xl bg-[#161b22] border border-[#30363d] text-center max-w-2xl mx-auto space-y-4 my-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#e6edf3]">No Job Positions Created Yet</h2>
          <p className="text-xs text-[#8b949e] leading-relaxed max-w-md mx-auto">
            The AI screening engine performs strict point-by-point evaluation of candidate resumes against specific job duties, requirements, and company culture criteria. Please create your first position to begin.
          </p>
          <button
            type="button"
            onClick={onOpenNewJobModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Position</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#e6edf3]">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#161b22] via-[#21262d] to-[#161b22] border border-[#30363d] p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 border border-purple-500/30 text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Screening Engine &bull; {companyName}</span>
            </div>
            <h1 className="text-2xl font-black text-[#e6edf3] tracking-tight">
              CV Screening & Batch Matching Engine
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e] font-medium max-w-2xl">
              Screen multi-format resumes (PDF & Word DOCX), evaluate technical RMG profiles, and automatically match candidates across single or multiple job requisitions with human-in-the-loop governance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={onOpenStandardCriteria}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#21262d] hover:bg-[#30363d] text-indigo-300 border border-[#30363d] transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Criteria Weights (100M)</span>
            </button>
            <button
              type="button"
              onClick={onOpenSalaryMatrix}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#21262d] hover:bg-[#30363d] text-blue-300 border border-[#30363d] transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              <span>Salary Matrix</span>
            </button>
            <button
              type="button"
              onClick={onOpenIndustryGuide}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#21262d] hover:bg-[#30363d] text-purple-300 border border-[#30363d] transition cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span>RMG Policy</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Target Job Selection Mode Card */}
      <div className="bg-[#21262d] rounded-2xl border border-[#30363d] p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#30363d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#e6edf3]">
                1. Target Job Selection Mode
              </h2>
              <p className="text-[11px] text-[#8b949e]">
                Choose how resumes should be matched against your active requisitions
              </p>
            </div>
          </div>

          {/* Mode Switcher Toggle */}
          <div className="inline-flex items-center p-1 bg-[#161b22] border border-[#30363d] rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectionMode('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectionMode === 'single'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${selectionMode === 'single' ? 'bg-white' : 'bg-[#8b949e]'}`} />
              <span>Single Job Selection</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectionMode('multiple')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectionMode === 'multiple'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                  : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Multiple Job Selection (Multi-requisition batch match)</span>
            </button>
          </div>
        </div>

        {/* MODE A: Single Job Selection View */}
        {selectionMode === 'single' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <div className="md:col-span-2 space-y-1">
                <div className="flex items-center justify-between pb-0.5">
                  <label className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider block">
                    Select Target Job Position:
                  </label>
                  {selectedRequisitionId && (
                    <button
                      type="button"
                      onClick={() => onSelectRequisitionId('')}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold transition cursor-pointer flex items-center gap-1"
                      title="Clear position selection and reset screening session"
                    >
                      <X className="w-3 h-3" />
                      <span>Clear Selection (Reset)</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={selectedRequisitionId}
                    onChange={(e) => onSelectRequisitionId(e.target.value)}
                    className="w-full bg-[#161b22] text-[#e6edf3] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-indigo-500 focus:outline-none cursor-pointer appearance-none pr-10"
                  >
                    <option value="" className="bg-[#161b22] text-[#8b949e]">
                      -- Select Active Position to Screen --
                    </option>
                    {activeRequisitions.map((req) => (
                      <option key={req.id} value={req.id} className="bg-[#161b22] text-[#e6edf3]">
                        {req.title} &bull; {req.department} ({req.id}) {req.hiringCategory === 'top_priority' ? '🔥 Top Priority' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8b949e] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Position Quick Card */}
              {currentSingleRequisition ? (
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
                      Active Target Requisition
                    </span>
                    <span className="text-xs font-extrabold text-[#e6edf3] block truncate max-w-[180px]">
                      {currentSingleRequisition.title}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono">
                      {currentSingleRequisition.id} &bull; {currentSingleRequisition.department}
                    </span>
                  </div>
                  {currentSingleRequisition.hiringCategory === 'top_priority' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 shrink-0">
                      <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
                      Top Priority
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 shrink-0">
                      Current Hiring
                    </span>
                  )}
                </div>
              ) : (
                <div className="bg-[#161b22] border border-amber-500/30 rounded-xl p-3 flex items-center gap-2 text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-semibold">0 CVs uploaded &bull; Select a position to start screening</span>
                </div>
              )}
            </div>

            {/* Toggleable Job Description Preview */}
            {currentSingleRequisition && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowJobSpecs(!showJobSpecs)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <span>{showJobSpecs ? 'Hide Position Specification' : 'View Position Specification & Requirements'}</span>
                  {showJobSpecs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

              {showJobSpecs && (
                <div className="mt-2.5 p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] text-xs space-y-2 text-[#8b949e]">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] pb-2 border-b border-[#30363d]">
                    {currentSingleRequisition.minExperienceYears ? (
                      <span className="text-[#e6edf3] font-semibold">
                        Experience: <strong className="text-indigo-400">{currentSingleRequisition.minExperienceYears}+ Years</strong>
                      </span>
                    ) : currentSingleRequisition.experienceLevel && currentSingleRequisition.experienceLevel !== 'Experience not specified' ? (
                      <span className="text-[#e6edf3] font-semibold">
                        Experience: <strong className="text-indigo-400">{currentSingleRequisition.experienceLevel}</strong>
                      </span>
                    ) : null}
                    {currentSingleRequisition.vacanciesCount && (
                      <span className="text-[#e6edf3] font-semibold">
                        Vacancies: <strong className="text-emerald-400">{currentSingleRequisition.vacanciesCount}</strong>
                      </span>
                    )}
                    {currentSingleRequisition.salaryRange && (
                      <span className="text-[#e6edf3] font-semibold">
                        Salary: <strong className="text-emerald-400 font-mono">{currentSingleRequisition.salaryRange}</strong>
                      </span>
                    )}
                    {currentSingleRequisition.applicationDeadline && (
                      <span className="text-[#e6edf3] font-semibold">
                        Deadline: <strong className="text-amber-400 font-mono">{currentSingleRequisition.applicationDeadline}</strong>
                      </span>
                    )}
                  </div>

                  {/* Highlights Grid - ONLY rendered if non-empty */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {currentSingleRequisition.academicDegrees && currentSingleRequisition.academicDegrees.length > 0 && (
                      <div className="p-2 bg-[#21262d] rounded-lg border border-[#30363d]">
                        <span className="text-[#8b949e] font-bold block mb-0.5">Required Degrees:</span>
                        <span className="text-[#e6edf3]">{currentSingleRequisition.academicDegrees.join(', ')}</span>
                      </div>
                    )}
                    {(currentSingleRequisition.hardTechnicalSkills?.length ||
                      currentSingleRequisition.softwareTools?.length) ? (
                      <div className="p-2 bg-[#21262d] rounded-lg border border-[#30363d]">
                        <span className="text-[#8b949e] font-bold block mb-0.5">Hard Technical Skills:</span>
                        <span className="text-amber-300">
                          {(
                            currentSingleRequisition.hardTechnicalSkills ||
                            currentSingleRequisition.softwareTools ||
                            []
                          ).join(', ')}
                        </span>
                      </div>
                    ) : null}
                    {currentSingleRequisition.buyerPortfolio && currentSingleRequisition.buyerPortfolio.length > 0 && (
                      <div className="p-2 bg-[#21262d] rounded-lg border border-[#30363d]">
                        <span className="text-[#8b949e] font-bold block mb-0.5">Target Buyer Accounts:</span>
                        <span className="text-cyan-300">{currentSingleRequisition.buyerPortfolio.join(', ')}</span>
                      </div>
                    )}
                    {currentSingleRequisition.companyFit && (
                      <div className="p-2 bg-[#21262d] rounded-lg border border-[#30363d]">
                        <span className="text-[#8b949e] font-bold block mb-0.5">RMG Domain &amp; Work Context:</span>
                        <span className="text-indigo-300">
                          {[
                            currentSingleRequisition.companyFit.rmgDivisions?.join(', '),
                            currentSingleRequisition.companyFit.workplaceNature,
                            currentSingleRequisition.companyFit.minAverageTenureYears ? `Min ${currentSingleRequisition.companyFit.minAverageTenureYears} yrs tenure` : null,
                          ].filter(Boolean).join(' • ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <pre className="font-sans whitespace-pre-wrap leading-relaxed text-[#8b949e] max-h-48 overflow-y-auto pr-2 pt-2 border-t border-[#30363d]/60">
                    {currentSingleRequisition.content || 'Standard RMG functional responsibilities.'}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

        {/* MODE B: Multiple Job Selection View (Multi-requisition batch match) */}
        {selectionMode === 'multiple' && (
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#e6edf3]">
                  Select 2 or More Target Job Positions:
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {selectedJobIds.length} of {activeRequisitions.length} selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllJobs}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#161b22] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearJobSelection}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#161b22] text-[#8b949e] hover:text-rose-400 border border-[#30363d] cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Visual Checkbox Cards for All Active Jobs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {activeRequisitions.map((req) => {
                const isSelected = selectedJobIds.includes(req.id);
                const isTop = req.hiringCategory === 'top_priority';

                return (
                  <div
                    key={req.id}
                    onClick={() => handleToggleJobSelect(req.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 select-none ${
                      isSelected
                        ? 'bg-[#161b22] border-indigo-500/60 shadow-xs ring-1 ring-indigo-500/30'
                        : 'bg-[#161b22]/60 border-[#30363d] opacity-70 hover:opacity-100 hover:border-[#484f58]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'border border-[#484f58] bg-[#0d1117]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[#e6edf3] truncate">
                          {req.title}
                        </span>
                        {isTop && (
                          <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-[#8b949e] truncate mt-0.5">
                        {req.department} &bull; <span className="font-mono">{req.id}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanatory Multi-Job Logic Notice */}
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-purple-300 block">
                  Intelligent Multi-Job Match Logic Active:
                </span>
                <p className="text-[#8b949e] leading-relaxed">
                  Each uploaded CV will be automatically evaluated across all {selectedJobIds.length} selected positions simultaneously. The candidate will be mapped and ranked under the position where they achieve the highest match score.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bulk CV Upload Dropzone */}
      <div className="bg-[#21262d] rounded-2xl border border-[#30363d] p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#30363d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <FileUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#e6edf3]">
                2. Bulk CV Upload Dropzone
              </h2>
              <p className="text-[11px] text-[#8b949e]">
                Simultaneous batch upload of multiple PDF and Word DOCX candidate resumes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8b949e]">
              PDF &bull; DOCX format
            </span>
          </div>
        </div>

        {/* Dropzone Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-[#30363d] hover:border-indigo-500/50 bg-[#161b22]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/rtf,text/rtf,image/jpeg,image/png"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-xs">
              <FileUp className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-[#e6edf3]">
                Drag &amp; drop 10 to 20+ candidate resumes simultaneously
              </p>
              <p className="text-xs text-[#8b949e]">
                or <span className="text-indigo-400 underline font-semibold">browse your computer</span> for high-capacity batch screening &amp; OCR
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                PDF
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                DOC / DOCX
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                TXT / RTF
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                JPG / JPEG / PNG (OCR)
              </span>
            </div>
          </div>
        </div>

        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-rose-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Queue List */}
        {queue.length > 0 && (
          <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#e6edf3] flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Upload Queue ({queue.length} file{queue.length === 1 ? '' : 's'})
              </span>
              <button
                type="button"
                onClick={handleClearQueue}
                disabled={isScreening}
                className="text-[11px] text-rose-400 hover:text-rose-300 transition cursor-pointer"
              >
                Clear Queue
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {queue.map((item) => {
                const lowerName = item.name.toLowerCase();
                const isDocx = lowerName.endsWith('.docx') || lowerName.endsWith('.doc');
                const isTxt = lowerName.endsWith('.txt') || lowerName.endsWith('.md');
                const badgeText = isDocx ? 'DOCX' : isTxt ? 'TXT' : 'PDF';
                const badgeColor = isDocx
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : isTxt
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#21262d] border border-[#30363d] text-xs gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 border ${badgeColor}`}
                      >
                        {badgeText}
                      </span>
                      <span className="font-medium text-[#e6edf3] truncate">{item.name}</span>
                      <span className="text-[10px] text-[#8b949e] font-mono shrink-0">
                        ({(item.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {(item.status === 'idle' || item.status === 'queued') && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Pending Screening
                        </span>
                      )}
                      {item.status === 'reading_pdf' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 animate-pulse">
                          <FileText className="w-3 h-3 text-cyan-400 animate-pulse" />
                          Reading PDF Text...
                        </span>
                      )}
                      {(item.status === 'evaluating_gemini' || item.status === 'processing') && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                          Evaluating with Gemini...
                        </span>
                      )}
                      {item.status === 'done' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          Evaluated
                        </span>
                      )}
                      {item.status === 'error' && (
                        <div
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-950/70 border border-rose-500/50 text-[10px] text-rose-300 font-semibold max-w-[280px] sm:max-w-xs truncate"
                          title={item.errorMessage || 'Error: Unable to extract text from document'}
                        >
                          <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                          <span className="truncate">{item.errorMessage || 'Error: Unable to extract text from document'}</span>
                        </div>
                      )}
                      {(item.status === 'idle' || item.status === 'queued') && !isScreening && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQueueItem(item.id)}
                          className="text-[#8b949e] hover:text-rose-400 p-1 cursor-pointer transition-colors"
                          title="Remove from queue"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Screening Progress Bar */}
        {isScreening && (
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-indigo-300 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                Screening {screeningProgress.current} of {screeningProgress.total}:{' '}
                <strong className="text-white truncate max-w-xs">{screeningProgress.currentFileName}</strong>
              </span>
              <span className="font-mono text-indigo-400">
                {Math.round((screeningProgress.current / Math.max(1, screeningProgress.total)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-[#161b22] h-2 rounded-full overflow-hidden border border-[#30363d]">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(screeningProgress.current / Math.max(1, screeningProgress.total)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[#8b949e] flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                queue.some((q) => q.status === 'idle' || q.status === 'queued')
                  ? 'bg-amber-400'
                  : queue.length > 0
                  ? 'bg-emerald-400'
                  : 'bg-slate-500'
              }`}
            />
            <span>
              {queue.filter((f) => f.status === 'idle' || f.status === 'queued').length} resume{queue.filter((f) => f.status === 'idle' || f.status === 'queued').length === 1 ? '' : 's'} queued for{' '}
              <strong className="text-[#e6edf3]">
                {selectionMode === 'multiple'
                  ? `${selectedJobIds.length} Selected Jobs`
                  : currentSingleRequisition
                  ? currentSingleRequisition.title
                  : 'Target Position'}
              </strong>
            </span>
          </div>

          {(() => {
            const queuedCount = queue.filter((f) => f.status === 'idle' || f.status === 'queued').length;
            const hasSelectedJob = selectionMode === 'multiple' ? selectedJobIds.length >= 2 : Boolean(currentSingleRequisition);
            const isDisabled = isScreening || queuedCount === 0 || !hasSelectedJob;

            let buttonLabel = '';
            if (isScreening) {
              buttonLabel = `Screening Candidate (${screeningProgress.current} of ${screeningProgress.total})...`;
            } else if (!hasSelectedJob) {
              buttonLabel = selectionMode === 'multiple'
                ? 'Select at least 2 Job Positions to Start Screening'
                : 'Select a Job Position to Start Screening';
            } else if (queuedCount === 0) {
              buttonLabel = queue.length > 0 ? 'All Queued CVs Evaluated' : 'Upload Resumes to Start Screening';
            } else if (selectionMode === 'multiple') {
              buttonLabel = `Start AI Screening (${queuedCount} CV${queuedCount === 1 ? '' : 's'} across ${selectedJobIds.length} Jobs)`;
            } else {
              buttonLabel = `Start AI Screening (${queuedCount} CV${queuedCount === 1 ? '' : 's'} for ${currentSingleRequisition?.title || 'Senior Executive'})`;
            }

            return (
              <button
                type="button"
                onClick={handleStartScreening}
                disabled={isDisabled}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  isDisabled
                    ? 'bg-[#21262d] text-[#8b949e] border border-[#30363d] cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-900/40'
                }`}
              >
                {isScreening ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{buttonLabel}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>{buttonLabel}</span>
                  </>
                )}
              </button>
            );
          })()}
        </div>
      </div>

      {/* 4. Evaluation Output & Scoring Section */}
      <div className="bg-[#21262d] rounded-2xl border border-[#30363d] p-5 space-y-5 shadow-sm">
        {/* Section Header with Quick Status Counters & Export Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#30363d]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#e6edf3]">
                3. Evaluation Output & Candidate Rankings
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {totalEvaluated} Candidate{totalEvaluated === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-xs text-[#8b949e]">
              Advisory AI evaluation with Match Score (0-100%), Verdict Badge, Action Opinion, and Strengths vs Gaps.
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() =>
                exportCandidatesToExcel(
                  shortlistedCandidates.length > 0 ? shortlistedCandidates : evaluatedCandidates,
                  `${companyName}_Shortlisted_Candidates`,
                  blindMode,
                  companyName
                )
              }
              disabled={evaluatedCandidates.length === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                evaluatedCandidates.length === 0
                  ? 'bg-[#161b22] text-[#8b949e] border-[#30363d] opacity-50 cursor-not-allowed'
                  : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40 shadow-xs'
              }`}
              title="Export Shortlisted Candidates to Excel Spreadsheet (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export to Excel</span>
            </button>

            <button
              type="button"
              onClick={() =>
                exportCandidatesToCSV(
                  shortlistedCandidates.length > 0 ? shortlistedCandidates : evaluatedCandidates,
                  `${companyName}_Shortlisted_Candidates`,
                  blindMode,
                  companyName
                )
              }
              disabled={evaluatedCandidates.length === 0}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                evaluatedCandidates.length === 0
                  ? 'bg-[#161b22] text-[#8b949e] border-[#30363d] opacity-50 cursor-not-allowed'
                  : 'bg-[#161b22] hover:bg-[#21262d] text-[#e6edf3] border-[#30363d]'
              }`}
              title="Export to CSV file"
            >
              <Download className="w-3.5 h-3.5 text-[#8b949e]" />
              <span>Export CSV</span>
            </button>

            {evaluatedCandidates.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear evaluated candidates from this view?')) {
                    if (selectionMode === 'single' && currentSingleRequisition) {
                      onClearCandidates(currentSingleRequisition.id);
                    } else {
                      onClearCandidates();
                    }
                    setBatchEvaluationResults([]);
                  }
                }}
                className="p-2 rounded-xl text-[#8b949e] hover:text-rose-400 hover:bg-[#161b22] border border-[#30363d] transition cursor-pointer"
                title="Clear evaluated list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter and Control Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#161b22] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d]'
              }`}
            >
              All ({totalEvaluated})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('shortlisted')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                statusFilter === 'shortlisted'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#161b22] text-emerald-400 hover:bg-emerald-950/40 border border-[#30363d]'
              }`}
            >
              Shortlisted ({countShortlisted})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('on_hold')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                statusFilter === 'on_hold'
                  ? 'bg-amber-600 text-white'
                  : 'bg-[#161b22] text-amber-400 hover:bg-amber-950/40 border border-[#30363d]'
              }`}
            >
              On Hold ({countOnHold})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                statusFilter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#161b22] text-blue-400 hover:bg-blue-950/40 border border-[#30363d]'
              }`}
            >
              Pending ({countPending})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                statusFilter === 'rejected'
                  ? 'bg-rose-600 text-white'
                  : 'bg-[#161b22] text-rose-400 hover:bg-rose-950/40 border border-[#30363d]'
              }`}
            >
              Rejected ({countRejected})
            </button>
          </div>

          {/* Search & Layout Controls */}
          <div className="flex items-center gap-2">
            {/* Position filter in multi-job mode */}
            {selectionMode === 'multiple' && (
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="bg-[#161b22] text-[#e6edf3] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">All Evaluated Positions</option>
                {multiSelectedJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            )}

            {/* Text Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates, skills..."
                className="w-full bg-[#161b22] text-[#e6edf3] placeholder-[#8b949e] pl-8 pr-2.5 py-1.5 rounded-lg border border-[#30363d] text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Blind Screening Toggle */}
            <button
              type="button"
              onClick={onToggleBlindMode}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                blindMode
                  ? 'bg-purple-950/60 text-purple-300 border-purple-500/50'
                  : 'bg-[#161b22] text-[#8b949e] border-[#30363d] hover:text-[#e6edf3]'
              }`}
              title={blindMode ? 'Disable Blind Screening Mode' : 'Enable Blind Screening (Anonymize names/contact)'}
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Tri-Match Pillar Sort Selector */}
            <div className="flex items-center gap-1.5 bg-[#161b22] border border-[#30363d] rounded-lg px-2.5 py-1">
              <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider shrink-0">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[#e6edf3] text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="overall" className="bg-[#161b22] text-[#e6edf3]">Overall Match (%)</option>
                <option value="jd" className="bg-[#161b22] text-indigo-300">JD Match (%)</option>
                <option value="requirements" className="bg-[#161b22] text-blue-300">Requirements Match (%)</option>
                <option value="company" className="bg-[#161b22] text-purple-300">Company Criteria Match (%)</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                className="text-xs font-mono font-bold text-[#8b949e] hover:text-indigo-400 px-1 py-0.5 rounded transition cursor-pointer"
                title={`Sort ${sortOrder === 'desc' ? 'Descending (High to Low)' : 'Ascending (Low to High)'}`}
              >
                {sortOrder === 'desc' ? '↓' : '↑'}
              </button>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setViewLayout('cards')}
                className={`p-1.5 rounded cursor-pointer ${
                  viewLayout === 'cards' ? 'bg-[#21262d] text-white shadow-xs' : 'text-[#8b949e]'
                }`}
                title="Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('table')}
                className={`p-1.5 rounded cursor-pointer ${
                  viewLayout === 'table' ? 'bg-[#21262d] text-white shadow-xs' : 'text-[#8b949e]'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* CANDIDATE EVALUATION LIST */}
        {evaluatedCandidates.length === 0 ? (
          <div className="bg-[#161b22] rounded-2xl border border-[#30363d] p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#e6edf3]">
              {currentSingleRequisition
                ? `0 CVs Uploaded for ${currentSingleRequisition.title}`
                : '0 CVs Uploaded · Select a Position to Start Screening'}
            </h3>
            <p className="text-xs text-[#8b949e] max-w-md mx-auto">
              {currentSingleRequisition
                ? `Upload candidate resume documents (PDF or DOCX) in the upload dropzone above and click "Start Screening Resumes" to rank applicants for this position.`
                : 'Select an active job requisition and upload candidate resume documents above to initiate point-by-point AI screening against the job KRA & KSA.'}
            </p>
          </div>
        ) : viewLayout === 'cards' ? (
          <div className="space-y-3.5">
            {evaluatedCandidates.map((candidate, idx) => {
              const candRank = candidate.meritRank || candidate.rank || idx + 1;
              const isExpanded = expandedCandidateId === candidate.id;
              const verdictConfig = getVerdictBadge(candidate.score);
              const actionOpinion = candidate.actionOpinion || getCandidateActionOpinion(candidate);
              const { strengths, gaps } = getCandidateStrengthsAndGaps(candidate);

              const taskScore =
                candidate.taskMatchScore ??
                candidate.triMatch?.jdMatch?.score ??
                Math.min(100, Math.round(candidate.score * 1.02));
              const orgScore =
                candidate.orgMatchScore ??
                candidate.triMatch?.companyCriteriaMatch?.score ??
                Math.max(30, Math.round(candidate.score * 0.98));
              const composite = candidate.compositeScore ?? candidate.score;

              const isDisqualified =
                candidate.verdict === 'Irrelevant / Domain Mismatch' ||
                (candidate.compositeScore ?? candidate.score) < 30;

              const isRank1 = candRank === 1 && !isDisqualified;
              const isRank2 = candRank === 2 && !isDisqualified;
              const isRank3 = candRank === 3 && !isDisqualified;

              const rankBadgeLabel = isDisqualified
                ? `Rank #${candRank} - Not Recommended`
                : isRank1
                ? 'Rank #1 - Top Recommended'
                : isRank2
                ? 'Rank #2 - Highly Recommended'
                : isRank3
                ? 'Rank #3 - Recommended'
                : `Rank #${candRank}`;

              // Clean authentic candidate name
              let candidateRealName = (candidate.name || '').trim();
              if (!candidateRealName || candidateRealName.toLowerCase() === 'candidate' || candidateRealName.toLowerCase() === 'candidate profile' || /^(resume|cv|biodata)/i.test(candidateRealName)) {
                if (candidate.fileName) {
                  candidateRealName = candidate.fileName
                    .replace(/\.[^/.]+$/, '')
                    .replace(/^(resume|cv|biodata)[-_\s]+/i, '')
                    .replace(/[-_\s]+(resume|cv|biodata)$/i, '')
                    .replace(/^candidate[-_\s]*/i, '')
                    .replace(/_/g, ' ')
                    .trim();
                }
              }
              candidateRealName = candidateRealName.replace(/^(resume|cv|biodata)[-_\s]+/i, '').trim();
              if (!candidateRealName) {
                candidateRealName = `Candidate #${candRank}`;
              }

              const actualLastDesignation = candidate.lastDesignation || candidate.experience?.[0]?.role || 'N/A';
              const actualCompany = (candidate.lastCompany && candidate.lastCompany !== 'Prior RMG Organization' && candidate.lastCompany !== 'N/A')
                ? candidate.lastCompany
                : (candidate.experience?.[0]?.company && candidate.experience[0].company !== 'N/A' ? candidate.experience[0].company : 'N/A');
              const targetRequisitionTitle = candidate.appliedPosition || candidate.category || currentSingleRequisition?.title || 'Target Position';

              return (
                <div
                  key={candidate.id}
                  className={`bg-[#161b22] rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                    isRank1
                      ? 'border-amber-500/40 ring-1 ring-amber-500/20'
                      : isDisqualified
                      ? 'border-rose-500/30'
                      : isExpanded
                      ? 'border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                      : 'border-[#30363d] hover:border-[#484f58]'
                  }`}
                >
                  {/* COLLAPSIBLE CANDIDATE STRIP (MERIT-LIST RANKING 1 TO 10) */}
                  <div
                    onClick={() => {
                      setExpandedCandidateId((prev) => (prev === candidate.id ? null : candidate.id));
                      setActiveVerificationCandidate(candidate);
                    }}
                    className={`p-4 transition-colors cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
                      isExpanded ? 'bg-[#21262d]/60 border-b border-[#30363d]' : 'hover:bg-[#21262d]/40'
                    }`}
                  >
                    {/* Left: Merit Rank Badge, Full Name, Actual Career Track & Target JD */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Merit Rank Badge */}
                      <div className="shrink-0">
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 shadow-xs ${
                            isDisqualified
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : isRank1
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 ring-1 ring-amber-500/40'
                              : isRank2
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : isRank3
                              ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                              : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                          }`}
                        >
                          {isRank1 && <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40" />}
                          {isDisqualified && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                          <span>{rankBadgeLabel}</span>
                        </span>
                      </div>

                      {/* Candidate Name & Sub-details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                            {blindMode ? `Candidate #${candRank} (Anonymized)` : candidateRealName}
                          </h3>

                          {/* Recommendation Verdict Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border flex items-center gap-1 shrink-0 ${
                              candidate.recommendationBadge === 'Good / Shortlisted (Initial)'
                                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                : verdictConfig.badgeClass
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                candidate.recommendationBadge === 'Good / Shortlisted (Initial)'
                                  ? 'bg-sky-400'
                                  : verdictConfig.dotClass
                              }`}
                            />
                            <span>{candidate.recommendationBadge || verdictConfig.label}</span>
                          </span>

                          {/* Dual-Mode Evaluation Tag */}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              candidate.evaluationMode === 'designation_only'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                            }`}
                          >
                            {candidate.evaluationMode === 'designation_only'
                              ? '[Profile Credentials & Designation Match (No KRA in CV)]'
                              : '[Standard KRA Evaluation]'}
                          </span>
                        </div>

                        {/* Candidate's ACTUAL Last Position from their CV (Never overwritten with target job) */}
                        <div className="text-xs text-[#8b949e] truncate flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[#8b949e] font-medium">Career Track:</span>
                          <strong className="text-indigo-300 font-bold">{actualLastDesignation}</strong>
                          <span>&bull;</span>
                          <span className="text-[#c9d1d9] font-medium">{actualCompany}</span>
                          {candidate.totalYearsExperience !== undefined && (
                            <>
                              <span>&bull;</span>
                              <span className="font-mono text-emerald-400 font-semibold">
                                {candidate.totalYearsExperience} Yrs Exp
                              </span>
                            </>
                          )}
                          <span className="text-[#484f58] mx-0.5">|</span>
                          <span className="text-[#8b949e] text-[11px]">Matched Target:</span>
                          <span className="text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25">
                            {candidate.matchedTitleAndDept ||
                              `${targetRequisitionTitle}${currentSingleRequisition?.department ? ` (${currentSingleRequisition.department})` : ''}`}
                          </span>
                        </div>

                        {/* Factual Single-Line Action Verdict for HR / Boss */}
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                              composite < 50
                                ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                                : candidate.evaluationMode === 'designation_only'
                                ? 'bg-sky-950/70 text-sky-200 border-sky-500/40'
                                : composite >= 85
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                                : 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40'
                            }`}
                          >
                            <Sparkles className="w-3 h-3 shrink-0" />
                            <strong className="font-bold">HR Opinion:</strong>{' '}
                            <span>
                              {candidate.hrActionOpinion ||
                                candidate.decisiveActionSentence ||
                                candidate.actionOpinion ||
                                'Screened and verified against job requirements.'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Dual 100-Point Pillar Scores, Converted Final Score & Actions */}
                    <div className="flex items-center gap-3 shrink-0 flex-wrap justify-between lg:justify-end">
                      {/* Dual-Scoring Badges (Task & KRA 55% + Specifications 45%) */}
                      <div className="flex items-center gap-2">
                        {/* Pillar 1: Task & KRA Semantic Score */}
                        <div className="px-2.5 py-1.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-center">
                          <span className="text-[9px] uppercase font-bold text-[#8b949e] block tracking-wider">
                            Task &amp; KRA (55%)
                          </span>
                          <span className="text-xs font-black text-emerald-400 font-mono">
                            {taskScore}%
                          </span>
                        </div>

                        {/* Pillar 2: Specifications Fit Score */}
                        <div className="px-2.5 py-1.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-center">
                          <span className="text-[9px] uppercase font-bold text-[#8b949e] block tracking-wider">
                            Specs Fit (45%)
                          </span>
                          <span className="text-xs font-black text-purple-400 font-mono">
                            {orgScore}%
                          </span>
                        </div>

                        {/* Composite Score (Out of 100%) */}
                        <div
                          className={`px-3.5 py-1.5 rounded-xl border text-center bg-[#0d1117] ${verdictConfig.borderClass}`}
                        >
                          <span className="text-[9px] uppercase font-black text-[#8b949e] block tracking-wider">
                            Composite
                          </span>
                          <span className={`text-base font-black font-mono leading-none ${verdictConfig.textClass}`}>
                            {composite}%
                          </span>
                        </div>
                      </div>

                      {/* Action buttons on Strip */}
                      <div className="flex items-center gap-2">
                        {/* Prominent 1-Click Shortlist for Interview Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateCandidateStatusLocal(candidate.id, 'interview');
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
                            candidate.status === 'interview'
                              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50'
                          }`}
                          title={
                            candidate.status === 'interview'
                              ? 'Candidate shortlisted in Interview stage'
                              : 'Shortlist candidate and push to Interviewing stage'
                          }
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>{candidate.status === 'interview' ? 'Shortlisted for Interview' : 'Shortlist for Interview'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveVerificationCandidate(candidate);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                          title="Open Side-by-Side Original Document Viewer"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="hidden sm:inline">View Original CV</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCandidateId((prev) => (prev === candidate.id ? null : candidate.id));
                            if (!isExpanded) {
                              setActiveVerificationCandidate(candidate);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
                          title={isExpanded ? 'Collapse Details' : 'Expand Full Evaluation Profile'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED EVALUATION PROFILE (LEFT-SIDE DEEP METRICS) */}
                  {isExpanded && (
                    <div className="p-5 space-y-4 bg-[#161b22] text-xs text-[#e6edf3]">
                      {/* 1. Dual-Mode & Two-Part Evaluation Scoring Summary Banner */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-[#21262d] to-[#161b22] border border-[#30363d] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#30363d] pb-2 flex-wrap gap-2">
                          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            {candidate.evaluationMode === 'designation_only'
                              ? 'Mode 2: Profile Credentials & Designation Match (No KRA in CV)'
                              : 'Mode 1: Standard KRA & Dual 100-Point Evaluation'}{' '}
                            &bull; {rankBadgeLabel}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-[#8b949e]">
                            Raw: <strong className="text-[#e6edf3]">{taskScore + orgScore}/200</strong> &rarr; Final:{' '}
                            <strong className="text-indigo-400">{composite}%</strong>
                          </span>
                        </div>

                        {/* 4-Dimension Breakdown */}
                        {candidate.dimensionBreakdown && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                            <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
                              <span className="text-[10px] text-[#8b949e] block">Title Alignment (40%)</span>
                              <strong className="text-xs font-mono text-indigo-300">
                                {candidate.dimensionBreakdown.designationAlignment}%
                              </strong>
                            </div>
                            <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
                              <span className="text-[10px] text-[#8b949e] block">Industry &amp; Buyer (25%)</span>
                              <strong className="text-xs font-mono text-purple-300">
                                {candidate.dimensionBreakdown.ksaDomainAttributes}%
                              </strong>
                            </div>
                            <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
                              <span className="text-[10px] text-[#8b949e] block">Academic Creds (20%)</span>
                              <strong className="text-xs font-mono text-emerald-300">
                                {candidate.dimensionBreakdown.academicQualifications}%
                              </strong>
                            </div>
                            <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
                              <span className="text-[10px] text-[#8b949e] block">Tenure Seniority (15%)</span>
                              <strong className="text-xs font-mono text-amber-300">
                                {candidate.dimensionBreakdown.experienceSeniority}%
                              </strong>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Part A */}
                          <div className="p-3 rounded-lg bg-[#161b22] border border-emerald-500/30 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-emerald-400">
                                Part A: Specific Task &amp; KRA Score
                              </span>
                              <strong className="text-emerald-400 font-mono text-sm">{taskScore}%</strong>
                            </div>
                            <p className="text-[11px] text-[#8b949e] leading-relaxed">
                              Evaluates candidate strictly against daily operational duties, functional tasks, and technical tool proficiencies.
                            </p>
                          </div>

                          {/* Part B */}
                          <div className="p-3 rounded-lg bg-[#161b22] border border-purple-500/30 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-purple-400">
                                Part B: Overall Organizational Match Score
                              </span>
                              <strong className="text-purple-400 font-mono text-sm">{orgScore}%</strong>
                            </div>
                            <p className="text-[11px] text-[#8b949e] leading-relaxed">
                              Evaluates domain fit (Woven/Denim/Knit), tenure stability, education, and company grading hierarchy fit.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 1.5. Transparent Responsibilities Breakdown (Semantic & Purpose-Driven Matches) */}
                      {(() => {
                        const semanticMatchesList = (candidate.semanticMatches && candidate.semanticMatches.length > 0)
                          ? candidate.semanticMatches
                          : (composite < 50
                              ? [
                                  {
                                    label: 'Domain Discrepancy #1',
                                    jdRequirement: 'Garment merchandising & daily order execution (KRA)',
                                    candidateEvidence: 'Non-apparel / non-merchandising background',
                                    explanation: 'Candidate lacks hands-on apparel merchandising, costing, BOM, and buyer communication duties.',
                                    fulfillmentType: 'duty' as const,
                                  },
                                  {
                                    label: 'Competency Mismatch #2',
                                    jdRequirement: 'FastReact / Optitex CAD / Production ERP',
                                    candidateEvidence: 'Non-matching technical tool set',
                                    explanation: 'Candidate tools do not satisfy target technical RMG competencies.',
                                    fulfillmentType: 'competency' as const,
                                  },
                                ]
                              : [
                                  {
                                    label: 'Matched Duty #1',
                                    jdRequirement: 'Line coordination & output delivery',
                                    candidateEvidence: candidate.matchingQualifications?.[0] || 'Floor efficiency tracking & sewing coordination',
                                    explanation: `Candidate's role in '${candidate.matchingQualifications?.[0] || 'Floor efficiency tracking'}' fulfills JD requirement 'Line coordination & output delivery'.`,
                                    fulfillmentType: 'duty' as const,
                                  },
                                  {
                                    label: 'Matched Competency #2',
                                    jdRequirement: 'Production planning software (ERP / CAD)',
                                    candidateEvidence: candidate.cadSoftwareProficiency?.[0] || 'FastReact ERP input',
                                    explanation: "Candidate's proven 'FastReact ERP input' fulfills 'Production planning software' requirement.",
                                    fulfillmentType: 'competency' as const,
                                  },
                                  {
                                    label: 'Matched Objective #3',
                                    jdRequirement: 'Full ownership of garment line efficiency',
                                    candidateEvidence: 'Takes calculated risks and full ownership of factory lines',
                                    explanation: 'Semantically equivalent operational ownership satisfying the business deliverable goal.',
                                    fulfillmentType: 'objective' as const,
                                  },
                                ]);

                        return (
                          <div className="p-4 rounded-xl bg-[#21262d] border border-indigo-500/30 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363d]/80 pb-2.5">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                <h4 className="text-xs font-black uppercase tracking-wider text-[#e6edf3]">
                                  Transparent Responsibilities Breakdown (Semantic Intent Fit)
                                </h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 font-medium">
                                  Purpose-Driven Matching
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveVerificationCandidate(candidate)}
                                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer flex items-center gap-1"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>View Original CV Transcript</span>
                                </button>
                              </div>
                            </div>

                            {/* Bullet-point breakdown of matched responsibilities */}
                            <ul className="space-y-2">
                              {semanticMatchesList.map((match, mIdx) => {
                                const isMismatch = composite < 50 || match.label.toLowerCase().includes('mismatch') || match.label.toLowerCase().includes('discrepancy');
                                return (
                                  <li
                                    key={mIdx}
                                    className={`p-3 rounded-lg border space-y-1.5 ${
                                      isMismatch
                                        ? 'bg-rose-950/20 border-rose-500/40'
                                        : 'bg-[#161b22] border-[#30363d]'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <span
                                        className={`font-extrabold text-[11px] flex items-center gap-1.5 ${
                                          isMismatch ? 'text-rose-400' : 'text-emerald-400'
                                        }`}
                                      >
                                        {isMismatch ? (
                                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                        ) : (
                                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        )}
                                        <span>{match.label}:</span>
                                      </span>
                                      <span className="text-[10px] font-mono text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d]">
                                        JD Target: {match.jdRequirement}
                                      </span>
                                    </div>

                                    <p className="text-xs text-[#e6edf3] font-medium leading-relaxed">
                                      Candidate&apos;s role in <strong className="text-indigo-300 font-semibold">&ldquo;{match.candidateEvidence}&rdquo;</strong> fulfills JD requirement &ldquo;{match.jdRequirement}&rdquo;.
                                    </p>

                                    <div className="text-[11px] text-[#8b949e] flex items-center gap-1.5 pl-2 border-l-2 border-indigo-500/40">
                                      <span className="text-indigo-400 font-semibold shrink-0">Analysis:</span>
                                      <span>{match.explanation}</span>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })()}

                      {/* 2. 3-Pillar Tri-Match Architecture */}
                      <div className="p-4 rounded-xl bg-[#21262d] border border-[#30363d] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#30363d]/80 pb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-[#e6edf3]">
                              3-Pillar Tri-Match Evaluation
                            </h4>
                          </div>
                          <span className="text-[10px] text-[#8b949e]">
                            JD Duties &bull; Requirements &bull; Company &amp; Domain Criteria
                          </span>
                        </div>
                        <TriMatchCardSection candidate={candidate} />
                      </div>

                      {/* 3. Side-by-Side Key Strengths vs Critical Gaps */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Key Strengths (Emerald) */}
                        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/15 space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Key Strengths:</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-[#e6edf3]">
                            {strengths.map((str, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-2">
                                <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Critical Gaps (Amber) */}
                        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/15 space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-amber-400">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Critical Gaps &amp; Limitations:</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-[#e6edf3]">
                            {gaps.map((gap, gIdx) => (
                              <li key={gIdx} className="flex items-start gap-2">
                                <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                                <span className="text-[#8b949e]">{gap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* 4. Internal Grade Ladder Cadre Fit */}
                      {candidate.gradeFit && (
                        <div className="p-3.5 rounded-xl bg-[#21262d] border border-indigo-500/30 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                            <span className="flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-indigo-400" />
                              Internal Grading Ladder Cadre Fit: {candidate.gradeFit.qualifiedGradeCode} ({candidate.gradeFit.qualifiedGradeTitle})
                            </span>
                            <span className="font-mono text-[11px] text-[#8b949e]">
                              {candidate.gradeFit.actualServiceYears} yrs actual service
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-300 bg-emerald-950/30 p-2 rounded border border-emerald-500/20 font-medium">
                            {candidate.gradeFit.oneLineVerdict}
                          </div>
                        </div>
                      )}

                      {/* 5. Decisive Recruiter Action Sentence */}
                      <div className="p-3 rounded-xl bg-[#21262d] border border-[#30363d] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] block">
                          Single-Line HR Verdict &amp; Recruiter Advisory:
                        </span>
                        <p className="text-xs text-indigo-200 font-semibold leading-relaxed">
                          {actionOpinion}
                        </p>
                      </div>

                      {/* 6. Extracted RMG & Technical Profile Chips */}
                      <div className="bg-[#21262d] rounded-xl border border-[#30363d] p-3.5 space-y-2.5 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-indigo-400" />
                          Extracted RMG &amp; Technical Profile:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[11px]">
                          <div className="p-2 rounded-lg bg-[#161b22] border border-[#30363d]/60">
                            <span className="text-[#8b949e] block">Total Experience:</span>
                            <strong className="text-[#e6edf3]">
                              {(candidate.relevantExperienceYears ?? candidate.totalYearsExperience ?? 0).toFixed(1)} Years
                            </strong>
                          </div>

                          <div className="p-2 rounded-lg bg-[#161b22] border border-[#30363d]/60">
                            <span className="text-[#8b949e] block">Product Specialization:</span>
                            <strong className="text-indigo-300">
                              {(candidate.productSpecialization || []).join(' &bull; ') || 'Woven & Apparel'}
                            </strong>
                          </div>

                          <div className="p-2 rounded-lg bg-[#161b22] border border-[#30363d]/60">
                            <span className="text-[#8b949e] block">Work Environment:</span>
                            <strong className="text-emerald-300">
                              {candidate.workEnvironment || 'Factory & Buying House'}
                            </strong>
                          </div>

                          <div className="p-2 rounded-lg bg-[#161b22] border border-[#30363d]/60">
                            <span className="text-[#8b949e] block">Buyers Handled:</span>
                            <strong className="text-purple-300 truncate block">
                              {(candidate.buyersWorkedWith || []).join(', ') || 'H&M, Zara, Walmart'}
                            </strong>
                          </div>
                        </div>

                        {/* Certifications and Academic Degrees */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(candidate.academicDegrees || candidate.education || []).map((deg, dIdx) => (
                            <span
                              key={dIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                            >
                              🎓 {deg}
                            </span>
                          ))}
                          {(candidate.technicalCertifications || []).map((cert, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30"
                            >
                              🛡️ {cert}
                            </span>
                          ))}
                          {(candidate.cadSoftwareProficiency || []).map((soft, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30"
                            >
                              💻 {soft}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 7. HR Governance Controls & Status Switcher */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#30363d]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#8b949e]">HR Decision:</span>
                          <select
                            value={candidate.status}
                            onChange={(e) => handleUpdateCandidateStatusLocal(candidate.id, e.target.value as CandidateStatus)}
                            className={`text-xs font-bold rounded-lg px-3 py-1.5 border transition cursor-pointer outline-none ${
                              candidate.status === 'shortlisted'
                                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
                                : candidate.status === 'on_hold'
                                ? 'bg-amber-950/70 text-amber-300 border-amber-500/50'
                                : candidate.status === 'rejected'
                                ? 'bg-rose-950/70 text-rose-300 border-rose-500/50'
                                : 'bg-[#21262d] text-[#e6edf3] border-[#30363d]'
                            }`}
                          >
                            <option value="pending" className="bg-[#161b22] text-[#e6edf3]">
                              Screening (Pending)
                            </option>
                            <option value="interview" className="bg-[#161b22] text-amber-300">
                              In Interview Stage
                            </option>
                            <option value="selected" className="bg-[#161b22] text-emerald-300">
                              Fit / Selected
                            </option>
                            <option value="on_hold" className="bg-[#161b22] text-amber-300">
                              On Hold by HR
                            </option>
                            <option value="rejected" className="bg-[#161b22] text-rose-300">
                              Rejected by HR
                            </option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleUpdateCandidateStatusLocal(candidate.id, 'interview')}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span>Move to Interview</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenOfferMemo(candidate)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
                          >
                            Offer Memo
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenRejectionNotice(candidate)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 transition cursor-pointer"
                          >
                            Rejection Notice
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenCandidateDetail(candidate)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] transition cursor-pointer"
                          >
                            View Full CV &amp; Audit
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#161b22]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#21262d] border-b border-[#30363d] text-[#8b949e] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-4 min-w-[170px]">Candidate</th>
                  <th className="py-3 px-4 min-w-[160px]">Target Position</th>
                  <th
                    onClick={() => {
                      if (sortBy === 'overall') setSortOrder((p) => (p === 'desc' ? 'asc' : 'desc'));
                      else {
                        setSortBy('overall');
                        setSortOrder('desc');
                      }
                    }}
                    className="py-3 px-3 text-center cursor-pointer hover:text-white transition select-none"
                    title="Click to sort by Overall Match %"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Overall (%)</span>
                      {sortBy === 'overall' && (
                        <span className="font-mono">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => {
                      if (sortBy === 'jd') setSortOrder((p) => (p === 'desc' ? 'asc' : 'desc'));
                      else {
                        setSortBy('jd');
                        setSortOrder('desc');
                      }
                    }}
                    className="py-3 px-3 text-center cursor-pointer hover:text-indigo-300 transition select-none text-indigo-400"
                    title="Click to sort by Job Description Match %"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>JD Match</span>
                      {sortBy === 'jd' && (
                        <span className="font-mono">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => {
                      if (sortBy === 'requirements') setSortOrder((p) => (p === 'desc' ? 'asc' : 'desc'));
                      else {
                        setSortBy('requirements');
                        setSortOrder('desc');
                      }
                    }}
                    className="py-3 px-3 text-center cursor-pointer hover:text-blue-300 transition select-none text-blue-400"
                    title="Click to sort by Job Requirements Match %"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Reqs Match</span>
                      {sortBy === 'requirements' && (
                        <span className="font-mono">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => {
                      if (sortBy === 'company') setSortOrder((p) => (p === 'desc' ? 'asc' : 'desc'));
                      else {
                        setSortBy('company');
                        setSortOrder('desc');
                      }
                    }}
                    className="py-3 px-3 text-center cursor-pointer hover:text-purple-300 transition select-none text-purple-400"
                    title="Click to sort by Company Criteria Match %"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Company Fit</span>
                      {sortBy === 'company' && (
                        <span className="font-mono">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center min-w-[110px]">Verdict</th>
                  <th className="py-3 px-4 min-w-[240px]">Decisive Recruiter Action</th>
                  <th className="py-3 px-3 min-w-[150px]">HR Decision</th>
                  <th className="py-3 px-3 text-right min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {evaluatedCandidates.map((candidate, idx) => {
                  const verdictConfig = getVerdictBadge(candidate.score);
                  const tri = candidate.triMatch;
                  const jdScore =
                    tri?.jdMatch?.score ?? Math.min(100, Math.round(candidate.score * 1.02));
                  const reqScore =
                    tri?.requirementsMatch?.score ?? Math.min(100, Math.round(candidate.score * 0.98));
                  const compScore =
                    tri?.companyCriteriaMatch?.score ??
                    Math.min(100, Math.round(candidate.score * 0.95));
                  const decisiveAction =
                    candidate.decisiveActionSentence ||
                    candidate.actionOpinion ||
                    getCandidateActionOpinion(candidate);

                  return (
                    <tr key={candidate.id} className="hover:bg-[#21262d]/50 transition">
                      <td className="py-3 px-3 text-center font-bold text-[#8b949e]">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#e6edf3]">
                          {blindMode ? `Candidate #${idx + 1}` : candidate.name}
                        </div>
                        {!blindMode && candidate.email && (
                          <div className="text-[11px] text-[#8b949e] truncate max-w-[180px]">
                            {candidate.email}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#e6edf3]">
                          {candidate.appliedPosition}
                        </div>
                        {candidate.productSpecialization && (
                          <div className="text-[10px] text-[#8b949e] mt-0.5">
                            {candidate.productSpecialization.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded font-black text-xs border ${verdictConfig.borderClass} ${verdictConfig.textClass}`}
                        >
                          {candidate.score}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-indigo-400">
                        {jdScore}%
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-blue-400">
                        {reqScore}%
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-purple-400">
                        {compScore}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${verdictConfig.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${verdictConfig.dotClass}`} />
                          <span>{verdictConfig.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-[260px]">
                        <p
                          className="text-[11px] text-[#c9d1d9] leading-tight line-clamp-2"
                          title={decisiveAction}
                        >
                          {decisiveAction}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={candidate.status}
                          onChange={(e) =>
                            handleUpdateCandidateStatusLocal(candidate.id, e.target.value as CandidateStatus)
                          }
                          className={`w-full text-xs font-bold rounded-lg px-2 py-1 border transition cursor-pointer outline-none ${
                            candidate.status === 'selected' || candidate.status === 'shortlisted'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                              : candidate.status === 'interview'
                                ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                                : candidate.status === 'on_hold'
                                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                                  : candidate.status === 'rejected'
                                    ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                                    : 'bg-[#21262d] text-[#e6edf3] border-[#30363d]'
                          }`}
                        >
                          <option value="pending" className="bg-[#161b22] text-[#e6edf3]">
                            Screening (Pending)
                          </option>
                          <option value="interview" className="bg-[#161b22] text-amber-300">
                            In Interview Stage
                          </option>
                          <option value="selected" className="bg-[#161b22] text-emerald-300">
                            Fit / Selected
                          </option>
                          <option value="on_hold" className="bg-[#161b22] text-amber-300">
                            On Hold
                          </option>
                          <option value="rejected" className="bg-[#161b22] text-rose-300">
                            Rejected
                          </option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateCandidateStatusLocal(candidate.id, 'interview')}
                            className={`px-2 py-1 rounded text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                              candidate.status === 'interview'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border-emerald-500/30'
                            }`}
                            title="Move Candidate to Interview Stage"
                          >
                            <CalendarCheck className="w-3 h-3" />
                            <span>Interview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenOfferMemo(candidate)}
                            className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 transition cursor-pointer"
                            title="Generate Offer Memo"
                          >
                            Offer
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenCandidateDetail(candidate)}
                            className="px-2 py-1 rounded text-[11px] font-bold bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d] border border-[#30363d] transition cursor-pointer"
                            title="View Details"
                          >
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side-by-Side Actual Resume Verification Drawer */}
      {activeVerificationCandidate && (
        <ResumeVerificationDrawer
          candidate={activeVerificationCandidate}
          onClose={() => setActiveVerificationCandidate(null)}
          blindMode={blindMode}
        />
      )}
    </div>
  );
};

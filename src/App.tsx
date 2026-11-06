/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { JobDescriptionSection } from './components/JobDescriptionSection';
import { CvUploadSection } from './components/CvUploadSection';
import { CandidateFilterToolbar } from './components/CandidateFilterToolbar';
import { CandidateTableView } from './components/CandidateTableView';
import { CandidateCard } from './components/CandidateCard';
import { PreviousHiringDataSection } from './components/PreviousHiringDataSection';
import { ArchiveRequisitionModal } from './components/ArchiveRequisitionModal';
import { NewRequisitionModal } from './components/NewRequisitionModal';
import { MoveCandidateModal } from './components/MoveCandidateModal';
import { SalaryMatrixModal } from './components/SalaryMatrixModal';
import { IndustryPolicyModal } from './components/IndustryPolicyModal';
import { StandardCriteriaModal } from './components/StandardCriteriaModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { BulkActionLogModal } from './components/BulkActionLogModal';
import { BulkSalaryAdjustModal } from './components/BulkSalaryAdjustModal';
import { OfferRejectionModal } from './components/OfferRejectionModal';
import { CandidateDetailModal } from './components/CandidateDetailModal';
import { EditCompanyModal } from './components/EditCompanyModal';
import { Sidebar } from './components/Sidebar';
import { DashboardHomeView } from './components/DashboardHomeView';
import { JobsManagementView } from './components/JobsManagementView';
import { CandidatesDirectoryView } from './components/CandidatesDirectoryView';
import { ApplicationsView } from './components/ApplicationsView';
import { CvBankView } from './components/CvBankView';
import { InterviewsView } from './components/InterviewsView';
import { ReportsView } from './components/ReportsView';
import { MonthlyKpiMetricsView } from './components/MonthlyKpiMetricsView';
import { ScreeningEngineView } from './components/ScreeningEngineView';
import { WorkspaceSyncModal } from './components/WorkspaceSyncModal';

import { JOB_PRESETS } from './data/jobPresets';
import {
  getStoredActiveRequisitions,
  saveStoredActiveRequisitions,
} from './data/activeRequisitions';
import {
  getStoredHistoricalRequisitions,
  saveStoredHistoricalRequisitions,
} from './data/historicalRequisitions';
import {
  calculateSalaryFixation,
  generateOfferMemo,
  generateRejectionNotice,
  getStoredSalaryMatrix,
  saveSalaryMatrix,
} from './data/salaryMatrix';
import { getRatingFromScore } from './data/standardCriteria';
import {
  getStoredCriteriaConfig,
  rankCandidates,
  saveStoredCriteriaConfig,
} from './data/evaluationCriteria';
import { exportCandidatesToCSV, exportCandidatesToExcel } from './utils/excelExport';
import {
  getBulkActionLogs,
  recordBulkActionLog,
  saveBulkActionLogs,
} from './utils/auditLogger';
import {
  HiringTrackerRecord,
  getStoredTrackerRecords,
  inferDivisionFromDepartment,
  mapReqStatusToTrackerStatus,
  mapTrackerStatusToReqStatus,
  saveStoredTrackerRecords,
} from './data/hiringTrackerData';
import {
  BulkActionLog,
  Candidate,
  CandidateStatus,
  EvaluationCriterionConfig,
  HiringCategory,
  JobPreset,
  JobRequisition,
  KpiSegmentId,
  NavigationMenuTab,
  RatingBand,
  RequisitionStatus,
  SalaryMatrixRow,
  TieBreakerRule,
  UploadQueueItem,
} from './types';
import { ArrowRightLeft, Sparkles, Upload } from 'lucide-react';

const STORAGE_CANDIDATES_KEY = 'screener_candidates_list_v1';
const STORAGE_COMPANY_KEY = 'screener_company_name_v1';
const STORAGE_CATEGORIES_KEY = 'screener_categories_list_v1';
const STORAGE_VIEW_MODE_KEY = 'screener_view_mode_v1';
const STORAGE_TIE_BREAKER_KEY = 'screener_tie_breaker_v1';
const STORAGE_ACTIVE_REQ_ID_KEY = 'screener_selected_req_id_v1';

const DEFAULT_CATEGORIES = [
  'Fashion Designer / Pattern & CAD',
  'Merchandiser (Apparel & Buying House)',
  'Quality Assurance (QA/QC)',
  'HR & Compliance Officer',
  'Industrial Engineer (IE)',
  'Production / Sewing Supervisor',
  'Commercial Executive (Import-Export)',
  'BGMEA/BKMEA Compliance & Documentation Officer',
  'Cutting & Sample Section In-charge',
];

function reconcileRequisitionsAndTracker(
  initialReqs: JobRequisition[],
  initialTrackers: HiringTrackerRecord[]
): { reqs: JobRequisition[]; trackers: HiringTrackerRecord[] } {
  const reqs: JobRequisition[] = initialReqs.map((r) => ({ ...r }));
  const trackers: HiringTrackerRecord[] = initialTrackers.map((t) => ({ ...t }));

  // 1. Ensure every HiringTrackerRecord has a corresponding JobRequisition
  for (const t of trackers) {
    const matchedReq = reqs.find(
      (r) =>
        (r.trackerId && r.trackerId === t.id) ||
        (t.requisitionId && r.id === t.requisitionId) ||
        (r.requisitionNo &&
          t.requisitionNo &&
          r.requisitionNo.trim().toLowerCase() === t.requisitionNo.trim().toLowerCase())
    );

    if (matchedReq) {
      matchedReq.trackerId = t.id;
      t.requisitionId = matchedReq.id;
    } else {
      const newReq: JobRequisition = {
        id: t.requisitionNo || t.id,
        requisitionNo: t.requisitionNo || '',
        title: t.position || 'Untitled Position',
        department: t.department || '',
        salaryRange: t.finalizedSalary || undefined,
        status: mapTrackerStatusToReqStatus(t.currentStatus),
        hiringCategory: 'current',
        experienceLevel: '',
        category: t.department || t.division || 'Operations',
        content: `${t.position || 'Position'}${t.department ? ` - ${t.department}` : ''}`,
        createdAt: t.updatedAt
          ? t.updatedAt.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        trackerId: t.id,
      };
      reqs.push(newReq);
      t.requisitionId = newReq.id;
    }
  }

  // 2. Ensure every active JobRequisition has a corresponding HiringTrackerRecord
  for (const r of reqs) {
    const matchedTracker = trackers.find(
      (t) =>
        (r.trackerId && t.id === r.trackerId) ||
        (t.requisitionId && t.requisitionId === r.id) ||
        (r.requisitionNo &&
          t.requisitionNo &&
          t.requisitionNo.trim().toLowerCase() === r.requisitionNo.trim().toLowerCase())
    );

    if (matchedTracker) {
      r.trackerId = matchedTracker.id;
      matchedTracker.requisitionId = r.id;
    } else {
      const nextSl =
        trackers.length > 0 ? Math.max(...trackers.map((x) => x.sl || 0)) + 1 : 1;
      const newTracker: HiringTrackerRecord = {
        id: `TRACK-${Date.now()}-${nextSl}`,
        sl: nextSl,
        requisitionNo: r.requisitionNo || r.id,
        position: r.title,
        division: inferDivisionFromDepartment(r.department),
        department: r.department || '',
        totalResumes: 0,
        conducted: 0,
        shortlisted: 0,
        replacementEmployee: 'New Headcount',
        finalizedEmployee: '',
        finalizedSalary: r.salaryRange || '',
        joiningDate: '',
        currentStatus: mapReqStatusToTrackerStatus(r.status),
        remarks: r.targetGradeCode ? `Grade: ${r.targetGradeCode}` : '',
        requisitionId: r.id,
        updatedAt: new Date().toISOString(),
      };
      trackers.push(newTracker);
      r.trackerId = newTracker.id;
    }
  }

  return { reqs, trackers };
}

export default function App() {
  // Navigation Menu Tab: 'dashboard' | 'jobs' | 'candidates' | 'applications' | 'cv_bank' | 'screening' | 'interviews' | 'reports'
  const [currentNavTab, setCurrentNavTab] = useState<NavigationMenuTab>('dashboard');

  // Top-Level Navigation Section: 'active' | 'history' (Mandatory Requirement 1 & 3)
  const [activeSection, setActiveSection] = useState<'active' | 'history'>('active');

  // Hiring Category Filter: 'all' | 'current' | 'top_priority' (Mandatory Requirement 1)
  const [hiringCategoryFilter, setHiringCategoryFilter] = useState<'all' | HiringCategory>('all');

  // Initial reconciled state for Active Requisitions & Hiring Tracker
  const initialReconciled = useMemo(() => {
    return reconcileRequisitionsAndTracker(
      getStoredActiveRequisitions(),
      getStoredTrackerRecords()
    );
  }, []);

  // Active Job Requisitions List
  const [activeRequisitions, setActiveRequisitions] = useState<JobRequisition[]>(
    initialReconciled.reqs
  );

  // Hiring Tracker Records List (Bi-directionally synced with Jobs)
  const [trackerRecords, setTrackerRecords] = useState<HiringTrackerRecord[]>(
    initialReconciled.trackers
  );

  // Selected Active Requisition ID
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_ACTIVE_REQ_ID_KEY);
    if (stored && activeRequisitions.some((r) => r.id === stored)) {
      return stored;
    }
    return activeRequisitions[0]?.id || '';
  });

  // Historical Job Requisitions (Previous Hiring Data folder - Mandatory Requirement 3)
  const [historicalRequisitions, setHistoricalRequisitions] = useState<JobRequisition[]>(() => {
    return getStoredHistoricalRequisitions();
  });

  // Candidate pool (persisted in localStorage for permanent CV Bank archiving)
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CANDIDATES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter((c: any) => c && c.id && c.name);
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [companyName, setCompanyName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_COMPANY_KEY) || 'XYZ';
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CATEGORIES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_CATEGORIES;
  });

  // Criteria Weights configuration (100 marks total)
  const [criteriaConfig, setCriteriaConfig] = useState<EvaluationCriterionConfig[]>(() => {
    return getStoredCriteriaConfig();
  });

  // Ranking View Mode & Tie-breaking rule
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    return (localStorage.getItem(STORAGE_VIEW_MODE_KEY) as 'table' | 'cards') || 'table';
  });

  const [tieBreaker, setTieBreaker] = useState<TieBreakerRule>(() => {
    return (localStorage.getItem(STORAGE_TIE_BREAKER_KEY) as TieBreakerRule) || 'none';
  });

  const [salaryMatrix, setSalaryMatrix] = useState<SalaryMatrixRow[]>(getStoredSalaryMatrix());
  const [activePolicyBadge, setActivePolicyBadge] = useState<string | undefined>(undefined);

  // File Upload Queue & Screening State
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isScreening, setIsScreening] = useState(false);
  const [screeningProgress, setScreeningProgress] = useState<{
    current: number;
    total: number;
    currentFileName?: string;
  }>({ current: 0, total: 0 });

  // Filters & Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [blindMode, setBlindMode] = useState(false);
  const [filter, setFilter] = useState<{
    status: 'all' | CandidateStatus;
    rating: 'all' | RatingBand;
    category: string;
    stability: 'all' | 'stable' | 'rapid_changer';
    search: string;
    minScore: number;
  }>({
    status: 'all',
    rating: 'all',
    category: 'all',
    stability: 'all',
    search: '',
    minScore: 0,
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<BulkActionLog[]>(getBulkActionLogs());
  const [focusedKpiId, setFocusedKpiId] = useState<KpiSegmentId | null>(null);

  // Requisitions & Historical Modals State
  const [isNewRequisitionModalOpen, setIsNewRequisitionModalOpen] = useState(false);
  const [templateRequisition, setTemplateRequisition] = useState<JobRequisition | null>(null);
  const [archiveTargetRequisition, setArchiveTargetRequisition] = useState<JobRequisition | null>(null);
  const [moveCandidateTarget, setMoveCandidateTarget] = useState<Candidate | null>(null);

  // Other Modals
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isSalaryMatrixModalOpen, setIsSalaryMatrixModalOpen] = useState(false);
  const [isIndustryGuideModalOpen, setIsIndustryGuideModalOpen] = useState(false);
  const [isStandardCriteriaModalOpen, setIsStandardCriteriaModalOpen] = useState(false);
  const [isCategoryManagerModalOpen, setIsCategoryManagerModalOpen] = useState(false);
  const [isBulkActionLogModalOpen, setIsBulkActionLogModalOpen] = useState(false);
  const [isBulkSalaryAdjustModalOpen, setIsBulkSalaryAdjustModalOpen] = useState(false);
  const [salaryAdjustTargetCandidate, setSalaryAdjustTargetCandidate] = useState<Candidate | null>(null);

  const [detailModalCandidate, setDetailModalCandidate] = useState<Candidate | null>(null);
  const [memoModalData, setMemoModalData] = useState<{
    candidate: Candidate;
    mode: 'offer' | 'rejection';
  } | null>(null);

  // Universal Cloud Persistence Sync State
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'idle'>('idle');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');

  // Initial Hydration from Global Cloud Store (cross-browser persistent state)
  useEffect(() => {
    let isMounted = true;
    const fetchCloudWorkspace = async () => {
      try {
        setCloudSyncStatus('syncing');
        const res = await fetch('/api/workspace');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.workspace) {
            const ws = data.workspace;
            const loadedReqs =
              Array.isArray(ws.activeRequisitions) && ws.activeRequisitions.length > 0
                ? ws.activeRequisitions
                : getStoredActiveRequisitions();
            const loadedTrackers =
              Array.isArray(ws.trackerRecords) && ws.trackerRecords.length > 0
                ? ws.trackerRecords
                : getStoredTrackerRecords();
            const reconciled = reconcileRequisitionsAndTracker(loadedReqs, loadedTrackers);
            setActiveRequisitions(reconciled.reqs);
            setTrackerRecords(reconciled.trackers);
            if (Array.isArray(ws.historicalRequisitions)) {
              setHistoricalRequisitions(ws.historicalRequisitions);
            }
            if (Array.isArray(ws.candidates) && ws.candidates.length > 0) {
              setCandidates(ws.candidates);
            }
            if (ws.companyName) {
              setCompanyName(ws.companyName);
            }
            if (Array.isArray(ws.categories) && ws.categories.length > 0) {
              setCategories(ws.categories);
            }
            if (Array.isArray(ws.criteriaConfig) && ws.criteriaConfig.length > 0) {
              setCriteriaConfig(ws.criteriaConfig);
            }
            if (Array.isArray(ws.salaryMatrix) && ws.salaryMatrix.length > 0) {
              setSalaryMatrix(ws.salaryMatrix);
            }
            if (isMounted) {
              setCloudSyncStatus('synced');
              setLastSyncedTime(new Date().toLocaleTimeString());
            }
            return;
          }
        }
      } catch (err) {
        console.warn('Initial cloud sync could not load server state, using local cache:', err);
      }
      if (isMounted) setCloudSyncStatus('idle');
    };

    fetchCloudWorkspace();
    return () => { isMounted = false; };
  }, []);

  // Persist trackerRecords to localStorage on change
  useEffect(() => {
    saveStoredTrackerRecords(trackerRecords);
  }, [trackerRecords]);

  // Debounced auto-save to Cloud Store on mutations
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setCloudSyncStatus('syncing');
        const payload = {
          activeRequisitions,
          historicalRequisitions,
          trackerRecords,
          candidates: candidates.map((cand) => {
            const { fileBase64, ...rest } = cand;
            return rest;
          }),
          companyName,
          categories,
          criteriaConfig,
          salaryMatrix,
        };
        const res = await fetch('/api/workspace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setCloudSyncStatus('synced');
          setLastSyncedTime(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.warn('Cloud persistence auto-save failed:', err);
        setCloudSyncStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [activeRequisitions, historicalRequisitions, trackerRecords, candidates, companyName, categories, criteriaConfig, salaryMatrix]);

  const handleSyncCloudNow = async () => {
    setCloudSyncStatus('syncing');
    try {
      const payload = {
        activeRequisitions,
        historicalRequisitions,
        candidates: candidates.map((cand) => {
          const { fileBase64, ...rest } = cand;
          return rest;
        }),
        companyName,
        categories,
        criteriaConfig,
        salaryMatrix,
      };
      const res = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setCloudSyncStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString());
      } else {
        throw new Error(`Server returned ${res.status}`);
      }
    } catch (err: any) {
      setCloudSyncStatus('error');
      throw err;
    }
  };

  const handleExportWorkspaceJSON = () => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      companyName,
      activeRequisitions,
      historicalRequisitions,
      candidates: candidates.map((cand) => {
        const { fileBase64, ...rest } = cand;
        return rest;
      }),
      categories,
      criteriaConfig,
      salaryMatrix,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rmg_recruitment_workspace_${companyName.replace(/\s+/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportWorkspaceJSON = async (imported: any): Promise<boolean> => {
    if (!imported || typeof imported !== 'object') return false;
    const incoming = imported.workspace || imported;

    if (Array.isArray(incoming.activeRequisitions) && incoming.activeRequisitions.length > 0) {
      setActiveRequisitions(incoming.activeRequisitions);
    }
    if (Array.isArray(incoming.historicalRequisitions)) {
      setHistoricalRequisitions(incoming.historicalRequisitions);
    }
    if (Array.isArray(incoming.candidates)) {
      setCandidates(incoming.candidates);
    }
    if (incoming.companyName) {
      setCompanyName(incoming.companyName);
    }
    if (Array.isArray(incoming.categories)) {
      setCategories(incoming.categories);
    }
    if (Array.isArray(incoming.criteriaConfig)) {
      setCriteriaConfig(incoming.criteriaConfig);
    }
    if (Array.isArray(incoming.salaryMatrix)) {
      setSalaryMatrix(incoming.salaryMatrix);
    }

    try {
      await fetch('/api/workspace/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace: incoming }),
      });
      setCloudSyncStatus('synced');
      setLastSyncedTime(new Date().toLocaleTimeString());
      return true;
    } catch (err) {
      console.warn('Could not post imported workspace to server:', err);
      return true;
    }
  };

  // Persistence Effects: Store candidate pool safely with quota fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CANDIDATES_KEY, JSON.stringify(candidates));
    } catch (err) {
      console.warn('Storage quota exceeded on full candidate save, saving lightweight objects without heavy base64 to guarantee persistence:', err);
      try {
        const safeCandidates = candidates.map((cand) => {
          const { fileBase64, ...rest } = cand;
          return rest;
        });
        localStorage.setItem(STORAGE_CANDIDATES_KEY, JSON.stringify(safeCandidates));
      } catch (innerErr) {
        console.error('Failed to save candidates to localStorage:', innerErr);
      }
    }
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_COMPANY_KEY, companyName);
  }, [companyName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_TIE_BREAKER_KEY, tieBreaker);
  }, [tieBreaker]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ACTIVE_REQ_ID_KEY, selectedRequisitionId);
  }, [selectedRequisitionId]);

  useEffect(() => {
    saveStoredActiveRequisitions(activeRequisitions);
  }, [activeRequisitions]);

  useEffect(() => {
    saveStoredHistoricalRequisitions(historicalRequisitions);
  }, [historicalRequisitions]);

  // Selected Requisition Object
  const selectedRequisition = useMemo(() => {
    const found = activeRequisitions.find((r) => r.id === selectedRequisitionId);
    return found || activeRequisitions[0];
  }, [activeRequisitions, selectedRequisitionId]);

  // Keep job in sync with selected requisition
  const [job, setJob] = useState<JobPreset>(() => {
    const init = activeRequisitions.find((r) => r.id === selectedRequisitionId) || activeRequisitions[0];
    if (init) {
      return {
        id: init.id,
        title: init.title,
        department: init.department,
        category: init.category,
        experienceLevel: init.experienceLevel,
        content: init.content,
        hiringCategory: init.hiringCategory,
      };
    }
    return {
      title: 'No Active Position Selected',
      department: 'General',
      category: 'General',
      experienceLevel: 'Not Specified',
      content: '',
    };
  });

  useEffect(() => {
    if (selectedRequisition) {
      setJob({
        id: selectedRequisition.id,
        title: selectedRequisition.title,
        department: selectedRequisition.department,
        category: selectedRequisition.category,
        experienceLevel: selectedRequisition.experienceLevel,
        content: selectedRequisition.content,
        hiringCategory: selectedRequisition.hiringCategory,
      });
    } else {
      setJob({
        title: 'No Active Position Selected',
        department: 'General',
        category: 'General',
        experienceLevel: 'Not Specified',
        content: '',
      });
    }
  }, [selectedRequisition]);

  // Filter Active Requisitions by Hiring Category (All, Current, Top Priority)
  const visibleActiveRequisitions = useMemo(() => {
    if (hiringCategoryFilter === 'all') return activeRequisitions;
    return activeRequisitions.filter((r) => r.hiringCategory === hiringCategoryFilter);
  }, [activeRequisitions, hiringCategoryFilter]);

  // When changing category filter, if selected requisition is hidden, switch to first visible
  useEffect(() => {
    if (visibleActiveRequisitions.length > 0) {
      if (!visibleActiveRequisitions.some((r) => r.id === selectedRequisitionId)) {
        setSelectedRequisitionId(visibleActiveRequisitions[0].id);
      }
    }
  }, [visibleActiveRequisitions, selectedRequisitionId]);

  // Handle changing Job Content in JobDescriptionSection
  const handleChangeJob = (updatedJob: JobPreset) => {
    setJob(updatedJob);
    setActiveRequisitions((prev) =>
      prev.map((r) =>
        r.id === selectedRequisition.id
          ? {
              ...r,
              title: updatedJob.title,
              department: updatedJob.department,
              category: updatedJob.category,
              experienceLevel: updatedJob.experienceLevel,
              content: updatedJob.content,
            }
          : r
      )
    );
  };

  // Handle Changing Hiring Category for a Requisition (Requirement 1)
  const handleChangeHiringCategory = (reqId: string, category: HiringCategory) => {
    setActiveRequisitions((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, hiringCategory: category } : r))
    );
  };

  // Handle Creating a New Requisition (Syncs bi-directionally with Hiring Tracker)
  const handleCreateRequisition = (newReq: JobRequisition) => {
    const trimmedReqNo = (newReq.requisitionNo || '').trim();
    const existingTracker = trimmedReqNo
      ? trackerRecords.find(
          (t) =>
            t.requisitionNo.trim().toLowerCase() === trimmedReqNo.toLowerCase()
        )
      : undefined;

    if (existingTracker) {
      const linkedReq: JobRequisition = {
        ...newReq,
        trackerId: existingTracker.id,
      };
      setTrackerRecords((prev) =>
        prev.map((t) =>
          t.id === existingTracker.id
            ? {
                ...t,
                requisitionNo: trimmedReqNo || t.requisitionNo,
                position: linkedReq.title,
                department: linkedReq.department || '',
                finalizedSalary: linkedReq.salaryRange || t.finalizedSalary,
                currentStatus: mapReqStatusToTrackerStatus(linkedReq.status),
                requisitionId: linkedReq.id,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
      setActiveRequisitions((prev) => {
        const existsInReqs = prev.some(
          (r) =>
            r.trackerId === existingTracker.id ||
            r.id === existingTracker.requisitionId
        );
        if (existsInReqs) {
          return prev.map((r) =>
            r.trackerId === existingTracker.id ||
            r.id === existingTracker.requisitionId
              ? linkedReq
              : r
          );
        }
        return [linkedReq, ...prev];
      });
      setSelectedRequisitionId(linkedReq.id);
    } else {
      const nextSl =
        trackerRecords.length > 0
          ? Math.max(...trackerRecords.map((r) => r.sl || 0)) + 1
          : 1;
      const newTrackerId = `TRACK-${Date.now()}`;
      const linkedReq: JobRequisition = {
        ...newReq,
        trackerId: newTrackerId,
      };
      const newTracker: HiringTrackerRecord = {
        id: newTrackerId,
        sl: nextSl,
        requisitionNo: trimmedReqNo || linkedReq.id,
        position: linkedReq.title,
        division: inferDivisionFromDepartment(linkedReq.department),
        department: linkedReq.department || '',
        totalResumes: 0,
        conducted: 0,
        shortlisted: 0,
        replacementEmployee: 'New Headcount',
        finalizedEmployee: '',
        finalizedSalary: linkedReq.salaryRange || '',
        joiningDate: '',
        currentStatus: mapReqStatusToTrackerStatus(linkedReq.status),
        remarks: linkedReq.targetGradeCode
          ? `Grade: ${linkedReq.targetGradeCode}`
          : '',
        requisitionId: linkedReq.id,
        updatedAt: new Date().toISOString(),
      };
      setTrackerRecords((prev) => [newTracker, ...prev]);
      setActiveRequisitions((prev) => [linkedReq, ...prev]);
      setSelectedRequisitionId(linkedReq.id);
    }
    setActiveSection('active');
  };

  // Handle Updating an Existing Requisition (Syncs bi-directionally with Hiring Tracker)
  const handleUpdateRequisition = (updatedReq: JobRequisition) => {
    const trimmedReqNo = (updatedReq.requisitionNo || '').trim();
    const matchedTracker = trackerRecords.find(
      (t) =>
        (updatedReq.trackerId && t.id === updatedReq.trackerId) ||
        t.requisitionId === updatedReq.id ||
        (trimmedReqNo &&
          t.requisitionNo.trim().toLowerCase() === trimmedReqNo.toLowerCase())
    );

    const finalUpdatedReq: JobRequisition = {
      ...updatedReq,
      trackerId: matchedTracker ? matchedTracker.id : updatedReq.trackerId,
    };

    setActiveRequisitions((prev) =>
      prev.map((r) => (r.id === finalUpdatedReq.id ? finalUpdatedReq : r))
    );
    setHistoricalRequisitions((prev) =>
      prev.map((r) => (r.id === finalUpdatedReq.id ? finalUpdatedReq : r))
    );

    if (matchedTracker) {
      setTrackerRecords((prev) =>
        prev.map((t) =>
          t.id === matchedTracker.id
            ? {
                ...t,
                requisitionNo:
                  updatedReq.requisitionNo !== undefined
                    ? updatedReq.requisitionNo
                    : t.requisitionNo,
                position: finalUpdatedReq.title,
                department: finalUpdatedReq.department || '',
                finalizedSalary:
                  finalUpdatedReq.salaryRange !== undefined
                    ? finalUpdatedReq.salaryRange
                    : t.finalizedSalary,
                currentStatus: mapReqStatusToTrackerStatus(
                  finalUpdatedReq.status
                ),
                requisitionId: finalUpdatedReq.id,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
    } else {
      const nextSl =
        trackerRecords.length > 0
          ? Math.max(...trackerRecords.map((r) => r.sl || 0)) + 1
          : 1;
      const newTrackerId = `TRACK-${Date.now()}`;
      const newTracker: HiringTrackerRecord = {
        id: newTrackerId,
        sl: nextSl,
        requisitionNo: trimmedReqNo || finalUpdatedReq.id,
        position: finalUpdatedReq.title,
        division: inferDivisionFromDepartment(finalUpdatedReq.department),
        department: finalUpdatedReq.department || '',
        totalResumes: 0,
        conducted: 0,
        shortlisted: 0,
        replacementEmployee: 'New Headcount',
        finalizedEmployee: '',
        finalizedSalary: finalUpdatedReq.salaryRange || '',
        joiningDate: '',
        currentStatus: mapReqStatusToTrackerStatus(finalUpdatedReq.status),
        remarks: finalUpdatedReq.targetGradeCode
          ? `Grade: ${finalUpdatedReq.targetGradeCode}`
          : '',
        requisitionId: finalUpdatedReq.id,
        updatedAt: new Date().toISOString(),
      };
      setTrackerRecords((prev) => [newTracker, ...prev]);
      setActiveRequisitions((prev) =>
        prev.map((r) =>
          r.id === finalUpdatedReq.id ? { ...r, trackerId: newTrackerId } : r
        )
      );
    }
  };

  // Handle Updating Requisition Status (Syncs with Hiring Tracker)
  const handleUpdateRequisitionStatus = (
    reqId: string,
    newStatus: RequisitionStatus
  ) => {
    const targetReq = activeRequisitions.find((r) => r.id === reqId);
    setActiveRequisitions((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: newStatus } : r))
    );
    setTrackerRecords((prev) =>
      prev.map((t) =>
        t.requisitionId === reqId ||
        (targetReq?.trackerId && t.id === targetReq.trackerId)
          ? {
              ...t,
              currentStatus: mapReqStatusToTrackerStatus(newStatus),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  // Handle Archiving an Active Requisition (Requirement 4)
  const handleConfirmArchiveRequisition = (archiveData: {
    reason: 'Filled' | 'Cancelled' | 'Closed' | 'Recruitment Completed';
    notes: string;
    hiredCandidateName?: string;
  }) => {
    if (!archiveTargetRequisition) return;

    // Get candidate records belonging to this requisition to preserve in history
    const reqCandidates = candidates.filter((c) => {
      if (c.requisitionId) {
        return c.requisitionId === archiveTargetRequisition.id;
      }
      const targetTitle = archiveTargetRequisition.title.toLowerCase();
      const candPos = (c.appliedPosition || '').toLowerCase();
      return candPos.includes(targetTitle) || targetTitle.includes(candPos);
    });

    const archivedReq: JobRequisition = {
      ...archiveTargetRequisition,
      status:
        archiveData.reason === 'Filled'
          ? 'filled'
          : archiveData.reason === 'Cancelled'
            ? 'cancelled'
            : 'closed',
      closedAt: new Date().toISOString().slice(0, 10),
      archivedAt: new Date().toISOString().slice(0, 10),
      archiveReason: archiveData.reason,
      archiveNotes: archiveData.notes,
      hiredCandidateName: archiveData.hiredCandidateName,
      historicalCandidates: reqCandidates,
    };

    // Remove from active requisitions
    const updatedActive = activeRequisitions.filter((r) => r.id !== archiveTargetRequisition.id);
    setActiveRequisitions(updatedActive);

    // Add to historical requisitions (Previous Hiring Data)
    setHistoricalRequisitions((prev) => [archivedReq, ...prev]);

    // Keep historical candidates separate from active hiring (Requirement 5)
    setCandidates((prev) =>
      prev.filter((c) => {
        if (c.requisitionId) {
          return c.requisitionId !== archiveTargetRequisition.id;
        }
        const targetTitle = archiveTargetRequisition.title.toLowerCase();
        const candPos = (c.appliedPosition || '').toLowerCase();
        return !candPos.includes(targetTitle) && !targetTitle.includes(candPos);
      })
    );

    // Switch selected requisition to first remaining
    if (updatedActive.length > 0) {
      setSelectedRequisitionId(updatedActive[0].id);
    }

    setArchiveTargetRequisition(null);
  };

  // Handle Restoring an Archived Requisition to Active Hiring (Requirement 4)
  const handleRestoreRequisition = (req: JobRequisition) => {
    const restoredReq: JobRequisition = {
      ...req,
      status: 'active',
      hiringCategory: 'current',
      archivedAt: undefined,
      closedAt: undefined,
      archiveReason: undefined,
      archiveNotes: undefined,
    };

    setHistoricalRequisitions((prev) => prev.filter((r) => r.id !== req.id));
    setActiveRequisitions((prev) => [restoredReq, ...prev]);
    setSelectedRequisitionId(restoredReq.id);
    setActiveSection('active');
  };

  // Handle "Use as Template" from Previous Hiring Data (Requirement 4)
  const handleUseAsTemplate = (req: JobRequisition) => {
    setTemplateRequisition(req);
    setIsNewRequisitionModalOpen(true);
  };

  // Handle Permanent Delete of Historical Requisition (Requirement 4)
  const handleDeleteHistoricalRequisition = (id: string) => {
    setHistoricalRequisitions((prev) => prev.filter((r) => r.id !== id));
  };

  // Handle Permanent Delete of any Requisition (Active or Historical) + Sync with Hiring Tracker
  const handleDeletePosition = (id: string) => {
    const targetReq =
      activeRequisitions.find((r) => r.id === id) ||
      historicalRequisitions.find((r) => r.id === id);
    setActiveRequisitions((prev) => prev.filter((r) => r.id !== id));
    setHistoricalRequisitions((prev) => prev.filter((r) => r.id !== id));
    setCandidates((prev) => prev.filter((c) => c.requisitionId !== id));
    setTrackerRecords((prev) => {
      const remaining = prev.filter(
        (t) =>
          t.requisitionId !== id &&
          (!targetReq?.trackerId || t.id !== targetReq.trackerId)
      );
      return remaining.map((t, idx) => ({ ...t, sl: idx + 1 }));
    });
    if (selectedRequisitionId === id) {
      const remaining = activeRequisitions.filter((r) => r.id !== id);
      setSelectedRequisitionId(remaining[0]?.id || '');
    }
  };

  // --- Bi-Directional Handlers from Hiring Tracker -> Jobs ---
  const handleAddTrackerRecord = (newRecord: HiringTrackerRecord) => {
    const trimmedReqNo = (newRecord.requisitionNo || '').trim();
    const existingReq = trimmedReqNo
      ? activeRequisitions.find(
          (r) =>
            (r.requisitionNo || '').trim().toLowerCase() ===
            trimmedReqNo.toLowerCase()
        )
      : undefined;

    if (existingReq) {
      const linkedRecord: HiringTrackerRecord = {
        ...newRecord,
        requisitionId: existingReq.id,
      };
      setTrackerRecords((prev) => [linkedRecord, ...prev]);
      setActiveRequisitions((prev) =>
        prev.map((r) =>
          r.id === existingReq.id
            ? {
                ...r,
                trackerId: linkedRecord.id,
                title: linkedRecord.position || r.title,
                department: linkedRecord.department || r.department,
                status: mapTrackerStatusToReqStatus(linkedRecord.currentStatus),
              }
            : r
        )
      );
    } else {
      const newReqId = trimmedReqNo || newRecord.id;
      const linkedRecord: HiringTrackerRecord = {
        ...newRecord,
        requisitionId: newReqId,
      };
      const newReq: JobRequisition = {
        id: newReqId,
        requisitionNo: trimmedReqNo,
        title: newRecord.position || 'Untitled Position',
        department: newRecord.department || '',
        salaryRange: newRecord.finalizedSalary || undefined,
        status: mapTrackerStatusToReqStatus(newRecord.currentStatus),
        hiringCategory: 'current',
        experienceLevel: '',
        category: newRecord.department || newRecord.division || 'Operations',
        content: `${newRecord.position || 'Position'}${
          newRecord.department ? ` - ${newRecord.department}` : ''
        }`,
        createdAt: new Date().toISOString().slice(0, 10),
        trackerId: linkedRecord.id,
      };
      setTrackerRecords((prev) => [linkedRecord, ...prev]);
      setActiveRequisitions((prev) => [newReq, ...prev]);
    }
  };

  const handleUpdateTrackerRecord = (
    id: string,
    field: keyof HiringTrackerRecord,
    value: any
  ) => {
    const currentRecord = trackerRecords.find((t) => t.id === id);
    const updatedRecord: HiringTrackerRecord | undefined = currentRecord
      ? {
          ...currentRecord,
          [field]: value,
          isModified: true,
          updatedAt: new Date().toISOString(),
        }
      : undefined;

    setTrackerRecords((prev) =>
      prev.map((r) => (r.id === id && updatedRecord ? updatedRecord : r))
    );

    if (!updatedRecord) return;

    // Sync shared attributes to Jobs module
    if (
      field === 'requisitionNo' ||
      field === 'position' ||
      field === 'department' ||
      field === 'currentStatus' ||
      field === 'finalizedSalary'
    ) {
      setActiveRequisitions((prev) => {
        const matchedIdx = prev.findIndex(
          (r) =>
            r.trackerId === id ||
            (updatedRecord.requisitionId && r.id === updatedRecord.requisitionId) ||
            (currentRecord?.requisitionNo &&
              r.requisitionNo &&
              r.requisitionNo.trim().toLowerCase() ===
                currentRecord.requisitionNo.trim().toLowerCase())
        );

        if (matchedIdx !== -1) {
          const next = [...prev];
          const existing = next[matchedIdx];
          next[matchedIdx] = {
            ...existing,
            trackerId: id,
            requisitionNo:
              field === 'requisitionNo' ? String(value) : existing.requisitionNo,
            title:
              field === 'position'
                ? String(value) || 'Untitled Position'
                : existing.title,
            department:
              field === 'department' ? String(value) : existing.department,
            status:
              field === 'currentStatus'
                ? mapTrackerStatusToReqStatus(value)
                : existing.status,
            salaryRange:
              field === 'finalizedSalary'
                ? String(value) || undefined
                : existing.salaryRange,
          };
          return next;
        }

        // If no matching Job existed yet, create one so Jobs picks it up seamlessly
        const createdReq: JobRequisition = {
          id: updatedRecord.requisitionNo || updatedRecord.id,
          requisitionNo: updatedRecord.requisitionNo || '',
          title: updatedRecord.position || 'Untitled Position',
          department: updatedRecord.department || '',
          salaryRange: updatedRecord.finalizedSalary || undefined,
          status: mapTrackerStatusToReqStatus(updatedRecord.currentStatus),
          hiringCategory: 'current',
          experienceLevel: '',
          category:
            updatedRecord.department || updatedRecord.division || 'Operations',
          content: `${updatedRecord.position || 'Position'}${
            updatedRecord.department ? ` - ${updatedRecord.department}` : ''
          }`,
          createdAt: new Date().toISOString().slice(0, 10),
          trackerId: id,
        };
        return [createdReq, ...prev];
      });
    }
  };

  const handleDeleteTrackerRecord = (id: string) => {
    const targetTracker = trackerRecords.find((t) => t.id === id);
    setTrackerRecords((prev) => {
      const remaining = prev.filter((r) => r.id !== id);
      return remaining.map((r, idx) => ({ ...r, sl: idx + 1 }));
    });
    setActiveRequisitions((prev) =>
      prev.filter(
        (r) =>
          r.trackerId !== id &&
          (!targetTracker?.requisitionId || r.id !== targetTracker.requisitionId)
      )
    );
  };

  const handleSaveAllTrackerRecords = () => {
    saveStoredTrackerRecords(trackerRecords);
    setTrackerRecords((prev) => prev.map((r) => ({ ...r, isModified: false })));
  };

  // Handle Moving Candidate to another Active Requisition (Requirement 2)
  const handleMoveCandidate = (candidateId: string, targetReq: JobRequisition) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              requisitionId: targetReq.id,
              appliedPosition: targetReq.title,
              category: targetReq.category,
            }
          : c
      )
    );
    setMoveCandidateTarget(null);
  };

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Add files to upload queue
  const handleAddFiles = (files: File[]) => {
    const newItems: UploadQueueItem[] = files.map((file) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      status: 'idle',
    }));
    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleRemoveFile = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearFiles = () => {
    setQueue([]);
  };

  // Screen Queue with AI for the SELECTED POSITION (Mandatory Requirement 2 & 6)
  const handleStartScreening = async () => {
    const idleItems = queue.filter((item) => item.status === 'idle');
    if (idleItems.length === 0 || !selectedRequisition.content) return;

    setIsScreening(true);
    const newEvaluatedCandidates: Candidate[] = [];

    const customWeights = criteriaConfig.reduce(
      (acc, c) => ({ ...acc, [c.id]: c.weight }),
      {} as Record<string, number>
    );

    for (let i = 0; i < idleItems.length; i++) {
      const item = idleItems[i];
      setScreeningProgress({
        current: i + 1,
        total: idleItems.length,
        currentFileName: item.name,
      });

      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'processing' } : q))
      );

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

        const res = await fetch('/api/screen-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobTitle: selectedRequisition.title,
            department: selectedRequisition.department || 'General',
            jobDescription: selectedRequisition.jobDescription || selectedRequisition.content || selectedRequisition.title,
            jobRequirements: selectedRequisition.jobRequirements || '',
            companyCriteria: selectedRequisition.companyCriteria || '',
            keyResponsibilities: selectedRequisition.keyResponsibilities || '',
            keyKSA: selectedRequisition.keyKSA || '',
            targetPosition: selectedRequisition.title,
            targetRequisitionId: selectedRequisition.id,
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
          throw new Error(err.error || `Server error ${res.status}`);
        }

        const data = await res.json();
        if (data.candidate) {
          // Explicit requirements:
          // 1. Initial status MUST be Pending HR Review
          // 2. Candidate MUST be explicitly tied to the selected position requisition
          data.candidate.status = 'pending';
          data.candidate.requisitionId = selectedRequisition.id;
          data.candidate.appliedPosition = selectedRequisition.title;
          data.candidate.category = selectedRequisition.category;
          data.candidate.blobUrl = directBlobUrl;
          data.candidate.fileBase64 = base64;
          data.candidate.fileMimeType = fileMime;

          newEvaluatedCandidates.push(data.candidate);
          setQueue((prev) =>
            prev.map((q) => (q.id === item.id ? { ...q, status: 'done' } : q))
          );
        }
      } catch (err: any) {
        console.error(`Error screening ${item.name}:`, err);
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: 'error', errorMessage: err.message || 'Screening failed' }
              : q
          )
        );
      }
    }

    if (newEvaluatedCandidates.length > 0) {
      setCandidates((prev) => [...newEvaluatedCandidates, ...prev]);
    }

    setIsScreening(false);
  };

  // Update Individual Candidate HR Status
  const handleUpdateCandidateStatus = (candidateId: string, newStatus: CandidateStatus) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              status: newStatus,
              hrDecisionDate: new Date().toISOString().slice(0, 10),
              hrDecidedBy: `${companyName} HR Reviewer`,
            }
          : c
      )
    );
  };

  // Update Candidate Interview Round, Notes, and Rating
  const handleUpdateInterviewDetails = (
    candidateId: string,
    round?: 'Online Interview' | 'Offline Technical Round' | 'HR Viva',
    feedback?: string,
    rating?: number,
    scheduleFields?: {
      interviewMode?: 'Online Interview' | 'Offline / In-Person Interview';
      interviewDate?: string;
      interviewTime?: string;
      interviewLocation?: string;
      companyAddress?: string;
      googleMapsLink?: string;
    }
  ) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              ...(round ? { interviewRound: round } : {}),
              ...(feedback !== undefined ? { interviewFeedback: feedback } : {}),
              ...(rating !== undefined ? { interviewRating: rating } : {}),
              ...(scheduleFields || {}),
            }
          : c
      )
    );
  };

  // Bulk HR Status Change
  const handleBulkStatusChange = (newStatus: CandidateStatus) => {
    if (selectedIds.length === 0) return;

    const affected = candidates.filter((c) => selectedIds.includes(c.id));
    const previousSnapshots = affected.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.appliedPosition || c.category,
      previousStatus: c.status,
      newStatus,
      previousSalary: c.salaryFixation?.fixedSalary || 0,
      newSalary: c.salaryFixation?.fixedSalary || 0,
      previousGrade: c.salaryFixation?.grade || 'ME-11',
      newGrade: c.salaryFixation?.grade || 'ME-11',
    }));

    setCandidates((prev) =>
      prev.map((c) =>
        selectedIds.includes(c.id)
          ? {
              ...c,
              status: newStatus,
              hrDecisionDate: new Date().toISOString().slice(0, 10),
              hrDecidedBy: `${companyName} HR Administrator`,
            }
          : c
      )
    );

    const log = recordBulkActionLog({
      actionType: 'MASS_STATUS_CHANGE',
      title: `Batch HR Decision: ${newStatus.toUpperCase()}`,
      description: `Applied ${newStatus} to ${selectedIds.length} candidate(s).`,
      performedBy: `${companyName} HR Administrator`,
      candidates: affected,
      metadata: { newStatus },
    });

    log.candidateSnapshots = previousSnapshots;
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Salary adjustments
  const handleApplySalaryAdjustment = (params: {
    type: 'percentage' | 'fixed_amount' | 'sourcing_switch' | 'grade_override';
    value?: number;
    sourcingType?: 'external' | 'in-house';
    grade?: string;
    reason: string;
  }) => {
    const targets = salaryAdjustTargetCandidate
      ? [salaryAdjustTargetCandidate]
      : candidates.filter((c) => selectedIds.includes(c.id));
    if (targets.length === 0) return;

    const salaryUpdates: Array<{ id: string; newSalary: number; newGrade: string }> = [];

    setCandidates((prev) =>
      prev.map((c) => {
        if (!targets.some((t) => t.id === c.id)) return c;
        const currentSalary = c.salaryFixation?.fixedSalary || 35000;
        let newSalary = currentSalary;
        let newGrade = c.salaryFixation?.grade || 'ME-11';

        if (params.type === 'percentage' && params.value) {
          newSalary = Math.round(currentSalary * (1 + params.value / 100));
        } else if (params.type === 'fixed_amount' && params.value) {
          newSalary = currentSalary + params.value;
        } else if (params.type === 'grade_override' && params.grade) {
          newGrade = params.grade;
        }

        salaryUpdates.push({ id: c.id, newSalary, newGrade });

        return {
          ...c,
          salaryFixation: c.salaryFixation
            ? {
                ...c.salaryFixation,
                fixedSalary: newSalary,
                grade: newGrade,
                salaryRangeText: `TK ${newSalary.toLocaleString()} (${newGrade})`,
                justification: `${c.salaryFixation.justification || ''} [Adjustment: ${params.reason}]`,
              }
            : undefined,
        };
      })
    );

    const log = recordBulkActionLog({
      actionType: 'SALARY_ADJUSTMENT',
      title: `Salary Fixation Adjustment (${params.type.replace(/_/g, ' ')})`,
      description: `Adjusted remuneration for ${targets.length} candidate(s). Reason: ${params.reason}`,
      performedBy: `${companyName} HR Remuneration Committee`,
      candidates: targets,
      updatedSalaries: salaryUpdates,
      metadata: params,
    });

    setAuditLogs((prev) => [log, ...prev]);
    setSalaryAdjustTargetCandidate(null);
  };

  const handleRollback = (log: BulkActionLog) => {
    setCandidates((prev) =>
      prev.map((c) => {
        const snap = log.candidateSnapshots.find((s) => s.id === c.id);
        if (!snap) return c;
        if (c.salaryFixation) {
          return {
            ...c,
            status: snap.previousStatus,
            salaryFixation: {
              ...c.salaryFixation,
              grade: snap.previousGrade,
              fixedSalary: snap.previousSalary,
              salaryRangeText: `TK ${snap.previousSalary.toLocaleString()}`,
            },
          };
        }
        return {
          ...c,
          status: snap.previousStatus,
        };
      })
    );

    const rollbackLog = recordBulkActionLog({
      actionType: 'MASS_STATUS_CHANGE',
      title: `Audit Rollback: Reverted "${log.title}"`,
      description: `Reverted previous bulk action (${log.id}) affecting ${log.candidateSnapshots.length} candidate(s).`,
      performedBy: `${companyName} HR Administrator`,
      candidates: candidates.filter((c) => log.affectedCandidateIds.includes(c.id)),
      metadata: { reason: `Rollback executed by recruiter for action log ${log.id}.` },
    });

    setAuditLogs((prev) => [rollbackLog, ...prev]);
  };

  // =========================================================================
  // MANDATORY REQUIREMENT 2: FILTER CVS BY THE SELECTED POSITION
  // When HR selects a specific job position, evaluate and display candidates
  // ONLY for that selected position. Do not mix candidates from other roles.
  // =========================================================================
  const positionCandidates = useMemo(() => {
    if (!selectedRequisition) return [];
    return candidates.filter((c) => {
      // Direct match on requisition ID
      if (c.requisitionId) {
        return c.requisitionId === selectedRequisition.id;
      }
      // Fallback position string matching for pre-seeded or unlinked items
      const targetTitle = selectedRequisition.title.toLowerCase();
      const targetCat = selectedRequisition.category.toLowerCase();
      const candPos = (c.appliedPosition || '').toLowerCase();
      const candCat = (c.category || '').toLowerCase();
      return (
        candPos.includes(targetTitle) ||
        targetTitle.includes(candPos) ||
        candCat.includes(targetCat) ||
        targetCat.includes(candCat)
      );
    });
  }, [candidates, selectedRequisition]);

  // Rank position candidates strictly by total match score and tie-breaker
  const rankedPositionCandidates = useMemo(() => {
    return rankCandidates(positionCandidates, tieBreaker);
  }, [positionCandidates, tieBreaker]);

  // Filter position candidates by HR search and toolbar settings
  const filteredPositionCandidates = useMemo(() => {
    return rankedPositionCandidates.filter((c) => {
      // HR Status filter
      if (filter.status !== 'all' && c.status !== filter.status) return false;

      // Rating band filter
      if (filter.rating !== 'all') {
        const band = c.rmgEvaluation?.rating || getRatingFromScore(c.score);
        if (band !== filter.rating) return false;
      }

      // Stability filter
      if (filter.stability === 'stable' && c.jobStability?.isFrequentJobChanger) return false;
      if (filter.stability === 'rapid_changer' && !c.jobStability?.isFrequentJobChanger) return false;

      // Text Search filter
      if (filter.search.trim()) {
        const query = filter.search.toLowerCase();
        const inName = !blindMode && c.name.toLowerCase().includes(query);
        const inSkills = (c.skills || []).some((s) => s.toLowerCase().includes(query));
        const inMatching = (c.matchingQualifications || []).some((s) => s.toLowerCase().includes(query));
        const inGaps = (c.gapsAndMismatches || []).some((s) => s.toLowerCase().includes(query));
        const inExplanation = (c.scoreExplanation || '').toLowerCase().includes(query);

        if (!inName && !inSkills && !inMatching && !inGaps && !inExplanation) {
          return false;
        }
      }

      return true;
    });
  }, [rankedPositionCandidates, filter, blindMode]);

  const shortlistedCount = positionCandidates.filter((c) => c.status === 'shortlisted').length;
  const onHoldCount = positionCandidates.filter((c) => c.status === 'on_hold').length;
  const rejectedCount = positionCandidates.filter((c) => c.status === 'rejected').length;
  const openJobsCount = activeRequisitions.filter((r) => r.status === 'open' || r.status === 'active').length;
  const topPriorityCount = activeRequisitions.filter((r) => r.hiringCategory === 'top_priority').length;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex font-sans">
      {/* Fixed Left Sidebar with Menu items & User Branding */}
      <Sidebar
        currentTab={currentNavTab}
        onSelectTab={(tab) => {
          setCurrentNavTab(tab);
          if (tab !== 'monthly_kpi_metrics') {
            setFocusedKpiId(null);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        focusedKpiId={focusedKpiId}
        onSelectKpiSegment={(kpiId) => {
          setFocusedKpiId(kpiId);
          setCurrentNavTab('monthly_kpi_metrics');
        }}
        openJobsCount={openJobsCount}
        totalCandidatesCount={candidates.length}
        interviewCount={candidates.filter((c) => c.status === 'interview').length}
        fitCandidatesCount={candidates.filter((c) => c.status === 'selected' || c.status === 'shortlisted').length}
        companyName={companyName}
        onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
        onOpenStandardCriteria={() => setIsStandardCriteriaModalOpen(true)}
        onOpenIndustryPolicy={() => setIsIndustryGuideModalOpen(true)}
        onOpenSalaryMatrix={() => setIsSalaryMatrixModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden bg-[#0d1117]">
        {/* Header with Top-Level Hiring Category & Navigation */}
        <Header
          candidateCount={positionCandidates.length}
          shortlistedCount={shortlistedCount}
          onHoldCount={onHoldCount}
          rejectedCount={rejectedCount}
          onReset={() => {
            if (confirm(`Clear evaluated candidates for "${selectedRequisition.title}"?`)) {
              setCandidates((prev) =>
                prev.filter((c) =>
                  c.requisitionId ? c.requisitionId !== selectedRequisition.id : false
                )
              );
              setSelectedIds([]);
            }
          }}
          onExportExcel={() =>
            exportCandidatesToExcel(
              filteredPositionCandidates.length > 0 ? filteredPositionCandidates : positionCandidates,
              `${selectedRequisition.id}_Candidate_Rankings`,
              blindMode,
              companyName
            )
          }
          onExportCSV={() =>
            exportCandidatesToCSV(
              filteredPositionCandidates.length > 0 ? filteredPositionCandidates : positionCandidates,
              `${selectedRequisition.id}_Candidate_Rankings`,
              blindMode,
              companyName
            )
          }
          onOpenSalaryMatrix={() => setIsSalaryMatrixModalOpen(true)}
          companyName={companyName}
          onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
          onOpenCategoryManager={() => setIsCategoryManagerModalOpen(true)}
          onOpenStandardCriteria={() => setIsStandardCriteriaModalOpen(true)}
          onOpenIndustryPolicy={() => setIsIndustryGuideModalOpen(true)}
          activeSection={activeSection}
          onChangeSection={setActiveSection}
          hiringCategoryFilter={hiringCategoryFilter}
          onChangeHiringCategoryFilter={setHiringCategoryFilter}
          historicalCount={historicalRequisitions.length}
          topPriorityCount={topPriorityCount}
          cloudSyncStatus={cloudSyncStatus}
          lastSyncedTime={lastSyncedTime}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onSyncCloudNow={handleSyncCloudNow}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* VIEW 1: DASHBOARD HOME (Requirement 2 & 3) */}
          {currentNavTab === 'dashboard' && (
            <DashboardHomeView
              activeRequisitions={activeRequisitions}
              historicalRequisitions={historicalRequisitions}
              candidates={candidates}
              onSelectRequisition={(req) => {
                setSelectedRequisitionId(req.id);
                setCurrentNavTab('screening');
              }}
              onNavigateTab={(tab) => setCurrentNavTab(tab)}
              onOpenNewJobModal={() => {
                setTemplateRequisition(null);
                setIsNewRequisitionModalOpen(true);
              }}
              onOpenSalaryMatrix={() => setIsSalaryMatrixModalOpen(true)}
              onOpenIndustryPolicy={() => setIsIndustryGuideModalOpen(true)}
              onOpenCandidateDetail={(cand) => setDetailModalCandidate(cand)}
              onUpdateRequisitionStatus={handleUpdateRequisitionStatus}
              onUpdateRequisitionPriority={(reqId, priority) => {
                handleChangeHiringCategory(reqId, priority);
              }}
              onUpdateRequisition={handleUpdateRequisition}
              onDeletePosition={handleDeletePosition}
              trackerRecords={trackerRecords}
              onAddTrackerRecord={handleAddTrackerRecord}
              onUpdateTrackerRecord={handleUpdateTrackerRecord}
              onDeleteTrackerRecord={handleDeleteTrackerRecord}
              onSaveAllTrackerRecords={handleSaveAllTrackerRecords}
              companyName={companyName}
            />
          )}

          {/* VIEW 2: JOBS MANAGEMENT (Requirement 3) */}
          {currentNavTab === 'jobs' && (
            <JobsManagementView
              activeRequisitions={activeRequisitions}
              historicalRequisitions={historicalRequisitions}
              candidates={candidates}
              onSelectRequisitionForScreening={(req) => {
                setSelectedRequisitionId(req.id);
                setCurrentNavTab('screening');
              }}
              onUpdateRequisitionStatus={handleUpdateRequisitionStatus}
              onUpdateRequisitionPriority={(reqId, priority) => {
                handleChangeHiringCategory(reqId, priority);
              }}
              onCreateRequisition={handleCreateRequisition}
              onUpdateRequisition={handleUpdateRequisition}
              onDeletePosition={handleDeletePosition}
              onOpenNewJobModal={() => {
                setTemplateRequisition(null);
                setIsNewRequisitionModalOpen(true);
              }}
              onOpenArchiveModal={(req) => setArchiveTargetRequisition(req)}
              onNavigateTab={setCurrentNavTab}
            />
          )}

          {/* VIEW 3: MULTI-FORMAT CV SCREENING ENGINE WITH RMG EVALUATION (Requirement 3) */}
          {currentNavTab === 'screening' && (
            <>
              {activeSection === 'history' ? (
                <PreviousHiringDataSection
                  historicalRequisitions={historicalRequisitions}
                  onRestoreRequisition={handleRestoreRequisition}
                  onUseAsTemplate={handleUseAsTemplate}
                  onDeleteHistoricalRequisition={handleDeleteHistoricalRequisition}
                  onOpenCandidateDetail={(cand) => setDetailModalCandidate(cand)}
                  companyName={companyName}
                />
              ) : (
                <ScreeningEngineView
                  activeRequisitions={activeRequisitions}
                  selectedRequisitionId={selectedRequisitionId}
                  onSelectRequisitionId={setSelectedRequisitionId}
                  candidates={candidates}
                  onUpdateCandidateStatus={handleUpdateCandidateStatus}
                  onAddCandidates={(newCands) => {
                    setCandidates((prev) => {
                      const newIds = new Set(newCands.map((c) => c.id));
                      const filteredPrev = prev.filter((c) => !newIds.has(c.id));
                      return [...newCands, ...filteredPrev];
                    });
                  }}
                  onClearCandidates={(reqId) => {
                    setCandidates((prev) =>
                      reqId ? prev.filter((c) => c.requisitionId !== reqId) : []
                    );
                    setSelectedIds([]);
                  }}
                  onOpenCandidateDetail={(cand) => setDetailModalCandidate(cand)}
                  onOpenOfferMemo={(cand) => setMemoModalData({ candidate: cand, mode: 'offer' })}
                  onOpenRejectionNotice={(cand) => setMemoModalData({ candidate: cand, mode: 'rejection' })}
                  onOpenSalaryAdjust={(cand) => {
                    setSalaryAdjustTargetCandidate(cand);
                    setIsBulkSalaryAdjustModalOpen(true);
                  }}
                  onOpenMovePosition={(cand) => setMoveCandidateTarget(cand)}
                  companyName={companyName}
                  onOpenSalaryMatrix={() => setIsSalaryMatrixModalOpen(true)}
                  onOpenIndustryGuide={() => setIsIndustryGuideModalOpen(true)}
                  onOpenStandardCriteria={() => setIsStandardCriteriaModalOpen(true)}
                  onOpenNewJobModal={() => {
                    setTemplateRequisition(null);
                    setIsNewRequisitionModalOpen(true);
                  }}
                  blindMode={blindMode}
                  onToggleBlindMode={() => setBlindMode(!blindMode)}
                  criteriaConfig={criteriaConfig}
                />
              )}
            </>
          )}

          {/* VIEW 4: CANDIDATES DIRECTORY */}
          {currentNavTab === 'candidates' && (
            <CandidatesDirectoryView
              candidates={candidates}
              onOpenCandidateDetail={(cand) => setDetailModalCandidate(cand)}
              onOpenOfferMemo={(cand) => setMemoModalData({ candidate: cand, mode: 'offer' })}
              onOpenRejectionNotice={(cand) => setMemoModalData({ candidate: cand, mode: 'rejection' })}
              onUpdateStatus={handleUpdateCandidateStatus}
              onExportExcel={() =>
                exportCandidatesToExcel(candidates, `${companyName}_All_Candidates`, blindMode, companyName)
              }
              onNavigateTab={setCurrentNavTab}
            />
          )}

          {/* VIEW 5: APPLICATIONS PIPELINE (Legacy fallback) */}
          {currentNavTab === 'applications' && (
            <ApplicationsView
              candidates={candidates}
              onOpenCandidateDetail={(cand) => setDetailModalCandidate(cand)}
              onUpdateStatus={handleUpdateCandidateStatus}
            />
          )}

          {/* VIEW 6: CV BANK */}
          {currentNavTab === 'cv_bank' && (
            <CvBankView
              candidates={candidates}
              activeRequisitions={activeRequisitions}
              onOpenCandidateDetail={(cand) => setDetailModalCandidate(cand)}
              onNavigateTab={setCurrentNavTab}
              onOpenMovePosition={(cand) => setMoveCandidateTarget(cand)}
              blindMode={blindMode}
            />
          )}

          {/* VIEW 7: INTERVIEWS */}
          {currentNavTab === 'interviews' && (
            <InterviewsView
              candidates={candidates}
              companyName={companyName}
              onOpenCandidateDetail={(cand) => setDetailModalCandidate(cand)}
              onUpdateStatus={handleUpdateCandidateStatus}
              onUpdateInterviewDetails={handleUpdateInterviewDetails}
              onNavigateTab={setCurrentNavTab}
            />
          )}

          {/* VIEW 8: REPORTS */}
          {currentNavTab === 'reports' && (
            <ReportsView
              candidates={candidates}
              activeRequisitions={activeRequisitions}
              historicalRequisitions={historicalRequisitions}
              onExportExcel={() =>
                exportCandidatesToExcel(candidates, `${companyName}_Recruitment_Analytics`, blindMode, companyName)
              }
              onExportCSV={() =>
                exportCandidatesToCSV(candidates, `${companyName}_Recruitment_Analytics`, blindMode, companyName)
              }
            />
          )}

          {/* VIEW 9: KPI METRICS - TALENT ACQUISITION (FULL-PAGE ANALYTICS DASHBOARD) */}
          {currentNavTab === 'monthly_kpi_metrics' && (
            <MonthlyKpiMetricsView
              focusedKpiId={focusedKpiId}
              onSelectKpiId={setFocusedKpiId}
              onBackToDashboard={() => {
                setFocusedKpiId(null);
                setCurrentNavTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              companyName={companyName}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <ArchiveRequisitionModal
        isOpen={!!archiveTargetRequisition}
        onClose={() => setArchiveTargetRequisition(null)}
        requisition={archiveTargetRequisition}
        onConfirmArchive={handleConfirmArchiveRequisition}
        candidateNames={positionCandidates.map((c) => c.name)}
      />

      <NewRequisitionModal
        isOpen={isNewRequisitionModalOpen}
        onClose={() => {
          setIsNewRequisitionModalOpen(false);
          setTemplateRequisition(null);
        }}
        onCreateRequisition={handleCreateRequisition}
        templateRequisition={templateRequisition}
        departments={categories}
        existingRequisitionsCount={activeRequisitions.length}
      />

      <MoveCandidateModal
        isOpen={!!moveCandidateTarget}
        onClose={() => setMoveCandidateTarget(null)}
        candidate={moveCandidateTarget}
        activeRequisitions={activeRequisitions}
        onConfirmMove={handleMoveCandidate}
      />

      <SalaryMatrixModal
        isOpen={isSalaryMatrixModalOpen}
        onClose={() => setIsSalaryMatrixModalOpen(false)}
        companyName={companyName}
        salaryMatrix={salaryMatrix}
        onUpdateSalaryMatrix={(updated) => {
          setSalaryMatrix(updated);
          saveSalaryMatrix(updated);
        }}
      />

      <IndustryPolicyModal
        isOpen={isIndustryGuideModalOpen}
        onClose={() => setIsIndustryGuideModalOpen(false)}
        onApplyPolicyToJob={(newJob, badge) => {
          handleChangeJob(newJob);
          setActivePolicyBadge(badge);
        }}
      />

      <StandardCriteriaModal
        isOpen={isStandardCriteriaModalOpen}
        onClose={() => setIsStandardCriteriaModalOpen(false)}
        criteriaConfig={criteriaConfig}
        onSaveCriteriaConfig={(newConfig) => {
          setCriteriaConfig(newConfig);
          saveStoredCriteriaConfig(newConfig);
        }}
      />

      <CategoryManagerModal
        isOpen={isCategoryManagerModalOpen}
        onClose={() => setIsCategoryManagerModalOpen(false)}
        categories={categories}
        onUpdateCategories={setCategories}
      />

      <BulkActionLogModal
        isOpen={isBulkActionLogModalOpen}
        onClose={() => setIsBulkActionLogModalOpen(false)}
        logs={auditLogs}
        onRollback={handleRollback}
        onClearLogs={() => {
          saveBulkActionLogs([]);
          setAuditLogs([]);
        }}
        companyName={companyName}
      />

      <BulkSalaryAdjustModal
        isOpen={isBulkSalaryAdjustModalOpen}
        onClose={() => {
          setIsBulkSalaryAdjustModalOpen(false);
          setSalaryAdjustTargetCandidate(null);
        }}
        selectedCandidates={candidates.filter((c) => selectedIds.includes(c.id))}
        onApplyAdjustment={handleApplySalaryAdjustment}
        singleCandidate={salaryAdjustTargetCandidate}
      />

      <OfferRejectionModal
        isOpen={!!memoModalData}
        onClose={() => setMemoModalData(null)}
        candidate={memoModalData?.candidate || null}
        mode={memoModalData?.mode || 'offer'}
        companyName={companyName}
      />

      <CandidateDetailModal
        isOpen={!!detailModalCandidate}
        onClose={() => setDetailModalCandidate(null)}
        candidate={detailModalCandidate}
        companyName={companyName}
        blindMode={blindMode}
        onUpdateStatus={(newStatus) => {
          if (detailModalCandidate) {
            handleUpdateCandidateStatus(detailModalCandidate.id, newStatus);
            setDetailModalCandidate({ ...detailModalCandidate, status: newStatus });
          }
        }}
      />

      <EditCompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        currentCompanyName={companyName}
        onSaveCompanyName={setCompanyName}
      />

      <WorkspaceSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        cloudSyncStatus={cloudSyncStatus}
        lastSyncedTime={lastSyncedTime}
        onSyncCloudNow={handleSyncCloudNow}
        onExportWorkspaceJSON={handleExportWorkspaceJSON}
        onImportWorkspaceJSON={handleImportWorkspaceJSON}
        activeRequisitionsCount={activeRequisitions.length}
        candidatesCount={candidates.length}
      />
    </div>
  );
}

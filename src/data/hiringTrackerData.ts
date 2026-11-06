/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HiringTrackerStatus = 'RUNNING' | 'WAITING' | 'ON - HOLD' | 'CLOSED' | 'DONE';

export interface HiringTrackerRecord {
  id: string;
  sl: number;
  requisitionNo: string;
  position: string;
  division: string;
  department: string;
  totalResumes: number | string;
  conducted: number | string;
  shortlisted: number | string;
  replacementEmployee: string;
  finalizedEmployee: string;
  finalizedSalary: string;
  joiningDate: string;
  currentStatus: HiringTrackerStatus;
  remarks: string;
  requisitionId?: string;
  updatedAt?: string;
  isModified?: boolean;
}

export function normalizeDesignationTitle(title: string): string {
  if (!title) return title;
  let t = title.trim();
  const exactMap: Record<string, string> = {
    'SR. GM': 'Senior General Manager',
    'SR GM': 'Senior General Manager',
    'GM': 'General Manager',
    'DGM': 'Deputy General Manager',
    'AGM': 'Assistant General Manager',
    'SR. MANAGER': 'Senior Manager',
    'DEP. MANAGER': 'Deputy Manager',
    'ASST. MANAGER': 'Assistant Manager',
    'SR. EXECUTIVE': 'Senior Executive',
    'ASST. EXECUTIVE': 'Assistant Executive',
    'SR. SUPERVISOR': 'Senior Supervisor',
    'ASST. SUPERVISOR': 'Assistant Supervisor',
    'SR. QUALITY CONTROL OFFICER': 'Senior Quality Control Officer',
    'ASST. QUALITY CONTROL OFFICER': 'Assistant Quality Control Officer',
    'SR. QUALITY AUDITOR': 'Senior Quality Auditor',
    'ASST. QUALITY AUDITOR': 'Assistant Quality Auditor',
    'SR. MERCHANDISER': 'Senior Merchandiser',
    'ASST. MERCHANDISER': 'Assistant Merchandiser',
    'SR. DESIGNER': 'Senior Designer',
    'ASST. DESIGNER': 'Assistant Designer',
    'SR. CAD MASTER': 'Senior CAD Master',
    'ASST. CAD MASTER': 'Assistant CAD Master',
    'SR. TECHNICIAN': 'Senior Technician',
    'ASST. TECHNICIAN': 'Assistant Technician',
    'SR. SAMPLE SUPERVISOR': 'Senior Sample Supervisor',
    'ASST. SAMPLE SUPERVISOR': 'Assistant Sample Supervisor',
    'SR. CUTTER SUPERVISOR': 'Senior Cutter Supervisor',
    'ASST. CUTTER SUPERVISOR': 'Assistant Cutter Supervisor',
    'SR. MARKER SUPERVISOR': 'Senior Marker Supervisor',
    'ASST. MARKER SUPERVISOR': 'Assistant Marker Supervisor',
    'SR. BOILER OPERATOR': 'Senior Boiler Operator',
    'ASST. BOILER OPERATOR': 'Assistant Boiler Operator',
    'ASST. PRODUCTION REPORTER': 'Assistant Production Reporter',
    'JR. SECURITY GUARD': 'Junior Security Guard',
  };
  const upper = t.toUpperCase();
  if (exactMap[upper]) return exactMap[upper];

  t = t
    .replace(/\bSR\.?\s+/gi, 'Senior ')
    .replace(/\bASST\.?\s+/gi, 'Assistant ')
    .replace(/\bDEP\.?\s+/gi, 'Deputy ')
    .replace(/\bJR\.?\s+/gi, 'Junior ')
    .replace(/\bDGM\b/gi, 'Deputy General Manager')
    .replace(/\bAGM\b/gi, 'Assistant General Manager')
    .replace(/\bGM\b/gi, 'General Manager');

  return t;
}

export const MASTER_POSITIONS: string[] = [
  'Senior General Manager',
  'General Manager',
  'Deputy General Manager',
  'Assistant General Manager',
  'Senior Manager',
  'Manager',
  'Deputy Manager',
  'Assistant Manager',
  'Senior Supervisor',
  'Supervisor',
  'Assistant Supervisor',
  'Senior Quality Control Officer',
  'Assistant Quality Control Officer',
  'Senior Quality Auditor',
  'Assistant Quality Auditor',
  'Quality Control Officer',
  'Quality Auditor',
  'Senior Merchandiser',
  'Assistant Merchandiser',
  'Merchandiser',
  'Senior Designer',
  'Assistant Designer',
  'Designer',
  'Senior CAD Master',
  'Assistant CAD Master',
  'CAD Master',
  'Senior Technician',
  'Assistant Technician',
  'Technician',
  'Senior Executive',
  'Assistant Executive',
  'Executive',
  'Trainee',
  'Senior Sample Supervisor',
  'Assistant Sample Supervisor',
  'Sample Supervisor',
  'Senior Cutter Supervisor',
  'Assistant Cutter Supervisor',
  'Cutter Supervisor',
  'Senior Marker Supervisor',
  'Assistant Marker Supervisor',
  'Marker Supervisor',
  'Senior Boiler Operator',
  'Assistant Boiler Operator',
  'Boiler Operator',
  'Assistant Production Reporter',
  'Production Reporter',
  'Junior Security Guard',
  'Security Guard',
  'In Charge',
  'Line Control Officer',
  'Doctor',
  'Nurse',
  'Medical Assistant',
  'Welfare Officer',
  'Safety Officer',
  'Day Care Executive',
  'Receptionist',
  'Checker',
  'Cook',
  'Peon',
  'Gardener',
  'Canteen Boy',
  'Cleaner',
  'Sweeper',
  'Loader/Labour',
  'Associate',
  'Driver (Heavy)',
  'Driver (Light)',
];

export const MASTER_DIVISIONS: string[] = [
  'Production',
  'HRAC',
  'Finance & Accounts',
  'Merchandising',
  'Quality Assurance',
  'Cad & Sample',
  'Commercial',
  'Planning',
  'ERP & MIS',
  'ICT',
  'Engineering',
  'Fashion Designing',
  'IE',
  'EMBROIDERY',
  'Wash',
];

export const MASTER_DEPARTMENTS: string[] = [
  'Sweing',
  'Finishing',
  'Cutting',
  'HR',
  'Administration',
  'Wet Process',
  'Dry Process',
  'Transport',
  'Store',
  'Security',
  'Sample',
  'CAD',
  'QS',
  'GPQ',
  'Quality Assurance',
  'EMBROIDERY',
  'Procurement',
  'Planning',
  'IE',
  'Merchandising - 1',
  'Merchandising - 2',
  'ERP & MIS',
  'Admin',
  'Export',
  'Import',
  'Bank',
  'Medical',
  'Electrical',
  'Mechanical',
  'Maintenance',
];

export const STATUS_CONFIG: Record<
  HiringTrackerStatus,
  { label: string; bg: string; text: string; border: string; hex: string }
> = {
  RUNNING: {
    label: 'RUNNING',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
    hex: '#F59E0B',
  },
  WAITING: {
    label: 'WAITING',
    bg: 'bg-sky-500/15',
    text: 'text-sky-300',
    border: 'border-sky-500/40',
    hex: '#0284C7',
  },
  'ON - HOLD': {
    label: 'ON - HOLD',
    bg: 'bg-orange-500/15',
    text: 'text-orange-300',
    border: 'border-orange-500/40',
    hex: '#EA580C',
  },
  CLOSED: {
    label: 'CLOSED',
    bg: 'bg-slate-500/20',
    text: 'text-slate-300',
    border: 'border-slate-500/40',
    hex: '#64748B',
  },
  DONE: {
    label: 'DONE',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
    hex: '#10B981',
  },
};

export const STORAGE_HIRING_TRACKER_KEY = 'rmg_hiring_tracker_records_v2';

export const INITIAL_TRACKER_RECORDS: HiringTrackerRecord[] = [];

export function getStoredTrackerRecords(): HiringTrackerRecord[] {
  try {
    localStorage.removeItem('rmg_hiring_tracker_records_v1');
    const raw = localStorage.getItem(STORAGE_HIRING_TRACKER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => ({
          ...item,
          sl: item.sl || idx + 1,
          requisitionNo: item.requisitionNo || '',
          position: normalizeDesignationTitle(item.position || ''),
          currentStatus: item.currentStatus || 'RUNNING',
        }));
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored hiring tracker records:', err);
  }
  return [];
}

export function saveStoredTrackerRecords(records: HiringTrackerRecord[]): void {
  try {
    localStorage.setItem(STORAGE_HIRING_TRACKER_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save hiring tracker records to localStorage:', err);
  }
}

export function mapReqStatusToTrackerStatus(status?: string): HiringTrackerStatus {
  switch (status) {
    case 'on_hold':
      return 'ON - HOLD';
    case 'closed':
    case 'cancelled':
      return 'CLOSED';
    case 'filled':
      return 'DONE';
    case 'open':
    case 'active':
    default:
      return 'RUNNING';
  }
}

export function mapTrackerStatusToReqStatus(status?: HiringTrackerStatus): 'open' | 'on_hold' | 'closed' | 'filled' {
  switch (status) {
    case 'ON - HOLD':
      return 'on_hold';
    case 'CLOSED':
      return 'closed';
    case 'DONE':
      return 'filled';
    case 'RUNNING':
    case 'WAITING':
    default:
      return 'open';
  }
}

export function inferDivisionFromDepartment(dept?: string): string {
  if (!dept) return 'Merchandising';
  const d = dept.toLowerCase();
  if (d.includes('merchandis')) return 'Merchandising';
  if (d.includes('sweing') || d.includes('sewing') || d.includes('cutting') || d.includes('finishing')) return 'Production';
  if (d.includes('quality') || d === 'qs' || d === 'gpq') return 'Quality Assurance';
  if (d.includes('cad') || d.includes('sample')) return 'Cad & Sample';
  if (d.includes('hr') || d.includes('admin') || d.includes('security') || d.includes('medical') || d.includes('transport')) return 'HRAC';
  if (d.includes('wet') || d.includes('dry')) return 'Wash';
  if (d.includes('embroidery')) return 'EMBROIDERY';
  if (d.includes('planning')) return 'Planning';
  if (d === 'ie') return 'IE';
  if (d.includes('erp') || d.includes('mis')) return 'ERP & MIS';
  if (d.includes('export') || d.includes('import') || d.includes('procurement') || d.includes('store')) return 'Commercial';
  if (d.includes('bank')) return 'Finance & Accounts';
  if (d.includes('electrical') || d.includes('mechanical') || d.includes('maintenance')) return 'Engineering';
  return 'Merchandising';
}


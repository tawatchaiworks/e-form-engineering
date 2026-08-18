import { EEngineerRequest, StaffMember, EngineerInquiry, AuditLog, EngineerDailyAttendance } from '../types';
import { INITIAL_REQUESTS, INITIAL_STAFF, INITIAL_INQUIRIES, INITIAL_ATTENDANCE } from '../data/initialData';

const STORAGE_KEYS = {
  REQUESTS: 'lumencraft_e_engineer_requests_v1',
  STAFF: 'lumencraft_staff_members_v1',
  INQUIRIES: 'lumencraft_engineer_inquiries_v1',
  ATTENDANCE: 'lumencraft_engineer_attendance_v1',
  LAST_DOC_INDEX: 'lumencraft_last_doc_index_v1',
};

export const getStoredRequests = (): EEngineerRequest[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
      return INITIAL_REQUESTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading requests from storage', err);
    return INITIAL_REQUESTS;
  }
};

export const saveRequests = (requests: EEngineerRequest[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  } catch (err) {
    console.error('Error saving requests', err);
  }
};
export const saveStoredRequests = saveRequests;

export const getStoredStaff = (): StaffMember[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
      return INITIAL_STAFF;
    }
    const parsed: StaffMember[] = JSON.parse(raw);
    const enriched = parsed.map(p => {
      const match = INITIAL_STAFF.find(init => init.id === p.id || init.name === p.name);
      return {
        ...p,
        role: p.role || match?.role || (p.team === 'Engineer' ? 'วิศวกรบริการเทคนิค' : p.team === 'Admin Sale' ? 'เจ้าหน้าที่ธุรการขาย' : p.team === 'SALE MANAGER' ? 'ผู้จัดการฝ่ายขาย' : 'เจ้าหน้าที่ฝ่ายขาย'),
        department: p.department || match?.department || (p.team === 'Engineer' ? 'แผนกวิศวกรรมและบริการเทคนิค (Engineering)' : p.team === 'Admin Sale' ? 'แผนกธุรการและประสานงานขาย (Admin Sales)' : p.team === 'SALE MANAGER' ? 'แผนกบริหารการขาย (Sales Management)' : 'แผนกงานขายโครงการ (Sales Department)'),
      };
    });
    return enriched;
  } catch (err) {
    console.error('Error reading staff from storage', err);
    return INITIAL_STAFF;
  }
};

export const saveStaff = (staff: StaffMember[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  } catch (err) {
    console.error('Error saving staff', err);
  }
};
export const saveStoredStaff = saveStaff;

export const getStoredInquiries = (): EngineerInquiry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(INITIAL_INQUIRIES));
      return INITIAL_INQUIRIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading inquiries from storage', err);
    return INITIAL_INQUIRIES;
  }
};

export const saveInquiries = (inquiries: EngineerInquiry[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
  } catch (err) {
    console.error('Error saving inquiries', err);
  }
};
export const saveStoredInquiries = saveInquiries;

export const getStoredAttendance = (): EngineerDailyAttendance[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
      return INITIAL_ATTENDANCE;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading attendance from storage', err);
    return INITIAL_ATTENDANCE;
  }
};

export const saveAttendance = (records: EngineerDailyAttendance[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving attendance', err);
  }
};
export const saveStoredAttendance = saveAttendance;

export const resetToInitialData = () => {
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
  localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(INITIAL_INQUIRIES));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
};


export const generateNextDocNumber = (requests: EEngineerRequest[]): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePrefix = `E-${year}${month}${day}`;

  const todayRequests = requests.filter(r => r.docNumber && r.docNumber.startsWith(datePrefix));
  const count = todayRequests.length + 1;
  return `${datePrefix}-${String(count).padStart(3, '0')}`;
};

export const createAuditLog = (
  action: string,
  actor: string,
  role: string,
  details: string
): AuditLog => {
  const now = new Date();
  const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: ts,
    action,
    actor,
    role,
    details
  };
};

export const getDaysOverdue = (targetOrDeadlineDate: string): number => {
  if (!targetOrDeadlineDate) return 0;
  const target = new Date(targetOrDeadlineDate);
  const now = new Date();
  // Set to midnight for clean comparison
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = now.getTime() - target.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const isOneDayBefore = (targetDate: string): boolean => {
  if (!targetDate) return false;
  const target = new Date(targetDate);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1; // 1 day remaining
};

export type Role = 'admin_sale' | 'sale' | 'engineer' | 'customer' | 'dashboard' | 'staff' | 'logs';

export type Priority = 'alert_emergency' | 'alert_urgent' | 'alert_normal';

export type RequestStatus = 
  | 'draft'
  | 'pending_sale_sign'      // Admin submitted, waiting for Sale to sign & submit to Engineer
  | 'pending_engineer_accept' // Sale submitted, waiting for Engineer to accept/reschedule/cancel
  | 'engineer_rejected'       // Engineer rejected/returned to Sale with reason
  | 'engineer_rescheduled'    // Engineer proposed new date, waiting for Sale approval
  | 'ready_for_site'          // Agreed date, waiting for Engineer check-in on site
  | 'in_progress'             // Engineer checked in and currently working
  | 'completed_by_engineer'   // Work completed by engineer, waiting for Customer Evaluation
  | 'completed_by_customer'   // Customer evaluated, waiting for Sale final 5D evaluation & close
  | 'closed'                  // Sale gave final 5D rating & closed
  | 'cancelled';

export interface WorkCategorySelection {
  service: boolean;
  serviceNote: string; // max 100
  countingDrawing: boolean;
  countingDrawingNote: string; // max 100
  meetingOrMockup: boolean;
  meetingOrMockupNote: string; // max 100
  claimProduct: boolean;
  claimProductNote: string; // max 100
}

export interface AttachmentItem {
  id: string;
  name: string;
  size: number;
  type: 'drawing' | 'photo' | 'video' | 'document' | 'report' | 'other';
  url: string;
  fileData?: string; // Persistent Base64 Data URL
  mimeType?: string;
  description?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface WorkPhotoItem {
  id: string;
  url: string;           // Persistent Base64 Data URL or preview URL
  fileData?: string;
  name: string;
  size: number;
  stage: 'before' | 'after'; // 'before' (ก่อนแก้ไข) | 'after' (หลังแก้ไข)
  description: string;   // กล่องอธิบายรายละเอียดใต้รูป (max 150 ตัวอักษร)
  uploadedAt: string;
  uploadedBy?: string;
}


export interface DigitalSignature {
  signerName: string;
  role: string;
  signatureDataUrl: string;
  signedAt: string;
  remark?: string;
}

export interface CustomerEvaluation {
  grooming: number;      // 1-5 (การแต่งกายสุภาพและอุปกรณ์ความปลอดภัย)
  knowledge: number;     // 1-5 (ความรู้และความเชี่ยวชาญในงาน)
  problemSolving: number;// 1-5 (การแก้ปัญหาเฉพาะหน้าและความพร้อม)
  manner: number;        // 1-5 (มารยาทและการสื่อสาร)
  responsiveness: number;// 1-5 (ความรวดเร็วและการตอบสนอง)
  feedback: string;      // max 300
  submittedAt: string;
  averageScore?: number;
  evaluatedAt?: string;
  speedScore?: number;
  qualityScore?: number;
  serviceScore?: number;
  comment?: string;
}

export interface SalesEvaluation {
  communication: number; // 1-5 การสื่อสาร
  punctuality: number;   // 1-5 ตรงต่อเวลา
  quality: number;       // 1-5 คุณภาพงาน
  problemSolving: number;// 1-5 แก้ปัญหา
  overall: number;       // 1-5 ภาพรวม
  description: string;   // max 200
  evaluatedAt: string;
}

export interface CheckInData {
  latitude: number;
  longitude: number;
  address: string;
  checkInTime: string;
  photoUrl?: string;
  engineerName: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  role: string;
  details: string;
}

export interface EngineerInquiry {
  id: string;
  requestId?: string;
  soNumber: string;
  projectName: string;
  engineerName: string;
  salesName: string;
  message: string;       // max 300
  createdAt: string;
  replyMessage?: string; // max 300
  replyAttachment?: string;
  replySignature?: string;
  repliedAt?: string;
  status: 'pending' | 'replied';
}

export interface EEngineerRequest {
  id: string;
  docNumber: string;         // e.g. E-20260816-001
  soNumber: string;          // SO NO.
  requestDate: string;       // วันที่ร้องขอ
  targetDate: string;        // วันที่ต้องการให้เข้า
  targetTime?: string;       // เวลาที่ต้องการให้เข้า
  deadlineDate: string;      // กำหนดเสร็จ
  customerName: string;      // ชื่อลูกค้า
  projectName: string;       // ชื่อโครงการ
  siteContactName: string;   // ผู้ติดต่อหน้างาน
  siteContactPhone: string;  // เบอร์โทร
  siteContactEmail: string;  // อีเมล
  salesOwner: string;        // เซลล์เจ้าของงาน
  adminRequester: string;    // แอดมินผู้ร้องขอ
  
  categories: WorkCategorySelection;
  priority: Priority;
  workDetails: string;       // max 200 char
  
  needReport: boolean;
  customerReportEmail?: string;
  
  serverShareDriveLink?: string;
  attachments: AttachmentItem[];
  
  assignedEngineer?: string; // พัด, โชค, วิน, วัฒน์
  
  status: RequestStatus;
  
  // Engineer scheduling / rejection notes
  engineerRescheduledBy?: string;
  engineerRescheduleDate?: string;
  engineerRescheduleReason?: string;
  engineerSitePreparation?: string; // สิ่งที่หน้างานต้องเตรียม
  engineerRejectReason?: string;
  
  // Sales resubmit note after rejection
  salesResubmitNote?: string; // max 100
  
  // Check-in info
  checkInData?: CheckInData;
  
  // Work Photos (รูปภาพก่อนแก้ไข และ หลังแก้ไข พร้อมคำอธิบาย 150 ตัวอักษร)
  workPhotos?: WorkPhotoItem[];
  
  // Signatures (4 Parties)
  adminSignature?: DigitalSignature;
  salesSignature?: DigitalSignature;
  engineerSignature?: DigitalSignature;
  customerSignature?: DigitalSignature;
  salesFinalSignature?: DigitalSignature;
  
  // Evaluations
  customerEvaluation?: CustomerEvaluation;
  salesEvaluation?: SalesEvaluation;
  
  // Acknowledgements & flags
  sales1DayAck?: boolean;
  
  // Audit Trail
  history: AuditLog[];
  
  createdAt: string;
  updatedAt: string;
}

export type StaffTeam = 'Admin Sale' | 'Engineer' | 'SALE' | 'SALE MANAGER';
export type StaffWorkStatus = 'available' | 'busy' | 'waiting' | 'offline' | 'active' | 'leave';

export interface StaffMember {
  id: string;
  name: string;
  team: StaffTeam;
  phone: string;
  email?: string;
  role?: string;
  workStatus: StaffWorkStatus; // สำหรับ Engineer: available (ว่าง=เขียว), waiting (รองาน=เหลือง), busy (กำลังทำงาน=แดง)
  currentTask?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    siteName: string;
    updatedAt: string;
  };
}

export interface AttendanceSession {
  sessionNumber: number; // 1, 2, 3, 4 (ครั้งที่ 1, ครั้งที่ 2, ครั้งที่ 3, ครั้งที่ 4)
  checkInTime: string; // e.g. "08:30 น."
  checkInLocation?: string;
  checkOutTime?: string; // e.g. "12:00 น."
  checkOutLocation?: string;
  duration?: string; // e.g. "3 ชม. 30 นาที"
  status?: 'checked_in' | 'completed';
  notes?: string;
}

export interface EngineerDailyAttendance {
  id: string;
  engineerId: string;
  engineerName: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // e.g. "08:30 น." (First or Latest check-in)
  checkOutTime?: string; // e.g. "17:30 น." (Latest check-out)
  checkInLocation?: string;
  checkOutLocation?: string;
  totalHours?: string;
  status: 'checked_in' | 'working' | 'completed' | 'not_started' | 'leave';
  notes?: string;
  sessions?: AttendanceSession[]; // Log เวลา check-in และ check-out ทุกครั้ง แยกเป็นครั้งที่ 1, ครั้งที่ 2, ครั้งที่ 3, ครั้งที่ 4 (ไม่ถูกแทนที่)
}


import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, AlertCircle, Clock, Calendar, CheckCircle2,
  MapPin, Send, MessageSquare, Star, User, ChevronRight, PenTool, Check,
  Info, ExternalLink, RefreshCw, X, Radio, Eye, EyeOff, Printer, FileText,
  FileCode, Image as ImageIcon, Film, File, Camera, ZoomIn,
  Lock, Unlock, KeyRound, LogOut, Zap, UserCheck
} from 'lucide-react';
import { 
  EEngineerRequest, StaffMember, EngineerInquiry, 
  DigitalSignature, SalesEvaluation, AttachmentItem, WorkPhotoItem 
} from '../types';
import { SignaturePad } from './SignaturePad';
import { getDaysOverdue, isOneDayBefore, createAuditLog } from '../utils/storage';
import { FileViewerModal } from './FileViewerModal';
import { DocumentPrintModal } from './DocumentPrintModal';

interface SalesHubProps {
  requests: EEngineerRequest[];
  staff: StaffMember[];
  inquiries: EngineerInquiry[];
  onUpdateRequest: (updated: EEngineerRequest) => void;
  onSendInquiry: (inquiry: EngineerInquiry) => void;
  onOpenCalendar: () => void;
  onOpenStatus: () => void;
  onOpenLocation: () => void;
}

export const SalesHub: React.FC<SalesHubProps> = ({
  requests,
  staff,
  inquiries,
  onUpdateRequest,
  onSendInquiry,
  onOpenCalendar,
  onOpenStatus,
  onOpenLocation,
}) => {
  // Security Authentication State (user: Sale, password: Sale) - auto-signs out when leaving page
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    const user = usernameInput.trim();
    const pass = passwordInput.trim();

    if (user.toLowerCase() === 'sale' && pass.toLowerCase() === 'sale') {
      setIsAuthorized(true);
      setAuthError(null);
    } else {
      setAuthError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
    setIsSubmitting(false);
  };

  const handleSignOut = () => {
    setIsAuthorized(false);
    setUsernameInput('');
    setPasswordInput('');
    setAuthError(null);
  };

  const [selectedSalesPerson, setSelectedSalesPerson] = useState<string>('all');
  
  // Modals / Action states
  const [signingRequestId, setSigningRequestId] = useState<string | null>(null);
  const [assignedEngineerName, setAssignedEngineerName] = useState<string>('พัด');
  const [tempSignatureUrl, setTempSignatureUrl] = useState<string>('');

  // Photo Zoom Lightbox modal state
  const [activeZoomPhoto, setActiveZoomPhoto] = useState<WorkPhotoItem | null>(null);

  // File Viewer modal state
  const [activeViewerRequest, setActiveViewerRequest] = useState<EEngineerRequest | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  // Document print modal state
  const [printDocRequest, setPrintDocRequest] = useState<EEngineerRequest | null>(null);

  // Resubmit rejected state
  const [resubmitRequestId, setResubmitRequestId] = useState<string | null>(null);
  const [resubmitMessage, setResubmitMessage] = useState<string>('');

  // Reschedule counter-proposal state
  const [rescheduleNegotiateId, setRescheduleNegotiateId] = useState<string | null>(null);
  const [counterDate, setCounterDate] = useState<string>('');

  // 5D Sales Evaluation & Final Close state
  const [evaluatingRequestId, setEvaluatingRequestId] = useState<string | null>(null);
  const [salesEval, setSalesEval] = useState<SalesEvaluation>({
    communication: 5,
    punctuality: 5,
    quality: 5,
    problemSolving: 5,
    overall: 5,
    description: '',
    evaluatedAt: '',
  });

  // Inquiry Form state
  const [inquirySoNumber, setInquirySoNumber] = useState('');
  const [inquiryProjectName, setInquiryProjectName] = useState('');
  const [inquiryEngineer, setInquiryEngineer] = useState('พัด');
  const [inquirySalesName, setInquirySalesName] = useState('คุณกุ้ง');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySuccessToast, setInquirySuccessToast] = useState(false);

  const salesStaff = staff.filter(s => s.team === 'SALE' || s.team === 'SALE MANAGER');
  const engineers = staff.filter(s => s.team === 'Engineer');

  // Filter requests by sales person
  const filteredRequests = requests.filter(r => {
    if (selectedSalesPerson === 'all') return true;
    return r.salesOwner === selectedSalesPerson;
  });

  // 1. กล่องแดง: งานใหม่รอลงนาม (status: pending_sale_sign)
  const newPendingSignRequests = filteredRequests.filter(r => r.status === 'pending_sale_sign');

  // 2. กล่องแดง: งานถูกปฏิเสธ/ส่งคืน (status: engineer_rejected)
  const rejectedRequests = filteredRequests.filter(r => r.status === 'engineer_rejected');

  // 3. กล่องฟ้า: วิศวกรกำหนดวันแล้วเสร็จ/ขอเลื่อน (status: engineer_rescheduled)
  const rescheduledRequests = filteredRequests.filter(r => r.status === 'engineer_rescheduled');

  // 4. กล่องเหลือง: รอวิศวกรลงพื้นที่ (status: ready_for_site)
  const readyForSiteRequests = filteredRequests.filter(r => r.status === 'ready_for_site');

  // 5. กล่องแดง: แจ้งเตือนล่วงหน้า 1 วัน (status: ready_for_site & targetDate is tomorrow & not acknowledged)
  const oneDayWarningRequests = filteredRequests.filter(r => {
    return r.status === 'ready_for_site' && isOneDayBefore(r.targetDate) && !r.sales1DayAck;
  });

  // 6. กล่องแดง: แจ้งเตือนเลยกำหนด Overdue (deadline/target passed & not closed/completed)
  const overdueRequests = filteredRequests.filter(r => {
    if (r.status === 'closed' || r.status === 'completed_by_customer' || r.status === 'cancelled') return false;
    return getDaysOverdue(r.deadlineDate || r.targetDate) > 0;
  });

  // 7. กล่องเขียว: วิศวกรส่งมอบงานแล้ว (status: completed_by_engineer หรือ completed_by_customer)
  const completedByEngineerRequests = filteredRequests.filter(r => r.status === 'completed_by_engineer' || r.status === 'completed_by_customer');

  // Action: Sales Sign & Assign to Engineer
  const handleConfirmSalesSign = (req: EEngineerRequest) => {
    if (!tempSignatureUrl) {
      alert('กรุณาลงนามดิจิทัลก่อนส่งมอบงานให้วิศวกร');
      return;
    }

    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    const updated: EEngineerRequest = {
      ...req,
      assignedEngineer: assignedEngineerName,
      status: 'pending_engineer_accept',
      salesSignature: {
        signerName: `${req.salesOwner} (SALE)`,
        role: 'SALE',
        signatureDataUrl: tempSignatureUrl,
        signedAt: timeStr,
      },
      history: [
        ...req.history,
        createAuditLog(
          'ฝ่ายขายลงนามและจ่ายงาน',
          req.salesOwner,
          'SALE',
          `ลงนามและมอบหมายงานให้ ช่าง${assignedEngineerName} รับทราบ`
        )
      ],
      updatedAt: timeStr,
    };

    onUpdateRequest(updated);
    setSigningRequestId(null);
    setTempSignatureUrl('');
  };

  // Action: Resubmit after rejection
  const handleResubmitRejected = (req: EEngineerRequest) => {
    if (!resubmitMessage.trim()) {
      alert('กรุณาระบุข้อความชี้แจง/แก้ไขส่งใหม่ (จำกัด 100 ตัวอักษร)');
      return;
    }

    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    const updated: EEngineerRequest = {
      ...req,
      salesResubmitNote: resubmitMessage.trim(),
      status: 'pending_engineer_accept',
      history: [
        ...req.history,
        createAuditLog(
          'ฝ่ายขายแก้ไขส่งงานใหม่',
          req.salesOwner,
          'SALE',
          `ส่งงานกลับให้วิศวกร: ${resubmitMessage.trim()}`
        )
      ],
      updatedAt: timeStr,
    };

    onUpdateRequest(updated);
    setResubmitRequestId(null);
    setResubmitMessage('');
  };

  // Action: Agree with Engineer Reschedule Date
  const handleAgreeReschedule = (req: EEngineerRequest) => {
    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    const newTarget = req.engineerRescheduleDate || req.targetDate;

    const updated: EEngineerRequest = {
      ...req,
      targetDate: newTarget,
      status: 'ready_for_site',
      history: [
        ...req.history,
        createAuditLog(
          'ฝ่ายขายยินยอมวันนัดหมายใหม่',
          req.salesOwner,
          'SALE',
          `ตกลงตามวันใหม่ที่วิศวกรเสนอ: ${newTarget}`
        )
      ],
      updatedAt: timeStr,
    };

    onUpdateRequest(updated);
  };

  // Action: Counter-Reschedule (แก้ไขวันใหม่)
  const handleCounterReschedule = (req: EEngineerRequest) => {
    if (!counterDate) {
      alert('กรุณาเลือกวันที่ต้องการเปลี่ยน');
      return;
    }

    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    const updated: EEngineerRequest = {
      ...req,
      targetDate: counterDate,
      status: 'pending_engineer_accept',
      history: [
        ...req.history,
        createAuditLog(
          'ฝ่ายขายเสนอเปลี่ยนวันนัดใหม่',
          req.salesOwner,
          'SALE',
          `ส่งกลับให้วิศวกรเพื่อเซ็นรับทราบวันใหม่: ${counterDate}`
        )
      ],
      updatedAt: timeStr,
    };

    onUpdateRequest(updated);
    setRescheduleNegotiateId(null);
    setCounterDate('');
  };

  // Action: Acknowledge 1-day warning
  const handleAck1Day = (req: EEngineerRequest) => {
    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    const updated: EEngineerRequest = {
      ...req,
      sales1DayAck: true,
      updatedAt: timeStr,
    };

    onUpdateRequest(updated);
  };

  // Action: Final 5D Evaluation & Close Job
  const handleFinalClose = (req: EEngineerRequest) => {
    if (!salesEval.description.trim()) {
      alert('กรุณาระบุคำอธิบายการประเมินฝ่ายขาย (จำกัด 200 ตัวอักษร)');
      return;
    }
    if (!tempSignatureUrl) {
      alert('กรุณาลงนามดิจิทัลปิดงานสมบูรณ์');
      return;
    }

    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    const completedEval: SalesEvaluation = {
      ...salesEval,
      evaluatedAt: timeStr,
    };

    const updated: EEngineerRequest = {
      ...req,
      status: 'closed',
      salesEvaluation: completedEval,
      salesFinalSignature: {
        signerName: `${req.salesOwner} (SALE)`,
        role: 'SALE (Final Sign-off)',
        signatureDataUrl: tempSignatureUrl,
        signedAt: timeStr,
      },
      history: [
        ...req.history,
        createAuditLog(
          'ฝ่ายขายประเมิน 5 มิติ & ปิดงานสมบูรณ์',
          req.salesOwner,
          'SALE',
          `ประเมิน 5 มิติ (คะแนนภาพรวม ${salesEval.overall}/5) พร้อมลงนามปิดงานสมบูรณ์`
        )
      ],
      updatedAt: timeStr,
    };

    onUpdateRequest(updated);
    setEvaluatingRequestId(null);
    setTempSignatureUrl('');
  };

  // Action: Send Inquiry to Engineer
  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquirySoNumber.trim() || !inquiryProjectName.trim() || !inquiryMessage.trim()) {
      alert('กรุณากรอก SO NO., ชื่อโครงการ และข้อความสอบถาม');
      return;
    }

    const newInq: EngineerInquiry = {
      id: `inq-${Date.now()}`,
      soNumber: inquirySoNumber.trim().toUpperCase(),
      projectName: inquiryProjectName.trim(),
      engineerName: inquiryEngineer,
      salesName: inquirySalesName,
      message: inquiryMessage.trim(),
      createdAt: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
      status: 'pending',
    };

    onSendInquiry(newInq);
    setInquiryMessage('');
    setInquirySuccessToast(true);
    setTimeout(() => setInquirySuccessToast(false), 4000);
  };

  // 🔒 SALES SECURITY GATE (USER: Sale, PASSWORD: Sale)
  // Automatically signs out when user leaves this page/tab
  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto py-8 sm:py-12 px-4">
        <div className="bg-slate-900 text-white rounded-3xl border-2 border-blue-500/40 shadow-2xl overflow-hidden relative backdrop-blur-xl">
          {/* Background Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

          {/* Security Banner Header */}
          <div className="p-6 sm:p-8 text-center border-b border-slate-800 relative z-10 space-y-3">
            <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/20 via-slate-800 to-indigo-500/20 border border-blue-500/30 text-blue-400 shadow-inner">
              <ShieldCheck className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-wider">
                <Lock className="w-3 h-3 text-blue-400" />
                Sales Access Control (Security Gate)
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                ระบบรักษาความปลอดภัยฝ่ายขาย (Sales Security)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
                หน้านี้สงวนสิทธิ์เฉพาะทีมงานฝ่ายขาย (Sales Team) กรุณากรอกรหัสผ่านเพื่อเข้าใช้งาน
              </p>
            </div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="p-6 sm:p-8 space-y-5 relative z-10">
            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">การยืนยันตัวตนไม่สำเร็จ (Sign In Failed)</div>
                  <div className="text-[11px] text-rose-300 mt-0.5">{authError}</div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                ชื่อผู้ใช้งานฝ่ายขาย (Username) <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  id="sales-username-input"
                  type="text"
                  required
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้งานฝ่ายขาย"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                รหัสผ่าน (Password) <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="sales-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full pl-10 pr-11 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                id="btn-submit-sales-auth"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4 text-amber-300" />
                <span>เข้าสู่ระบบฝ่ายขาย (Sign In)</span>
              </button>
            </div>

            <div className="text-center pt-2 space-y-1">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                ระบบจะ <strong>Sign Out อัตโนมัติ</strong> ทันทีเมื่อท่านเปลี่ยนไปหน้าอื่น
              </p>
              <p className="text-[10px] text-slate-500">
                LUMENCRAFT Sales Access Security • Protocol 2026
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Top Banner & Filter */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-black text-xs">
              Sales Workflow Hub
            </span>
            <span className="text-xs text-slate-400">
              ระบบกล่องเตือน 6 สี & ศูนย์ติดตามสถานะงานบริการ
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            ศูนย์ควบคุมและติดตามงานฝ่ายขาย (Sales 6 Color Alert Hub)
          </h2>
        </div>

        {/* Real-time Modals Buttons & Sales Filter */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Security Sales Status & Sign Out */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-bold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Signed in as: <strong className="text-white">Sale</strong></span>
          </div>

          <button
            id="btn-signout-sales-hub"
            onClick={handleSignOut}
            title="ออกจากระบบฝ่ายขาย (Sign Out)"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/90 text-rose-200 hover:text-white border border-rose-500/40 hover:border-rose-400 text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>ออกจากระบบ (Sign Out)</span>
          </button>
          
          {/* Sales person filter */}
          <select
            value={selectedSalesPerson}
            onChange={e => setSelectedSalesPerson(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">-- กรองตามเซลล์ทุกคน ({salesStaff.length} ท่าน) --</option>
            {salesStaff.map(s => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            id="btn-sales-open-calendar"
            onClick={onOpenCalendar}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 shadow-sm transition"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            ปฏิทิน Engineer
          </button>

          <button
            id="btn-sales-open-status"
            onClick={onOpenStatus}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 shadow-sm transition"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            สถานะช่าง Live
          </button>

          <button
            id="btn-sales-open-location"
            onClick={onOpenLocation}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 shadow-sm transition"
          >
            <MapPin className="w-3.5 h-3.5 mr-1.5" />
            พิกัด GPS
          </button>

        </div>
      </div>

      {/* 6 COLOR ALERT BOXES SECTION */}
      <div className="space-y-4">
        
        {/* ======================================================== */}
        {/* 1. 🛑 กล่องแดง (งานใหม่รอลงนาม): Pending Sale Sign */}
        {/* ======================================================== */}
        {newPendingSignRequests.length > 0 && (
          <div className="border-2 border-red-500 bg-red-50/70 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-red-700 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
                🛑 กล่องแดง: งานใหม่รอฝ่ายขายลงนาม ({newPendingSignRequests.length} รายการ)
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-200 text-red-800 font-bold">
                Action Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newPendingSignRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-red-200 p-4 shadow-sm space-y-3">
                  
                  {/* SO Number and Document No Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-600 text-white font-black text-xs tracking-wider shadow-sm">
                          <span className="text-[10px] text-red-200 uppercase font-semibold">SO:</span>
                          <span className="text-sm font-mono">{req.soNumber}</span>
                        </span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded font-mono bg-slate-100 text-slate-700 border border-slate-200">
                          {req.docNumber}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{req.projectName}</h4>
                      <p className="text-xs text-slate-500">{req.customerName}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPrintDocRequest(req)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 shrink-0"
                      title="เปิดดูและสั่งพิมพ์เอกสาร A4 ฉบับสมบูรณ์"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">เอกสาร A4</span>
                    </button>
                  </div>

                  {/* 🌟 BLINKING SALES OWNER BADGE (กระพริบเพื่อแสดงให้เห็นว่างานใคร) 🌟 */}
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 text-white shadow-md animate-pulse">
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                        <span className="font-extrabold text-xs">เซลล์เจ้าของงาน:</span>
                        <span className="px-2.5 py-0.5 rounded-md bg-white text-red-700 font-black text-xs shadow-xs tracking-wide">
                          คุณ{req.salesOwner}
                        </span>
                      </div>
                      <span className="text-[11px] font-black bg-black/30 px-2.5 py-0.5 rounded-full border border-white/40 tracking-wide animate-bounce">
                        🔔 งานของคุณ
                      </span>
                    </div>
                  </div>

                  {/* Request Detail Body */}
                  <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-slate-700">
                    <div><span className="font-semibold text-slate-900">แอดมินผู้ขอ:</span> {req.adminRequester}</div>
                    <div><span className="font-semibold text-slate-900">วันที่ต้องการเข้า:</span> {req.targetDate}</div>
                    <div className="text-slate-600 line-clamp-2"><span className="font-semibold text-slate-900">รายละเอียดงาน:</span> {req.workDetails}</div>
                    
                    {/* 📁 ATTACHED FILES & DRAWINGS LIST (ไฟลล์ที่แนบมาด้วย) */}
                    {((req.attachments && req.attachments.length > 0) || req.serverShareDriveLink) && (
                      <div className="pt-2.5 border-t border-slate-200 mt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span className="flex items-center gap-1.5 text-blue-700">
                            <FileText className="w-3.5 h-3.5" /> ไฟลล์ที่แนบมาด้วย ({req.attachments?.length || 0} ไฟล์):
                          </span>
                          <span className="text-[11px] text-amber-600 font-bold">💡 คลิกดู / สั่งพิมพ์</span>
                        </div>

                        {req.serverShareDriveLink && (
                          <div className="text-[11px] text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-200 flex items-center gap-1.5 truncate">
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="font-bold">ลิงก์ Drive:</span>
                            <a href={req.serverShareDriveLink} target="_blank" rel="noreferrer" className="underline truncate font-semibold">
                              {req.serverShareDriveLink}
                            </a>
                          </div>
                        )}

                        {req.attachments && req.attachments.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {req.attachments.map((att, idx) => {
                              const isImg = att.type === 'photo' || (att.fileData && att.fileData.startsWith('data:image/')) || att.url?.startsWith('data:image/');
                              return (
                                <div
                                  key={att.id || idx}
                                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-amber-400 transition"
                                >
                                  <div
                                    onClick={() => {
                                      setActiveViewerRequest(req);
                                      setActiveFileIndex(idx);
                                    }}
                                    className="flex items-center space-x-2 truncate cursor-pointer flex-1 mr-1.5"
                                    title="คลิกเพื่อเปิดดูไฟล์นี้และสั่งพิมพ์"
                                  >
                                    {isImg && (att.fileData || att.url) ? (
                                      <img src={att.fileData || att.url} alt="" className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0" />
                                    ) : att.type === 'drawing' ? (
                                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                        <FileCode className="w-4 h-4" />
                                      </div>
                                    ) : att.type === 'photo' ? (
                                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                        <ImageIcon className="w-4 h-4" />
                                      </div>
                                    ) : att.type === 'video' ? (
                                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                        <Film className="w-4 h-4" />
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                        <File className="w-4 h-4" />
                                      </div>
                                    )}

                                    <div className="truncate text-left">
                                      <div className="font-bold text-slate-800 text-[11px] truncate hover:text-blue-600">
                                        {att.name}
                                      </div>
                                      <div className="flex items-center gap-1 text-[9px] text-slate-400">
                                        <span className="font-semibold uppercase text-slate-600">{att.type}</span>
                                        <span>•</span>
                                        <span>{(att.size / 1024).toFixed(0)} KB</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveViewerRequest(req);
                                        setActiveFileIndex(idx);
                                      }}
                                      className="px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] flex items-center gap-1 shadow-2xs"
                                      title="เปิดดูและสั่งพิมพ์"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>ดู/พิมพ์</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {signingRequestId === req.id ? (
                    <div className="mt-3 p-3 bg-red-50/50 rounded-xl border border-red-200 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          เลือกวิศวกรผู้รับผิดชอบงาน:
                        </label>
                        <select
                          value={assignedEngineerName}
                          onChange={e => setAssignedEngineerName(e.target.value)}
                          className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white"
                        >
                          {engineers.map(eng => (
                            <option key={eng.id} value={eng.name}>
                              ช่าง{eng.name} ({eng.workStatus === 'busy' ? 'กำลังทำงาน' : eng.workStatus === 'waiting' ? 'รองาน' : 'ว่าง'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <SignaturePad
                        signerName={req.salesOwner}
                        roleLabel="SALE"
                        onSave={url => setTempSignatureUrl(url)}
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmSalesSign(req)}
                          className="flex-1 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow"
                        >
                          ยืนยันลงนาม & ส่งต่อให้ Engineer
                        </button>
                        <button
                          onClick={() => {
                            setSigningRequestId(null);
                            setTempSignatureUrl('');
                          }}
                          className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSigningRequestId(req.id)}
                      className="w-full py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      ลงนามดิจิทัล & ส่งต่อให้ช่างเซ็นรับทราบ
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. 🛑 กล่องแดง (งานถูกปฏิเสธ/ส่งคืน): Engineer Rejected */}
        {/* ======================================================== */}
        {rejectedRequests.length > 0 && (
          <div className="border-2 border-red-600 bg-red-100/50 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-red-800 flex items-center gap-2">
                🛑 กล่องแดง: งานถูกปฏิเสธ / ส่งคืนจากวิศวกร ({rejectedRequests.length} รายการ)
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-300 text-red-900 font-bold">
                ช่างส่งกลับ
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rejectedRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-red-300 p-4 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-700 text-white font-mono font-bold text-xs">
                          SO: {req.soNumber}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-slate-100 text-slate-700">
                          {req.docNumber}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{req.projectName}</h4>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-red-100 text-red-800 font-semibold">
                      ช่าง{req.assignedEngineer || 'วิศวกร'} ปฏิเสธ
                    </span>
                  </div>

                  {/* Attached files preview if any */}
                  {req.attachments && req.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {req.attachments.map((att, idx) => (
                        <button
                          key={att.id || idx}
                          type="button"
                          onClick={() => {
                            setActiveViewerRequest(req);
                            setActiveFileIndex(idx);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200"
                        >
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span className="max-w-[80px] truncate">{att.name}</span>
                          <Eye className="w-2.5 h-2.5 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> เหตุผลที่ปฏิเสธจากช่าง:
                    </div>
                    <p className="font-medium text-slate-800">{req.engineerRejectReason || 'ความพร้อมหน้างานยังไม่พร้อม'}</p>
                  </div>

                  {resubmitRequestId === req.id ? (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        ข้อความชี้แจง/แก้ไขส่งใหม่ (จำกัด 100 ตัวอักษร):
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        placeholder="เช่น ประสานงานเตรียมนั่งร้านและสต๊อกเรียบร้อยแล้วครับ"
                        value={resubmitMessage}
                        onChange={e => setResubmitMessage(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResubmitRejected(req)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow"
                        >
                          ส่งไปให้ Engineer เซ็นรับทราบใหม่
                        </button>
                        <button
                          onClick={() => setResubmitRequestId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-700"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setResubmitRequestId(req.id)}
                      className="w-full py-2 rounded-lg text-xs font-bold bg-red-700 hover:bg-red-600 text-white shadow-sm transition"
                    >
                      รับทราบ & เขียนข้อความแก้ไขส่งใหม่ (100 ตัวอักษร)
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. 🔵 กล่องฟ้า (วิศวกรขอเลื่อนวัน): Engineer Rescheduled */}
        {/* ======================================================== */}
        {rescheduledRequests.length > 0 && (
          <div className="border-2 border-sky-500 bg-sky-50/70 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-sky-800 flex items-center gap-2">
                🔵 กล่องฟ้า: วิศวกรกำหนดวันแล้วเสร็จ / ขอเลื่อนนัด ({rescheduledRequests.length} รายการ)
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-200 text-sky-900 font-bold">
                วันนัดหมายใหม่
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rescheduledRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-sky-200 p-4 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-black text-sky-700">{req.soNumber}</span>
                      <h4 className="text-sm font-bold text-slate-900">{req.projectName}</h4>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 font-bold border border-sky-300">
                      ช่างผู้ขอเลื่อน: ช่าง{req.engineerRescheduledBy || req.assignedEngineer || 'ไม่ระบุ'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-sky-50 border border-sky-100 text-xs space-y-1.5 text-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-600">วันนัดหมายใหม่ที่เสนอ:</span>
                      <span className="font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                        {req.engineerRescheduleDate || req.targetDate}
                      </span>
                    </div>
                    {req.engineerRescheduleReason && (
                      <div>
                        <span className="font-semibold text-slate-600">เหตุผล:</span> {req.engineerRescheduleReason}
                      </div>
                    )}
                    {req.engineerSitePreparation && (
                      <div className="text-sky-900 bg-sky-100/60 p-2 rounded border border-sky-200">
                        <span className="font-bold">สิ่งที่หน้างานต้องเตรียม:</span> {req.engineerSitePreparation}
                      </div>
                    )}
                  </div>

                  {rescheduleNegotiateId === req.id ? (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        ระบุวันที่ต้องการเปลี่ยนใหม่:
                      </label>
                      <input
                        type="date"
                        value={counterDate}
                        onChange={e => setCounterDate(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCounterReschedule(req)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow"
                        >
                          ส่งกลับไปให้ Engineer เซ็นรับทราบ
                        </button>
                        <button
                          onClick={() => setRescheduleNegotiateId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-700"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleAgreeReschedule(req)}
                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        ยินยอม (Agree)
                      </button>
                      <button
                        onClick={() => setRescheduleNegotiateId(req.id)}
                        className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                      >
                        แก้ไขวัน (Reschedule)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. 🟡 กล่องเหลือง (รอวิศวกรลงพื้นที่): Ready for Site */}
        {/* ======================================================== */}
        {readyForSiteRequests.length > 0 && (
          <div className="border-2 border-amber-400 bg-amber-50/70 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-amber-800 flex items-center gap-2">
                🟡 กล่องเหลือง: รอวิศวกรลงพื้นที่ปฏิบัติงาน ({readyForSiteRequests.length} รายการ)
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
                กล่องจะหายไปอัตโนมัติเมื่อช่าง Check-in หน้างาน
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyForSiteRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-amber-200 p-3.5 shadow-sm space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-black text-amber-700">{req.soNumber}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      ช่าง{req.assignedEngineer}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{req.projectName}</h4>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <div><span className="font-semibold">วันนัดหมาย:</span> {req.targetDate}</div>
                    <div><span className="font-semibold">ผู้ติดต่อ:</span> {req.siteContactName || '-'} ({req.siteContactPhone || '-'})</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. 🛑 กล่องแดง (แจ้งเตือนล่วงหน้า 1 วัน): 1 Day Warning */}
        {/* ======================================================== */}
        {oneDayWarningRequests.length > 0 && (
          <div className="border-2 border-rose-500 bg-rose-50/80 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-rose-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                🛑 กล่องแดง: แจ้งเตือนงานล่วงหน้า 1 วัน (นัดหมายวันพรุ่งนี้ {oneDayWarningRequests.length} รายการ)
              </h3>
              <span className="text-xs text-rose-700 font-medium">กดรับทราบแล้วกล่องจะหายไป</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {oneDayWarningRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-rose-200 p-4 shadow-sm flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-black text-rose-600">{req.soNumber}</span>
                    <h4 className="text-sm font-bold text-slate-900">{req.projectName}</h4>
                    <p className="text-xs text-slate-500">ช่างผู้รับผิดชอบ: ช่าง{req.assignedEngineer} | วันที่: {req.targetDate}</p>
                  </div>
                  <button
                    onClick={() => handleAck1Day(req)}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow transition whitespace-nowrap"
                  >
                    รับทราบ
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. 🛑 กล่องแดง (แจ้งเตือนเลยกำหนด Overdue) */}
        {/* ======================================================== */}
        {overdueRequests.length > 0 && (
          <div className="border-2 border-red-700 bg-red-100/70 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-700" />
                🛑 กล่องแดง: แจ้งเตือนงานเลยกำหนด (Overdue Alert: {overdueRequests.length} รายการ)
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-200 text-red-900 font-bold">
                จะหายไปเมื่อทำงานนั้นเสร็จ
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overdueRequests.map(req => {
                const days = getDaysOverdue(req.deadlineDate || req.targetDate);
                return (
                  <div key={req.id} className="bg-white rounded-xl border border-red-300 p-4 shadow-sm flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-red-700">{req.soNumber}</span>
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-red-600 text-white">
                          เกินกำหนดมาแล้ว {days} วัน
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{req.projectName}</h4>
                      <p className="text-xs text-slate-500">
                        ช่าง: ช่าง{req.assignedEngineer || 'ยังไม่ระบุ'} | กำหนดเสร็จ: {req.deadlineDate || req.targetDate}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. 🟢 กล่องเขียว (วิศวกรส่งมอบงานแล้ว): Handed over by Engineer -> Before/After Photos Evidence -> Sales 5D Eval & Close */}
        {/* ======================================================== */}
        {completedByEngineerRequests.length > 0 && (
          <div className="border-2 border-emerald-500 bg-emerald-50/70 rounded-2xl p-5 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-black text-emerald-900 flex items-center gap-2">
                🟢 กล่องเขียว: วิศวกรส่งมอบงานแล้ว ({completedByEngineerRequests.length} รายการ)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center gap-1">
                  <Camera className="w-3 h-3 text-emerald-800" />
                  <span>มีรูปก่อน-หลังทำแนบมา</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  รอฝ่ายขายตรวจรับ & ประเมินปิดงาน
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {completedByEngineerRequests.map(req => {
                const beforePhotos = (req.workPhotos || []).filter(p => p.stage === 'before');
                const afterPhotos = (req.workPhotos || []).filter(p => p.stage === 'after');
                const hasPhotos = (req.workPhotos && req.workPhotos.length > 0);

                return (
                  <div key={req.id} className="bg-white rounded-xl border border-emerald-300 p-4 shadow-sm space-y-3.5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-emerald-700 font-mono">
                              SO: {req.soNumber}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-slate-100 text-slate-700">
                              {req.docNumber}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{req.projectName}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            ช่างผู้ปฏิบัติงาน: <span className="font-bold text-emerald-800">ช่าง{req.assignedEngineer || '-'}</span> | วันนัดหมาย: {req.targetDate}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {req.status === 'completed_by_customer' ? (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ลูกค้าประเมินแล้ว 5★
                            </span>
                          ) : (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              ส่งมอบงานแล้ว
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setPrintDocRequest(req)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-300 flex items-center gap-1 transition"
                            title="พิมพ์เอกสารส่งมอบงานพร้อมรูปภาพ"
                          >
                            <Printer className="w-3 h-3 text-slate-600" />
                            <span>ดู/พิมพ์เอกสาร</span>
                          </button>
                        </div>
                      </div>

                      {/* ======================================================== */}
                      {/* 📸 BEFORE & AFTER WORK PHOTOS EVIDENCE (รูปก่อนทำ-หลังทำที่ลิงก์มาจากหน้าระบบประเมินผลความพึงพอใจลูกค้าและตรวจรับงาน) */}
                      {/* ======================================================== */}
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">
                                รูปภาพผลงานก่อนทำ-หลังทำ (แนบมาจากระบบประเมินความพึงพอใจ & ตรวจรับงาน)
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                🔗 ลิงก์ข้อมูลภาพถ่ายจาก Customer Portal เพื่อให้ฝ่ายขายใช้ประกอบการประเมิน
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[10px]">
                            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 font-bold border border-orange-200">
                              ก่อนทำ: {beforePhotos.length}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
                              หลังทำ: {afterPhotos.length}
                            </span>
                          </div>
                        </div>

                        {hasPhotos ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {/* 1. Before Work Photos */}
                            <div className="p-2 bg-white rounded-lg border border-orange-200 space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-bold text-orange-900 border-b border-orange-100 pb-1">
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                  1. รูปก่อนทำงาน (Before Work)
                                </span>
                                <span className="text-[10px] font-semibold text-orange-700">({beforePhotos.length})</span>
                              </div>

                              {beforePhotos.length === 0 ? (
                                <div className="p-2 text-center text-[10px] text-slate-400 italic">
                                  ไม่มีรูปก่อนทำงาน
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {beforePhotos.map(photo => (
                                    <div 
                                      key={photo.id} 
                                      className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 hover:border-orange-400 transition"
                                    >
                                      <div 
                                        className="relative group cursor-pointer aspect-video bg-slate-900 flex items-center justify-center overflow-hidden"
                                        onClick={() => setActiveZoomPhoto(photo)}
                                      >
                                        <img 
                                          src={photo.url} 
                                          alt={photo.name} 
                                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200" 
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                                          <ZoomIn className="w-4 h-4" />
                                          <span>คลิกดูรูปขยาย</span>
                                        </div>
                                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                                          ก่อนทำ
                                        </span>
                                      </div>

                                      <div className="p-1.5 space-y-1">
                                        {photo.description ? (
                                          <p className="text-[11px] text-slate-700 font-medium line-clamp-2 italic bg-orange-50/60 p-1 rounded border border-orange-100/50">
                                            &quot;{photo.description}&quot;
                                          </p>
                                        ) : (
                                          <p className="text-[10px] text-slate-400 italic">ไม่ได้ระบุคำอธิบาย</p>
                                        )}
                                        <div className="text-[9px] text-slate-400 flex items-center justify-between">
                                          <span className="truncate max-w-[90px]">{photo.name}</span>
                                          <span>{photo.uploadedAt.split(' ')[0]}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* 2. After Work Photos */}
                            <div className="p-2 bg-white rounded-lg border border-emerald-200 space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 border-b border-emerald-100 pb-1">
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                  2. รูปหลังทำงาน (After Work)
                                </span>
                                <span className="text-[10px] font-semibold text-emerald-700">({afterPhotos.length})</span>
                              </div>

                              {afterPhotos.length === 0 ? (
                                <div className="p-2 text-center text-[10px] text-slate-400 italic">
                                  ไม่มีรูปหลังทำงาน
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {afterPhotos.map(photo => (
                                    <div 
                                      key={photo.id} 
                                      className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 hover:border-emerald-400 transition"
                                    >
                                      <div 
                                        className="relative group cursor-pointer aspect-video bg-slate-900 flex items-center justify-center overflow-hidden"
                                        onClick={() => setActiveZoomPhoto(photo)}
                                      >
                                        <img 
                                          src={photo.url} 
                                          alt={photo.name} 
                                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200" 
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                                          <ZoomIn className="w-4 h-4" />
                                          <span>คลิกดูรูปขยาย</span>
                                        </div>
                                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-200 text-[9px] font-bold">
                                          หลังทำ
                                        </span>
                                      </div>

                                      <div className="p-1.5 space-y-1">
                                        {photo.description ? (
                                          <p className="text-[11px] text-slate-700 font-medium line-clamp-2 italic bg-emerald-50/60 p-1 rounded border border-emerald-100/50">
                                            &quot;{photo.description}&quot;
                                          </p>
                                        ) : (
                                          <p className="text-[10px] text-slate-400 italic">ไม่ได้ระบุคำอธิบาย</p>
                                        )}
                                        <div className="text-[9px] text-slate-400 flex items-center justify-between">
                                          <span className="truncate max-w-[90px]">{photo.name}</span>
                                          <span>{photo.uploadedAt.split(' ')[0]}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 text-center bg-white rounded-lg border border-slate-200 text-xs text-slate-400 italic">
                            ไม่มีรูปถ่ายประกอบงานจากระบบส่งมอบงาน
                          </div>
                        )}
                      </div>

                      {/* Summary of Customer Rating */}
                      {req.customerEvaluation && (
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-xs space-y-1 text-emerald-900">
                          <div className="font-bold flex items-center justify-between">
                            <span>ผลประเมินจากลูกค้า ({req.customerSignature?.signerName}):</span>
                            <span className="text-[10px] text-emerald-700 font-semibold">{req.customerSignature?.signedAt}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[11px]">
                            <span>• แต่งกาย/Safety: {req.customerEvaluation.grooming}★</span>
                            <span>• ความรู้/ความเชี่ยวชาญ: {req.customerEvaluation.knowledge}★</span>
                            <span>• แก้ปัญหาเฉพาะหน้า: {req.customerEvaluation.problemSolving}★</span>
                            <span>• มารยาท/สื่อสาร: {req.customerEvaluation.manner}★</span>
                          </div>
                          {req.customerEvaluation.feedback && (
                            <p className="text-[11px] italic text-slate-600 mt-1 bg-white/70 p-1.5 rounded border border-emerald-100">
                              &quot;{req.customerEvaluation.feedback}&quot;
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sales Evaluation & Final Close */}
                    <div className="pt-2">
                      {evaluatingRequestId === req.id ? (
                        <div className="space-y-4 pt-3 border-t border-slate-200">
                          <h5 className="text-xs font-bold text-slate-800">
                            แบบประเมิน 5 มิติฝ่ายขาย (Sales Evaluation 1-5 ดาว):
                          </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            {[
                              { key: 'communication', label: '1. การสื่อสาร' },
                              { key: 'punctuality', label: '2. ตรงต่อเวลา' },
                              { key: 'quality', label: '3. คุณภาพงาน' },
                              { key: 'problemSolving', label: '4. แก้ปัญหา' },
                              { key: 'overall', label: '5. ภาพรวม' },
                            ].map(dim => (
                              <div key={dim.key} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                                <span className="font-semibold text-slate-700">{dim.label}:</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                      type="button"
                                      key={star}
                                      onClick={() => setSalesEval(prev => ({ ...prev, [dim.key]: star }))}
                                      className={`text-sm ${
                                        (salesEval as any)[dim.key] >= star ? 'text-amber-400' : 'text-slate-300'
                                      }`}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <label className="font-bold text-slate-700">กล่องอธิบายเพิ่มเติม (จำกัด 200 ตัวอักษร):</label>
                              <span className="text-[10px] text-slate-400">{salesEval.description.length}/200</span>
                            </div>
                            <textarea
                              rows={2}
                              maxLength={200}
                              placeholder="ระบุข้อคิดเห็นฝ่ายขายต่อการปฏิบัติงานของวิศวกร"
                              value={salesEval.description}
                              onChange={e => {
                                if (e.target.value.length <= 200) {
                                  setSalesEval(prev => ({ ...prev, description: e.target.value }));
                                }
                              }}
                              className="w-full text-xs p-2 rounded-lg border border-slate-300 resize-none"
                            />
                          </div>

                          <SignaturePad
                            signerName={req.salesOwner}
                            roleLabel="SALE (ปิดงานสมบูรณ์)"
                            onSave={url => setTempSignatureUrl(url)}
                          />

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleFinalClose(req)}
                              className="flex-1 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                            >
                              บันทึกประเมิน & ลงนามดิจิทัลปิดงานสมบูรณ์
                            </button>
                            <button
                              onClick={() => {
                                setEvaluatingRequestId(null);
                                setTempSignatureUrl('');
                              }}
                              className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-200 text-slate-700"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEvaluatingRequestId(req.id)}
                          className="w-full py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition flex items-center justify-center gap-1.5"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-300" />
                          <span>ประเมิน 5 มิติฝ่ายขาย & เซ็นดิจิทัลปิดงานสมบูรณ์</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 8. กล่องสอบถามงาน Engineer (Inquiry System - 300 char) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                กล่องสอบถามงาน Engineer (Direct Sales-to-Engineer Inquiry)
              </h3>
              <p className="text-xs text-slate-300">
                ส่งคำถามเจาะจงถึงช่างรายบุคคล (พัด, โชค, วิน, วัฒน์) พร้อมข้อความจำกัด 300 ตัวอักษร
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {inquirySuccessToast && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              ส่งข้อซักถามไปยังวิศวกรเรียบร้อยแล้ว (จะปรากฏในหน้า Engineer Hub ให้ช่างตอบกลับ)
            </div>
          )}

          <form onSubmit={handleSubmitInquiry} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                SO NO. <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น SO-690820"
                value={inquirySoNumber}
                onChange={e => setInquirySoNumber(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อโครงการ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น The Forestias"
                value={inquiryProjectName}
                onChange={e => setInquiryProjectName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เลือกช่างผู้รับคำถาม <span className="text-rose-500">*</span>
              </label>
              <select
                value={inquiryEngineer}
                onChange={e => setInquiryEngineer(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {engineers.map(eng => (
                  <option key={eng.id} value={eng.name}>
                    ช่าง{eng.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เซลล์ผู้สอบถาม
              </label>
              <select
                value={inquirySalesName}
                onChange={e => setInquirySalesName(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {salesStaff.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  ข้อความที่ต้องการสอบถามงาน (จำกัด 300 ตัวอักษร) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {inquiryMessage.length}/300 ตัวอักษร
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={300}
                placeholder="พิมพ์ข้อคำถามที่ต้องการให้วิศวกรตรวจสอบหรืออัปเดตสถานะ..."
                value={inquiryMessage}
                onChange={e => {
                  if (e.target.value.length <= 300) {
                    setInquiryMessage(e.target.value);
                  }
                }}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 resize-none"
                required
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                ส่งคำถามถึงช่าง{inquiryEngineer}
              </button>
            </div>

          </form>

          {/* Inquiries History List */}
          {inquiries.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-700">
                ประวัติข้อซักถามและการตอบกลับล่าสุด:
              </h4>
              <div className="space-y-2.5">
                {inquiries.map(inq => (
                  <div key={inq.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-indigo-700">{inq.soNumber}</span>
                        <span className="font-semibold text-slate-800">{inq.projectName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{inq.createdAt}</span>
                    </div>

                    <div className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-900">{inq.salesName}:</span> {inq.message}
                    </div>

                    {inq.status === 'replied' ? (
                      <div className="text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                          <span>ช่าง{inq.engineerName} ตอบกลับ:</span>
                          <span className="text-emerald-600">{inq.repliedAt}</span>
                        </div>
                        <p>{inq.replyMessage}</p>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> กำลังรอช่าง{inq.engineerName} ตอบกลับใน Engineer Hub
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Photo Zoom Lightbox Modal */}
      {activeZoomPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-3.5 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                  activeZoomPhoto.stage === 'before' ? 'bg-orange-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {activeZoomPhoto.stage === 'before' ? '📷 รูปก่อนทำงาน (Before Work)' : '📷 รูปหลังทำงาน (After Work)'}
                </span>
                <span className="text-xs text-slate-300 truncate max-w-xs font-medium">{activeZoomPhoto.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveZoomPhoto(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center overflow-auto flex-1 min-h-[300px]">
              <img
                src={activeZoomPhoto.url}
                alt={activeZoomPhoto.name}
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="p-4 bg-white border-t border-slate-200 space-y-2 shrink-0">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>รายละเอียดใต้รูปภาพ (คำอธิบายประกอบจากช่าง):</span>
                <span className="text-[10px] text-slate-400">อัปโหลดเมื่อ {activeZoomPhoto.uploadedAt}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800">
                {activeZoomPhoto.description ? (
                  <p className="font-medium leading-relaxed">&quot;{activeZoomPhoto.description}&quot;</p>
                ) : (
                  <p className="text-slate-400 italic">(ไม่ได้ระบุคำอธิบาย)</p>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>ผู้บันทึกภาพ: <strong className="text-slate-700">{activeZoomPhoto.uploadedBy || 'วิศวกรผู้ปฏิบัติงาน'}</strong></span>
                <button
                  type="button"
                  onClick={() => setActiveZoomPhoto(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Viewer Modal */}
      {activeViewerRequest && activeViewerRequest.attachments && (
        <FileViewerModal
          isOpen={!!activeViewerRequest}
          onClose={() => setActiveViewerRequest(null)}
          files={activeViewerRequest.attachments}
          initialIndex={activeFileIndex}
          docNumber={activeViewerRequest.docNumber}
          projectName={activeViewerRequest.projectName}
          soNumber={activeViewerRequest.soNumber}
        />
      )}

      {/* Document Print Modal */}
      {printDocRequest && (
        <DocumentPrintModal
          request={printDocRequest}
          onClose={() => setPrintDocRequest(null)}
        />
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { 
  FileText, Calendar, Clock, AlertTriangle, CheckCircle, ShieldAlert,
  Upload, Link as LinkIcon, Check, X, File, Image, Film, FileCode,
  Building, User, Phone, Mail, Sparkles, Send, Trash2, Plus, Eye, EyeOff, Printer, RotateCcw,
  ShieldCheck, Lock, Unlock, KeyRound, Zap, UserCheck
} from 'lucide-react';
import { 
  EEngineerRequest, Priority, WorkCategorySelection, 
  AttachmentItem, StaffMember 
} from '../types';
import { SignaturePad } from './SignaturePad';
import { generateNextDocNumber } from '../utils/storage';
import { DocumentPrintModal } from './DocumentPrintModal';
import { FileViewerModal } from './FileViewerModal';

interface AdminSaleFormProps {
  requests?: EEngineerRequest[];
  staff: StaffMember[];
  nextDocNumber?: string;
  onCreateRequest?: (newRequest: EEngineerRequest) => void;
  onSubmitSuccess?: (newRequest: EEngineerRequest) => void;
  onOpenCalendar: () => void;
  onOpenStatus: () => void;
  onOpenLocation?: () => void;
  onCloseForm?: () => void;
  onOpenDocumentPrint?: (request: EEngineerRequest) => void;
}

export const AdminSaleForm: React.FC<AdminSaleFormProps> = ({
  requests = [],
  staff,
  nextDocNumber,
  onCreateRequest,
  onSubmitSuccess,
  onOpenCalendar,
  onOpenStatus,
  onOpenLocation,
  onCloseForm,
  onOpenDocumentPrint,
}) => {
  const currentDocNumber = nextDocNumber || generateNextDocNumber(requests);

  // Security Authentication State (user: Admin Sale, password: Admin Sale) - auto-signs out when leaving page
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

    if (user.toLowerCase() === 'admin sale' && pass.toLowerCase() === 'admin sale') {
      setIsAuthorized(true);
      setAuthError(null);
    } else {
      setAuthError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาใช้ user: Admin Sale และ password: Admin Sale');
    }
    setIsSubmitting(false);
  };

  // Form State
  const [soNumber, setSoNumber] = useState('');
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [siteContactName, setSiteContactName] = useState('');
  const [siteContactPhone, setSiteContactPhone] = useState('');
  const [siteContactEmail, setSiteContactEmail] = useState('');
  const [salesOwner, setSalesOwner] = useState('');
  const [adminRequester, setAdminRequester] = useState('พี่ก้อย');

  // Preview Modal State
  const [previewRequest, setPreviewRequest] = useState<EEngineerRequest | null>(null);

  // 4 Work Categories
  const [categories, setCategories] = useState<WorkCategorySelection>({
    service: false,
    serviceNote: '',
    countingDrawing: false,
    countingDrawingNote: '',
    meetingOrMockup: false,
    meetingOrMockupNote: '',
    claimProduct: false,
    claimProductNote: '',
  });

  // Priority (3 alert boxes)
  const [priority, setPriority] = useState<Priority>('alert_normal');

  // Work Details (max 200 char)
  const [workDetails, setWorkDetails] = useState('');

  // Report Option
  const [needReport, setNeedReport] = useState<boolean>(false);
  const [customerReportEmail, setCustomerReportEmail] = useState('');

  // Storage & Attachments
  const [serverShareDriveLink, setServerShareDriveLink] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [previewFileIndex, setPreviewFileIndex] = useState(0);
  const [uploadCategory, setUploadCategory] = useState<AttachmentItem['type']>('drawing');
  const [isDragging, setIsDragging] = useState(false);

  // Signature
  const [adminSignatureUrl, setAdminSignatureUrl] = useState('');

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastSubmittedInfo, setLastSubmittedInfo] = useState<{
    soNumber: string;
    salesOwner: string;
    workDetails: string;
  } | null>(null);

  const adminStaff = staff.filter(s => s.team === 'Admin Sale');
  const salesStaff = staff.filter(s => s.team === 'SALE' || s.team === 'SALE MANAGER');

  const processFiles = (files: FileList | File[], categoryOverride?: AttachmentItem['type']) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((f, i) => {
      let type: AttachmentItem['type'] = categoryOverride || uploadCategory || 'other';
      
      const lowerName = f.name.toLowerCase();
      if (!categoryOverride) {
        if (lowerName.endsWith('.dwg') || lowerName.endsWith('.dxf') || lowerName.endsWith('.cad') || lowerName.endsWith('.rvt')) {
          type = 'drawing';
        } else if (f.type.startsWith('image/') || lowerName.match(/\.(jpg|jpeg|png|webp|gif|svg)$/)) {
          type = 'photo';
        } else if (f.type.startsWith('video/') || lowerName.match(/\.(mp4|mov|webm|mkv|avi)$/)) {
          type = 'video';
        } else if (lowerName.includes('report') || lowerName.includes('รายงาน') || lowerName.includes('test') || lowerName.includes('cert')) {
          type = 'report';
        } else if (f.type.includes('pdf') || lowerName.endsWith('.pdf')) {
          type = uploadCategory === 'drawing' ? 'drawing' : 'document';
        } else {
          type = 'document';
        }
      }

      const reader = new FileReader();
      reader.onload = () => {
        const resultUrl = reader.result as string;
        const newAttachment: AttachmentItem = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${i}`,
          name: f.name,
          size: f.size,
          type,
          url: resultUrl,
          fileData: resultUrl,
          mimeType: f.type,
          uploadedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        };

        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(f);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, category?: AttachmentItem['type']) => {
    const files = e.target.files;
    if (files) {
      processFiles(files, category);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const openFileViewer = (index: number) => {
    setPreviewFileIndex(index);
    setIsViewerOpen(true);
  };

  const handleCategoryToggle = (key: keyof Pick<WorkCategorySelection, 'service' | 'countingDrawing' | 'meetingOrMockup' | 'claimProduct'>) => {
    setCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCategoryNoteChange = (
    noteKey: keyof Pick<WorkCategorySelection, 'serviceNote' | 'countingDrawingNote' | 'meetingOrMockupNote' | 'claimProductNote'>,
    value: string
  ) => {
    if (value.length <= 100) {
      setCategories(prev => ({
        ...prev,
        [noteKey]: value
      }));
    }
  };

  const handleResetForm = () => {
    setSoNumber('');
    setTargetDate('');
    setDeadlineDate('');
    setCustomerName('');
    setProjectName('');
    setSiteContactName('');
    setSiteContactPhone('');
    setSiteContactEmail('');
    setSalesOwner('');
    setCategories({
      service: false,
      serviceNote: '',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: false,
      meetingOrMockupNote: '',
      claimProduct: false,
      claimProductNote: '',
    });
    setPriority('alert_normal');
    setWorkDetails('');
    setNeedReport(false);
    setCustomerReportEmail('');
    setServerShareDriveLink('');
    setAttachments([]);
    setAdminSignatureUrl('');
    setErrorMsg('');
  };

  const handleCreateNewForm = () => {
    handleResetForm();
    setShowSuccessToast(false);
    setErrorMsg('');
  };

  const handleClose = () => {
    if (onCloseForm) {
      onCloseForm();
    } else {
      handleResetForm();
    }
  };

  const handlePreviewForm = () => {
    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
    
    const previewObj: EEngineerRequest = {
      id: `preview-${Date.now()}`,
      docNumber: currentDocNumber,
      soNumber: soNumber.trim().toUpperCase() || 'SO-DRAFT',
      requestDate: requestDate || new Date().toISOString().split('T')[0],
      targetDate: targetDate || 'ยังไม่ระบุ',
      deadlineDate: deadlineDate || targetDate || 'ยังไม่ระบุ',
      customerName: customerName.trim() || '(ระบุชื่อลูกค้าในฟอร์ม)',
      projectName: projectName.trim() || '(ระบุชื่อโครงการในฟอร์ม)',
      siteContactName: siteContactName.trim() || '-',
      siteContactPhone: siteContactPhone.trim() || '-',
      siteContactEmail: siteContactEmail.trim() || '-',
      salesOwner: salesOwner || 'ยังไม่เลือกเซลล์',
      adminRequester: adminRequester || 'Admin Sale',
      categories,
      priority,
      workDetails: workDetails.trim() || '(ยังไม่ได้กรอกรายละเอียดงาน)',
      needReport,
      customerReportEmail: needReport ? customerReportEmail : undefined,
      serverShareDriveLink: serverShareDriveLink.trim() || undefined,
      attachments,
      status: 'pending_sale_sign',
      adminSignature: adminSignatureUrl ? {
        signerName: `${adminRequester} (Admin Sale)`,
        role: 'Admin Sale',
        signatureDataUrl: adminSignatureUrl,
        signedAt: timeStr,
      } : undefined,
      history: [
        {
          id: `h-preview`,
          timestamp: timeStr,
          action: 'ตัวอย่างแบบฟอร์ม E-Request',
          actor: adminRequester,
          role: 'Admin Sale',
          details: 'ดูตัวอย่างเอกสาร A4 ก่อนส่งอนุมัติ'
        }
      ],
      createdAt: timeStr,
      updatedAt: timeStr,
    };

    if (onOpenDocumentPrint) {
      onOpenDocumentPrint(previewObj);
    } else {
      setPreviewRequest(previewObj);
    }
  };

  const handleAcceptSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!soNumber.trim()) {
      setErrorMsg('กรุณาระบุเลข SO NO.');
      return;
    }
    if (!customerName.trim() || !projectName.trim()) {
      setErrorMsg('กรุณาระบุชื่อลูกค้าและชื่อโครงการ');
      return;
    }
    if (!salesOwner) {
      setErrorMsg('กรุณาเลือกเซลล์เจ้าของงาน');
      return;
    }
    if (!targetDate) {
      setErrorMsg('กรุณาระบุวันที่ต้องการให้วิศวกรเข้าหน้างาน');
      return;
    }
    const hasCategory = categories.service || categories.countingDrawing || categories.meetingOrMockup || categories.claimProduct;
    if (!hasCategory) {
      setErrorMsg('กรุณาเลือกอย่างน้อย 1 หมวดหมู่งาน');
      return;
    }
    if (!workDetails.trim()) {
      setErrorMsg('กรุณาระบุรายละเอียดงานที่ต้องทำ (จำกัด 200 ตัวอักษร)');
      return;
    }
    if (!adminSignatureUrl) {
      setErrorMsg('กรุณาลงนามดิจิทัล Admin Sale ก่อนส่งคำขอ');
      return;
    }

    const nowIso = new Date().toISOString();
    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    const newReq: EEngineerRequest = {
      id: `req-${Date.now()}`,
      docNumber: currentDocNumber,
      soNumber: soNumber.trim().toUpperCase(),
      requestDate,
      targetDate,
      deadlineDate: deadlineDate || targetDate,
      customerName: customerName.trim(),
      projectName: projectName.trim(),
      siteContactName: siteContactName.trim(),
      siteContactPhone: siteContactPhone.trim(),
      siteContactEmail: siteContactEmail.trim(),
      salesOwner,
      adminRequester,
      categories,
      priority,
      workDetails: workDetails.trim(),
      needReport,
      customerReportEmail: needReport ? customerReportEmail : undefined,
      serverShareDriveLink: serverShareDriveLink.trim() || undefined,
      attachments,
      status: 'pending_sale_sign',
      adminSignature: {
        signerName: `${adminRequester} (Admin Sale)`,
        role: 'Admin Sale',
        signatureDataUrl: adminSignatureUrl,
        signedAt: timeStr
      },
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: timeStr,
          action: 'ออกใบคำขอ E-Request',
          actor: adminRequester,
          role: 'Admin Sale',
          details: `สร้างใบคำขอ ${currentDocNumber} สำหรับ ${soNumber.toUpperCase()} ความสำคัญ: ${
            priority === 'alert_emergency' ? 'ด่วนที่สุด (24 ชม.)' : priority === 'alert_urgent' ? 'ด่วน (2-3 วัน)' : 'ปกติ'
          }`
        }
      ],
      createdAt: timeStr,
      updatedAt: timeStr,
    };

    setLastSubmittedInfo({
      soNumber: newReq.soNumber,
      salesOwner: newReq.salesOwner,
      workDetails: newReq.workDetails,
    });

    setShowSuccessToast(true);
    const submitCallback = onSubmitSuccess || onCreateRequest;
    if (submitCallback) {
      submitCallback(newReq);
    }
    handleResetForm();
  };

  // 🔒 ADMIN SALE SECURITY GATE (USER: Admin Sale, PASSWORD: Admin Sale)
  // Automatically signs out when user leaves this page/tab
  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto py-8 sm:py-12 px-4">
        <div className="bg-slate-900 text-white rounded-3xl border-2 border-amber-500/40 shadow-2xl overflow-hidden relative backdrop-blur-xl">
          {/* Background Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-600/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

          {/* Security Banner Header */}
          <div className="p-6 sm:p-8 text-center border-b border-slate-800 relative z-10 space-y-3">
            <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-800 to-yellow-500/20 border border-amber-500/30 text-amber-400 shadow-inner">
              <ShieldCheck className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                <Lock className="w-3 h-3 text-amber-400" />
                Admin Sale Access Control (Security Gate)
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                ระบบรักษาความปลอดภัย Admin Sale (Security Gate)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
                หน้านี้สงวนสิทธิ์เฉพาะทีมงาน Admin Sale เท่านั้น กรุณากรอกรหัสผ่านเพื่อเข้าใช้งาน
              </p>
            </div>

            {/* Quick Security Hint Badge */}
            <div className="inline-flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-1.5 text-xs text-slate-300">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>ความปลอดภัย: <strong>User: Admin Sale</strong> | <strong>Password: Admin Sale</strong></span>
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
                ชื่อผู้ใช้งาน (Username) <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  id="adminsale-username-input"
                  type="text"
                  required
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้งาน (เช่น Admin Sale)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                รหัสผ่าน (Password) <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="adminsale-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="กรอกรหัสผ่าน (เช่น Admin Sale)"
                  className="w-full pl-10 pr-11 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
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
                id="btn-submit-adminsale-auth"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4 text-slate-950" />
                <span>เข้าสู่ระบบ Admin Sale (Sign In)</span>
              </button>

              <button
                type="button"
                id="btn-autofill-adminsale"
                onClick={() => {
                  setUsernameInput('Admin Sale');
                  setPasswordInput('Admin Sale');
                  setAuthError(null);
                }}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>กรอกข้อมูลทดสอบอัตโนมัติ (Quick Fill: Admin Sale / Admin Sale)</span>
              </button>
            </div>

            <div className="text-center pt-2 space-y-1">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                ระบบจะ <strong>Sign Out อัตโนมัติ</strong> ทันทีเมื่อท่านเปลี่ยนไปหน้าอื่น
              </p>
              <p className="text-[10px] text-slate-500">
                LUMENCRAFT Admin Sale Security • Protocol 2026
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Red Alert Notification Banner when ACCEPT is clicked */}
      {showSuccessToast && lastSubmittedInfo && (
        <div 
          id="alert-box-admin-accepted"
          className="bg-red-600 text-white rounded-2xl p-5 shadow-xl border-2 border-red-400 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-white/20 text-white shrink-0 mt-0.5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold flex items-center gap-2">
                  🛑 ส่งรายการคำขอ E-Request ไปยังฝ่ายขายเรียบร้อยแล้ว (มีรายการให้อนุมัติ)
                </h4>
                <div className="mt-2 text-sm bg-red-700/80 rounded-xl p-3 space-y-1 text-red-50 border border-red-500">
                  <div><span className="font-bold text-white">SO NO.:</span> {lastSubmittedInfo.soNumber}</div>
                  <div><span className="font-bold text-white">เซลล์ผู้รับผิดชอบ:</span> {lastSubmittedInfo.salesOwner}</div>
                  <div><span className="font-bold text-white">รายละเอียดงาน:</span> {lastSubmittedInfo.workDetails}</div>
                </div>
                <p className="text-xs text-red-100 mt-2">
                  * ข้อมูลถูกส่งเข้าแท็บ &quot;ฝ่ายขาย (Sales Hub)&quot; เพื่อรอให้ฝ่ายขายลงนามและมอบหมายงานแก่วิศวกรต่อไป
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="p-1 rounded-lg hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Request Form Container */}
      <form onSubmit={handleAcceptSubmit} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        
        {/* Official Company Letterhead Header (หัวกระดาษบริษัท) */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white p-5 sm:p-6 border-b border-amber-500/40">
          
          {/* Top Company Info Row */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Company Branding & Address */}
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 shrink-0 border border-amber-300/40">
                LC
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-wider text-white">
                    LUMENCRAFT CO., LTD.
                  </h1>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30">
                    Official Document Engine
                  </span>
                </div>
                <p className="text-xs font-semibold text-amber-400/95">
                  ระบบ E-Engineer Request LUMENCRAFT
                </p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  ที่อยู่ 125 อาคารอินฟินิท พัฒนาการ 13 แขวงสวนหลวง เขตสวนหลวง กทม. 10250
                </p>
              </div>
            </div>

            {/* Document Auto Number Box */}
            <div className="w-full lg:w-auto bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 flex flex-row lg:flex-col items-center lg:items-end justify-between gap-1 shadow-inner">
              <div className="text-[10px] text-slate-400 font-medium">เลขที่เอกสารคำขออัตโนมัติ (Auto Ref)</div>
              <div className="text-xs sm:text-sm font-black font-mono text-amber-300 tracking-wider">
                {currentDocNumber}
              </div>
              <div className="text-[10px] text-slate-400">
                วันที่ร้องขอ: {requestDate}
              </div>
            </div>

          </div>

          {/* Form Title & Top Action Toolbar */}
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wide">
                Admin Sale Portal
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[11px] font-bold shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Signed in as: <strong className="text-white">Admin Sale</strong></span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                ใบคำขอรับบริการและประสานงานวิศวกร (E-Engineer Service Request Form)
              </h2>
            </div>

            {/* Action Buttons Toolbar (+ New, Preview, Realtime, Close) */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Button + สร้าง new */}
              <button
                type="button"
                id="btn-admin-new-request-top"
                onClick={handleCreateNewForm}
                className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition transform active:scale-95"
                title="สร้างใบคำขอใหม่ / ล้างฟอร์มเพื่อออกเอกสารใหม่"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                + สร้าง new (New Request)
              </button>

              {/* Button Preview Form */}
              <button
                type="button"
                id="btn-admin-preview-top"
                onClick={handlePreviewForm}
                className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition transform active:scale-95"
                title="ดูตัวอย่างเอกสาร A4 จากข้อมูลที่กรอกในฟอร์ม"
              >
                <Eye className="w-3.5 h-3.5 mr-1 text-indigo-200" />
                Preview ฟอร์ม (ตัวอย่างเอกสาร)
              </button>

              {/* Real-time modals buttons */}
              <button
                type="button"
                id="btn-admin-show-calendar"
                onClick={onOpenCalendar}
                className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <Calendar className="w-3.5 h-3.5 mr-1 text-blue-400" />
                ปฏิทิน Engineer
              </button>
              
              <button
                type="button"
                id="btn-admin-show-status"
                onClick={onOpenStatus}
                className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <Clock className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                สถานะ Engineer
              </button>

              {/* Button Close Form */}
              <button
                type="button"
                id="btn-admin-close-top"
                onClick={handleClose}
                className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-rose-600 hover:text-white text-slate-300 border border-slate-700 transition"
                title="ปิดฟอร์ม / ยกเลิก"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                ปิด (Close)
              </button>

            </div>

          </div>

        </div>

        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Section 1: Basic Info Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-700" /> 1. ข้อมูลทั่วไป & ผู้ติดต่อ
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* SO NO. */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SO NO. <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-so-number"
                  placeholder="เช่น SO-690825"
                  value={soNumber}
                  onChange={e => setSoNumber(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 uppercase"
                  required
                />
              </div>

              {/* Doc Number (Auto) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เลขที่เอกสารอัตโนมัติ
                </label>
                <input
                  type="text"
                  value={currentDocNumber}
                  readOnly
                  className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-700"
                />
              </div>

              {/* Request Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วันที่ร้องขอ
                </label>
                <input
                  type="date"
                  value={requestDate}
                  onChange={e => setRequestDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วันที่ต้องการให้เข้าหน้างาน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  id="input-target-date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Deadline Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  กำหนดแล้วเสร็จ (Deadline)
                </label>
                <input
                  type="date"
                  id="input-deadline-date"
                  value={deadlineDate}
                  onChange={e => setDeadlineDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อลูกค้า / บริษัท <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-customer-name"
                  placeholder="เช่น บริษัท แมกโนเลียฯ"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อโครงการ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-project-name"
                  placeholder="เช่น The Forestias Signature"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Site Contact Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ผู้ติดต่อหน้างาน
                </label>
                <input
                  type="text"
                  placeholder="ชื่อผู้ประสานงานหน้างาน"
                  value={siteContactName}
                  onChange={e => setSiteContactName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Site Contact Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เบอร์โทรหน้างาน
                </label>
                <input
                  type="tel"
                  placeholder="08x-xxx-xxxx"
                  value={siteContactPhone}
                  onChange={e => setSiteContactPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Site Contact Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมลผู้ติดต่อหน้างาน
                </label>
                <input
                  type="email"
                  placeholder="contact@company.com"
                  value={siteContactEmail}
                  onChange={e => setSiteContactEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Sales Owner */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เซลล์เจ้าของงาน <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-sales-owner"
                  value={salesOwner}
                  onChange={e => setSalesOwner(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  required
                >
                  <option value="">-- เลือกเซลล์เจ้าของงาน --</option>
                  {salesStaff.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.team})
                    </option>
                  ))}
                </select>
              </div>

              {/* Admin Requester */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  แอดมินผู้ร้องขอ
                </label>
                <select
                  id="select-admin-requester"
                  value={adminRequester}
                  onChange={e => setAdminRequester(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  {adminStaff.map(a => (
                    <option key={a.id} value={a.name}>
                      {a.name} (Admin Sale)
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 2: 4 Main Work Categories (Turn Active Red when checked + 100 char text) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-amber-600" /> 2. หมวดหมู่งานหลัก 4 ด้าน (เมื่อติ๊กถูก ป้ายจะเปลี่ยนเป็นสีแดง Active)
              </h3>
              <span className="text-[11px] text-slate-500">* ข้อความเพิ่มเติมจำกัด 100 ตัวอักษรต่อหมวด</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Category 1: ขอเข้า Service */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  categories.service
                    ? 'border-red-500 bg-red-50/40 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="chk-service"
                      checked={categories.service}
                      onChange={() => handleCategoryToggle('service')}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                    />
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                        categories.service
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      1. ขอเข้า Service
                    </span>
                  </label>
                  {categories.service && (
                    <span className="text-[11px] font-bold text-red-600">Active</span>
                  )}
                </div>

                {categories.service && (
                  <div className="mt-3 space-y-1">
                    <input
                      type="text"
                      id="input-service-note"
                      placeholder="ระบุรายละเอียดงาน Service (จำกัด 100 ตัวอักษร)"
                      value={categories.serviceNote}
                      onChange={e => handleCategoryNoteChange('serviceNote', e.target.value)}
                      maxLength={100}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-red-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <div className="text-[10px] text-right text-slate-500 font-mono">
                      {categories.serviceNote.length}/100 ตัวอักษร
                    </div>
                  </div>
                )}
              </div>

              {/* Category 2: ขอนับแบบ */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  categories.countingDrawing
                    ? 'border-red-500 bg-red-50/40 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="chk-counting-drawing"
                      checked={categories.countingDrawing}
                      onChange={() => handleCategoryToggle('countingDrawing')}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                    />
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                        categories.countingDrawing
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      2. ขอนับแบบ
                    </span>
                  </label>
                  {categories.countingDrawing && (
                    <span className="text-[11px] font-bold text-red-600">Active</span>
                  )}
                </div>

                {categories.countingDrawing && (
                  <div className="mt-3 space-y-1">
                    <input
                      type="text"
                      id="input-counting-drawing-note"
                      placeholder="ระบุรายละเอียดงานนับแบบ (จำกัด 100 ตัวอักษร)"
                      value={categories.countingDrawingNote}
                      onChange={e => handleCategoryNoteChange('countingDrawingNote', e.target.value)}
                      maxLength={100}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-red-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <div className="text-[10px] text-right text-slate-500 font-mono">
                      {categories.countingDrawingNote.length}/100 ตัวอักษร
                    </div>
                  </div>
                )}
              </div>

              {/* Category 3: เข้าประชุมหรือ Mock up */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  categories.meetingOrMockup
                    ? 'border-red-500 bg-red-50/40 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="chk-meeting-mockup"
                      checked={categories.meetingOrMockup}
                      onChange={() => handleCategoryToggle('meetingOrMockup')}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                    />
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                        categories.meetingOrMockup
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      3. เข้าประชุมหรือ Mock up
                    </span>
                  </label>
                  {categories.meetingOrMockup && (
                    <span className="text-[11px] font-bold text-red-600">Active</span>
                  )}
                </div>

                {categories.meetingOrMockup && (
                  <div className="mt-3 space-y-1">
                    <input
                      type="text"
                      id="input-meeting-mockup-note"
                      placeholder="ระบุรายละเอียดเข้าประชุม/Mock up (จำกัด 100 ตัวอักษร)"
                      value={categories.meetingOrMockupNote}
                      onChange={e => handleCategoryNoteChange('meetingOrMockupNote', e.target.value)}
                      maxLength={100}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-red-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <div className="text-[10px] text-right text-slate-500 font-mono">
                      {categories.meetingOrMockupNote.length}/100 ตัวอักษร
                    </div>
                  </div>
                )}
              </div>

              {/* Category 4: งานเคลมสินค้า */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  categories.claimProduct
                    ? 'border-red-500 bg-red-50/40 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="chk-claim-product"
                      checked={categories.claimProduct}
                      onChange={() => handleCategoryToggle('claimProduct')}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                    />
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                        categories.claimProduct
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      4. งานเคลมสินค้า
                    </span>
                  </label>
                  {categories.claimProduct && (
                    <span className="text-[11px] font-bold text-red-600">Active</span>
                  )}
                </div>

                {categories.claimProduct && (
                  <div className="mt-3 space-y-1">
                    <input
                      type="text"
                      id="input-claim-product-note"
                      placeholder="ระบุรายละเอียดการเคลมสินค้า/รุ่นโคม (จำกัด 100 ตัวอักษร)"
                      value={categories.claimProductNote}
                      onChange={e => handleCategoryNoteChange('claimProductNote', e.target.value)}
                      maxLength={100}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-red-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <div className="text-[10px] text-right text-slate-500 font-mono">
                      {categories.claimProductNote.length}/100 ตัวอักษร
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 3: 3 Priority Alert Boxes */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> 3. ระดับความสำคัญ (Priority Alert Boxes)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Red: Alert (ด่วนที่สุด) */}
              <label
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  priority === 'alert_emergency'
                    ? 'border-red-600 bg-red-50 text-red-950 shadow-md ring-2 ring-red-500/20'
                    : 'border-slate-200 bg-white hover:border-red-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                    🛑 กล่องแดง: Alert (ด่วนที่สุด)
                  </span>
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === 'alert_emergency'}
                    onChange={() => setPriority('alert_emergency')}
                    className="text-red-600 focus:ring-red-500"
                  />
                </div>
                <div className="mt-2 text-xs text-red-800 font-medium">
                  ต้องเข้าปฏิบัติงาน <strong>ภายใน 24 ชั่วโมง</strong>
                </div>
              </label>

              {/* Yellow: Alert (ด่วน) */}
              <label
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  priority === 'alert_urgent'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    🛑 กล่องเหลือง: Alert (ด่วน)
                  </span>
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === 'alert_urgent'}
                    onChange={() => setPriority('alert_urgent')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                </div>
                <div className="mt-2 text-xs text-amber-800 font-medium">
                  ต้องเข้าปฏิบัติงาน <strong>ภายใน 2-3 วัน</strong>
                </div>
              </label>

              {/* Green: Alert (ปกติ) */}
              <label
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  priority === 'alert_normal'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    🛑 กล่องสีเขียว: Alert (ปกติ)
                  </span>
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === 'alert_normal'}
                    onChange={() => setPriority('alert_normal')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
                <div className="mt-2 text-xs text-emerald-800 font-medium">
                  แผนงานตามนัดหมายมาตรฐาน
                </div>
              </label>

            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 4: Work Details (Limited to 200 chars) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                รายละเอียดงานที่ต้องทำ <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[11px] font-mono ${workDetails.length >= 190 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                {workDetails.length}/200 ตัวอักษร
              </span>
            </div>
            <textarea
              id="textarea-work-details"
              rows={3}
              placeholder="ระบุข้อกำหนด วัตถุประสงค์ หรือปัญหาที่เกิดขึ้นหน้างาน (จำกัดไม่เกิน 200 ตัวอักษร)"
              value={workDetails}
              onChange={e => {
                if (e.target.value.length <= 200) {
                  setWorkDetails(e.target.value);
                }
              }}
              maxLength={200}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
              required
            />
          </div>

          {/* Section 5: Report Option */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">
                ตัวเลือกการออกรายงาน (Report Option):
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-report-yes"
                  onClick={() => setNeedReport(true)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    needReport
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ต้องการ report
                </button>
                <button
                  type="button"
                  id="btn-report-no"
                  onClick={() => setNeedReport(false)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    !needReport
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ไม่ต้องการ report
                </button>
              </div>
            </div>

            {needReport && (
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ระบุ E-mail ลูกค้าสำหรับจัดส่ง Report:
                </label>
                <input
                  type="email"
                  id="input-customer-report-email"
                  placeholder="เช่น client.pm@project.com"
                  value={customerReportEmail}
                  onChange={e => setCustomerReportEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-blue-300 bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Section 6: Storage & Attachments */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-indigo-600" /> Storage & Attachments (การจัดเก็บและแนบไฟล์)
            </h3>

            {/* Server / Share Drive Link */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ช่องใส่ลิงก์ Server / Share Drive (เช่น NAS, Google Drive, SharePoint):
              </label>
              <input
                type="url"
                id="input-server-link"
                placeholder="https://share.lumencraft.internal/drawings/..."
                value={serverShareDriveLink}
                onChange={e => setServerShareDriveLink(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Real File Upload from machine */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label className="block text-xs font-bold text-slate-700">
                  อัปโหลดไฟล์จริงจากเครื่อง (Drawing, Photo, Video, Document, Report):
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                  <span className="text-slate-500 font-semibold">หมวดหมู่ไฟล์:</span>
                  {[
                    { key: 'drawing', label: 'Drawing (แบบแปลน)', color: 'bg-blue-100 text-blue-800 border-blue-300' },
                    { key: 'photo', label: 'Photo (รูปภาพ)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                    { key: 'video', label: 'Video (วิดีโอ)', color: 'bg-amber-100 text-amber-800 border-amber-300' },
                    { key: 'document', label: 'Document (เอกสาร)', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
                    { key: 'report', label: 'Report (รายงาน)', color: 'bg-purple-100 text-purple-800 border-purple-300' },
                  ].map(cat => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setUploadCategory(cat.key as AttachmentItem['type'])}
                      className={`px-2 py-0.5 rounded-lg border font-semibold transition ${
                        uploadCategory === cat.key
                          ? `${cat.color} ring-1 ring-offset-1 font-bold shadow-xs`
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag & Drop Upload Box */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`p-4 border-2 border-dashed rounded-xl transition text-center ${
                  isDragging
                    ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/20'
                    : 'border-slate-300 bg-slate-50/70 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition transform active:scale-95">
                    <Upload className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                    เลือกไฟล์จากเครื่อง (Upload Files)
                    <input
                      type="file"
                      multiple
                      onChange={e => handleFileUpload(e, uploadCategory)}
                      className="hidden"
                      accept=".dwg,.dxf,.pdf,.png,.jpg,.jpeg,.webp,.mp4,.mov,.webm,.xlsx,.docx,.doc,.txt"
                    />
                  </label>
                  <span className="text-xs text-slate-500">
                    หรือลากไฟล์มาวางที่นี่ (รองรับ Drawing CAD, รูปภาพหน้างาน, วิดีโอ, PDF, Report)
                  </span>
                </div>
              </div>

              {/* Uploaded Files List */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-1">
                    <span>ไฟล์แนบทั้งหมด ({attachments.length} ไฟล์) - สามารถกดดู/พิมพ์ได้:</span>
                    <span className="text-[11px] text-amber-600 font-bold">💡 คลิกที่ไฟล์เพื่อเปิดดู Preview หรือกดสั่งพิมพ์</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attachments.map((att, idx) => {
                      const isImg = att.type === 'photo' || (att.fileData && att.fileData.startsWith('data:image/'));
                      return (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-amber-400 transition group"
                        >
                          <div 
                            onClick={() => openFileViewer(idx)}
                            className="flex items-center space-x-2.5 truncate cursor-pointer flex-1 mr-2"
                            title="คลิกเพื่อเปิดดูไฟล์และสั่งพิมพ์"
                          >
                            {isImg && att.fileData ? (
                              <img src={att.fileData} alt="" className="w-9 h-9 rounded object-cover border border-slate-200 shrink-0" />
                            ) : att.type === 'drawing' ? (
                              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                <FileCode className="w-5 h-5" />
                              </div>
                            ) : att.type === 'photo' ? (
                              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                <Image className="w-5 h-5" />
                              </div>
                            ) : att.type === 'video' ? (
                              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                <Film className="w-5 h-5" />
                              </div>
                            ) : att.type === 'report' ? (
                              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                                <File className="w-5 h-5" />
                              </div>
                            )}

                            <div className="truncate text-left">
                              <div className="font-bold text-slate-800 text-xs truncate group-hover:text-blue-600">
                                {att.name}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                                  att.type === 'drawing' ? 'bg-blue-100 text-blue-700' :
                                  att.type === 'photo' ? 'bg-emerald-100 text-emerald-700' :
                                  att.type === 'video' ? 'bg-amber-100 text-amber-700' :
                                  att.type === 'report' ? 'bg-purple-100 text-purple-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {att.type}
                                </span>
                                <span>{(att.size / 1024).toFixed(0)} KB</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => openFileViewer(idx)}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 text-[11px] font-bold transition flex items-center gap-1"
                              title="เปิดดูและสั่งพิมพ์ไฟล์นี้"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">ดู/พิมพ์</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeAttachment(att.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                              title="ลบไฟล์"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 7: Admin Digital Signature */}
          <div>
            <SignaturePad
              signerName={adminRequester}
              roleLabel="Admin Sale"
              onSave={url => setAdminSignatureUrl(url)}
              existingSignatureUrl={adminSignatureUrl}
            />
          </div>

          {/* Action Buttons (+ New, Preview, Cancel/Close, ACCEPT) */}
          <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                id="btn-admin-new-bottom"
                onClick={handleCreateNewForm}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-sm transition transform active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                + สร้าง new (New Request)
              </button>

              <button
                type="button"
                id="btn-admin-preview-bottom"
                onClick={handlePreviewForm}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition transform active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5 text-indigo-200" />
                Preview ฟอร์ม (ตัวอย่างเอกสาร)
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                id="btn-admin-cancel-bottom"
                onClick={handleClose}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                <X className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                ปิด / ยกเลิก (Close)
              </button>

              <button
                type="submit"
                id="btn-admin-accept"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/25 transition transform active:scale-95"
              >
                <Send className="w-4 h-4 mr-2" />
                ACCEPT (ส่งรายการไปให้เซลล์อนุมัติ)
              </button>
            </div>

          </div>

        </div>
      </form>

      {/* Internal Document Print / Preview Modal */}
      {previewRequest && (
        <DocumentPrintModal
          request={previewRequest}
          onClose={() => setPreviewRequest(null)}
        />
      )}

      {/* File Viewer & Print Modal for Attachments */}
      <FileViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        files={attachments}
        initialIndex={previewFileIndex}
        docNumber={currentDocNumber}
        projectName={projectName}
        soNumber={soNumber}
      />


    </div>
  );
};

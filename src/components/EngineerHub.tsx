import React, { useState } from 'react';
import { 
  Wrench, AlertTriangle, CheckCircle2, Clock, MapPin, Camera,
  Calendar, Upload, Send, PenTool, Check, X, ShieldAlert, ArrowRight,
  FileText, MessageSquare, Image, Navigation, Play, CheckCircle,
  Eye, Printer, FileCode, Film, File, Image as ImageIcon,
  Download, ExternalLink, Trash2, Plus, FolderOpen, FilePlus, User,
  Search, Filter, ListFilter, UserCheck, Star, Sparkles, Building2, Phone,
  ChevronRight, History, Layers, CheckCheck, RefreshCw
} from 'lucide-react';
import { 
  EEngineerRequest, StaffMember, EngineerInquiry, CheckInData, AttachmentItem, WorkPhotoItem 
} from '../types';
import { SignaturePad } from './SignaturePad';
import { createAuditLog } from '../utils/storage';
import { FileViewerModal } from './FileViewerModal';
import { DocumentPrintModal } from './DocumentPrintModal';
import { EngineerCalendarModal } from './EngineerCalendarModal';
import { calculateEngineerStatus } from '../utils/engineerStatus';

interface EngineerHubProps {
  requests: EEngineerRequest[];
  staff: StaffMember[];
  inquiries: EngineerInquiry[];
  onUpdateRequest: (updated: EEngineerRequest) => void;
  onReplyInquiry: (inquiryId: string, replyMessage: string, signatureUrl: string) => void;
  onOpenCalendar: () => void;
  onOpenStatus: () => void;
  onOpenLocation: () => void;
}

export const EngineerHub: React.FC<EngineerHubProps> = ({
  requests,
  staff,
  inquiries,
  onUpdateRequest,
  onReplyInquiry,
  onOpenCalendar,
  onOpenStatus,
  onOpenLocation,
}) => {
  const [selectedEngineerName, setSelectedEngineerName] = useState<string>('all');

  // Attachment Viewer & Print states
  const [activeViewerRequest, setActiveViewerRequest] = useState<EEngineerRequest | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [printDocRequest, setPrintDocRequest] = useState<EEngineerRequest | null>(null);

  // Calendar Checker Modal inside Accept flow
  const [isAcceptCalendarOpen, setIsAcceptCalendarOpen] = useState(false);

  const handleDownloadFile = (att: AttachmentItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = att.fileData || att.url;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = att.name || `attachment_${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Accept modal state & real file upload from machine
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [chosenEngineer, setChosenEngineer] = useState<string>('พัด');
  const [confirmedDeadline, setConfirmedDeadline] = useState<string>('');
  const [tempSignatureUrl, setTempSignatureUrl] = useState<string>('');
  const [acceptAttachments, setAcceptAttachments] = useState<AttachmentItem[]>([]);
  const [acceptUploadCategory, setAcceptUploadCategory] = useState<AttachmentItem['type']>('drawing');
  const [acceptIsDragging, setAcceptIsDragging] = useState(false);

  const processAcceptFiles = (files: FileList | File[], categoryOverride?: AttachmentItem['type']) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((f, i) => {
      let type: AttachmentItem['type'] = categoryOverride || acceptUploadCategory || 'drawing';
      
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
          type = acceptUploadCategory === 'drawing' ? 'drawing' : 'document';
        } else if (lowerName.match(/\.(doc|docx|xls|xlsx|ppt|pptx|txt)$/)) {
          type = 'document';
        }
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newItem: AttachmentItem = {
          id: `eng_att_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          name: f.name,
          size: f.size,
          type,
          fileData: dataUrl,
          url: dataUrl,
          uploadedAt: new Date().toISOString(),
          uploadedBy: `ช่าง${chosenEngineer} (วิศวกร)`
        };
        setAcceptAttachments(prev => [...prev, newItem]);
      };
      reader.readAsDataURL(f);
    });
  };

  const handleRemoveAcceptAttachment = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAcceptAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Cancel / Reject modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Reschedule modal state
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleReason, setRescheduleReason] = useState<string>('');
  const [sitePrepNote, setSitePrepNote] = useState<string>('');

  // Check-in modal state
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [checkInAddress, setCheckInAddress] = useState<string>('One Bangkok, ถนนพระราม 4 แขวงลุมพินี เขตปทุมวัน กทม.');
  const [checkInCoords, setCheckInCoords] = useState<{ lat: number; lng: number }>({ lat: 13.7288, lng: 100.5475 });
  const [checkInPhotoUrl, setCheckInPhotoUrl] = useState<string>('');
  const [isFetchingGPS, setIsFetchingGPS] = useState<boolean>(false);

  // Before & After Work Photos Completion Modal State
  const [completingReq, setCompletingReq] = useState<EEngineerRequest | null>(null);
  const [workPhotosList, setWorkPhotosList] = useState<WorkPhotoItem[]>([]);
  const [activePhotoStageTab, setActivePhotoStageTab] = useState<'before' | 'after'>('before');
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  // Inquiries Reply state
  const [replyingInquiryId, setReplyingInquiryId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>('');

  // Tab & Search states for engineer jobs view
  const [activeJobTab, setActiveJobTab] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'inquiries'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'alert_emergency' | 'urgent'>('all');

  const engineers = staff.filter(s => s.team === 'Engineer');

  // Filter requests by chosen engineer
  const allEngineerRequests = requests.filter(r => {
    if (selectedEngineerName === 'all') return true;
    return r.assignedEngineer === selectedEngineerName;
  });

  // Filter helper for search & priority
  const filterList = (list: EEngineerRequest[]) => {
    return list.filter(r => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchSO = r.soNumber?.toLowerCase().includes(q);
        const matchDoc = r.docNumber?.toLowerCase().includes(q);
        const matchProj = r.projectName?.toLowerCase().includes(q);
        const matchCust = r.customerName?.toLowerCase().includes(q);
        const matchSales = r.salesOwner?.toLowerCase().includes(q);
        const matchEng = r.assignedEngineer?.toLowerCase().includes(q);
        const matchDetails = r.workDetails?.toLowerCase().includes(q);
        const matchLoc = r.checkInData?.address?.toLowerCase().includes(q);
        if (!matchSO && !matchDoc && !matchProj && !matchCust && !matchSales && !matchEng && !matchDetails && !matchLoc) {
          return false;
        }
      }
      if (priorityFilter !== 'all') {
        if (r.priority !== priorityFilter) return false;
      }
      return true;
    });
  };

  // Raw Categorized requests for selected engineer (for tabs & badges)
  const rawPendingAcceptTasks = allEngineerRequests.filter(r => r.status === 'pending_engineer_accept');
  const rawReadyTasks = allEngineerRequests.filter(r => r.status === 'ready_for_site');
  const rawPendingTotalTasks = allEngineerRequests.filter(r => r.status === 'pending_engineer_accept' || r.status === 'ready_for_site');
  const rawInProgressTasks = allEngineerRequests.filter(r => r.status === 'in_progress');
  const rawCompletedTasks = allEngineerRequests.filter(r => ['completed_by_engineer', 'completed_by_customer', 'closed'].includes(r.status));

  // Filtered requests after search query & priority filter
  const newIncomingTasks = filterList(rawPendingAcceptTasks);
  const readyTasks = filterList(rawReadyTasks);
  const pendingTotalTasks = filterList(rawPendingTotalTasks);
  const inProgressTasks = filterList(rawInProgressTasks);
  const completedTasks = filterList(rawCompletedTasks);
  const allFilteredRequests = filterList(allEngineerRequests);

  // Inquiries for engineers
  const pendingInquiries = inquiries.filter(i => {
    if (selectedEngineerName === 'all') return true;
    return i.engineerName === selectedEngineerName;
  });

  // Action: Accept Task
  const handleConfirmAccept = (req: EEngineerRequest, autoPrint: boolean = false) => {
    if (!tempSignatureUrl) {
      alert('กรุณาลงนามดิจิทัลยืนยันการรับงาน');
      return;
    }

    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    const updated: EEngineerRequest = {
      ...req,
      assignedEngineer: chosenEngineer,
      deadlineDate: confirmedDeadline || req.deadlineDate || req.targetDate,
      status: 'ready_for_site',
      attachments: acceptAttachments.length > 0 ? acceptAttachments : (req.attachments || []),
      engineerSignature: {
        signerName: `${chosenEngineer} (Engineer)`,
        role: 'Engineer',
        signatureDataUrl: tempSignatureUrl,
        signedAt: timeStr,
      },
      history: [
        ...req.history,
        createAuditLog(
          'วิศวกรตอบรับงาน',
          chosenEngineer,
          'Engineer',
          `ยืนยันรับงานและพร้อมลงพื้นที่ในวันที่ ${req.targetDate} (กำหนดเสร็จ: ${confirmedDeadline || req.targetDate}) - ไฟล์แนบ SO: ${acceptAttachments.length} รายการ`
        )
      ],
      updatedAt: timeStr,
    };

    onUpdateRequest(updated);
    setAcceptingId(null);
    setTempSignatureUrl('');
    setAcceptAttachments([]);

    if (autoPrint) {
      setPrintDocRequest(updated);
    }
  };

  // Action: Reject / Cancel Task
  const handleConfirmReject = (req: EEngineerRequest) => {
    if (!rejectReason.trim()) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธงาน');
      return;
    }
    if (!tempSignatureUrl) {
      alert('กรุณาลงนามดิจิทัลก่อนปฏิเสธ');
      return;
    }

    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    const engineerName = req.assignedEngineer || chosenEngineer;

    const updated: EEngineerRequest = {
      ...req,
      status: 'engineer_rejected',
      engineerRejectReason: rejectReason.trim(),
      engineerSignature: {
        signerName: `${engineerName} (Engineer)`,
        role: 'Engineer',
        signatureDataUrl: tempSignatureUrl,
        signedAt: timeStr,
        remark: rejectReason.trim(),
      },
      history: [
        ...req.history,
        createAuditLog(
          'วิศวกรปฏิเสธ/ส่งคืนงาน',
          engineerName,
          'Engineer',
          `ปฏิเสธเนื่องจาก: ${rejectReason.trim()}`
        )
      ],
      updatedAt: timeStr,
    };

    onUpdateRequest(updated);
    setRejectingId(null);
    setRejectReason('');
    setTempSignatureUrl('');
  };

  // Action: Propose Reschedule
  const handleConfirmReschedule = (req: EEngineerRequest) => {
    if (!rescheduleDate) {
      alert('กรุณาเลือกวันนัดหมายใหม่ที่เสนอ');
      return;
    }

    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
    const engineerName = req.assignedEngineer || chosenEngineer;

    const updated: EEngineerRequest = {
      ...req,
      status: 'engineer_rescheduled',
      engineerRescheduleDate: rescheduleDate,
      engineerRescheduleReason: rescheduleReason.trim(),
      engineerSitePreparation: sitePrepNote.trim(),
      history: [
        ...req.history,
        createAuditLog(
          'วิศวกรขอเลื่อนวันนัด',
          engineerName,
          'Engineer',
          `เสนอวันใหม่ ${rescheduleDate} (เหตุผล: ${rescheduleReason || '-'})`
        )
      ],
      updatedAt: timeStr,
    };

    onUpdateRequest(updated);
    setReschedulingId(null);
    setRescheduleDate('');
    setRescheduleReason('');
    setSitePrepNote('');
  };

  // Action: Live GPS Fetch
  const handleGetRealGPS = () => {
    if (!navigator.geolocation) {
      alert('เบราว์เซอร์ไม่รองรับ GPS');
      return;
    }
    setIsFetchingGPS(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCheckInCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setCheckInAddress(`พิกัด GPS จริง (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}) ถ.พระราม 4 กรุงเทพฯ`);
        setIsFetchingGPS(false);
      },
      err => {
        console.warn(err);
        setIsFetchingGPS(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Action: Photo capture / file upload for check-in
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCheckInPhotoUrl(url);
    }
  };

  // Action: Complete Check-in
  const handleConfirmCheckIn = (req: EEngineerRequest) => {
    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
    const engineerName = req.assignedEngineer || 'วิศวกร';

    const checkInData: CheckInData = {
      latitude: checkInCoords.lat,
      longitude: checkInCoords.lng,
      address: checkInAddress,
      checkInTime: timeStr,
      photoUrl: checkInPhotoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
      engineerName,
    };

    const updated: EEngineerRequest = {
      ...req,
      checkInData,
      status: 'in_progress',
      history: [
        ...req.history,
        createAuditLog(
          'Check-in หน้างาน (GPS Verified)',
          engineerName,
          'Engineer',
          `เช็คอิน ณ ${checkInAddress} (พิกัด: ${checkInCoords.lat}, ${checkInCoords.lng})`
        )
      ],
      updatedAt: timeStr,
    };

    onUpdateRequest(updated);
    setCheckingInId(null);
    setCheckInPhotoUrl('');
  };

  // Action: Open Complete Work & Photos Modal
  const handleOpenCompleteModal = (req: EEngineerRequest) => {
    setCompletingReq(req);
    setWorkPhotosList(req.workPhotos ? [...req.workPhotos] : []);
    setActivePhotoStageTab('before');
  };

  // Action: Upload work photo (Before or After)
  const processWorkPhotosUpload = (files: FileList | File[], stage: 'before' | 'after') => {
    if (!files || files.length === 0) return;
    const engineerName = completingReq?.assignedEngineer || 'วิศวกร';

    Array.from(files).forEach((f, i) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newPhoto: WorkPhotoItem = {
          id: `wp_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          url: dataUrl,
          fileData: dataUrl,
          name: f.name,
          size: f.size,
          stage,
          description: '', // Empty initially, user can enter up to 150 chars in the box underneath
          uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          uploadedBy: `ช่าง${engineerName} (Engineer)`
        };
        setWorkPhotosList(prev => [...prev, newPhoto]);
      };
      reader.readAsDataURL(f);
    });
  };

  // Action: Update photo description (Strict max 150 chars)
  const handleUpdatePhotoDescription = (photoId: string, desc: string) => {
    const trimmed = desc.slice(0, 150);
    setWorkPhotosList(prev => prev.map(p => p.id === photoId ? { ...p, description: trimmed } : p));
  };

  // Action: Remove work photo
  const handleRemoveWorkPhoto = (photoId: string) => {
    setWorkPhotosList(prev => prev.filter(p => p.id !== photoId));
  };

  // Action: Save photos without changing status
  const handleSaveWorkPhotosOnly = () => {
    if (!completingReq) return;
    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
    const engineerName = completingReq.assignedEngineer || chosenEngineer || 'วิศวกร';

    const updated: EEngineerRequest = {
      ...completingReq,
      workPhotos: workPhotosList,
      history: [
        ...completingReq.history,
        createAuditLog(
          'อัปเดตรูปถ่ายก่อน-หลังแก้ไข',
          engineerName,
          'Engineer',
          `บันทึกรูปผลงาน ${workPhotosList.length} รูป (ก่อนแก้ไข: ${workPhotosList.filter(p => p.stage === 'before').length}, หลังแก้ไข: ${workPhotosList.filter(p => p.stage === 'after').length})`
        )
      ],
      updatedAt: timeStr,
    };

    onUpdateRequest(updated);
    setCompletingReq(null);
  };

  // Action: Complete job (Handover to Customer Portal) with Before/After Photos
  const handleConfirmCompleteJobWithPhotos = () => {
    if (!completingReq) return;
    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
    const engineerName = completingReq.assignedEngineer || chosenEngineer || 'วิศวกร';

    const beforeCount = workPhotosList.filter(p => p.stage === 'before').length;
    const afterCount = workPhotosList.filter(p => p.stage === 'after').length;

    const updated: EEngineerRequest = {
      ...completingReq,
      status: 'completed_by_engineer',
      workPhotos: workPhotosList,
      history: [
        ...completingReq.history,
        createAuditLog(
          'ส่งมอบงานสำเร็จ (Complete)',
          engineerName,
          'Engineer',
          `ปฏิบัติหน้าที่เสร็จสิ้น แนบรูปก่อนแก้ไข (${beforeCount} รูป) และรูปหลังแก้ไข (${afterCount} รูป) ส่งต่อระบบประเมินความพึงพอใจลูกค้า 5 มิติ`
        )
      ],
      updatedAt: timeStr,
    };

    onUpdateRequest(updated);
    setCompletingReq(null);
  };

  // Action: Reply to inquiry
  const handleSendReply = (inqId: string) => {
    if (!replyMessage.trim()) {
      alert('กรุณาระบุข้อความตอบกลับ');
      return;
    }
    if (!tempSignatureUrl) {
      alert('กรุณาลงนามดิจิทัลก่อนตอบกลับ');
      return;
    }

    onReplyInquiry(inqId, replyMessage.trim(), tempSignatureUrl);
    setReplyingInquiryId(null);
    setReplyMessage('');
    setTempSignatureUrl('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Engineer Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded bg-amber-600 text-white font-black text-xs">
              Engineer Hub
            </span>
            <span className="text-xs text-slate-400">
              ศูนย์ปฏิบัติการช่าง & ตรวจรับงานหน้างาน
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-400" />
            ศูนย์งานวิศวกร & ระบบเช็คอินหน้างาน (Engineer Operations)
          </h2>
        </div>

        {/* Filters & Real-time Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={selectedEngineerName}
            onChange={e => setSelectedEngineerName(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">-- กรองช่างทุกคน (4 ท่าน) --</option>
            {engineers.map(eng => (
              <option key={eng.id} value={eng.name}>
                ช่าง{eng.name} ({eng.workStatus === 'busy' ? 'กำลังทำงาน' : eng.workStatus === 'waiting' ? 'รองาน' : 'ว่าง'})
              </option>
            ))}
          </select>

          <button
            id="btn-eng-open-calendar"
            onClick={onOpenCalendar}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 shadow-sm transition"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            ปฏิทินงาน Real-Time
          </button>

          <button
            id="btn-eng-open-status"
            onClick={onOpenStatus}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 shadow-sm transition"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            สถานะ Real-Time
          </button>

          <button
            id="btn-eng-open-location"
            onClick={onOpenLocation}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 shadow-sm transition"
          >
            <MapPin className="w-3.5 h-3.5 mr-1.5" />
            พิกัด GPS Real-Time
          </button>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 👷 เลือกดูงานในมือตามลิสต์รายชื่อวิศวกร (Engineer Work Queues) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-600" />
              <span>เลือกลิสต์รายชื่อวิศวกร เพื่อดูงานในมือของตัวเอง (Engineer Task Queue)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              เลือกวิศวกรเพื่อกรองดู: งานค้าง • งานรอดำเนินการ • งานเสร็จแล้ว พร้อม SO No., เซลล์เจ้าของงาน และวันเวลา
            </p>
          </div>
          {selectedEngineerName !== 'all' && (
            <button
              onClick={() => setSelectedEngineerName('all')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>แสดงวิศวกรทุกคน (All)</span>
            </button>
          )}
        </div>

        {/* Engineer Selection Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. All Engineers Card */}
          <button
            type="button"
            onClick={() => setSelectedEngineerName('all')}
            className={`p-3.5 rounded-xl border text-left transition relative overflow-hidden flex flex-col justify-between ${
              selectedEngineerName === 'all'
                ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                  selectedEngineerName === 'all' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">รวมทุกคน</div>
                  <div className="text-[10px] text-slate-500">วิศวกร 4 ท่าน</div>
                </div>
              </div>
              {selectedEngineerName === 'all' && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/60 grid grid-cols-3 gap-1 text-center">
              <div className="bg-white/80 py-1 px-0.5 rounded border border-slate-200">
                <div className="text-[9px] text-slate-500 font-bold">รอ</div>
                <div className="text-xs font-black text-amber-600">
                  {requests.filter(r => r.status === 'pending_engineer_accept' || r.status === 'ready_for_site').length}
                </div>
              </div>
              <div className="bg-white/80 py-1 px-0.5 rounded border border-slate-200">
                <div className="text-[9px] text-slate-500 font-bold">ค้าง</div>
                <div className="text-xs font-black text-blue-600">
                  {requests.filter(r => r.status === 'in_progress').length}
                </div>
              </div>
              <div className="bg-white/80 py-1 px-0.5 rounded border border-slate-200">
                <div className="text-[9px] text-slate-500 font-bold">เสร็จ</div>
                <div className="text-xs font-black text-emerald-600">
                  {requests.filter(r => ['completed_by_engineer', 'completed_by_customer', 'closed'].includes(r.status)).length}
                </div>
              </div>
            </div>
          </button>

          {/* 2. Individual Engineer Cards */}
          {engineers.map(eng => {
            const engStatus = calculateEngineerStatus(eng.name, requests);
            const isSelected = selectedEngineerName === eng.name;
            const engReqs = requests.filter(r => r.assignedEngineer === eng.name);
            const engPending = engReqs.filter(r => r.status === 'pending_engineer_accept' || r.status === 'ready_for_site').length;
            const engInProgress = engReqs.filter(r => r.status === 'in_progress').length;
            const engCompleted = engReqs.filter(r => ['completed_by_engineer', 'completed_by_customer', 'closed'].includes(r.status)).length;

            return (
              <button
                key={eng.id}
                type="button"
                onClick={() => setSelectedEngineerName(eng.name)}
                className={`p-3.5 rounded-xl border text-left transition relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                      isSelected ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-800 text-white'
                    }`}>
                      {eng.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">ช่าง{eng.name}</div>
                      <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${engStatus.badgeColor}`}>
                        {engStatus.text}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                </div>

                {/* Counters for Pending / In Progress (ค้าง) / Completed */}
                <div className="mt-3 pt-2 border-t border-slate-200/60 grid grid-cols-3 gap-1 text-center">
                  <div className="bg-white/80 py-1 px-0.5 rounded border border-slate-200">
                    <div className="text-[9px] text-amber-700 font-bold">รอ</div>
                    <div className="text-xs font-black text-amber-700">{engPending}</div>
                  </div>
                  <div className="bg-white/80 py-1 px-0.5 rounded border border-slate-200">
                    <div className="text-[9px] text-blue-700 font-bold">ค้าง</div>
                    <div className="text-xs font-black text-blue-700">{engInProgress}</div>
                  </div>
                  <div className="bg-white/80 py-1 px-0.5 rounded border border-slate-200">
                    <div className="text-[9px] text-emerald-700 font-bold">เสร็จ</div>
                    <div className="text-xs font-black text-emerald-700">{engCompleted}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 📑 แท็บหมวดหมู่งาน & ช่องค้นหา (Work Status Filter Tabs & Search) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Status Tabs (ทั้งหมด, งานรอดำเนินการ, งานค้าง/กำลังทำ, งานเสร็จแล้ว, ข้อซักถาม) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
            <button
              type="button"
              onClick={() => setActiveJobTab('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeJobTab === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>งานทั้งหมด</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeJobTab === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {allFilteredRequests.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveJobTab('pending')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeJobTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>⚡ งานรอดำเนินการ</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeJobTab === 'pending' ? 'bg-amber-800 text-white' : 'bg-amber-200 text-amber-900'
              }`}>
                {pendingTotalTasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveJobTab('in_progress')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeJobTab === 'in_progress'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>⏳ งานค้าง / กำลังทำ</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeJobTab === 'in_progress' ? 'bg-blue-800 text-white' : 'bg-blue-200 text-blue-900'
              }`}>
                {inProgressTasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveJobTab('completed')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeJobTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>✅ งานเสร็จแล้ว</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeJobTab === 'completed' ? 'bg-emerald-800 text-white' : 'bg-emerald-200 text-emerald-900'
              }`}>
                {completedTasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveJobTab('inquiries')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeJobTab === 'inquiries'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>💬 ข้อซักถามฝ่ายขาย</span>
              {pendingInquiries.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeJobTab === 'inquiries' ? 'bg-purple-800 text-white' : 'bg-purple-200 text-purple-900'
                }`}>
                  {pendingInquiries.length}
                </span>
              )}
            </button>
          </div>

          {/* Priority filter pills */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] text-slate-500 font-semibold mr-1">ความเร่งด่วน:</span>
            <button
              type="button"
              onClick={() => setPriorityFilter('all')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                priorityFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => setPriorityFilter('alert_emergency')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                priorityFilter === 'alert_emergency' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              🚨 ด่วนที่สุด
            </button>
            <button
              type="button"
              onClick={() => setPriorityFilter('urgent')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                priorityFilter === 'urgent' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              ⚡ ด่วน
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ค้นหา SO No., ชื่อโครงการ, เซลล์เจ้าของงาน, ชื่อลูกค้า, หรือรายละเอียดงาน..."
            className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Active Engineer Display Banner */}
      {selectedEngineerName !== 'all' && (
        <div className="bg-amber-500/10 border border-amber-300 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-bold text-amber-900">
              กำลังแสดงงานในมือของ: <span className="text-sm font-black text-amber-800 underline">ช่าง{selectedEngineerName}</span>
            </span>
            <span className="text-[11px] text-amber-700">
              (งานทั้งหมด {allFilteredRequests.length} รายการ | ค้าง {inProgressTasks.length} | รอ {pendingTotalTasks.length} | เสร็จ {completedTasks.length})
            </span>
          </div>
          <button
            onClick={() => setSelectedEngineerName('all')}
            className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>ดูทุกคน</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. 🛑 กล่องแดงกระพริบ (มีงานใหม่เข้ามา): Pending Engineer Accept */}
      {/* ======================================================== */}
      {(activeJobTab === 'all' || activeJobTab === 'pending') && newIncomingTasks.length > 0 && (
        <div className="border-2 border-red-600 bg-red-500/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-red-700 flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              🛑 กล่องแดงกระพริบ: มีงานใหม่เข้ามา รอวิศวกรตอบรับ ({newIncomingTasks.length} รายการ)
            </h3>
            <span className="text-xs px-3 py-1 rounded-full bg-red-600 text-white font-bold animate-pulse">
              New Assignment
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newIncomingTasks.map(req => (
              <div key={req.id} className="bg-white rounded-xl border border-red-300 p-5 shadow-sm space-y-4">
                
                {/* Header with SO and Doc Number */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-600 text-white font-black text-xs tracking-wider shadow-xs">
                        <span className="text-[10px] text-red-200 uppercase font-semibold">SO:</span>
                        <span className="text-sm font-mono">{req.soNumber}</span>
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {req.docNumber}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        req.priority === 'alert_emergency' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.priority === 'alert_emergency' ? '🚨 ด่วนที่สุด (24 ชม.)' : '⚡ ด่วน (2-3 วัน)'}
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

                {/* Details box */}
                <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-slate-700">
                  <div><span className="font-semibold text-slate-900">แอดมินผู้ขอ:</span> {req.adminRequester}</div>
                  <div>
                    <span className="font-semibold text-slate-900">เซลล์เจ้าของงาน:</span>{' '}
                    <span className="font-bold text-red-600">คุณ{req.salesOwner}</span>
                  </div>
                  <div><span className="font-semibold text-slate-900">วันที่ต้องการเข้า:</span> {req.targetDate}</div>
                  <div><span className="font-semibold text-slate-900">กำหนดเสร็จ:</span> {req.deadlineDate || req.targetDate}</div>
                  <div className="text-slate-600 pt-1 border-t border-slate-200"><span className="font-semibold text-slate-900">รายละเอียดงาน:</span> {req.workDetails}</div>

                  {/* 📁 Attached Files & Drawing blueprints (ไฟล์ที่แนบมากับ SO นี้) */}
                  {((req.attachments && req.attachments.length > 0) || req.serverShareDriveLink) && (
                    <div className="pt-2.5 border-t border-slate-200 mt-2 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5 text-blue-700">
                          <FileText className="w-3.5 h-3.5" /> ไฟล์แนบที่ส่งมากับ SO ({req.attachments?.length || 0} ไฟล์):
                        </span>
                        <span className="text-[10px] text-amber-600 font-bold">💡 คลิกดู / สั่งพิมพ์ / ดาวน์โหลด</span>
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
                                  title="คลิกเพื่อเปิดดูแบบแปลน/รูปภาพและสั่งพิมพ์"
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
                                    title="เปิดดูและสั่งพิมพ์ A4"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>ดู/พิมพ์</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => handleDownloadFile(att, e)}
                                    className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] shadow-2xs"
                                    title="ดาวน์โหลดไฟล์ลงเครื่อง"
                                  >
                                    <Download className="w-3 h-3" />
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

                {/* Sub-modals inside card */}
                {acceptingId === req.id ? (
                  <div className="p-4 bg-emerald-50/90 rounded-2xl border-2 border-emerald-400 space-y-4 shadow-md">
                    {/* Header with SO and doc info */}
                    <div className="flex items-start justify-between pb-3 border-b border-emerald-200">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-600 text-white font-mono font-black text-xs shadow-2xs">
                            SO: {req.soNumber}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-white text-slate-700 border border-slate-200">
                            {req.docNumber}
                          </span>
                        </div>
                        <h5 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> ยืนยันการรับงาน (OK รับงาน E-Form)
                        </h5>
                        <p className="text-xs text-slate-600 font-medium">
                          {req.projectName} • {req.customerName}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPrintDocRequest(req)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-2xs transition flex items-center gap-1.5 shrink-0"
                        title="เปิดดูเอกสารใบสั่งงานฉบับสมบูรณ์ A4 และสั่งพิมพ์"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-700" />
                        <span>เปิดดู / พิมพ์ A4</span>
                      </button>
                    </div>

                    {/* Section: Attached Files referencing this SO Number */}
                    <div className="p-3.5 rounded-xl bg-white border border-emerald-200 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                            <FolderOpen className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-900">
                              ไฟล์ที่แนบมากับ SO No. {req.soNumber}
                            </span>
                            <span className="text-[11px] text-slate-500 ml-1.5 font-semibold">
                              ({acceptAttachments.length} ไฟล์)
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          ดู/พิมพ์/ดาวน์โหลดได้ทุกไฟล์
                        </span>
                      </div>

                      {acceptAttachments.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                          ยังไม่มีไฟล์แนบใน SO นี้ (สามารถเลือกอัปโหลดไฟล์จริงจากเครื่องด้านล่างได้)
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                          {acceptAttachments.map((att, idx) => {
                            const isImg = att.type === 'photo' || (att.fileData && att.fileData.startsWith('data:image/')) || att.url?.startsWith('data:image/');
                            return (
                              <div
                                key={att.id || idx}
                                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-400 transition text-left group"
                              >
                                <div
                                  onClick={() => {
                                    // Make temporary request with current attachments for viewer
                                    setActiveViewerRequest({
                                      ...req,
                                      attachments: acceptAttachments
                                    });
                                    setActiveFileIndex(idx);
                                  }}
                                  className="flex items-center space-x-2 truncate cursor-pointer flex-1 mr-1.5"
                                  title="คลิกดูไฟล์ขนาดใหญ่และสั่งพิมพ์"
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

                                  <div className="truncate">
                                    <div className="font-bold text-slate-800 text-[11px] truncate group-hover:text-blue-600">
                                      {att.name}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                                      <span className="font-semibold uppercase text-slate-600">{att.type}</span>
                                      <span>•</span>
                                      <span>{(att.size / 1024).toFixed(0)} KB</span>
                                      <span>•</span>
                                      <span className="text-emerald-700 font-semibold truncate max-w-[80px]">{att.uploadedBy || 'SO Attach'}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveViewerRequest({
                                        ...req,
                                        attachments: acceptAttachments
                                      });
                                      setActiveFileIndex(idx);
                                    }}
                                    className="px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] flex items-center gap-0.5 shadow-2xs"
                                    title="เปิดดูและสั่งพิมพ์ A4"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>ดู/พิมพ์</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => handleDownloadFile(att, e)}
                                    className="p-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] shadow-2xs"
                                    title="ดาวน์โหลดไฟล์ลงเครื่อง"
                                  >
                                    <Download className="w-3 h-3" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => handleRemoveAcceptAttachment(att.id, e)}
                                    className="p-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px]"
                                    title="ลบไฟล์นี้ออกจากรายการ"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Real File Upload from Machine (อัปโหลดไฟล์จริงจากเครื่อง) */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-emerald-600" />
                            <span>อัปโหลดไฟล์จริงจากเครื่อง (แนบเพิ่มเติมใน SO No. {req.soNumber}):</span>
                          </label>
                          <span className="text-[10px] text-slate-500 font-medium">
                            รองรับ CAD, DWG, DXF, รูปภาพ, วิดีโอ, PDF, DOCX
                          </span>
                        </div>

                        {/* Category Selector Tabs */}
                        <div className="flex flex-wrap gap-1">
                          {[
                            { key: 'drawing', label: 'แบบแปลน (Drawing/CAD)', icon: FileCode, color: 'text-blue-600' },
                            { key: 'photo', label: 'ภาพถ่ายหน้างาน (Photo)', icon: ImageIcon, color: 'text-emerald-600' },
                            { key: 'video', label: 'วิดีโอหน้างาน (Video)', icon: Film, color: 'text-amber-600' },
                            { key: 'document', label: 'เอกสารสเปก (Document)', icon: FileText, color: 'text-indigo-600' },
                            { key: 'report', label: 'รายงาน (Report)', icon: File, color: 'text-rose-600' },
                          ].map((cat) => {
                            const IconComponent = cat.icon;
                            const isSelected = acceptUploadCategory === cat.key;
                            return (
                              <button
                                key={cat.key}
                                type="button"
                                onClick={() => setAcceptUploadCategory(cat.key as AttachmentItem['type'])}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border transition ${
                                  isSelected 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <IconComponent className={`w-3 h-3 ${isSelected ? 'text-amber-300' : cat.color}`} />
                                <span>{cat.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Drag & Drop Upload Zone */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setAcceptIsDragging(true);
                          }}
                          onDragLeave={() => setAcceptIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setAcceptIsDragging(false);
                            if (e.dataTransfer.files) {
                              processAcceptFiles(e.dataTransfer.files);
                            }
                          }}
                          className={`relative border-2 border-dashed rounded-xl p-3 text-center transition ${
                            acceptIsDragging 
                              ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]' 
                              : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60'
                          }`}
                        >
                          <input
                            type="file"
                            multiple
                            id={`eng_file_upload_${req.id}`}
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) {
                                processAcceptFiles(e.target.files);
                              }
                            }}
                          />
                          <label
                            htmlFor={`eng_file_upload_${req.id}`}
                            className="cursor-pointer flex flex-col items-center justify-center space-y-1 py-1"
                          >
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                              <FilePlus className="w-4 h-4" />
                            </div>
                            <div className="text-xs font-bold text-slate-800">
                              คลิกเพื่อเลือกไฟล์จริงจากคอมพิวเตอร์ หรือลากไฟล์มาวางที่นี่
                            </div>
                            <div className="text-[10px] text-slate-500">
                              เลือกหมวด: <span className="font-bold text-emerald-700 uppercase">{acceptUploadCategory}</span> (สามารถอัปโหลดได้หลายไฟล์พร้อมกัน)
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Engineer selection & deadline with real-time status & calendar checker */}
                    <div className="p-3.5 rounded-xl bg-white border border-emerald-300 shadow-2xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div>
                          <label className="block text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            <span>เลือกวิศวกรผู้รับผิดชอบ & ตรวจสอบสถานะงาน:</span>
                          </label>
                          <p className="text-[11px] text-slate-500">
                            สถานะ (<span className="text-emerald-700 font-bold">ว่าง</span> / <span className="text-amber-700 font-bold">รองาน</span> / <span className="text-rose-700 font-bold">กำลังทำงาน</span>) คำนวณแบบ Real-time โดยอิงจากวันกำหนดเสร็จและงานที่ถืออยู่
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsAcceptCalendarOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-2xs cursor-pointer"
                          title="เปิดดูปฏิทินตรวจเช็คสถานะและตารางงานวิศวกรทั้งหมด"
                        >
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>📅 ตรวจเช็คปฏิทินสถานะ & คิวงาน</span>
                        </button>
                      </div>

                      {/* Visual Engineer Status Cards Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {engineers.map(eng => {
                          const summary = calculateEngineerStatus(eng.name, requests);
                          const isSelected = chosenEngineer === eng.name;

                          return (
                            <div
                              key={eng.id}
                              onClick={() => setChosenEngineer(eng.name)}
                              className={`p-2.5 rounded-xl border-2 cursor-pointer transition text-left relative flex flex-col justify-between ${
                                isSelected 
                                  ? 'border-emerald-600 bg-emerald-50/90 shadow-xs ring-2 ring-emerald-500/20' 
                                  : 'border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-white'
                              }`}
                            >
                              {isSelected && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                              )}

                              <div>
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                                  }`}>
                                    {eng.name.charAt(0)}
                                  </div>
                                  <span className={`text-xs font-black truncate ${isSelected ? 'text-emerald-950 font-black' : 'text-slate-800'}`}>
                                    ช่าง{eng.name}
                                  </span>
                                </div>

                                <div className="mt-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border ${summary.badgeBg}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      summary.status === 'ว่าง' ? 'bg-emerald-500 animate-pulse' : summary.status === 'รองาน' ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}></span>
                                    {summary.status}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-2 pt-1.5 border-t border-slate-200/80 text-[10px] text-slate-500 leading-tight">
                                {summary.activeCount === 0 ? (
                                  <span className="text-emerald-700 font-semibold">✓ 0 งานค้าง (ว่าง)</span>
                                ) : (
                                  <div>
                                    <span className="font-semibold text-slate-700">ค้าง {summary.activeCount} งาน</span>
                                    {summary.latestDeadline && (
                                      <div className="text-[9px] text-rose-700 font-medium truncate" title={`กำหนดเสร็จ: ${summary.latestDeadline}`}>
                                        เสร็จ: <strong>{summary.latestDeadline}</strong>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Fallback/Sync Dropdown & Deadline Date Input */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block font-bold text-slate-700 text-xs mb-1">
                            วิศวกรที่เลือก (Selected Engineer):
                          </label>
                          <select
                            value={chosenEngineer}
                            onChange={e => setChosenEngineer(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                          >
                            {engineers.map(e => {
                              const s = calculateEngineerStatus(e.name, requests);
                              return (
                                <option key={e.id} value={e.name}>
                                  ช่าง{e.name} — [{s.status}] {s.activeCount === 0 ? '(0 งานค้าง)' : `(${s.activeCount} งานค้าง • เสร็จ: ${s.latestDeadline || 'ตามนัด'})`}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block font-bold text-slate-700 text-xs">
                              กำหนดวันเสร็จ (Deadline Date):
                            </label>
                            <button
                              type="button"
                              onClick={() => setConfirmedDeadline(req.deadlineDate || req.targetDate)}
                              className="text-[10px] text-emerald-700 hover:underline font-bold"
                            >
                              ใช้วันนัดหมาย ({req.deadlineDate || req.targetDate})
                            </button>
                          </div>
                          <input
                            type="date"
                            value={confirmedDeadline}
                            onChange={e => setConfirmedDeadline(e.target.value)}
                            placeholder={req.deadlineDate || req.targetDate}
                            className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Signature Pad */}
                    <SignaturePad
                      signerName={chosenEngineer}
                      roleLabel="Engineer (เซ็นต์รับทราบ)"
                      onSave={url => setTempSignatureUrl(url)}
                    />

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        onClick={() => handleConfirmAccept(req, false)}
                        className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center justify-center gap-1.5 transition"
                      >
                        <Check className="w-4 h-4" />
                        <span>ยืนยัน OK รับงาน</span>
                      </button>
                      <button
                        onClick={() => handleConfirmAccept(req, true)}
                        className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-sm flex items-center justify-center gap-1.5 transition"
                        title="ยืนยันรับงานและเปิดหน้าต่างสั่งพิมพ์เอกสาร A4 ทันที"
                      >
                        <Printer className="w-4 h-4" />
                        <span>OK รับงาน & พิมพ์ A4 ทันที</span>
                      </button>
                      <button
                        onClick={() => {
                          setAcceptingId(null);
                          setTempSignatureUrl('');
                          setAcceptAttachments([]);
                        }}
                        className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : rejectingId === req.id ? (
                  <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 space-y-3">
                    <h5 className="text-xs font-bold text-red-800">
                      ปฏิเสธงาน (Cancel) & ส่งกลับฝ่ายขาย:
                    </h5>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ระบุเหตุผลที่ปฏิเสธ (เช่น หน้างานไม่มีนั่งร้าน, ขาดอุปกรณ์):
                      </label>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="ระบุเหตุผลชัดเจน..."
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <SignaturePad
                      signerName="วิศวกร"
                      roleLabel="Engineer"
                      onSave={url => setTempSignatureUrl(url)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirmReject(req)}
                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow"
                      >
                        ยืนยันปฏิเสธ & ส่งให้เซลล์รับทราบ
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setTempSignatureUrl('');
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-200 text-slate-700"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : reschedulingId === req.id ? (
                  <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 space-y-3">
                    <h5 className="text-xs font-bold text-sky-800">
                      เสนอเลื่อนวันนัดหมาย (Reschedule):
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">เสนอวันเข้าใหม่:</label>
                        <input
                          type="date"
                          value={rescheduleDate}
                          onChange={e => setRescheduleDate(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">สิ่งที่หน้างานต้องเตรียม:</label>
                        <input
                          type="text"
                          value={sitePrepNote}
                          onChange={e => setSitePrepNote(e.target.value)}
                          placeholder="เช่น เปิดระบบไฟ, บัตร Work Permit"
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">เหตุผลการขอเลื่อน:</label>
                      <input
                        type="text"
                        value={rescheduleReason}
                        onChange={e => setRescheduleReason(e.target.value)}
                        placeholder="เช่น ติดงานโปรเจกต์เดิม..."
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirmReschedule(req)}
                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow"
                      >
                        ส่งข้อเสนอวันใหม่ให้ฝ่ายขาย
                      </button>
                      <button
                        onClick={() => setReschedulingId(null)}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-200 text-slate-700"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard 3 Action Buttons */
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setAcceptingId(req.id);
                        setChosenEngineer(req.assignedEngineer || 'พัด');
                        setConfirmedDeadline(req.deadlineDate || req.targetDate);
                        setAcceptAttachments(req.attachments ? [...req.attachments] : []);
                      }}
                      className="flex-1 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      OK รับงาน
                    </button>
                    <button
                      onClick={() => setReschedulingId(req.id)}
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition"
                    >
                      เลื่อนวันนัด
                    </button>
                    <button
                      onClick={() => setRejectingId(req.id)}
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-sm transition"
                    >
                      Cancel ปฏิเสธ
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. On Appointment Date & Check-in / In-Progress Tasks */}
      {/* ======================================================== */}
      {(activeJobTab === 'all' || activeJobTab === 'pending' || activeJobTab === 'in_progress') && (
        <div className={`grid gap-6 ${activeJobTab === 'all' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          
          {/* Left Column: Ready for site -> Check-in */}
          {(activeJobTab === 'all' || activeJobTab === 'pending') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              On Appointment Date & Check-in ({readyTasks.length} รายการ)
            </h3>
            <span className="text-xs text-slate-500">รอเช็คอินเมื่อถึงวันนัดหมาย</span>
          </div>

          {readyTasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              ไม่มีงานที่รอดำเนินการเช็คอินในขณะนี้
            </div>
          ) : (
            <div className="space-y-3">
              {readyTasks.map(req => (
                <div key={req.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-blue-600">SO: {req.soNumber}</span>
                      <h4 className="font-bold text-slate-900">{req.projectName}</h4>
                      <p className="text-slate-500">{req.customerName}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPrintDocRequest(req)}
                        className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200 shadow-2xs flex items-center gap-1"
                        title="พิมพ์เอกสาร A4"
                      >
                        <Printer className="w-3 h-3" />
                        <span>A4</span>
                      </button>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[11px]">
                        นัดหมาย: {req.targetDate}
                      </span>
                    </div>
                  </div>

                  {/* Attached files chips */}
                  {req.attachments && req.attachments.length > 0 && (
                    <div className="p-2 rounded-lg bg-white border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span className="flex items-center gap-1 text-blue-700">
                          <FileText className="w-3 h-3" /> ไฟล์แนบ ({req.attachments.length}):
                        </span>
                        <span className="text-[10px] text-amber-600">คลิกดู / สั่งพิมพ์ / ดาวน์โหลด</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {req.attachments.map((att, idx) => (
                          <div
                            key={att.id || idx}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[10px] font-semibold"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveViewerRequest(req);
                                setActiveFileIndex(idx);
                              }}
                              className="flex items-center gap-1 text-slate-700 hover:text-blue-700 max-w-[100px] truncate"
                              title="คลิกเพื่อดูและสั่งพิมพ์ A4"
                            >
                              <FileCode className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="truncate">{att.name}</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDownloadFile(att, e)}
                              className="text-slate-400 hover:text-slate-800 p-0.5"
                              title="ดาวน์โหลดไฟล์"
                            >
                              <Download className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {checkingInId === req.id ? (
                    <div className="p-3 bg-white rounded-lg border border-rose-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-700 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> ดึงพิกัด GPS จริงหน้างาน:
                        </span>
                        <button
                          type="button"
                          onClick={handleGetRealGPS}
                          disabled={isFetchingGPS}
                          className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 font-bold text-[11px] hover:bg-rose-100"
                        >
                          {isFetchingGPS ? 'กำลังดึง...' : 'ดึงพิกัด GPS ปัจจุบัน'}
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border">
                        <div><strong>พิกัด:</strong> {checkInCoords.lat.toFixed(4)}, {checkInCoords.lng.toFixed(4)}</div>
                        <div><strong>สถานที่:</strong> {checkInAddress}</div>
                      </div>

                      {/* Photo capture upload */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          อัปโหลดรูปช่างคู่กับหน้างาน:
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-800 text-white font-bold text-[11px]">
                            <Camera className="w-3 h-3 mr-1" /> ถ่ายรูป / เลือกรูป
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                          {checkInPhotoUrl && (
                            <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                              <Check className="w-3 h-3" /> แนบรูปภาพแล้ว
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleConfirmCheckIn(req)}
                          className="flex-1 py-2 rounded-lg font-bold bg-rose-600 hover:bg-rose-500 text-white shadow"
                        >
                          ยืนยัน Check-in & เริ่มปฏิบัติงาน
                        </button>
                        <button
                          onClick={() => setCheckingInId(null)}
                          className="px-3 py-2 rounded-lg font-bold bg-slate-200 text-slate-700"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setCheckingInId(req.id);
                        handleGetRealGPS();
                      }}
                      className="w-full py-2 rounded-lg font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      On Appointment Date & Check-in (เช็คอินหน้างาน)
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Right Column: In-Progress -> Complete Handover to Customer Portal */}
        {(activeJobTab === 'all' || activeJobTab === 'in_progress') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-500" />
              งานกำลังดำเนินการ & ส่งมอบงาน (In-Progress: {inProgressTasks.length} รายการ)
            </h3>
            <span className="text-xs text-slate-500">พร้อมส่งมอบงานให้ลูกค้าประเมิน</span>
          </div>

          {inProgressTasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              ไม่มีงานที่อยู่ระหว่างดำเนินการในขณะนี้
            </div>
          ) : (
            <div className="space-y-3">
              {inProgressTasks.map(req => (
                <div key={req.id} className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-emerald-700">SO: {req.soNumber}</span>
                      <h4 className="font-bold text-slate-900">{req.projectName}</h4>
                      <p className="text-slate-500">{req.customerName}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPrintDocRequest(req)}
                        className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200 shadow-2xs flex items-center gap-1"
                        title="พิมพ์เอกสาร A4"
                      >
                        <Printer className="w-3 h-3" />
                        <span>A4</span>
                      </button>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> กำลังดำเนินการ
                      </span>
                    </div>
                  </div>

                  {/* Attached files chips */}
                  {req.attachments && req.attachments.length > 0 && (
                    <div className="p-2 rounded-lg bg-white border border-emerald-100 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span className="flex items-center gap-1 text-blue-700">
                          <FileText className="w-3 h-3" /> ไฟล์แนบ & แบบแปลน ({req.attachments.length}):
                        </span>
                        <span className="text-[10px] text-amber-600">คลิกดู / สั่งพิมพ์ / ดาวน์โหลด</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {req.attachments.map((att, idx) => (
                          <div
                            key={att.id || idx}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[10px] font-semibold"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveViewerRequest(req);
                                setActiveFileIndex(idx);
                              }}
                              className="flex items-center gap-1 text-slate-700 hover:text-blue-700 max-w-[100px] truncate"
                              title="คลิกเพื่อดูและสั่งพิมพ์ A4"
                            >
                              <FileCode className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="truncate">{att.name}</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDownloadFile(att, e)}
                              className="text-slate-400 hover:text-slate-800 p-0.5"
                              title="ดาวน์โหลดไฟล์"
                            >
                              <Download className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {req.checkInData && (
                    <div className="text-[11px] bg-white p-2.5 rounded-lg border border-emerald-100 space-y-1 text-slate-600">
                      <div><strong>เช็คอินเมื่อ:</strong> {req.checkInData.checkInTime}</div>
                      <div><strong>สถานที่:</strong> {req.checkInData.address}</div>
                    </div>
                  )}

                  {/* Work Photos indicator & quick management */}
                  {req.workPhotos && req.workPhotos.length > 0 ? (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-amber-800 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                          รูปภาพผลงาน ({req.workPhotos.length} รูป):
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ก่อน: {req.workPhotos.filter(p => p.stage === 'before').length} | หลัง: {req.workPhotos.filter(p => p.stage === 'after').length}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {req.workPhotos.slice(0, 4).map((p, pIdx) => (
                          <div key={p.id || pIdx} className="flex items-center gap-1.5 p-1 rounded bg-white border border-amber-100 text-[10px]">
                            <img src={p.url} alt={p.name} className="w-6 h-6 rounded object-cover border shrink-0" />
                            <div className="truncate">
                              <span className={`px-1 rounded text-[9px] font-bold ${p.stage === 'before' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {p.stage === 'before' ? 'ก่อน' : 'หลัง'}
                              </span>
                              <p className="truncate text-slate-600 text-[10px]">{p.description || p.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Camera className="w-3 h-3 text-slate-400" />
                        ยังไม่มีรูปก่อน-หลังแก้ไข
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenCompleteModal(req)}
                        className="text-amber-600 hover:text-amber-700 font-bold text-[10px] underline"
                      >
                        + เพิ่มรูปตอนนี้
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenCompleteModal(req)}
                      className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow transition flex items-center justify-center gap-1.5 text-xs"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>บันทึกรูปก่อน/หลังแก้ไข & ส่งมอบงาน (Complete)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

      </div>
      )}

      {/* ======================================================== */}
      {/* 3. ✅ งานเสร็จแล้ว (Completed Tasks Section) */}
      {/* ======================================================== */}
      {(activeJobTab === 'all' || activeJobTab === 'completed') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  ✅ งานที่เสร็จแล้ว (Completed & Handed-over Jobs)
                </h3>
                <p className="text-xs text-slate-500">
                  ประวัติงานที่วิศวกรส่งมอบเรียบร้อย พร้อมรูป Before / After, วันเวลา, และผลประเมิน
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {completedTasks.length} งาน
            </span>
          </div>

          {completedTasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              ไม่มีประวัติงานที่เสร็จสิ้นในหมวดหมู่นี้
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedTasks.map(req => (
                <div key={req.id} className="bg-slate-50/70 rounded-xl border border-emerald-200/70 p-4 space-y-3 text-xs shadow-2xs hover:border-emerald-400 transition">
                  
                  {/* Card Header: SO No., Doc No., & Status */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-700 text-white font-black text-xs font-mono">
                          <span className="text-[9px] text-emerald-200 uppercase font-semibold">SO:</span>
                          {req.soNumber}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-white text-slate-700 border border-slate-200">
                          {req.docNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" />
                          <span>ส่งมอบงานสำเร็จ</span>
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{req.projectName}</h4>
                      <p className="text-xs text-slate-500">{req.customerName}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPrintDocRequest(req)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-2xs"
                      title="เปิดดูและพิมพ์เอกสาร A4 รายงานปิดงาน"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-700" />
                      <span>พิมพ์ A4</span>
                    </button>
                  </div>

                  {/* Date & Time details */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 text-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                      <div><span className="font-semibold text-slate-900">📅 วันที่ขอรับบริการ:</span> {req.requestDate}</div>
                      <div><span className="font-semibold text-slate-900">⏱️ วันนัดหมาย:</span> {req.targetDate} {req.targetTime ? `(${req.targetTime})` : ''}</div>
                      <div><span className="font-semibold text-slate-900">🏁 กำหนดเสร็จ:</span> {req.deadlineDate || req.targetDate}</div>
                      <div><span className="font-semibold text-slate-900">🏆 ส่งมอบสำเร็จเมื่อ:</span> <span className="font-bold text-emerald-700">{req.updatedAt}</span></div>
                    </div>
                    <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div>
                        <span className="font-semibold text-slate-900">เซลล์เจ้าของงาน:</span>{' '}
                        <span className="font-bold text-slate-800">คุณ{req.salesOwner}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">วิศวกรผู้รับผิดชอบ:</span>{' '}
                        <span className="font-bold text-amber-800">ช่าง{req.assignedEngineer}</span>
                      </div>
                    </div>
                    <div className="pt-1.5 border-t border-slate-100 text-slate-600 text-[11px]">
                      <span className="font-semibold text-slate-900">รายละเอียดงาน:</span> {req.workDetails}
                    </div>
                  </div>

                  {/* Work Photos (Before / After) display */}
                  {req.workPhotos && req.workPhotos.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                          รูปภาพผลงาน ก่อนแก้ไข - หลังแก้ไข ({req.workPhotos.length} รูป):
                        </span>
                        <span className="text-[10px] text-emerald-700">
                          ก่อน: {req.workPhotos.filter(p => p.stage === 'before').length} | หลัง: {req.workPhotos.filter(p => p.stage === 'after').length}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {req.workPhotos.map((photo, pIdx) => (
                          <div key={photo.id || pIdx} className="bg-white rounded-lg p-1.5 border border-emerald-100 space-y-1">
                            <img src={photo.url} alt={photo.name} className="w-full h-20 rounded object-cover border border-slate-200" />
                            <div className="flex items-center justify-between text-[9px]">
                              <span className={`px-1 py-0.2 rounded font-bold ${
                                photo.stage === 'before' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {photo.stage === 'before' ? 'ก่อนแก้ไข' : 'หลังแก้ไข'}
                              </span>
                              <span className="text-slate-400">{photo.uploadedAt?.slice(11, 16)}</span>
                            </div>
                            {photo.description && (
                              <p className="text-[10px] text-slate-600 truncate">{photo.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer Evaluation (If available) */}
                  {req.customerEvaluation && (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between font-bold text-amber-900">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                          ผลการประเมินจากลูกค้า (คะแนนรวม {req.customerEvaluation.averageScore?.toFixed(1) || '-'}/5.0):
                        </span>
                        <span className="text-[10px] text-slate-500">{req.customerEvaluation.evaluatedAt}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-600 bg-white p-1.5 rounded border border-amber-100">
                        <div>ความเร็ว: ⭐{req.customerEvaluation.speedScore}</div>
                        <div>คุณภาพ: ⭐{req.customerEvaluation.qualityScore}</div>
                        <div>บริการ: ⭐{req.customerEvaluation.serviceScore}</div>
                      </div>
                      {req.customerEvaluation.comment && (
                        <p className="text-[10px] text-slate-700 italic">"{req.customerEvaluation.comment}"</p>
                      )}
                    </div>
                  )}

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPrintDocRequest(req)}
                      className="text-emerald-700 hover:text-emerald-800 font-bold text-xs flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>ดูเอกสารปิดงานฉบับสมบูรณ์</span>
                    </button>
                    {req.attachments && req.attachments.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveViewerRequest(req);
                          setActiveFileIndex(0);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูแบบแปลน/ไฟล์แนบ ({req.attachments.length})</span>
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. ตอบกลับข้อซักถามจากฝ่ายขาย (Inquiries Reply Hub) */}
      {/* ======================================================== */}
      {(activeJobTab === 'all' || activeJobTab === 'inquiries') && (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                ตอบกลับข้อซักถามจากฝ่ายขาย (Sales Inquiries Reply)
              </h3>
              <p className="text-xs text-slate-300">
                รองรับข้อความ 300 ตัวอักษร, แนบไฟล์, และลงนามดิจิทัลส่งกลับไปให้ฝ่ายขาย
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {pendingInquiries.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              ไม่มีข้อซักถามที่รอการตอบกลับ
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInquiries.map(inq => (
                <div key={inq.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-amber-700">{inq.soNumber}</span>
                      <span className="font-bold text-slate-900">{inq.projectName}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">
                        จาก: {inq.salesName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{inq.createdAt}</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700">
                    <span className="font-bold text-slate-900">คำถามจากเซลล์: </span>
                    {inq.message}
                  </div>

                  {inq.status === 'replied' ? (
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-900 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span>ช่าง{inq.engineerName} ได้ตอบกลับแล้ว:</span>
                        <span>{inq.repliedAt}</span>
                      </div>
                      <p>{inq.replyMessage}</p>
                    </div>
                  ) : replyingInquiryId === inq.id ? (
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <label className="font-bold text-slate-700">ข้อความตอบกลับ (จำกัด 300 ตัวอักษร):</label>
                          <span className="text-[10px] text-slate-400">{replyMessage.length}/300</span>
                        </div>
                        <textarea
                          rows={2}
                          maxLength={300}
                          value={replyMessage}
                          onChange={e => {
                            if (e.target.value.length <= 300) setReplyMessage(e.target.value);
                          }}
                          placeholder="พิมพ์ข้อความตอบกลับฝ่ายขาย..."
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 resize-none"
                        />
                      </div>

                      <SignaturePad
                        signerName={`ช่าง${inq.engineerName}`}
                        roleLabel="Engineer"
                        onSave={url => setTempSignatureUrl(url)}
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSendReply(inq.id)}
                          className="flex-1 py-2 rounded-lg font-bold bg-amber-600 hover:bg-amber-500 text-white shadow"
                        >
                          ส่งคำตอบกลับไปให้ฝ่ายขาย
                        </button>
                        <button
                          onClick={() => {
                            setReplyingInquiryId(null);
                            setTempSignatureUrl('');
                          }}
                          className="px-3 py-2 rounded-lg font-bold bg-slate-200 text-slate-700"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingInquiryId(inq.id)}
                      className="px-4 py-2 rounded-lg font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition"
                    >
                      ตอบกลับข้อซักถามนี้ (พร้อมลงนามดิจิทัล)
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
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

      {/* Before & After Work Photos and Completion Modal */}
      {completingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-slate-700 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shadow-md">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold">
                      SO: {completingReq.soNumber}
                    </span>
                    <span className="text-xs text-slate-300">
                      {completingReq.customerName}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                    บันทึกรูปภาพก่อน-หลังแก้ไข & ส่งมอบงาน (Before / After Photos)
                  </h3>
                  <p className="text-xs text-slate-300">
                    โครงการ: {completingReq.projectName} | ช่างผู้รับผิดชอบ: ช่าง{completingReq.assignedEngineer || chosenEngineer}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCompletingReq(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              
              {/* Category Tab Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActivePhotoStageTab('before')}
                  className={`p-3.5 rounded-xl border font-bold text-xs flex items-center justify-between transition ${
                    activePhotoStageTab === 'before'
                      ? 'bg-orange-50 border-orange-400 text-orange-900 shadow-sm ring-2 ring-orange-400/30'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    <span className="text-sm">1. รูปก่อนแก้ไข (Before Fix)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-orange-200/80 text-orange-900 text-xs">
                    {workPhotosList.filter(p => p.stage === 'before').length} รูป
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePhotoStageTab('after')}
                  className={`p-3.5 rounded-xl border font-bold text-xs flex items-center justify-between transition ${
                    activePhotoStageTab === 'after'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm ring-2 ring-emerald-400/30'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-sm">2. รูปหลังแก้ไข (After Fix)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-xs">
                    {workPhotosList.filter(p => p.stage === 'after').length} รูป
                  </span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingPhoto(true); }}
                onDragLeave={() => setIsDraggingPhoto(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingPhoto(false);
                  processWorkPhotosUpload(e.dataTransfer.files, activePhotoStageTab);
                }}
                className={`p-6 rounded-2xl border-2 border-dashed text-center transition flex flex-col items-center justify-center gap-2 ${
                  isDraggingPhoto
                    ? 'border-amber-500 bg-amber-50'
                    : activePhotoStageTab === 'before'
                    ? 'border-orange-300 bg-orange-50/40 hover:bg-orange-50/80'
                    : 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/80'
                }`}
              >
                <div className={`p-3 rounded-full ${activePhotoStageTab === 'before' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                    อัปโหลดรูปภาพ{activePhotoStageTab === 'before' ? 'ก่อนแก้ไข (Before Fix)' : 'หลังแก้ไข (After Fix)'}จากเครื่องคอมพิวเตอร์
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ลากไฟล์รูปภาพมาวางที่นี่ หรือกดปุ่มเพื่อเลือกไฟล์จากเครื่อง (รองรับ JPG, PNG, WEBP, GIF, กล้องถ่ายรูป)
                  </p>
                </div>

                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm bg-slate-900 hover:bg-slate-800 transition">
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>เลือกรูปจากเครื่องคอมพิวเตอร์ / ถ่ายรูป</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        processWorkPhotosUpload(e.target.files, activePhotoStageTab);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Photos List for Current Stage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    รายการรูปภาพ{activePhotoStageTab === 'before' ? 'ก่อนแก้ไข' : 'หลังแก้ไข'} ({workPhotosList.filter(p => p.stage === activePhotoStageTab).length} รูป)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    * กรุณากรอกกล่องอธิบายใต้รูปแต่ละภาพ (จำกัดไม่เกิน 150 ตัวอักษร)
                  </span>
                </div>

                {workPhotosList.filter(p => p.stage === activePhotoStageTab).length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-400">
                    ยังไม่มีรูปภาพในหมวดนี้ กดปุ่มอัปโหลดด้านบนเพื่อเพิ่มรูปภาพ
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workPhotosList.filter(p => p.stage === activePhotoStageTab).map((photo, idx) => (
                      <div
                        key={photo.id || idx}
                        className={`rounded-xl border p-3.5 bg-white shadow-xs space-y-2.5 transition ${
                          photo.stage === 'before' ? 'border-orange-200 hover:border-orange-300' : 'border-emerald-200 hover:border-emerald-300'
                        }`}
                      >
                        {/* Image Preview & Delete */}
                        <div className="relative rounded-lg overflow-hidden bg-slate-900 aspect-video group">
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            <a
                              href={photo.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-white/90 text-slate-800 text-xs font-bold flex items-center gap-1 hover:bg-white shadow"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>ดูรูปเต็ม</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveWorkPhoto(photo.id)}
                              className="p-1.5 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-red-700 shadow"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>ลบ</span>
                            </button>
                          </div>

                          <div className="absolute top-2 left-2 flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow ${
                              photo.stage === 'before' ? 'bg-orange-600 text-white' : 'bg-emerald-600 text-white'
                            }`}>
                              {photo.stage === 'before' ? '📷 รูปก่อนแก้ไข' : '📷 รูปหลังแก้ไข'} #{idx + 1}
                            </span>
                          </div>

                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/70 text-white text-[9px]">
                            {(photo.size / 1024).toFixed(0)} KB
                          </div>
                        </div>

                        {/* Description Box (150 chars max) */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <label className="font-bold text-slate-700 flex items-center gap-1">
                              <span>กล่องอธิบายรายละเอียดใต้รูป:</span>
                            </label>
                            <span className={`text-[10px] font-bold ${
                              photo.description.length >= 140
                                ? 'text-red-600'
                                : photo.description.length > 100
                                ? 'text-amber-600'
                                : 'text-slate-400'
                            }`}>
                              {photo.description.length}/150 ตัวอักษร
                            </span>
                          </div>

                          <textarea
                            value={photo.description}
                            onChange={(e) => handleUpdatePhotoDescription(photo.id, e.target.value)}
                            maxLength={150}
                            rows={2}
                            placeholder={
                              photo.stage === 'before'
                                ? 'ระบุรายละเอียดสภาพจุดติดตั้ง/ปัญหาที่พบก่อนแก้ไข เช่น โคมไฟกระพริบ, ข้อต่อหลวม (ไม่เกิน 150 ตัวอักษร)...'
                                : 'ระบุรายละเอียดผลการแก้ไข/การทดสอบหลังเปลี่ยนอุปกรณ์ เช่น เปลี่ยนหม้อแปลง 24V ใหม่ ทดสอบแสงนิ่งสม่ำเสมอ (ไม่เกิน 150 ตัวอักษร)...'
                            }
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50/50 resize-none transition"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Side-by-Side Summary Preview */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h5 className="text-xs font-bold text-slate-700">
                  สรุปความพร้อมส่งมอบงาน (Completion Readiness):
                </h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-orange-100/60 border border-orange-200 flex items-center justify-between">
                    <span className="font-bold text-orange-900">รูปก่อนแก้ไข (Before):</span>
                    <span className="font-extrabold text-orange-800">
                      {workPhotosList.filter(p => p.stage === 'before').length} ภาพ
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-100/60 border border-emerald-200 flex items-center justify-between">
                    <span className="font-bold text-emerald-900">รูปหลังแก้ไข (After):</span>
                    <span className="font-extrabold text-emerald-800">
                      {workPhotosList.filter(p => p.stage === 'after').length} ภาพ
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCompletingReq(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSaveWorkPhotosOnly}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition"
                >
                  💾 บันทึกรูปภาพไว้ก่อน (ยังไม่ส่งมอบงาน)
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirmCompleteJobWithPhotos}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>ยืนยันส่งมอบงานสำเร็จ (Complete) & ส่งต่อระบบประเมินลูกค้า 5 มิติ</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Engineer Calendar Modal (Invoked from Accept Task Modal) */}
      <EngineerCalendarModal
        isOpen={isAcceptCalendarOpen}
        onClose={() => setIsAcceptCalendarOpen(false)}
        requests={requests}
        staff={staff}
        onSelectEngineer={(engName) => {
          setChosenEngineer(engName);
          setIsAcceptCalendarOpen(false);
        }}
      />

    </div>
  );
};

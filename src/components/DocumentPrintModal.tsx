import React, { useState, useEffect } from 'react';
import { 
  Printer, X, Check, ShieldCheck, MapPin, Star, Calendar, Clock, 
  UserCheck, ArrowLeft, FileCode, Image as ImageIcon, Film, FileText, 
  FileCheck, File, Eye, Download, Link as LinkIcon, Camera,
  Layers, ZoomIn, ZoomOut, CheckCircle2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { EEngineerRequest, AttachmentItem } from '../types';
import { FileViewerModal } from './FileViewerModal';

interface DocumentPrintModalProps {
  request: EEngineerRequest | null;
  onClose: () => void;
}

export const DocumentPrintModal: React.FC<DocumentPrintModalProps> = ({
  request,
  onClose,
}) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [includeAttachmentsInPrint, setIncludeAttachmentsInPrint] = useState(true);
  const [previewZoom, setPreviewZoom] = useState<'fit' | '100' | '75'>('fit');
  const [activePreviewPage, setActivePreviewPage] = useState<'all' | number>('all');

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isViewerOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isViewerOpen]);

  if (!request) return null;

  // Determine pagination structure
  const hasPage2Evidence = !!(
    (request.workPhotos && request.workPhotos.length > 0) || 
    request.checkInData || 
    request.customerEvaluation
  );
  
  const attachmentPagesCount = (includeAttachmentsInPrint && request.attachments && request.attachments.length > 0) 
    ? request.attachments.length 
    : 0;

  const totalPages = 1 + (hasPage2Evidence ? 1 : 0) + attachmentPagesCount;
  const page2Number = hasPage2Evidence ? 2 : 0;
  const attachmentStartPageNumber = 1 + (hasPage2Evidence ? 1 : 0) + 1;

  const handlePrint = () => {
    window.print();
  };

  const handleOpenFile = (idx: number) => {
    setSelectedFileIndex(idx);
    setIsViewerOpen(true);
  };

  const handleDownloadFile = (att: AttachmentItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = att.fileData || att.url;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = att.name || `lumencraft-att-${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-start print:p-0 print:bg-white print:static print:overflow-visible"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      
      {/* ======================================================== */}
      {/* TOP ACTION & CONTROLS BAR (Hidden during print) */}
      {/* ======================================================== */}
      <div className="w-full bg-slate-900/95 backdrop-blur-md text-white px-4 sm:px-6 py-3 border-b border-slate-800 print:hidden sticky top-0 z-20 shadow-xl flex flex-wrap items-center justify-between gap-3">
        
        {/* Document Info */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">ตัวอย่างเอกสารจัดหน้า A4 (A4 Print Preview)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-bold border border-slate-700">
                {request.docNumber}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 hidden sm:inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> พอดีกระดาษ A4 สมมาตร ({totalPages} หน้า)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              จัดหน้ากระดาษ A4 สมมาตร พร้อมระบบแยกหน้าอัตโนมัติ (Auto Page Break) และเว้นขอบกระดาษมาตรฐาน
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          
          {/* Zoom / View Mode Options */}
          <div className="inline-flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setPreviewZoom('fit')}
              className={`px-2.5 py-1 rounded-md transition font-medium text-[11px] ${previewZoom === 'fit' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
              title="ปรับขนาดให้พอดีหน้าจอ"
            >
              พอดีจอ (Fit)
            </button>
            <button
              onClick={() => setPreviewZoom('100')}
              className={`px-2.5 py-1 rounded-md transition font-medium text-[11px] ${previewZoom === '100' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
              title="ขนาด 100% สัดส่วน A4 จริง"
            >
              100% A4 จริง
            </button>
          </div>

          {/* Page Filter in Preview */}
          {totalPages > 1 && (
            <div className="hidden md:inline-flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setActivePreviewPage('all')}
                className={`px-2.5 py-1 rounded-md transition text-[11px] ${activePreviewPage === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                ดูทั้งหมด ({totalPages} หน้า)
              </button>
              <button
                onClick={() => setActivePreviewPage(1)}
                className={`px-2 py-1 rounded-md transition text-[11px] ${activePreviewPage === 1 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                หน้า 1
              </button>
              {hasPage2Evidence && (
                <button
                  onClick={() => setActivePreviewPage(2)}
                  className={`px-2 py-1 rounded-md transition text-[11px] ${activePreviewPage === 2 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  หน้า 2
                </button>
              )}
              {attachmentPagesCount > 0 && (
                <button
                  onClick={() => setActivePreviewPage(attachmentStartPageNumber)}
                  className={`px-2 py-1 rounded-md transition text-[11px] ${typeof activePreviewPage === 'number' && activePreviewPage >= attachmentStartPageNumber ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  ภาคผนวก
                </button>
              )}
            </div>
          )}

          {/* Include Attachments Toggle */}
          {request.attachments && request.attachments.length > 0 && (
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 cursor-pointer hover:bg-slate-750 select-none">
              <input
                type="checkbox"
                checked={includeAttachmentsInPrint}
                onChange={(e) => setIncludeAttachmentsInPrint(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-600 cursor-pointer"
              />
              <span className="font-medium text-[11px]">พิมพ์รวมภาคผนวก ({request.attachments.length} ไฟล์)</span>
            </label>
          )}

          {/* Print Button */}
          <button
            id="btn-print-action-top"
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition transform active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            สั่งพิมพ์ A4 (Print / Save PDF)
          </button>

          {/* Close Button */}
          <button
            id="btn-close-print-top"
            onClick={onClose}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 border border-slate-700 transition shadow-sm cursor-pointer"
            title="ปิดหน้าต่างตัวอย่างการพิมพ์ (ESC)"
          >
            <X className="w-4 h-4 mr-1" />
            ปิด
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN PREVIEW SCROLL AREA (Centers A4 Sheets) */}
      {/* ======================================================== */}
      <div className={`w-full flex-1 flex flex-col items-center py-6 px-2 sm:px-4 print:p-0 print:py-0 print:w-full ${previewZoom === '100' ? 'overflow-x-auto' : ''}`}>
        
        <div 
          className={`a4-print-container flex flex-col items-center gap-8 print:gap-0 print:w-full transition-all duration-200 ${
            previewZoom === 'fit' 
              ? 'w-full max-w-[210mm]' 
              : previewZoom === '100' 
                ? 'w-[210mm] min-w-[210mm]' 
                : 'w-[160mm]'
          }`}
        >

          {/* ======================================================== */}
          {/* A4 PAGE 1: OFFICIAL SERVICE REQUEST FORM & SIGNATURES */}
          {/* ======================================================== */}
          {(activePreviewPage === 'all' || activePreviewPage === 1) && (
            <div className="a4-page-sheet w-full bg-white text-slate-900 rounded-lg shadow-2xl print:shadow-none print:rounded-none border border-slate-300 print:border-none p-6 sm:p-8 flex flex-col justify-between box-border min-h-[297mm] print:min-h-0 print:h-auto">
              
              <div className="space-y-4">
                
                {/* 1. Official Company Header */}
                <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded bg-slate-900 text-amber-400 font-black text-sm tracking-wider shadow-xs">
                        LUMENCRAFT
                      </span>
                      <span className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
                        บริษัท ลูเมนคราฟท์ จำกัด (LUMENCRAFT CO., LTD.)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 max-w-lg leading-tight">
                      125 อาคารอินฟินิท พัฒนาการ 13 แขวงสวนหลวง เขตสวนหลวง กรุงเทพมหานคร 10250
                    </p>
                  </div>

                  <div className="text-right space-y-0.5 shrink-0">
                    <span className="inline-block px-2.5 py-1 bg-slate-100 font-mono font-bold text-xs text-slate-900 border border-slate-300 rounded shadow-2xs">
                      {request.docNumber}
                    </span>
                    <div className="text-[10px] text-slate-500">
                      วันที่ออกเอกสาร: <span className="font-bold text-slate-800">{request.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* Document Title Header */}
                <div className="text-center py-2 bg-gradient-to-r from-slate-100 via-amber-50/40 to-slate-100 rounded-lg border border-slate-300 shadow-2xs">
                  <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-wide uppercase">
                    ใบขอรับบริการวิศวกรรมและเทคนิค (E-ENGINEER SERVICE REQUEST FORM)
                  </h1>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5">
                    เลขที่ใบสั่งขาย (Sales Order): <strong className="text-blue-700 font-mono">{request.soNumber}</strong> | 
                    สถานะปัจจุบัน: <strong className="uppercase text-slate-900">{request.status}</strong> |
                    ระดับความเร่งด่วน: <strong className={request.priority === 'alert_emergency' ? 'text-red-600' : 'text-amber-700'}>{request.priority}</strong>
                  </p>
                </div>

                {/* Section 1 & 2: Symmetrical 2-Column Info Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  
                  {/* Column 1: Project & Client Details */}
                  <div className="border border-slate-300 rounded-xl p-3 space-y-1.5 bg-slate-50/50 flex flex-col justify-between shadow-2xs">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs border-b border-slate-250 pb-1 flex items-center gap-1.5 text-blue-900">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        1. ข้อมูลโครงการและสถานที่ปฏิบัติงาน
                      </h3>
                      <div className="space-y-1 text-[11px] mt-1.5">
                        <div className="flex items-start gap-1">
                          <span className="font-semibold text-slate-500 shrink-0 w-20">ชื่อโครงการ:</span>
                          <strong className="text-slate-900 font-bold">{request.projectName}</strong>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="font-semibold text-slate-500 shrink-0 w-20">ชื่อลูกค้า/ผู้ว่าจ้าง:</span>
                          <span className="text-slate-800">{request.customerName}</span>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="font-semibold text-slate-500 shrink-0 w-20">ที่อยู่หน้างาน:</span>
                          <span className="text-slate-700 leading-snug line-clamp-2">{request.siteAddress}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 text-[10px] text-slate-600 flex items-center justify-between">
                      <span>ผู้ติดต่อ: <strong>{request.siteContactName}</strong></span>
                      <span>โทร: <strong>{request.siteContactPhone}</strong></span>
                    </div>
                  </div>

                  {/* Column 2: Service & Schedule Details */}
                  <div className="border border-slate-300 rounded-xl p-3 space-y-1.5 bg-slate-50/50 flex flex-col justify-between shadow-2xs">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs border-b border-slate-250 pb-1 flex items-center gap-1.5 text-amber-900">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        2. ข้อมูลบริการและกำหนดการ
                      </h3>
                      <div className="space-y-1 text-[11px] mt-1.5">
                        <div className="flex items-start gap-1">
                          <span className="font-semibold text-slate-500 shrink-0 w-24">ประเภทบริการ:</span>
                          <strong className="text-slate-900 font-bold">{request.serviceType}</strong>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="font-semibold text-slate-500 shrink-0 w-24">แอดมิน / เซลล์:</span>
                          <span className="text-slate-800">{request.adminRequester} / {request.salesOwner}</span>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="font-semibold text-slate-500 shrink-0 w-24">วิศวกรผู้รับผิดชอบ:</span>
                          <strong className="text-blue-900 font-bold">{request.assignedEngineer ? `ช่าง${request.assignedEngineer}` : 'ยังไม่ระบุ'}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 text-[10px] text-slate-600 flex items-center justify-between">
                      <span>วันนัดหมาย: <strong className="text-slate-900">{request.targetDate}</strong></span>
                      <span>กำหนดเสร็จ: <strong className="text-slate-900">{request.deadlineDate || request.targetDate}</strong></span>
                    </div>
                  </div>

                </div>

                {/* Section 3: Work Details & Required Tools */}
                <div className="border border-slate-300 rounded-xl p-3 space-y-2 shadow-2xs bg-white">
                  <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center justify-between">
                    <span>3. รายละเอียดขอบเขตงานและเครื่องมือที่ต้องจัดเตรียม</span>
                    <span className="text-[10px] font-normal text-slate-500">Scope of Work & Tools</span>
                  </h3>
                  <div className="text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/80">
                    {request.workDetails || '-'}
                  </div>
                  {request.requiredEquipment && (
                    <div className="text-[11px] text-amber-950 bg-amber-50/80 p-2 rounded-lg border border-amber-200 flex items-start gap-1.5">
                      <strong className="shrink-0 text-amber-900 font-bold">🛠️ อุปกรณ์/เครื่องมือพิเศษ:</strong>
                      <span>{request.requiredEquipment}</span>
                    </div>
                  )}
                </div>

                {/* Section 4: 5-Point Readiness Checklist */}
                <div className="border border-slate-300 rounded-xl p-3 space-y-2 shadow-2xs bg-white">
                  <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center justify-between">
                    <span>4. รายการตรวจสอบความพร้อมหน้างาน 5 ด้าน (Readiness Checklist)</span>
                    <span className="text-[10px] font-normal text-slate-500">Site Readiness Verification</span>
                  </h3>
                  <div className="grid grid-cols-5 gap-2 text-[10px] pt-0.5">
                    
                    <div className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center gap-1 ${request.siteChecklist?.drawingsReady ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] ${request.siteChecklist?.drawingsReady ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                        {request.siteChecklist?.drawingsReady ? '✓' : '✕'}
                      </span>
                      <span className="font-bold">1. แบบแปลน</span>
                      <span className="text-[9px] opacity-80">(Drawings)</span>
                    </div>

                    <div className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center gap-1 ${request.siteChecklist?.materialsReady ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] ${request.siteChecklist?.materialsReady ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                        {request.siteChecklist?.materialsReady ? '✓' : '✕'}
                      </span>
                      <span className="font-bold">2. สินค้า/อุปกรณ์</span>
                      <span className="text-[9px] opacity-80">(Materials)</span>
                    </div>

                    <div className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center gap-1 ${request.siteChecklist?.scaffoldingReady ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] ${request.siteChecklist?.scaffoldingReady ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                        {request.siteChecklist?.scaffoldingReady ? '✓' : '✕'}
                      </span>
                      <span className="font-bold">3. นั่งร้าน/บันได</span>
                      <span className="text-[9px] opacity-80">(Scaffolding)</span>
                    </div>

                    <div className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center gap-1 ${request.siteChecklist?.powerReady ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] ${request.siteChecklist?.powerReady ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                        {request.siteChecklist?.powerReady ? '✓' : '✕'}
                      </span>
                      <span className="font-bold">4. ระบบไฟ</span>
                      <span className="text-[9px] opacity-80">(Power System)</span>
                    </div>

                    <div className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center gap-1 ${request.siteChecklist?.coordinatorReady ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] ${request.siteChecklist?.coordinatorReady ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                        {request.siteChecklist?.coordinatorReady ? '✓' : '✕'}
                      </span>
                      <span className="font-bold">5. ผู้ประสานงาน</span>
                      <span className="text-[9px] opacity-80">(Coordinator)</span>
                    </div>

                  </div>
                </div>

                {/* Section 5: Attached files summary */}
                <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold text-slate-900">เอกสารและแบบแปลนแนบ e-Form:</span>
                    <span className="text-slate-600">
                      มีทั้งหมด <strong>{request.attachments?.length || 0} ไฟล์</strong> {request.serverShareDriveLink ? '(มีลิงก์ Cloud Drive)' : ''}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {includeAttachmentsInPrint && (request.attachments?.length || 0) > 0 ? (
                      <span className="text-emerald-700 font-bold">📄 รวมพิมพ์ในภาคผนวกต่อท้าย</span>
                    ) : (
                      <span>เปิดดูไฟล์ดิจิทัลได้ในระบบ</span>
                    )}
                  </div>
                </div>

                {/* Section 6: Official 4-Party Digital Signatures */}
                <div className="border-t-2 border-slate-900 pt-3 space-y-2 break-inside-avoid">
                  <h3 className="font-bold text-slate-900 text-xs text-center uppercase tracking-wider">
                    การลงนามดิจิทัลรับรองการปฏิบัติงาน 4 ฝ่าย (4-Party Digital Signature Verification)
                  </h3>

                  <div className="grid grid-cols-4 gap-2.5 text-center">
                    
                    {/* 1. Admin Sale */}
                    <div className="border border-slate-300 rounded-xl p-2 bg-slate-50/70 flex flex-col justify-between min-h-[120px] shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-700 block border-b border-slate-200 pb-1">
                        1. แอดมินผู้ขอ (Admin)
                      </span>
                      <div className="h-12 flex items-center justify-center my-0.5">
                        {request.adminSignature?.signatureDataUrl ? (
                          <img
                            src={request.adminSignature.signatureDataUrl}
                            alt="Admin Signature"
                            className="max-h-11 max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">(รอดำเนินการ)</span>
                        )}
                      </div>
                      <div className="border-t border-slate-200 pt-1 text-[10px]">
                        <div className="font-bold text-slate-900 truncate">{request.adminSignature?.signerName || request.adminRequester}</div>
                        <div className="text-[8.5px] text-slate-500 truncate">{request.adminSignature?.signedAt || '-'}</div>
                      </div>
                    </div>

                    {/* 2. SALE */}
                    <div className="border border-slate-300 rounded-xl p-2 bg-slate-50/70 flex flex-col justify-between min-h-[120px] shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-700 block border-b border-slate-200 pb-1">
                        2. ฝ่ายขาย (Sale Owner)
                      </span>
                      <div className="h-12 flex items-center justify-center my-0.5">
                        {request.salesSignature?.signatureDataUrl ? (
                          <img
                            src={request.salesSignature.signatureDataUrl}
                            alt="Sales Signature"
                            className="max-h-11 max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">(รอดำเนินการ)</span>
                        )}
                      </div>
                      <div className="border-t border-slate-200 pt-1 text-[10px]">
                        <div className="font-bold text-slate-900 truncate">{request.salesSignature?.signerName || request.salesOwner}</div>
                        <div className="text-[8.5px] text-slate-500 truncate">{request.salesSignature?.signedAt || '-'}</div>
                      </div>
                    </div>

                    {/* 3. Engineer */}
                    <div className="border border-slate-300 rounded-xl p-2 bg-slate-50/70 flex flex-col justify-between min-h-[120px] shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-700 block border-b border-slate-200 pb-1">
                        3. วิศวกรผู้ปฏิบัติ (Engineer)
                      </span>
                      <div className="h-12 flex items-center justify-center my-0.5">
                        {request.engineerSignature?.signatureDataUrl ? (
                          <img
                            src={request.engineerSignature.signatureDataUrl}
                            alt="Engineer Signature"
                            className="max-h-11 max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">(รอดำเนินการ)</span>
                        )}
                      </div>
                      <div className="border-t border-slate-200 pt-1 text-[10px]">
                        <div className="font-bold text-slate-900 truncate">{request.engineerSignature?.signerName || `ช่าง${request.assignedEngineer || '-'}`}</div>
                        <div className="text-[8.5px] text-slate-500 truncate">{request.engineerSignature?.signedAt || '-'}</div>
                      </div>
                    </div>

                    {/* 4. Customer */}
                    <div className="border border-slate-300 rounded-xl p-2 bg-slate-50/70 flex flex-col justify-between min-h-[120px] shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-700 block border-b border-slate-200 pb-1">
                        4. ผู้ตรวจรับงาน (Customer)
                      </span>
                      <div className="h-12 flex items-center justify-center my-0.5">
                        {request.customerSignature?.signatureDataUrl ? (
                          <img
                            src={request.customerSignature.signatureDataUrl}
                            alt="Customer Signature"
                            className="max-h-11 max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">(รอดำเนินการ)</span>
                        )}
                      </div>
                      <div className="border-t border-slate-200 pt-1 text-[10px]">
                        <div className="font-bold text-slate-900 truncate">{request.customerSignature?.signerName || request.siteContactName || '-'}</div>
                        <div className="text-[8.5px] text-slate-500 truncate">{request.customerSignature?.signedAt || '-'}</div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Symmetrical Page 1 Footer */}
              <div className="pt-3 border-t border-slate-300 text-[9px] text-slate-500 flex items-center justify-between mt-auto">
                <div>
                  เอกสารฉบับนี้ถูกสร้างโดยระบบ E-Request LUMENCRAFT CO., LTD. มีผลสมบูรณ์ทางอิเล็กทรอนิกส์
                </div>
                <div className="font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  หน้า 1 / {totalPages}
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* A4 PAGE 2: WORK PHOTOS & SITE EVIDENCE RECORD (If exists) */}
          {/* ======================================================== */}
          {hasPage2Evidence && (activePreviewPage === 'all' || activePreviewPage === 2) && (
            <div className="a4-page-sheet break-before-page w-full bg-white text-slate-900 rounded-lg shadow-2xl print:shadow-none print:rounded-none border border-slate-300 print:border-none p-6 sm:p-8 flex flex-col justify-between box-border min-h-[297mm] print:min-h-0 print:h-auto">
              
              <div className="space-y-4">
                
                {/* Page 2 Header */}
                <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded bg-slate-900 text-amber-400 font-black text-sm tracking-wider">
                        LUMENCRAFT
                      </span>
                      <span className="font-extrabold text-sm text-slate-900 uppercase">
                        รายงานบันทึกรูปภาพและผลการปฏิบัติงานหน้างาน (WORK EVIDENCE RECORD)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      โครงการ: <strong className="text-slate-900">{request.projectName}</strong> | เลขที่เอกสาร: <strong className="font-mono text-slate-900">{request.docNumber}</strong> | ใบสั่งขาย: <strong className="text-blue-700 font-mono">{request.soNumber}</strong>
                    </p>
                  </div>

                  <div className="text-right space-y-0.5 shrink-0">
                    <span className="inline-block px-2 py-0.5 bg-amber-50 font-bold text-[11px] text-amber-900 border border-amber-300 rounded">
                      ภาพถ่ายและหลักฐานหน้างาน
                    </span>
                  </div>
                </div>

                {/* Before & After Work Photos */}
                {request.workPhotos && request.workPhotos.length > 0 && (
                  <div className="border border-slate-300 rounded-xl p-3.5 bg-white space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-amber-600" />
                        5.1 รูปภาพบันทึกผลงานเปรียบเทียบก่อน-หลังแก้ไข (Before & After Work Evidence)
                      </h3>
                      <span className="text-[10px] text-slate-500 font-medium">
                        รวม {request.workPhotos.length} ภาพ (ก่อนแก้ไข: {request.workPhotos.filter(p => p.stage === 'before').length}, หลังแก้ไข: {request.workPhotos.filter(p => p.stage === 'after').length})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      {/* Before Photos Column */}
                      <div className="p-3 rounded-lg bg-orange-50/50 border border-orange-200 space-y-2">
                        <div className="font-bold text-[11px] text-orange-950 flex items-center justify-between border-b border-orange-200 pb-1">
                          <span>1. รูปก่อนแก้ไข (Before Fix)</span>
                          <span className="text-[10px]">({request.workPhotos.filter(p => p.stage === 'before').length} รูป)</span>
                        </div>
                        {request.workPhotos.filter(p => p.stage === 'before').length === 0 ? (
                          <div className="text-[10px] text-orange-400 italic text-center py-4">ไม่มีรูปก่อนแก้ไข</div>
                        ) : (
                          <div className="space-y-2.5">
                            {request.workPhotos.filter(p => p.stage === 'before').map((photo, idx) => (
                              <div key={photo.id || idx} className="p-2 bg-white rounded-lg border border-orange-200 space-y-1 shadow-2xs">
                                <img src={photo.url} alt={photo.name} className="w-full h-36 object-contain bg-slate-900/5 rounded" />
                                <div className="text-[10px] text-slate-800 font-medium leading-tight pt-0.5">
                                  {photo.description ? (
                                    <span>&ldquo;{photo.description}&rdquo;</span>
                                  ) : (
                                    <span className="text-slate-400 italic">(ไม่มีคำอธิบาย)</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* After Photos Column */}
                      <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-2">
                        <div className="font-bold text-[11px] text-emerald-950 flex items-center justify-between border-b border-emerald-200 pb-1">
                          <span>2. รูปหลังแก้ไข (After Fix)</span>
                          <span className="text-[10px]">({request.workPhotos.filter(p => p.stage === 'after').length} รูป)</span>
                        </div>
                        {request.workPhotos.filter(p => p.stage === 'after').length === 0 ? (
                          <div className="text-[10px] text-emerald-400 italic text-center py-4">ไม่มีรูปหลังแก้ไข</div>
                        ) : (
                          <div className="space-y-2.5">
                            {request.workPhotos.filter(p => p.stage === 'after').map((photo, idx) => (
                              <div key={photo.id || idx} className="p-2 bg-white rounded-lg border border-emerald-200 space-y-1 shadow-2xs">
                                <img src={photo.url} alt={photo.name} className="w-full h-36 object-contain bg-slate-900/5 rounded" />
                                <div className="text-[10px] text-slate-800 font-medium leading-tight pt-0.5">
                                  {photo.description ? (
                                    <span>&ldquo;{photo.description}&rdquo;</span>
                                  ) : (
                                    <span className="text-slate-400 italic">(ไม่มีคำอธิบาย)</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Check-in & Customer Evaluation Grid */}
                {(request.checkInData || request.customerEvaluation) && (
                  <div className="grid grid-cols-2 gap-3.5">
                    
                    {/* Check-in GPS Card */}
                    {request.checkInData && (
                      <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 text-[11px] space-y-1.5 shadow-2xs">
                        <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" /> บันทึกการ Check-in หน้างาน (GPS Verified)
                        </h4>
                        <div className="space-y-1 text-slate-700 text-[10.5px]">
                          <div><span className="font-semibold text-slate-500">เวลาเช็คอิน:</span> <strong className="text-slate-900">{request.checkInData.checkInTime}</strong></div>
                          <div><span className="font-semibold text-slate-500">พิกัดดาวเทียม:</span> <strong className="font-mono text-slate-900">{request.checkInData.latitude.toFixed(5)}, {request.checkInData.longitude.toFixed(5)}</strong></div>
                          <div><span className="font-semibold text-slate-500">สถานที่:</span> {request.checkInData.address}</div>
                        </div>
                      </div>
                    )}

                    {/* Customer 5-Star Evaluation Card */}
                    {request.customerEvaluation && (
                      <div className="border border-slate-300 rounded-xl p-3 bg-purple-50/50 text-[11px] space-y-1.5 shadow-2xs">
                        <h4 className="font-bold text-purple-950 text-xs flex items-center gap-1.5 border-b border-purple-200 pb-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> ผลประเมินความพึงพอใจลูกค้า 5 มิติ
                        </h4>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-700">
                          <div className="bg-white p-1 rounded border border-purple-100 font-semibold">• แต่งกาย/PPE: <span className="text-amber-600 font-bold">{request.customerEvaluation.grooming}★</span></div>
                          <div className="bg-white p-1 rounded border border-purple-100 font-semibold">• ความรู้/ช่าง: <span className="text-amber-600 font-bold">{request.customerEvaluation.knowledge}★</span></div>
                          <div className="bg-white p-1 rounded border border-purple-100 font-semibold">• แก้ปัญหา: <span className="text-amber-600 font-bold">{request.customerEvaluation.problemSolving}★</span></div>
                          <div className="bg-white p-1 rounded border border-purple-100 font-semibold">• มารยาท: <span className="text-amber-600 font-bold">{request.customerEvaluation.manner}★</span></div>
                        </div>
                        {request.customerEvaluation.feedback && (
                          <div className="text-[10px] text-slate-700 bg-white p-2 rounded border border-purple-100 italic">
                            &ldquo;{request.customerEvaluation.feedback}&rdquo;
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* Symmetrical Page 2 Footer */}
              <div className="pt-3 border-t border-slate-300 text-[9px] text-slate-500 flex items-center justify-between mt-auto">
                <div>
                  หลักฐานการปฏิบัติงานภาคสนาม • ระบบ E-Request LUMENCRAFT CO., LTD.
                </div>
                <div className="font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  หน้า {page2Number} / {totalPages}
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* A4 PAGE 3+: ATTACHMENT & DRAWING APPENDIX (1 Page per File) */}
          {/* ======================================================== */}
          {includeAttachmentsInPrint && request.attachments && request.attachments.length > 0 && (
            request.attachments.map((att, idx) => {
              const pageNumber = attachmentStartPageNumber + idx;
              if (activePreviewPage !== 'all' && activePreviewPage !== pageNumber) {
                return null;
              }

              const attSource = att.fileData || att.url;
              const isAttImage = att.type === 'photo' || (attSource && attSource.startsWith('data:image/')) || att.name.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i);

              return (
                <div 
                  key={att.id || idx} 
                  className="a4-page-sheet break-before-page w-full bg-white text-slate-900 rounded-lg shadow-2xl print:shadow-none print:rounded-none border border-slate-300 print:border-none p-6 sm:p-8 flex flex-col justify-between box-border min-h-[297mm] print:min-h-0 print:h-auto"
                >
                  
                  <div className="space-y-4">
                    
                    {/* Appendix Header */}
                    <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 rounded bg-slate-900 text-amber-400 font-black text-sm tracking-wider">
                            LUMENCRAFT
                          </span>
                          <span className="font-extrabold text-sm text-slate-900 uppercase">
                            ภาคผนวกแบบแปลนและเอกสารแนบ e-Form (ATTACHMENT APPENDIX)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          โครงการ: <strong className="text-slate-900">{request.projectName}</strong> | เลขที่เอกสาร: <strong className="font-mono text-slate-900">{request.docNumber}</strong> | ใบสั่งขาย: <strong className="text-blue-700 font-mono">{request.soNumber}</strong>
                        </p>
                      </div>

                      <div className="text-right space-y-0.5 shrink-0">
                        <span className="inline-block px-2.5 py-1 bg-blue-50 font-bold text-xs text-blue-900 border border-blue-200 rounded">
                          เอกสารแนบที่ {idx + 1} / {request.attachments?.length || 0}
                        </span>
                        <div className="text-[10px] text-slate-500">
                          ประเภท: <strong className="uppercase">{att.type}</strong>
                        </div>
                      </div>
                    </div>

                    {/* File Information Card */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between shadow-2xs">
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="truncate max-w-md">{att.name}</span>
                        </div>
                        <div className="text-slate-500 text-[10.5px] mt-0.5">
                          ขนาดไฟล์: <strong>{(att.size / 1024).toFixed(0)} KB</strong> {att.uploadedBy ? `• ผู้อัปโหลด: ${att.uploadedBy}` : ''}
                        </div>
                      </div>
                      <div className="text-right text-[10px] text-slate-500">
                        วันที่อัปโหลด: {att.uploadedAt || request.createdAt}
                      </div>
                    </div>

                    {/* High-res Image / Drawing Container (Symmetrical fit inside A4) */}
                    {isAttImage && attSource ? (
                      <div className="flex items-center justify-center p-3 border border-slate-300 rounded-xl bg-slate-950/5 min-h-[520px] max-h-[660px]">
                        <img
                          src={attSource}
                          alt={att.name}
                          className="max-h-[620px] max-w-full object-contain rounded shadow-xs mx-auto"
                        />
                      </div>
                    ) : (
                      <div className="p-16 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-3 bg-slate-50/50 my-8">
                        <FileText className="w-16 h-16 mx-auto text-slate-400" />
                        <h4 className="font-bold text-slate-900 text-base">{att.name}</h4>
                        <p className="text-xs text-slate-600">
                          ประเภทไฟล์: <strong className="uppercase">{att.type}</strong> • ขนาดไฟล์: {(att.size / 1024).toFixed(0)} KB
                        </p>
                        <p className="text-[11px] text-slate-500 italic max-w-md mx-auto">
                          ไฟล์เอกสาร/แบบแปลนนี้ถูกบรรจุในระบบ e-Form SO No. {request.soNumber} สามารถเปิดดูไฟล์ดิจิทัลเต็มรูปแบบหรือดาวน์โหลดได้จากระบบ
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Symmetrical Appendix Footer */}
                  <div className="pt-3 border-t border-slate-300 text-[9px] text-slate-500 flex items-center justify-between mt-auto">
                    <div>
                      เอกสารแนบประกอบใบขอรับบริการวิศวกรรม SO: {request.soNumber} • LUMENCRAFT CO., LTD.
                    </div>
                    <div className="font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      หน้า {pageNumber} / {totalPages}
                    </div>
                  </div>

                </div>
              );
            })
          )}

        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL BOTTOM ACTION BAR (Hidden during print) */}
      {/* ======================================================== */}
      <div className="w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden sticky bottom-0 z-20">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            <strong className="text-slate-200">ระบบจัดหน้ากระดาษ A4 สมบูรณ์:</strong> แนะนำให้เลือก <em>Margins: &quot;Default&quot; หรือ &quot;None&quot;</em> ในหน้าต่างเครื่องพิมพ์เพื่อความสมมาตรสูงสุด
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            id="btn-close-print-bottom"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition shadow-sm cursor-pointer"
          >
            <X className="w-4 h-4 inline mr-1" />
            ปิดหน้าต่าง (Close)
          </button>
          
          <button
            id="btn-print-action-bottom"
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            สั่งพิมพ์เอกสาร A4 ({totalPages} หน้า)
          </button>
        </div>
      </div>

      {/* File Viewer Modal */}
      {request.attachments && (
        <FileViewerModal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          files={request.attachments}
          initialIndex={selectedFileIndex}
          docNumber={request.docNumber}
          projectName={request.projectName}
          soNumber={request.soNumber}
        />
      )}

    </div>
  );
};

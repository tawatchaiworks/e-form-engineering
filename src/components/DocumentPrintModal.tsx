import React, { useState, useEffect } from 'react';
import { 
  Printer, X, Check, ShieldCheck, MapPin, Star, Calendar, Clock, 
  UserCheck, ArrowLeft, FileCode, Image as ImageIcon, Film, FileText, 
  FileCheck, File, Eye, Download, Link as LinkIcon, Camera 
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
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      
      {/* Container */}
      <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none print:w-full my-auto">
        
        {/* Modal Top Action Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 print:hidden sticky top-0 z-10 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">ตัวอย่างเอกสาร A4 (Print Preview)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-bold border border-slate-700">
                  {request.docNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">กดพิมพ์เอกสารหรือกดปุ่มปิดเพื่อกลับสู่ระบบ</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 cursor-pointer hover:bg-slate-750 select-none">
              <input
                type="checkbox"
                checked={includeAttachmentsInPrint}
                onChange={(e) => setIncludeAttachmentsInPrint(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-600"
              />
              <span className="font-semibold text-[11px]">พิมพ์รวมภาคผนวกแบบแปลน/รูปแนบ</span>
            </label>

            <button
              id="btn-print-action-top"
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition transform active:scale-95"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              สั่งพิมพ์เอกสาร A4 (Print)
            </button>
            <button
              id="btn-close-print-top"
              onClick={onClose}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-200 border border-slate-700 transition shadow-sm"
              title="ปิดหน้าต่างตัวอย่างการพิมพ์ (ESC)"
            >
              <X className="w-4 h-4 mr-1" />
              ปิดหน้าต่าง (Close)
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* A4 PRINTABLE DOCUMENT BODY */}
        {/* ======================================================== */}
        <div className="p-8 sm:p-12 print:p-6 space-y-6 text-slate-900 text-xs font-sans">
          
          {/* 1. Official Company Header (Exact requirement: No email, No tax ID) */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-400 font-black text-sm tracking-wider">
                  LUMENCRAFT
                </span>
                <span className="font-extrabold text-sm text-slate-900 uppercase">
                  ระบบ E-Request LUMENCRAFT
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
                ที่อยู่ 125 อาคารอินฟินิท พัฒนาการ 13 แขวงสวนหลวง เขตสวนหลวง กทม. 10250
              </p>
            </div>

            <div className="text-right space-y-0.5">
              <span className="inline-block px-2 py-0.5 bg-slate-100 font-mono font-bold text-xs text-slate-800 border border-slate-300 rounded">
                {request.docNumber}
              </span>
              <div className="text-[11px] text-slate-500">
                วันที่ร้องขอ: <span className="font-bold text-slate-800">{request.createdAt}</span>
              </div>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-200">
            <h1 className="text-base font-black text-slate-900 tracking-wide">
              ใบขอรับบริการวิศวกรรมและเทคนิค (E-ENGINEER SERVICE REQUEST FORM)
            </h1>
            <p className="text-[11px] text-slate-600">
              เลขที่ใบสั่งขาย (Sales Order): <span className="font-bold text-blue-700">{request.soNumber}</span> | สถานะปัจจุบัน: <span className="font-bold uppercase text-slate-800">{request.status}</span>
            </p>
          </div>

          {/* Section 1 & 2: Project & Service Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Project & Client */}
            <div className="border border-slate-300 rounded-xl p-3.5 space-y-1.5 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                1. ข้อมูลโครงการและสถานที่ปฏิบัติงาน
              </h3>
              <div className="space-y-1 text-[11px]">
                <div><span className="font-semibold text-slate-600">ชื่อโครงการ:</span> <strong className="text-slate-900">{request.projectName}</strong></div>
                <div><span className="font-semibold text-slate-600">ชื่อลูกค้า:</span> {request.customerName}</div>
                <div><span className="font-semibold text-slate-600">ที่อยู่หน้างาน:</span> {request.siteAddress}</div>
                <div><span className="font-semibold text-slate-600">ผู้ติดต่อหน้างาน:</span> {request.siteContactName} ({request.siteContactPhone})</div>
              </div>
            </div>

            {/* Service & Schedule */}
            <div className="border border-slate-300 rounded-xl p-3.5 space-y-1.5 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                2. ข้อมูลบริการและกำหนดการ
              </h3>
              <div className="space-y-1 text-[11px]">
                <div><span className="font-semibold text-slate-600">ประเภทบริการ:</span> <strong className="text-slate-900">{request.serviceType}</strong></div>
                <div><span className="font-semibold text-slate-600">ระดับความเร่งด่วน:</span> <strong className={request.priority === 'alert_emergency' ? 'text-red-600' : 'text-amber-700'}>{request.priority}</strong></div>
                <div><span className="font-semibold text-slate-600">แอดมินผู้ขอ:</span> {request.adminRequester} | <span className="font-semibold text-slate-600">เซลล์:</span> {request.salesOwner}</div>
                <div><span className="font-semibold text-slate-600">วิศวกรผู้รับผิดชอบ:</span> <strong className="text-slate-900">{request.assignedEngineer ? `ช่าง${request.assignedEngineer}` : 'ยังไม่ระบุ'}</strong></div>
                <div><span className="font-semibold text-slate-600">วันนัดหมาย:</span> <strong>{request.targetDate}</strong> (กำหนดเสร็จ: {request.deadlineDate || request.targetDate})</div>
              </div>
            </div>

          </div>

          {/* Section 3: Work Details & Equipment */}
          <div className="border border-slate-300 rounded-xl p-3.5 space-y-2">
            <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">
              3. รายละเอียดงานและอุปกรณ์ที่ต้องเตรียม
            </h3>
            <div className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">
              <strong>รายละเอียดงาน:</strong> {request.workDetails}
            </div>
            {request.requiredEquipment && (
              <div className="text-[11px] text-slate-700 bg-amber-50 p-2 rounded border border-amber-200">
                <strong>อุปกรณ์/เครื่องมือพิเศษ:</strong> {request.requiredEquipment}
              </div>
            )}
          </div>

          {/* Section 4: 5-Point Readiness Checklist */}
          <div className="border border-slate-300 rounded-xl p-3.5 space-y-2">
            <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">
              4. รายการตรวจสอบความพร้อม 5 ด้าน (Readiness Checklist)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${request.siteChecklist?.drawingsReady ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>✓</span>
                <span>แบบแปลน (Drawings)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${request.siteChecklist?.materialsReady ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>✓</span>
                <span>สินค้า/อุปกรณ์ (Materials)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${request.siteChecklist?.scaffoldingReady ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>✓</span>
                <span>นั่งร้าน/บันได (Scaffolding)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${request.siteChecklist?.powerReady ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>✓</span>
                <span>ระบบไฟ (Power System)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${request.siteChecklist?.coordinatorReady ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>✓</span>
                <span>ผู้ประสานงาน (Coordinator)</span>
              </div>
            </div>
          </div>

          {/* Section 5: Attached Drawings, Photos, Videos & Documents linked from E-Form */}
          {((request.attachments && request.attachments.length > 0) || request.serverShareDriveLink) && (
            <div className="border border-slate-300 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 flex-wrap gap-1">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  5. รายการเอกสารแนบและแบบแปลนประกอบ (Attached Files & Drawings)
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    🔗 ลิงก์กับ e-Form SO: {request.soNumber}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {request.attachments?.length || 0} ไฟล์
                  </span>
                </div>
              </div>

              {request.serverShareDriveLink && (
                <div className="text-[11px] text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-200 flex items-center gap-1.5 truncate">
                  <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-bold">ลิงก์ไดรฟ์ส่วนกลาง (Cloud Drive):</span>
                  <a href={request.serverShareDriveLink} target="_blank" rel="noreferrer" className="underline truncate font-semibold">
                    {request.serverShareDriveLink}
                  </a>
                </div>
              )}

              {request.attachments && request.attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {request.attachments.map((att, idx) => {
                    const isImg = att.type === 'photo' || (att.fileData && att.fileData.startsWith('data:image/')) || att.url?.startsWith('data:image/');
                    return (
                      <div
                        key={att.id || idx}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:border-amber-400 hover:bg-amber-50/30 transition text-[11px] flex flex-col justify-between space-y-2 shadow-2xs group"
                      >
                        <div 
                          onClick={() => handleOpenFile(idx)}
                          className="flex items-start space-x-2.5 cursor-pointer"
                          title="คลิกเพื่อเปิดดูไฟล์ความละเอียดสูง"
                        >
                          {isImg && (att.fileData || att.url) ? (
                            <img
                              src={att.fileData || att.url}
                              alt={att.name}
                              className="w-11 h-11 rounded-lg object-cover border border-slate-300 shrink-0 shadow-2xs group-hover:scale-105 transition"
                            />
                          ) : att.type === 'drawing' ? (
                            <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
                              <FileCode className="w-5 h-5" />
                            </div>
                          ) : att.type === 'photo' ? (
                            <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          ) : att.type === 'video' ? (
                            <div className="w-11 h-11 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                              <Film className="w-5 h-5" />
                            </div>
                          ) : att.type === 'report' ? (
                            <div className="w-11 h-11 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
                              <FileCheck className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                              <File className="w-5 h-5" />
                            </div>
                          )}

                          <div className="overflow-hidden flex-1">
                            <div className="font-bold text-slate-800 truncate group-hover:text-blue-700 transition">
                              {att.name}
                            </div>
                            <div className="text-[9px] text-slate-500 uppercase flex items-center gap-1 mt-0.5">
                              <span className="font-bold text-slate-700 bg-white px-1 py-0.5 rounded border border-slate-200">{att.type}</span>
                              <span>•</span>
                              <span>{(att.size / 1024).toFixed(0)} KB</span>
                            </div>
                            {att.uploadedBy && (
                              <div className="text-[9px] text-emerald-700 font-semibold truncate mt-0.5">
                                โดย: {att.uploadedBy}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Direct action buttons: View, Print, Download */}
                        <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200 print:hidden">
                          <button
                            type="button"
                            onClick={() => handleOpenFile(idx)}
                            className="flex-1 py-1 px-2 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] flex items-center justify-center gap-1 shadow-2xs transition"
                            title="เปิดดูไฟล์ขนาดใหญ่ (Zoom/Rotate)"
                          >
                            <Eye className="w-3 h-3" />
                            <span>เปิดดู</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenFile(idx)}
                            className="py-1 px-2 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10px] flex items-center gap-1 shadow-2xs transition"
                            title="พิมพ์เฉพาะไฟล์นี้"
                          >
                            <Printer className="w-3 h-3 text-slate-700" />
                            <span>พิมพ์ไฟล์นี้</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDownloadFile(att, e)}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] shadow-2xs transition"
                            title="ดาวน์โหลดลงเครื่อง"
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

          {/* Section 5.1: Before & After Work Photos with Descriptions (150 chars) */}
          {request.workPhotos && request.workPhotos.length > 0 && (
            <div className="border border-slate-300 rounded-xl p-3.5 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  5.1 รูปภาพบันทึกผลงานเปรียบเทียบก่อน-หลังแก้ไข (Before & After Work Evidence)
                </h3>
                <span className="text-[10px] text-slate-500 font-medium">
                  รวม {request.workPhotos.length} ภาพ (ก่อนแก้ไข: {request.workPhotos.filter(p => p.stage === 'before').length}, หลังแก้ไข: {request.workPhotos.filter(p => p.stage === 'after').length})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Before Photos Column */}
                <div className="p-2.5 rounded-lg bg-orange-50/60 border border-orange-200 space-y-2">
                  <div className="font-bold text-[11px] text-orange-900 flex items-center justify-between">
                    <span>1. รูปก่อนแก้ไข (Before Fix)</span>
                    <span className="text-[10px]">({request.workPhotos.filter(p => p.stage === 'before').length} รูป)</span>
                  </div>
                  {request.workPhotos.filter(p => p.stage === 'before').length === 0 ? (
                    <div className="text-[10px] text-orange-400 italic text-center py-2">ไม่มีรูปก่อนแก้ไข</div>
                  ) : (
                    <div className="space-y-2">
                      {request.workPhotos.filter(p => p.stage === 'before').map((photo, idx) => (
                        <div key={photo.id || idx} className="p-2 bg-white rounded border border-orange-200 space-y-1">
                          <img src={photo.url} alt={photo.name} className="w-full h-28 object-cover rounded" />
                          <div className="text-[10px] text-slate-700 font-semibold leading-tight">
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
                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <div className="font-bold text-[11px] text-emerald-900 flex items-center justify-between">
                    <span>2. รูปหลังแก้ไข (After Fix)</span>
                    <span className="text-[10px]">({request.workPhotos.filter(p => p.stage === 'after').length} รูป)</span>
                  </div>
                  {request.workPhotos.filter(p => p.stage === 'after').length === 0 ? (
                    <div className="text-[10px] text-emerald-400 italic text-center py-2">ไม่มีรูปหลังแก้ไข</div>
                  ) : (
                    <div className="space-y-2">
                      {request.workPhotos.filter(p => p.stage === 'after').map((photo, idx) => (
                        <div key={photo.id || idx} className="p-2 bg-white rounded border border-emerald-200 space-y-1">
                          <img src={photo.url} alt={photo.name} className="w-full h-28 object-cover rounded" />
                          <div className="text-[10px] text-slate-700 font-semibold leading-tight">
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

          {/* Section 6: Check-in & Customer Rating (If completed) */}
          {(request.checkInData || request.customerEvaluation) && (
            <div className="grid grid-cols-2 gap-4">
              {request.checkInData && (
                <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 text-[11px] space-y-1">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" /> บันทึกการ Check-in หน้างาน (GPS Verified)
                  </h4>
                  <div>เวลา: {request.checkInData.checkInTime}</div>
                  <div>พิกัด: {request.checkInData.latitude.toFixed(4)}, {request.checkInData.longitude.toFixed(4)}</div>
                  <div>สถานที่: {request.checkInData.address}</div>
                </div>
              )}

              {request.customerEvaluation && (
                <div className="border border-slate-300 rounded-xl p-3 bg-purple-50/50 text-[11px] space-y-1">
                  <h4 className="font-bold text-purple-900 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> ผลประเมินความพึงพอใจลูกค้า 5 มิติ
                  </h4>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <span>• แต่งกาย/PPE: {request.customerEvaluation.grooming}★</span>
                    <span>• ความรู้/ช่าง: {request.customerEvaluation.knowledge}★</span>
                    <span>• แก้ปัญหา: {request.customerEvaluation.problemSolving}★</span>
                    <span>• มารยาท: {request.customerEvaluation.manner}★</span>
                  </div>
                  {request.customerEvaluation.feedback && (
                    <p className="italic text-[10px] text-slate-600 mt-1">&quot;{request.customerEvaluation.feedback}&quot;</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section 7: Official 4-Party Digital Signatures */}
          <div className="border-t-2 border-slate-900 pt-4 space-y-2">
            <h3 className="font-bold text-slate-900 text-xs text-center uppercase tracking-wider mb-4">
              การลงนามดิจิทัลรับรองการปฏิบัติงาน 4 ฝ่าย (4-Party Digital Signature Verification)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              
              {/* 1. Admin Sale */}
              <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50 flex flex-col justify-between min-h-[140px]">
                <span className="text-[10px] font-bold text-slate-600 block">1. ผู้ขอรับบริการ (Admin Sale)</span>
                <div className="h-14 flex items-center justify-center my-1">
                  {request.adminSignature?.signatureDataUrl ? (
                    <img
                      src={request.adminSignature.signatureDataUrl}
                      alt="Admin Signature"
                      className="max-h-12 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">(รอดำเนินการ)</span>
                  )}
                </div>
                <div className="border-t border-slate-200 pt-1 text-[10px]">
                  <div className="font-bold text-slate-800">{request.adminSignature?.signerName || request.adminRequester}</div>
                  <div className="text-[9px] text-slate-400">{request.adminSignature?.signedAt || '-'}</div>
                </div>
              </div>

              {/* 2. SALE */}
              <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50 flex flex-col justify-between min-h-[140px]">
                <span className="text-[10px] font-bold text-slate-600 block">2. ฝ่ายขายเจ้าของงาน (SALE)</span>
                <div className="h-14 flex items-center justify-center my-1">
                  {request.salesSignature?.signatureDataUrl ? (
                    <img
                      src={request.salesSignature.signatureDataUrl}
                      alt="Sales Signature"
                      className="max-h-12 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">(รอดำเนินการ)</span>
                  )}
                </div>
                <div className="border-t border-slate-200 pt-1 text-[10px]">
                  <div className="font-bold text-slate-800">{request.salesSignature?.signerName || request.salesOwner}</div>
                  <div className="text-[9px] text-slate-400">{request.salesSignature?.signedAt || '-'}</div>
                </div>
              </div>

              {/* 3. Engineer */}
              <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50 flex flex-col justify-between min-h-[140px]">
                <span className="text-[10px] font-bold text-slate-600 block">3. วิศวกรผู้ปฏิบัติงาน (Engineer)</span>
                <div className="h-14 flex items-center justify-center my-1">
                  {request.engineerSignature?.signatureDataUrl ? (
                    <img
                      src={request.engineerSignature.signatureDataUrl}
                      alt="Engineer Signature"
                      className="max-h-12 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">(รอดำเนินการ)</span>
                  )}
                </div>
                <div className="border-t border-slate-200 pt-1 text-[10px]">
                  <div className="font-bold text-slate-800">{request.engineerSignature?.signerName || `ช่าง${request.assignedEngineer || '-'}`}</div>
                  <div className="text-[9px] text-slate-400">{request.engineerSignature?.signedAt || '-'}</div>
                </div>
              </div>

              {/* 4. Customer */}
              <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50 flex flex-col justify-between min-h-[140px]">
                <span className="text-[10px] font-bold text-slate-600 block">4. ผู้ตรวจรับงาน (Customer)</span>
                <div className="h-14 flex items-center justify-center my-1">
                  {request.customerSignature?.signatureDataUrl ? (
                    <img
                      src={request.customerSignature.signatureDataUrl}
                      alt="Customer Signature"
                      className="max-h-12 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">(รอดำเนินการ)</span>
                  )}
                </div>
                <div className="border-t border-slate-200 pt-1 text-[10px]">
                  <div className="font-bold text-slate-800">{request.customerSignature?.signerName || request.siteContactName || '-'}</div>
                  <div className="text-[9px] text-slate-400">{request.customerSignature?.signedAt || '-'}</div>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Note */}
          <div className="text-[9px] text-slate-400 text-center pt-3 border-t border-slate-200">
            เอกสารฉบับนี้ถูกสร้างโดยระบบ E-Request LUMENCRAFT CO., LTD. มีผลสมบูรณ์ทางอิเล็กทรอนิกส์
          </div>

          {/* ======================================================== */}
          {/* PRINTABLE ATTACHMENT APPENDIX (Visible only on print when enabled) */}
          {/* ======================================================== */}
          {includeAttachmentsInPrint && request.attachments && request.attachments.length > 0 && (
            <div className="hidden print:block space-y-8">
              {request.attachments.map((att, idx) => {
                const attSource = att.fileData || att.url;
                const isAttImage = att.type === 'photo' || (attSource && attSource.startsWith('data:image/')) || att.name.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i);
                
                return (
                  <div key={att.id || idx} className="break-before-page pt-6 space-y-4">
                    {/* Appendix Header */}
                    <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-400 font-black text-sm tracking-wider">
                            LUMENCRAFT
                          </span>
                          <span className="font-extrabold text-sm text-slate-900 uppercase">
                            ภาคผนวกเอกสารแนบ e-Form (ATTACHMENT APPENDIX)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          เลขที่เอกสาร: <strong className="text-slate-900">{request.docNumber}</strong> | ใบสั่งขาย (SO): <strong className="text-blue-700">{request.soNumber}</strong>
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold border border-slate-300">
                          เอกสารแนบ {idx + 1} / {request.attachments?.length || 0}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          หมวด: <strong className="uppercase">{att.type}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Attachment Info Card */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{att.name}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          โครงการ: <strong>{request.projectName}</strong> • ขนาดไฟล์: {(att.size / 1024).toFixed(0)} KB {att.uploadedBy ? `• ผู้อัปโหลด: ${att.uploadedBy}` : ''}
                        </div>
                      </div>
                      <div className="text-right text-[10px] text-slate-500">
                        {att.uploadedAt || request.createdAt}
                      </div>
                    </div>

                    {/* Image / Drawing Display */}
                    {isAttImage && attSource ? (
                      <div className="flex items-center justify-center p-4 border border-slate-300 rounded-xl bg-white min-h-[500px]">
                        <img
                          src={attSource}
                          alt={att.name}
                          className="max-h-[750px] max-w-full object-contain rounded-lg shadow-xs"
                        />
                      </div>
                    ) : (
                      <div className="p-12 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-3 bg-slate-50/50">
                        <FileText className="w-12 h-12 mx-auto text-slate-500" />
                        <h4 className="font-bold text-slate-900 text-sm">{att.name}</h4>
                        <p className="text-xs text-slate-600">
                          ประเภทไฟล์: <strong className="uppercase">{att.type}</strong> • ขนาด: {(att.size / 1024).toFixed(0)} KB
                        </p>
                        <p className="text-[11px] text-slate-500 italic max-w-md mx-auto">
                          ไฟล์เอกสาร/แบบแปลนนี้ถูกบรรจุในระบบ e-Form SO No. {request.soNumber} สามารถเปิดดูไฟล์ดิจิทัลเต็มรูปแบบหรือดาวน์โหลดได้จากระบบ
                        </p>
                      </div>
                    )}

                    {/* Appendix Footer */}
                    <div className="text-[9px] text-slate-400 text-center pt-2 border-t border-slate-200">
                      เอกสารแนบประกอบใบขอรับบริการวิศวกรรม SO: {request.soNumber} • LUMENCRAFT CO., LTD.
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Bottom Action Bar (Hidden on print) */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500">
            💡 <span className="font-semibold text-slate-700">คำแนะนำ:</span> สำหรับการพิมพ์ขนาด A4 แนะนำให้เลือก &quot;Fit to page&quot; ในหน้าต่างตั้งค่าเครื่องพิมพ์
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              id="btn-close-print-bottom"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-200 transition shadow-sm"
            >
              <X className="w-4 h-4 inline mr-1" />
              ปิดหน้าต่าง (Close Window)
            </button>
            <button
              id="btn-print-action-bottom"
              onClick={handlePrint}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              สั่งพิมพ์เอกสาร (Print A4)
            </button>
          </div>
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

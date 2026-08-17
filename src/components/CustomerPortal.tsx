import React, { useState } from 'react';
import { 
  Star, CheckCircle2, ShieldCheck, UserCheck, MessageSquare, 
  Building2, PenTool, Check, ArrowRight, HeartHandshake, Sparkles,
  Camera, Plus, Upload, Trash2, Eye, X, Image as ImageIcon, ZoomIn, FileText
} from 'lucide-react';
import { EEngineerRequest, CustomerEvaluation, WorkPhotoItem } from '../types';
import { SignaturePad } from './SignaturePad';
import { createAuditLog } from '../utils/storage';
import confetti from 'canvas-confetti';

interface CustomerPortalProps {
  requests: EEngineerRequest[];
  onUpdateRequest: (updated: EEngineerRequest) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  requests,
  onUpdateRequest,
}) => {
  // Only requests that have been completed by engineer (status === 'completed_by_engineer')
  const completedByEngRequests = requests.filter(r => r.status === 'completed_by_engineer');

  const [activeReqId, setActiveReqId] = useState<string | null>(
    completedByEngRequests.length > 0 ? completedByEngRequests[0].id : null
  );

  // 5 Dimensions state
  const [grooming, setGrooming] = useState<number>(5);
  const [knowledge, setKnowledge] = useState<number>(5);
  const [problemSolving, setProblemSolving] = useState<number>(5);
  const [manner, setManner] = useState<number>(5);
  const [responsiveness, setResponsiveness] = useState<number>(5);

  const [feedback, setFeedback] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [signatureUrl, setSignatureUrl] = useState<string>('');

  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState<boolean>(false);

  // Photo Upload & Lightbox state
  const [isAddingPhotoModal, setIsAddingPhotoModal] = useState<boolean>(false);
  const [uploadStage, setUploadStage] = useState<'before' | 'after'>('before');
  const [newPhotoDesc, setNewPhotoDesc] = useState<string>('');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [newPhotoName, setNewPhotoName] = useState<string>('');
  const [newPhotoSize, setNewPhotoSize] = useState<number>(0);
  const [activeZoomPhoto, setActiveZoomPhoto] = useState<WorkPhotoItem | null>(null);

  const selectedRequest = requests.find(r => r.id === activeReqId);

  // Helper to process photo upload directly on Customer/Inspection Portal
  const handlePhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setNewPhotoUrl(dataUrl);
      setNewPhotoName(file.name);
      setNewPhotoSize(file.size);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUploadedPhoto = () => {
    if (!selectedRequest || !newPhotoUrl) {
      alert('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }

    const newPhotoItem: WorkPhotoItem = {
      id: `wp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      url: newPhotoUrl,
      fileData: newPhotoUrl,
      name: newPhotoName || 'site_photo.jpg',
      size: newPhotoSize || 102400,
      stage: uploadStage,
      description: newPhotoDesc.slice(0, 150),
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      uploadedBy: customerName.trim() ? `คุณ${customerName.trim()} (ลูกค้า/ตรวจรับ)` : `ช่าง${selectedRequest.assignedEngineer || 'วิศวกร'} (Engineer)`
    };

    const existingPhotos = selectedRequest.workPhotos || [];
    const updatedPhotos = [...existingPhotos, newPhotoItem];

    const updated: EEngineerRequest = {
      ...selectedRequest,
      workPhotos: updatedPhotos,
      history: [
        ...selectedRequest.history,
        createAuditLog(
          'แนบรูปถ่ายตรวจรับงาน',
          selectedRequest.assignedEngineer || 'วิศวกร',
          'Engineer',
          `อัปโหลดรูปภาพ (${uploadStage === 'before' ? 'ก่อนแก้ไข' : 'หลังแก้ไข'}) โดยช่าง/ลูกค้า`
        )
      ],
    };

    onUpdateRequest(updated);
    setIsAddingPhotoModal(false);
    setNewPhotoUrl('');
    setNewPhotoDesc('');
    setNewPhotoName('');
    setNewPhotoSize(0);
  };

  // Helper to update inline description (max 150 chars)
  const handleUpdateInlineDesc = (photoId: string, text: string) => {
    if (!selectedRequest) return;
    const trimmed = text.slice(0, 150);
    const updatedPhotos = (selectedRequest.workPhotos || []).map(p => 
      p.id === photoId ? { ...p, description: trimmed } : p
    );

    onUpdateRequest({
      ...selectedRequest,
      workPhotos: updatedPhotos,
    });
  };

  // Helper to delete photo
  const handleDeleteWorkPhoto = (photoId: string) => {
    if (!selectedRequest) return;
    const updatedPhotos = (selectedRequest.workPhotos || []).filter(p => p.id !== photoId);
    onUpdateRequest({
      ...selectedRequest,
      workPhotos: updatedPhotos,
    });
  };

  const dimensions = [
    {
      key: 'grooming',
      label: '0. การแต่งกายสุภาพและอุปกรณ์ความปลอดภัย (Grooming & Safety PPE)',
      desc: 'สวมหมวกนิรภัย เสื้อกั๊กสะท้อนแสง รองเท้าเซฟตี้ และแต่งกายเรียบร้อยตามมาตรฐานความปลอดภัย',
      value: grooming,
      setValue: setGrooming,
    },
    {
      key: 'knowledge',
      label: '1. ความรู้และความเชี่ยวชาญในงาน (Knowledge & Technical Skill)',
      desc: 'ความเข้าใจในอุปกรณ์ ระบบแสงสว่าง ไดรเวอร์ และวิธีการติดตั้งอย่างถูกต้องแม่นยำ',
      value: knowledge,
      setValue: setKnowledge,
    },
    {
      key: 'problemSolving',
      label: '2. การแก้ปัญหาเฉพาะหน้าและความพร้อม (Problem Solving & Readiness)',
      desc: 'ความสามารถในการวินิจฉัยและจัดการอุปสรรคหน้างานได้อย่างรวดเร็วและมีประสิทธิภาพ',
      value: problemSolving,
      setValue: setProblemSolving,
    },
    {
      key: 'manner',
      label: '3. มารยาทและการสื่อสาร (Manner & Communication)',
      desc: 'ความสุภาพ อ่อนน้อม การอธิบายขั้นตอนงานอย่างชัดเจน และการประสานงานที่ดี',
      value: manner,
      setValue: setManner,
    },
    {
      key: 'responsiveness',
      label: '4. ความรวดเร็วและการตอบสนอง (Responsiveness & Timeliness)',
      desc: 'ตรงต่อเวลา ปฏิบัติงานรวดเร็ว คล่องแคล่ว และส่งมอบงานตามกำหนดการ',
      value: responsiveness,
      setValue: setResponsiveness,
    },
  ];

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (!customerName.trim()) {
      alert('กรุณากรอกชื่อผู้ตรวจรับงาน');
      return;
    }
    if (!signatureUrl) {
      alert('กรุณาลงนามดิจิทัลตรวจรับงาน');
      return;
    }

    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    const customerEval: CustomerEvaluation = {
      grooming,
      knowledge,
      problemSolving,
      manner,
      responsiveness,
      feedback: feedback.trim(),
      submittedAt: timeStr,
    };

    const updated: EEngineerRequest = {
      ...selectedRequest,
      status: 'completed_by_customer',
      customerEvaluation: customerEval,
      customerSignature: {
        signerName: customerName.trim(),
        role: 'Customer (ผู้ตรวจรับงาน)',
        signatureDataUrl: signatureUrl,
        signedAt: timeStr,
      },
      workPhotos: selectedRequest.workPhotos || [],
      history: [
        ...selectedRequest.history,
        createAuditLog(
          'ลูกค้าประเมินความพึงพอใจ 5 มิติ',
          customerName.trim(),
          'Customer',
          `ประเมินความพึงพอใจสำเร็จและลงนามดิจิทัล ส่งมอบงานพร้อมรูปภาพก่อน-หลังทำกลับไปยังฝ่ายขาย`
        )
      ],
      updatedAt: timeStr,
    };

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    onUpdateRequest(updated);
    setIsSuccessSubmitted(true);
    setTimeout(() => {
      setIsSuccessSubmitted(false);
      // Select next if any
      const nextRemaining = completedByEngRequests.filter(r => r.id !== selectedRequest.id);
      setActiveReqId(nextRemaining.length > 0 ? nextRemaining[0].id : null);
      setFeedback('');
      setCustomerName('');
      setSignatureUrl('');
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Customer Portal Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-black shadow-lg">
            <Star className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-400/20 text-purple-200 border border-purple-400/30 text-xs font-bold">
              Customer Satisfaction Portal
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              ระบบประเมินผลความพึงพอใจลูกค้าและตรวจรับงาน (5-Dimension Rating)
            </h2>
            <p className="text-xs text-purple-200 mt-0.5">
              บริษัท ลูเมนคราฟท์ จำกัด ขอขอบพระคุณที่ท่านไว้วางใจในบริการของเรา
            </p>
          </div>
        </div>
      </div>

      {/* When no jobs pending evaluation */}
      {completedByEngRequests.length === 0 && !isSuccessSubmitted && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              ไม่มีรายการงานที่รอลูกค้าประเมินในขณะนี้
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              เมื่อวิศวกรลงพื้นที่และกดดำเนินการเสร็จสิ้น (Complete) รายการงานจะถูกส่งเข้ามายังหน้านี้อัตโนมัติเพื่อให้ท่านตรวจรับและประเมินผล
            </p>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {isSuccessSubmitted && (
        <div className="bg-emerald-600 text-white rounded-2xl p-8 text-center shadow-xl space-y-3 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center mx-auto shadow-lg">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">
            บันทึกการประเมินและลงนามตรวจรับงานเรียบร้อยแล้ว
          </h3>
          <p className="text-xs text-emerald-100 max-w-lg mx-auto">
            ผลการประเมิน 5 มิติพร้อมลายเซ็นดิจิทัลถูกส่งกลับไปยังฝ่ายขาย LUMENCRAFT เพื่อสรุปผลปิดงานอย่างสมบูรณ์ ขอบคุณครับ
          </p>
        </div>
      )}

      {/* Active Evaluation Form */}
      {selectedRequest && !isSuccessSubmitted && (
        <form onSubmit={handleSubmitEvaluation} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6">
          
          {/* Job Summary Banner */}
          <div className="bg-slate-50 p-6 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              สรุปรายละเอียดงานและโครงการที่ส่งมอบ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block">SO NO.:</span>
                <span className="font-extrabold text-blue-600 text-sm">{selectedRequest.soNumber}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block">ชื่อโครงการ:</span>
                <span className="font-bold text-slate-900">{selectedRequest.projectName}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block">ลูกค้า:</span>
                <span className="font-bold text-slate-900">{selectedRequest.customerName}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block">วิศวกรผู้รับผิดชอบ:</span>
                <span className="font-bold text-amber-600">ช่าง{selectedRequest.assignedEngineer} (Engineer)</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block">เซลล์เจ้าของงาน:</span>
                <span className="font-bold text-slate-800">{selectedRequest.salesOwner}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block">วันที่ส่งมอบ:</span>
                <span className="font-bold text-slate-800">{selectedRequest.targetDate}</span>
              </div>
            </div>

            <div className="mt-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">รายละเอียดงานที่ปฏิบัติ: </span>
              <span className="text-slate-600">{selectedRequest.workDetails}</span>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* ========================================================= */}
            {/* Before & After Service Photos (หลักฐานผลงานก่อน-หลังแก้ไข) */}
            {/* ========================================================= */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-indigo-100/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-indigo-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      รูปภาพบันทึกผลงานเปรียบเทียบก่อน-หลังแก้ไข (Before & After Work Evidence)
                    </h3>
                    <p className="text-xs text-slate-500">
                      หลักฐานเชิงประจักษ์สภาพจุดติดตั้งก่อนและหลังที่วิศวกรเข้าปฏิบัติงาน (จะถูกส่งแนบไปยังฝ่ายขายโดยอัตโนมัติ)
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadStage('before');
                      setNewPhotoDesc('');
                      setNewPhotoUrl('');
                      setIsAddingPhotoModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ อัปโหลดรูปก่อนทำงาน</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadStage('after');
                      setNewPhotoDesc('');
                      setNewPhotoUrl('');
                      setIsAddingPhotoModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ อัปโหลดรูปหลังทำงาน</span>
                  </button>
                </div>
              </div>

              {/* Status information notice */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200/80 flex items-start gap-2.5 text-xs text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">ระบบแนบรูปถ่ายอัตโนมัติไปยังฝ่ายขาย (Sales Hub):</span>
                  <p className="text-[11px] text-purple-800">
                    รูปภาพก่อนทำและหลังทำที่อัปโหลดทั้งหมด พร้อมคำอธิบายใต้ภาพ จะถูกบันทึกและส่งต่อไปยัง <strong>🟢 กล่องเขียว (วิศวกรส่งมอบงานแล้ว)</strong> ของฝ่ายขายทันที เพื่อให้เซลล์ใช้เป็นข้อมูลหลักฐานประกอบการตรวจรับและประเมินผล 5 มิติ
                  </p>
                </div>
              </div>

              {/* Side-by-Side Comparison Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Column 1: Before Fix */}
                <div className="space-y-3 p-3.5 rounded-xl bg-orange-50/50 border border-orange-200/80">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-100 text-orange-900 font-bold text-xs">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      1. รูปก่อนทำงาน / ก่อนแก้ไข (Before Work)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadStage('before');
                        setNewPhotoDesc('');
                        setNewPhotoUrl('');
                        setIsAddingPhotoModal(true);
                      }}
                      className="px-2 py-1 rounded bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold shadow-xs transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>อัปโหลดรูปก่อนทำ</span>
                    </button>
                  </div>

                  {(selectedRequest.workPhotos || []).filter(p => p.stage === 'before').length === 0 ? (
                    <div className="p-6 rounded-lg bg-white border border-dashed border-orange-200 text-center text-xs text-orange-400">
                      ไม่มีรูปก่อนแก้ไข
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(selectedRequest.workPhotos || []).filter(p => p.stage === 'before').map((photo, pIdx) => (
                        <div key={photo.id || pIdx} className="p-3 bg-white rounded-xl border border-orange-200 shadow-2xs space-y-2">
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 group">
                            <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveZoomPhoto(photo)}
                                className="p-1.5 rounded-lg bg-white text-slate-800 text-xs font-bold flex items-center gap-1 hover:bg-slate-100 shadow"
                              >
                                <ZoomIn className="w-3.5 h-3.5" />
                                <span>ขยายดู</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteWorkPhoto(photo.id)}
                                className="p-1.5 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-red-700 shadow"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-orange-600 text-white text-[10px] font-bold">
                              ก่อนแก้ไข #{pIdx + 1}
                            </div>
                          </div>

                          {/* 150 Char Description */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span className="font-bold text-slate-700">คำอธิบายรายละเอียดใต้รูป:</span>
                              <span className="font-mono">{(photo.description || '').length}/150</span>
                            </div>
                            <textarea
                              rows={2}
                              maxLength={150}
                              value={photo.description || ''}
                              onChange={(e) => handleUpdateInlineDesc(photo.id, e.target.value)}
                              placeholder="ระบุรายละเอียดสภาพจุดติดตั้ง/ปัญหาที่พบก่อนแก้ไข (ไม่เกิน 150 ตัวอักษร)..."
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-orange-500 bg-slate-50/50 resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Column 2: After Fix */}
                <div className="space-y-3 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 font-bold text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      2. รูปหลังทำงาน / หลังแก้ไข (After Work)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadStage('after');
                        setNewPhotoDesc('');
                        setNewPhotoUrl('');
                        setIsAddingPhotoModal(true);
                      }}
                      className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>อัปโหลดรูปหลังทำ</span>
                    </button>
                  </div>

                  {(selectedRequest.workPhotos || []).filter(p => p.stage === 'after').length === 0 ? (
                    <div className="p-6 rounded-lg bg-white border border-dashed border-emerald-200 text-center text-xs text-emerald-400">
                      ไม่มีรูปหลังแก้ไข
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(selectedRequest.workPhotos || []).filter(p => p.stage === 'after').map((photo, pIdx) => (
                        <div key={photo.id || pIdx} className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-2">
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 group">
                            <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveZoomPhoto(photo)}
                                className="p-1.5 rounded-lg bg-white text-slate-800 text-xs font-bold flex items-center gap-1 hover:bg-slate-100 shadow"
                              >
                                <ZoomIn className="w-3.5 h-3.5" />
                                <span>ขยายดู</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteWorkPhoto(photo.id)}
                                className="p-1.5 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-red-700 shadow"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                              หลังแก้ไข #{pIdx + 1}
                            </div>
                          </div>

                          {/* 150 Char Description */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span className="font-bold text-slate-700">คำอธิบายรายละเอียดใต้รูป:</span>
                              <span className="font-mono">{(photo.description || '').length}/150</span>
                            </div>
                            <textarea
                              rows={2}
                              maxLength={150}
                              value={photo.description || ''}
                              onChange={(e) => handleUpdateInlineDesc(photo.id, e.target.value)}
                              placeholder="ระบุรายละเอียดผลการแก้ไข/การทดสอบหลังเปลี่ยนอุปกรณ์ (ไม่เกิน 150 ตัวอักษร)..."
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            <hr className="border-slate-200" />
            
            {/* 5-Dimension Rating Cards */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                แบบประเมินความพึงพอใจ 5 มิติ (1 ถึง 5 ดาว)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                กรุณาคลิกเลือกดาวที่ตรงกับระดับความพึงพอใจของท่าน (1 = ปรับปรุง, 5 = ยอดเยี่ยม)
              </p>

              <div className="space-y-3.5">
                {dimensions.map((dim, idx) => (
                  <div
                    key={dim.key}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition hover:bg-slate-50"
                  >
                    <div className="max-w-md">
                      <h4 className="text-xs font-bold text-slate-900">{dim.label}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{dim.desc}</p>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => dim.setValue(star)}
                          className="p-1 rounded-md hover:scale-110 transition group"
                        >
                          <Star
                            className={`w-6 h-6 transition ${
                              dim.value >= star
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 group-hover:text-amber-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-600 min-w-[45px] text-right">
                        ({dim.value}/5 ดาว)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Additional Feedback (300 char) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                  ข้อเสนอแนะเพิ่มเติม (จำกัด 300 ตัวอักษร)
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {feedback.length}/300 ตัวอักษร
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={300}
                placeholder="ระบุข้อติชม หรือสิ่งที่ท่านต้องการให้ LUMENCRAFT พัฒนาปรับปรุงเพิ่มเติม..."
                value={feedback}
                onChange={e => {
                  if (e.target.value.length <= 300) setFeedback(e.target.value);
                }}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <hr className="border-slate-200" />

            {/* Signer Name & Customer Digital Signature */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อ-นามสกุล ผู้ตรวจรับงานหน้างาน (ลูกค้า) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น คุณสมศักดิ์ วิศวกรโครงการ"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <SignaturePad
                signerName={customerName || selectedRequest.siteContactName || 'ลูกค้าผู้ตรวจรับงาน'}
                roleLabel="Customer Digital Signature"
                onSave={url => setSignatureUrl(url)}
                strokeColor="#6b21a8"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                ส่งแบบประเมินและลงนามตรวจรับงาน (ส่งกลับฝ่ายขาย)
              </button>
            </div>

          </div>
        </form>
      )}

      {/* Upload Photo Modal (Before / After with 150 char description box) */}
      {isAddingPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-amber-500 text-slate-950">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">อัปโหลดรูปภาพผลงานหน้างานจากเครื่อง</h4>
                  <p className="text-[11px] text-slate-300">แบ่งเป็นก่อนแก้ไข และหลังแก้ไข พร้อมคำอธิบาย 150 ตัวอักษร</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingPhotoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  เลือกหมวดหมู่รูปภาพ <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadStage('before')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      uploadStage === 'before'
                        ? 'bg-orange-50 border-orange-500 text-orange-900 ring-2 ring-orange-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span>1. รูปก่อนแก้ไข (Before Fix)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadStage('after')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      uploadStage === 'after'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>2. รูปหลังแก้ไข (After Fix)</span>
                  </button>
                </div>
              </div>

              {/* File Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ไฟล์รูปภาพจากเครื่อง <span className="text-rose-500">*</span>
                </label>
                <label className="cursor-pointer p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-500 bg-slate-50 hover:bg-purple-50/50 flex flex-col items-center justify-center gap-2 transition">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">
                    {newPhotoName || 'คลิกเพื่อเลือกไฟล์รูปภาพจากเครื่อง / ถ่ายภาพ'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    รองรับ JPG, PNG, WEBP, HEIC
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileSelect}
                    className="hidden"
                  />
                </label>

                {newPhotoUrl && (
                  <div className="mt-2 relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900">
                    <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Description Box (150 chars max) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    กล่องอธิบายรายละเอียดใต้รูป (จำกัด 150 ตัวอักษร)
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${
                    newPhotoDesc.length >= 140 ? 'text-red-600' : 'text-slate-400'
                  }`}>
                    {newPhotoDesc.length}/150 ตัวอักษร
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={150}
                  value={newPhotoDesc}
                  onChange={(e) => setNewPhotoDesc(e.target.value.slice(0, 150))}
                  placeholder={
                    uploadStage === 'before'
                      ? 'เช่น สภาพโคมไฟก่อนซ่อมมีคราบไหม้และหลอดขาด...'
                      : 'เช่น ติดตั้งอุปกรณ์ใหม่เรียบร้อย ทดสอบความสว่างทำงานสมบูรณ์...'
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingPhotoModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveUploadedPhoto}
                disabled={!newPhotoUrl}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white shadow-sm transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>บันทึกรูปภาพ</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Photo Zoom Lightbox Modal */}
      {activeZoomPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-3 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeZoomPhoto.stage === 'before' ? 'bg-orange-600' : 'bg-emerald-600'
                }`}>
                  {activeZoomPhoto.stage === 'before' ? '📷 รูปก่อนแก้ไข (Before)' : '📷 รูปหลังแก้ไข (After)'}
                </span>
                <span className="text-xs text-slate-300 truncate max-w-xs">{activeZoomPhoto.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveZoomPhoto(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 flex items-center justify-center">
              <img
                src={activeZoomPhoto.url}
                alt={activeZoomPhoto.name}
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow"
              />
            </div>

            <div className="p-4 bg-white border-t border-slate-200 space-y-1">
              <div className="text-[11px] font-bold text-slate-700">รายละเอียดใต้รูป:</div>
              <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {activeZoomPhoto.description || '(ไม่ได้ระบุรายละเอียด)'}
              </p>
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                <span>อัปโหลดโดย: {activeZoomPhoto.uploadedBy || 'วิศวกร'}</span>
                <span>เวลา: {activeZoomPhoto.uploadedAt}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

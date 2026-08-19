import React, { useState, useEffect } from 'react';
import { 
  X, Printer, Download, ZoomIn, ZoomOut, RotateCw, 
  FileText, Image as ImageIcon, Video, Compass, FileCheck, 
  ChevronLeft, ChevronRight, File, Maximize2, Minimize2, ExternalLink
} from 'lucide-react';
import { AttachmentItem } from '../types';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: AttachmentItem[];
  initialIndex?: number;
  docNumber?: string;
  projectName?: string;
  soNumber?: string;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  isOpen,
  onClose,
  files,
  initialIndex = 0,
  docNumber,
  projectName,
  soNumber,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
    setRotation(0);
  }, [initialIndex, isOpen]);

  // Handle ESC and Arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, files.length]);

  if (!isOpen || !files || files.length === 0) return null;

  const currentFile = files[currentIndex] || files[0];
  const fileSource = currentFile.fileData || currentFile.url;

  const handleNext = () => {
    if (currentIndex < files.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setZoom(1);
      setRotation(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setZoom(1);
      setRotation(0);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileSource;
    link.download = currentFile.name || `lumencraft-file-${currentIndex + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    // If it's an image or document, we trigger print on the print container
    window.print();
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getTypeBadge = (type: AttachmentItem['type']) => {
    switch (type) {
      case 'drawing':
        return { label: 'แบบแปลน (Drawing)', bg: 'bg-blue-600', icon: Compass };
      case 'photo':
        return { label: 'รูปถ่ายหน้างาน (Photo)', bg: 'bg-emerald-600', icon: ImageIcon };
      case 'video':
        return { label: 'วิดีโอบันทึก (Video)', bg: 'bg-amber-600', icon: Video };
      case 'document':
        return { label: 'เอกสาร (Document)', bg: 'bg-indigo-600', icon: FileText };
      case 'report':
        return { label: 'รายงานช่าง (Report)', bg: 'bg-purple-600', icon: FileCheck };
      default:
        return { label: 'ไฟล์แนบ (Attachment)', bg: 'bg-slate-600', icon: File };
    }
  };

  const badge = getTypeBadge(currentFile.type);
  const BadgeIcon = badge.icon;

  const isImage = currentFile.type === 'photo' || 
                  currentFile.name.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i) || 
                  fileSource.startsWith('data:image/');

  const isVideo = currentFile.type === 'video' || 
                  currentFile.name.match(/\.(mp4|webm|ogg|mov|mkv)$/i) || 
                  fileSource.startsWith('data:video/');

  const isPdf = currentFile.name.match(/\.pdf$/i) || 
                fileSource.startsWith('data:application/pdf');

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between print:bg-white print:static print:inset-auto print:overflow-visible"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      
      {/* 1. Modal Top Bar (Hidden on Print) */}
      <div className="w-full bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-4 z-20 print:hidden shadow-lg">
        
        {/* File Info */}
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className={`p-2 rounded-xl text-white ${badge.bg} shadow-md shrink-0`}>
            <BadgeIcon className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white truncate max-w-xs sm:max-w-md">
                {currentFile.name}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-bold ${badge.bg}`}>
                {badge.label}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-3">
              <span>ขนาด: {formatFileSize(currentFile.size)}</span>
              {currentFile.uploadedAt && <span>อัปโหลดเมื่อ: {currentFile.uploadedAt}</span>}
              {soNumber && <span className="text-amber-400 font-mono">SO: {soNumber}</span>}
              {files.length > 1 && (
                <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300 font-medium">
                  ไฟล์ที่ {currentIndex + 1} จาก {files.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Zoom & Rotate Controls (For Images & Drawings) */}
          {isImage && (
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 mr-2">
              <button
                onClick={() => setZoom(z => Math.max(0.4, z - 0.2))}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                title="ย่อขนาด (Zoom Out)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-[11px] font-mono text-slate-300 min-w-[45px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(3, z + 0.2))}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                title="ขยายขนาด (Zoom In)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotation(r => (r + 90) % 360)}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white border-l border-slate-700 ml-1 pl-1.5"
                title="หมุน 90 องศา (Rotate)"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Print Button */}
          <button
            id="btn-modal-print-file"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition"
            title="พิมพ์ไฟล์นี้ (Print)"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">พิมพ์ไฟล์นี้ (Print)</span>
          </button>

          {/* Download Button */}
          <button
            id="btn-modal-download-file"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition"
            title="ดาวน์โหลดไฟล์ลงเครื่อง (Download)"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">ดาวน์โหลด</span>
          </button>

          {/* Close Button */}
          <button
            id="btn-modal-close-viewer"
            onClick={onClose}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition ml-1"
            title="ปิดหน้าต่าง (ESC)"
          >
            <X className="w-5 h-5" />
          </button>

        </div>
      </div>

      {/* 2. Main File Preview Canvas / Viewer */}
      <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-8 overflow-auto relative print:hidden">
        
        {/* Navigation Arrows */}
        {files.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition z-20 shadow-xl ${
                currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
              }`}
              title="ไฟล์ก่อนหน้า (ลูกศรซ้าย)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === files.length - 1}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition z-20 shadow-xl ${
                currentIndex === files.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
              }`}
              title="ไฟล์ถัดไป (ลูกศรขวา)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Content Viewer Body */}
        <div className="max-w-5xl w-full h-full flex items-center justify-center">
          
          {/* A. Image / Drawing Photo Preview */}
          {isImage && (
            <div className="relative flex items-center justify-center overflow-hidden max-h-[75vh] w-full">
              <img
                src={fileSource}
                alt={currentFile.name}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              />
            </div>
          )}

          {/* B. Video Player Preview */}
          {isVideo && (
            <div className="w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col items-center">
              <video
                controls
                autoPlay
                src={fileSource}
                className="w-full max-h-[70vh] object-contain rounded-2xl"
              >
                เบราว์เซอร์ไม่รองรับการเล่นวิดีโอนี้
              </video>
            </div>
          )}

          {/* C. PDF Viewer Preview */}
          {isPdf && (
            <div className="w-full h-[75vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
              <iframe
                src={fileSource}
                title={currentFile.name}
                className="w-full flex-1 border-none rounded-2xl bg-white"
              />
            </div>
          )}

          {/* D. Document / Report / Drawing CAD Card */}
          {!isImage && !isVideo && !isPdf && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
              <div className={`w-20 h-20 mx-auto rounded-2xl ${badge.bg} text-white flex items-center justify-center shadow-xl shadow-indigo-900/20`}>
                <BadgeIcon className="w-10 h-10" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white break-all">{currentFile.name}</h3>
                <p className="text-xs text-slate-400">{badge.label} • {formatFileSize(currentFile.size)}</p>
                {projectName && <p className="text-xs text-indigo-300 font-semibold">{projectName}</p>}
              </div>

              <div className="pt-4 flex flex-col gap-2.5">
                <button
                  onClick={handleDownload}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลดไฟล์นี้ลงเครื่อง (Open / Download)
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition"
                >
                  <Printer className="w-4 h-4" />
                  สั่งพิมพ์หน้ารายงานเอกสารนี้ (Print)
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 3. Bottom Carousel (Hidden on Print) */}
      {files.length > 1 && (
        <div className="w-full bg-slate-900/90 border-t border-slate-800 py-2.5 px-6 flex items-center justify-center gap-2 overflow-x-auto print:hidden z-20">
          {files.map((f, idx) => {
            const isSelected = idx === currentIndex;
            const fBadge = getTypeBadge(f.type);
            const FIcon = fBadge.icon;
            return (
              <button
                key={f.id || idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setZoom(1);
                  setRotation(0);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition ${
                  isSelected 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm' 
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <FIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="max-w-[120px] truncate">{f.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. PRINT FORMATTED PAGE (Visible ONLY when window.print() is called) */}
      {/* ======================================================== */}
      <div className="hidden print:block a4-print-container bg-white text-slate-900 font-sans w-full">
        <div className="a4-page-sheet p-8 bg-white flex flex-col justify-between min-h-[280mm] box-border">
          
          <div className="space-y-4">
            {/* Printable Official Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-amber-400 font-black text-sm tracking-wider">
                    LUMENCRAFT
                  </span>
                  <span className="font-extrabold text-sm text-slate-900 uppercase">
                    ระบบ E-Request LUMENCRAFT — เอกสารแนบ (ATTACHMENT FILE)
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  125 อาคารอินฟินิท พัฒนาการ 13 แขวงสวนหลวง เขตสวนหลวง กรุงเทพมหานคร 10250
                </p>
              </div>
              <div className="text-right text-xs">
                <div className="font-mono font-bold">{docNumber || 'DOC-ATTACHMENT'}</div>
                {soNumber && <div className="text-blue-700 font-mono font-bold">SO: {soNumber}</div>}
                <div className="text-slate-500 text-[10px]">พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH')}</div>
              </div>
            </div>

            {/* Printable File Metadata */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center shadow-2xs">
              <div>
                <div className="font-bold text-slate-900 text-sm">{currentFile.name}</div>
                <div className="text-slate-600 text-[11px] mt-0.5">
                  ประเภท: <strong>{badge.label}</strong> | ขนาด: <strong>{formatFileSize(currentFile.size)}</strong>
                  {projectName && <span> | โครงการ: <strong>{projectName}</strong></span>}
                </div>
              </div>
              <div className="text-right text-[10.5px] font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                ไฟล์ที่ {currentIndex + 1} / {files.length}
              </div>
            </div>

            {/* Printable Media Image / Drawing */}
            {isImage && (
              <div className="my-2 flex items-center justify-center p-3 border border-slate-300 rounded-xl bg-slate-50/50 min-h-[550px] max-h-[680px]">
                <img
                  src={fileSource}
                  alt={currentFile.name}
                  className="max-h-[640px] max-w-full mx-auto object-contain rounded"
                />
              </div>
            )}

            {/* Non-image document summary printable view */}
            {!isImage && (
              <div className="my-10 p-12 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-4 bg-slate-50/50">
                <BadgeIcon className="w-16 h-16 mx-auto text-slate-500" />
                <h3 className="text-lg font-bold text-slate-900">{currentFile.name}</h3>
                <p className="text-xs text-slate-600">
                  ประเภทไฟล์: {badge.label} • ขนาด {formatFileSize(currentFile.size)}
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto italic">
                  ไฟล์นี้ถูกแนบไว้ในระบบ e-Form SO No. {soNumber || '-'} สามารถดาวน์โหลดและเปิดไฟล์ต้นฉบับความละเอียดสูงได้จากระบบ
                </p>
              </div>
            )}
          </div>

          {/* Printable Footer */}
          <div className="pt-3 border-t border-slate-300 text-center text-[9px] text-slate-400 mt-auto flex items-center justify-between">
            <span>เอกสารแนบอิเล็กทรอนิกส์ • LUMENCRAFT CO., LTD. E-Engineer Request System</span>
            <span className="font-mono font-bold text-slate-600">หน้า 1 / 1</span>
          </div>
        </div>
      </div>

    </div>
  );
};

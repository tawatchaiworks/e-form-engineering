import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
  signerName: string;
  roleLabel: string;
  existingSignatureUrl?: string;
  strokeColor?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  signerName,
  roleLabel,
  existingSignatureUrl,
  strokeColor = '#0f172a'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(existingSignatureUrl || null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = 140;

    // Background white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw subtle guide line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, 105);
    ctx.lineTo(canvas.width - 20, 105);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getCanvasPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSavedUrl(dataUrl);
    onSave(dataUrl);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw guide line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, 105);
    ctx.lineTo(canvas.width - 20, 105);
    ctx.stroke();
    ctx.setLineDash([]);

    setHasDrawn(false);
    setSavedUrl(null);
    onSave('');
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-amber-600" />
          ลงนามดิจิทัล: <span className="text-slate-900 font-bold">{signerName || 'ผู้ลงนาม'}</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-normal">
            {roleLabel}
          </span>
        </label>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 transition"
        >
          <RotateCcw className="w-3 h-3" />
          ล้างลายเซ็น
        </button>
      </div>

      <div className="relative border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair touch-none"
          style={{ height: '140px' }}
        />
        {!hasDrawn && !savedUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
            เซ็นชื่อที่นี่ (ใช้นิ้วหรือเมาส์ลากเส้น)
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>* ลายเซ็นอิเล็กทรอนิกส์นี้มีผลผูกพันในการปฏิบัติงาน</span>
        {hasDrawn && (
          <span className="text-emerald-600 font-medium inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> บันทึกลายเซ็นแล้ว
          </span>
        )}
      </div>
    </div>
  );
};

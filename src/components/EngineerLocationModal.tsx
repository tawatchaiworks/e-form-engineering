import React, { useState } from 'react';
import { X, MapPin, Navigation, Compass, RefreshCw, Radio, CheckCircle, ExternalLink } from 'lucide-react';
import { StaffMember, EEngineerRequest } from '../types';

interface EngineerLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember[];
  requests: EEngineerRequest[];
}

export const EngineerLocationModal: React.FC<EngineerLocationModalProps> = ({
  isOpen,
  onClose,
  staff,
  requests,
}) => {
  const [selectedEng, setSelectedEng] = useState<string>('all');
  const [isLocating, setIsLocating] = useState(false);
  const [currentBrowserCoords, setCurrentBrowserCoords] = useState<{ lat: number; lng: number } | null>(null);

  if (!isOpen) return null;

  const engineers = staff.filter(s => s.team === 'Engineer');

  const handleGetLiveGPS = () => {
    if (!navigator.geolocation) {
      alert('เบราว์เซอร์ไม่รองรับ Geolocation');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCurrentBrowserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      err => {
        console.warn('Geolocation error', err);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getFilteredEngs = () => {
    if (selectedEng === 'all') return engineers;
    return engineers.filter(e => e.name === selectedEng);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                พิกัดหน้างานวิศวกร Real-Time (Live GPS Location Hub)
                <span className="flex items-center gap-1 text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <Radio className="w-3 h-3 text-rose-400 animate-pulse" /> Live Tracking
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                พิกัดตำแหน่งจริงและสถานที่ปฏิบัติงานของวิศวกรทั้ง 4 ท่าน
              </p>
            </div>
          </div>
          <button
            id="btn-close-location-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & GPS Trigger */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-700">เลือกวิศวกร:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedEng('all')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  selectedEng === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                ทั้งหมด (4 ท่าน)
              </button>
              {engineers.map(e => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEng(e.name)}
                  className={`px-3 py-1 rounded-md text-xs font-medium border transition ${
                    selectedEng === e.name
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ช่าง{e.name}
                </button>
              ))}
            </div>
          </div>

          <button
            id="btn-fetch-live-gps"
            onClick={handleGetLiveGPS}
            disabled={isLocating}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition disabled:opacity-50"
          >
            {isLocating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                กำลังดึงพิกัดจริง...
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5 mr-1.5" />
                ดึงพิกัด GPS อุปกรณ์ปัจจุบัน
              </>
            )}
          </button>
        </div>

        {/* Content: Map Visualization & Location Cards */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          
          {/* Simulated Interactive Map Stage */}
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-900 flex items-center justify-center">
            {/* Map Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
            
            {/* Map Roads simulation */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <path d="M 50,0 Q 200,150 450,200 T 850,300" fill="none" stroke="#64748b" strokeWidth="6" />
                <path d="M 0,250 Q 300,200 600,100 T 900,50" fill="none" stroke="#64748b" strokeWidth="4" />
                <path d="M 400,0 L 400,400" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6,6" />
                <path d="M 0,150 L 900,150" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6,6" />
              </svg>
            </div>

            {/* Map Area Labels */}
            <div className="absolute top-4 left-6 text-[11px] font-bold text-slate-400">
              BANGKOK & METROPOLITAN AREA (แผนที่พิกัดปฏิบัติงานวิศวกร)
            </div>

            {/* HQ Pin (LUMENCRAFT HQ - Pattanakarn 13) */}
            <div className="absolute top-[45%] left-[62%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
              <div className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black shadow-lg mb-1 whitespace-nowrap border border-amber-300">
                🏢 สำนักงานใหญ่ LUMENCRAFT (พัฒนาการ 13)
              </div>
              <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs ring-4 ring-amber-400/30 animate-pulse">
                LC
              </div>
            </div>

            {/* Engineer Pins */}
            {/* Pin 1: Pat (One Bangkok) */}
            {(selectedEng === 'all' || selectedEng === 'พัด') && (
              <div className="absolute top-[52%] left-[40%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10">
                <div className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold shadow-xl mb-1 whitespace-nowrap border border-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  ช่างพัด (One Bangkok Tower B)
                </div>
                <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-extrabold text-xs shadow-lg ring-4 ring-rose-500/40">
                  พัด
                </div>
                <span className="text-[9px] text-slate-300 bg-slate-950/80 px-1.5 rounded mt-0.5">13.7288, 100.5475</span>
              </div>
            )}

            {/* Pin 2: Choke (HQ / Lumencraft) */}
            {(selectedEng === 'all' || selectedEng === 'โชค') && (
              <div className="absolute top-[38%] left-[68%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10">
                <div className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-xl mb-1 whitespace-nowrap border border-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  ช่างโชค (สแตนด์บาย สำนักงานใหญ่)
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs shadow-lg ring-4 ring-emerald-500/40">
                  โชค
                </div>
                <span className="text-[9px] text-slate-300 bg-slate-950/80 px-1.5 rounded mt-0.5">13.7380, 100.6080</span>
              </div>
            )}

            {/* Pin 3: Win (Dusit Central Park) */}
            {(selectedEng === 'all' || selectedEng === 'วิน') && (
              <div className="absolute top-[60%] left-[34%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10">
                <div className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-bold shadow-xl mb-1 whitespace-nowrap border border-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                  ช่างวิน (Dusit Central Park)
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-lg ring-4 ring-amber-400/40">
                  วิน
                </div>
                <span className="text-[9px] text-slate-300 bg-slate-950/80 px-1.5 rounded mt-0.5">13.7295, 100.5365</span>
              </div>
            )}

            {/* Pin 4: Wat (The Forestias) */}
            {(selectedEng === 'all' || selectedEng === 'วัฒน์') && (
              <div className="absolute top-[75%] left-[80%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10">
                <div className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[11px] font-bold shadow-xl mb-1 whitespace-nowrap border border-purple-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  ช่างวัฒน์ (The Forestias บางนา)
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-extrabold text-xs shadow-lg ring-4 ring-purple-500/40">
                  วัฒน์
                </div>
                <span className="text-[9px] text-slate-300 bg-slate-950/80 px-1.5 rounded mt-0.5">13.6558, 100.6690</span>
              </div>
            )}

            {/* Live Browser GPS pin if fetched */}
            {currentBrowserCoords && (
              <div className="absolute top-[25%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-20">
                <div className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold shadow-lg mb-1 whitespace-nowrap">
                  📍 ตำแหน่งคุณ (พิกัด GPS จริง: {currentBrowserCoords.lat.toFixed(4)}, {currentBrowserCoords.lng.toFixed(4)})
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs ring-4 ring-blue-400/50 animate-bounce">
                  You
                </div>
              </div>
            )}

          </div>

          {/* Detailed Location Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFilteredEngs().map(eng => {
              return (
                <div
                  key={eng.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                        {eng.name[0]}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">ช่าง{eng.name}</h4>
                        <span className="text-xs text-slate-500">โทร: {eng.phone}</span>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        eng.workStatus === 'busy'
                          ? 'bg-rose-100 text-rose-700'
                          : eng.workStatus === 'waiting'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {eng.workStatus === 'busy' ? 'กำลังทำงานหน้างาน' : eng.workStatus === 'waiting' ? 'รองาน / Standby' : 'พร้อมรับงาน'}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700">สถานที่ล่าสุด: </span>
                        <span className="text-slate-800">{eng.currentLocation?.siteName || 'สำนักงานใหญ่'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>พิกัด GPS: {eng.currentLocation?.lat}, {eng.currentLocation?.lng}</span>
                      <span>อัปเดต: {eng.currentLocation?.updatedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-600 truncate max-w-[260px]">
                      <span className="font-medium">ภารกิจ:</span> {eng.currentTask}
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${eng.currentLocation?.lat},${eng.currentLocation?.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                    >
                      ดู Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            ระบบรองรับการตรวจสอบตำแหน่งจริงผ่านพิกัด GPS ขณะวิศวกรกดเช็คอินหน้างาน
          </span>
          <button
            id="btn-location-close-footer"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition"
          >
            ปิดหน้าต่าง (Close)
          </button>
        </div>

      </div>
    </div>
  );
};

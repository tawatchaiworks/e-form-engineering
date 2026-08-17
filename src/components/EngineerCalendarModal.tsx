import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, User, Clock, MapPin, Tag, CheckCircle2, AlertCircle, Sparkles, Check } from 'lucide-react';
import { EEngineerRequest, StaffMember } from '../types';
import { calculateEngineerStatus } from '../utils/engineerStatus';

interface EngineerCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: EEngineerRequest[];
  staff?: StaffMember[];
  onSelectRequest?: (request: EEngineerRequest) => void;
  onSelectEngineer?: (engineerName: string) => void;
}

export const EngineerCalendarModal: React.FC<EngineerCalendarModalProps> = ({
  isOpen,
  onClose,
  requests,
  staff,
  onSelectRequest,
  onSelectEngineer,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 16)); // August 2026
  const [selectedEngineer, setSelectedEngineer] = useState<string>('all');

  if (!isOpen) return null;

  const engineerNames = staff && staff.length > 0
    ? staff.filter(s => s.team === 'Engineer').map(s => s.name)
    : ['พัด', 'โชค', 'วิน', 'วัฒน์'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getRequestsForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return requests.filter(req => {
      const matchDate = req.targetDate === dayStr || req.requestDate === dayStr || req.engineerRescheduleDate === dayStr || req.deadlineDate === dayStr;
      const matchEngineer = selectedEngineer === 'all' || req.assignedEngineer === selectedEngineer;
      return matchDate && matchEngineer;
    });
  };

  const getEngineerBadgeColor = (name?: string) => {
    switch (name) {
      case 'พัด': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'โชค': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'วิน': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'วัฒน์': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Calculate status summaries for all engineers
  const engineerStatuses = engineerNames.map(name => calculateEngineerStatus(name, requests));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                ปฏิทินตรวจเช็คสถานะ & แผนงานวิศวกร Real-Time (Engineer Schedule)
                <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Synced
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                ตรวจสอบสถานะ (ว่าง / รองาน / กำลังทำงาน), วันกำหนดเสร็จ, และตารางงานของวิศวกร
              </p>
            </div>
          </div>
          <button
            id="btn-close-calendar"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Engineer Status Summary Cards Bar */}
        <div className="bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 py-3">
          <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-200">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              สรุปสถานะวิศวกรแบบ Real-time (คำนวณจากงานที่ถือและวันกำหนดเสร็จ):
            </span>
            <span className="text-slate-400 text-[10px]">
              {onSelectEngineer ? '💡 สามารถกดปุ่ม "เลือกช่างผู้นี้" เพื่อมอบหมายงานได้ทันที' : 'คลิกเพื่อกรองตารางงาน'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {engineerStatuses.map(info => {
              const isSelected = selectedEngineer === info.name;
              return (
                <div
                  key={info.name}
                  onClick={() => setSelectedEngineer(isSelected ? 'all' : info.name)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-slate-800 border-blue-500 ring-2 ring-blue-500/30' 
                      : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-black text-xs flex items-center justify-center border border-slate-600">
                        {info.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">ช่าง{info.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {info.activeCount === 0 ? 'ไม่มีงานค้าง' : `ถืออยู่ ${info.activeCount} งาน`}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 shrink-0 ${
                      info.status === 'ว่าง' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : info.status === 'รองาน'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        info.status === 'ว่าง' ? 'bg-emerald-400 animate-pulse' : info.status === 'รองาน' ? 'bg-amber-400' : 'bg-rose-400'
                      }`}></span>
                      {info.status}
                    </span>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                    <div className="text-slate-400 truncate max-w-[140px]">
                      {info.latestDeadline ? (
                        <span title={`กำหนดเสร็จ: ${info.latestDeadline}`}>
                          เสร็จ: <strong className="text-slate-200">{info.latestDeadline}</strong>
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">พร้อมรับงานทันที</span>
                      )}
                    </div>

                    {onSelectEngineer && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEngineer(info.name);
                          onClose();
                        }}
                        className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-0.5 shadow-sm transition"
                        title={`มอบหมายงานให้ช่าง${info.name}`}
                      >
                        <Check className="w-2.5 h-2.5" />
                        <span>เลือกช่าง</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter Bar & Month Navigator */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Engineer filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              มุมมองตารางงาน:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedEngineer('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  selectedEngineer === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                รวมทุกคน ({engineerNames.length} ท่าน)
              </button>
              {engineerNames.map(eng => (
                <button
                  key={eng}
                  onClick={() => setSelectedEngineer(eng)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                    selectedEngineer === eng
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ช่าง{eng}
                </button>
              ))}
            </div>
          </div>

          {/* Month switch */}
          <div className="flex items-center space-x-3">
            <button
              onClick={prevMonth}
              className="p-1 rounded-md border border-slate-200 hover:bg-white text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-800 min-w-[140px] text-center">
              {monthNames[month]} {year + 543}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded-md border border-slate-200 hover:bg-white text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white">
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((dayName, idx) => (
              <div
                key={dayName}
                className={`py-2 text-center text-xs font-bold ${
                  idx === 0 || idx === 6 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {dayName}
              </div>
            ))}

            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50 min-h-[95px] p-1.5 opacity-40"></div>
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === 16 && month === 7 && year === 2026;
              const dayRequests = getRequestsForDay(day);

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[105px] p-1.5 bg-white flex flex-col justify-between transition hover:bg-amber-50/30 ${
                    isToday ? 'ring-2 ring-amber-500 ring-inset bg-amber-50/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        isToday
                          ? 'bg-amber-500 text-slate-950 font-extrabold'
                          : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-bold text-amber-600">วันนี้</span>
                    )}
                  </div>

                  {/* Requests on this day */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[75px]">
                    {dayRequests.map(req => (
                      <div
                        key={req.id}
                        onClick={() => {
                          if (onSelectRequest) {
                            onSelectRequest(req);
                            onClose();
                          }
                        }}
                        className={`text-[10px] p-1 rounded border leading-tight cursor-pointer hover:shadow-sm transition ${getEngineerBadgeColor(
                          req.assignedEngineer
                        )}`}
                        title={`${req.soNumber} - ${req.projectName} (ช่าง${req.assignedEngineer || 'ยังไม่ระบุ'} • กำหนดเสร็จ: ${req.deadlineDate || req.targetDate})`}
                      >
                        <div className="font-bold truncate">{req.soNumber}</div>
                        <div className="truncate text-slate-600">{req.projectName}</div>
                        <div className="flex items-center justify-between text-[9px] mt-0.5 font-semibold">
                          <span>{req.assignedEngineer ? `ช่าง${req.assignedEngineer}` : 'ยังไม่ระบุช่าง'}</span>
                          {req.deadlineDate && req.deadlineDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` ? (
                            <span className="text-red-700 font-black">🏁 กำหนดเสร็จ</span>
                          ) : req.priority === 'alert_emergency' ? (
                            <span className="text-red-600 font-extrabold">ด่วนที่สุด</span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer with Close Button */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">คำอธิบายสี:</span>
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> <strong>ว่าง</strong> (พร้อมรับงาน)
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> <strong>รองาน</strong> (มีคิวรอเริ่ม)
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> <strong>กำลังทำงาน</strong> (กำลังทำตามกำหนดเสร็จ)
            </span>
          </div>
          <button
            id="btn-calendar-close-footer"
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


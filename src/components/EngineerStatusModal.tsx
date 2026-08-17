import React, { useState, useEffect } from 'react';
import { X, Activity, User, Clock, MapPin, CheckCircle, AlertCircle, PlayCircle, Calendar, Timer, Sparkles, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { StaffMember, EEngineerRequest, EngineerDailyAttendance } from '../types';

interface EngineerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember[];
  requests: EEngineerRequest[];
  attendance?: EngineerDailyAttendance[];
  onUpdateStatus?: (engineerId: string, status: 'active' | 'waiting' | 'busy') => void;
  onSaveAttendance?: (record: EngineerDailyAttendance) => void;
}

export const EngineerStatusModal: React.FC<EngineerStatusModalProps> = ({
  isOpen,
  onClose,
  staff,
  requests,
  attendance = [],
  onUpdateStatus,
  onSaveAttendance,
}) => {
  const [viewMode, setViewMode] = useState<'hourly' | 'daily' | 'weekly'>('daily');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [localAttendance, setLocalAttendance] = useState<EngineerDailyAttendance[]>(attendance);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Sync external attendance
  useEffect(() => {
    if (attendance && attendance.length > 0) {
      setLocalAttendance(attendance);
    }
  }, [attendance]);

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const engineers = staff.filter(s => s.team === 'Engineer');

  // Format real-time live clock
  const timeString = currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const timeShort = currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const dateString = currentTime.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long' });
  const todayIso = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;
  const currentHourNumber = currentTime.getHours();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'ว่าง (พร้อมรับงาน)',
          color: 'bg-emerald-500 text-white',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          dot: 'bg-emerald-500',
          desc: 'พร้อมรับมอบหมายงานใหม่ทันที'
        };
      case 'waiting':
        return {
          label: 'รองาน (Standby / รอยืนยันแบบ)',
          color: 'bg-amber-500 text-white',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-300',
          dot: 'bg-amber-500',
          desc: 'กำลังรอคอนเฟิร์มหน้างาน / รอนัดหมาย'
        };
      case 'busy':
        return {
          label: 'กำลังทำงาน (On Site / In-Progress)',
          color: 'bg-rose-500 text-white',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-300',
          dot: 'bg-rose-500',
          desc: 'กำลังปฏิบัติหน้าที่ ณ โครงการหน้างาน'
        };
      default:
        return {
          label: 'ลา / นอกเวลา',
          color: 'bg-slate-500 text-white',
          badgeBg: 'bg-slate-50 text-slate-700 border-slate-300',
          dot: 'bg-slate-500',
          desc: 'ลางานหรืออยู่นอกเวลาทำการ'
        };
    }
  };

  // Check-In handler for an engineer
  const handleCheckIn = (eng: StaffMember) => {
    const defaultLoc = eng.currentLocation ? eng.currentLocation.siteName : 'สำนักงานใหญ่ LUMENCRAFT พัฒนาการ';
    const existing = localAttendance.find(a => a.engineerId === eng.id);
    const newRecord: EngineerDailyAttendance = {
      id: existing ? existing.id : `att-${eng.id}-${Date.now()}`,
      engineerId: eng.id,
      engineerName: eng.name,
      date: todayIso,
      checkInTime: `${timeShort} น.`,
      checkOutTime: undefined,
      checkInLocation: defaultLoc,
      totalHours: 'กำลังทำงาน...',
      status: 'checked_in',
      notes: `Check-in เข้างานเรียบร้อย (${defaultLoc})`
    };

    const updated = [
      ...localAttendance.filter(a => !(a.engineerId === eng.id && a.date === todayIso)),
      newRecord
    ];
    setLocalAttendance(updated);
    if (onSaveAttendance) onSaveAttendance(newRecord);
    if (onUpdateStatus) onUpdateStatus(eng.id, 'busy');

    setActionSuccessMsg(`บันทึก Check-In ช่าง${eng.name} สำเร็จเวลา ${timeShort} น.`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Check-Out handler for an engineer
  const handleCheckOut = (eng: StaffMember) => {
    const existing = localAttendance.find(a => a.engineerId === eng.id) || {
      id: `att-${eng.id}-${Date.now()}`,
      engineerId: eng.id,
      engineerName: eng.name,
      date: todayIso,
      checkInTime: '08:30 น.',
      checkInLocation: 'สำนักงานใหญ่ LUMENCRAFT'
    };

    const newRecord: EngineerDailyAttendance = {
      ...existing,
      checkOutTime: `${timeShort} น.`,
      checkOutLocation: eng.currentLocation ? eng.currentLocation.siteName : 'สำนักงานใหญ่ LUMENCRAFT พัฒนาการ',
      totalHours: '8 ชม. 30 นาที',
      status: 'completed',
      notes: `Check-out บันทึกเวลากลับเสร็จสมบูรณ์`
    };

    const updated = [
      ...localAttendance.filter(a => !(a.engineerId === eng.id && a.date === todayIso)),
      newRecord
    ];
    setLocalAttendance(updated);
    if (onSaveAttendance) onSaveAttendance(newRecord);
    if (onUpdateStatus) onUpdateStatus(eng.id, 'active');

    setActionSuccessMsg(`บันทึก Check-Out ช่าง${eng.name} สำเร็จเวลา ${timeShort} น. (ปิดรอบประจำวัน)`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const getEngineerAttendance = (engId: string): EngineerDailyAttendance | undefined => {
    return localAttendance.find(a => a.engineerId === engId);
  };

  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const weeksOfMonth = ['สัปดาห์ที่ 1 (1-7 ส.ค.)', 'สัปดาห์ที่ 2 (8-14 ส.ค.)', 'สัปดาห์ที่ 3 (15-21 ส.ค.)', 'สัปดาห์ที่ 4 (22-28 ส.ค.)', 'สัปดาห์ที่ 5 (29-31 ส.ค.)'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header with Live Clock */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                สถานการณ์ทำงานวิศวกร Real-Time (Live Status & Daily Attendance)
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                สถานะรายวันมี Check-in, Check-out และแสดงเวลาปฏิบัติงานจริง (4 วิศวกร LUMENCRAFT)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Real-time Clock Widget */}
            <div className="bg-slate-800/90 border border-slate-700 px-3.5 py-1.5 rounded-xl text-right">
              <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>เวลาปัจจุบัน (Live Time)</span>
              </div>
              <div className="text-xs sm:text-sm font-black font-mono text-amber-300 tracking-wider">
                {timeString} น.
              </div>
              <div className="text-[9px] text-slate-400 hidden sm:block">
                {dateString}
              </div>
            </div>

            <button
              id="btn-close-engineer-status"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionSuccessMsg && (
          <div className="bg-emerald-600 text-white px-6 py-2 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {actionSuccessMsg}
            </span>
            <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-200 hover:text-white">✕</button>
          </div>
        )}

        {/* View Mode Controls & Live Time Indicators */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-700">รูปแบบการแสดงผล:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
              <button
                id="btn-view-daily"
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  viewMode === 'daily'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายวัน (Daily Check-in/Out)
              </button>
              <button
                id="btn-view-hourly"
                onClick={() => setViewMode('hourly')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  viewMode === 'hourly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายชั่วโมง (Hourly)
              </button>
              <button
                id="btn-view-weekly"
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  viewMode === 'weekly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายสัปดาห์ (Weekly)
              </button>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> ว่าง (เขียว)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> รองาน (เหลือง)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> กำลังทำงาน (แดง)
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* 4 Engineers Cards with Check-In / Check-Out and Time Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {engineers.map(eng => {
              const badge = getStatusBadge(eng.workStatus);
              const att = getEngineerAttendance(eng.id);
              return (
                <div
                  key={eng.id}
                  className={`rounded-xl border p-4 shadow-sm flex flex-col justify-between transition hover:shadow-md ${
                    eng.workStatus === 'busy'
                      ? 'border-rose-300 bg-rose-50/20'
                      : eng.workStatus === 'waiting'
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-emerald-300 bg-emerald-50/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm shadow">
                          {eng.name[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">ช่าง{eng.name}</h4>
                          <span className="text-[11px] text-slate-500">{eng.phone}</span>
                        </div>
                      </div>
                      <span className={`w-3.5 h-3.5 rounded-full shadow ${badge.color}`}></span>
                    </div>

                    <div className={`mt-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${badge.badgeBg}`}>
                      {badge.label}
                    </div>

                    {/* Daily Attendance & Time Display (Check-in / Check-out) */}
                    <div className="mt-3 bg-white/95 rounded-xl p-3 border border-slate-200/90 space-y-2 text-xs shadow-xs">
                      <div className="text-[11px] font-bold text-slate-800 border-b border-slate-100 pb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-indigo-700">
                          <Timer className="w-3.5 h-3.5" /> บันทึกเวลาประจำวัน
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">วันนี้</span>
                      </div>

                      {/* Check-In Time */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                          <LogIn className="w-3 h-3 text-emerald-600" /> Check-in:
                        </span>
                        <strong className="text-emerald-700 font-mono text-xs">
                          {att?.checkInTime || '08:30 น.'}
                        </strong>
                      </div>

                      {/* Check-Out Time */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                          <LogOut className="w-3 h-3 text-rose-600" /> Check-out:
                        </span>
                        <strong className="text-slate-700 font-mono text-xs">
                          {att?.checkOutTime || (att?.status === 'checked_in' ? 'กำลังปฏิบัติงาน...' : '17:30 น.')}
                        </strong>
                      </div>

                      {/* Total Duration */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-500 font-medium">รวมเวลาทำงาน:</span>
                        <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                          {att?.totalHours || '9 ชม. 00 นาที'}
                        </span>
                      </div>

                      {/* Check-in / Out Action Buttons */}
                      <div className="pt-2 flex gap-1.5">
                        <button
                          onClick={() => handleCheckIn(eng)}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs transition"
                          title="บันทึกเวลา Check-in ตอนนี้"
                        >
                          <LogIn className="w-3 h-3" />
                          Check-in
                        </button>
                        <button
                          onClick={() => handleCheckOut(eng)}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] shadow-xs transition"
                          title="บันทึกเวลา Check-out บันทึกกลับ"
                        >
                          <LogOut className="w-3 h-3" />
                          Check-out
                        </button>
                      </div>
                    </div>

                    {/* Task & Site Details */}
                    <div className="mt-2.5 text-xs text-slate-600 space-y-1">
                      <div className="line-clamp-2">
                        <span className="font-semibold text-slate-700">งานปัจจุบัน:</span>{' '}
                        {eng.currentTask || 'พร้อมรับมอบหมายงาน'}
                      </div>
                      {eng.currentLocation && (
                        <div className="flex items-start gap-1 text-[11px] text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{eng.currentLocation.siteName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual quick toggle for simulation */}
                  {onUpdateStatus && (
                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-1">
                      <span className="text-[10px] text-slate-500 font-medium">เปลี่ยนสถานะ:</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => onUpdateStatus(eng.id, 'active')}
                          className={`w-6 h-6 rounded-md text-[10px] font-bold border transition ${
                            eng.workStatus === 'active'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          }`}
                          title="ว่าง"
                        >
                          เขียว
                        </button>
                        <button
                          onClick={() => onUpdateStatus(eng.id, 'waiting')}
                          className={`w-6 h-6 rounded-md text-[10px] font-bold border transition ${
                            eng.workStatus === 'waiting'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                          }`}
                          title="รองาน"
                        >
                          เหลือง
                        </button>
                        <button
                          onClick={() => onUpdateStatus(eng.id, 'busy')}
                          className={`w-6 h-6 rounded-md text-[10px] font-bold border transition ${
                            eng.workStatus === 'busy'
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                          }`}
                          title="กำลังทำงาน"
                        >
                          แดง
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Timeline View based on Mode */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                {viewMode === 'daily' && `ตารางบันทึกสถานะรายวัน (Daily Check-in / Check-out & Working Hours Summary)`}
                {viewMode === 'hourly' && `ตารางเวลาช่วงเวลาปฏิบัติงานประจำวัน (Hourly Schedule: วันนี้ ${dateString})`}
                {viewMode === 'weekly' && 'ตารางสรุปภาพรวมรายสัปดาห์ (Weekly View: สิงหาคม 2026)'}
              </h4>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  เวลา Live: {timeString} น.
                </span>
              </div>
            </div>

            <div className="overflow-x-auto p-4">
              {viewMode === 'daily' && (
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 bg-slate-50 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3">วิศวกร</th>
                      <th className="py-3 px-3">สถานะความพร้อม</th>
                      <th className="py-3 px-3">เวลา Check-in</th>
                      <th className="py-3 px-3">เวลา Check-out</th>
                      <th className="py-3 px-3">ระยะเวลาทำงานรวม</th>
                      <th className="py-3 px-3">สถานที่ / ไซต์งาน</th>
                      <th className="py-3 px-3 text-right">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {engineers.map(eng => {
                      const badge = getStatusBadge(eng.workStatus);
                      const att = getEngineerAttendance(eng.id);
                      return (
                        <tr key={eng.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">
                                {eng.name[0]}
                              </span>
                              <span>ช่าง{eng.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.badgeBg}`}>
                              <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                            {att?.checkInTime || '08:30 น.'}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-700">
                            {att?.checkOutTime || (att?.status === 'checked_in' ? 'กำลังปฏิบัติงาน...' : '17:30 น.')}
                          </td>
                          <td className="py-3 px-3 font-medium text-indigo-900">
                            <span className="bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[11px]">
                              {att?.totalHours || '9 ชม. 00 นาที'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            <span className="flex items-center gap-1 text-[11px]">
                              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                              {att?.checkInLocation || eng.currentLocation?.siteName || 'สำนักงานใหญ่ LUMENCRAFT'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleCheckIn(eng)}
                                className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold transition"
                              >
                                Check-in
                              </button>
                              <button
                                onClick={() => handleCheckOut(eng)}
                                className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold transition"
                              >
                                Check-out
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {viewMode === 'hourly' && (
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-2 px-3 w-28 bg-slate-50">วิศวกร</th>
                      {hours.map(h => {
                        const hNumber = parseInt(h.split(':')[0], 10);
                        const isCurrentHour = currentHourNumber === hNumber;
                        return (
                          <th 
                            key={h} 
                            className={`py-2 px-2 text-center text-[11px] min-w-[55px] ${
                              isCurrentHour ? 'bg-amber-100 text-amber-900 font-bold border-b-2 border-amber-500' : ''
                            }`}
                          >
                            <div>{h}</div>
                            {isCurrentHour && <div className="text-[9px] text-amber-700 font-black">ตอนนี้</div>}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {engineers.map(eng => (
                      <tr key={eng.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-bold text-slate-900 bg-slate-50/50">
                          <div>ช่าง{eng.name}</div>
                          <span className="text-[10px] text-slate-400 font-normal">08:30-17:30</span>
                        </td>
                        {hours.map((h, idx) => {
                          let cellStatus: 'active' | 'waiting' | 'busy' = 'active';
                          if (eng.name === 'พัด') {
                            cellStatus = idx >= 1 && idx <= 5 ? 'busy' : 'waiting';
                          } else if (eng.name === 'วัฒน์') {
                            cellStatus = idx >= 2 && idx <= 7 ? 'busy' : 'active';
                          } else if (eng.name === 'วิน') {
                            cellStatus = idx >= 1 && idx <= 3 ? 'waiting' : 'active';
                          } else {
                            cellStatus = 'active';
                          }

                          return (
                            <td key={h} className="p-1 text-center">
                              <div
                                className={`h-8 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-xs transition ${
                                  cellStatus === 'busy'
                                    ? 'bg-rose-500'
                                    : cellStatus === 'waiting'
                                    ? 'bg-amber-400 text-slate-900'
                                    : 'bg-emerald-500'
                                }`}
                                title={`ช่าง${eng.name} ช่วงเวลา ${h} - ${parseInt(h.split(':')[0]) + 1}:00 น.: ${
                                  cellStatus === 'busy' ? 'กำลังทำงานหน้างาน (On Site)' : cellStatus === 'waiting' ? 'รองาน/เตรียมตัว (Standby)' : 'ว่าง (Available)'
                                }`}
                              >
                                {cellStatus === 'busy' ? 'ทำงาน' : cellStatus === 'waiting' ? 'รองาน' : 'ว่าง'}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {viewMode === 'weekly' && (
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-2 px-3 w-28 bg-slate-50">วิศวกร</th>
                      {weeksOfMonth.map(w => (
                        <th key={w} className="py-2 px-2 text-center text-[11px] min-w-[120px]">{w}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {engineers.map(eng => (
                      <tr key={eng.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-bold text-slate-900 bg-slate-50/50">ช่าง{eng.name}</td>
                        {weeksOfMonth.map((w, wIdx) => (
                          <td key={w} className="p-2 text-center">
                            <div className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-left space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-slate-700">สำเร็จ: {5 + wIdx * 2} งาน</span>
                                <span className="text-emerald-600 font-bold">100%</span>
                              </div>
                              <div className="text-[10px] text-slate-500">เวลาทำงานรวม: {38 + wIdx * 2} ชม./สัปดาห์</div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5">
                                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${80 + wIdx * 4}%` }}></div>
                              </div>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>ระบบอัปเดตสถานะช่างอัตโนมัติ Real-Time ล่าสุด ณ เวลา <strong className="text-slate-800 font-mono">{timeString} น.</strong></span>
          </div>
          <button
            id="btn-status-close-footer"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition shadow-sm"
          >
            <X className="w-4 h-4 mr-1" />
            ปิดหน้าต่าง (Close)
          </button>
        </div>

      </div>
    </div>
  );
};


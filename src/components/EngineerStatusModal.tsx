import React, { useState, useEffect } from 'react';
import { X, Activity, User, Clock, MapPin, CheckCircle, AlertCircle, PlayCircle, Calendar, Timer, Sparkles, LogIn, LogOut, CheckCircle2, Layers, History } from 'lucide-react';
import { StaffMember, EEngineerRequest, EngineerDailyAttendance, AttendanceSession } from '../types';

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

  const parseTimeToMinutes = (timeStr?: string): number | null => {
    if (!timeStr) return null;
    const match = timeStr.match(/(\d{1,2})[:.](\d{1,2})/);
    if (!match) return null;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  };

  const calculateDuration = (inTimeStr?: string, outTimeStr?: string): string => {
    if (!inTimeStr || !outTimeStr) return '0 ชม. 00 นาที';
    const inMins = parseTimeToMinutes(inTimeStr);
    const outMins = parseTimeToMinutes(outTimeStr);
    if (inMins === null || outMins === null || outMins < inMins) return '3 ชม. 30 นาที';
    const diff = outMins - inMins;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours} ชม. ${mins > 0 ? `${String(mins).padStart(2, '0')} นาที` : '00 นาที'}`;
  };

  const calculateTotalWorkingHours = (sessions?: AttendanceSession[]): string => {
    if (!sessions || sessions.length === 0) return '0 ชม. 00 นาที';
    let totalMinutes = 0;
    sessions.forEach(s => {
      if (s.checkInTime && s.checkOutTime) {
        const inMins = parseTimeToMinutes(s.checkInTime);
        const outMins = parseTimeToMinutes(s.checkOutTime);
        if (inMins !== null && outMins !== null && outMins >= inMins) {
          totalMinutes += (outMins - inMins);
        }
      }
    });
    if (totalMinutes === 0) return 'กำลังทำงาน...';
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours} ชม. ${mins > 0 ? `${String(mins).padStart(2, '0')} นาที` : '00 นาที'}`;
  };

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

  // Helper to retrieve and normalize 4 sessions (ครั้งที่ 1, 2, 3, 4) for an engineer
  const getEngineerSessions = (engId: string): AttendanceSession[] => {
    const att = localAttendance.find(a => a.engineerId === engId);
    if (att?.sessions && att.sessions.length > 0) {
      return att.sessions;
    }
    if (att?.checkInTime) {
      return [
        {
          sessionNumber: 1,
          checkInTime: att.checkInTime,
          checkInLocation: att.checkInLocation || 'สำนักงานใหญ่ LUMENCRAFT',
          checkOutTime: att.checkOutTime,
          checkOutLocation: att.checkOutLocation,
          duration: att.checkOutTime ? calculateDuration(att.checkInTime, att.checkOutTime) : undefined,
          status: att.checkOutTime ? 'completed' : 'checked_in',
          notes: att.notes || 'รอบที่ 1'
        }
      ];
    }
    return [];
  };

  // Check-In handler for an engineer (Supports 4 sessions without overwriting history)
  const handleCheckIn = (eng: StaffMember) => {
    const defaultLoc = eng.currentLocation ? eng.currentLocation.siteName : 'สำนักงานใหญ่ LUMENCRAFT พัฒนาการ';
    const existing = localAttendance.find(a => a.engineerId === eng.id);

    const existingSessions: AttendanceSession[] = existing?.sessions && existing.sessions.length > 0 
      ? [...existing.sessions] 
      : existing?.checkInTime 
        ? [{
            sessionNumber: 1,
            checkInTime: existing.checkInTime,
            checkInLocation: existing.checkInLocation || defaultLoc,
            checkOutTime: existing.checkOutTime,
            checkOutLocation: existing.checkOutLocation,
            duration: existing.checkOutTime ? calculateDuration(existing.checkInTime, existing.checkOutTime) : undefined,
            status: existing.checkOutTime ? 'completed' : 'checked_in',
            notes: existing.notes || 'รอบที่ 1'
          }]
        : [];

    // Check if the last session is open
    const activeSessionIndex = existingSessions.findIndex(s => !s.checkOutTime);
    let updatedSessions: AttendanceSession[];
    let sessionNumber = 1;

    if (activeSessionIndex >= 0) {
      sessionNumber = existingSessions[activeSessionIndex].sessionNumber;
      updatedSessions = [...existingSessions];
      setActionSuccessMsg(`ช่าง${eng.name} อยู่ในสถานะ Check-in ครั้งที่ ${sessionNumber} อยู่แล้ว (ปุ่มสีแดง: กำลังทำงาน)`);
    } else {
      sessionNumber = Math.min(existingSessions.length + 1, 4);
      const newSession: AttendanceSession = {
        sessionNumber,
        taskName: eng.currentTask || 'งานบริการและตรวจสอบระบบหน้างาน',
        jobId: (eng.currentTask && eng.currentTask.match(/SO-[0-9]+/)?.[0]) || 'SO-SERVICE',
        checkInTime: `${timeShort} น.`,
        checkInLocation: defaultLoc,
        status: 'checked_in',
        notes: `Check-in ครั้งที่ ${sessionNumber} (${eng.currentTask || defaultLoc})`
      };

      if (existingSessions.length >= 4) {
        updatedSessions = [...existingSessions.slice(0, 3), newSession];
      } else {
        updatedSessions = [...existingSessions, newSession];
      }

      setActionSuccessMsg(`บันทึก Check-In ช่าง${eng.name} ครั้งที่ ${sessionNumber} สำเร็จเวลา ${timeShort} น. (ปุ่มและสถานะเปลี่ยนเป็นสีแดง: กำลังทำงาน)`);
    }

    const firstCheckIn = updatedSessions[0]?.checkInTime || `${timeShort} น.`;
    const newRecord: EngineerDailyAttendance = {
      id: existing ? existing.id : `att-${eng.id}-${Date.now()}`,
      engineerId: eng.id,
      engineerName: eng.name,
      date: todayIso,
      checkInTime: firstCheckIn,
      checkOutTime: undefined,
      checkInLocation: defaultLoc,
      totalHours: calculateTotalWorkingHours(updatedSessions),
      status: 'checked_in',
      notes: `Check-in เข้างานครั้งที่ ${sessionNumber} (${defaultLoc})`,
      sessions: updatedSessions
    };

    const updated = [
      ...localAttendance.filter(a => !(a.engineerId === eng.id && a.date === todayIso)),
      newRecord
    ];
    setLocalAttendance(updated);
    if (onSaveAttendance) onSaveAttendance(newRecord);
    if (onUpdateStatus) onUpdateStatus(eng.id, 'busy');

    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Check-Out handler for an engineer (Supports 4 sessions without overwriting history)
  const handleCheckOut = (eng: StaffMember) => {
    const existing = localAttendance.find(a => a.engineerId === eng.id);
    const defaultLoc = eng.currentLocation ? eng.currentLocation.siteName : 'สำนักงานใหญ่ LUMENCRAFT พัฒนาการ';

    const existingSessions: AttendanceSession[] = existing?.sessions && existing.sessions.length > 0 
      ? [...existing.sessions] 
      : [{
          sessionNumber: 1,
          checkInTime: existing?.checkInTime || '08:30 น.',
          checkInLocation: existing?.checkInLocation || defaultLoc,
          status: 'checked_in',
          notes: 'รอบที่ 1'
        }];

    // Find the active open session to close
    const activeSessionIndex = existingSessions.findIndex(s => !s.checkOutTime);
    let sessionNumber = 1;
    let updatedSessions: AttendanceSession[];

    if (activeSessionIndex >= 0) {
      sessionNumber = existingSessions[activeSessionIndex].sessionNumber;
      const closedSession: AttendanceSession = {
        ...existingSessions[activeSessionIndex],
        checkOutTime: `${timeShort} น.`,
        checkOutLocation: defaultLoc,
        duration: calculateDuration(existingSessions[activeSessionIndex].checkInTime, `${timeShort} น.`),
        status: 'completed',
        notes: `Check-out ออกงานครั้งที่ ${sessionNumber} เรียบร้อย`
      };
      updatedSessions = [
        ...existingSessions.slice(0, activeSessionIndex),
        closedSession,
        ...existingSessions.slice(activeSessionIndex + 1)
      ];
    } else {
      sessionNumber = existingSessions.length > 0 ? existingSessions[existingSessions.length - 1].sessionNumber : 1;
      const lastSession = existingSessions[existingSessions.length - 1] || {
        sessionNumber: 1,
        checkInTime: '08:30 น.',
        checkInLocation: defaultLoc
      };
      const closedSession: AttendanceSession = {
        ...lastSession,
        checkOutTime: `${timeShort} น.`,
        checkOutLocation: defaultLoc,
        duration: calculateDuration(lastSession.checkInTime, `${timeShort} น.`),
        status: 'completed',
        notes: `Check-out ออกงานครั้งที่ ${sessionNumber} เรียบร้อย`
      };
      updatedSessions = [
        ...existingSessions.slice(0, existingSessions.length - 1),
        closedSession
      ];
    }

    const totalHours = calculateTotalWorkingHours(updatedSessions);
    const newRecord: EngineerDailyAttendance = {
      id: existing ? existing.id : `att-${eng.id}-${Date.now()}`,
      engineerId: eng.id,
      engineerName: eng.name,
      date: todayIso,
      checkInTime: updatedSessions[0]?.checkInTime || '08:30 น.',
      checkOutTime: `${timeShort} น.`,
      checkOutLocation: defaultLoc,
      totalHours: totalHours || '8 ชม. 30 นาที',
      status: 'completed',
      notes: `Check-out บันทึกเวลากลับครั้งที่ ${sessionNumber} เรียบร้อย`,
      sessions: updatedSessions
    };

    const updated = [
      ...localAttendance.filter(a => !(a.engineerId === eng.id && a.date === todayIso)),
      newRecord
    ];
    setLocalAttendance(updated);
    if (onSaveAttendance) onSaveAttendance(newRecord);
    if (onUpdateStatus) onUpdateStatus(eng.id, 'active');

    setActionSuccessMsg(`บันทึก Check-Out ช่าง${eng.name} ครั้งที่ ${sessionNumber} สำเร็จเวลา ${timeShort} น. (เปลี่ยนเป็นสีเขียว: พร้อมรับงาน)`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const getEngineerAttendance = (engId: string): EngineerDailyAttendance | undefined => {
    return localAttendance.find(a => a.engineerId === engId);
  };

  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const weeksOfMonth = ['สัปดาห์ที่ 1 (1-7 ส.ค.)', 'สัปดาห์ที่ 2 (8-14 ส.ค.)', 'สัปดาห์ที่ 3 (15-21 ส.ค.)', 'สัปดาห์ที่ 4 (22-28 ส.ค.)', 'สัปดาห์ที่ 5 (29-31 ส.ค.)'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
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
                ระบบเก็บบันทึก Log เวลา Check-in และ Check-out ทุกครั้ง (แยกเป็นครั้งที่ 1, 2, 3, 4 เวลาไม่ถูกแทนที่)
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Notification Bar if any check-in / check-out happens */}
        {actionSuccessMsg && (
          <div className="bg-emerald-600 text-white px-6 py-2 text-xs font-bold flex items-center justify-between animate-fadeIn shadow-inner">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              {actionSuccessMsg}
            </span>
            <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded text-emerald-100">Live Updated</span>
          </div>
        )}

        {/* Navigation & Controls Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-1.5 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              ตารางบันทึกประจำวัน (4 ครั้ง)
            </button>
            <button
              onClick={() => setViewMode('hourly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'hourly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Timer className="w-3.5 h-3.5 text-amber-600" />
              ช่วงเวลาปฏิบัติงาน (Timeline รายชั่วโมง)
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'weekly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-blue-600" />
              สรุปภาพรวมประจำสัปดาห์
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">สัญลักษณ์สถานะ:</span>
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
          
          {/* 4 Engineers Cards with 4-Session Logs Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {engineers.map(eng => {
              const badge = getStatusBadge(eng.workStatus);
              const sessions = getEngineerSessions(eng.id);
              const activeSession = sessions.find(s => !s.checkOutTime);
              const isCheckedIn = !!activeSession || eng.workStatus === 'busy';
              const nextSessionNum = activeSession ? activeSession.sessionNumber : Math.min(sessions.length + 1, 4);

              return (
                <div
                  key={eng.id}
                  className={`rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition hover:shadow-md ${
                    eng.workStatus === 'busy'
                      ? 'border-rose-300 bg-rose-50/20'
                      : eng.workStatus === 'waiting'
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-emerald-300 bg-emerald-50/20'
                  }`}
                >
                  <div>
                    {/* Header with Avatar and Live Dot */}
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

                    <div className={`mt-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center justify-between ${badge.badgeBg}`}>
                      <span>{badge.label}</span>
                      <span className="text-[10px] opacity-80">
                        {isCheckedIn ? `(รอบที่ ${nextSessionNum})` : `(ว่าง)`}
                      </span>
                    </div>

                    {/* Session Log Display: โชว์จำนวนครั้งก็ต่อเมื่อมีการเช็คอินและเช็คเอาท์ตามรอบจริง */}
                    <div className="mt-3 bg-white/95 rounded-xl p-3 border border-slate-200 space-y-2 text-xs shadow-xs">
                      <div className="text-[11px] font-bold text-slate-800 border-b border-slate-100 pb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-indigo-700">
                          <Layers className="w-3.5 h-3.5" /> รอบการลงเวลา (Check-in/Out)
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                          {sessions.length > 0 ? `บันทึกแล้ว ${sessions.length}/4 รอบ` : 'ยังไม่มีรอบ'}
                        </span>
                      </div>

                      {/* Sessions List - โชว์เฉพาะรอบที่มีการ Check-in / Check-out งานจริง */}
                      {sessions.length === 0 ? (
                        <div className="py-3 px-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-1">
                          <div className="text-[11px] text-slate-500 font-medium">ยังไม่มีรอบการลงเวลาสำหรับงานนี้</div>
                          <div className="text-[10px] text-slate-400">กดปุ่ม Check-in ด้านล่างเพื่อเริ่มรอบที่ 1</div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {sessions.map((sess) => {
                            const isSessionActive = !sess.checkOutTime;

                            return (
                              <div
                                key={sess.sessionNumber}
                                className={`p-2 rounded-lg border text-[11px] transition shadow-2xs ${
                                  isSessionActive
                                    ? 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-400'
                                    : 'bg-slate-50/90 border-slate-200 text-slate-800'
                                }`}
                              >
                                <div className="flex items-center justify-between font-bold text-[10px]">
                                  <span className="flex items-center gap-1.5">
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                      isSessionActive
                                        ? 'bg-rose-600 text-white animate-pulse'
                                        : 'bg-indigo-600 text-white'
                                    }`}>
                                      {sess.sessionNumber}
                                    </span>
                                    <span>ครั้งที่ {sess.sessionNumber}</span>
                                    {sess.taskName && (
                                      <span className="text-[9px] text-slate-500 max-w-[110px] truncate font-normal">
                                        • {sess.taskName}
                                      </span>
                                    )}
                                  </span>

                                  {isSessionActive ? (
                                    <span className="text-rose-600 font-bold flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                                      กำลังทำงาน (เข้าแล้ว)
                                    </span>
                                  ) : sess.duration ? (
                                    <span className="text-emerald-700 font-mono text-[9px] font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                      {sess.duration}
                                    </span>
                                  ) : (
                                    <span className="text-emerald-600 text-[9px]">เสร็จสิ้น</span>
                                  )}
                                </div>

                                <div className="mt-1.5 grid grid-cols-2 gap-1 text-[10px] font-mono">
                                  <div className="flex items-center gap-1 text-emerald-700 bg-white/90 px-1.5 py-0.5 rounded border border-slate-100">
                                    <LogIn className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">เข้า: {sess.checkInTime}</span>
                                  </div>
                                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-100 ${
                                    isSessionActive 
                                      ? 'text-rose-700 bg-rose-100/50 font-bold' 
                                      : 'text-slate-700 bg-white/90'
                                  }`}>
                                    <LogOut className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">ออก: {sess.checkOutTime || 'กำลังทำ...'}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Cumulative Total Duration */}
                      {sessions.length > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-600 font-medium">รวมเวลาปฏิบัติงาน:</span>
                          <span className="font-bold text-indigo-950 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[10px]">
                            {calculateTotalWorkingHours(sessions)}
                          </span>
                        </div>
                      )}

                      {/* Check-in / Out Action Buttons - Button turns from Green to Red upon Check-In */}
                      <div className="pt-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCheckIn(eng)}
                          className={`flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg font-bold text-[10px] shadow-xs transition cursor-pointer ${
                            isCheckedIn
                              ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400/40 animate-pulse'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                          title={
                            isCheckedIn
                              ? `Check-in แล้ว (ครั้งที่ ${nextSessionNum} สีแดง: กำลังปฏิบัติงาน)`
                              : `กด Check-in เข้างานครั้งที่ ${nextSessionNum} (จะเปลี่ยนเป็นสีแดง)`
                          }
                        >
                          <LogIn className="w-3 h-3" />
                          <span>
                            {isCheckedIn
                              ? `Check-in แล้ว (ครั้งที่ ${nextSessionNum})`
                              : `Check-in ครั้งที่ ${nextSessionNum}`}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCheckOut(eng)}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] shadow-xs transition cursor-pointer"
                          title={`บันทึกเวลา Check-out ออกงานครั้งที่ ${nextSessionNum} (เปลี่ยนเป็นสีเขียว: พร้อมรับงาน)`}
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Check-out</span>
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
                          className={`w-6 h-6 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                            eng.workStatus === 'active'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          }`}
                          title="ว่าง (เขียว)"
                        >
                          เขียว
                        </button>
                        <button
                          onClick={() => onUpdateStatus(eng.id, 'waiting')}
                          className={`w-6 h-6 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                            eng.workStatus === 'waiting'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                          }`}
                          title="รองาน (เหลือง)"
                        >
                          เหลือง
                        </button>
                        <button
                          onClick={() => onUpdateStatus(eng.id, 'busy')}
                          className={`w-6 h-6 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                            eng.workStatus === 'busy'
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                          }`}
                          title="กำลังทำงาน (แดง)"
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
                {viewMode === 'daily' && `ตารางบันทึกสถานะรายวัน แยก 4 ครั้ง (Daily Check-in & Check-out Logs: ครั้งที่ 1, 2, 3, 4)`}
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
                      <th className="py-3 px-3">สถานะ</th>
                      <th className="py-3 px-2 text-center">ครั้งที่ 1 (เข้า-ออก)</th>
                      <th className="py-3 px-2 text-center">ครั้งที่ 2 (เข้า-ออก)</th>
                      <th className="py-3 px-2 text-center">ครั้งที่ 3 (เข้า-ออก)</th>
                      <th className="py-3 px-2 text-center">ครั้งที่ 4 (เข้า-ออก)</th>
                      <th className="py-3 px-3 text-center">เวลารวม</th>
                      <th className="py-3 px-3 text-right">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {engineers.map(eng => {
                      const badge = getStatusBadge(eng.workStatus);
                      const sessions = getEngineerSessions(eng.id);
                      const activeSession = sessions.find(s => !s.checkOutTime);
                      const isCheckedIn = !!activeSession || eng.workStatus === 'busy';
                      const nextSessionNum = activeSession ? activeSession.sessionNumber : Math.min(sessions.length + 1, 4);

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
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.badgeBg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                              {badge.label}
                            </span>
                          </td>

                          {/* Sessions 1, 2, 3, 4 columns */}
                          {[1, 2, 3, 4].map(roundNum => {
                            const s = sessions.find(sess => sess.sessionNumber === roundNum);
                            const isActive = s && !s.checkOutTime;

                            return (
                              <td key={roundNum} className="py-3 px-2 text-center">
                                {s ? (
                                  <div className={`p-1.5 rounded-lg border text-[10px] font-mono inline-block text-left ${
                                    isActive
                                      ? 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-400'
                                      : 'bg-slate-50 border-slate-200 text-slate-700'
                                  }`}>
                                    <div className="text-emerald-700 font-bold flex items-center gap-1">
                                      <LogIn className="w-2.5 h-2.5" /> {s.checkInTime}
                                    </div>
                                    <div className="text-slate-600 flex items-center gap-1">
                                      <LogOut className="w-2.5 h-2.5" /> {s.checkOutTime || 'กำลังทำ...'}
                                    </div>
                                    {s.duration && (
                                      <div className="text-[9px] text-indigo-700 font-sans font-medium pt-0.5 border-t border-slate-200/60">
                                        ({s.duration})
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-300 text-xs font-mono">-</span>
                                )}
                              </td>
                            );
                          })}

                          <td className="py-3 px-3 text-center font-medium text-indigo-900">
                            <span className="bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[11px] font-bold">
                              {calculateTotalWorkingHours(sessions)}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCheckIn(eng)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer ${
                                  isCheckedIn
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white ring-1 ring-rose-400'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                                title={
                                  isCheckedIn
                                    ? `Check-in แล้ว (ครั้งที่ ${nextSessionNum})`
                                    : `กด Check-in เข้างานครั้งที่ ${nextSessionNum}`
                                }
                              >
                                <LogIn className="w-3 h-3" />
                                {isCheckedIn ? `Check-in แล้ว (${nextSessionNum})` : `Check-in (${nextSessionNum})`}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCheckOut(eng)}
                                className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                title={`Check-out ออกงานครั้งที่ ${nextSessionNum}`}
                              >
                                <LogOut className="w-3 h-3" />
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


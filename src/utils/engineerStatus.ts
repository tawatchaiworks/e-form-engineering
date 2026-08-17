import { EEngineerRequest } from '../types';

export type EngineerWorkStatus = 'ว่าง' | 'รองาน' | 'กำลังทำงาน';

export interface EngineerStatusSummary {
  name: string;
  status: EngineerWorkStatus;
  text: string; // Alias for status
  statusColor: string;
  badgeBg: string;
  badgeColor: string; // Alias for badgeBg
  dotColor: string;
  textColor: string;
  borderColor: string;
  desc: string;
  activeCount: number;
  inProgressCount: number;
  readyCount: number;
  earliestDeadline?: string;
  latestDeadline?: string;
  activeRequests: EEngineerRequest[];
  completedCount: number;
}

export const calculateEngineerStatus = (
  engineerName: string,
  requests: EEngineerRequest[]
): EngineerStatusSummary => {
  const cleanName = engineerName.trim();
  
  // Active requests for this engineer
  const activeRequests = requests.filter(r => {
    if (r.assignedEngineer !== cleanName) return false;
    return ['ready_for_site', 'in_progress', 'pending_engineer_accept'].includes(r.status);
  });

  const completedRequests = requests.filter(r => 
    r.assignedEngineer === cleanName && ['completed_by_engineer', 'completed_by_customer', 'closed'].includes(r.status)
  );

  const inProgressReqs = activeRequests.filter(r => r.status === 'in_progress');
  const readyReqs = activeRequests.filter(r => r.status === 'ready_for_site' || r.status === 'pending_engineer_accept');

  // Deadlines of active jobs
  const deadlines = activeRequests
    .map(r => r.deadlineDate || r.targetDate)
    .filter(Boolean)
    .sort();

  const earliestDeadline = deadlines[0];
  const latestDeadline = deadlines[deadlines.length - 1];

  let status: EngineerWorkStatus = 'ว่าง';
  let desc = 'ว่าง พร้อมรับมอบหมายงานใหม่ทันที';
  let statusColor = 'bg-emerald-500 text-white';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-300';
  let dotColor = 'bg-emerald-500';
  let textColor = 'text-emerald-700';
  let borderColor = 'border-emerald-300';

  if (inProgressReqs.length > 0) {
    status = 'กำลังทำงาน';
    desc = `กำลังปฏิบัติงาน (${inProgressReqs.length} งาน • กำหนดเสร็จ: ${latestDeadline || 'ตามนัด'})`;
    statusColor = 'bg-rose-500 text-white';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-300';
    dotColor = 'bg-rose-500';
    textColor = 'text-rose-700';
    borderColor = 'border-rose-300';
  } else if (readyReqs.length > 0) {
    status = 'รองาน';
    desc = `มีคิวงานรอเริ่ม (${readyReqs.length} งาน • นัดหมาย: ${earliestDeadline || 'เร็วๆ นี้'})`;
    statusColor = 'bg-amber-500 text-white';
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-300';
    dotColor = 'bg-amber-500';
    textColor = 'text-amber-700';
    borderColor = 'border-amber-300';
  }

  return {
    name: cleanName,
    status,
    text: status,
    statusColor,
    badgeBg,
    badgeColor: badgeBg,
    dotColor,
    textColor,
    borderColor,
    desc,
    activeCount: activeRequests.length,
    inProgressCount: inProgressReqs.length,
    readyCount: readyReqs.length,
    earliestDeadline,
    latestDeadline,
    activeRequests,
    completedCount: completedRequests.length,
  };
};

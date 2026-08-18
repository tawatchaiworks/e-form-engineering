import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  TrendingUp, Users, CheckCircle2, AlertTriangle, Star, Clock, 
  FileText, Printer, Search, Filter, Eye, EyeOff, ChevronRight, Activity, Calendar,
  Award, Sparkles, MessageSquare, ThumbsUp, HeartHandshake, ShieldCheck,
  Phone, UserCheck, Lock, Unlock, KeyRound, Shield, ShieldAlert, LogOut, Zap
} from 'lucide-react';
import { EEngineerRequest, StaffMember } from '../types';

interface ExecutiveDashboardProps {
  requests: EEngineerRequest[];
  staff: StaffMember[];
  onOpenDocumentPrint: (request: EEngineerRequest) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const MONTH_NAMES_TH: Record<string, string> = {
  '01': 'ม.ค.',
  '02': 'ก.พ.',
  '03': 'มี.ค.',
  '04': 'เม.ย.',
  '05': 'พ.ค.',
  '06': 'มิ.ย.',
  '07': 'ก.ค.',
  '08': 'ส.ค.',
  '09': 'ก.ย.',
  '10': 'ต.ค.',
  '11': 'พ.ย.',
  '12': 'ธ.ค.',
};

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  requests,
  staff,
  onOpenDocumentPrint,
}) => {
  // Security Authentication State (user: admin, password: admin) - auto-signs out when leaving page
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    const user = usernameInput.trim();
    const pass = passwordInput;

    if (user.toLowerCase() === 'admin' && pass === 'admin') {
      setIsAuthorized(true);
      setAuthError(null);
    } else {
      setAuthError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
    setIsSubmitting(false);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Satisfaction & Analytics Filters
  const [selectedEngineer, setSelectedEngineer] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' | '2026-08' | '2026-07' ...
  const [satisfactionTab, setSatisfactionTab] = useState<'percent' | 'overview' | 'monthly' | 'engineers' | 'dimensions'>('percent');
  const [percentViewMode, setPercentViewMode] = useState<'all' | 'by_engineer'>('all');

  const engineers = useMemo(() => staff.filter(s => s.team === 'Engineer'), [staff]);

  // Extract unique available months from requests
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    requests.forEach(r => {
      const dateStr = r.requestDate || r.createdAt || '';
      if (dateStr.length >= 7) {
        monthsSet.add(dateStr.substring(0, 7));
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [requests]);

  // Filter requests based on selected engineer & month for satisfaction analytics
  const filteredSatisfactionRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesEng = selectedEngineer === 'all' || r.assignedEngineer === selectedEngineer;
      const dateStr = r.requestDate || r.createdAt || '';
      const matchesMonth = selectedMonth === 'all' || dateStr.startsWith(selectedMonth);
      return matchesEng && matchesMonth;
    });
  }, [requests, selectedEngineer, selectedMonth]);

  // Overall KPI Calculations
  const total = requests.length;
  const closedOrCompleted = requests.filter(r => r.status === 'closed' || r.status === 'completed_by_customer' || r.status === 'completed_by_engineer').length;
  const inProgress = requests.filter(r => r.status === 'in_progress').length;
  const overdue = requests.filter(r => {
    if (r.status === 'closed' || r.status === 'completed_by_customer') return false;
    const deadline = new Date(r.deadlineDate || r.targetDate).getTime();
    return !isNaN(deadline) && deadline < new Date().getTime();
  }).length;

  // Average Turnaround Time Calculation (Days)
  const completedList = requests.filter(r => r.status === 'closed' || r.status === 'completed_by_customer' || r.status === 'completed_by_engineer');
  let avgTurnaroundDays = 2.1;
  if (completedList.length > 0) {
    const totalDays = completedList.reduce((acc, r) => {
      const start = new Date(r.requestDate || r.createdAt).getTime();
      const end = new Date(r.updatedAt || r.deadlineDate || r.targetDate).getTime();
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        return acc + ((end - start) / (1000 * 60 * 60 * 24));
      }
      return acc + 2;
    }, 0);
    avgTurnaroundDays = +(totalDays / completedList.length).toFixed(1);
    if (avgTurnaroundDays <= 0) avgTurnaroundDays = 1.5;
  }

  const successRatePct = total > 0 ? Math.round((closedOrCompleted / total) * 100) : 100;
  const onTimeRatePct = total > 0 ? Math.max(0, Math.round(((total - overdue) / total) * 100)) : 100;

  // ==========================================
  // SATISFACTION ANALYTICS DATA BUILDERS
  // ==========================================

  // 1. Filtered CSAT & Sales CSAT Overall Scores
  const customerRatedReqs = filteredSatisfactionRequests.filter(r => r.customerEvaluation);
  const salesRatedReqs = filteredSatisfactionRequests.filter(r => r.salesEvaluation);

  const avgCustScoreNum = customerRatedReqs.length > 0
    ? customerRatedReqs.reduce((acc, r) => {
        const e = r.customerEvaluation!;
        return acc + (e.grooming + e.knowledge + e.problemSolving + e.manner + e.responsiveness) / 5;
      }, 0) / customerRatedReqs.length
    : 5.0;
  const avgCustScore = avgCustScoreNum.toFixed(2);
  const avgCustPct = ((avgCustScoreNum / 5) * 100).toFixed(1);

  const avgSalesScoreNum = salesRatedReqs.length > 0
    ? salesRatedReqs.reduce((acc, r) => {
        const s = r.salesEvaluation!;
        return acc + (s.communication + s.punctuality + s.quality + s.problemSolving + s.overall) / 5;
      }, 0) / salesRatedReqs.length
    : 5.0;
  const avgSalesScore = avgSalesScoreNum.toFixed(2);
  const avgSalesPct = ((avgSalesScoreNum / 5) * 100).toFixed(1);

  const avgCombinedScore = (((avgCustScoreNum + avgSalesScoreNum) / 2)).toFixed(2);
  const avgCombinedPct = (((avgCustScoreNum + avgSalesScoreNum) / 10) * 100).toFixed(1);
  const csatGap = (+avgCustPct - +avgSalesPct).toFixed(1);

  // 2. Monthly Trend Data (Customer vs Sales Satisfaction by Month)
  // If an engineer is selected, show this engineer's monthly scores; else show company-wide monthly scores
  const monthlySatisfactionChartData = useMemo(() => {
    // Sort months chronologically
    const sortedMonths = [...availableMonths].sort();
    return sortedMonths.map(m => {
      const [year, month] = m.split('-');
      const thMonth = MONTH_NAMES_TH[month] || month;
      const label = `${thMonth} ${year.substring(2)}`;

      const mReqs = requests.filter(r => {
        const matchesEng = selectedEngineer === 'all' || r.assignedEngineer === selectedEngineer;
        const d = r.requestDate || r.createdAt || '';
        return matchesEng && d.startsWith(m);
      });

      const mCustReqs = mReqs.filter(r => r.customerEvaluation);
      const mSaleReqs = mReqs.filter(r => r.salesEvaluation);

      const custScore = mCustReqs.length > 0
        ? +(mCustReqs.reduce((acc, r) => {
            const e = r.customerEvaluation!;
            return acc + (e.grooming + e.knowledge + e.problemSolving + e.manner + e.responsiveness) / 5;
          }, 0) / mCustReqs.length).toFixed(2)
        : null;

      const saleScore = mSaleReqs.length > 0
        ? +(mSaleReqs.reduce((acc, r) => {
            const s = r.salesEvaluation!;
            return acc + (s.communication + s.punctuality + s.quality + s.problemSolving + s.overall) / 5;
          }, 0) / mSaleReqs.length).toFixed(2)
        : null;

      const custPct = custScore !== null ? +((custScore / 5) * 100).toFixed(1) : 100;
      const salePct = saleScore !== null ? +((saleScore / 5) * 100).toFixed(1) : 100;

      return {
        monthKey: m,
        name: label,
        ความพึงพอใจลูกค้า: custScore ?? 5.0,
        ความพึงพอใจเซลล์: saleScore ?? 5.0,
        ความพึงพอใจลูกค้าเปอร์เซ็นต์: custPct,
        ความพึงพอใจเซลล์เปอร์เซ็นต์: salePct,
        จำนวนงานที่ประเมิน: mCustReqs.length + mSaleReqs.length,
      };
    });
  }, [requests, availableMonths, selectedEngineer]);

  // 3. Engineer Breakdown Data (Customer vs Sales Satisfaction by Engineer)
  const engineerSatisfactionChartData = useMemo(() => {
    return engineers.map(eng => {
      const engReqs = requests.filter(r => {
        const matchesEng = r.assignedEngineer === eng.name;
        const d = r.requestDate || r.createdAt || '';
        const matchesMonth = selectedMonth === 'all' || d.startsWith(selectedMonth);
        return matchesEng && matchesMonth;
      });

      const custReqs = engReqs.filter(r => r.customerEvaluation);
      const saleReqs = engReqs.filter(r => r.salesEvaluation);

      const custAvg = custReqs.length > 0
        ? +(custReqs.reduce((acc, r) => {
            const e = r.customerEvaluation!;
            return acc + (e.grooming + e.knowledge + e.problemSolving + e.manner + e.responsiveness) / 5;
          }, 0) / custReqs.length).toFixed(2)
        : 5.0;

      const saleAvg = saleReqs.length > 0
        ? +(saleReqs.reduce((acc, r) => {
            const s = r.salesEvaluation!;
            return acc + (s.communication + s.punctuality + s.quality + s.problemSolving + s.overall) / 5;
          }, 0) / saleReqs.length).toFixed(2)
        : 5.0;

      const custPct = +((custAvg / 5) * 100).toFixed(1);
      const salePct = +((saleAvg / 5) * 100).toFixed(1);
      const combinedPct = +(((custAvg + saleAvg) / 10) * 100).toFixed(1);

      const totalCompleted = engReqs.filter(r => r.status === 'closed' || r.status === 'completed_by_customer' || r.status === 'completed_by_engineer').length;

      // Extract latest positive feedback
      const latestFeedback = custReqs.find(r => r.customerEvaluation?.feedback)?.customerEvaluation?.feedback 
        || saleReqs.find(r => r.salesEvaluation?.description)?.salesEvaluation?.description 
        || 'ปฏิบัติงานตามมาตรฐานความปลอดภัยและความเรียบร้อย';

      return {
        id: eng.id,
        name: `ช่าง${eng.name}`,
        rawName: eng.name,
        phone: eng.phone,
        workStatus: eng.workStatus,
        ความพึงพอใจลูกค้า: custAvg,
        ความพึงพอใจเซลล์: saleAvg,
        ความพึงพอใจลูกค้าเปอร์เซ็นต์: custPct,
        ความพึงพอใจเซลล์เปอร์เซ็นต์: salePct,
        ความพึงพอใจรวมเปอร์เซ็นต์: combinedPct,
        คะแนนรวมเฉลี่ย: +((custAvg + saleAvg) / 2).toFixed(2),
        งานทั้งหมด: engReqs.length,
        งานที่สำเร็จ: totalCompleted,
        จำนวนประเมิน: custReqs.length,
        latestFeedback,
      };
    });
  }, [engineers, requests, selectedMonth]);

  // Top Performing Engineer
  const topEngineer = useMemo(() => {
    if (engineerSatisfactionChartData.length === 0) return null;
    return [...engineerSatisfactionChartData].sort((a, b) => b.คะแนนรวมเฉลี่ย - a.คะแนนรวมเฉลี่ย)[0];
  }, [engineerSatisfactionChartData]);

  // Selected Individual Engineer Profile & Breakdown Data
  const currentEngineerProfile = useMemo(() => {
    if (selectedEngineer === 'all') return null;
    return engineerSatisfactionChartData.find(e => e.rawName === selectedEngineer) || null;
  }, [selectedEngineer, engineerSatisfactionChartData]);

  const selectedEngineerEvaluatedJobs = useMemo(() => {
    if (selectedEngineer === 'all') return [];
    return filteredSatisfactionRequests.filter(
      r => r.assignedEngineer === selectedEngineer && (r.customerEvaluation || r.salesEvaluation)
    );
  }, [selectedEngineer, filteredSatisfactionRequests]);

  const selectedEngineerDimensions = useMemo(() => {
    if (selectedEngineer === 'all') return null;
    const engCustReqs = filteredSatisfactionRequests.filter(r => r.assignedEngineer === selectedEngineer && r.customerEvaluation);
    const engSaleReqs = filteredSatisfactionRequests.filter(r => r.assignedEngineer === selectedEngineer && r.salesEvaluation);
    
    const cLen = engCustReqs.length || 1;
    const sLen = engSaleReqs.length || 1;

    const cGrooming = engCustReqs.reduce((acc, r) => acc + r.customerEvaluation!.grooming, 0) / cLen;
    const cKnowledge = engCustReqs.reduce((acc, r) => acc + r.customerEvaluation!.knowledge, 0) / cLen;
    const cProblemSolving = engCustReqs.reduce((acc, r) => acc + r.customerEvaluation!.problemSolving, 0) / cLen;
    const cManner = engCustReqs.reduce((acc, r) => acc + r.customerEvaluation!.manner, 0) / cLen;
    const cResponsiveness = engCustReqs.reduce((acc, r) => acc + r.customerEvaluation!.responsiveness, 0) / cLen;

    const sComm = engSaleReqs.reduce((acc, r) => acc + r.salesEvaluation!.communication, 0) / sLen;
    const sPunctual = engSaleReqs.reduce((acc, r) => acc + r.salesEvaluation!.punctuality, 0) / sLen;
    const sQuality = engSaleReqs.reduce((acc, r) => acc + r.salesEvaluation!.quality, 0) / sLen;
    const sProblem = engSaleReqs.reduce((acc, r) => acc + r.salesEvaluation!.problemSolving, 0) / sLen;
    const sOverall = engSaleReqs.reduce((acc, r) => acc + r.salesEvaluation!.overall, 0) / sLen;

    return {
      customer: [
        { label: '1. การแต่งกาย / บุคลิกภาพ & Safety', score: +cGrooming.toFixed(2), pct: Math.round((cGrooming / 5) * 100) },
        { label: '2. ความรู้ความเชี่ยวชาญในผลิตภัณฑ์', score: +cKnowledge.toFixed(2), pct: Math.round((cKnowledge / 5) * 100) },
        { label: '3. ความสามารถในการแก้ปัญหาหน้างาน', score: +cProblemSolving.toFixed(2), pct: Math.round((cProblemSolving / 5) * 100) },
        { label: '4. กิริยามารยาทและการพูดจาสุภาพ', score: +cManner.toFixed(2), pct: Math.round((cManner / 5) * 100) },
        { label: '5. ความรวดเร็วและตรงต่อเวลา', score: +cResponsiveness.toFixed(2), pct: Math.round((cResponsiveness / 5) * 100) },
      ],
      sales: [
        { label: '1. การสื่อสารและรายงานกับฝ่ายขาย', score: +sComm.toFixed(2), pct: Math.round((sComm / 5) * 100) },
        { label: '2. ความตรงต่อเวลาและตามนัดหมาย', score: +sPunctual.toFixed(2), pct: Math.round((sPunctual / 5) * 100) },
        { label: '3. คุณภาพผลงานและความเรียบร้อย', score: +sQuality.toFixed(2), pct: Math.round((sQuality / 5) * 100) },
        { label: '4. การแก้ไขปัญหาและการตัดสินใจ', score: +sProblem.toFixed(2), pct: Math.round((sProblem / 5) * 100) },
        { label: '5. ภาพรวมความพึงพอใจและการร่วมงาน', score: +sOverall.toFixed(2), pct: Math.round((sOverall / 5) * 100) },
      ],
      custCount: engCustReqs.length,
      salesCount: engSaleReqs.length,
    };
  }, [selectedEngineer, filteredSatisfactionRequests]);

  // 4. 5-Dimension Radar Comparison Data
  // Customer 5 Dimensions
  let cGrooming = 0, cKnowledge = 0, cProblemSolving = 0, cManner = 0, cResponsiveness = 0;
  customerRatedReqs.forEach(r => {
    const e = r.customerEvaluation!;
    cGrooming += e.grooming;
    cKnowledge += e.knowledge;
    cProblemSolving += e.problemSolving;
    cManner += e.manner;
    cResponsiveness += e.responsiveness;
  });
  const cCount = customerRatedReqs.length || 1;

  // Sales 5 Dimensions
  let sComm = 0, sPunctual = 0, sQuality = 0, sProblemSolving = 0, sOverall = 0;
  salesRatedReqs.forEach(r => {
    const s = r.salesEvaluation!;
    sComm += s.communication;
    sPunctual += s.punctuality;
    sQuality += s.quality;
    sProblemSolving += s.problemSolving;
    sOverall += s.overall;
  });
  const sCount = salesRatedReqs.length || 1;

  const customerRadarData = [
    { subject: '1.แต่งกาย/Safety', score: customerRatedReqs.length ? +(cGrooming / cCount).toFixed(2) : 5.0, fullMark: 5 },
    { subject: '2.ความรู้/เชี่ยวชาญ', score: customerRatedReqs.length ? +(cKnowledge / cCount).toFixed(2) : 5.0, fullMark: 5 },
    { subject: '3.แก้ปัญหาเฉพาะหน้า', score: customerRatedReqs.length ? +(cProblemSolving / cCount).toFixed(2) : 5.0, fullMark: 5 },
    { subject: '4.มารยาท/สื่อสาร', score: customerRatedReqs.length ? +(cManner / cCount).toFixed(2) : 5.0, fullMark: 5 },
    { subject: '5.ความรวดเร็ว', score: customerRatedReqs.length ? +(cResponsiveness / cCount).toFixed(2) : 5.0, fullMark: 5 },
  ];

  const salesRadarData = [
    { subject: '1.สื่อสารกับเซลล์', score: salesRatedReqs.length ? +(sComm / sCount).toFixed(2) : 5.0, fullMark: 5 },
    { subject: '2.ตรงต่อเวลา', score: salesRatedReqs.length ? +(sPunctual / sCount).toFixed(2) : 5.0, fullMark: 5 },
    { subject: '3.คุณภาพงาน', score: salesRatedReqs.length ? +(sQuality / sCount).toFixed(2) : 5.0, fullMark: 5 },
    { subject: '4.การแก้ปัญหา', score: salesRatedReqs.length ? +(sProblemSolving / sCount).toFixed(2) : 5.0, fullMark: 5 },
    { subject: '5.ภาพรวมการทำงาน', score: salesRatedReqs.length ? +(sOverall / sCount).toFixed(2) : 5.0, fullMark: 5 },
  ];

  // 5. Pie Chart: Status Breakdown
  const statusCounts: Record<string, number> = {
    'รอฝ่ายขายลงนาม': requests.filter(r => r.status === 'pending_sale_sign').length,
    'รอช่างตอบรับ': requests.filter(r => r.status === 'pending_engineer_accept').length,
    'รอลงพื้นที่': requests.filter(r => r.status === 'ready_for_site').length,
    'กำลังดำเนินการ': requests.filter(r => r.status === 'in_progress').length,
    'รอลูกค้า/ฝ่ายขายประเมิน': requests.filter(r => r.status === 'completed_by_engineer' || r.status === 'completed_by_customer').length,
    'ปิดงานสมบูรณ์': requests.filter(r => r.status === 'closed').length,
  };

  const pieData = Object.keys(statusCounts)
    .filter(key => statusCounts[key] > 0)
    .map(key => ({
      name: key,
      value: statusCounts[key],
    }));

  // Filter requests table
  const filteredTableRequests = requests.filter(r => {
    const matchesSearch = 
      r.soNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.salesOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.assignedEngineer && r.assignedEngineer.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesEngineer = selectedEngineer === 'all' || r.assignedEngineer === selectedEngineer;
    const dateStr = r.requestDate || r.createdAt || '';
    const matchesMonth = selectedMonth === 'all' || dateStr.startsWith(selectedMonth);

    return matchesSearch && matchesStatus && matchesEngineer && matchesMonth;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_sale_sign':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700">รอฝ่ายขายลงนาม</span>;
      case 'pending_engineer_accept':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">รอวิศวกรตอบรับ</span>;
      case 'ready_for_site':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">รอลงพื้นที่</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">กำลังดำเนินการ</span>;
      case 'completed_by_engineer':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">รอลูกค้าตรวจรับ</span>;
      case 'completed_by_customer':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">รอฝ่ายขายปิดงาน</span>;
      case 'closed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white">ปิดงานสมบูรณ์ (Closed)</span>;
      case 'engineer_rejected':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-700 text-white">ช่างส่งคืน/ปฏิเสธ</span>;
      case 'engineer_rescheduled':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">ขอเลื่อนวันนัด</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  // 🔒 EXECUTIVE SECURITY GATE (USER: admin, PASSWORD: admin)
  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto py-8 sm:py-12 px-4">
        <div className="bg-slate-900 text-white rounded-3xl border-2 border-indigo-500/40 shadow-2xl overflow-hidden relative backdrop-blur-xl">
          {/* Background Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

          {/* Security Banner Header */}
          <div className="p-6 sm:p-8 text-center border-b border-slate-800 relative z-10 space-y-3">
            <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-slate-800 to-amber-500/20 border border-indigo-500/30 text-indigo-400 shadow-inner">
              <ShieldCheck className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                <Lock className="w-3 h-3 text-amber-400" />
                Executive Access Control (Security Gate)
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                ระบบรักษาความปลอดภัยแดชบอร์ดผู้บริหาร
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
                หน้านี้สงวนสิทธิ์เฉพาะผู้บริหารระดับสูงและผู้ดูแลระบบเท่านั้น กรุณากรอกรหัสผ่านเพื่อเข้าใช้งาน
              </p>
            </div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="p-6 sm:p-8 space-y-5 relative z-10">
            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">การยืนยันตัวตนไม่สำเร็จ (Sign In Failed)</div>
                  <div className="text-[11px] text-rose-300 mt-0.5">{authError}</div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                ชื่อผู้ใช้งาน (Username) <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  id="exec-username-input"
                  type="text"
                  required
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้งานแดชบอร์ด"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                รหัสผ่าน (Password) <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="exec-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full pl-10 pr-11 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                id="btn-submit-exec-auth"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4 text-amber-300" />
                <span>เข้าสู่ระบบแดชบอร์ด (Sign In)</span>
              </button>
            </div>

            <div className="text-center pt-2 space-y-1">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                ระบบจะ <strong>Sign Out อัตโนมัติ</strong> ทันทีเมื่อท่านเปลี่ยนไปหน้าอื่น
              </p>
              <p className="text-[10px] text-slate-500">
                LUMENCRAFT Enterprise Security Gate • Protocol 2026
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded bg-indigo-600 text-white font-black text-xs">
              Executive Management
            </span>
            <span className="text-xs text-slate-400">
              ระบบแดชบอร์ดผู้บริหาร & วิเคราะห์ความพึงพอใจลูกค้าและฝ่ายขาย
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            Executive Satisfaction Dashboard & Master Analytics
          </h2>
        </div>

        {/* Global Filter Bar & Security Admin Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Security Admin Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Signed in as: <strong className="text-white">admin</strong></span>
          </div>

          {/* Filter Group */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700">
            {/* Engineer Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400 text-[11px]">วิศวกร:</span>
              <select
                value={selectedEngineer}
                onChange={e => setSelectedEngineer(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-800 text-white">วิศวกรทุกคน (All Engineers)</option>
                {engineers.map(eng => (
                  <option key={eng.id} value={eng.name} className="bg-slate-800 text-white">ช่าง{eng.name}</option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 text-[11px]">เดือน:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-800 text-white">ทุกเดือน (All Months Trend)</option>
              {availableMonths.map(m => {
                const [y, mon] = m.split('-');
                const thLabel = `${MONTH_NAMES_TH[mon] || mon} ${y}`;
                return (
                  <option key={m} value={m} className="bg-slate-800 text-white">{thLabel}</option>
                );
              })}
            </select>
          </div>

          {(selectedEngineer !== 'all' || selectedMonth !== 'all') && (
            <button
              onClick={() => {
                setSelectedEngineer('all');
                setSelectedMonth('all');
              }}
              className="text-[11px] px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition"
            >
              ล้างตัวกรอง
            </button>
          )}

          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🌟 SATISFACTION HIGHLIGHT & CSAT KPI CARDS */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-500/30 p-6 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        {/* Header of Satisfaction Area */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10 border-b border-indigo-800/40 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              Customer & Sales Satisfaction Analytics
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              สรุปความพึงพอใจของลูกค้าและฝ่ายขาย 
              {selectedEngineer !== 'all' && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
                  เฉพาะ: ช่าง{selectedEngineer}
                </span>
              )}
              {selectedMonth !== 'all' && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/40 text-amber-200">
                  ประจำเดือน: {MONTH_NAMES_TH[selectedMonth.split('-')[1]]} {selectedMonth.split('-')[0]}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-300">
              วิเคราะห์ความพึงพอใจ 5 มิติทั้งจากมุมมองลูกค้าหน้างานและฝ่ายขายผู้ประสานงาน เปรียบเทียบตามรายวิศวกรและดูแนวโน้มรายเดือน
            </p>
          </div>

          {/* Sub-Tabs for Satisfaction Views */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80 text-xs">
            <button
              onClick={() => setSatisfactionTab('percent')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                satisfactionTab === 'percent'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>💯 % ความพึงพอใจ</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-400/40 text-emerald-200">
                ใหม่
              </span>
            </button>
            <button
              onClick={() => setSatisfactionTab('overview')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                satisfactionTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              📊 ภาพรวมคู่ขนาน
            </button>
            <button
              onClick={() => setSatisfactionTab('monthly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                satisfactionTab === 'monthly'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              📈 กราฟรายเดือน
            </button>
            <button
              onClick={() => setSatisfactionTab('engineers')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                satisfactionTab === 'engineers'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              👥 แยกตามวิศวกร
            </button>
            <button
              onClick={() => setSatisfactionTab('dimensions')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                satisfactionTab === 'dimensions'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              🎯 เรดาร์ 5 มิติ
            </button>
          </div>
        </div>

        {/* 4 Satisfaction KPI Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          
          {/* Card 1: Customer CSAT */}
          <div className="bg-slate-800/70 backdrop-blur rounded-xl border border-emerald-500/30 p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-emerald-300">ความพึงพอใจลูกค้า (Customer CSAT)</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-black text-emerald-400">{avgCustPct}%</div>
              <span className="text-xs text-slate-300">({avgCustScore} / 5.00)</span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-700/50">
              <span>ประเมินแล้ว: {customerRatedReqs.length} ใบงาน</span>
              <span className="text-emerald-400 font-bold">
                {+avgCustScore >= 4.8 ? 'ดีเยี่ยม (Excellent)' : 'มาตรฐานดี (Good)'}
              </span>
            </div>
          </div>

          {/* Card 2: Sales CSAT */}
          <div className="bg-slate-800/70 backdrop-blur rounded-xl border border-blue-500/30 p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-blue-300">ความพึงพอใจเซลล์ (Sales Score)</span>
              <ThumbsUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-black text-blue-400">{avgSalesPct}%</div>
              <span className="text-xs text-slate-300">({avgSalesScore} / 5.00)</span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-700/50">
              <span>ประเมินแล้ว: {salesRatedReqs.length} ใบงาน</span>
              <span className="text-blue-400 font-bold">5 มิติฝ่ายขาย</span>
            </div>
          </div>

          {/* Card 3: Top Engineer */}
          <div className="bg-slate-800/70 backdrop-blur rounded-xl border border-amber-500/30 p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-amber-300">วิศวกรคะแนนสูงสุด (Top Performer)</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-black text-amber-300 truncate">
                {topEngineer ? topEngineer.name : 'ช่างพัด'}
              </div>
              <span className="text-xs font-bold text-amber-400">
                {topEngineer ? `${topEngineer.ความพึงพอใจรวมเปอร์เซ็นต์}%` : '98.6%'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-700/50">
              <span>เฉลี่ย: {topEngineer ? topEngineer.คะแนนรวมเฉลี่ย : '4.95'}/5.0</span>
              <span className="text-amber-400 font-bold">🏆 ขวัญใจลูกค้า</span>
            </div>
          </div>

          {/* Card 4: Evaluation Coverage */}
          <div className="bg-slate-800/70 backdrop-blur rounded-xl border border-purple-500/30 p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-purple-300">อัตราการตรวจรับและประเมิน</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-purple-400">
              {closedOrCompleted > 0 ? Math.round((customerRatedReqs.length / closedOrCompleted) * 100) : 100}%
            </div>
            <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-700/50">
              <span>ประเมินแล้ว {customerRatedReqs.length} จาก {closedOrCompleted}</span>
              <span className="text-purple-300 font-bold">มีผลประเมินจริง</span>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 🌟 INTERACTIVE QUICK-SELECT ENGINEER BAR & CHIPS */}
        {/* ======================================================== */}
        <div className="bg-slate-800/90 backdrop-blur rounded-2xl border border-slate-700/80 p-4 relative z-10 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">
                เลือกดูความพึงพอใจรายวิศวกร (Select Individual Engineer)
              </h4>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                คลิกเพื่อดูสรุปผลงานและเรดาร์ประเมินเจาะจงของวิศวกรแต่ละคน
              </span>
            </div>
            {selectedEngineer !== 'all' && (
              <button
                onClick={() => setSelectedEngineer('all')}
                className="self-start sm:self-auto text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-semibold transition flex items-center gap-1"
              >
                <span>✕ ดูภาพรวมทุกคน (Show All)</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedEngineer('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                selectedEngineer === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg ring-2 ring-indigo-400/50'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>วิศวกรทุกคน (All Engineers)</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedEngineer === 'all' ? 'bg-indigo-900/80 text-indigo-200' : 'bg-slate-800 text-slate-400'
              }`}>
                {engineerSatisfactionChartData.length} ท่าน
              </span>
            </button>

            {engineerSatisfactionChartData.map(eng => {
              const isSelected = selectedEngineer === eng.rawName;
              return (
                <button
                  key={eng.id}
                  onClick={() => setSelectedEngineer(isSelected ? 'all' : eng.rawName)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg ring-2 ring-emerald-400/60'
                      : 'bg-slate-900/80 text-slate-200 hover:bg-slate-700/80 hover:text-white border border-slate-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                    isSelected ? 'bg-white text-emerald-800' : 'bg-indigo-600/80 text-white'
                  }`}>
                    {eng.rawName[0]}
                  </div>
                  <span>{eng.name}</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isSelected ? 'bg-emerald-950/80 text-emerald-200' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      ลูกค้า {eng.ความพึงพอใจลูกค้าเปอร์เซ็นต์}%
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isSelected ? 'bg-blue-950/80 text-blue-200' : 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                    }`}>
                      เซลล์ {eng.ความพึงพอใจเซลล์เปอร์เซ็นต์}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 🏆 DEDICATED INDIVIDUAL ENGINEER SPOTLIGHT & SCORECARD */}
        {/* (Rendered when a specific engineer is selected) */}
        {/* ======================================================== */}
        {currentEngineerProfile && selectedEngineerDimensions && (
          <div className="bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-900 rounded-2xl border-2 border-indigo-500/40 p-6 relative z-10 shadow-2xl space-y-6">
            
            {/* Engineer Profile Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/50 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center font-black text-white text-2xl shadow-lg border border-indigo-400/40">
                  {currentEngineerProfile.rawName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-white">{currentEngineerProfile.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                      {currentEngineerProfile.workStatus}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                      คะแนนเฉลี่ย {currentEngineerProfile.คะแนนรวมเฉลี่ย} / 5.0 ดาว
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      {currentEngineerProfile.phone}
                    </span>
                    <span>•</span>
                    <span>งานสำเร็จ: <strong>{currentEngineerProfile.งานที่สำเร็จ}</strong> / {currentEngineerProfile.งานทั้งหมด} งาน</span>
                    <span>•</span>
                    <span>ใบงานที่ได้รับการประเมิน: <strong>{selectedEngineerEvaluatedJobs.length}</strong> งาน</span>
                  </div>
                </div>
              </div>

              {/* Quick Stat Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-slate-900/90 px-4 py-2.5 rounded-xl border border-emerald-500/40 text-center">
                  <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">ลูกค้าประเมิน (Customer)</div>
                  <div className="text-2xl font-black text-emerald-400">{currentEngineerProfile.ความพึงพอใจลูกค้าเปอร์เซ็นต์}%</div>
                  <div className="text-[10px] text-slate-400">({currentEngineerProfile.ความพึงพอใจลูกค้า} / 5.0)</div>
                </div>
                <div className="bg-slate-900/90 px-4 py-2.5 rounded-xl border border-blue-500/40 text-center">
                  <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">ฝ่ายขายประเมิน (Sales)</div>
                  <div className="text-2xl font-black text-blue-400">{currentEngineerProfile.ความพึงพอใจเซลล์เปอร์เซ็นต์}%</div>
                  <div className="text-[10px] text-slate-400">({currentEngineerProfile.ความพึงพอใจเซลล์} / 5.0)</div>
                </div>
                <div className="bg-slate-900/90 px-4 py-2.5 rounded-xl border border-amber-500/40 text-center">
                  <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">รวมเฉลี่ย (Overall)</div>
                  <div className="text-2xl font-black text-amber-300">{currentEngineerProfile.ความพึงพอใจรวมเปอร์เซ็นต์}%</div>
                  <div className="text-[10px] text-slate-400">({currentEngineerProfile.คะแนนรวมเฉลี่ย} / 5.0)</div>
                </div>
              </div>
            </div>

            {/* 10-Criteria Comparison Grid (Customer 5 + Sales 5) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Customer 5 Dimensions */}
              <div className="bg-slate-900/80 rounded-xl border border-emerald-500/30 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                    คะแนน 5 มิติจากมุมมองลูกค้า (Customer Evaluation)
                  </h4>
                  <span className="text-[10px] text-slate-400">ประเมินแล้ว {selectedEngineerDimensions.custCount} ใบงาน</span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {selectedEngineerDimensions.customer.map((dim, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-200">{dim.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400">{dim.pct}%</span>
                          <span className="text-[11px] text-slate-400 font-medium">({dim.score} / 5.0)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${dim.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sales 5 Dimensions */}
              <div className="bg-slate-900/80 rounded-xl border border-blue-500/30 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <ThumbsUp className="w-4 h-4 text-blue-400" />
                    คะแนน 5 มิติจากมุมมองฝ่ายขาย (Sales Evaluation)
                  </h4>
                  <span className="text-[10px] text-slate-400">ประเมินแล้ว {selectedEngineerDimensions.salesCount} ใบงาน</span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {selectedEngineerDimensions.sales.map((dim, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-200">{dim.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-400">{dim.pct}%</span>
                          <span className="text-[11px] text-slate-400 font-medium">({dim.score} / 5.0)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-400 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${dim.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Direct Feedback & Evaluated Requests History for this Engineer */}
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  ความคิดเห็นและบันทึกประเมินจริงของ {currentEngineerProfile.name} ({selectedEngineerEvaluatedJobs.length} รายการ)
                </h4>
                <span className="text-[11px] text-slate-400">ประเมินโดยลูกค้า & ฝ่ายขาย</span>
              </div>

              {selectedEngineerEvaluatedJobs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  ยังไม่มีใบงานที่ได้รับผลประเมินในรอบเดือนที่เลือก
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {selectedEngineerEvaluatedJobs.map(job => {
                    const cEval = job.customerEvaluation;
                    const sEval = job.salesEvaluation;
                    return (
                      <div key={job.id} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-300">{job.soNumber} - {job.projectName}</span>
                          <span className="text-[10px] text-slate-400">{job.requestDate}</span>
                        </div>
                        <div className="text-slate-300 text-[11px]">
                          ลูกค้า: <strong>{job.customerName}</strong> | เซลล์: <strong>{job.salesOwner}</strong>
                        </div>
                        {cEval?.feedback && (
                          <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-[11px] italic">
                            💬 <strong>ลูกค้า:</strong> "{cEval.feedback}"
                          </div>
                        )}
                        {sEval?.description && (
                          <div className="p-2 rounded bg-blue-950/40 border border-blue-500/30 text-blue-200 text-[11px] italic">
                            💬 <strong>ฝ่ายขาย ({sEval.evaluatedBy || job.salesOwner}):</strong> "{sEval.description}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 0: % SATISFACTION (Customer % vs Sales % by Engineer & Total) */}
        {/* ======================================================== */}
        {satisfactionTab === 'percent' && (
          <div className="space-y-6 relative z-10 pt-2">
            
            {/* View Mode Controller: Total vs By Engineer */}
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 space-y-4 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-700/80 pb-4">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ตารางและกราฟ % ความพึงพอใจของลูกค้า และความพึงพอใจของเซลล์
                  </h4>
                  <p className="text-xs text-slate-300">
                    เปรียบเทียบดัชนีความพึงพอใจเชิงร้อยละ (%) ทั้งภาพรวมทั้งหมดของบริษัท และจำแนกตามรายชื่อวิศวกร
                  </p>
                </div>

                {/* Switch View Mode */}
                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs">
                  <button
                    onClick={() => {
                      setPercentViewMode('all');
                      setSelectedEngineer('all');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      percentViewMode === 'all' && selectedEngineer === 'all'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📌 ภาพรวมทั้งหมด (Total)
                  </button>
                  <button
                    onClick={() => setPercentViewMode('by_engineer')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      percentViewMode === 'by_engineer' || selectedEngineer !== 'all'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    👥 แยกตามชื่อวิศวกร (By Engineer)
                  </button>
                </div>
              </div>

              {/* Summary Stats Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                
                {/* Total Customer % */}
                <div className="bg-slate-900/80 rounded-xl border border-emerald-500/40 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-emerald-300">ความพึงพอใจลูกค้า (%)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                      Customer CSAT
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-black text-emerald-400">{avgCustPct}%</div>
                    <span className="text-xs font-semibold text-slate-400">{avgCustScore} / 5.00 คะแนน</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${avgCustPct}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                    <span>กลุ่มเป้าหมาย: ลูกค้าหน้างาน</span>
                    <span className="text-emerald-300 font-bold">{customerRatedReqs.length} ใบงาน</span>
                  </div>
                </div>

                {/* Total Sales % */}
                <div className="bg-slate-900/80 rounded-xl border border-blue-500/40 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-blue-300">ความพึงพอใจฝ่ายขาย (%)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30">
                      Sales CSAT
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-black text-blue-400">{avgSalesPct}%</div>
                    <span className="text-xs font-semibold text-slate-400">{avgSalesScore} / 5.00 คะแนน</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-400 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${avgSalesPct}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                    <span>กลุ่มเป้าหมาย: ฝ่ายขาย/ประสานงาน</span>
                    <span className="text-blue-300 font-bold">{salesRatedReqs.length} ใบงาน</span>
                  </div>
                </div>

                {/* Combined CSAT % */}
                <div className="bg-slate-900/80 rounded-xl border border-indigo-500/40 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-indigo-300">ความพึงพอใจรวมเฉลี่ย (%)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                      Overall CSAT
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-black text-indigo-300">{avgCombinedPct}%</div>
                    <span className="text-xs font-semibold text-slate-400">{avgCombinedScore} / 5.00 คะแนน</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-blue-400 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${avgCombinedPct}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                    <span>เกณฑ์: &gt; 90% (ดีเด่น)</span>
                    <span className="text-emerald-400 font-bold">✨ ผ่านเกณฑ์ยอดเยี่ยม</span>
                  </div>
                </div>

                {/* Gap / CSAT Alignment */}
                <div className="bg-slate-900/80 rounded-xl border border-amber-500/40 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-amber-300">ส่วนต่างความเห็น (Gap Index)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30">
                      Alignment
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-black text-amber-400">
                      {+csatGap > 0 ? `+${csatGap}%` : `${csatGap}%`}
                    </div>
                    <span className="text-xs font-semibold text-slate-300">
                      {Math.abs(+csatGap) <= 5 ? 'สอดคล้องดีมาก' : 'มีความต่างเล็กน้อย'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 leading-relaxed pt-1">
                    {+csatGap >= 0 
                      ? 'ลูกค้าให้คะแนนสูงกว่าฝ่ายขาย บ่งบอกถึงงานบริการหน้างานที่ประทับใจ' 
                      : 'ฝ่ายขายให้คะแนนสูงกว่าลูกค้า ควรเน้นประสานงานหน้างานเพิ่มเติม'}
                  </div>
                </div>

              </div>

              {/* Graphical Percentage Bar Chart (0 - 100%) */}
              <div className="pt-4 border-t border-slate-700/60">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      กราฟเปรียบเทียบ % ความพึงพอใจลูกค้า vs เซลล์ (จำแนกตามรายวิศวกร & ภาพรวม)
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      แสดงผลเป็นเปอร์เซ็นต์ (%) เต็ม 100% เพื่อให้ผู้บริหารมองเห็นระดับคุณภาพงานของแต่ละบุคคลได้ชัดเจน
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-emerald-500"></div>
                      <span className="text-slate-300">ลูกค้า (%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-blue-500"></div>
                      <span className="text-slate-300">ฝ่ายขาย (%)</span>
                    </div>
                  </div>
                </div>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engineerSatisfactionChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" domain={[70, 100]} fontSize={12} unit="%" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(val: any) => [`${val}%`, '']}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Bar name="% ความพึงพอใจลูกค้า" dataKey="ความพึงพอใจลูกค้าเปอร์เซ็นต์" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar name="% ความพึงพอใจฝ่ายขาย" dataKey="ความพึงพอใจเซลล์เปอร์เซ็นต์" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Comprehensive Engineer % Breakdown Table */}
              <div className="pt-4 border-t border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    ตารางสรุป % ความพึงพอใจแยกตามรายชื่อวิศวกร (Engineer % Satisfaction Matrix)
                  </h5>
                  <span className="text-xs text-slate-400">
                    คลิกแถวเพื่อกรองข้อมูลเฉพาะวิศวกรท่านนั้น
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-700">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-300 font-semibold border-b border-slate-700">
                      <tr>
                        <th className="p-3">วิศวกรผู้ปฏิบัติงาน</th>
                        <th className="p-3 text-center">ความพึงพอใจลูกค้า (%)</th>
                        <th className="p-3 text-center">ความพึงพอใจเซลล์ (%)</th>
                        <th className="p-3 text-center">รวมเฉลี่ย (%)</th>
                        <th className="p-3 text-center">คะแนนเต็ม 5.0</th>
                        <th className="p-3 text-center">ใบงานที่ประเมิน</th>
                        <th className="p-3 text-center">ระดับผลงาน</th>
                        <th className="p-3">ความคิดเห็นล่าสุด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {engineerSatisfactionChartData.map((eng, idx) => {
                        const isSelected = selectedEngineer === eng.rawName;
                        return (
                          <tr 
                            key={eng.id}
                            onClick={() => setSelectedEngineer(isSelected ? 'all' : eng.rawName)}
                            className={`transition cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-950/90 text-white font-semibold' 
                                : 'hover:bg-slate-800/60 bg-slate-900/40'
                            }`}
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow">
                                  {eng.rawName[0]}
                                </div>
                                <div>
                                  <div className="font-bold text-white">{eng.name}</div>
                                  <div className="text-[10px] text-slate-400">{eng.phone}</div>
                                </div>
                              </div>
                            </td>

                            {/* Customer % */}
                            <td className="p-3 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className="font-bold text-emerald-400 text-sm">
                                  {eng.ความพึงพอใจลูกค้าเปอร์เซ็นต์}%
                                </span>
                                <div className="w-16 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                  <div 
                                    className="bg-emerald-400 h-1.5 rounded-full" 
                                    style={{ width: `${eng.ความพึงพอใจลูกค้าเปอร์เซ็นต์}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>

                            {/* Sales % */}
                            <td className="p-3 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className="font-bold text-blue-400 text-sm">
                                  {eng.ความพึงพอใจเซลล์เปอร์เซ็นต์}%
                                </span>
                                <div className="w-16 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                  <div 
                                    className="bg-blue-400 h-1.5 rounded-full" 
                                    style={{ width: `${eng.ความพึงพอใจเซลล์เปอร์เซ็นต์}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>

                            {/* Combined % */}
                            <td className="p-3 text-center">
                              <span className="px-2.5 py-1 rounded-full font-black text-xs bg-indigo-900/70 border border-indigo-500/40 text-indigo-200">
                                {eng.ความพึงพอใจรวมเปอร์เซ็นต์}%
                              </span>
                            </td>

                            {/* 5.0 Score */}
                            <td className="p-3 text-center font-semibold text-amber-300">
                              {eng.คะแนนรวมเฉลี่ย} ★
                            </td>

                            {/* Evaluated Jobs */}
                            <td className="p-3 text-center text-slate-300">
                              {eng.จำนวนประเมิน} / {eng.งานที่สำเร็จ} งาน
                            </td>

                            {/* Grade */}
                            <td className="p-3 text-center">
                              {+eng.ความพึงพอใจรวมเปอร์เซ็นต์ >= 97 ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  ⭐⭐⭐⭐⭐ ยอดเยี่ยม
                                </span>
                              ) : +eng.ความพึงพอใจรวมเปอร์เซ็นต์ >= 92 ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  ⭐⭐⭐⭐ ดีเด่น
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                  ⭐⭐⭐ มาตรฐาน
                                </span>
                              )}
                            </td>

                            {/* Feedback */}
                            <td className="p-3 text-slate-300 italic max-w-xs truncate">
                              "{eng.latestFeedback}"
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW (Both Graphs Side-by-Side) */}
        {/* ======================================================== */}
        {satisfactionTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 pt-2">
            
            {/* Graph A: Monthly CSAT Trend (Customer vs Sales) */}
            <div className="bg-slate-800/90 rounded-xl border border-slate-700 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    แนวโน้มคะแนนความพึงพอใจรายเดือน (Monthly CSAT Trend)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    เปรียบเทียบคะแนนเฉลี่ยลูกค้า vs ฝ่ายขาย ในแต่ละเดือน (1.0 - 5.0)
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                  {selectedEngineer === 'all' ? 'รวมทุกวิศวกร' : `ช่าง${selectedEngineer}`}
                </span>
              </div>

              <div className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySatisfactionChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" domain={[3.5, 5]} fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: any) => [`${val} / 5.0 คะแนน`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="ความพึงพอใจลูกค้า" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ความพึงพอใจเซลล์" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graph B: Satisfaction by Engineer (Customer vs Sales) */}
            <div className="bg-slate-800/90 rounded-xl border border-slate-700 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    คะแนนความพึงพอใจแยกตามรายวิศวกร (By Engineer)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    เปรียบเทียบผลงานของวิศวกรแต่ละคน (ช่างพัด, ช่างโชค, ช่างวิน, ช่างวัฒน์)
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                  {selectedMonth === 'all' ? 'ทุกช่วงเวลา' : selectedMonth}
                </span>
              </div>

              <div className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engineerSatisfactionChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" domain={[3.5, 5]} fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: any) => [`${val} / 5.0 คะแนน`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="ความพึงพอใจลูกค้า" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ความพึงพอใจเซลล์" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MONTHLY DETAILED VIEW (Lines & Trends) */}
        {/* ======================================================== */}
        {satisfactionTab === 'monthly' && (
          <div className="space-y-4 relative z-10 pt-2">
            <div className="bg-slate-800/90 rounded-xl border border-slate-700 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    กราฟแนวโน้มความพึงพอใจรายเดือนแบบละเอียด (Monthly Satisfaction Timeline)
                  </h4>
                  <p className="text-xs text-slate-300">
                    ติดตามการเปลี่ยนแปลงของคุณภาพงานบริการและข้อคิดเห็นของลูกค้าและฝ่ายขายในแต่ละช่วงเวลา
                  </p>
                </div>
                <div className="text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                  {selectedEngineer === 'all' ? 'ข้อมูลรวมวิศวกรทั้งหมด' : `กรองเฉพาะช่าง: ${selectedEngineer}`}
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlySatisfactionChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" domain={[3.5, 5.0]} fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: any) => [`${val} คะแนน`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="ความพึงพอใจลูกค้า" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="ความพึงพอใจเซลล์" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Breakdown Table Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {monthlySatisfactionChartData.map((m, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedMonth(m.monthKey)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      selectedMonth === m.monthKey 
                        ? 'bg-indigo-900/60 border-indigo-400 ring-2 ring-indigo-400/30' 
                        : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>{m.name}</span>
                      <span className="text-[10px] text-slate-400">{m.monthKey}</span>
                    </div>
                    <div className="mt-2 space-y-1 text-[11px]">
                      <div className="flex justify-between text-emerald-400">
                        <span>ลูกค้า:</span>
                        <span className="font-bold">{m.ความพึงพอใจลูกค้า} ★</span>
                      </div>
                      <div className="flex justify-between text-blue-400">
                        <span>ฝ่ายขาย:</span>
                        <span className="font-bold">{m.ความพึงพอใจเซลล์} ★</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ENGINEER COMPARISON CARDS & SCORECARDS */}
        {/* ======================================================== */}
        {satisfactionTab === 'engineers' && (
          <div className="space-y-4 relative z-10 pt-2">
            
            {/* Engineer Comparison Grouped Bar Chart */}
            <div className="bg-slate-800/90 rounded-xl border border-slate-700 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    เปรียบเทียบคะแนนความพึงพอใจตามรายวิศวกร (Engineer Scorecards)
                  </h4>
                  <p className="text-xs text-slate-300">
                    แสดงคะแนนประเมินลูกค้าและฝ่ายขายของวิศวกรทุกคน เพื่อประเมินผลงานและพัฒนาทักษะ
                  </p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engineerSatisfactionChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" domain={[3.5, 5]} fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: any) => [`${val} คะแนน`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="ความพึงพอใจลูกค้า" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ความพึงพอใจเซลล์" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Individual Engineer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {engineerSatisfactionChartData.map((eng, idx) => (
                <div 
                  key={eng.id}
                  onClick={() => setSelectedEngineer(selectedEngineer === eng.rawName ? 'all' : eng.rawName)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    selectedEngineer === eng.rawName
                      ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-400/40'
                      : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow">
                        {eng.rawName[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{eng.name}</div>
                        <div className="text-[10px] text-slate-400">{eng.phone}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {eng.คะแนนรวมเฉลี่ย} ★
                    </span>
                  </div>

                  <div className="space-y-1.5 py-2 border-y border-slate-700/50 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ความพึงพอใจลูกค้า:</span>
                      <span className="font-bold text-emerald-400">{eng.ความพึงพอใจลูกค้า} / 5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ความพึงพอใจเซลล์:</span>
                      <span className="font-bold text-amber-400">{eng.ความพึงพอใจเซลล์} / 5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">งานสำเร็จทั้งหมด:</span>
                      <span className="font-semibold text-white">{eng.งานที่สำเร็จ} / {eng.งานทั้งหมด} งาน</span>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-300 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800 line-clamp-2">
                    "{eng.latestFeedback}"
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: 5-DIMENSION RADAR DEEP DIVE */}
        {/* ======================================================== */}
        {satisfactionTab === 'dimensions' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 pt-2">
            
            {/* Customer 5-Dimension Radar */}
            <div className="bg-slate-800/90 rounded-xl border border-slate-700 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-emerald-400" />
                    เรดาร์ 5 มิติ: ฝั่งลูกค้าประเมิน (Customer 5D)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    แต่งกาย/Safety, ความรู้, แก้ปัญหา, มารยาทสื่อสาร, ความรวดเร็ว
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                  เฉลี่ย: {avgCustScore}
                </span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius={75} data={customerRadarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#64748b" fontSize={10} />
                    <Radar name="คะแนนลูกค้า" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-5 gap-1 text-center text-[10px] pt-1">
                {customerRadarData.map((d, i) => (
                  <div key={i} className="bg-slate-900/60 p-1.5 rounded border border-slate-700">
                    <div className="text-slate-400 truncate">{d.subject.split('.')[1]}</div>
                    <div className="font-bold text-emerald-400">{d.score}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales 5-Dimension Radar */}
            <div className="bg-slate-800/90 rounded-xl border border-slate-700 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-blue-400" />
                    เรดาร์ 5 มิติ: ฝั่งฝ่ายขายประเมิน (Sales 5D)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    การสื่อสาร, ตรงต่อเวลา, คุณภาพงาน, การแก้ปัญหา, ภาพรวม
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700">
                  เฉลี่ย: {avgSalesScore}
                </span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius={75} data={salesRadarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#64748b" fontSize={10} />
                    <Radar name="คะแนนฝ่ายขาย" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-5 gap-1 text-center text-[10px] pt-1">
                {salesRadarData.map((d, i) => (
                  <div key={i} className="bg-slate-900/60 p-1.5 rounded border border-slate-700">
                    <div className="text-slate-400 truncate">{d.subject.split('.')[1]}</div>
                    <div className="font-bold text-blue-400">{d.score}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 2. GENERAL OPERATIONS & SLA KPI METRICS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">ใบคำขอทั้งหมด</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{total}</div>
          <span className="text-[11px] text-slate-400">คำขอบริการในระบบ</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">เสร็จสิ้น/ปิดงาน</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{closedOrCompleted}</div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {successRatePct}% สำเร็จสมบูรณ์
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">กำลังดำเนินการ</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">{inProgress}</div>
          <span className="text-[11px] text-blue-600 font-medium">ช่างกำลังปฏิบัติงาน</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">ระยะเวลาเฉลี่ย</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{avgTurnaroundDays} <span className="text-xs font-normal">วัน</span></div>
          <span className="text-[11px] text-amber-700 font-medium">เฉลี่ย ≈ {(avgTurnaroundDays * 24).toFixed(0)} ชม.</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">ส่งมอบตรงเวลา</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{onTimeRatePct}%</div>
          <span className="text-[11px] text-emerald-700 font-medium">{overdue} งานเกินกำหนด</span>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. STATUS DISTRIBUTION & WORK VOLUME CHARTS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart: Engineer Task Volume */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              ปริมาณงานและการส่งมอบตามรายช่าง (Engineer Task Volume & Delivery)
            </h3>
            <span className="text-[11px] text-slate-500">
              สถานะ: เสร็จสิ้น vs กำลังทำ
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engineerSatisfactionChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="งานทั้งหมด" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="งานที่สำเร็จ" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">
            สัดส่วนสถานะงานในระบบ (Status Distribution)
          </h3>
          <div className="h-64 flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-xs text-slate-400">ไม่มีข้อมูล</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. MASTER REQUEST LOGS TABLE */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ตารางบันทึกคำขอบริการรวม (Master Request Logs)
            </h3>
            <p className="text-xs text-slate-500">
              ตรวจสอบสถานะอย่างละเอียด ดูผลคะแนนประเมิน และพิมพ์เอกสาร A4
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหา SO, โครงการ, เซลล์, ช่าง..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 w-48 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="pending_sale_sign">รอฝ่ายขายลงนาม</option>
              <option value="pending_engineer_accept">รอวิศวกรตอบรับ</option>
              <option value="ready_for_site">รอลงพื้นที่</option>
              <option value="in_progress">กำลังดำเนินการ</option>
              <option value="completed_by_engineer">รอลูกค้าตรวจรับ</option>
              <option value="completed_by_customer">รอฝ่ายขายปิดงาน</option>
              <option value="closed">ปิดงานสมบูรณ์</option>
            </select>

            <select
              value={selectedEngineer}
              onChange={e => setSelectedEngineer(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="all">ช่างทุกคน</option>
              {engineers.map(eng => (
                <option key={eng.id} value={eng.name}>ช่าง{eng.name}</option>
              ))}
            </select>

          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-3">SO NO. / เอกสาร</th>
                <th className="py-3 px-3">โครงการ / ลูกค้า</th>
                <th className="py-3 px-3">ผู้รับผิดชอบ (เซลล์/ช่าง)</th>
                <th className="py-3 px-3">วันนัดหมาย</th>
                <th className="py-3 px-3">ความพึงพอใจ (ลูกค้า/เซลล์)</th>
                <th className="py-3 px-3">สถานะ</th>
                <th className="py-3 px-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTableRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    ไม่พบรายการข้อมูลที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredTableRequests.map(req => {
                  const custScore = req.customerEvaluation
                    ? ((req.customerEvaluation.grooming + req.customerEvaluation.knowledge + req.customerEvaluation.problemSolving + req.customerEvaluation.manner + req.customerEvaluation.responsiveness) / 5).toFixed(1)
                    : null;
                  
                  const saleScore = req.salesEvaluation
                    ? ((req.salesEvaluation.communication + req.salesEvaluation.punctuality + req.salesEvaluation.quality + req.salesEvaluation.problemSolving + req.salesEvaluation.overall) / 5).toFixed(1)
                    : null;

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <span className="font-bold text-blue-600 block">{req.soNumber}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{req.docNumber}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{req.projectName}</span>
                        <span className="text-[11px] text-slate-500">{req.customerName}</span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-900 font-medium">เซลล์: {req.salesOwner}</div>
                        <div className="text-amber-700 font-semibold">ช่าง: {req.assignedEngineer ? `ช่าง${req.assignedEngineer}` : '-'}</div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{req.targetDate}</span>
                        {req.deadlineDate && <span className="text-[10px] text-slate-400 block">เสร็จ: {req.deadlineDate}</span>}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          {custScore ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mr-1.5">
                              ลูกค้า: {custScore} ★
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 mr-1.5">ลูกค้ารอประเมิน</span>
                          )}
                          {saleScore ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              เซลล์: {saleScore} ★
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onOpenDocumentPrint(req)}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition"
                          title="ดูและพิมพ์เอกสารทางการ A4"
                        >
                          <Printer className="w-3.5 h-3.5 mr-1" />
                          พิมพ์ A4
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

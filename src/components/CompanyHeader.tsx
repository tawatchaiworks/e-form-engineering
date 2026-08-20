import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, ShieldCheck, Clock, MapPin, Zap, LogIn, LogOut, Cloud, HelpCircle, 
  ChevronLeft, ChevronRight, SlidersHorizontal, Mail, Copy, Check, UserCircle, CheckCircle2 
} from 'lucide-react';
import { Role } from '../types';
import { User } from 'firebase/auth';

interface CompanyHeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  pendingSalesCount: number;
  pendingEngineerCount: number;
  pendingCustomerCount: number;
  readyForSiteCount: number;
  overdueCount: number;
  onOpenCalendar: () => void;
  onOpenStatus: () => void;
  onOpenLocation: () => void;
  currentUser: User | null;
  isFirebaseSyncing: boolean;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
}

export const CompanyHeader: React.FC<CompanyHeaderProps> = ({
  currentRole,
  onRoleChange,
  pendingSalesCount,
  pendingEngineerCount,
  pendingCustomerCount,
  readyForSiteCount,
  overdueCount,
  onOpenCalendar,
  onOpenStatus,
  onOpenLocation,
  currentUser,
  isFirebaseSyncing,
  onSignInGoogle,
  onSignOutGoogle,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Mouse drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Check scroll capability and progress
  const updateScrollState = () => {
    const el = navContainerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < maxScroll - 4);
    
    if (maxScroll > 0) {
      setScrollProgress((scrollLeft / maxScroll) * 100);
    } else {
      setScrollProgress(0);
    }
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, []);

  // Smoothly scroll active tab into view whenever role changes
  useEffect(() => {
    const el = navContainerRef.current;
    if (!el) return;

    const activeBtn = el.querySelector(`[data-role="${currentRole}"]`) as HTMLElement;
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }

    setTimeout(updateScrollState, 300);
  }, [currentRole]);

  // Slide left / right handlers
  const handleSlideLeft = () => {
    if (navContainerRef.current) {
      navContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleSlideRight = () => {
    if (navContainerRef.current) {
      navContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!navContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - navContainerRef.current.offsetLeft);
    setScrollLeftState(navContainerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !navContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - navContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    navContainerRef.current.scrollLeft = scrollLeftState - walk;
    updateScrollState();
  };

  // Handle clicking directly on the slide bar track to jump/slide
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = navContainerRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({
      left: clickRatio * maxScroll,
      behavior: 'smooth',
    });
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md print:hidden">
      {/* Top Banner with Official Company Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Company Brand & Address */}
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Zap className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  LUMENCRAFT
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                    E-Request System
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-medium">
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  Firebase Connected
                </span>
              </div>
              <div className="flex items-center text-xs text-slate-300 mt-0.5">
                <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400 shrink-0" />
                <span>
                  ระบบ E-Request LUMENCRAFT ที่อยู่ 125 อาคารอินฟินิท พัฒนาการ 13 แขวงสวนหลวง เขตสวนหลวง กทม. 10250
                </span>
              </div>
            </div>
          </div>

          {/* Quick Real-Time Action Triggers & Google Auth */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-quick-calendar"
              onClick={onOpenCalendar}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm hover:border-slate-600"
              title="เปิดปฏิทินงานวิศวกร Real-Time"
            >
              <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              ปฏิทิน Engineer
            </button>

            <button
              id="btn-quick-status"
              onClick={onOpenStatus}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm hover:border-slate-600"
              title="เปิดสถานะวิศวกร 4 ท่าน (Check-in/Check-out/เวลา/ว่าง/รองาน/กำลังทำงาน)"
            >
              <span className="flex h-2 w-2 relative mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              สถานะรายวัน & Check-in
            </button>

            <button
              id="btn-quick-location"
              onClick={onOpenLocation}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm hover:border-slate-600"
              title="เปิดพิกัด GPS หน้างานของ Engineer"
            >
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
              พิกัดหน้างาน (GPS)
            </button>

            {/* Google Authentication Section */}
            <div className="relative">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <button
                    id="btn-user-profile"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-xs font-medium transition shadow-md group cursor-pointer"
                    title={`เข้าสู่ระบบด้วย Gmail: ${currentUser.email || ''}`}
                  >
                    <div className="relative shrink-0">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="User Avatar"
                          className="w-7 h-7 rounded-full border border-amber-400/60 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center shadow-xs">
                          {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : (currentUser.email ? currentUser.email[0].toUpperCase() : 'G')}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 ring-1 ring-emerald-500"></span>
                    </div>

                    <div className="text-left leading-tight">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-white max-w-[110px] sm:max-w-[140px] truncate">
                          {currentUser.displayName || 'Google User'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          Gmail
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-300 font-mono font-semibold flex items-center gap-1">
                        <Mail className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="max-w-[140px] sm:max-w-[200px] truncate">
                          {currentUser.email}
                        </span>
                      </div>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-12 w-80 bg-slate-850 rounded-2xl shadow-2xl border border-slate-700 p-4 z-50 animate-fadeIn backdrop-blur-md bg-slate-900/95 text-white">
                      
                      {/* User Account Details */}
                      <div className="flex items-start gap-3 pb-3 border-b border-slate-700">
                        {currentUser.photoURL ? (
                          <img
                            src={currentUser.photoURL}
                            alt="User Avatar"
                            className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold text-lg flex items-center justify-center shrink-0">
                            {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : (currentUser.email ? currentUser.email[0].toUpperCase() : 'G')}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">
                            {currentUser.displayName || 'Google Account'}
                          </div>
                          
                          {/* Prominent Gmail Display with Copy Action */}
                          <div className="mt-1 flex items-center justify-between gap-1 p-1.5 rounded-lg bg-slate-800/90 border border-slate-700">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="text-xs font-mono font-bold text-amber-300 truncate">
                                {currentUser.email}
                              </span>
                            </div>
                            {currentUser.email && (
                              <button
                                type="button"
                                onClick={() => handleCopyEmail(currentUser.email!)}
                                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0 cursor-pointer"
                                title="คัดลอกอีเมล"
                              >
                                {copiedEmail ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>

                          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>ยืนยันตัวตนด้วยบัญชี Gmail สำเร็จ</span>
                          </div>
                        </div>
                      </div>

                      {/* Account Meta & Security Info */}
                      <div className="py-2.5 space-y-1.5 text-xs text-slate-300 border-b border-slate-700/80">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">สถานะเชื่อมต่อ:</span>
                          <span className="text-emerald-400 font-medium">Firebase Auth (Google GSI)</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">สิทธิ์การใช้งาน:</span>
                          <span className="font-bold text-amber-300">LUMENCRAFT Staff / Engineer</span>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1">
                          📌 ข้อมูลการออกใบคำขอและตอบกลับจะบันทึกอีเมลของคุณเป็นหลักฐานโดยอัตโนมัติ
                        </div>
                      </div>

                      {/* Sign Out Action */}
                      <div className="pt-3 flex gap-2">
                        <button
                          id="btn-sign-out"
                          onClick={() => {
                            setShowUserMenu(false);
                            onSignOutGoogle();
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-200 border border-rose-500/40 text-xs font-bold transition cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          ออกจากระบบ (Sign Out)
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="btn-google-login"
                  onClick={onSignInGoogle}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md transition cursor-pointer"
                  title="เข้าสู่ระบบด้วย Google Account (Gmail)"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-950" />
                  <span>เข้าสู่ระบบด้วย Gmail</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Navigation Tabs with Slide Bar Controls */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 backdrop-blur relative select-none">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 relative">
          
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Left Slide Arrow Button */}
            <button
              id="btn-slide-left"
              onClick={handleSlideLeft}
              disabled={!canScrollLeft}
              className={`hidden sm:flex items-center justify-center w-8 h-9 rounded-lg bg-slate-900/90 border border-slate-700/80 text-amber-400 hover:text-white hover:bg-slate-800 hover:border-amber-500/50 shadow-md transition shrink-0 z-10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-900/90 disabled:hover:border-slate-700/80`}
              title="เลื่อนแท็บไปทางซ้าย"
              aria-label="Slide Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Scrollable / Draggable Tabs Container */}
            <div className="flex-1 overflow-hidden relative">
              <nav
                ref={navContainerRef}
                onScroll={updateScrollState}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeaveOrUp}
                onMouseUp={handleMouseLeaveOrUp}
                onMouseMove={handleMouseMove}
                className={`flex space-x-1.5 sm:space-x-2 overflow-x-auto py-2.5 slidebar-smooth slidebar-visible cursor-grab ${
                  isDragging ? 'cursor-grabbing select-none' : ''
                }`}
                aria-label="Tabs"
              >
                
                {/* Admin Sale Tab */}
                <button
                  id="nav-tab-admin-sale"
                  data-role="admin_sale"
                  onClick={() => onRoleChange('admin_sale')}
                  className={`flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                    currentRole === 'admin_sale'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md ring-2 ring-amber-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                  }`}
                >
                  <Building2 className="w-4 h-4 mr-1.5" />
                  1. Admin Sale (ออกใบคำขอ)
                  <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-amber-300 border border-amber-500/40 inline-flex items-center gap-0.5">
                    🔒 Security
                  </span>
                </button>

                {/* Sales Hub Tab */}
                <button
                  id="nav-tab-sale"
                  data-role="sale"
                  onClick={() => onRoleChange('sale')}
                  className={`flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition relative cursor-pointer shrink-0 ${
                    currentRole === 'sale'
                      ? 'bg-blue-600 text-white font-bold shadow-md ring-2 ring-blue-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  2. ฝ่ายขาย (Sales Hub)
                  <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-blue-300 border border-blue-500/40 inline-flex items-center gap-0.5">
                    🔒 Security
                  </span>
                  {(pendingSalesCount > 0 || overdueCount > 0) && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white animate-pulse">
                      {pendingSalesCount + overdueCount}
                    </span>
                  )}
                </button>

                {/* Engineer Hub Tab */}
                <button
                  id="nav-tab-engineer"
                  data-role="engineer"
                  onClick={() => onRoleChange('engineer')}
                  className={`flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition relative cursor-pointer shrink-0 ${
                    currentRole === 'engineer'
                      ? 'bg-amber-600 text-white font-bold shadow-md ring-2 ring-amber-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                  }`}
                >
                  <Clock className="w-4 h-4 mr-1.5" />
                  3. วิศวกร (Engineer Hub)
                  {pendingEngineerCount > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white animate-bounce">
                      {pendingEngineerCount} ใหม่
                    </span>
                  )}
                </button>

                {/* Customer Portal Tab */}
                <button
                  id="nav-tab-customer"
                  data-role="customer"
                  onClick={() => onRoleChange('customer')}
                  className={`flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition relative cursor-pointer shrink-0 ${
                    currentRole === 'customer'
                      ? 'bg-purple-600 text-white font-bold shadow-md ring-2 ring-purple-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                  }`}
                >
                  <span className="text-amber-300 mr-1.5">★</span>
                  4. ประเมินลูกค้า (Customer Portal)
                  {pendingCustomerCount > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500 text-white">
                      {pendingCustomerCount}
                    </span>
                  )}
                </button>

                {/* Executive KPI Dashboard */}
                <button
                  id="nav-tab-dashboard"
                  data-role="dashboard"
                  onClick={() => onRoleChange('dashboard')}
                  className={`flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                    currentRole === 'dashboard'
                      ? 'bg-emerald-600 text-white font-bold shadow-md ring-2 ring-emerald-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                  }`}
                >
                  <span className="mr-1.5">📊</span>
                  5. แดชบอร์ดผู้บริหาร (KPI)
                  <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-amber-300 border border-amber-500/40 inline-flex items-center gap-0.5">
                    🔒 Security
                  </span>
                </button>

                {/* Staff Management */}
                <button
                  id="nav-tab-staff"
                  data-role="staff"
                  onClick={() => onRoleChange('staff')}
                  className={`flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                    currentRole === 'staff'
                      ? 'bg-indigo-600 text-white font-bold shadow-md ring-2 ring-indigo-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                  }`}
                >
                  <span className="mr-1.5">👥</span>
                  6. จัดการบุคลากร (Staff)
                </button>

                {/* Master Request Logs & A4 */}
                <button
                  id="nav-tab-logs"
                  data-role="logs"
                  onClick={() => onRoleChange('logs')}
                  className={`flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                    currentRole === 'logs'
                      ? 'bg-slate-700 text-white font-bold shadow-md ring-2 ring-slate-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                  }`}
                >
                  <span className="mr-1.5">📑</span>
                  7. รายการทั้งหมด & พิมพ์ A4
                </button>

                {/* 8. FAQ Knowledge Base (ถามตอบและข้อมูลปัญหาด้านเทคนิค) */}
                <button
                  id="nav-tab-faq"
                  data-role="faq"
                  onClick={() => onRoleChange('faq')}
                  className={`flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                    currentRole === 'faq'
                      ? 'bg-amber-600 text-white font-bold shadow-md ring-2 ring-amber-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 mr-1.5 text-amber-400" />
                  8. FAQ Knowledge (ถามตอบ & ปัญหาเทคนิค)
                </button>

              </nav>
            </div>

            {/* Right Slide Arrow Button */}
            <button
              id="btn-slide-right"
              onClick={handleSlideRight}
              disabled={!canScrollRight}
              className={`hidden sm:flex items-center justify-center w-8 h-9 rounded-lg bg-slate-900/90 border border-slate-700/80 text-amber-400 hover:text-white hover:bg-slate-800 hover:border-amber-500/50 shadow-md transition shrink-0 z-10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-900/90 disabled:hover:border-slate-700/80`}
              title="เลื่อนแท็บไปทางขวา"
              aria-label="Slide Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

          </div>

          {/* Interactive Slide Bar Track & Indicator (บาร์สไลด์แถบหัวข้อ) */}
          <div className="pt-0.5 pb-2 px-2 flex items-center justify-between gap-3 text-[11px] text-slate-400">
            
            <div className="flex items-center gap-1.5 text-amber-400/90 font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">บาร์สไลด์แถบหัวข้อ (Slide Bar):</span>
              <span className="sm:hidden">สไลด์หัวข้อ:</span>
            </div>

            {/* Slider Track (Clickable & Responsive) */}
            <div 
              onClick={handleTrackClick}
              className="flex-1 max-w-xl h-2 bg-slate-800/90 hover:bg-slate-800 rounded-full relative cursor-pointer overflow-hidden border border-slate-700/60 shadow-inner group transition"
              title="คลิกหรือเลื่อนบาร์สไลด์เพื่อเปลี่ยนมุมมองหัวข้อ"
            >
              {/* Slider Track Background Pulse */}
              <div className="absolute inset-0 bg-slate-800"></div>

              {/* Slider Thumb / Glowing Active Bar */}
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 rounded-full transition-all duration-150 ease-out shadow-xs shadow-amber-500/50 group-hover:from-amber-400 group-hover:to-amber-300"
                style={{
                  width: '35%',
                  marginLeft: `${scrollProgress * 0.65}%`,
                }}
              />
            </div>

            {/* Mobile quick slide touch buttons */}
            <div className="flex sm:hidden items-center gap-1">
              <button
                onClick={handleSlideLeft}
                disabled={!canScrollLeft}
                className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleSlideRight}
                disabled={!canScrollRight}
                className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[10px] text-slate-400 font-mono hidden md:block">
              8 หัวข้อหลัก (Admin / Sales / Engineer / Portal / KPI / Staff / Logs / FAQ)
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};


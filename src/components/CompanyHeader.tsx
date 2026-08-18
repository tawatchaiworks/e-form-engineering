import React, { useState } from 'react';
import { Building2, ShieldCheck, Clock, MapPin, Zap, LogIn, LogOut, Cloud, CloudCheck, User as UserIcon, HelpCircle } from 'lucide-react';
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
                    className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium transition"
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="User Avatar"
                        className="w-5 h-5 rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                        {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                      </div>
                    )}
                    <span className="max-w-[120px] truncate text-slate-200">
                      {currentUser.displayName || currentUser.email}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-10 w-64 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-3 z-50 animate-fadeIn">
                      <div className="pb-2 border-b border-slate-700">
                        <div className="text-xs font-bold text-white truncate">
                          {currentUser.displayName || 'ผู้ใช้งาน'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {currentUser.email}
                        </div>
                        <div className="mt-1 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          เข้าสู่ระบบด้วย Google เรียบร้อย
                        </div>
                      </div>
                      <button
                        id="btn-sign-out"
                        onClick={() => {
                          setShowUserMenu(false);
                          onSignOutGoogle();
                        }}
                        className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-medium transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        ออกจากระบบ (Sign Out)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="btn-google-login"
                  onClick={onSignInGoogle}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition"
                  title="เข้าสู่ระบบด้วย Google Account (Gmail)"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-950" />
                  เข้าสู่ระบบด้วย Gmail
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
            
            {/* Admin Sale Tab */}
            <button
              id="nav-tab-admin-sale"
              onClick={() => onRoleChange('admin_sale')}
              className={`flex items-center px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                currentRole === 'admin_sale'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
              onClick={() => onRoleChange('sale')}
              className={`flex items-center px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition relative ${
                currentRole === 'sale'
                  ? 'bg-blue-600 text-white font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
              onClick={() => onRoleChange('engineer')}
              className={`flex items-center px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition relative ${
                currentRole === 'engineer'
                  ? 'bg-amber-600 text-white font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
              onClick={() => onRoleChange('customer')}
              className={`flex items-center px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition relative ${
                currentRole === 'customer'
                  ? 'bg-purple-600 text-white font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
              onClick={() => onRoleChange('dashboard')}
              className={`flex items-center px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                currentRole === 'dashboard'
                  ? 'bg-emerald-600 text-white font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
              onClick={() => onRoleChange('staff')}
              className={`flex items-center px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                currentRole === 'staff'
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="mr-1.5">👥</span>
              6. จัดการบุคลากร (Staff)
            </button>

            {/* Master Request Logs & A4 */}
            <button
              id="nav-tab-logs"
              onClick={() => onRoleChange('logs')}
              className={`flex items-center px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                currentRole === 'logs'
                  ? 'bg-slate-700 text-white font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="mr-1.5">📑</span>
              7. รายการทั้งหมด & พิมพ์ A4
            </button>

            {/* 8. FAQ Knowledge Base (ถามตอบและข้อมูลปัญหาด้านเทคนิค) */}
            <button
              id="nav-tab-faq"
              onClick={() => onRoleChange('faq')}
              className={`flex items-center px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                currentRole === 'faq'
                  ? 'bg-amber-600 text-white font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4 mr-1.5 text-amber-400" />
              8. FAQ Knowledge (ถามตอบ & ปัญหาเทคนิค)
            </button>

          </nav>
        </div>
      </div>
    </header>
  );
};


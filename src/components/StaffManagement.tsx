import React, { useState } from 'react';
import { 
  Users, UserPlus, Shield, Wrench, Briefcase, Award, 
  Trash2, Edit3, Check, X, Phone, Mail, Circle,
  Building2, Search, LayoutGrid, List, CheckCircle2,
  MapPin, Sparkles, Filter, Info, Save
} from 'lucide-react';
import { StaffMember, StaffTeam, StaffWorkStatus } from '../types';

interface StaffManagementProps {
  staff: StaffMember[];
  onAddStaff: (newStaff: StaffMember) => void;
  onUpdateStaff: (updatedStaff: StaffMember) => void;
  onDeleteStaff: (id: string) => void;
}

const DEPARTMENT_PRESETS = [
  'แผนกธุรการและประสานงานขาย (Admin Sales)',
  'แผนกวิศวกรรมและบริการเทคนิค (Engineering)',
  'แผนกงานขายโครงการ (Sales Department)',
  'แผนกบริหารการขาย (Sales Management)',
  'แผนกสนับสนุนงานติดตั้งและบริการหน้างาน (Site Support)',
];

export const StaffManagement: React.FC<StaffManagementProps> = ({
  staff,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Add Modal State
  const [isAddingModal, setIsAddingModal] = useState(false);
  
  // Edit Modal State
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Success Notification
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Add Form State
  const [addName, setAddName] = useState('');
  const [addTeam, setAddTeam] = useState<StaffTeam>('SALE');
  const [addRole, setAddRole] = useState('เจ้าหน้าที่งานขาย (Sales Executive)');
  const [addDepartment, setAddDepartment] = useState('แผนกงานขายโครงการ (Sales Department)');
  const [addPhone, setAddPhone] = useState('08X-XXX-XXXX');
  const [addEmail, setAddEmail] = useState('');
  const [addWorkStatus, setAddWorkStatus] = useState<StaffWorkStatus>('active');
  const [addCurrentTask, setAddCurrentTask] = useState('');

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editTeam, setEditTeam] = useState<StaffTeam>('SALE');
  const [editRole, setEditRole] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWorkStatus, setEditWorkStatus] = useState<StaffWorkStatus>('active');
  const [editCurrentTask, setEditCurrentTask] = useState('');

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  // Filtered staff list
  const filteredStaff = staff.filter(s => {
    const matchTeam = selectedTeam === 'all' || s.team === selectedTeam;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchTeam;

    const matchQuery = 
      s.name.toLowerCase().includes(query) ||
      (s.role && s.role.toLowerCase().includes(query)) ||
      (s.department && s.department.toLowerCase().includes(query)) ||
      s.phone.toLowerCase().includes(query) ||
      (s.email && s.email.toLowerCase().includes(query)) ||
      s.team.toLowerCase().includes(query);

    return matchTeam && matchQuery;
  });

  // Open Edit Modal
  const handleOpenEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setEditName(member.name || '');
    setEditTeam(member.team || 'SALE');
    setEditRole(member.role || (member.team === 'Engineer' ? 'วิศวกรบริการเทคนิค' : member.team === 'Admin Sale' ? 'เจ้าหน้าที่ธุรการขาย' : 'เจ้าหน้าที่ฝ่ายขาย'));
    setEditDepartment(member.department || (member.team === 'Engineer' ? 'แผนกวิศวกรรมและบริการเทคนิค (Engineering)' : member.team === 'Admin Sale' ? 'แผนกธุรการและประสานงานขาย (Admin Sales)' : member.team === 'SALE MANAGER' ? 'แผนกบริหารการขาย (Sales Management)' : 'แผนกงานขายโครงการ (Sales Department)'));
    setEditPhone(member.phone || '');
    setEditEmail(member.email || '');
    setEditWorkStatus(member.workStatus || 'active');
    setEditCurrentTask(member.currentTask || '');
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    if (!editName.trim()) {
      alert('กรุณากรอกชื่อบุคลากร');
      return;
    }

    const updated: StaffMember = {
      ...editingStaff,
      name: editName.trim(),
      team: editTeam,
      role: editRole.trim() || editTeam,
      department: editDepartment.trim() || `${editTeam} Department`,
      phone: editPhone.trim(),
      email: editEmail.trim(),
      workStatus: editWorkStatus,
      currentTask: editCurrentTask.trim() || undefined,
    };

    onUpdateStaff(updated);
    setEditingStaff(null);
    showToast(`บันทึกการแก้ไขข้อมูล "${updated.name}" สำเร็จเรียบร้อย`);
  };

  // Save New Staff
  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      alert('กรุณากรอกชื่อบุคลากร');
      return;
    }

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: addName.trim(),
      team: addTeam,
      role: addRole.trim() || (addTeam === 'Engineer' ? 'วิศวกรบริการเทคนิค' : 'เจ้าหน้าที่ฝ่ายขาย'),
      department: addDepartment.trim() || (addTeam === 'Engineer' ? 'แผนกวิศวกรรมและบริการเทคนิค (Engineering)' : 'แผนกงานขายโครงการ (Sales Department)'),
      phone: addPhone.trim(),
      email: addEmail.trim() || `${addName.trim().toLowerCase().replace(/\s+/g, '')}@lumencraft.co.th`,
      workStatus: addWorkStatus,
      currentTask: addCurrentTask.trim() || undefined,
    };

    onAddStaff(newStaff);
    setAddName('');
    setAddPhone('08X-XXX-XXXX');
    setAddEmail('');
    setAddCurrentTask('');
    setIsAddingModal(false);
    showToast(`เพิ่มบุคลากรใหม่ "${newStaff.name}" สำเร็จเรียบร้อย`);
  };

  // Quick Status Update
  const handleUpdateStatus = (member: StaffMember, newStatus: StaffWorkStatus) => {
    const updated = {
      ...member,
      workStatus: newStatus,
    };
    onUpdateStaff(updated);
    showToast(`อัปเดตสถานะของ "${member.name}" เป็น "${getStatusLabel(newStatus)}"`);
  };

  const getTeamBadge = (t: string) => {
    switch (t) {
      case 'Admin Sale':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Admin Sale</span>;
      case 'Engineer':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">Engineer</span>;
      case 'SALE':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">SALE</span>;
      case 'SALE MANAGER':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">SALE MANAGER</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">{t}</span>;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'available':
      case 'active':
        return 'ว่าง / พร้อมงาน (เขียว)';
      case 'busy':
        return 'ติดงานหน้างาน (แดง)';
      case 'waiting':
        return 'รองาน / เตรียมตัว (เหลือง)';
      case 'leave':
        return 'ลาปฏิบัติงาน';
      case 'offline':
      default:
        return 'ออฟไลน์';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'available':
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            ว่าง / พร้อมงาน
          </span>
        );
      case 'busy':
        return (
          <span className="inline-flex items-center gap-1.5 text-rose-700 font-bold text-xs bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            ติดงานหน้างาน
          </span>
        );
      case 'waiting':
        return (
          <span className="inline-flex items-center gap-1.5 text-amber-800 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            รองาน
          </span>
        );
      case 'leave':
        return (
          <span className="inline-flex items-center gap-1.5 text-slate-600 font-bold text-xs bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            ลา
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-slate-500 font-bold text-xs bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            ออฟไลน์
          </span>
        );
    }
  };

  // Stats Counters
  const totalStaffCount = staff.length;
  const adminCount = staff.filter(s => s.team === 'Admin Sale').length;
  const engCount = staff.filter(s => s.team === 'Engineer').length;
  const saleCount = staff.filter(s => s.team === 'SALE').length;
  const mgrCount = staff.filter(s => s.team === 'SALE MANAGER').length;
  const activeCount = staff.filter(s => s.workStatus === 'available' || s.workStatus === 'active').length;
  const busyCount = staff.filter(s => s.workStatus === 'busy').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 animate-fadeIn text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Banner & Action */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] shadow-xs">
              Staff & Team Directory
            </span>
            <span className="text-xs text-slate-300">
              ระบบจัดการรายชื่อบุคลากร แสดงตำแหน่ง และแผนกชัดเจน (แก้ไขได้ทุกรายการ)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-400" />
            จัดการรายชื่อบุคลากร (Staff & Organization Management)
          </h2>
          <p className="text-xs text-slate-400">
            แสดงชื่อ, ตำแหน่งหน้าที่ (Role / Position), แผนกสังกัด (Department) พร้อมปุ่มแก้ไขข้อมูลและจัดการสถานะ Real-time
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="btn-add-staff"
            onClick={() => setIsAddingModal(true)}
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            เพิ่มบุคลากรใหม่
          </button>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
            <span>บุคลากรทั้งหมด</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">{totalStaffCount} <span className="text-xs font-normal text-slate-500">คน</span></div>
        </div>

        <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200/80 shadow-2xs">
          <div className="text-[11px] text-blue-800 font-semibold flex items-center justify-between">
            <span>Admin Sale</span>
            <Shield className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-blue-900 mt-1">{adminCount} <span className="text-xs font-normal text-blue-600">คน</span></div>
        </div>

        <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/80 shadow-2xs">
          <div className="text-[11px] text-amber-900 font-semibold flex items-center justify-between">
            <span>Engineer (วิศวกร)</span>
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-950 mt-1">{engCount} <span className="text-xs font-normal text-amber-700">คน</span></div>
        </div>

        <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80 shadow-2xs">
          <div className="text-[11px] text-emerald-800 font-semibold flex items-center justify-between">
            <span>SALE (ฝ่ายขาย)</span>
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-950 mt-1">{saleCount} <span className="text-xs font-normal text-emerald-700">คน</span></div>
        </div>

        <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-200/80 shadow-2xs">
          <div className="text-[11px] text-purple-800 font-semibold flex items-center justify-between">
            <span>SALE MANAGER</span>
            <Award className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-purple-950 mt-1">{mgrCount} <span className="text-xs font-normal text-purple-700">คน</span></div>
        </div>

        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-2xs">
          <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
            <span>สถานะพร้อมปฏิบัติงาน</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{activeCount} <span className="text-xs font-normal text-slate-400">/ {totalStaffCount} คน</span></div>
        </div>
      </div>

      {/* Search & Filtering & View Modes Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, ตำแหน่ง, แผนก, เบอร์โทร..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* View Mode Toggle & Filter info */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              มุมมองการ์ด (Grid)
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              มุมมองตาราง (Table)
            </button>
          </div>
        </div>

      </div>

      {/* Team Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'บุคลากรทั้งหมด', count: staff.length },
          { id: 'Admin Sale', label: 'Admin Sale', count: adminCount },
          { id: 'Engineer', label: 'Engineer (วิศวกร)', count: engCount },
          { id: 'SALE', label: 'SALE (ฝ่ายขาย)', count: saleCount },
          { id: 'SALE MANAGER', label: 'SALE MANAGER', count: mgrCount },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTeam(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              selectedTeam === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedTeam === tab.id ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Staff Display Content */}
      {filteredStaff.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">ไม่พบรายชื่อบุคลากรที่ค้นหา</h3>
          <p className="text-xs text-slate-500">ลองเปลี่ยนคำค้นหา หรือเลือกสังกัดทีมอื่น</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedTeam('all'); }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStaff.map(member => {
            const roleText = member.role || (member.team === 'Engineer' ? 'วิศวกรบริการเทคนิค' : member.team === 'Admin Sale' ? 'เจ้าหน้าที่ธุรการขาย' : 'เจ้าหน้าที่ฝ่ายขาย');
            const deptText = member.department || (member.team === 'Engineer' ? 'แผนกวิศวกรรมและบริการเทคนิค (Engineering)' : member.team === 'Admin Sale' ? 'แผนกธุรการและประสานงานขาย (Admin Sales)' : member.team === 'SALE MANAGER' ? 'แผนกบริหารการขาย (Sales Management)' : 'แผนกงานขายโครงการ (Sales Department)');

            return (
              <div 
                key={member.id} 
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-3 relative group"
              >
                
                {/* Card Top: Avatar, Name, and Team Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm shadow-sm">
                        {member.name.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                          {member.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {member.id}</span>
                      </div>
                    </div>
                    {getTeamBadge(member.team)}
                  </div>

                  {/* Position (ตำแหน่ง) Display */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5 mb-3">
                    <div className="text-[11px] font-bold text-slate-800 flex items-start gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-500 font-normal block">ตำแหน่ง (Position / Role):</span>
                        <span className="text-slate-900 font-bold leading-tight">{roleText}</span>
                      </div>
                    </div>

                    {/* Department (แผนก) Display */}
                    <div className="text-[11px] text-slate-700 flex items-start gap-1.5 pt-1.5 border-t border-slate-200/60">
                      <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-500 font-normal block">แผนก (Department):</span>
                        <span className="font-semibold text-slate-800 leading-tight">{deptText}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs text-slate-600 px-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{member.phone || '02-XXX-XXXX'}</span>
                    </div>
                    {member.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px] text-slate-500 truncate">{member.email}</span>
                      </div>
                    )}
                    {member.currentTask && (
                      <div className="flex items-start gap-2 text-[11px] text-slate-600 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{member.currentTask}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Status & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>{getStatusIcon(member.workStatus)}</div>
                    
                    {/* Quick status dropdown */}
                    <select
                      value={member.workStatus || 'active'}
                      onChange={e => handleUpdateStatus(member, e.target.value as any)}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 focus:ring-1 focus:ring-amber-500 cursor-pointer"
                      title="เปลี่ยนสถานะความพร้อม"
                    >
                      <option value="available">ว่าง / พร้อมงาน</option>
                      <option value="busy">ติดงานหน้างาน</option>
                      <option value="waiting">รองาน</option>
                      <option value="leave">ลา</option>
                      <option value="offline">ออฟไลน์</option>
                    </select>
                  </div>

                  {/* Action Buttons: Edit & Delete */}
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition cursor-pointer"
                      title="แก้ไขข้อมูลบุคลากร (ชื่อ, ตำแหน่ง, แผนก, ฯลฯ)"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      <span>แก้ไขข้อมูล (Edit)</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`คุณต้องการลบรายชื่อ "${member.name}" ออกจากระบบใช่หรือไม่?`)) {
                          onDeleteStaff(member.id);
                          showToast(`ลบรายชื่อ "${member.name}" สำเร็จ`);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                      title="ลบบุคลากร"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">ชื่อบุคลากร (Name)</th>
                  <th className="py-3 px-4">ตำแหน่ง (Position / Role)</th>
                  <th className="py-3 px-4">แผนก (Department)</th>
                  <th className="py-3 px-3">สังกัดทีม</th>
                  <th className="py-3 px-3">เบอร์โทรศัพท์</th>
                  <th className="py-3 px-3">สถานะความพร้อม</th>
                  <th className="py-3 px-4 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map(member => {
                  const roleText = member.role || (member.team === 'Engineer' ? 'วิศวกรบริการเทคนิค' : member.team === 'Admin Sale' ? 'เจ้าหน้าที่ธุรการขาย' : 'เจ้าหน้าที่ฝ่ายขาย');
                  const deptText = member.department || (member.team === 'Engineer' ? 'แผนกวิศวกรรมและบริการเทคนิค (Engineering)' : member.team === 'Admin Sale' ? 'แผนกธุรการและประสานงานขาย (Admin Sales)' : member.team === 'SALE MANAGER' ? 'แผนกบริหารการขาย (Sales Management)' : 'แผนกงานขายโครงการ (Sales Department)');

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-950">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs">
                            {member.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{member.name}</div>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {member.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                          <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{roleText}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{deptText}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {getTeamBadge(member.team)}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-700">
                        {member.phone || '02-XXX-XXXX'}
                      </td>

                      <td className="py-3 px-3">
                        {getStatusIcon(member.workStatus)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(member)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition flex items-center gap-1 cursor-pointer"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit3 className="w-3 h-3 text-amber-700" />
                            แก้ไข
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`คุณต้องการลบรายชื่อ "${member.name}" ใช่หรือไม่?`)) {
                                onDeleteStaff(member.id);
                                showToast(`ลบรายชื่อ "${member.name}" สำเร็จ`);
                              }
                            }}
                            className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= EDIT STAFF MODAL ================= */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 my-8">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-900">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">แก้ไขข้อมูลบุคลากร</h3>
                  <p className="text-xs text-slate-500">ปรับปรุงชื่อ, ตำแหน่งหน้าที่, แผนก และข้อมูลติดต่อ</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              
              {/* Name */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  ชื่อ-นามสกุล หรือชื่อเรียก <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น พี่ก้อย, คุณกุ้ง, ช่างพัด"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              {/* Position (ตำแหน่ง) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>ตำแหน่งหน้าที่ (Role / Position) <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น วิศวกรควบคุมระบบแสงสว่าง, เจ้าหน้าที่บริหารงานขายโครงการ"
                  value={editRole}
                  onChange={e => setEditRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              {/* Department (แผนก) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>แผนกสังกัด (Department) <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น แผนกงานขายโครงการ, แผนกวิศวกรรมและบริการเทคนิค"
                  value={editDepartment}
                  onChange={e => setEditDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 mb-1.5"
                  required
                />
                
                {/* Department Presets */}
                <div className="flex flex-wrap gap-1">
                  {DEPARTMENT_PRESETS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditDepartment(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition cursor-pointer ${
                        editDepartment === preset
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team & Work Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">สังกัดทีมหลัก:</label>
                  <select
                    value={editTeam}
                    onChange={e => setEditTeam(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="Admin Sale">Admin Sale</option>
                    <option value="Engineer">Engineer (วิศวกร)</option>
                    <option value="SALE">SALE (ฝ่ายขาย)</option>
                    <option value="SALE MANAGER">SALE MANAGER</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">สถานะความพร้อม:</label>
                  <select
                    value={editWorkStatus}
                    onChange={e => setEditWorkStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="available">ว่าง / พร้อมงาน (เขียว)</option>
                    <option value="active">พร้อมปฏิบัติงาน (เขียว)</option>
                    <option value="busy">ติดงานหน้างาน (แดง)</option>
                    <option value="waiting">รองาน / เตรียมตัว (เหลือง)</option>
                    <option value="leave">ลา</option>
                    <option value="offline">ออฟไลน์</option>
                  </select>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">เบอร์โทรศัพท์:</label>
                  <input
                    type="text"
                    placeholder="08X-XXX-XXXX"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">อีเมล:</label>
                  <input
                    type="email"
                    placeholder="name@lumencraft.co.th"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
              </div>

              {/* Current Task */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">งานปัจจุบัน / ภารกิจที่มอบหมาย:</label>
                <input
                  type="text"
                  placeholder="เช่น โครงการ One Bangkok, รอจ่ายงาน ฯลฯ"
                  value={editCurrentTask}
                  onChange={e => setEditCurrentTask(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  บันทึกการแก้ไข (Save Changes)
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= ADD STAFF MODAL ================= */}
      {isAddingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 my-8">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-900">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">เพิ่มบุคลากรใหม่ในระบบ</h3>
                  <p className="text-xs text-slate-500">ระบุชื่อ ตำแหน่ง แผนก และข้อมูลการติดต่อ</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-4 text-xs">
              
              {/* Name */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  ชื่อ-นามสกุล หรือชื่อเล่น <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น คุณก้อย, ช่างวิน, คุณเอก"
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              {/* Position (ตำแหน่ง) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>ตำแหน่งหน้าที่ (Role / Position) <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น วิศวกรไฟฟ้า DALI, เจ้าหน้าที่บริหารงานขายโครงการ"
                  value={addRole}
                  onChange={e => setAddRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              {/* Department (แผนก) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>แผนกสังกัด (Department) <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น แผนกงานขายโครงการ, แผนกวิศวกรรมและบริการเทคนิค"
                  value={addDepartment}
                  onChange={e => setAddDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 mb-1.5"
                  required
                />
                
                {/* Department Presets */}
                <div className="flex flex-wrap gap-1">
                  {DEPARTMENT_PRESETS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAddDepartment(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition cursor-pointer ${
                        addDepartment === preset
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team & Work Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">สังกัดทีมหลัก:</label>
                  <select
                    value={addTeam}
                    onChange={e => {
                      const newTeam = e.target.value as StaffTeam;
                      setAddTeam(newTeam);
                      if (newTeam === 'Engineer') {
                        setAddRole('วิศวกรบริการและระบบแสงสว่าง');
                        setAddDepartment('แผนกวิศวกรรมและบริการเทคนิค (Engineering)');
                      } else if (newTeam === 'Admin Sale') {
                        setAddRole('เจ้าหน้าที่ธุรการและประสานงานขาย');
                        setAddDepartment('แผนกธุรการและประสานงานขาย (Admin Sales)');
                      } else if (newTeam === 'SALE MANAGER') {
                        setAddRole('ผู้จัดการฝ่ายขาย (Sales Manager)');
                        setAddDepartment('แผนกบริหารการขาย (Sales Management)');
                      } else {
                        setAddRole('เจ้าหน้าที่งานขาย (Sales Executive)');
                        setAddDepartment('แผนกงานขายโครงการ (Sales Department)');
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="Admin Sale">Admin Sale</option>
                    <option value="Engineer">Engineer (วิศวกร)</option>
                    <option value="SALE">SALE (ฝ่ายขาย)</option>
                    <option value="SALE MANAGER">SALE MANAGER</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">สถานะเริ่มต้น:</label>
                  <select
                    value={addWorkStatus}
                    onChange={e => setAddWorkStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="active">พร้อมปฏิบัติงาน (เขียว)</option>
                    <option value="available">ว่าง / พร้อมงาน (เขียว)</option>
                    <option value="busy">ติดงานหน้างาน (แดง)</option>
                    <option value="waiting">รองาน (เหลือง)</option>
                    <option value="offline">ออฟไลน์</option>
                  </select>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">เบอร์โทรศัพท์:</label>
                  <input
                    type="text"
                    placeholder="08X-XXX-XXXX"
                    value={addPhone}
                    onChange={e => setAddPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">อีเมล:</label>
                  <input
                    type="email"
                    placeholder="name@lumencraft.co.th"
                    value={addEmail}
                    onChange={e => setAddEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
              </div>

              {/* Current Task */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">งานปัจจุบัน / หมายเหตุ:</label>
                <input
                  type="text"
                  placeholder="เช่น พร้อมรับงานใหม่, ประจำสำนักงานใหญ่ ฯลฯ"
                  value={addCurrentTask}
                  onChange={e => setAddCurrentTask(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  บันทึกข้อมูลบุคลากรใหม่
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

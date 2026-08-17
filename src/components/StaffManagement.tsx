import React, { useState } from 'react';
import { 
  Users, UserPlus, Shield, Wrench, Briefcase, Award, 
  Trash2, Edit3, Check, X, Phone, Mail, Circle 
} from 'lucide-react';
import { StaffMember } from '../types';

interface StaffManagementProps {
  staff: StaffMember[];
  onAddStaff: (newStaff: StaffMember) => void;
  onUpdateStaff: (updatedStaff: StaffMember) => void;
  onDeleteStaff: (id: string) => void;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({
  staff,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [isAddingModal, setIsAddingModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [team, setTeam] = useState<'Admin Sale' | 'Engineer' | 'SALE' | 'SALE MANAGER'>('SALE');
  const [role, setRole] = useState('ฝ่ายขาย');
  const [phone, setPhone] = useState('02-XXX-XXXX');
  const [workStatus, setWorkStatus] = useState<'available' | 'busy' | 'waiting' | 'offline'>('available');

  const filteredStaff = staff.filter(s => {
    if (selectedTeam === 'all') return true;
    return s.team === selectedTeam;
  });

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('กรุณากรอกชื่อบุคลากร');
      return;
    }

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      team,
      role: role.trim() || team,
      phone: phone.trim(),
      workStatus,
    };

    onAddStaff(newStaff);
    setName('');
    setIsAddingModal(false);
  };

  const handleUpdateStatus = (member: StaffMember, newStatus: 'available' | 'busy' | 'waiting' | 'offline') => {
    onUpdateStaff({
      ...member,
      workStatus: newStatus,
    });
  };

  const getTeamBadge = (t: string) => {
    switch (t) {
      case 'Admin Sale':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">Admin Sale</span>;
      case 'Engineer':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">Engineer</span>;
      case 'SALE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">SALE</span>;
      case 'SALE MANAGER':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">SALE MANAGER</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">{t}</span>;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'available':
        return <span className="flex items-center gap-1 text-emerald-600 font-semibold"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> ว่าง / พร้อมปฏิบัติงาน</span>;
      case 'busy':
        return <span className="flex items-center gap-1 text-rose-600 font-semibold"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> ติดงานหน้างาน</span>;
      case 'waiting':
        return <span className="flex items-center gap-1 text-amber-600 font-semibold"><span className="w-2 h-2 rounded-full bg-amber-500"></span> รอจ่ายงาน</span>;
      default:
        return <span className="flex items-center gap-1 text-slate-400 font-semibold"><span className="w-2 h-2 rounded-full bg-slate-400"></span> ออฟไลน์</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-black text-xs">
              Staff Management
            </span>
            <span className="text-xs text-slate-400">
              ระบบจัดการรายชื่อทีมงาน และสถานะความพร้อมแบบ Real-time
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            จัดการรายชื่อบุคลากร (Staff & Team Operations)
          </h2>
        </div>

        <button
          onClick={() => setIsAddingModal(true)}
          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          เพิ่มบุคลากรใหม่
        </button>
      </div>

      {/* Team Tabs Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'Admin Sale', 'Engineer', 'SALE', 'SALE MANAGER'].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTeam(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedTeam === tab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab === 'all' ? `บุคลากรทั้งหมด (${staff.length})` : `${tab} (${staff.filter(s => s.team === tab).length})`}
          </button>
        ))}
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStaff.map(member => (
          <div key={member.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 relative hover:shadow-md transition">
            
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-800 text-sm">
                {member.name.slice(0, 2)}
              </div>
              {getTeamBadge(member.team)}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
              <p className="text-xs text-slate-500">{member.role}</p>
            </div>

            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {member.phone || '02-XXX-XXXX'}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px]">{getStatusIcon(member.workStatus)}</span>
              
              {/* Quick Status Dropdown */}
              <select
                value={member.workStatus || 'available'}
                onChange={e => handleUpdateStatus(member, e.target.value as any)}
                className="text-[11px] font-semibold px-2 py-1 rounded border border-slate-200 bg-slate-50 focus:ring-1 focus:ring-amber-500"
              >
                <option value="available">ว่าง</option>
                <option value="busy">ติดงาน</option>
                <option value="waiting">รองาน</option>
                <option value="offline">ออฟไลน์</option>
              </select>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => {
                  if (confirm(`คุณต้องการลบรายชื่อ "${member.name}" ใช่หรือไม่?`)) {
                    onDeleteStaff(member.id);
                  }
                }}
                className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold p-1"
                title="ลบบุคลากร"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {isAddingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">เพิ่มบุคลากรใหม่ในระบบ</h3>
              <button
                onClick={() => setIsAddingModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ชื่อ-นามสกุล หรือชื่อเล่น <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น คุณก้อย, ช่างวิน"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">สังกัดทีม:</label>
                  <select
                    value={team}
                    onChange={e => setTeam(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold"
                  >
                    <option value="Admin Sale">Admin Sale</option>
                    <option value="Engineer">Engineer</option>
                    <option value="SALE">SALE</option>
                    <option value="SALE MANAGER">SALE MANAGER</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">สถานะเริ่มต้น:</label>
                  <select
                    value={workStatus}
                    onChange={e => setWorkStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold"
                  >
                    <option value="available">ว่าง / พร้อมงาน</option>
                    <option value="busy">ติดงานหน้างาน</option>
                    <option value="waiting">รอจ่ายงาน</option>
                    <option value="offline">ออฟไลน์</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ตำแหน่งหน้าที่:</label>
                <input
                  type="text"
                  placeholder="เช่น หัวหน้าทีมแอดมิน, วิศวกรไฟฟ้า"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์:</label>
                <input
                  type="text"
                  placeholder="08X-XXX-XXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow"
                >
                  บันทึกข้อมูลบุคลากร
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
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

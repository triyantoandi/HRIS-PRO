import React, { useState } from 'react';
import { User, Shift, WorkSchedule } from '../types';
import { INITIAL_SHIFTS } from '../data/mockData';
import { hasPermission } from '../services/rbac';
import {
  CalendarDays,
  Clock,
  Plus,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shield,
  Check,
  Edit2,
  Trash2,
  Users,
  Moon,
  Sun,
  Coffee,
  AlertCircle,
  X,
  Save,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ShiftScheduleModuleProps {
  currentUser: User;
  allUsers: User[];
  shifts: Shift[];
  onAddShift?: (shift: Shift) => void;
  onUpdateShift?: (shift: Shift) => void;
  onDeleteShift?: (shiftId: string) => void;
  onBackToDashboard: () => void;
}

export const ShiftScheduleModule: React.FC<ShiftScheduleModuleProps> = ({
  currentUser,
  allUsers,
  shifts = INITIAL_SHIFTS,
  onAddShift,
  onUpdateShift,
  onDeleteShift,
  onBackToDashboard,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('Agustus 2026');
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  // Form State for Shift Creation/Editing
  const [sName, setSName] = useState('');
  const [sCode, setSCode] = useState('');
  const [sStartTime, setSStartTime] = useState('08:00');
  const [sEndTime, setSEndTime] = useState('17:00');
  const [sBreakStart, setSBreakStart] = useState('12:00');
  const [sBreakEnd, setSBreakEnd] = useState('13:00');
  const [sGracePeriod, setSGracePeriod] = useState('15');
  const [sCrossMidnight, setSCrossMidnight] = useState(false);
  const [sColor, setSColor] = useState('#10B981');

  // Employee Schedule Matrix State (mapping `userId_day`: shiftCode)
  const [scheduleAssignments, setScheduleAssignments] = useState<Record<string, string>>({});
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  const canManageShifts = hasPermission(currentUser, 'system.configure') || currentUser.role === 'super_admin' || currentUser.role === 'hr_admin';

  // Days in August 2026
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Open Modal to Add
  const handleOpenAddModal = () => {
    setEditingShift(null);
    setSName('');
    setSCode(`SFT-${shifts.length + 1}`);
    setSStartTime('08:00');
    setSEndTime('17:00');
    setSBreakStart('12:00');
    setSBreakEnd('13:00');
    setSGracePeriod('15');
    setSCrossMidnight(false);
    setSColor('#10B981');
    setShowShiftModal(true);
  };

  // Open Modal to Edit
  const handleOpenEditModal = (shift: Shift) => {
    setEditingShift(shift);
    setSName(shift.name);
    setSCode(shift.code);
    setSStartTime(shift.startTime);
    setSEndTime(shift.endTime);
    setSBreakStart(shift.breakStartTime || '12:00');
    setSBreakEnd(shift.breakEndTime || '13:00');
    setSGracePeriod(shift.gracePeriodMinutes.toString());
    setSCrossMidnight(!!shift.isCrossMidnight);
    setSColor(shift.color || '#10B981');
    setShowShiftModal(true);
  };

  // Save Shift
  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName || !sCode || !sStartTime || !sEndTime) {
      alert('Harap lengkapi nama shift, kode, jam masuk, dan jam pulang.');
      return;
    }

    const graceNum = parseInt(sGracePeriod, 10) || 0;

    if (editingShift) {
      const updated: Shift = {
        ...editingShift,
        name: sName,
        code: sCode,
        startTime: sStartTime,
        endTime: sEndTime,
        breakStartTime: sBreakStart,
        breakEndTime: sBreakEnd,
        gracePeriodMinutes: graceNum,
        isCrossMidnight: sCrossMidnight,
        color: sColor,
      };
      if (onUpdateShift) {
        onUpdateShift(updated);
      }
    } else {
      const newShift: Shift = {
        id: `sh-${Date.now()}`,
        name: sName,
        code: sCode,
        startTime: sStartTime,
        endTime: sEndTime,
        breakStartTime: sBreakStart,
        breakEndTime: sBreakEnd,
        gracePeriodMinutes: graceNum,
        isCrossMidnight: sCrossMidnight,
        color: sColor,
      };
      if (onAddShift) {
        onAddShift(newShift);
      }
    }

    setShowShiftModal(false);
  };

  // Delete Shift
  const handleDelete = (shift: Shift) => {
    if (shifts.length <= 1) {
      alert('Tidak dapat menghapus shift terakhir. Minimal harus ada 1 shift.');
      return;
    }
    if (onDeleteShift) {
      onDeleteShift(shift.id);
    }
  };

  // Toggle shift on grid cell
  const handleCellClick = (userId: string, day: number, isWeekend: boolean) => {
    if (!canManageShifts) return;
    const key = `${userId}_${day}`;
    const current = scheduleAssignments[key] || (isWeekend ? 'OFF' : 'REG-08');

    // Cycle through available shift codes + OFF
    const availableCodes = [...shifts.map((s) => s.code), 'OFF'];
    const currentIndex = availableCodes.indexOf(current);
    const nextIndex = (currentIndex + 1) % availableCodes.length;
    const nextCode = availableCodes[nextIndex];

    setScheduleAssignments((prev) => ({
      ...prev,
      [key]: nextCode,
    }));
  };

  // Filter users by department
  const filteredUsers = selectedDeptFilter === 'ALL'
    ? allUsers
    : allUsers.filter((u) => u.department === selectedDeptFilter);

  const departments = Array.from(new Set(allUsers.map((u) => u.department)));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 mb-2 cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Dashboard
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            <span>Manajemen Shift & Jam Masuk/Pulang Karyawan</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi jam masuk, jam pulang, waktu istirahat, toleransi keterlambatan, dan rotasi roster jadwal bulanan.
          </p>
        </div>

        {canManageShifts && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-2 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Shift Baru</span>
          </button>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-[#0F2038] via-[#142845] to-[#0A172A] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Dynamic Work Shift Engine</span>
          </div>
          <h2 className="text-xl font-black text-white">Ketentuan Jam Operasional Fleksibel</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Perubahan jam masuk dan pulang pada master shift akan langsung terintegrasi otomatis dengan <strong>kalkulasi presensi harian, toleransi keterlambatan (*grace period*), dan perhitungan lembur/overtime</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-2xl font-extrabold text-emerald-400 font-mono">{shifts.length}</p>
            <p className="text-[10px] text-slate-300">Master Shift Aktif</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-2xl font-extrabold text-blue-400 font-mono">{allUsers.length}</p>
            <p className="text-[10px] text-slate-300">Karyawan Terjadwal</p>
          </div>
        </div>
      </div>

      {/* Shift Master Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Daftar Ketentuan Master Shift ({shifts.length})</span>
          </h3>
          <span className="text-xs text-slate-500">Klik Edit untuk mengubah jam masuk & pulang</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: shift.color || '#10B981' }}
              />

              <div className="space-y-3">
                {/* Header tags */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/80">
                    {shift.code}
                  </span>
                  {shift.isCrossMidnight ? (
                    <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Moon className="w-3 h-3" />
                      <span>Cross-Midnight</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sun className="w-3 h-3" />
                      <span>Reguler Day</span>
                    </span>
                  )}
                </div>

                {/* Shift Name & Hours */}
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{shift.name}</h4>
                  <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-700">
                      <span className="text-[11px] font-sans text-slate-500 font-normal">Jam Kerja:</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{shift.startTime} - {shift.endTime}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="text-slate-500 font-sans">Istirahat:</span>
                      <span className="font-semibold">{shift.breakStartTime || '12:00'} - {shift.breakEndTime || '13:00'}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-sans">Toleransi Terlambat:</span>
                      <span className="font-extrabold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                        {shift.gracePeriodMinutes} Menit
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {canManageShifts && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenEditModal(shift)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Ubah Jam Shift</span>
                  </button>

                  {shifts.length > 1 && (
                    <button
                      onClick={() => handleDelete(shift)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                      title="Hapus Shift"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Monthly Roster Schedule Calendar Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
              <span>Kalender Roster & Penugasan Shift Karyawan ({selectedMonth})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {canManageShifts
                ? 'Klik pada kotak jadwal untuk mengganti shift harian karyawan secara interaktif.'
                : 'Melihat jadwal penugasan shift seluruh tim dan divisi.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Dept Filter */}
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">Semua Departemen</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Month Navigator */}
            <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button className="p-1 rounded-lg text-slate-600 hover:bg-slate-200 transition cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 px-2">{selectedMonth}</span>
              <button className="p-1 rounded-lg text-slate-600 hover:bg-slate-200 transition cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-600 text-[11px] mr-1">Legenda Shift:</span>
          {shifts.map((s) => (
            <div key={s.id} className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color || '#10B981' }} />
              <span className="font-bold text-slate-800 font-mono text-[11px]">{s.code}</span>
              <span className="text-slate-500 text-[11px]">({s.startTime}-{s.endTime})</span>
            </div>
          ))}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="font-bold text-slate-600 text-[11px]">OFF (Libur)</span>
          </div>
        </div>

        {/* Schedule Matrix Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-3 min-w-[180px] sticky left-0 bg-slate-50 z-10 font-bold uppercase text-[10px]">
                  Karyawan & Divisi
                </th>
                {daysInMonth.slice(14, 25).map((day) => {
                  const isWeekend = day % 7 === 1 || day % 7 === 2;
                  return (
                    <th key={day} className={`py-3 px-2 text-center font-mono font-bold min-w-[70px] border-l border-slate-200/60 ${isWeekend ? 'bg-amber-50/40 text-amber-900' : ''}`}>
                      <div className="text-[11px]">{day} Ags</div>
                      <div className="text-[9px] text-slate-400 font-normal">
                        {isWeekend ? 'Weekend' : 'Workday'}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-sans sticky left-0 bg-white z-10 shadow-xs border-r border-slate-100">
                    <p className="font-bold text-slate-900 text-xs">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{user.department}</p>
                  </td>
                  {daysInMonth.slice(14, 25).map((day) => {
                    const isWeekend = day % 7 === 1 || day % 7 === 2;
                    const key = `${user.id}_${day}`;
                    const assignedCode = scheduleAssignments[key] || (isWeekend ? 'OFF' : 'REG-08');
                    const matchedShift = shifts.find((s) => s.code === assignedCode);

                    return (
                      <td
                        key={day}
                        onClick={() => handleCellClick(user.id, day, isWeekend)}
                        className={`py-2 px-1 text-center border-l border-slate-100 ${
                          canManageShifts ? 'cursor-pointer hover:bg-emerald-50/50' : ''
                        }`}
                        title={canManageShifts ? 'Klik untuk mengganti shift' : ''}
                      >
                        {assignedCode === 'OFF' ? (
                          <span className="inline-block px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">
                            OFF
                          </span>
                        ) : (
                          <span
                            className="inline-block px-2 py-1 rounded-md text-[10px] font-bold shadow-2xs border"
                            style={{
                              backgroundColor: `${matchedShift?.color || '#10B981'}15`,
                              borderColor: `${matchedShift?.color || '#10B981'}40`,
                              color: matchedShift?.color || '#0F2038',
                            }}
                          >
                            {assignedCode}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit Shift */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="p-5 bg-[#0F2038] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-sm">
                    {editingShift ? 'Ubah Ketentuan Shift & Jam Kerja' : 'Tambah Master Shift Baru'}
                  </h3>
                  <p className="text-xs text-slate-300">Tentukan jam masuk, jam pulang, istirahat, dan toleransi keterlambatan.</p>
                </div>
              </div>
              <button
                onClick={() => setShowShiftModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="p-6 space-y-5 text-xs">
              
              {/* Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Shift</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Shift Pagi Operasional"
                    value={sName}
                    onChange={(e) => setSName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode Shift</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SFT-PG"
                    value={sCode}
                    onChange={(e) => setSCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Working Hours (Jam Masuk & Jam Pulang) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Jadwal Jam Masuk & Jam Pulang (HH:mm)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Jam Masuk (Clock In)</label>
                    <input
                      type="time"
                      required
                      value={sStartTime}
                      onChange={(e) => setSStartTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Jam Pulang (Clock Out)</label>
                    <input
                      type="time"
                      required
                      value={sEndTime}
                      onChange={(e) => setSEndTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mulai Istirahat</label>
                    <input
                      type="time"
                      value={sBreakStart}
                      onChange={(e) => setSBreakStart(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Selesai Istirahat</label>
                    <input
                      type="time"
                      value={sBreakEnd}
                      onChange={(e) => setSBreakEnd(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Grace Period & Cross Midnight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Toleransi Terlambat (Menit)</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={sGracePeriod}
                    onChange={(e) => setSGracePeriod(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Karyawan tidak dianggap terlambat jika hadir dalam batas ini.</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Warna Label Shift</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={sColor}
                      onChange={(e) => setSColor(e.target.value)}
                      className="w-10 h-10 p-1 rounded-xl border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={sColor}
                      onChange={(e) => setSColor(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isCrossMidnight"
                    checked={sCrossMidnight}
                    onChange={(e) => setSCrossMidnight(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                  <label htmlFor="isCrossMidnight" className="font-bold text-slate-700 cursor-pointer">
                    Shift Lintas Tengah Malam (*Cross-Midnight*, contoh: 21:00 - 06:00 keesokan harinya)
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-950/20 cursor-pointer"
                >
                  {editingShift ? 'Simpan Perubahan Shift' : 'Buat Shift Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

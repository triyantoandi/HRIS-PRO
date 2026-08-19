import React, { useState } from 'react';
import { 
  User, 
  AttendanceRecord, 
  LeaveRequest, 
  OvertimeRequest, 
  AttendanceCorrection, 
  PayrollRecord,
  Branch
} from '../types';
import { formatRupiah, formatIndonesianDate } from '../data/mockData';
import { generateHRInsights } from '../services/insightsEngine';
import {
  Users,
  Clock,
  Briefcase,
  DollarSign,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  CalendarCheck,
  Zap,
} from 'lucide-react';

interface DashboardHubProps {
  currentUser: User;
  allUsers: User[];
  currentBranch: Branch;
  attendanceList: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  overtimeRequests: OvertimeRequest[];
  correctionsList: AttendanceCorrection[];
  payrollList: PayrollRecord[];
  onSelectModule: (module: string) => void;
  onClockIn: (record: Omit<AttendanceRecord, 'id'>) => void;
  onClockOut: (attendanceId: string, clockOutTime: string) => void;
}

export const DashboardHub: React.FC<DashboardHubProps> = ({
  currentUser,
  allUsers,
  currentBranch,
  attendanceList,
  leaveRequests,
  overtimeRequests,
  correctionsList,
  payrollList,
  onSelectModule,
  onClockIn,
  onClockOut,
}) => {
  const [quickWorkType, setQuickWorkType] = useState<'WFO (Kantor)' | 'WFH (Remote)' | 'Dinas Luar'>('WFO (Kantor)');

  // Today's date
  const todayStr = '2026-08-18';
  const todayAttendanceList = attendanceList.filter((a) => a.date === todayStr);
  const myTodayAttendance = todayAttendanceList.find((a) => a.userId === currentUser.id);

  // Statistics
  const totalEmployees = allUsers.length;
  const presentToday = todayAttendanceList.filter((a) => a.status === 'Hadir' || a.status === 'Terlambat').length;
  const lateToday = todayAttendanceList.filter((a) => a.status === 'Terlambat').length;
  const onLeaveToday = leaveRequests.filter(
    (l) => l.status === 'Disetujui' && l.startDate <= todayStr && l.endDate >= todayStr
  ).length;

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'Menunggu').length;
  const pendingOvertimes = overtimeRequests.filter((o) => o.status === 'Menunggu').length;
  const pendingCorrections = correctionsList.filter((c) => c.status === 'Menunggu Review').length;
  const totalPendingApprovals = pendingLeaves + pendingOvertimes + pendingCorrections;

  // Total latest payroll budget
  const latestPayrollMonth = payrollList[0]?.monthYear || 'Juli 2026';
  const totalPayrollCost = payrollList
    .filter((p) => p.monthYear === latestPayrollMonth)
    .reduce((acc, p) => acc + p.takeHomePay, 0);

  // Generate Smart HR Insights
  const insights = generateHRInsights({
    users: allUsers,
    attendanceList,
    leaveRequests,
    overtimeRequests,
    payrollList,
  });

  const handleQuickPunch = () => {
    if (!myTodayAttendance) {
      // Clock In
      const nowTime = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date()).replace(/\./g, ':');

      onClockIn({
        userId: currentUser.id,
        userName: currentUser.name,
        userNip: currentUser.nip,
        department: currentUser.department,
        branchId: currentBranch.id,
        branchName: currentBranch.name,
        date: todayStr,
        shiftId: 'sh-regular',
        shiftName: 'Office Normal (08:00 - 17:00)',
        clockInTime: nowTime,
        status: 'Hadir',
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        workType: quickWorkType,
        location: quickWorkType === 'WFO (Kantor)' ? currentBranch.address : 'Remote / Mobile Punch',
        coordinates: currentBranch.coordinates,
        distanceFromOfficeMeters: quickWorkType === 'WFO (Kantor)' ? 15 : 1200,
        isWithinGeofence: quickWorkType === 'WFO (Kantor)',
        deviceInfo: 'Web Browser Quick Check-In',
      });
    } else if (!myTodayAttendance.clockOutTime) {
      // Clock Out
      const nowTime = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date()).replace(/\./g, ':');

      onClockOut(myTodayAttendance.id, nowTime);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner / Welcome greeting */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Manajemen Tenaga Kerja Terintegrasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {currentUser.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              {currentUser.position} • {currentUser.department} ({currentBranch.name})
            </p>
          </div>

          {/* Quick Employee Punch Card */}
          <div className="w-full md:w-auto bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-xs text-blue-200 font-medium">{formatIndonesianDate(todayStr)}</p>
              <div className="text-lg font-bold font-mono">
                {myTodayAttendance?.clockInTime ? (
                  <span className="text-emerald-400">Masuk: {myTodayAttendance.clockInTime} WIB</span>
                ) : (
                  <span className="text-amber-300">Belum Presensi</span>
                )}
                {myTodayAttendance?.clockOutTime && (
                  <span className="text-slate-300 text-xs block font-normal">Pulang: {myTodayAttendance.clockOutTime} WIB</span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {!myTodayAttendance?.clockInTime ? (
                <button
                  onClick={handleQuickPunch}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-sm text-white shadow-lg shadow-emerald-500/30 transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>Clock In Cepat</span>
                </button>
              ) : !myTodayAttendance?.clockOutTime ? (
                <button
                  onClick={handleQuickPunch}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-sm text-white shadow-lg shadow-red-500/30 transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>Clock Out</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-emerald-900/60 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center space-x-1.5">
                  <CalendarCheck className="w-4 h-4" />
                  <span>Presensi Selesai</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: Total Karyawan */}
        <div 
          onClick={() => onSelectModule('workforce')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Karyawan</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalEmployees}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> 100% Aktif
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Terdaftar di 3 kantor cabang</p>
        </div>

        {/* Metric 2: Kehadiran Hari Ini */}
        <div 
          onClick={() => onSelectModule('absensi')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hadir Hari Ini</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{presentToday}</span>
            {lateToday > 0 && (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                {lateToday} Terlambat
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">Dari {totalEmployees} total karyawan kerja</p>
        </div>

        {/* Metric 3: Pengajuan Pending */}
        <div 
          onClick={() => onSelectModule('cuti')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Approval Pending</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalPendingApprovals}</span>
            <span className="text-xs font-bold text-amber-600">Butuh Tindakan</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{pendingLeaves} Cuti • {pendingOvertimes} Lembur</p>
        </div>

        {/* Metric 4: Estimasi Payroll */}
        <div 
          onClick={() => onSelectModule('payroll')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Payroll ({latestPayrollMonth})</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">
              {formatRupiah(totalPayrollCost)}
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 font-medium">BPJS & PPh 21 Terhitung Otomatis</p>
        </div>

      </div>

      {/* AI Smart HR Insights */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white shadow-lg border border-slate-700/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center ring-1 ring-blue-400/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Smart HR Insights & Operational Analytics</h2>
              <p className="text-xs text-slate-400">Analisis kecerdasan buatan berbasis data real-time sistem presensi dan SDM</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-blue-300 bg-blue-900/60 px-2.5 py-1 rounded-full border border-blue-700/50">
            {insights.length} Rekomendasi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {insights.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-700 hover:border-slate-600 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      item.level === 'warning'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : item.level === 'positive'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {item.category}
                  </span>
                  {item.metric && <span className="text-xs font-bold text-white font-mono">{item.metric}</span>}
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{item.description}</p>
              </div>

              {item.recommendedAction && (
                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center space-x-1.5 text-xs text-blue-300 font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{item.recommendedAction}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Today Attendance Live Feed & Quick Navigation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Today Attendance Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Rekap Presensi Hari Ini</h3>
              <p className="text-xs text-slate-500">{formatIndonesianDate(todayStr)} • Seluruh Cabang</p>
            </div>
            <button
              onClick={() => onSelectModule('absensi')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>Lihat Detail Presensi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Karyawan</th>
                  <th className="py-3 px-3">Departemen</th>
                  <th className="py-3 px-3">Masuk (Clock In)</th>
                  <th className="py-3 px-3">Metode</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAttendanceList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada catatan presensi untuk hari ini.
                    </td>
                  </tr>
                ) : (
                  todayAttendanceList.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <div>{rec.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{rec.userNip}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{rec.department}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {rec.clockInTime}
                        {rec.clockOutTime && (
                          <span className="text-slate-400 text-[11px] block font-normal">
                            Out: {rec.clockOutTime}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center text-[11px] font-medium text-slate-600">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                          {rec.workType}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            rec.status === 'Hadir'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : rec.status === 'Terlambat'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {rec.status}
                          {rec.lateMinutes > 0 && ` (+${rec.lateMinutes}m)`}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Quick Shortcut Portal Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Akses Cepat Modul Utama</h3>
            
            <div className="space-y-2.5">
              <button
                onClick={() => onSelectModule('workforce')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Data Karyawan 360</p>
                    <p className="text-[11px] text-slate-500">Kelola master data SDM & Dokumen</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              </button>

              <button
                onClick={() => onSelectModule('cuti')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Pengajuan & Saldo Cuti</p>
                    <p className="text-[11px] text-slate-500">{currentUser.leaveQuota.remaining} Hari Sisa Kuota Cuti</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
              </button>

              <button
                onClick={() => onSelectModule('overtime')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-amber-700">Lembur (Surat Perintah Lembur)</p>
                    <p className="text-[11px] text-slate-500">Ajukan & setujui jam kerja lembur</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
              </button>

              <button
                onClick={() => onSelectModule('payroll')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Payroll & Slip Gaji</p>
                    <p className="text-[11px] text-slate-500">Cetak & unduh slip gaji digital</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

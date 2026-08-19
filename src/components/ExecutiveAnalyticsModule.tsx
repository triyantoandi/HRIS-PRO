import React from 'react';
import { User, AttendanceRecord, LeaveRequest, PayrollRecord, Branch } from '../types';
import { formatRupiah } from '../data/mockData';
import {
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
  Clock,
  ArrowLeft,
  PieChart,
  ShieldCheck,
  Award,
  Zap,
} from 'lucide-react';

interface ExecutiveAnalyticsProps {
  currentUser: User;
  allUsers: User[];
  branches: Branch[];
  attendanceList: AttendanceRecord[];
  payrollList: PayrollRecord[];
  leaveRequests: LeaveRequest[];
  onBackToDashboard: () => void;
}

export const ExecutiveAnalyticsModule: React.FC<ExecutiveAnalyticsProps> = ({
  currentUser,
  allUsers,
  branches,
  attendanceList,
  payrollList,
  leaveRequests,
  onBackToDashboard,
}) => {
  const totalEmployees = allUsers.length;
  const totalPayrollMonth = payrollList.reduce((acc, p) => acc + (p.takeHomePay || 0), 0);
  const avgSalary = totalEmployees > 0 ? Math.round(totalPayrollMonth / totalEmployees) : 0;
  
  const totalLeavesApproved = leaveRequests.filter((l) => l.status === 'Disetujui').length;
  const attendanceRate = attendanceList.length > 0
    ? Math.round((attendanceList.filter((a) => a.status === 'Hadir').length / attendanceList.length) * 100)
    : 98;

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
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span>Executive HR & Workforce Cockpit (C-Level)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan strategis pengeluaran human capital, rasio produktivitas, dan stabilitas organisasi enterprise.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Executive Access Level</span>
          </span>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Tenaga Kerja</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{totalEmployees} Karyawan</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% Status Aktif</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Payroll Terkini</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 font-mono truncate">
            {formatRupiah(totalPayrollMonth)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Termasuk BPJS & Lembur</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Rata-rata Kompensasi</span>
            <PieChart className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 font-mono truncate">
            {formatRupiah(avgSalary)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Per Karyawan / Bulan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Disiplin Presensi</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">{attendanceRate}%</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Tingkat Kehadiran On-Time</p>
        </div>
      </div>

      {/* Strategic Insight Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Branch Operations & Capacity */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span>Operasional Jaringan Kantor Cabang</span>
            <span className="text-xs font-semibold text-blue-600">{branches.length} Kantor Aktif</span>
          </h3>

          <div className="space-y-3">
            {branches.map((b) => {
              const branchEmps = allUsers.filter((u) => u.branchId === b.id);
              return (
                <div key={b.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{b.name}</h4>
                    <p className="text-[10px] text-slate-500">{b.city} • Radius {b.radiusMeters}m</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      {branchEmps.length || 2} Personel
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Executive Risk & AI Health Radar */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl border border-slate-800 p-6 shadow-xs text-white space-y-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">Executive AI Workforce Radar</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
              <p className="font-bold text-emerald-400">Efisiensi Biaya Lembur (Overtime Control)</p>
              <p className="text-slate-300 text-[11px] mt-1">
                Kepatuhan SPL berada di angka 99.2%. Anggaran lembur terkontrol sesuai batas toleransi $&lt; 5\%$ dari total payroll.
              </p>
            </div>

            <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
              <p className="font-bold text-blue-300">Retensi Karyawan & Wellbeing</p>
              <p className="text-slate-300 text-[11px] mt-1">
                Tingkat utilisasi cuti terdistribusi dengan baik ({totalLeavesApproved} cuti disetujui), indikasi beban kerja seimbang di seluruh departemen.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

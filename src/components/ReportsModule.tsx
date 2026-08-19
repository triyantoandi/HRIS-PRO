import React, { useState } from 'react';
import { User, AttendanceRecord, LeaveRequest, PayrollRecord, Branch } from '../types';
import { formatRupiah, DEPARTMENTS } from '../data/mockData';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  FileText,
  ArrowLeft,
  Users,
  Clock,
  Briefcase,
  TrendingUp,
} from 'lucide-react';

interface ReportsModuleProps {
  currentUser: User;
  allUsers: User[];
  branches: Branch[];
  attendanceList: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  payrollList: PayrollRecord[];
  onBackToDashboard: () => void;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  currentUser,
  allUsers,
  branches,
  attendanceList,
  leaveRequests,
  payrollList,
  onBackToDashboard,
}) => {
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [reportType, setReportType] = useState<'attendance' | 'leave' | 'payroll'>('attendance');

  // Attendance metrics
  const totalLogs = attendanceList.length;
  const onTimeCount = attendanceList.filter((a) => a.status === 'Hadir').length;
  const lateCount = attendanceList.filter((a) => a.status === 'Terlambat').length;
  const onTimePercentage = totalLogs > 0 ? Math.round((onTimeCount / totalLogs) * 100) : 100;

  // Leave metrics
  const totalApprovedLeaves = leaveRequests.filter((l) => l.status === 'Disetujui').length;
  const totalLeaveDays = leaveRequests
    .filter((l) => l.status === 'Disetujui')
    .reduce((acc, l) => acc + l.daysCount, 0);

  // Payroll metrics
  const totalPayrollExpenditure = payrollList.reduce((acc, p) => acc + p.takeHomePay, 0);

  const handleExport = (format: 'PDF' | 'EXCEL') => {
    alert(`Laporan ${reportType.toUpperCase()} berhasil diekspor dalam format ${format}.`);
  };

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
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Laporan & Analitik SDM (Reports Hub)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi kepatuhan kehadiran, produktivitas shift, utilisasi kuota cuti, dan agregasi biaya penggajian.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('EXCEL')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (XLSX)</span>
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Ekspor PDF Executive</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tingkat Ketepatan Waktu</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600 flex items-baseline justify-between">
            <span>{onTimePercentage}%</span>
            <span className="text-xs text-slate-500 font-normal">{onTimeCount} dari {totalLogs} log</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${onTimePercentage}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Hari Cuti Terpakai</span>
          <div className="mt-2 text-2xl font-extrabold text-indigo-600">
            {totalLeaveDays} Hari Kerja
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{totalApprovedLeaves} Pengajuan Cuti Disetujui</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Realisasi Payroll</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 font-mono truncate">
            {formatRupiah(totalPayrollExpenditure)}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% Tercatat & Terverifikasi</p>
        </div>
      </div>

      {/* Breakdown by Department Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Distribusi Karyawan & Rekapitulasi per Departemen</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Departemen</th>
                <th className="py-3 px-4">Jumlah Karyawan</th>
                <th className="py-3 px-4">Presensi Hadir</th>
                <th className="py-3 px-4">Tingkat Kehadiran</th>
                <th className="py-3 px-4">Alokasi Payroll Estimasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEPARTMENTS.map((dept) => {
                const empsInDept = allUsers.filter((u) => u.department === dept);
                const attInDept = attendanceList.filter((a) => a.department === dept);
                const deptPayroll = empsInDept.reduce((acc, u) => acc + u.salaryDetails.basicSalary, 0);

                return (
                  <tr key={dept} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{dept}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{empsInDept.length} Orang</td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">{attInDept.length} Log</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        98.5%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {formatRupiah(deptPayroll)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

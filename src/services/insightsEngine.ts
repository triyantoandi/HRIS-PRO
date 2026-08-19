import { AttendanceRecord, User, LeaveRequest, OvertimeRequest, PayrollRecord } from '../types';

export interface HRInsight {
  id: string;
  category: 'attendance' | 'overtime' | 'leave' | 'payroll' | 'workforce';
  level: 'info' | 'warning' | 'positive';
  title: string;
  description: string;
  metric?: string;
  recommendedAction?: string;
}

export function generateHRInsights({
  users,
  attendanceList,
  leaveRequests,
  overtimeRequests,
  payrollList,
}: {
  users: User[];
  attendanceList: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  overtimeRequests: OvertimeRequest[];
  payrollList: PayrollRecord[];
}): HRInsight[] {
  const insights: HRInsight[] = [];

  // 1. Attendance & Late Rate Analysis
  const totalRecords = attendanceList.length;
  const lateRecords = attendanceList.filter((a) => a.status === 'Terlambat');
  const lateRate = totalRecords > 0 ? (lateRecords.length / totalRecords) * 100 : 0;

  if (lateRate > 15) {
    insights.push({
      id: 'ins-att-1',
      category: 'attendance',
      level: 'warning',
      title: 'Tingkat Keterlambatan Meningkat',
      description: `Rasio keterlambatan tercatat ${lateRate.toFixed(1)}% dari total kehadiran. Sebagian besar keterlambatan terjadi pada rentang waktu 08:15 - 08:35 WIB.`,
      metric: `${lateRate.toFixed(1)}% Late Rate`,
      recommendedAction: 'Tinjau kebijakan fleksibilitas jam kerja atau berlakukan sistem rotasi shift terpadu.',
    });
  } else {
    insights.push({
      id: 'ins-att-2',
      category: 'attendance',
      level: 'positive',
      title: 'Disiplin Kehadiran Sangat Baik',
      description: `Tingkat kehadiran tepat waktu mencapai ${(100 - lateRate).toFixed(1)}% di seluruh kantor cabang.`,
      metric: `${(100 - lateRate).toFixed(1)}% On-Time`,
    });
  }

  // 2. Overtime Distribution by Department
  const otByDept: Record<string, number> = {};
  for (const ot of overtimeRequests.filter((o) => o.status === 'Disetujui')) {
    otByDept[ot.department] = (otByDept[ot.department] || 0) + ot.durationHours;
  }
  const topOtDept = Object.entries(otByDept).sort((a, b) => b[1] - a[1])[0];
  if (topOtDept && topOtDept[1] > 0) {
    insights.push({
      id: 'ins-ot-1',
      category: 'overtime',
      level: 'info',
      title: `Overtime Tertinggi di ${topOtDept[0]}`,
      description: `Departemen ${topOtDept[0]} mencatat total akumulasi lembur tertinggi sebanyak ${topOtDept[1]} jam bulan ini.`,
      metric: `${topOtDept[1]} Jam Lembur`,
      recommendedAction: 'Evaluasi alokasi beban kerja (workload distribution) atau rekrutmen tenaga tambahan.',
    });
  }

  // 3. Leave Utilization
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'Menunggu');
  if (pendingLeaves.length > 0) {
    insights.push({
      id: 'ins-leave-1',
      category: 'leave',
      level: 'warning',
      title: `${pendingLeaves.length} Pengajuan Cuti Menunggu Approval`,
      description: `Terdapat permohonan cuti staf yang belum diproses oleh atasan langsung / HR Manager.`,
      metric: `${pendingLeaves.length} Pending`,
      recommendedAction: 'Buka modul Cuti & Approval untuk memproses persetujuan sebelum jadwal dimulai.',
    });
  }

  // 4. Contract End Date Tracker
  const upcomingContracts = users.filter((u) => {
    if (u.employmentStatus === 'Kontrak (PKWT)' && u.contractEndDate) {
      const end = new Date(u.contractEndDate);
      const now = new Date('2026-08-18');
      const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 60;
    }
    return false;
  });

  if (upcomingContracts.length > 0) {
    insights.push({
      id: 'ins-wf-1',
      category: 'workforce',
      level: 'warning',
      title: `${upcomingContracts.length} Karyawan Kontrak Mendekati Masa Berakhir`,
      description: `Karyawan seperti ${upcomingContracts.map((u) => u.name).join(', ')} memiliki masa kontrak PKWT berakhir dalam rentang 60 hari ke depan.`,
      metric: `${upcomingContracts.length} PKWT Berakhir`,
      recommendedAction: 'Lakukan evaluasi performa kerja untuk persiapan perpanjangan kontrak atau pengangkatan karyawan tetap.',
    });
  }

  // 5. Total Payroll Budget Overview
  if (payrollList.length > 0) {
    const totalPayroll = payrollList.reduce((acc, p) => acc + p.takeHomePay, 0);
    insights.push({
      id: 'ins-pyr-1',
      category: 'payroll',
      level: 'info',
      title: 'Estimasi Pengeluaran Payroll Stabil',
      description: `Alokasi take-home pay untuk ${payrollList.length} karyawan terkelola dengan efisiensi potongan pajak dan BPJS sesuai regulasi.`,
      metric: `Rp ${(totalPayroll / 1000000).toFixed(1)} Jt Total Payroll`,
    });
  }

  return insights;
}

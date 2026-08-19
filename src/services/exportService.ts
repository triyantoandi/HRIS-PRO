import { AttendanceRecord, PayrollRecord, User } from '../types';

/**
 * Trigger client-side browser file download for CSV/Text data
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Detailed Attendance Logs to CSV/Excel Timesheet
 */
export function exportAttendanceDetailCSV(attendanceList: AttendanceRecord[], periodTitle: string = 'Agustus 2026') {
  const headers = [
    'No',
    'Tanggal',
    'NIP Karyawan',
    'Nama Lengkap',
    'Departemen',
    'Cabang Kantor',
    'Nama Shift',
    'Jam Masuk (Clock In)',
    'Jam Pulang (Clock Out)',
    'Menit Terlambat',
    'Menit Pulang Cepat',
    'Tipe Kerja',
    'Status Kehadiran',
    'Status Geofence',
    'Koordinat GPS',
    'Catatan / Alasan',
  ];

  const rows = attendanceList.map((rec, idx) => {
    const latLng = rec.coordinates ? `${rec.coordinates.lat.toFixed(5)}, ${rec.coordinates.lng.toFixed(5)}` : '-';
    return [
      idx + 1,
      `"${rec.date}"`,
      `"${rec.userNip}"`,
      `"${rec.userName}"`,
      `"${rec.department}"`,
      `"${rec.branchName}"`,
      `"${rec.shiftName || 'Office Regular'}"`,
      `"${rec.clockInTime}"`,
      `"${rec.clockOutTime || '-'}"`,
      rec.lateMinutes || 0,
      rec.earlyLeaveMinutes || 0,
      `"${rec.workType}"`,
      `"${rec.status}"`,
      rec.isWithinGeofence ? 'Dalam Radius (Valid)' : 'Luar Radius (Override)',
      `"${latLng}"`,
      `"${rec.notes ? rec.notes.replace(/"/g, '""') : '-'}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const safeFilename = `Timesheet_Absensi_${periodTitle.replace(/\s+/g, '_')}_${Date.now()}.csv`;
  downloadFile(safeFilename, csvContent);
}

/**
 * Export Monthly Attendance Summary for HR & Payroll Integration
 */
export function exportAttendanceSummaryCSV(users: User[], attendanceList: AttendanceRecord[], periodTitle: string = 'Agustus 2026') {
  const headers = [
    'No',
    'NIP',
    'Nama Karyawan',
    'Jabatan',
    'Departemen',
    'Kantor Cabang',
    'Total Hadir (Hari)',
    'Tepat Waktu (Hari)',
    'Terlambat (Kali)',
    'Total Menit Terlambat',
    'Izin / Sakit (Hari)',
    'Persentase Kehadiran (%)',
  ];

  const rows = users.map((user, idx) => {
    const userRecs = attendanceList.filter((a) => a.userId === user.id);
    const totalPresent = userRecs.length;
    const onTimeCount = userRecs.filter((a) => a.status === 'Hadir' && (!a.lateMinutes || a.lateMinutes === 0)).length;
    const lateCount = userRecs.filter((a) => a.status === 'Terlambat' || (a.lateMinutes && a.lateMinutes > 0)).length;
    const totalLateMins = userRecs.reduce((acc, a) => acc + (a.lateMinutes || 0), 0);
    const leaveCount = user.leaveQuota.used + user.leaveQuota.sickUsed;
    const attendancePct = totalPresent > 0 ? Math.round((onTimeCount / totalPresent) * 100) : 100;

    return [
      idx + 1,
      `"${user.nip}"`,
      `"${user.name}"`,
      `"${user.position}"`,
      `"${user.department}"`,
      `"${user.branchName}"`,
      totalPresent,
      onTimeCount,
      lateCount,
      totalLateMins,
      leaveCount,
      `${attendancePct}%`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const safeFilename = `Rekap_Kehadiran_Bulanan_${periodTitle.replace(/\s+/g, '_')}.csv`;
  downloadFile(safeFilename, csvContent);
}

/**
 * Export Banking Bulk Payroll Formats (KlikBCA Bisnis, Mandiri MCM, BRI CMS)
 */
export function exportBankBulkPayroll(
  payrollList: PayrollRecord[],
  bankFormat: 'BCA' | 'MANDIRI' | 'BRI' | 'BNI' | 'UNIVERSAL',
  periodTitle: string = 'Agustus 2026'
) {
  let headers: string[] = [];
  let rows: string[] = [];

  if (bankFormat === 'BCA') {
    // KlikBCA Bisnis Batch Upload Specification
    headers = [
      'Rekening_Penerima',
      'Nama_Penerima',
      'Mata_Uang',
      'Nominal_Transfer',
      'Keterangan_1',
      'Keterangan_2',
      'Kode_Bank_Penerima',
      'Email_Karyawan',
    ];

    rows = payrollList.map((p) => {
      const accNo = p.bankInfo?.accountNumber || p.accountNumber || '1234567890';
      const holder = p.bankInfo?.accountHolder || p.userName;
      return [
        `"${accNo.replace(/\D/g, '')}"`,
        `"${holder.toUpperCase()}"`,
        'IDR',
        Math.round(p.takeHomePay),
        `"Gaji ${periodTitle}"`,
        `"${p.userNip}"`,
        'BCA',
        `"${p.userNip.toLowerCase()}@company.co.id"`,
      ].join(',');
    });
  } else if (bankFormat === 'MANDIRI') {
    // Mandiri Cash Management (MCM) Format
    headers = [
      'Beneficiary_Account_No',
      'Beneficiary_Name',
      'Transfer_Amount',
      'Remark_1',
      'Remark_2',
      'Beneficiary_Bank_Name',
    ];

    rows = payrollList.map((p) => {
      const accNo = p.bankInfo?.accountNumber || p.accountNumber || '1234567890';
      const holder = p.bankInfo?.accountHolder || p.userName;
      return [
        `"${accNo.replace(/\D/g, '')}"`,
        `"${holder.toUpperCase()}"`,
        Math.round(p.takeHomePay),
        `"PAYROLL ${periodTitle}"`,
        `"${p.userNip}"`,
        'MANDIRI',
      ].join(',');
    });
  } else if (bankFormat === 'BRI') {
    // BRI Cash Management System (CMS) Format
    headers = [
      'No_Rekening_Tujuan',
      'Nama_Pemilik_Rekening',
      'Jumlah_Rupiah',
      'Berita_Transfer',
      'Kode_Bank',
    ];

    rows = payrollList.map((p) => {
      const accNo = p.bankInfo?.accountNumber || p.accountNumber || '1234567890';
      const holder = p.bankInfo?.accountHolder || p.userName;
      return [
        `"${accNo.replace(/\D/g, '')}"`,
        `"${holder.toUpperCase()}"`,
        Math.round(p.takeHomePay),
        `"Gaji Bulanan ${periodTitle} - ${p.userName}"`,
        '002',
      ].join(',');
    });
  } else {
    // Universal Corporate CSV
    headers = [
      'NIP',
      'Nama_Karyawan',
      'Bank_Tujuan',
      'Nomor_Rekening',
      'Nama_Pemilik_Rekening',
      'Gaji_Pokok',
      'Tunjangan_Jabatan',
      'Tunjangan_Makan_Transport',
      'Lembur',
      'Potongan_BPJS',
      'Potongan_PPH21',
      'Gaji_Bersih_Take_Home_Pay',
    ];

    rows = payrollList.map((p) => [
      `"${p.userNip}"`,
      `"${p.userName}"`,
      `"${p.bankInfo?.bankName || p.bankName || 'BCA'}"`,
      `"${(p.bankInfo?.accountNumber || p.accountNumber || '').replace(/\D/g, '')}"`,
      `"${(p.bankInfo?.accountHolder || p.userName).toUpperCase()}"`,
      p.basicSalary,
      p.allowancePosition,
      p.allowanceMeal + p.allowanceTransport,
      p.overtimePay,
      p.bpjsKesehatanEmployee + p.bpjsKetenagakerjaanEmployee,
      p.taxPph21,
      Math.round(p.takeHomePay),
    ].join(','));
  }

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const filename = `Payroll_Bank_${bankFormat}_${periodTitle.replace(/\s+/g, '_')}_${Date.now()}.csv`;
  downloadFile(filename, csvContent);
}

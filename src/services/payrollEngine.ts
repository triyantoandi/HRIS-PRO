import { User, OvertimeRequest, AttendanceRecord, PayrollRecord } from '../types';

export function calculateOvertimePay(
  basicSalary: number,
  approvedOvertimes: OvertimeRequest[]
): { totalOvertimeHours: number; totalOvertimePay: number } {
  // Depnaker standard hourly rate = 1 / 173 * Gaji Pokok
  const hourlyBase = basicSalary / 173;
  let totalHours = 0;
  let totalPay = 0;

  for (const ot of approvedOvertimes) {
    totalHours += ot.durationHours;
    // Overtime multiplier: 1st hour = 1.5x, 2nd+ hour = 2.0x
    const compensation = Math.round(hourlyBase * ot.multiplierRate * ot.durationHours);
    totalPay += compensation;
  }

  return {
    totalOvertimeHours: totalHours,
    totalOvertimePay: totalPay,
  };
}

export function calculateEmployeePayroll({
  user,
  monthYear,
  paymentDate,
  attendanceList = [],
  overtimeList = [],
  customBonus = 0,
  customDeduction = 0,
}: {
  user: User;
  monthYear: string;
  paymentDate: string;
  attendanceList?: AttendanceRecord[];
  overtimeList?: OvertimeRequest[];
  customBonus?: number;
  customDeduction?: number;
}): PayrollRecord {
  const basic = user.salaryDetails.basicSalary;
  const allowPos = user.salaryDetails.allowancePosition || 0;
  const allowTrans = user.salaryDetails.allowanceTransport || 0;
  const allowMeal = user.salaryDetails.allowanceMeal || 0;
  const allowAtt = user.salaryDetails.allowanceAttendance || 0;

  // Filter attendance for this user
  const userAttendances = attendanceList.filter((a) => a.userId === user.id);
  const presentCount = userAttendances.filter((a) => a.status === 'Hadir').length;
  const lateCount = userAttendances.filter((a) => a.status === 'Terlambat').length;
  const lateMinutes = userAttendances.reduce((acc, a) => acc + (a.lateMinutes || 0), 0);

  // Late deduction formula: Rp 1,500 / late minute
  const lateDeduction = Math.min(allowAtt, lateMinutes * 1500);

  // Overtime Calculation
  const approvedUserOvertimes = overtimeList.filter(
    (ot) => ot.userId === user.id && ot.status === 'Disetujui'
  );
  const { totalOvertimeHours, totalOvertimePay } = calculateOvertimePay(
    basic,
    approvedUserOvertimes
  );

  // BPJS Calculations
  // BPJS Kesehatan: 1% employee (max wage cap Rp 12,000,000)
  const bpjsKesBasis = Math.min(basic, 12000000);
  const bpjsKesehatan = Math.round(bpjsKesBasis * (user.salaryDetails.bpjsKesehatanPercent / 100));

  // BPJS Ketenagakerjaan: 2% (JHT 2%, JP 1% employee max wage cap Rp 10,042,300)
  const bpjsKetenagakerjaan = Math.round(basic * (user.salaryDetails.bpjsKetenagakerjaanPercent / 100));

  // Total Gross Earnings
  const totalEarnings =
    basic +
    allowPos +
    allowTrans +
    allowMeal +
    allowAtt +
    totalOvertimePay +
    customBonus;

  // Tax PPh 21 estimate (5% standard tier)
  const taxableGross = Math.max(0, totalEarnings - (bpjsKesehatan + bpjsKetenagakerjaan));
  const pph21 = Math.round(taxableGross * (user.salaryDetails.pph21Percent / 100));

  const totalDeductions =
    bpjsKesehatan +
    bpjsKetenagakerjaan +
    pph21 +
    lateDeduction +
    customDeduction;

  const takeHomePay = totalEarnings - totalDeductions;

  return {
    id: `pyr-${monthYear.replace(/\s+/g, '')}-${user.id}`,
    userId: user.id,
    userName: user.name,
    userNip: user.nip,
    position: user.position,
    department: user.department,
    branchName: user.branchName || 'Head Office Jakarta',
    monthYear,
    periodStatus: 'Draft',
    paymentDate,
    bankName: user.salaryDetails.bankName,
    accountNumber: user.salaryDetails.accountNumber,
    bankInfo: {
      bankName: user.salaryDetails.bankName,
      accountNumber: user.salaryDetails.accountNumber,
      accountHolder: user.salaryDetails.accountHolder,
    },
    basicSalary: basic,
    allowancePosition: allowPos,
    allowanceTransport: allowTrans,
    allowanceMeal: allowMeal,
    allowanceAttendance: allowAtt,
    overtimePay: totalOvertimePay,
    bonus: customBonus,
    grossSalary: totalEarnings,
    deductionLate: lateDeduction,
    deductionUnpaidLeave: 0,
    bpjsKesehatanEmployee: bpjsKesehatan,
    bpjsKetenagakerjaanEmployee: bpjsKetenagakerjaan,
    taxPph21: pph21,
    totalDeductions,
    takeHomePay,
    paymentStatus: 'Draft',
    status: 'Diproses',
    generatedAt: new Date().toISOString().slice(0, 10),
    earnings: {
      basicSalary: basic,
      allowancePosition: allowPos,
      allowanceTransport: allowTrans,
      allowanceMeal: allowMeal,
      allowanceAttendance: allowAtt,
      overtimePay: totalOvertimePay,
      bonus: customBonus,
      commission: 0,
      totalEarnings,
    },
    deductions: {
      bpjsKesehatan,
      bpjsKetenagakerjaan,
      pph21,
      lateDeduction,
      unpaidLeaveDeduction: 0,
      otherDeductions: customDeduction,
      totalDeductions,
    },
    attendanceSummary: {
      presentDays: presentCount,
      lateCount,
      lateMinutes,
      absentDays: 0,
      leaveDays: user.leaveQuota.used,
      overtimeHours: totalOvertimeHours,
    },
  };
}

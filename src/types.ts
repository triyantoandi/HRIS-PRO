export type Role = 
  | 'super_admin' 
  | 'hr_admin' 
  | 'hr_staff' 
  | 'manager' 
  | 'supervisor' 
  | 'employee' 
  | 'finance' 
  | 'director';

export type EmploymentStatus = 'Tetap (Permanent)' | 'Kontrak (PKWT)' | 'Probation (Percobaan)' | 'Magang (Internship)';

export type AttendanceStatus = 'Hadir' | 'Terlambat' | 'Pulang Cepat' | 'Izin' | 'Sakit' | 'Alpha' | 'Dinas Luar' | 'Cuti';

export type WorkType = 'WFO (Kantor)' | 'WFH (Remote)' | 'Dinas Luar' | 'Hybrid';

export type LeaveType = 
  | 'Cuti Tahunan' 
  | 'Cuti Sakit' 
  | 'Cuti Melahirkan' 
  | 'Cuti Menikah' 
  | 'Cuti Berduka / Keluarga' 
  | 'Cuti Khusus / Izin' 
  | 'Unpaid Leave';

export type LeaveStatus = 'Menunggu' | 'Disetujui Supervisor' | 'Disetujui' | 'Ditolak' | 'Dibatalkan';

export type OvertimeStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';

export type CorrectionStatus = 'Menunggu Review' | 'Disetujui' | 'Ditolak';

export type PayrollPeriodStatus = 'Draft' | 'Dihitung' | 'Ditinjau' | 'Disetujui' | 'Dibayarkan' | 'Terkunci (Locked)';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radiusMeters: number; // e.g. 100 meters
  isHeadOffice?: boolean;
  phone?: string;
  timezone?: string;
  isActive?: boolean;
}

export interface Shift {
  id: string;
  name: string;
  code: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  breakStartTime: string;
  breakEndTime: string;
  gracePeriodMinutes: number; // e.g. 15 mins
  isCrossMidnight?: boolean;
  color: string;
}

export interface WorkSchedule {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  shiftId: string;
  shiftName: string;
  isDayOff: boolean;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  role: Role;
  avatar: string;
  position: string;
  department: string;
  division?: string;
  branchId: string;
  branchName: string;
  joinDate: string;
  contractEndDate?: string;
  employmentStatus: EmploymentStatus;
  gradeLevel?: string;
  managerId?: string;
  managerName?: string;
  supervisorId?: string;
  supervisorName?: string;
  nip: string; // Nomor Induk Pegawai
  phone: string;
  gender?: 'Laki-laki' | 'Perempuan';
  maritalStatus?: 'Belum Menikah' | 'Menikah' | 'Menikah + 1 Anak' | 'Menikah + 2 Anak' | 'Menikah + 3 Anak';
  address?: string;
  city?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  npwp?: string;
  bpjsKesehatanNo?: string;
  bpjsKetenagakerjaanNo?: string;
  leaveQuota: {
    total: number;
    used: number;
    remaining: number;
    sickUsed: number;
    specialUsed: number;
    carryForward: number;
  };
  salaryDetails: {
    basicSalary: number;
    allowancePosition: number;
    allowanceTransport: number;
    allowanceMeal: number;
    allowanceAttendance?: number;
    bpjsKesehatanPercent: number; // 1%
    bpjsKetenagakerjaanPercent: number; // 2%
    pph21Percent: number; // 5%
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  documents?: {
    id: string;
    name: string;
    type: 'KTP' | 'NPWP' | 'BPJS' | 'Kontrak Kerja' | 'Ijazah / Sertifikat' | 'Lainnya';
    uploadDate: string;
    url?: string;
    size?: string;
  }[];
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userNip: string;
  department: string;
  branchId: string;
  branchName: string;
  date: string; // YYYY-MM-DD
  shiftId?: string;
  shiftName?: string;
  clockInTime: string; // HH:mm:ss
  clockOutTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  status: AttendanceStatus;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workDurationHours?: number;
  notes?: string;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  distanceFromOfficeMeters?: number;
  isWithinGeofence?: boolean;
  photoUrl?: string;
  workType: WorkType;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface AttendanceCorrection {
  id: string;
  userId: string;
  userName: string;
  userNip: string;
  department: string;
  attendanceDate: string;
  requestedClockIn: string;
  requestedClockOut: string;
  actualClockIn?: string;
  actualClockOut?: string;
  reason: string;
  status: CorrectionStatus;
  appliedDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userNip: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
  attachmentName?: string;
  emergencyPhone?: string;
}

export interface OvertimeRequest {
  id: string;
  userId: string;
  userName: string;
  userNip: string;
  department: string;
  date: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  durationHours: number;
  multiplierRate: number; // e.g. 1.5x, 2.0x
  compensationAmount: number;
  taskDescription: string;
  status: OvertimeStatus;
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  reviewNotes?: string;
}

export interface PayrollRecord {
  id: string;
  userId: string;
  userName: string;
  userNip: string;
  position: string;
  department: string;
  branchName?: string;
  monthYear: string; // e.g., "Agustus 2026"
  periodStatus?: PayrollPeriodStatus;
  paymentDate?: string;
  bankName?: string;
  accountNumber?: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  basicSalary: number;
  allowancePosition: number;
  allowanceTransport: number;
  allowanceMeal: number;
  allowanceAttendance: number;
  overtimePay: number;
  bonus?: number;
  grossSalary: number;
  deductionLate: number;
  deductionUnpaidLeave?: number;
  bpjsKesehatanEmployee: number;
  bpjsKetenagakerjaanEmployee: number;
  taxPph21: number;
  totalDeductions: number;
  takeHomePay: number;
  paymentStatus?: 'Draft' | 'Approved' | 'Paid';
  status?: 'Dibayarkan' | 'Diproses' | 'Ditahan';
  generatedAt?: string;
  earnings?: {
    basicSalary: number;
    allowancePosition: number;
    allowanceTransport: number;
    allowanceMeal: number;
    allowanceAttendance: number;
    overtimePay: number;
    bonus: number;
    commission: number;
    totalEarnings: number;
  };
  deductions?: {
    bpjsKesehatan: number;
    bpjsKetenagakerjaan: number;
    pph21: number;
    lateDeduction: number;
    unpaidLeaveDeduction: number;
    otherDeductions: number;
    totalDeductions: number;
  };
  attendanceSummary?: {
    presentDays: number;
    lateCount: number;
    lateMinutes: number;
    absentDays: number;
    leaveDays: number;
    overtimeHours: number;
  };
}

export interface NotificationItem {
  id: string;
  targetUserId: string; // 'all' or specific userId
  targetRole?: Role;
  title: string;
  message: string;
  type: 'leave' | 'attendance' | 'overtime' | 'payroll' | 'system' | 'announcement' | 'info';
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
  actionUrlModule?: string;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  action: string;
  module: string;
  details?: string;
  recordId?: string;
  description?: string;
  timestamp: string;
  ipAddress?: string;
}

export type AuditLog = AuditLogItem;

export interface SystemSettings {
  companyName: string;
  legalName: string;
  companyNpwp: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  npwp?: string;
  workingDaysPerMonth: number; // 22 or 25
  defaultWorkingHours: string; // "08:00 - 17:00"
  lateToleranceMinutes: number; // 15 mins
  geofenceRadiusMeters: number; // 100m
  geofenceEnforced: boolean;
  overtimeHourlyRateMultiplier: number; // 1/173 standard depnaker
  taxCalculationMethod: 'TER (Tarif Efektif Rata-rata)' | 'PPh 21 Progresif Standar';
  enableSelfieVerification: boolean;
  annualLeaveDefaultQuota: number; // 12
  carryForwardMaxDays: number; // 6
  currency: string;
}

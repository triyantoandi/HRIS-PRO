import { Role, User } from '../types';

export type Permission =
  | 'employee.view'
  | 'employee.create'
  | 'employee.edit'
  | 'employee.delete'
  | 'attendance.view'
  | 'attendance.record'
  | 'attendance.approve_correction'
  | 'shift.manage'
  | 'leave.view'
  | 'leave.create'
  | 'leave.approve'
  | 'overtime.view'
  | 'overtime.create'
  | 'overtime.approve'
  | 'payroll.view'
  | 'payroll.calculate'
  | 'payroll.approve'
  | 'payroll.lock'
  | 'payroll.manage'
  | 'report.view'
  | 'report.export'
  | 'organization.manage'
  | 'audit.view'
  | 'settings.manage'
  | 'system.configure';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    'employee.view', 'employee.create', 'employee.edit', 'employee.delete',
    'attendance.view', 'attendance.record', 'attendance.approve_correction', 'shift.manage',
    'leave.view', 'leave.create', 'leave.approve',
    'overtime.view', 'overtime.create', 'overtime.approve',
    'payroll.view', 'payroll.calculate', 'payroll.approve', 'payroll.lock', 'payroll.manage',
    'report.view', 'report.export', 'organization.manage', 'audit.view', 'settings.manage', 'system.configure',
  ],
  hr_admin: [
    'employee.view', 'employee.create', 'employee.edit', 'employee.delete',
    'attendance.view', 'attendance.record', 'attendance.approve_correction', 'shift.manage',
    'leave.view', 'leave.create', 'leave.approve',
    'overtime.view', 'overtime.create', 'overtime.approve',
    'payroll.view', 'payroll.calculate', 'payroll.approve', 'payroll.lock', 'payroll.manage',
    'report.view', 'report.export', 'organization.manage', 'audit.view', 'settings.manage', 'system.configure',
  ],
  hr_staff: [
    'employee.view', 'employee.create', 'employee.edit',
    'attendance.view', 'attendance.record', 'attendance.approve_correction', 'shift.manage',
    'leave.view', 'leave.create', 'leave.approve',
    'overtime.view', 'overtime.create', 'overtime.approve',
    'payroll.view', 'payroll.manage',
    'report.view', 'report.export', 'organization.manage', 'audit.view',
  ],
  manager: [
    'employee.view',
    'attendance.view', 'attendance.record', 'attendance.approve_correction',
    'leave.view', 'leave.create', 'leave.approve',
    'overtime.view', 'overtime.create', 'overtime.approve',
    'report.view',
  ],
  supervisor: [
    'employee.view',
    'attendance.view', 'attendance.record', 'attendance.approve_correction',
    'leave.view', 'leave.create', 'leave.approve',
    'overtime.view', 'overtime.create', 'overtime.approve',
  ],
  employee: [
    'attendance.record',
    'leave.create',
    'overtime.create',
  ],
  finance: [
    'employee.view',
    'attendance.view',
    'payroll.view', 'payroll.calculate', 'payroll.approve', 'payroll.lock', 'payroll.manage',
    'report.view', 'report.export',
  ],
  director: [
    'employee.view',
    'attendance.view',
    'leave.view',
    'overtime.view',
    'payroll.view',
    'report.view', 'report.export', 'audit.view',
  ],
};

export const hasPermission = (user: User | null | undefined, permission: Permission): boolean => {
  if (!user) return false;
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
};

export const getRoleDisplayName = (role: Role): string => {
  switch (role) {
    case 'super_admin': return 'Super Administrator';
    case 'hr_admin': return 'HR Administrator / Head of HR';
    case 'hr_staff': return 'HR Generalist / Staff';
    case 'manager': return 'Department Manager';
    case 'supervisor': return 'Team Supervisor';
    case 'employee': return 'Karyawan / Employee';
    case 'finance': return 'Finance & Payroll Officer';
    case 'director': return 'Board of Directors / Executive';
    default: return role;
  }
};

export const isHROrAdmin = (role: Role): boolean => {
  return role === 'super_admin' || role === 'hr_admin' || role === 'hr_staff';
};

export const isManagerOrSupervisor = (role: Role): boolean => {
  return role === 'manager' || role === 'supervisor' || role === 'super_admin' || role === 'hr_admin';
};

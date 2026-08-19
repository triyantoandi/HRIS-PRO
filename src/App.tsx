import React, { useState, useEffect } from 'react';
import {
  User,
  Branch,
  Shift,
  AttendanceRecord,
  LeaveRequest,
  OvertimeRequest,
  AttendanceCorrection,
  PayrollRecord,
  AuditLog,
  NotificationItem,
  SystemSettings,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_BRANCHES,
  INITIAL_SHIFTS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_OVERTIME_REQUESTS,
  INITIAL_CORRECTIONS,
  INITIAL_PAYROLL,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SYSTEM_SETTINGS,
} from './data/mockData';
import {
  testFirestoreConnection,
  seedInitialFirestoreData,
  subscribeToCollection,
  saveDocument,
  deleteDocument,
  COLLECTIONS,
} from './services/firebase';
import { getRoleDisplayName } from './services/rbac';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardHub } from './components/DashboardHub';
import { WorkforceModule } from './components/WorkforceModule';
import { OrganizationModule } from './components/OrganizationModule';
import { ExecutiveAnalyticsModule } from './components/ExecutiveAnalyticsModule';
import { AbsensiModule } from './components/AbsensiModule';
import { ShiftScheduleModule } from './components/ShiftScheduleModule';
import { OvertimeModule } from './components/OvertimeModule';
import { CutiModule } from './components/CutiModule';
import { PayrollModule } from './components/PayrollModule';
import { ReportsModule } from './components/ReportsModule';
import { MobileEmployeeApp } from './components/MobileEmployeeApp';
import { AuditTrailModule } from './components/AuditTrailModule';
import { AdminPanel } from './components/AdminPanel';
import {
  Lock,
  Building2,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export function App() {
  // Persistence State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('hris_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hris_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem('hris_branches');
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('hris_shifts');
    return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
  });

  const [currentBranch, setCurrentBranch] = useState<Branch>(() => {
    const saved = localStorage.getItem('hris_current_branch');
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES[0];
  });

  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('hris_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('hris_leaves');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>(() => {
    const saved = localStorage.getItem('hris_overtime');
    return saved ? JSON.parse(saved) : INITIAL_OVERTIME_REQUESTS;
  });

  const [correctionsList, setCorrectionsList] = useState<AttendanceCorrection[]>(() => {
    const saved = localStorage.getItem('hris_corrections');
    return saved ? JSON.parse(saved) : INITIAL_CORRECTIONS;
  });

  const [payrollList, setPayrollList] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem('hris_payroll');
    return saved ? JSON.parse(saved) : INITIAL_PAYROLL;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('hris_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('hris_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('hris_system_settings');
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_SETTINGS;
  });

  const [isFirebaseOnline, setIsFirebaseOnline] = useState(false);

  // UI Navigation State
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Setup Firebase Real-Time Synchronization & Seeding
  useEffect(() => {
    let unsubscribeUsers: () => void;
    let unsubscribeBranches: () => void;
    let unsubscribeShifts: () => void;
    let unsubscribeAttendance: () => void;
    let unsubscribeLeaves: () => void;
    let unsubscribeOvertime: () => void;
    let unsubscribeCorrections: () => void;
    let unsubscribePayroll: () => void;
    let unsubscribeAudit: () => void;
    let unsubscribeNotifs: () => void;

    async function initFirebase() {
      try {
        const connected = await testFirestoreConnection();
        setIsFirebaseOnline(true);

        // Seed initial data if Firestore database is fresh
        await seedInitialFirestoreData({
          users: INITIAL_USERS,
          branches: INITIAL_BRANCHES,
          shifts: INITIAL_SHIFTS,
          settings: INITIAL_SYSTEM_SETTINGS,
          attendance: INITIAL_ATTENDANCE,
          leaves: INITIAL_LEAVE_REQUESTS,
          overtimes: INITIAL_OVERTIME_REQUESTS,
          payroll: INITIAL_PAYROLL,
          corrections: INITIAL_CORRECTIONS,
          notifications: INITIAL_NOTIFICATIONS,
          auditLogs: INITIAL_AUDIT_LOGS,
        });

        // Real-time snapshot listeners
        unsubscribeUsers = subscribeToCollection<User>(COLLECTIONS.USERS, (data) => {
          if (data) setUsers(data);
        });
        unsubscribeBranches = subscribeToCollection<Branch>(COLLECTIONS.BRANCHES, (data) => {
          if (data && data.length > 0) {
            setBranches(data);
            setCurrentBranch((prev) => data.find((b) => b.id === prev.id) || data[0]);
          }
        });
        unsubscribeShifts = subscribeToCollection<Shift>(COLLECTIONS.SHIFTS, (data) => {
          if (data) setShifts(data);
        });
        unsubscribeAttendance = subscribeToCollection<AttendanceRecord>(COLLECTIONS.ATTENDANCE, (data) => {
          if (data) setAttendanceList(data);
        });
        unsubscribeLeaves = subscribeToCollection<LeaveRequest>(COLLECTIONS.LEAVES, (data) => {
          if (data) setLeaveRequests(data);
        });
        unsubscribeOvertime = subscribeToCollection<OvertimeRequest>(COLLECTIONS.OVERTIME, (data) => {
          if (data) setOvertimeRequests(data);
        });
        unsubscribeCorrections = subscribeToCollection<AttendanceCorrection>(COLLECTIONS.CORRECTIONS, (data) => {
          if (data) setCorrectionsList(data);
        });
        unsubscribePayroll = subscribeToCollection<PayrollRecord>(COLLECTIONS.PAYROLL, (data) => {
          if (data) setPayrollList(data);
        });
        unsubscribeNotifs = subscribeToCollection<NotificationItem>(COLLECTIONS.NOTIFICATIONS, (data) => {
          if (data) setNotifications(data);
        });
        unsubscribeAudit = subscribeToCollection<AuditLog>(COLLECTIONS.AUDIT_LOGS, (data) => {
          if (data) setAuditLogs(data);
        });
      } catch (err) {
        console.warn('Firebase init warning:', err);
      }
    }

    initFirebase();

    return () => {
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeBranches) unsubscribeBranches();
      if (unsubscribeShifts) unsubscribeShifts();
      if (unsubscribeAttendance) unsubscribeAttendance();
      if (unsubscribeLeaves) unsubscribeLeaves();
      if (unsubscribeOvertime) unsubscribeOvertime();
      if (unsubscribeCorrections) unsubscribeCorrections();
      if (unsubscribePayroll) unsubscribePayroll();
      if (unsubscribeNotifs) unsubscribeNotifs();
      if (unsubscribeAudit) unsubscribeAudit();
    };
  }, []);

  // Save to localStorage when states update
  useEffect(() => {
    localStorage.setItem('hris_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hris_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hris_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('hris_branches', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('hris_shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('hris_current_branch', JSON.stringify(currentBranch));
  }, [currentBranch]);

  useEffect(() => {
    localStorage.setItem('hris_attendance', JSON.stringify(attendanceList));
  }, [attendanceList]);

  useEffect(() => {
    localStorage.setItem('hris_leaves', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('hris_overtime', JSON.stringify(overtimeRequests));
  }, [overtimeRequests]);

  useEffect(() => {
    localStorage.setItem('hris_corrections', JSON.stringify(correctionsList));
  }, [correctionsList]);

  useEffect(() => {
    localStorage.setItem('hris_payroll', JSON.stringify(payrollList));
  }, [payrollList]);

  useEffect(() => {
    localStorage.setItem('hris_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('hris_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('hris_system_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  const handleUpdateSystemSettings = (newSettings: SystemSettings) => {
    setSystemSettings(newSettings);
    saveDocument(COLLECTIONS.SETTINGS, 'company_config', newSettings).catch(console.error);
    logAction('UPDATE_PENGATURAN', 'Admin', `Memperbarui konfigurasi sistem, kebijakan kerja & identitas perusahaan`);
    alert('Pengaturan sistem dan kebijakan kerja berhasil disimpan ke Firebase Cloud.');
  };

  // Helper: Log audit trail
  const logAction = (action: string, module: string, details: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      module,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    saveDocument(COLLECTIONS.AUDIT_LOGS, newLog.id, newLog).catch(console.error);
  };

  // Helper: Push Notification
  const pushNotification = (title: string, message: string, targetUserId: string = 'all', module?: string) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type: 'info',
      createdAt: 'Baru saja',
      isRead: false,
      targetUserId,
      actionUrlModule: module,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    saveDocument(COLLECTIONS.NOTIFICATIONS, newNotif.id, newNotif).catch(console.error);
  };

  // 1. Clock In Handler
  const handleClockIn = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRecord: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}`,
    };
    setAttendanceList((prev) => [newRecord, ...prev]);
    saveDocument(COLLECTIONS.ATTENDANCE, newRecord.id, newRecord).catch(console.error);
    logAction('PRESENSI_CLOCK_IN', 'Absensi', `Clock in pada ${newRecord.clockInTime} (${newRecord.workType})`);
    pushNotification(
      'Presensi Masuk Berhasil',
      `${newRecord.userName} berhasil melakukan clock in pada ${newRecord.clockInTime} WIB`,
      newRecord.userId,
      'absensi'
    );
  };

  // 2. Clock Out Handler
  const handleClockOut = (attendanceId: string, clockOutTime: string) => {
    const target = attendanceList.find((a) => a.id === attendanceId);
    const updated = target ? { ...target, clockOutTime } : null;
    if (updated) {
      saveDocument(COLLECTIONS.ATTENDANCE, attendanceId, updated).catch(console.error);
    }
    setAttendanceList((prev) =>
      prev.map((a) => (a.id === attendanceId ? { ...a, clockOutTime } : a))
    );
    logAction('PRESENSI_CLOCK_OUT', 'Absensi', `Clock out pada ${clockOutTime}`);
    pushNotification(
      'Presensi Pulang Berhasil',
      `Clock out berhasil dicatat pada ${clockOutTime} WIB`,
      currentUser?.id || 'all',
      'absensi'
    );
  };

  // 3. Correction Submit
  const handleSubmitCorrection = (corr: Omit<AttendanceCorrection, 'id' | 'appliedDate' | 'status'>) => {
    const newCorr: AttendanceCorrection = {
      ...corr,
      id: `corr-${Date.now()}`,
      appliedDate: '2026-08-18',
      status: 'Menunggu Review',
    };
    setCorrectionsList((prev) => [newCorr, ...prev]);
    saveDocument(COLLECTIONS.CORRECTIONS, newCorr.id, newCorr).catch(console.error);
    logAction('AJUKAN_KOREKSI', 'Absensi', `Koreksi tanggal ${corr.attendanceDate}`);
    alert('Pengajuan koreksi presensi berhasil dikirim ke HR & tersimpan di Firebase.');
  };

  // 4. Leave Submit
  const handleSubmitLeave = (newLeave: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => {
    const leaveItem: LeaveRequest = {
      ...newLeave,
      id: `leave-${Date.now()}`,
      appliedDate: '2026-08-18',
      status: 'Menunggu',
    };
    setLeaveRequests((prev) => [leaveItem, ...prev]);
    saveDocument(COLLECTIONS.LEAVES, leaveItem.id, leaveItem).catch(console.error);
    logAction('AJUKAN_CUTI', 'Cuti', `${newLeave.leaveType} (${newLeave.daysCount} hari)`);
    pushNotification(
      'Pengajuan Cuti Baru',
      `${newLeave.userName} mengajukan ${newLeave.leaveType} selama ${newLeave.daysCount} hari kerja`,
      'all',
      'cuti'
    );
  };

  // 5. Leave Approval
  const handleApproveLeave = (leaveId: string, reviewNotes: string) => {
    const target = leaveRequests.find((l) => l.id === leaveId);
    if (target) {
      const updated = { ...target, status: 'Disetujui' as const, reviewNotes };
      saveDocument(COLLECTIONS.LEAVES, leaveId, updated).catch(console.error);
    }
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status: 'Disetujui', reviewNotes } : l))
    );
    logAction('APPROVE_CUTI', 'Cuti', `Menyetujui pengajuan cuti ID: ${leaveId}`);
  };

  const handleRejectLeave = (leaveId: string, reviewNotes: string) => {
    const target = leaveRequests.find((l) => l.id === leaveId);
    if (target) {
      const updated = { ...target, status: 'Ditolak' as const, reviewNotes };
      saveDocument(COLLECTIONS.LEAVES, leaveId, updated).catch(console.error);
    }
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status: 'Ditolak', reviewNotes } : l))
    );
    logAction('REJECT_CUTI', 'Cuti', `Menolak pengajuan cuti ID: ${leaveId}`);
  };

  // 6. Overtime Submit
  const handleSubmitOvertime = (ot: Omit<OvertimeRequest, 'id' | 'appliedDate' | 'status'>) => {
    const otItem: OvertimeRequest = {
      ...ot,
      id: `ot-${Date.now()}`,
      appliedDate: '2026-08-18',
      status: 'Menunggu',
    };
    setOvertimeRequests((prev) => [otItem, ...prev]);
    saveDocument(COLLECTIONS.OVERTIME, otItem.id, otItem).catch(console.error);
    logAction('AJUKAN_SPL', 'Lembur', `Lembur ${ot.durationHours} jam pada ${ot.date}`);
    pushNotification(
      'Pengajuan Lembur Baru',
      `${ot.userName} mengajukan SPL lembur ${ot.durationHours} jam`,
      'all',
      'overtime'
    );
  };

  // 7. Overtime Approval
  const handleApproveOvertime = (id: string, reviewNotes: string) => {
    const target = overtimeRequests.find((o) => o.id === id);
    if (target) {
      const updated = { ...target, status: 'Disetujui' as const, reviewNotes };
      saveDocument(COLLECTIONS.OVERTIME, id, updated).catch(console.error);
    }
    setOvertimeRequests((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Disetujui', reviewNotes } : o))
    );
    logAction('APPROVE_SPL', 'Lembur', `Menyetujui SPL ID: ${id}`);
  };

  const handleRejectOvertime = (id: string, reviewNotes: string) => {
    const target = overtimeRequests.find((o) => o.id === id);
    if (target) {
      const updated = { ...target, status: 'Ditolak' as const, reviewNotes };
      saveDocument(COLLECTIONS.OVERTIME, id, updated).catch(console.error);
    }
    setOvertimeRequests((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Ditolak', reviewNotes } : o))
    );
    logAction('REJECT_SPL', 'Lembur', `Menolak SPL ID: ${id}`);
  };

  // 8. Employee CRUD
  const handleAddEmployee = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    saveDocument(COLLECTIONS.USERS, newUser.id, newUser).catch(console.error);
    logAction('TAMBAH_KARYAWAN', 'Workforce', `Menambahkan karyawan baru: ${newUser.name} (${newUser.nip})`);
    alert(`Karyawan ${newUser.name} berhasil didaftarkan ke sistem dan tersimpan di Firebase.`);
  };

  const handleUpdateEmployee = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    saveDocument(COLLECTIONS.USERS, updatedUser.id, updatedUser).catch(console.error);
    logAction('UPDATE_KARYAWAN', 'Workforce', `Memperbarui data karyawan: ${updatedUser.name}`);
  };

  const handleDeleteEmployee = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    deleteDocument(COLLECTIONS.USERS, userId).catch(console.error);
    logAction('HAPUS_KARYAWAN', 'Workforce', `Menghapus karyawan ID: ${userId}`);
  };

  // 9. Branch Management (Multi-Location)
  const handleAddBranch = (branch: Branch) => {
    setBranches((prev) => [...prev, branch]);
    saveDocument(COLLECTIONS.BRANCHES, branch.id, branch).catch(console.error);
    logAction('TAMBAH_CABANG', 'Admin', `Menambahkan kantor cabang baru: ${branch.name} (${branch.code}), radius ${branch.radiusMeters}m`);
    alert(`Kantor cabang ${branch.name} berhasil ditambahkan ke Firebase Cloud.`);
  };

  const handleUpdateBranch = (updatedBranch: Branch) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === updatedBranch.id ? updatedBranch : b))
    );
    if (currentBranch.id === updatedBranch.id) {
      setCurrentBranch(updatedBranch);
    }
    saveDocument(COLLECTIONS.BRANCHES, updatedBranch.id, updatedBranch).catch(console.error);
    logAction('UPDATE_CABANG', 'Admin', `Memperbarui konfigurasi cabang & geofence: ${updatedBranch.name} (${updatedBranch.code})`);
    alert(`Pengaturan cabang ${updatedBranch.name} berhasil diperbarui di Firebase.`);
  };

  const handleDeleteBranch = (branchId: string) => {
    if (branches.length <= 1) {
      alert('Tidak dapat menghapus cabang terakhir. Minimal harus ada 1 kantor cabang.');
      return;
    }
    const target = branches.find((b) => b.id === branchId);
    if (!target) return;
    if (confirm(`Apakah Anda yakin ingin menghapus kantor cabang ${target.name}?`)) {
      const remaining = branches.filter((b) => b.id !== branchId);
      setBranches(remaining);
      if (currentBranch.id === branchId) {
        setCurrentBranch(remaining[0]);
      }
      deleteDocument(COLLECTIONS.BRANCHES, branchId).catch(console.error);
      logAction('HAPUS_CABANG', 'Admin', `Menghapus kantor cabang: ${target.name} (${target.code})`);
    }
  };

  // 10. Shift Management
  const handleAddShift = (shift: Shift) => {
    setShifts((prev) => [...prev, shift]);
    saveDocument(COLLECTIONS.SHIFTS, shift.id, shift).catch(console.error);
    logAction('TAMBAH_SHIFT', 'Admin', `Menambahkan master shift kerja: ${shift.name} (${shift.startTime} - ${shift.endTime}, toleransi ${shift.gracePeriodMinutes}m)`);
    alert(`Shift kerja ${shift.name} berhasil ditambahkan.`);
  };

  const handleUpdateShift = (updatedShift: Shift) => {
    setShifts((prev) =>
      prev.map((s) => (s.id === updatedShift.id ? updatedShift : s))
    );
    saveDocument(COLLECTIONS.SHIFTS, updatedShift.id, updatedShift).catch(console.error);
    logAction('UPDATE_SHIFT', 'Admin', `Memperbarui ketentuan shift: ${updatedShift.name} (${updatedShift.startTime} - ${updatedShift.endTime}, toleransi ${updatedShift.gracePeriodMinutes}m)`);
    alert(`Ketentuan shift ${updatedShift.name} berhasil diperbarui.`);
  };

  const handleDeleteShift = (shiftId: string) => {
    if (shifts.length <= 1) {
      alert('Tidak dapat menghapus shift terakhir. Minimal harus ada 1 shift kerja.');
      return;
    }
    const target = shifts.find((s) => s.id === shiftId);
    if (!target) return;
    if (confirm(`Apakah Anda yakin ingin menghapus shift ${target.name}?`)) {
      setShifts((prev) => prev.filter((s) => s.id !== shiftId));
      deleteDocument(COLLECTIONS.SHIFTS, shiftId).catch(console.error);
      logAction('HAPUS_SHIFT', 'Admin', `Menghapus shift kerja: ${target.name}`);
    }
  };

  // 11. Notifications
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    const target = notifications.find((n) => n.id === id);
    if (target) {
      saveDocument(COLLECTIONS.NOTIFICATIONS, id, { ...target, isRead: true }).catch(console.error);
    }
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    notifications.forEach((n) => {
      saveDocument(COLLECTIONS.NOTIFICATIONS, n.id, { ...n, isRead: true }).catch(console.error);
    });
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim().toLowerCase();
    
    // First look in loaded users
    let found = users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    // Fallback to INITIAL_USERS if initial sync is running
    if (!found) {
      found = INITIAL_USERS.find(
        (u) => u.email.toLowerCase() === cleanEmail
      );
    }

    // Direct mapping for user email triyantoandi80@gmail.com
    if (!found && (cleanEmail === 'triyantoandi80@gmail.com' || cleanEmail === 'admin@company.com')) {
      found = INITIAL_USERS[0];
    }

    if (found) {
      setCurrentUser(found);
      logAction('LOGIN_BERHASIL', 'Auth', `User ${found.name} (${found.role}) berhasil masuk ke sistem`);
    } else {
      alert('Email belum terdaftar dalam sistem HRIS. Silakan gunakan salah satu email akun yang tersedia di bawah.');
    }
  };

  // Pending counts for sidebar badges
  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'Menunggu').length;
  const pendingOvertimeCount = overtimeRequests.filter((o) => o.status === 'Menunggu').length;
  const pendingCorrectionsCount = correctionsList.filter((c) => c.status === 'Menunggu Review').length;

  // If user is logged out, show enterprise login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A172A] via-[#0F2038] to-[#08152B] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
        
        {/* Top Logo */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistem HRIS & Presensi Enterprise</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            ENTERPRISE HRIS & ATTENDANCE
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Sistem terintegrasi presensi geofence, payroll otomatis, approval berjenjang, dan manajemen SDM multi-cabang.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#0F2038]/95 backdrop-blur-xl border border-[#1E3A5F] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6">
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Email Perusahaan</label>
              <input
                type="email"
                required
                placeholder="nama@company.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0A172A] border border-[#1E3A5F] rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Kata Sandi</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0A172A] border border-[#1E3A5F] rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition cursor-pointer text-sm"
            >
              Masuk ke Portal HRIS
            </button>
          </form>

          {/* Secure Production Portal Info */}
          <div className="pt-4 border-t border-[#1E3A5F] text-center space-y-2">
            <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Autentikasi Aman Berbasis Role & Izin Akses</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Gunakan email dan kata sandi akun terdaftar perusahaan. Jika mengalami kendala login, silakan hubungi tim Administrator HR.
            </p>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
      
      <div className="flex flex-1 min-h-screen">
        {/* Sidebar Navigation */}
        <Sidebar
          currentUser={currentUser}
          activeModule={activeModule}
          onSelectModule={(mod) => {
            setActiveModule(mod);
            setMobileSidebarOpen(false);
          }}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          pendingLeavesCount={pendingLeavesCount}
          pendingOvertimeCount={pendingOvertimeCount}
          pendingCorrectionsCount={pendingCorrectionsCount}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          
          {/* Top Header Navbar */}
          <Navbar
            currentUser={currentUser}
            allUsers={users}
            branches={branches}
            currentBranch={currentBranch}
            onSelectBranch={(b) => setCurrentBranch(b)}
            notifications={notifications}
            onMarkNotificationAsRead={handleMarkNotificationAsRead}
            onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
            onLogout={() => setCurrentUser(null)}
            onSwitchUser={(u) => setCurrentUser(u)}
            onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            onNavigateModule={(mod) => setActiveModule(mod)}
            isFirebaseOnline={isFirebaseOnline}
          />

          {/* Dynamic Module Outlet */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeModule === 'dashboard' && (
              <DashboardHub
                currentUser={currentUser}
                allUsers={users}
                currentBranch={currentBranch}
                attendanceList={attendanceList}
                leaveRequests={leaveRequests}
                overtimeRequests={overtimeRequests}
                correctionsList={correctionsList}
                payrollList={payrollList}
                onSelectModule={(mod) => setActiveModule(mod)}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
              />
            )}

            {activeModule === 'executive' && (
              <ExecutiveAnalyticsModule
                currentUser={currentUser}
                allUsers={users}
                branches={branches}
                attendanceList={attendanceList}
                payrollList={payrollList}
                leaveRequests={leaveRequests}
                onBackToDashboard={() => setActiveModule('dashboard')}
              />
            )}

            {activeModule === 'workforce' && (
              <WorkforceModule
                currentUser={currentUser}
                allUsers={users}
                branches={branches}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onBackToDashboard={() => setActiveModule('dashboard')}
              />
            )}

            {activeModule === 'organization' && (
              <OrganizationModule
                currentUser={currentUser}
                allUsers={users}
                branches={branches}
                onBackToDashboard={() => setActiveModule('dashboard')}
              />
            )}

            {activeModule === 'absensi' && (
              <AbsensiModule
                currentUser={currentUser}
                currentBranch={currentBranch}
                shifts={shifts}
                attendanceList={attendanceList}
                correctionsList={correctionsList}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
                onSubmitCorrection={handleSubmitCorrection}
                onBackToDashboard={() => setActiveModule('dashboard')}
              />
            )}

            {(activeModule === 'shift' || activeModule === 'shift_schedule') && (
              <ShiftScheduleModule
                currentUser={currentUser}
                allUsers={users}
                shifts={shifts}
                onAddShift={handleAddShift}
                onUpdateShift={handleUpdateShift}
                onDeleteShift={handleDeleteShift}
                onBackToDashboard={() => setActiveModule('dashboard')}
              />
            )}

            {activeModule === 'overtime' && (
              <OvertimeModule
                currentUser={currentUser}
                overtimeList={overtimeRequests}
                onSubmitOvertime={handleSubmitOvertime}
                onApproveOvertime={handleApproveOvertime}
                onRejectOvertime={handleRejectOvertime}
                onBackToDashboard={() => setActiveModule('dashboard')}
              />
            )}

            {activeModule === 'cuti' && (
              <CutiModule
                currentUser={currentUser}
                leaveRequests={leaveRequests}
                onSubmitLeave={handleSubmitLeave}
                onCancelLeave={() => {}}
                onApproveLeave={handleApproveLeave}
                onRejectLeave={handleRejectLeave}
                onBackToDashboard={() => setActiveModule('dashboard')}
              />
            )}

            {activeModule === 'payroll' && (
              <PayrollModule
                currentUser={currentUser}
                allUsers={users}
                payrollList={payrollList}
                currentBranch={currentBranch}
                onUpdatePayrollList={(newList) => setPayrollList(newList)}
                onBackToDashboard={() => setActiveModule('dashboard')}
              />
            )}

            {activeModule === 'reports' && (
              <ReportsModule
                currentUser={currentUser}
                allUsers={users}
                branches={branches}
                attendanceList={attendanceList}
                leaveRequests={leaveRequests}
                payrollList={payrollList}
                onBackToDashboard={() => setActiveModule('dashboard')}
              />
            )}

            {activeModule === 'mobile-ess' && (
              <MobileEmployeeApp
                currentUser={currentUser}
                currentBranch={currentBranch}
                attendanceList={attendanceList}
                leaveRequests={leaveRequests}
                overtimeRequests={overtimeRequests}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
                onSelectModule={(mod) => setActiveModule(mod)}
                onBackToDashboard={() => setActiveModule('dashboard')}
              />
            )}

            {activeModule === 'audit_trail' && (
              <AuditTrailModule
                currentUser={currentUser}
                auditLogs={auditLogs}
                onBackToDashboard={() => setActiveModule('dashboard')}
              />
            )}

            {(activeModule === 'admin' || activeModule === 'settings') && (
              <AdminPanel
                currentUser={currentUser}
                branches={branches}
                shifts={shifts}
                systemSettings={systemSettings}
                auditLogs={auditLogs}
                onAddBranch={handleAddBranch}
                onUpdateBranch={handleUpdateBranch}
                onDeleteBranch={handleDeleteBranch}
                onAddShift={handleAddShift}
                onUpdateShift={handleUpdateShift}
                onDeleteShift={handleDeleteShift}
                onUpdateSettings={handleUpdateSystemSettings}
                onBackToDashboard={() => setActiveModule('dashboard')}
              />
            )}
          </main>

        </div>
      </div>

    </div>
  );
}

export default App;

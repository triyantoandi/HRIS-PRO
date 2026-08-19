import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  CalendarCheck, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  ArrowLeft, 
  Download, 
  DollarSign, 
  Trash2, 
  Edit3, 
  Building2, 
  Clock, 
  Check, 
  X,
  AlertCircle,
  Eye,
  Filter
} from 'lucide-react';
import { User, LeaveRequest, AttendanceRecord, PayrollRecord } from '../types';
import { DEPARTMENTS, formatRupiah, formatIndonesianDate } from '../data/mockData';
import { SlipGajiModal } from './SlipGajiModal';

interface AdminModuleProps {
  currentUser: User;
  allUsers: User[];
  leaveRequests: LeaveRequest[];
  attendanceList: AttendanceRecord[];
  payrollList: PayrollRecord[];
  onApproveLeave: (leaveId: string, reviewNotes: string) => void;
  onRejectLeave: (leaveId: string, reviewNotes: string) => void;
  onAddEmployee: (newEmployee: User) => void;
  onDeleteEmployee: (userId: string) => void;
  onGeneratePayrollBatch: (monthYear: string, paymentDate: string) => void;
  onBackToDashboard: () => void;
}

export const AdminModule: React.FC<AdminModuleProps> = ({
  currentUser,
  allUsers,
  leaveRequests,
  attendanceList,
  payrollList,
  onApproveLeave,
  onRejectLeave,
  onAddEmployee,
  onDeleteEmployee,
  onGeneratePayrollBatch,
  onBackToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'employees' | 'attendance' | 'payroll'>('approvals');
  
  // Review Note Modal state
  const [reviewingLeave, setReviewingLeave] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotesInput, setReviewNotesInput] = useState<string>('');
  
  // Add Employee Form Modal state
  const [showAddEmpModal, setShowAddEmpModal] = useState<boolean>(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpNip, setNewEmpNip] = useState('');
  const [newEmpDept, setNewEmpDept] = useState(DEPARTMENTS[1]);
  const [newEmpPos, setNewEmpPos] = useState('Junior Developer');
  const [newEmpSalary, setNewEmpSalary] = useState(8000000);
  const [newEmpBank, setNewEmpBank] = useState('BCA (Bank Central Asia)');
  const [newEmpAccNum, setNewEmpAccNum] = useState('8820-9988-7766');

  // Search & Filter states
  const [empSearch, setEmpSearch] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState('all');
  const [attDateFilter, setAttDateFilter] = useState('2026-08-18');
  
  // Payroll Batch Modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchMonth, setBatchMonth] = useState('Agustus 2026');
  const [batchDate, setBatchDate] = useState('2026-08-28');
  
  // View single slip
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Stats calculations
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'Menunggu');
  
  const handleOpenReview = (leave: LeaveRequest, action: 'approve' | 'reject') => {
    setReviewingLeave(leave);
    setReviewAction(action);
    setReviewNotesInput(
      action === 'approve' 
        ? 'Disetujui. Kuota cuti telah disesuaikan secara otomatis.' 
        : 'Mohon maaf permohonan belum dapat disetujui karena jadwal tim yang padat.'
    );
  };

  const handleConfirmReview = () => {
    if (!reviewingLeave) return;
    if (reviewAction === 'approve') {
      onApproveLeave(reviewingLeave.id, reviewNotesInput);
      setToastMsg(`Pengajuan cuti atas nama ${reviewingLeave.userName} berhasil DISETUJUI.`);
    } else {
      onRejectLeave(reviewingLeave.id, reviewNotesInput);
      setToastMsg(`Pengajuan cuti atas nama ${reviewingLeave.userName} telah DITOLAK.`);
    }
    setReviewingLeave(null);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleAddEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpEmail || !newEmpNip) return;

    const newEmp: User = {
      id: `usr-emp-${Date.now()}`,
      email: newEmpEmail,
      name: newEmpName,
      role: 'employee',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      position: newEmpPos,
      department: newEmpDept,
      branchId: 'br-jkt-hq',
      branchName: 'Head Office SCBD Jakarta',
      employmentStatus: 'Tetap (Permanent)',
      joinDate: new Date().toISOString().split('T')[0],
      nip: newEmpNip,
      phone: '+62 812-9988-0000',
      leaveQuota: {
        total: 12,
        used: 0,
        remaining: 12,
        sickUsed: 0,
        specialUsed: 0,
        carryForward: 0,
      },
      salaryDetails: {
        basicSalary: Number(newEmpSalary),
        allowancePosition: 1000000,
        allowanceTransport: 800000,
        allowanceMeal: 650000,
        bpjsKesehatanPercent: 1,
        bpjsKetenagakerjaanPercent: 2,
        pph21Percent: 5,
        bankName: newEmpBank,
        accountNumber: newEmpAccNum,
        accountHolder: newEmpName.toUpperCase(),
      },
    };

    onAddEmployee(newEmp);
    setShowAddEmpModal(false);
    setToastMsg(`Karyawan baru "${newEmpName}" berhasil didaftarkan ke sistem.`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Tanggal', 'NIP', 'Nama Karyawan', 'Departemen', 'Jam Masuk', 'Jam Pulang', 'Status', 'Metode Kerja', 'Lokasi/Catatan'].join(','),
      ...attendanceList.map((a) => [
        `"${a.date}"`,
        `"${a.userNip}"`,
        `"${a.userName}"`,
        `"${a.department}"`,
        `"${a.clockInTime}"`,
        `"${a.clockOutTime || '-'}"`,
        `"${a.status}"`,
        `"${a.workType}"`,
        `"${a.notes || a.location || ''}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Presensi_HRIS_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered employees
  const filteredEmployees = allUsers.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(empSearch.toLowerCase()) || 
                          u.nip.toLowerCase().includes(empSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(empSearch.toLowerCase());
    const matchesDept = empDeptFilter === 'all' || u.department === empDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div id="adminModuleContainer" className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-purple-600 mb-2 cursor-pointer transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard Utama
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Panel Administrasi HR
              </h1>
              <p className="text-sm text-slate-500">
                Pusat kendali persetujuan cuti, database karyawan, rekap kehadiran, dan penggajian
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingLeaves.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold animate-pulse">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>{pendingLeaves.length} Cuti Butuh Persetujuan</span>
            </span>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3 shadow-md animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          id="adminTabApprovals"
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'approvals'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Persetujuan Cuti</span>
          {pendingLeaves.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'approvals' ? 'bg-white text-purple-700' : 'bg-purple-600 text-white'
            }`}>
              {pendingLeaves.length}
            </span>
          )}
        </button>

        <button
          id="adminTabEmployees"
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'employees'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen Karyawan</span>
          <span className="text-[10px] opacity-75">({allUsers.length})</span>
        </button>

        <button
          id="adminTabAttendance"
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Rekap Absensi Seluruh Staff</span>
        </button>

        <button
          id="adminTabPayroll"
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'payroll'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Kelola Penggajian (Payroll)</span>
        </button>
      </div>

      {/* TAB 1: PERSETUJUAN CUTI */}
      {activeTab === 'approvals' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Daftar Permohonan Cuti Masuk</h3>
                <p className="text-xs text-slate-500">Tinjau dan proses permohonan cuti dari seluruh anggota tim</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                Total: {leaveRequests.length} Riwayat Pengajuan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nama Pemohon</th>
                    <th className="px-4 py-3">Departemen</th>
                    <th className="px-4 py-3">Jenis Cuti</th>
                    <th className="px-4 py-3">Tanggal & Durasi</th>
                    <th className="px-4 py-3">Alasan / Dokumen</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaveRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{req.userName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">NIP: {req.userNip}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{req.department}</td>
                      <td className="px-4 py-3.5 font-semibold text-indigo-700">{req.leaveType}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-900">{req.startDate} s/d {req.endDate}</div>
                        <span className="text-[11px] font-bold text-slate-500">({req.daysCount} Hari Kerja)</span>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-slate-700 text-[11px] line-clamp-2">{req.reason}</p>
                        {req.attachmentName && (
                          <span className="text-[10px] text-blue-600 font-semibold underline block mt-0.5">
                            📄 {req.attachmentName}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          req.status === 'Disetujui'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'Ditolak'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {req.status === 'Menunggu' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`approveBtn-${req.id}`}
                              onClick={() => handleOpenReview(req, 'approve')}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>
                            <button
                              id={`rejectBtn-${req.id}`}
                              onClick={() => handleOpenReview(req, 'reject')}
                              className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Oleh: {req.reviewedBy || 'HR'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAJEMEN KARYAWAN */}
      {activeTab === 'employees' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Database Master Karyawan</h3>
                <p className="text-xs text-slate-500">Kelola informasi kepegawaian, jabatan, gaji, dan kuota cuti</p>
              </div>

              <button
                id="openAddEmployeeBtn"
                onClick={() => setShowAddEmpModal(true)}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/25 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Karyawan Baru</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  placeholder="Cari berdasarkan nama, NIP, atau email..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <select
                value={empDeptFilter}
                onChange={(e) => setEmpDeptFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
              >
                <option value="all">Semua Departemen</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Employees Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Karyawan</th>
                    <th className="px-4 py-3">Departemen & Jabatan</th>
                    <th className="px-4 py-3">Tanggal Bergabung</th>
                    <th className="px-4 py-3">Hak Cuti</th>
                    <th className="px-4 py-3">Gaji Pokok</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-3">
                          <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full object-cover" />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{emp.name}</span>
                              {emp.role === 'admin' && (
                                <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-1.5 rounded">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{emp.email} • <span className="font-mono">{emp.nip}</span></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800 block">{emp.position}</span>
                        <span className="text-[11px] text-slate-500">{emp.department}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {emp.joinDate}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          Sisa: {emp.leaveQuota.remaining} / {emp.leaveQuota.total} hari
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {formatRupiah(emp.salaryDetails.basicSalary)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {emp.id !== currentUser.id && (
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menonaktifkan akun karyawan ${emp.name}?`)) {
                                onDeleteEmployee(emp.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Hapus Karyawan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: REKAP ABSENSI SELURUH STAFF */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Audit & Log Presensi Seluruh Karyawan</h3>
                <p className="text-xs text-slate-500">Pantau catatan waktu masuk, pulang, dan metode kerja secara real-time</p>
              </div>

              <button
                id="exportCsvBtn"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/25 transition cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Export Rekap ke CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Karyawan</th>
                    <th className="px-4 py-3">Departemen</th>
                    <th className="px-4 py-3">Jam Masuk</th>
                    <th className="px-4 py-3">Jam Pulang</th>
                    <th className="px-4 py-3">Tipe Kerja</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Keterangan / Lokasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceList.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5 font-medium text-slate-900">{a.date}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{a.userName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{a.userNip}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{a.department}</td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{a.clockInTime} WIB</td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        {a.clockOutTime ? `${a.clockOutTime} WIB` : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{a.workType}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          a.status === 'Hadir'
                            ? 'bg-emerald-100 text-emerald-800'
                            : a.status === 'Terlambat'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">
                        {a.notes || a.location}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: KELOLA PENGGAJIAN (PAYROLL) */}
      {activeTab === 'payroll' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Manajemen Penggajian & Penerbitan Slip</h3>
                <p className="text-xs text-slate-500">Proses penggajian bulanan massal untuk seluruh karyawan perusahaan</p>
              </div>

              <button
                id="generatePayrollBatchBtn"
                onClick={() => setShowBatchModal(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/25 transition cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Jalankan Payroll Bulan Ini (Batch)</span>
              </button>
            </div>

            {/* Total Company Payroll Metric */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 font-medium">Total Slip Gaji Diterbitkan</span>
                <p className="text-2xl font-extrabold text-slate-900 font-mono">{payrollList.length}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Total Anggaran Penggajian</span>
                <p className="text-2xl font-extrabold text-emerald-700 font-mono">
                  {formatRupiah(payrollList.reduce((acc, p) => acc + p.takeHomePay, 0))}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Total Pajak PPh21 Disetor</span>
                <p className="text-2xl font-extrabold text-slate-700 font-mono">
                  {formatRupiah(payrollList.reduce((acc, p) => acc + p.deductions.pph21, 0))}
                </p>
              </div>
            </div>

            {/* Payroll Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nama Karyawan</th>
                    <th className="px-4 py-3">Periode</th>
                    <th className="px-4 py-3">Gaji Pokok</th>
                    <th className="px-4 py-3">Total Bruto</th>
                    <th className="px-4 py-3">Total Potongan</th>
                    <th className="px-4 py-3">Gaji Bersih (THP)</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollList.map((pyr) => (
                    <tr key={pyr.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{pyr.userName}</div>
                        <div className="text-[11px] text-slate-500">{pyr.department} • <span className="font-mono">{pyr.userNip}</span></div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">{pyr.monthYear}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">{formatRupiah(pyr.earnings.basicSalary)}</td>
                      <td className="px-4 py-3.5 font-mono text-emerald-700 font-semibold">{formatRupiah(pyr.earnings.totalEarnings)}</td>
                      <td className="px-4 py-3.5 font-mono text-red-600">{formatRupiah(pyr.deductions.totalDeductions)}</td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900 text-sm">{formatRupiah(pyr.takeHomePay)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedSlip(pyr)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Slip Gaji</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Review Note for Approve/Reject Cuti */}
      {reviewingLeave && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className={`px-6 py-4 text-white font-bold flex items-center justify-between ${
              reviewAction === 'approve' ? 'bg-emerald-700' : 'bg-red-700'
            }`}>
              <div className="flex items-center gap-2">
                {reviewAction === 'approve' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span>{reviewAction === 'approve' ? 'Persetujuan Cuti' : 'Penolakan Cuti'}</span>
              </div>
              <button onClick={() => setReviewingLeave(null)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900">{reviewingLeave.userName} ({reviewingLeave.department})</div>
                <div className="text-slate-600">Jenis: <span className="font-semibold">{reviewingLeave.leaveType}</span> • Durasi: <span className="font-bold">{reviewingLeave.daysCount} Hari</span></div>
                <div className="text-slate-500 italic mt-1">"{reviewingLeave.reason}"</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catatan Reviewer untuk Karyawan:
                </label>
                <textarea
                  rows={3}
                  value={reviewNotesInput}
                  onChange={(e) => setReviewNotesInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingLeave(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="button"
                  id="confirmReviewSubmitBtn"
                  onClick={handleConfirmReview}
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition ${
                    reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Konfirmasi {reviewAction === 'approve' ? 'Setujui' : 'Tolak'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Karyawan Baru */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-base">Tambah Karyawan Baru</h3>
              </div>
              <button onClick={() => setShowAddEmpModal(false)} className="text-purple-300 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    placeholder="Contoh: Rian Anggara"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Perusahaan</label>
                  <input
                    type="email"
                    value={newEmpEmail}
                    onChange={(e) => setNewEmpEmail(e.target.value)}
                    placeholder="rian@company.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nomor Induk (NIP)</label>
                  <input
                    type="text"
                    value={newEmpNip}
                    onChange={(e) => setNewEmpNip(e.target.value)}
                    placeholder="ENG-2026-088"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Departemen</label>
                  <select
                    value={newEmpDept}
                    onChange={(e) => setNewEmpDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Jabatan / Posisi</label>
                  <input
                    type="text"
                    value={newEmpPos}
                    onChange={(e) => setNewEmpPos(e.target.value)}
                    placeholder="Software Engineer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Gaji Pokok (IDR)</label>
                  <input
                    type="number"
                    value={newEmpSalary}
                    onChange={(e) => setNewEmpSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nama Bank</label>
                  <input
                    type="text"
                    value={newEmpBank}
                    onChange={(e) => setNewEmpBank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    value={newEmpAccNum}
                    onChange={(e) => setNewEmpAccNum(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="submitNewEmployeeBtn"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/25"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Payroll Batch Runner */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Jalankan Penggajian Massal</h3>
              <button onClick={() => setShowBatchModal(false)} className="text-emerald-200 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Sistem akan membuat dan menerbitkan slip gaji resmi untuk <strong>{allUsers.length} orang karyawan</strong> dengan perhitungan tunjangan, BPJS 1% & 2%, serta PPh 21 otomatis.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Periode Bulan & Tahun</label>
                <input
                  type="text"
                  value={batchMonth}
                  onChange={(e) => setBatchMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tanggal Transfer Payroll</label>
                <input
                  type="date"
                  value={batchDate}
                  onChange={(e) => setBatchDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="button"
                  id="confirmBatchRunBtn"
                  onClick={() => {
                    onGeneratePayrollBatch(batchMonth, batchDate);
                    setShowBatchModal(false);
                    setToastMsg(`Proses Penggajian Periode ${batchMonth} untuk seluruh karyawan berhasil diproses!`);
                    setTimeout(() => setToastMsg(null), 4000);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25"
                >
                  Proses Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Modal View if clicked */}
      {selectedSlip && (
        <SlipGajiModal payroll={selectedSlip} onClose={() => setSelectedSlip(null)} />
      )}

    </div>
  );
};

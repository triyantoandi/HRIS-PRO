import React, { useState } from 'react';
import { User, Branch, EmploymentStatus, Role } from '../types';
import { formatRupiah, formatIndonesianDate, DEPARTMENTS, DIVISIONS } from '../data/mockData';
import { hasPermission, getRoleDisplayName } from '../services/rbac';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Trash2,
  Building,
  Mail,
  Phone,
  Calendar,
  FileText,
  CreditCard,
  Briefcase,
  X,
  CheckCircle2,
  Download,
  Upload,
  Network,
  ChevronRight,
  GitCommit,
  UserCheck,
  Building2,
  FolderTree,
  ArrowRight,
  Edit2,
  Save,
  Shield,
  Layers,
  Crown,
  Share2,
} from 'lucide-react';

interface WorkforceModuleProps {
  currentUser: User;
  allUsers: User[];
  branches: Branch[];
  onAddEmployee: (user: User) => void;
  onUpdateEmployee: (user: User) => void;
  onDeleteEmployee: (userId: string) => void;
  onBackToDashboard: () => void;
}

export const WorkforceModule: React.FC<WorkforceModuleProps> = ({
  currentUser,
  allUsers,
  branches,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  // Main Tab State
  const [activeTab, setActiveTab] = useState<'directory' | 'org_chart' | 'departments'>('directory');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrgDept, setSelectedOrgDept] = useState<string>('ALL');

  // Department State
  const [customDepts, setCustomDepts] = useState<string[]>(DEPARTMENTS);
  const [customDivs, setCustomDivs] = useState<string[]>(DIVISIONS);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDivName, setNewDivName] = useState('');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser360, setSelectedUser360] = useState<User | null>(null);
  const [isEditing360, setIsEditing360] = useState(false);
  const [activeTab360, setActiveTab360] = useState<'profile' | 'hierarchy' | 'salary' | 'docs'>('profile');

  // Edit Employee State
  const [editFormData, setEditFormData] = useState<Partial<User>>({});

  // Quick Reassign Hierarchy Modal
  const [reassignModalUser, setReassignModalUser] = useState<User | null>(null);
  const [reassignManagerId, setReassignManagerId] = useState<string>('');
  const [reassignSupervisorId, setReassignSupervisorId] = useState<string>('');
  const [reassignDept, setReassignDept] = useState<string>('');
  const [reassignPosition, setReassignPosition] = useState<string>('');

  // New Employee Form State
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'employee',
    position: '',
    department: customDepts[0] || 'Human Resources',
    division: customDivs[0] || 'People & Culture',
    branchId: branches[0]?.id || 'br-jkt-hq',
    branchName: branches[0]?.name || 'Head Office SCBD Jakarta',
    employmentStatus: 'Tetap (Permanent)',
    joinDate: '2026-08-18',
    nip: `EMP-${Date.now().toString().slice(-4)}`,
    phone: '',
    gender: 'Laki-laki',
    maritalStatus: 'Belum Menikah',
    managerId: '',
    managerName: '',
    supervisorId: '',
    supervisorName: '',
    salaryDetails: {
      basicSalary: 8000000,
      allowancePosition: 1000000,
      allowanceTransport: 800000,
      allowanceMeal: 650000,
      allowanceAttendance: 350000,
      bpjsKesehatanPercent: 1,
      bpjsKetenagakerjaanPercent: 2,
      pph21Percent: 5,
      bankName: 'BCA (Bank Central Asia)',
      accountNumber: '',
      accountHolder: '',
    },
  });

  const canCreate = hasPermission(currentUser, 'employee.create') || currentUser.role === 'super_admin' || currentUser.role === 'hr_admin';
  const canDelete = hasPermission(currentUser, 'employee.delete') || currentUser.role === 'super_admin' || currentUser.role === 'hr_admin';

  // Filtered list for Directory
  const filteredUsers = allUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = deptFilter === 'ALL' || u.department === deptFilter;
    const matchBranch = branchFilter === 'ALL' || u.branchId === branchFilter;
    const matchStatus = statusFilter === 'ALL' || u.employmentStatus === statusFilter;
    return matchSearch && matchDept && matchBranch && matchStatus;
  });

  // Hierarchy Categorization for Org Chart
  const directors = allUsers.filter((u) => u.role === 'director' || u.role === 'super_admin');
  const managers = allUsers.filter((u) => u.role === 'manager' || u.role === 'hr_admin');
  const supervisors = allUsers.filter((u) => u.role === 'supervisor');
  const staff = allUsers.filter((u) => u.role === 'employee' || u.role === 'hr_staff' || u.role === 'finance');

  // Open 360 in view mode
  const handleOpen360 = (user: User) => {
    setSelectedUser360(user);
    setEditFormData(user);
    setIsEditing360(false);
    setActiveTab360('profile');
  };

  // Save 360 Edits
  const handleSave360Edits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser360 || !editFormData.name) return;

    const matchedManager = allUsers.find((u) => u.id === editFormData.managerId);
    const matchedSupervisor = allUsers.find((u) => u.id === editFormData.supervisorId);
    const matchedBranch = branches.find((b) => b.id === editFormData.branchId) || branches[0];

    const updatedUser: User = {
      ...selectedUser360,
      ...editFormData,
      name: editFormData.name || selectedUser360.name,
      email: editFormData.email || selectedUser360.email,
      role: (editFormData.role as Role) || selectedUser360.role,
      position: editFormData.position || selectedUser360.position,
      department: editFormData.department || selectedUser360.department,
      division: editFormData.division || selectedUser360.division,
      branchId: matchedBranch?.id || selectedUser360.branchId,
      branchName: matchedBranch?.name || selectedUser360.branchName,
      managerId: editFormData.managerId || undefined,
      managerName: matchedManager?.name || undefined,
      supervisorId: editFormData.supervisorId || undefined,
      supervisorName: matchedSupervisor?.name || undefined,
      employmentStatus: (editFormData.employmentStatus as EmploymentStatus) || selectedUser360.employmentStatus,
      salaryDetails: {
        ...selectedUser360.salaryDetails,
        basicSalary: Number(editFormData.salaryDetails?.basicSalary || selectedUser360.salaryDetails.basicSalary),
        allowancePosition: Number(editFormData.salaryDetails?.allowancePosition || selectedUser360.salaryDetails.allowancePosition),
        allowanceTransport: Number(editFormData.salaryDetails?.allowanceTransport || selectedUser360.salaryDetails.allowanceTransport),
        allowanceMeal: Number(editFormData.salaryDetails?.allowanceMeal || selectedUser360.salaryDetails.allowanceMeal),
        allowanceAttendance: Number(editFormData.salaryDetails?.allowanceAttendance || selectedUser360.salaryDetails.allowanceAttendance || 0),
        bankName: editFormData.salaryDetails?.bankName || selectedUser360.salaryDetails.bankName,
        accountNumber: editFormData.salaryDetails?.accountNumber || selectedUser360.salaryDetails.accountNumber,
      },
    };

    onUpdateEmployee(updatedUser);
    setSelectedUser360(updatedUser);
    setIsEditing360(false);
    alert('Data karyawan dan struktur atasan berhasil diperbarui.');
  };

  // Open Reassign Modal
  const handleOpenReassign = (user: User) => {
    setReassignModalUser(user);
    setReassignManagerId(user.managerId || '');
    setReassignSupervisorId(user.supervisorId || '');
    setReassignDept(user.department);
    setReassignPosition(user.position);
  };

  // Save Hierarchy Reassignment
  const handleSaveReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignModalUser) return;

    const manager = allUsers.find((u) => u.id === reassignManagerId);
    const supervisor = allUsers.find((u) => u.id === reassignSupervisorId);

    const updatedUser: User = {
      ...reassignModalUser,
      department: reassignDept,
      position: reassignPosition,
      managerId: manager?.id || undefined,
      managerName: manager?.name || undefined,
      supervisorId: supervisor?.id || undefined,
      supervisorName: supervisor?.name || undefined,
    };

    onUpdateEmployee(updatedUser);
    setReassignModalUser(null);
    alert(`Struktur atasan dan posisi untuk ${updatedUser.name} berhasil diperbarui.`);
  };

  // Add Department
  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    if (customDepts.includes(newDeptName.trim())) {
      alert('Departemen tersebut sudah ada.');
      return;
    }
    setCustomDepts([...customDepts, newDeptName.trim()]);
    setNewDeptName('');
    alert(`Departemen "${newDeptName.trim()}" berhasil ditambahkan.`);
  };

  // Delete Department
  const handleDeleteDept = (dept: string) => {
    if (customDepts.length <= 1) {
      alert('Minimal harus ada 1 departemen aktif.');
      return;
    }
    if (confirm(`Hapus departemen "${dept}"? Karyawan yang ada di departemen ini harus dipindahkan.`)) {
      setCustomDepts(customDepts.filter((d) => d !== dept));
    }
  };

  // Save New Employee
  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.position) {
      alert('Harap lengkapi field Nama, Email, dan Jabatan!');
      return;
    }

    const selectedBranch = branches.find((b) => b.id === formData.branchId) || branches[0];
    const matchedManager = allUsers.find((u) => u.id === formData.managerId);
    const matchedSupervisor = allUsers.find((u) => u.id === formData.supervisorId);

    const newEmp: User = {
      id: `usr-${Date.now()}`,
      name: formData.name || '',
      email: formData.email || '',
      role: (formData.role as Role) || 'employee',
      avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
      position: formData.position || '',
      department: formData.department || customDepts[0] || 'Human Resources',
      division: formData.division || customDivs[0] || 'People & Culture',
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      managerId: matchedManager?.id,
      managerName: matchedManager?.name,
      supervisorId: matchedSupervisor?.id,
      supervisorName: matchedSupervisor?.name,
      employmentStatus: (formData.employmentStatus as EmploymentStatus) || 'Tetap (Permanent)',
      joinDate: formData.joinDate || '2026-08-18',
      nip: formData.nip || `EMP-${Date.now().toString().slice(-4)}`,
      phone: formData.phone || '+62 812-0000-0000',
      gender: formData.gender,
      maritalStatus: formData.maritalStatus,
      leaveQuota: {
        total: 12,
        used: 0,
        remaining: 12,
        sickUsed: 0,
        specialUsed: 0,
        carryForward: 0,
      },
      salaryDetails: {
        basicSalary: Number(formData.salaryDetails?.basicSalary || 8000000),
        allowancePosition: Number(formData.salaryDetails?.allowancePosition || 1000000),
        allowanceTransport: Number(formData.salaryDetails?.allowanceTransport || 800000),
        allowanceMeal: Number(formData.salaryDetails?.allowanceMeal || 650000),
        allowanceAttendance: Number(formData.salaryDetails?.allowanceAttendance || 350000),
        bpjsKesehatanPercent: 1,
        bpjsKetenagakerjaanPercent: 2,
        pph21Percent: 5,
        bankName: formData.salaryDetails?.bankName || 'BCA',
        accountNumber: formData.salaryDetails?.accountNumber || '1234-5678',
        accountHolder: formData.name?.toUpperCase() || '',
      },
      documents: [
        { id: `doc-${Date.now()}-1`, name: `KTP_${formData.name}.pdf`, type: 'KTP', uploadDate: '2026-08-18', size: '1.1 MB' },
        { id: `doc-${Date.now()}-2`, name: `Kontrak_Kerja_${formData.name}.pdf`, type: 'Kontrak Kerja', uploadDate: '2026-08-18', size: '2.5 MB' },
      ],
    };

    onAddEmployee(newEmp);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Title and Action Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Network className="w-6 h-6 text-blue-600" />
            <span>Struktur Organisasi & Manajemen Karyawan</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Atur hierarki pelaporan atasan-bawahan (*reporting line*), master departemen/divisi, dan profil karyawan 360°.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Karyawan Baru</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'directory' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Direktori Karyawan ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('org_chart')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'org_chart' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Bagan Struktur Organisasi (Org Chart)</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'departments' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Master Departemen & Divisi ({customDepts.length})</span>
        </button>
      </div>

      {/* TAB 1: WORKFORCE DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari Nama / NIP / Jabatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white text-slate-700"
              >
                <option value="ALL">Semua Departemen</option>
                {customDepts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white text-slate-700"
              >
                <option value="ALL">Semua Cabang (Multi-Branch)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white text-slate-700"
              >
                <option value="ALL">Semua Status Kerja</option>
                <option value="Tetap (Permanent)">Tetap (Permanent)</option>
                <option value="Kontrak (PKWT)">Kontrak (PKWT)</option>
                <option value="Probation (Percobaan)">Probation</option>
                <option value="Magang (Internship)">Magang</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Karyawan & NIP</th>
                    <th className="py-3 px-4">Jabatan & Departemen</th>
                    <th className="py-3 px-4">Atasan Langsung (Manager)</th>
                    <th className="py-3 px-4">Lokasi Kantor</th>
                    <th className="py-3 px-4">Status & Tanggal Masuk</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Tidak ada karyawan yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{user.name}</p>
                              <p className="text-[11px] text-slate-500 font-mono">{user.nip} • {user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{user.position}</p>
                          <p className="text-[11px] text-slate-500">{user.department}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center text-xs font-medium text-slate-700">
                            <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            {user.managerName || user.supervisorName || 'Direksi / Top Level'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center text-slate-700 text-xs">
                            <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {user.branchName || 'Head Office SCBD'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              user.employmentStatus === 'Tetap (Permanent)'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : user.employmentStatus === 'Kontrak (PKWT)'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {user.employmentStatus}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            {user.joinDate}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleOpen360(user)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                              title="Lihat / Edit Profil & Gaji Karyawan 360"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenReassign(user)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                              title="Ubah Struktur Atasan & Jabatan"
                            >
                              <Network className="w-4 h-4" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => {
                                  if (confirm(`Yakin ingin menghapus data karyawan ${user.name}?`)) {
                                    onDeleteEmployee(user.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                                title="Hapus Karyawan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE ORG CHART */}
      {activeTab === 'org_chart' && (
        <div className="space-y-6">
          
          {/* Top Control Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-emerald-600" />
                <span>Bagan Struktur Hierarki Perusahaan</span>
              </h3>
              <p className="text-xs text-slate-500">
                Visualisasi berjenjang dari Direksi, Manajer Departemen, Supervisor, hingga Staff Pelaksana.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-600">Filter Departemen:</span>
              <select
                value={selectedOrgDept}
                onChange={(e) => setSelectedOrgDept(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden"
              >
                <option value="ALL">Semua Departemen</option>
                {customDepts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hierarchical Tree Nodes */}
          <div className="space-y-8">
            
            {/* LEVEL 1: DIRECTORS & C-LEVEL */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <Crown className="w-4 h-4" />
                </span>
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Level 1: Dewan Direksi & Pimpinan Eksekutif ({directors.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {directors.map((dir) => (
                  <div
                    key={dir.id}
                    className="bg-gradient-to-br from-[#0F2038] to-[#1a3356] text-white p-5 rounded-3xl shadow-md border border-slate-700/50 space-y-3 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-bl-xl uppercase tracking-wider">
                      C-Level / Direksi
                    </div>

                    <div className="flex items-center space-x-3">
                      <img
                        src={dir.avatar}
                        alt={dir.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-400"
                      />
                      <div>
                        <h5 className="font-black text-sm text-white">{dir.name}</h5>
                        <p className="text-xs text-amber-300 font-bold">{dir.position}</p>
                        <p className="text-[10px] text-slate-300 font-mono">{dir.nip} • {dir.department}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-300">
                        {allUsers.filter((u) => u.managerId === dir.id).length} Bawahan Langsung
                      </span>
                      <button
                        onClick={() => handleOpen360(dir)}
                        className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        Detail 360 <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LEVEL 2: MANAGERS & HEAD OF DEPARTMENTS */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                  <Shield className="w-4 h-4" />
                </span>
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Level 2: Kepala Divisi & Manajer Departemen ({managers.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {managers
                  .filter((m) => selectedOrgDept === 'ALL' || m.department === selectedOrgDept)
                  .map((mgr) => {
                    const directReports = allUsers.filter((u) => u.managerId === mgr.id || u.supervisorId === mgr.id);
                    return (
                      <div
                        key={mgr.id}
                        className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {mgr.department}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 font-mono">
                            {mgr.branchName}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <img
                            src={mgr.avatar}
                            alt={mgr.name}
                            className="w-11 h-11 rounded-2xl object-cover ring-2 ring-blue-500 shrink-0"
                          />
                          <div>
                            <h5 className="font-extrabold text-sm text-slate-900">{mgr.name}</h5>
                            <p className="text-xs text-blue-700 font-bold">{mgr.position}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{mgr.nip}</p>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Melapor ke Atasan:</span>
                            <span className="font-bold text-slate-900">{mgr.managerName || 'Direktur Utama'}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Anggota Tim / Bawahan:</span>
                            <span className="font-bold text-emerald-700">{directReports.length} Orang</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <button
                            onClick={() => handleOpenReassign(mgr)}
                            className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Ubah Atasan
                          </button>
                          <button
                            onClick={() => handleOpen360(mgr)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          >
                            Profil <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* LEVEL 3 & 4: SUPERVISORS & STAFF */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Users className="w-4 h-4" />
                </span>
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Level 3 & 4: Supervisor, Tim Lead & Staff Pelaksana ({supervisors.length + staff.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...supervisors, ...staff]
                  .filter((s) => selectedOrgDept === 'ALL' || s.department === selectedOrgDept)
                  .map((emp) => (
                    <div
                      key={emp.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5 hover:border-emerald-500/50 transition"
                    >
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-slate-900 truncate">{emp.name}</h5>
                          <p className="text-[11px] text-slate-500 truncate">{emp.position}</p>
                        </div>
                      </div>

                      <div className="text-[10px] p-2 rounded-lg bg-slate-50 border border-slate-200/60 space-y-0.5">
                        <p className="text-slate-500">Departemen: <strong className="text-slate-800">{emp.department}</strong></p>
                        <p className="text-slate-500">Atasan: <strong className="text-emerald-700">{emp.managerName || emp.supervisorName || 'Manager'}</strong></p>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <button
                          onClick={() => handleOpenReassign(emp)}
                          className="font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Ubah Atasan
                        </button>
                        <button
                          onClick={() => handleOpen360(emp)}
                          className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          Detail 360
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: DEPARTMENTS & DIVISIONS MASTER */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Master Department List */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Daftar Departemen Aktif ({customDepts.length})</h3>
                <p className="text-xs text-slate-500">Kelola dan sesuaikan nama departemen sesuai struktur perusahaan Anda.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customDepts.map((dept) => {
                const memberCount = allUsers.filter((u) => u.department === dept).length;
                const deptManager = allUsers.find((u) => u.department === dept && (u.role === 'manager' || u.role === 'director'));

                return (
                  <div
                    key={dept}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 hover:bg-white hover:shadow-xs transition"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-slate-900">{dept}</h4>
                      <p className="text-[11px] text-slate-500">
                        {memberCount} Karyawan Terdaftar
                      </p>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        Pimpinan: {deptManager?.name || 'Belum Ditunjuk'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteDept(dept)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                      title="Hapus Departemen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Add New Department Form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Tambah Departemen Baru</span>
            </h3>
            <p className="text-xs text-slate-500">
              Buat unit kerja baru untuk disesuaikan dengan struktur organisasi perusahaan.
            </p>

            <form onSubmit={handleAddDept} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Departemen</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Digital Transformation / R&D"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition"
              >
                + Tambah Departemen
              </button>
            </form>
          </div>

        </div>
      )}

      {/* MODAL: Quick Reassign Atasan & Hierarchy */}
      {reassignModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#0F2038] text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Network className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">Ubah Struktur & Atasan Langsung</h3>
                  <p className="text-xs text-slate-300">{reassignModalUser.name} ({reassignModalUser.nip})</p>
                </div>
              </div>
              <button
                onClick={() => setReassignModalUser(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReassign} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Jabatan / Posisi</label>
                <input
                  type="text"
                  required
                  value={reassignPosition}
                  onChange={(e) => setReassignPosition(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Departemen</label>
                <select
                  value={reassignDept}
                  onChange={(e) => setReassignDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold bg-slate-50 focus:outline-hidden"
                >
                  {customDepts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Atasan Langsung (Direct Manager / Head)</label>
                <select
                  value={reassignManagerId}
                  onChange={(e) => setReassignManagerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold bg-white focus:outline-hidden"
                >
                  <option value="">-- Pimpinan Eksekutif / Tanpa Manager --</option>
                  {allUsers
                    .filter((u) => u.id !== reassignModalUser.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.position} - {u.department})
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setReassignModalUser(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Employee 360 Full Profile & Edit */}
      {selectedUser360 && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
            
            {/* Header */}
            <div className="bg-[#0F2038] text-white p-6 relative">
              <button
                onClick={() => setSelectedUser360(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedUser360.avatar}
                    alt={selectedUser360.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500"
                  />
                  <div>
                    <h2 className="text-xl font-black">{selectedUser360.name}</h2>
                    <p className="text-xs text-slate-300">{selectedUser360.position} • {selectedUser360.department}</p>
                    <p className="text-[11px] text-emerald-400 font-mono mt-0.5">NIP: {selectedUser360.nip} | {selectedUser360.branchName}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing360(!isEditing360)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    isEditing360 ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditing360 ? 'Mode Lihat' : 'Edit Data Karyawan'}</span>
                </button>
              </div>

              {/* Tab navigation */}
              <div className="flex items-center space-x-2 mt-6 border-t border-slate-800 pt-4 text-xs">
                <button
                  onClick={() => setActiveTab360('profile')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    activeTab360 === 'profile' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Profil & Kontak
                </button>
                <button
                  onClick={() => setActiveTab360('hierarchy')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    activeTab360 === 'hierarchy' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Hierarki & Organisasi
                </button>
                <button
                  onClick={() => setActiveTab360('salary')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    activeTab360 === 'salary' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Gaji & Kompensasi
                </button>
                <button
                  onClick={() => setActiveTab360('docs')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    activeTab360 === 'docs' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dokumen ({selectedUser360.documents?.length || 0})
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave360Edits} className="p-6 max-h-[65vh] overflow-y-auto text-xs text-slate-700 space-y-4">
              
              {/* Tab 360: Profile */}
              {activeTab360 === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-emerald-700">
                      Informasi Pribadi & Kontak
                    </h3>

                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Nama Lengkap</label>
                      {isEditing360 ? (
                        <input
                          type="text"
                          value={editFormData.name || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                        />
                      ) : (
                        <p className="font-bold text-slate-900">{selectedUser360.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Email Resmi</label>
                      {isEditing360 ? (
                        <input
                          type="email"
                          value={editFormData.email || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                        />
                      ) : (
                        <p className="font-medium text-slate-800">{selectedUser360.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Nomor Telepon / WhatsApp</label>
                      {isEditing360 ? (
                        <input
                          type="text"
                          value={editFormData.phone || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                        />
                      ) : (
                        <p className="font-medium text-slate-800">{selectedUser360.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-emerald-700">
                      Status Hubungan Kerja
                    </h3>

                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Status Kepegawaian</label>
                      {isEditing360 ? (
                        <select
                          value={editFormData.employmentStatus || selectedUser360.employmentStatus}
                          onChange={(e) => setEditFormData({ ...editFormData, employmentStatus: e.target.value as any })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                        >
                          <option value="Tetap (Permanent)">Tetap (Permanent)</option>
                          <option value="Kontrak (PKWT)">Kontrak (PKWT)</option>
                          <option value="Probation (Percobaan)">Probation</option>
                          <option value="Magang (Internship)">Magang</option>
                        </select>
                      ) : (
                        <p className="font-bold text-blue-700">{selectedUser360.employmentStatus}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Kantor Cabang</label>
                      {isEditing360 ? (
                        <select
                          value={editFormData.branchId || selectedUser360.branchId}
                          onChange={(e) => setEditFormData({ ...editFormData, branchId: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="font-medium text-slate-800">{selectedUser360.branchName}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Tanggal Bergabung</label>
                      <p className="font-medium text-slate-800">{formatIndonesianDate(selectedUser360.joinDate)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 360: Hierarchy */}
              {activeTab360 === 'hierarchy' && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-emerald-700">
                    Posisi & Garis Pelaporan Organisasi
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Jabatan / Posisi</label>
                      {isEditing360 ? (
                        <input
                          type="text"
                          value={editFormData.position || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                        />
                      ) : (
                        <p className="font-bold text-slate-900">{selectedUser360.position}</p>
                      )}
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Departemen</label>
                      {isEditing360 ? (
                        <select
                          value={editFormData.department || selectedUser360.department}
                          onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                        >
                          {customDepts.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="font-bold text-slate-900">{selectedUser360.department}</p>
                      )}
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Atasan Langsung (Direct Manager)</label>
                      {isEditing360 ? (
                        <select
                          value={editFormData.managerId || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, managerId: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                        >
                          <option value="">-- Pimpinan Eksekutif / Tidak Ada --</option>
                          {allUsers
                            .filter((u) => u.id !== selectedUser360.id)
                            .map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name} ({u.position})
                              </option>
                            ))}
                        </select>
                      ) : (
                        <p className="font-bold text-emerald-700">{selectedUser360.managerName || 'Direksi / Top Level'}</p>
                      )}
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Role / Hak Akses Sistem</label>
                      {isEditing360 ? (
                        <select
                          value={editFormData.role || selectedUser360.role}
                          onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                        >
                          <option value="employee">Employee (Karyawan Standar)</option>
                          <option value="supervisor">Supervisor (Penyelia Tim)</option>
                          <option value="manager">Manager (Kepala Divisi)</option>
                          <option value="hr_staff">HR Staff</option>
                          <option value="hr_admin">HR Admin</option>
                          <option value="finance">Finance / Payroll</option>
                          <option value="director">Director (Direksi)</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      ) : (
                        <p className="font-bold text-blue-700">{getRoleDisplayName(selectedUser360.role)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 360: Salary */}
              {activeTab360 === 'salary' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Gaji Pokok (Basic)</label>
                      {isEditing360 ? (
                        <input
                          type="number"
                          value={editFormData.salaryDetails?.basicSalary || 0}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              salaryDetails: {
                                ...editFormData.salaryDetails,
                                basicSalary: Number(e.target.value),
                                allowancePosition: editFormData.salaryDetails?.allowancePosition || 0,
                                allowanceTransport: editFormData.salaryDetails?.allowanceTransport || 0,
                                allowanceMeal: editFormData.salaryDetails?.allowanceMeal || 0,
                                bpjsKesehatanPercent: 1,
                                bpjsKetenagakerjaanPercent: 2,
                                pph21Percent: 5,
                                bankName: editFormData.salaryDetails?.bankName || 'BCA',
                                accountNumber: editFormData.salaryDetails?.accountNumber || '',
                                accountHolder: editFormData.salaryDetails?.accountHolder || '',
                              },
                            })
                          }
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold"
                        />
                      ) : (
                        <p className="text-base font-bold font-mono text-slate-900">{formatRupiah(selectedUser360.salaryDetails.basicSalary)}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Tunjangan Jabatan</label>
                      {isEditing360 ? (
                        <input
                          type="number"
                          value={editFormData.salaryDetails?.allowancePosition || 0}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              salaryDetails: {
                                ...editFormData.salaryDetails,
                                basicSalary: editFormData.salaryDetails?.basicSalary || 0,
                                allowancePosition: Number(e.target.value),
                                allowanceTransport: editFormData.salaryDetails?.allowanceTransport || 0,
                                allowanceMeal: editFormData.salaryDetails?.allowanceMeal || 0,
                                bpjsKesehatanPercent: 1,
                                bpjsKetenagakerjaanPercent: 2,
                                pph21Percent: 5,
                                bankName: editFormData.salaryDetails?.bankName || 'BCA',
                                accountNumber: editFormData.salaryDetails?.accountNumber || '',
                                accountHolder: editFormData.salaryDetails?.accountHolder || '',
                              },
                            })
                          }
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold"
                        />
                      ) : (
                        <p className="text-base font-bold font-mono text-slate-900">{formatRupiah(selectedUser360.salaryDetails.allowancePosition)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 360: Docs */}
              {activeTab360 === 'docs' && (
                <div className="space-y-3">
                  {selectedUser360.documents?.map((doc) => (
                    <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-bold text-slate-900">{doc.name}</p>
                          <p className="text-[10px] text-slate-500">Tipe: {doc.type} • Diunggah: {doc.uploadDate}</p>
                        </div>
                      </div>
                      <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                        Unduh
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer Save Button for 360 */}
              {isEditing360 && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing360(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Karyawan Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="bg-[#0F2038] text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Plus className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">Tambah Karyawan & Tentukan Posisi Organisasi</h3>
                  <p className="text-xs text-slate-300">Masukkan data diri, jabatan, departemen, dan atasan langsung.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Kantor</label>
                  <input
                    type="email"
                    required
                    placeholder="budi@company.co.id"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jabatan / Posisi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Senior Software Engineer"
                    value={formData.position || ''}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Departemen</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:outline-hidden"
                  >
                    {customDepts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Atasan Langsung (Direct Manager)</label>
                  <select
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold focus:outline-hidden"
                  >
                    <option value="">-- Pimpinan Eksekutif / Tanpa Manager --</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.position} - {u.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role Akses Sistem</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:outline-hidden"
                  >
                    <option value="employee">Employee (Karyawan)</option>
                    <option value="supervisor">Supervisor (Penyelia)</option>
                    <option value="manager">Manager (Kepala Divisi)</option>
                    <option value="hr_staff">HR Staff</option>
                    <option value="hr_admin">HR Admin</option>
                    <option value="finance">Finance / Payroll</option>
                    <option value="director">Director</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lokasi Kantor Cabang</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-hidden"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gaji Pokok (Rp)</label>
                  <input
                    type="number"
                    value={formData.salaryDetails?.basicSalary || 8000000}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salaryDetails: {
                          ...formData.salaryDetails!,
                          basicSalary: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

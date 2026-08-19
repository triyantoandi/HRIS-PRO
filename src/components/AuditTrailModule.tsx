import React, { useState } from 'react';
import { User, AuditLog } from '../types';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  ArrowLeft,
  Calendar,
  UserCheck,
  FileText,
  Clock,
  Laptop,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface AuditTrailModuleProps {
  currentUser: User;
  auditLogs: AuditLog[];
  onBackToDashboard: () => void;
}

export const AuditTrailModule: React.FC<AuditTrailModuleProps> = ({
  currentUser,
  auditLogs,
  onBackToDashboard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const modulesList = ['ALL', 'Auth', 'Workforce', 'Absensi', 'Cuti', 'Lembur', 'Payroll', 'Admin'];

  const filteredLogs = auditLogs.filter((log) => {
    const matchModule = selectedModule === 'ALL' || log.module.toLowerCase() === selectedModule.toLowerCase();
    const matchSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.description && log.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchAction =
      selectedAction === 'ALL' ||
      (selectedAction === 'APPROVE' && log.action.includes('APPROVE')) ||
      (selectedAction === 'REJECT' && log.action.includes('REJECT')) ||
      (selectedAction === 'LOGIN' && log.action.includes('LOGIN')) ||
      (selectedAction === 'MUTATION' && (log.action.includes('TAMBAH') || log.action.includes('UPDATE') || log.action.includes('HAPUS')));

    return matchModule && matchSearch && matchAction;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Waktu', 'Pengguna', 'Modul', 'Aksi', 'Keterangan'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.module}"`,
      `"${l.action}"`,
      `"${(l.details || l.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Trail_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('LOGIN')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('APPROVE') || action.includes('BERHASIL')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('REJECT') || action.includes('HAPUS') || action.includes('TOLAK')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.includes('UPDATE') || action.includes('TAMBAH') || action.includes('KOREKSI')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
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
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>Audit Trail & Activity Log Keamanan</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak kepatuhan dan integritas data mencatat seluruh aktivitas autentikasi, mutasi data, dan persetujuan.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor Audit Log (CSV)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Entri Log</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{auditLogs.length}</div>
          <p className="text-[11px] text-blue-600 font-medium mt-0.5">Terekam di sistem</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aktivitas Autentikasi</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">
            {auditLogs.filter((l) => l.action.includes('LOGIN')).length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Sesi login tercatat</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mutasi & Pengubahan</span>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">
            {auditLogs.filter((l) => l.action.includes('TAMBAH') || l.action.includes('UPDATE') || l.action.includes('HAPUS')).length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Operasi data karyawan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Persetujuan & Verifikasi</span>
          <div className="mt-2 text-2xl font-extrabold text-indigo-600">
            {auditLogs.filter((l) => l.action.includes('APPROVE') || l.action.includes('REJECT')).length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Keputusan approval</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pengguna, aksi, atau rincian aktivitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-hidden"
          >
            {modulesList.map((m) => (
              <option key={m} value={m}>Modul: {m}</option>
            ))}
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">Semua Jenis Aksi</option>
            <option value="LOGIN">Autentikasi (Login)</option>
            <option value="APPROVE">Persetujuan (Approve)</option>
            <option value="REJECT">Penolakan (Reject)</option>
            <option value="MUTATION">Mutasi Data (CRUD)</option>
          </select>
        </div>
      </div>

      {/* Log Activity Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Riwayat Catatan Audit (Immutable Trail)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan {filteredLogs.length} dari total {auditLogs.length} catatan aktivitas sistem
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Timezone: WIB (UTC+7)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Waktu & Tanggal</th>
                <th className="py-3 px-4">Pengguna (Aktor)</th>
                <th className="py-3 px-4">Modul</th>
                <th className="py-3 px-4">Aksi</th>
                <th className="py-3 px-4">Rincian Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data log audit yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                          {log.userName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{log.userName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md">
                      {log.details || log.description || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

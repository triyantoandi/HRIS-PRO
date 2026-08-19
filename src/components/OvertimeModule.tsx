import React, { useState } from 'react';
import { User, OvertimeRequest } from '../types';
import { formatRupiah, formatIndonesianDate } from '../data/mockData';
import { hasPermission } from '../services/rbac';
import {
  Flame,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  X,
  FileText,
} from 'lucide-react';

interface OvertimeModuleProps {
  currentUser: User;
  overtimeList: OvertimeRequest[];
  onSubmitOvertime: (ot: Omit<OvertimeRequest, 'id' | 'appliedDate' | 'status'>) => void;
  onApproveOvertime: (id: string, reviewNotes: string) => void;
  onRejectOvertime: (id: string, reviewNotes: string) => void;
  onBackToDashboard: () => void;
}

export const OvertimeModule: React.FC<OvertimeModuleProps> = ({
  currentUser,
  overtimeList,
  onSubmitOvertime,
  onApproveOvertime,
  onRejectOvertime,
  onBackToDashboard,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [otDate, setOtDate] = useState('2026-08-18');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('21:00');
  const [taskDesc, setTaskDesc] = useState('');

  const canApprove = hasPermission(currentUser, 'overtime.approve');

  // Filter: Employee only sees own requests if not manager/HR
  const visibleList = canApprove
    ? overtimeList
    : overtimeList.filter((ot) => ot.userId === currentUser.id);

  // Calculate duration in hours
  const calculateDuration = () => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    return Math.max(1, Math.round(totalMinutes / 60));
  };

  const durationHours = calculateDuration();
  const hourlyBase = (currentUser.salaryDetails?.basicSalary || 10000000) / 173;
  const multiplier = durationHours >= 2 ? 2.0 : 1.5;
  const estimatedCompensation = Math.round(hourlyBase * multiplier * durationHours);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDesc) {
      alert('Harap isi deskripsi tugas lembur.');
      return;
    }

    onSubmitOvertime({
      userId: currentUser.id,
      userName: currentUser.name,
      userNip: currentUser.nip,
      department: currentUser.department,
      date: otDate,
      startTime,
      endTime,
      durationHours,
      multiplierRate: multiplier,
      compensationAmount: estimatedCompensation,
      taskDescription: taskDesc,
    });

    setShowModal(false);
    setTaskDesc('');
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
            <Flame className="w-6 h-6 text-amber-500" />
            <span>Manajemen Lembur (Surat Perintah Lembur / SPL)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengajuan jam kerja lembur terintegrasi, validasi bertingkat, dan sinkronisasi otomatis ke komponen payroll.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Lembur (SPL)</span>
        </button>
      </div>

      {/* Overtime Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Daftar Pengajuan Lembur</h3>
            <p className="text-xs text-slate-500">
              {canApprove ? 'Seluruh pengajuan lembur tim yang membutuhkan verifikasi' : 'Riwayat pengajuan lembur pribadi'}
            </p>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            {visibleList.filter((o) => o.status === 'Menunggu').length} Butuh Approval
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Tanggal & Jam</th>
                <th className="py-3 px-4">Durasi & Rate</th>
                <th className="py-3 px-4">Deskripsi Tugas</th>
                <th className="py-3 px-4">Estimasi Upah</th>
                <th className="py-3 px-4">Status</th>
                {canApprove && <th className="py-3 px-4 text-center">Tindakan</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Belum ada data pengajuan lembur saat ini.
                  </td>
                </tr>
              ) : (
                visibleList.map((ot) => (
                  <tr key={ot.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{ot.userName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{ot.userNip} • {ot.department}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{ot.date}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{ot.startTime} - {ot.endTime} WIB</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{ot.durationHours} Jam</span>
                      <span className="text-[10px] text-slate-500 block">Rate: {ot.multiplierRate}x</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-700">{ot.taskDescription}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                      {formatRupiah(ot.compensationAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ot.status === 'Disetujui'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ot.status === 'Ditolak'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ot.status}
                      </span>
                    </td>
                    {canApprove && (
                      <td className="py-3 px-4 text-center">
                        {ot.status === 'Menunggu' ? (
                          <div className="inline-flex items-center space-x-2">
                            <button
                              onClick={() => onApproveOvertime(ot.id, 'Disetujui oleh atasan langsung')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => onRejectOvertime(ot.id, 'Tidak sesuai kuota lembur')}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Selesai</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Overtime Submission */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Formulir Pengajuan Lembur (SPL)</h2>
                <p className="text-xs text-slate-400">Isi detail jadwal lembur dan target pekerjaan</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Lembur *</label>
                <input
                  type="date"
                  required
                  value={otDate}
                  onChange={(e) => setOtDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jam Mulai *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jam Selesai *</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <p className="text-slate-600">Durasi Lembur:</p>
                  <p className="font-bold text-amber-900 text-sm">{durationHours} Jam (Multiplier {multiplier}x)</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600">Estimasi Upah Lembur:</p>
                  <p className="font-bold text-emerald-700 text-sm font-mono">{formatRupiah(estimatedCompensation)}</p>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rincian Tugas Lembur *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Deployment sistem billing, migrasi database server, testing regression..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md"
                >
                  Kirim SPL Lembur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

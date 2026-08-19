import React, { useState } from 'react';
import { User, LeaveRequest, LeaveType } from '../types';
import { formatIndonesianDate } from '../data/mockData';
import { hasPermission } from '../services/rbac';
import {
  Briefcase,
  Plus,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  X,
  Upload,
  HeartPulse,
  Eye,
  FileCheck,
  Building,
  UserCheck,
  Paperclip,
} from 'lucide-react';

interface CutiModuleProps {
  currentUser: User;
  leaveRequests: LeaveRequest[];
  onSubmitLeave: (newLeave: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => void;
  onCancelLeave: (leaveId: string) => void;
  onApproveLeave?: (leaveId: string, reviewNotes: string) => void;
  onRejectLeave?: (leaveId: string, reviewNotes: string) => void;
  onBackToDashboard: () => void;
}

export const CutiModule: React.FC<CutiModuleProps> = ({
  currentUser,
  leaveRequests,
  onSubmitLeave,
  onCancelLeave,
  onApproveLeave,
  onRejectLeave,
  onBackToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'my_leaves' | 'medical_permits' | 'pending_approval'>('my_leaves');
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('Cuti Tahunan');
  const [startDate, setStartDate] = useState('2026-08-25');
  const [endDate, setEndDate] = useState('2026-08-27');
  const [reason, setReason] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser.phone || '');
  const [attachmentName, setAttachmentName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');

  // Selected Attachment Viewer Modal
  const [previewAttachment, setPreviewAttachment] = useState<{ name: string; type: string; url?: string } | null>(null);

  const canApprove = hasPermission(currentUser, 'leave.approve') || currentUser.role === 'manager' || currentUser.role === 'hr_admin' || currentUser.role === 'super_admin';

  // Filter lists
  const myLeaves = leaveRequests.filter((r) => r.userId === currentUser.id);
  const medicalAndSpecialPermits = leaveRequests.filter(
    (r) => r.leaveType === 'Cuti Sakit' || r.leaveType === 'Cuti Khusus / Izin' || r.leaveType === 'Cuti Menikah' || r.leaveType === 'Cuti Melahirkan' || r.leaveType === 'Cuti Berduka / Keluarga'
  );
  const pendingApprovals = leaveRequests.filter((r) => r.status === 'Menunggu');

  // Auto calculate business days
  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 1;

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++; // exclude Sat/Sun
      cur.setDate(cur.getDate() + 1);
    }
    return Math.max(1, count);
  };

  const daysCount = calculateDays();

  // Simulated file upload
  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachmentName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Harap masukkan alasan pengajuan cuti/izin.');
      return;
    }

    if (leaveType === 'Cuti Sakit' && !attachmentName) {
      if (!confirm('Pengajuan izin sakit tanpa melampirkan Surat Dokter memerlukan verifikasi manual HR. Lanjutkan?')) {
        return;
      }
    }

    if (leaveType === 'Cuti Tahunan' && daysCount > currentUser.leaveQuota.remaining) {
      alert(`Jumlah cuti (${daysCount} hari) melebihi sisa kuota cuti tahunan Anda (${currentUser.leaveQuota.remaining} hari).`);
      return;
    }

    let fullReason = reason;
    if (doctorName || clinicName) {
      fullReason += ` [Klinik/Dokter: ${clinicName || '-'} / ${doctorName || '-'}]`;
    }

    onSubmitLeave({
      userId: currentUser.id,
      userName: currentUser.name,
      userNip: currentUser.nip,
      department: currentUser.department,
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason: fullReason,
      attachmentName: attachmentName || (leaveType === 'Cuti Sakit' ? `Surat_Keterangan_Dokter_${currentUser.name.replace(/\s+/g, '_')}.pdf` : undefined),
      emergencyPhone,
    });

    setShowModal(false);
    setReason('');
    setAttachmentName('');
    setDoctorName('');
    setClinicName('');
    alert('Permohonan cuti / izin berhasil diajukan untuk disetujui atasan.');
  };

  const displayedList =
    activeTab === 'my_leaves'
      ? myLeaves
      : activeTab === 'medical_permits'
      ? (canApprove ? medicalAndSpecialPermits : medicalAndSpecialPermits.filter((r) => r.userId === currentUser.id))
      : pendingApprovals;

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
            <Briefcase className="w-6 h-6 text-emerald-600" />
            <span>Manajemen Cuti, Izin Sakit & Cuti Khusus</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengajuan cuti tahunan, izin sakit (lampiran surat dokter), cuti melahirkan, dan izin khusus resmi UU Ketenagakerjaan.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Cuti / Izin Baru</span>
        </button>
      </div>

      {/* Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sisa Cuti Tahunan</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-600">{currentUser.leaveQuota.remaining}</span>
            <span className="text-xs text-slate-400 font-bold">dari {currentUser.leaveQuota.total} Hari</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Termasuk carry-forward tahun sebelumnya</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cuti Terpakai</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{currentUser.leaveQuota.used}</span>
            <span className="text-xs text-blue-600 font-bold">Hari Kerja</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Telah disetujui & tercatat sistem</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Izin Sakit (Dengan Surat Dokter)</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-600">{currentUser.leaveQuota.sickUsed || 0}</span>
            <span className="text-xs text-rose-600 font-bold">Hari Sakit</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Tidak memotong kuota cuti tahunan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Izin Khusus / Regulasi</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-indigo-600">{currentUser.leaveQuota.specialUsed || 0}</span>
            <span className="text-xs text-indigo-600 font-bold">Hari</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Menikah, Melahirkan, Kemalangan</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('my_leaves')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'my_leaves' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Pengajuan Cuti Saya ({myLeaves.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('medical_permits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'medical_permits' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Izin Sakit & Cuti Khusus ({medicalAndSpecialPermits.length})</span>
        </button>

        {canApprove && (
          <button
            onClick={() => setActiveTab('pending_approval')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'pending_approval' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Butuh Persetujuan ({pendingApprovals.length})</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Karyawan & Tipe Cuti</th>
                <th className="py-3 px-4">Periode Tanggal</th>
                <th className="py-3 px-4">Durasi</th>
                <th className="py-3 px-4">Alasan / Keterangan</th>
                <th className="py-3 px-4">Lampiran Bukti</th>
                <th className="py-3 px-4">Status</th>
                {canApprove && <th className="py-3 px-4 text-center">Aksi Persetujuan</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan={canApprove ? 7 : 6} className="py-12 text-center text-slate-400">
                    Tidak ada data cuti atau izin pada tab ini.
                  </td>
                </tr>
              ) : (
                displayedList.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{req.userName}</p>
                      <span className="inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {req.leaveType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{formatIndonesianDate(req.startDate)}</p>
                      <p className="text-[10px] text-slate-400">s/d {formatIndonesianDate(req.endDate)}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {req.daysCount} Hari
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                      {req.reason}
                    </td>
                    <td className="py-3 px-4">
                      {req.attachmentName ? (
                        <button
                          onClick={() => setPreviewAttachment({ name: req.attachmentName!, type: req.leaveType })}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[120px]">{req.attachmentName}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Tanpa Lampiran</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          req.status === 'Disetujui'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'Ditolak'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    {canApprove && (
                      <td className="py-3 px-4 text-center">
                        {req.status === 'Menunggu' ? (
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => onApproveLeave && onApproveLeave(req.id, 'Disetujui')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-xs cursor-pointer"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => onRejectLeave && onRejectLeave(req.id, 'Ditolak')}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-xs cursor-pointer"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Selesai Ditinjau</span>
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

      {/* MODAL: Pengajuan Cuti / Izin Sakit Baru */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="bg-[#0F2038] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Formulir Pengajuan Cuti & Izin Sakit</h3>
                <p className="text-xs text-slate-300">Pengajuan cuti tahunan, sakit, dan izin khusus ketenagakerjaan</p>
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
                <label className="font-bold text-slate-700 block mb-1">Jenis Cuti / Izin *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden"
                >
                  <option value="Cuti Tahunan">Cuti Tahunan (Potong Kuota - Sisa: {currentUser.leaveQuota.remaining} Hari)</option>
                  <option value="Cuti Sakit">Izin Sakit (Wajib / Lampirkan Surat Dokter)</option>
                  <option value="Cuti Menikah">Cuti Menikah Karyawan (3 Hari Resmi Depnaker)</option>
                  <option value="Cuti Melahirkan">Cuti Istri Melahirkan / Keguguran (2 Hari)</option>
                  <option value="Cuti Berduka / Keluarga">Cuti Kemalangan Keluarga Inti (2 Hari)</option>
                  <option value="Cuti Khusus / Izin">Izin Khusus (Cuti Haid / Keperluan Penting)</option>
                  <option value="Unpaid Leave">Unpaid Leave (Izin di Luar Tanggungan)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Mulai *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Selesai *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Estimasi Hari Kerja Efektif:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">{daysCount} Hari</span>
              </div>

              {leaveType === 'Cuti Sakit' && (
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3">
                  <h4 className="font-bold text-rose-900 flex items-center gap-1.5 text-xs">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    <span>Informasi Surat Keterangan Sakit / Dokter</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nama Klinik / Rumah Sakit</label>
                      <input
                        type="text"
                        placeholder="Contoh: RS Siloam / Klinik Kimia Farma"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nama Dokter Pemeriksa</label>
                      <input
                        type="text"
                        placeholder="Contoh: dr. Bambang Sp.PD"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Attachment upload */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Lampirkan Berkas / Surat Dokter / Bukti Pendukung
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleSimulatedFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-700">
                    {attachmentName ? `Berkas Terpilih: ${attachmentName}` : 'Klik atau seret foto/PDF Surat Dokter ke sini'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Format didukung: JPG, PNG, PDF (Maks 5 MB)</p>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alasan Lengkap Pengajuan *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Jelaskan alasan pengajuan cuti atau keperluan izin Anda..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Kirim Permohonan Cuti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Preview Attachment Surat Dokter */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#0F2038] text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Paperclip className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm truncate max-w-[300px]">{previewAttachment.name}</h3>
              </div>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-center">
              <div className="w-full h-48 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-4 text-slate-500">
                <FileCheck className="w-12 h-12 text-emerald-600 mb-2" />
                <p className="font-bold text-slate-800 text-xs">Surat Keterangan Dokter Terverifikasi</p>
                <p className="text-[11px] text-slate-500 font-mono mt-1">{previewAttachment.name}</p>
                <span className="mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Tanda Tangan & Cap Klinik Valid
                </span>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Tutup Lampiran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

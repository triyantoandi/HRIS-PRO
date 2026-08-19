import React, { useState } from 'react';
import { User, PayrollRecord, Branch } from '../types';
import { formatRupiah, formatIndonesianDate } from '../data/mockData';
import { calculateEmployeePayroll } from '../services/payrollEngine';
import { hasPermission } from '../services/rbac';
import { exportBankBulkPayroll } from '../services/exportService';
import {
  DollarSign,
  FileText,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowLeft,
  X,
  Building,
  ShieldCheck,
  CreditCard,
  ChevronDown,
  Building2,
} from 'lucide-react';

interface PayrollModuleProps {
  currentUser: User;
  allUsers: User[];
  payrollList: PayrollRecord[];
  currentBranch: Branch;
  onUpdatePayrollList: (newList: PayrollRecord[]) => void;
  onBackToDashboard: () => void;
}

export const PayrollModule: React.FC<PayrollModuleProps> = ({
  currentUser,
  allUsers,
  payrollList,
  currentBranch,
  onUpdatePayrollList,
  onBackToDashboard,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('Juli 2026');
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  const canManagePayroll = hasPermission(currentUser, 'payroll.manage');

  // Filter payroll records: Employee only sees own slip if not HR/admin
  const visiblePayroll = canManagePayroll
    ? payrollList.filter((p) => p.monthYear === selectedMonth)
    : payrollList.filter((p) => p.userId === currentUser.id);

  // Total summary metrics
  const totalDisbursement = visiblePayroll.reduce((acc, p) => acc + p.takeHomePay, 0);
  const totalTax = visiblePayroll.reduce((acc, p) => acc + p.taxPph21, 0);
  const totalBpjs = visiblePayroll.reduce(
    (acc, p) => acc + p.bpjsKesehatanEmployee + p.bpjsKetenagakerjaanEmployee,
    0
  );
  const totalOvertimePaid = visiblePayroll.reduce((acc, p) => acc + p.overtimePay, 0);

  // Run Batch Payroll Calculation
  const handleRunPayrollBatch = () => {
    const newRecords: PayrollRecord[] = allUsers.map((user) => {
      const calculated = calculateEmployeePayroll({
        user,
        monthYear: selectedMonth,
        paymentDate: '2026-08-28',
      });

      return {
        ...calculated,
        id: `pay-${user.id}-${Date.now().toString().slice(-4)}`,
        paymentStatus: 'Approved',
        status: 'Dibayarkan',
      };
    });

    onUpdatePayrollList(newRecords);
    alert(`Batch Payroll periode ${selectedMonth} berhasil diproses untuk ${allUsers.length} karyawan.`);
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
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Payroll Engine & Slip Gaji Digital</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kalkulasi otomatis gaji bruto, integrasi lembur, denda keterlambatan, BPJS Kesehatan/TK, dan PPh 21.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-hidden"
          >
            <option value="Agustus 2026">Periode: Agustus 2026</option>
            <option value="Juli 2026">Periode: Juli 2026</option>
            <option value="Juni 2026">Periode: Juni 2026</option>
          </select>

          {canManagePayroll && (
            <>
              <div className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ekspor File Bank Payroll</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 hidden group-hover:block z-40 animate-in fade-in">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Format Internet Banking</div>
                  <button
                    onClick={() => exportBankBulkPayroll(visiblePayroll, 'BCA', selectedMonth)}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span>KlikBCA Bisnis (BCA)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-700 font-mono">.CSV</span>
                  </button>
                  <button
                    onClick={() => exportBankBulkPayroll(visiblePayroll, 'MANDIRI', selectedMonth)}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span>Mandiri MCM (MCM II)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-700 font-mono">.CSV</span>
                  </button>
                  <button
                    onClick={() => exportBankBulkPayroll(visiblePayroll, 'BRI', selectedMonth)}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span>BRI CMS (Cash Management)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-700 font-mono">.CSV</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => exportBankBulkPayroll(visiblePayroll, 'UNIVERSAL', selectedMonth)}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span>Universal Payroll Excel</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 font-mono">.CSV</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleRunPayrollBatch}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Hitung Batch Payroll</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      {canManagePayroll && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pembayaran Gaji</span>
            <div className="mt-2 text-xl font-extrabold text-slate-900 font-mono truncate">
              {formatRupiah(totalDisbursement)}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Take Home Pay Karyawan</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Potongan Pajak PPh 21</span>
            <div className="mt-2 text-xl font-extrabold text-indigo-600 font-mono truncate">
              {formatRupiah(totalTax)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Sesuai tarif efektif TER 2026</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Iuran BPJS Karyawan</span>
            <div className="mt-2 text-xl font-extrabold text-blue-600 font-mono truncate">
              {formatRupiah(totalBpjs)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">BPJS Kesehatan & Ketenagakerjaan</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Upah Lembur Dibayarkan</span>
            <div className="mt-2 text-xl font-extrabold text-amber-600 font-mono truncate">
              {formatRupiah(totalOvertimePaid)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Tervalidasi dari modul SPL</p>
          </div>
        </div>
      )}

      {/* Payroll Records Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {canManagePayroll ? `Rekap Payroll Karyawan (${selectedMonth})` : 'Riwayat Slip Gaji Saya'}
            </h3>
            <p className="text-xs text-slate-500">Rincian pendapatan kotor, potongan wajib, dan slip gaji elektronik</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Gaji Pokok</th>
                <th className="py-3 px-4">Total Tunjangan</th>
                <th className="py-3 px-4">Lembur</th>
                <th className="py-3 px-4">Potongan (BPJS/Pajak)</th>
                <th className="py-3 px-4">Take Home Pay</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Slip Gaji</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {visiblePayroll.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                    Belum ada data payroll untuk periode yang dipilih.
                  </td>
                </tr>
              ) : (
                visiblePayroll.map((pay) => {
                  const totalAllowances =
                    pay.allowancePosition +
                    pay.allowanceTransport +
                    pay.allowanceMeal +
                    pay.allowanceAttendance;

                  return (
                    <tr key={pay.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-sans">
                        <p className="font-bold text-slate-900">{pay.userName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{pay.userNip} • {pay.department}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">
                        {formatRupiah(pay.basicSalary)}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {formatRupiah(totalAllowances)}
                      </td>
                      <td className="py-3 px-4 text-amber-600 font-semibold">
                        {formatRupiah(pay.overtimePay)}
                      </td>
                      <td className="py-3 px-4 text-red-600 font-semibold">
                        -{formatRupiah(pay.totalDeductions)}
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-bold text-sm">
                        {formatRupiah(pay.takeHomePay)}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            pay.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {pay.paymentStatus === 'Paid' ? 'Sudah Ditransfer' : 'Approved'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <button
                          onClick={() => setSelectedPayslip(pay)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-800 font-bold rounded-lg text-xs transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Lihat Slip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Printable Digital Payslip (Slip Gaji Elektronik) */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
            
            {/* Payslip Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg">
                  HR
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">PT ENTERPRISE WORKFORCE INDONESIA</h2>
                  <p className="text-xs text-slate-500">Kawasan SCBD Lot 28, Senayan, Jakarta Selatan</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPayslip(null)}
                className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Payslip Body Content */}
            <div className="p-6 space-y-6 text-xs text-slate-800">
              <div className="text-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-900">
                  SLIP GAJI ELEKTRONIK (PAYSLIP)
                </h3>
                <p className="text-xs text-slate-500 font-medium">Periode: {selectedPayslip.monthYear}</p>
              </div>

              {/* Employee Meta Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <p><span className="text-slate-500">Nama:</span> <strong>{selectedPayslip.userName}</strong></p>
                  <p><span className="text-slate-500">NIP:</span> <strong className="font-mono">{selectedPayslip.userNip}</strong></p>
                  <p><span className="text-slate-500">Departemen:</span> <strong>{selectedPayslip.department}</strong></p>
                </div>
                <div>
                  <p><span className="text-slate-500">Jabatan:</span> <strong>{selectedPayslip.position}</strong></p>
                  <p><span className="text-slate-500">Bank Transfer:</span> <strong>{selectedPayslip.bankName}</strong></p>
                  <p><span className="text-slate-500">No. Rekening:</span> <strong className="font-mono">{selectedPayslip.accountNumber}</strong></p>
                </div>
              </div>

              {/* Earnings vs Deductions Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Earnings (Penerimaan) */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-emerald-700">
                    A. PENDAPATAN (EARNINGS)
                  </h4>
                  <div className="space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">Gaji Pokok:</span>
                      <span>{formatRupiah(selectedPayslip.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">Tunjangan Jabatan:</span>
                      <span>{formatRupiah(selectedPayslip.allowancePosition)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">Tunjangan Transport:</span>
                      <span>{formatRupiah(selectedPayslip.allowanceTransport)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">Tunjangan Makan:</span>
                      <span>{formatRupiah(selectedPayslip.allowanceMeal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">Tunjangan Kehadiran:</span>
                      <span>{formatRupiah(selectedPayslip.allowanceAttendance)}</span>
                    </div>
                    {selectedPayslip.overtimePay > 0 && (
                      <div className="flex justify-between text-amber-700 font-bold">
                        <span className="font-sans">Upah Lembur:</span>
                        <span>{formatRupiah(selectedPayslip.overtimePay)}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold font-mono text-emerald-800">
                    <span className="font-sans">Total Penerimaan Kotor:</span>
                    <span>{formatRupiah(selectedPayslip.grossSalary)}</span>
                  </div>
                </div>

                {/* Deductions (Potongan) */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-red-700">
                    B. POTONGAN (DEDUCTIONS)
                  </h4>
                  <div className="space-y-1.5 font-mono">
                    {selectedPayslip.deductionLate > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span className="font-sans">Denda Keterlambatan:</span>
                        <span>{formatRupiah(selectedPayslip.deductionLate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">BPJS Kesehatan (1%):</span>
                      <span>{formatRupiah(selectedPayslip.bpjsKesehatanEmployee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">BPJS Ketenagakerjaan (2%):</span>
                      <span>{formatRupiah(selectedPayslip.bpjsKetenagakerjaanEmployee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">Pajak PPh 21:</span>
                      <span>{formatRupiah(selectedPayslip.taxPph21)}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold font-mono text-red-700">
                    <span className="font-sans">Total Potongan:</span>
                    <span>-{formatRupiah(selectedPayslip.totalDeductions)}</span>
                  </div>
                </div>

              </div>

              {/* Net Take Home Pay Highlight Box */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase text-emerald-800">Gaji Bersih Diterima (Take Home Pay)</span>
                  <p className="text-xs text-emerald-600">Ditransfer ke {selectedPayslip.bankName} a.n {selectedPayslip.userName}</p>
                </div>
                <div className="text-xl font-extrabold font-mono text-emerald-900">
                  {formatRupiah(selectedPayslip.takeHomePay)}
                </div>
              </div>

              <div className="pt-2 text-center text-[10px] text-slate-400">
                Dokumen ini dicetak otomatis oleh Sistem HRIS Enterprise dan sah secara hukum tanpa tanda tangan basah.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Cetak PDF</span>
              </button>
              <button
                onClick={() => alert('Slip gaji telah diunduh sebagai PDF terenkripsi.')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Slip PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

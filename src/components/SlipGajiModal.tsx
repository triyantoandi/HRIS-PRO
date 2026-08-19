import React from 'react';
import { X, Printer, Download, CheckCircle, Building2, ShieldCheck } from 'lucide-react';
import { PayrollRecord } from '../types';
import { COMPANY_INFO, formatRupiah, formatIndonesianDate } from '../data/mockData';

interface SlipGajiModalProps {
  payroll: PayrollRecord | null;
  onClose: () => void;
}

// Convert number to Indonesian words (Terbilang)
function terbilang(angka: number): string {
  const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  if (angka < 12) {
    return bilangan[angka];
  } else if (angka < 20) {
    return terbilang(angka - 10) + ' Belas';
  } else if (angka < 100) {
    return terbilang(Math.floor(angka / 10)) + ' Puluh ' + terbilang(angka % 10);
  } else if (angka < 200) {
    return 'Seratus ' + terbilang(angka - 100);
  } else if (angka < 1000) {
    return terbilang(Math.floor(angka / 100)) + ' Ratus ' + terbilang(angka % 100);
  } else if (angka < 2000) {
    return 'Seribu ' + terbilang(angka - 1000);
  } else if (angka < 1000000) {
    return terbilang(Math.floor(angka / 1000)) + ' Ribu ' + terbilang(angka % 1000);
  } else if (angka < 1000000000) {
    return terbilang(Math.floor(angka / 1000000)) + ' Juta ' + terbilang(angka % 1000000);
  } else if (angka < 1000000000000) {
    return terbilang(Math.floor(angka / 1000000000)) + ' Miliar ' + terbilang(angka % 1000000000);
  }
  return angka.toString();
}

export const SlipGajiModal: React.FC<SlipGajiModalProps> = ({ payroll, onClose }) => {
  if (!payroll) return null;

  const handlePrint = () => {
    window.print();
  };

  const words = terbilang(payroll.takeHomePay).trim() + ' Rupiah';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      
      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 print:border-none print:shadow-none print:max-w-full">
        
        {/* Top bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400">
              Dokumen Resmi
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-sm font-semibold">Slip Gaji Digital ({payroll.monthYear})</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="printSlipBtn"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              id="closeSlipModalBtn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800" id="printablePayslip">
          
          {/* Company Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-700 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-xs">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {COMPANY_INFO.legalName}
                </h2>
                <p className="text-xs text-slate-500 leading-tight">
                  {COMPANY_INFO.address}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  NPWP: {COMPANY_INFO.npwp} • Telp: {COMPANY_INFO.phone}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto">
              <div className="inline-block bg-blue-50 text-blue-800 font-bold text-xs uppercase px-3 py-1 rounded border border-blue-200">
                SLIP GAJI KARYAWAN
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Periode: <span className="text-slate-900 font-bold">{payroll.monthYear}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Tgl Bayar: {formatIndonesianDate(payroll.paymentDate)}
              </p>
            </div>
          </div>

          {/* Employee Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Nomor Induk (NIP)</span>
              <span className="font-bold text-slate-900 font-mono">{payroll.userNip}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Nama Lengkap</span>
              <span className="font-bold text-slate-900">{payroll.userName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Jabatan / Posisi</span>
              <span className="font-semibold text-slate-800">{payroll.position}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Departemen</span>
              <span className="font-semibold text-slate-800">{payroll.department}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Rekening Bank</span>
              <span className="font-medium text-slate-800">{payroll.bankInfo.bankName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">No. Rekening</span>
              <span className="font-mono font-bold text-slate-900">{payroll.bankInfo.accountNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Nama Pemilik Rekening</span>
              <span className="font-medium text-slate-800">{payroll.bankInfo.accountHolder}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Status Pembayaran</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                <CheckCircle className="w-3 h-3" /> {payroll.status}
              </span>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid sm:grid-cols-2 gap-6">
            
            {/* Table: Penerimaan (Earnings) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wider flex justify-between items-center">
                <span>A. PENERIMAAN / PENGHASILAN</span>
                <span className="text-emerald-700 font-semibold">(+)</span>
              </div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-600">Gaji Pokok</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-900">
                      {formatRupiah(payroll.earnings.basicSalary)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-600">Tunjangan Jabatan</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-900">
                      {formatRupiah(payroll.earnings.allowancePosition)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-600">Tunjangan Transportasi</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-900">
                      {formatRupiah(payroll.earnings.allowanceTransport)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-600">Tunjangan Uang Makan</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-900">
                      {formatRupiah(payroll.earnings.allowanceMeal)}
                    </td>
                  </tr>
                  {payroll.earnings.overtimePay > 0 && (
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-600">Uang Lembur (Overtime)</td>
                      <td className="px-4 py-2 text-right font-medium text-slate-900">
                        {formatRupiah(payroll.earnings.overtimePay)}
                      </td>
                    </tr>
                  )}
                  {payroll.earnings.bonus > 0 && (
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-600">Bonus Prestasi / Insentif</td>
                      <td className="px-4 py-2 text-right font-medium text-slate-900">
                        {formatRupiah(payroll.earnings.bonus)}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t border-slate-200">
                    <td className="px-4 py-2.5 text-slate-800">Total Penghasilan Bruto</td>
                    <td className="px-4 py-2.5 text-right text-emerald-700">
                      {formatRupiah(payroll.earnings.totalEarnings)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Table: Potongan (Deductions) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wider flex justify-between items-center">
                <span>B. POTONGAN RESMI</span>
                <span className="text-red-700 font-semibold">(-)</span>
              </div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-600">BPJS Kesehatan (1%)</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-900">
                      {formatRupiah(payroll.deductions.bpjsKesehatan)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-600">BPJS Ketenagakerjaan (JHT 2%)</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-900">
                      {formatRupiah(payroll.deductions.bpjsKetenagakerjaan)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-600">PPh Pasal 21 (Pajak)</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-900">
                      {formatRupiah(payroll.deductions.pph21)}
                    </td>
                  </tr>
                  {payroll.deductions.lateDeduction > 0 && (
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-600">Potongan Keterlambatan Presensi</td>
                      <td className="px-4 py-2 text-right font-medium text-slate-900">
                        {formatRupiah(payroll.deductions.lateDeduction)}
                      </td>
                    </tr>
                  )}
                  {payroll.deductions.otherDeductions > 0 && (
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-600">Potongan Lainnya / Kasbon</td>
                      <td className="px-4 py-2 text-right font-medium text-slate-900">
                        {formatRupiah(payroll.deductions.otherDeductions)}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t border-slate-200">
                    <td className="px-4 py-2.5 text-slate-800">Total Potongan</td>
                    <td className="px-4 py-2.5 text-right text-red-600">
                      {formatRupiah(payroll.deductions.totalDeductions)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

          </div>

          {/* Take Home Pay Box */}
          <div className="bg-blue-50/80 border-2 border-blue-300 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                GAJI BERSIH DITERIMA (TAKE HOME PAY)
              </span>
              <p className="text-xs text-blue-800 italic mt-0.5">
                Terbilang: <span className="font-semibold text-slate-900">"{words}"</span>
              </p>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 tracking-tight font-mono">
              {formatRupiah(payroll.takeHomePay)}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-4 grid grid-cols-2 text-center text-xs text-slate-600">
            <div>
              <p className="font-medium">Diterima oleh Karyawan,</p>
              <div className="h-16 flex items-end justify-center">
                <span className="text-[11px] text-slate-400 italic">(Digital Verified)</span>
              </div>
              <p className="font-bold text-slate-900 border-t border-slate-300 inline-block px-8 pt-1">
                {payroll.userName}
              </p>
            </div>

            <div>
              <p className="font-medium">Disetujui oleh HR Manager,</p>
              <div className="h-16 flex items-end justify-center">
                <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> e-Signature Verified
                </span>
              </div>
              <p className="font-bold text-slate-900 border-t border-slate-300 inline-block px-8 pt-1">
                Andi Triyanto, S.Kom
              </p>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
            Dokumen ini dicetak secara otomatis melalui Sistem HRIS Enterprise PT Nusa Cipta Teknologi dan sah tanpa tanda tangan basah fisik.
          </div>

        </div>

      </div>

    </div>
  );
};

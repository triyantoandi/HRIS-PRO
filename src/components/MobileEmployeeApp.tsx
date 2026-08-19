import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, Branch, LeaveRequest, OvertimeRequest } from '../types';
import { formatIndonesianDate, formatRupiah } from '../data/mockData';
import {
  Smartphone,
  Clock,
  MapPin,
  Calendar,
  Briefcase,
  Flame,
  DollarSign,
  FileEdit,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface MobileEmployeeAppProps {
  currentUser: User;
  currentBranch: Branch;
  attendanceList: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  overtimeRequests: OvertimeRequest[];
  onClockIn: (record: Omit<AttendanceRecord, 'id'>) => void;
  onClockOut: (attendanceId: string, clockOutTime: string) => void;
  onSelectModule: (module: string) => void;
  onBackToDashboard: () => void;
}

export const MobileEmployeeApp: React.FC<MobileEmployeeAppProps> = ({
  currentUser,
  currentBranch,
  attendanceList,
  leaveRequests,
  overtimeRequests,
  onClockIn,
  onClockOut,
  onSelectModule,
  onBackToDashboard,
}) => {
  const [time, setTime] = useState('');
  const todayStr = '2026-08-18';

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        new Intl.DateTimeFormat('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(now)
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayRecord = attendanceList.find(
    (a) => a.userId === currentUser.id && a.date === todayStr
  );

  const handleMobilePunch = () => {
    const nowTime = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date()).replace(/\./g, ':');

    if (!todayRecord) {
      onClockIn({
        userId: currentUser.id,
        userName: currentUser.name,
        userNip: currentUser.nip,
        department: currentUser.department,
        branchId: currentBranch.id,
        branchName: currentBranch.name,
        date: todayStr,
        shiftId: 'sh-regular',
        shiftName: 'Office Normal (08:00 - 17:00)',
        clockInTime: nowTime,
        status: 'Hadir',
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        workType: 'WFO (Kantor)',
        location: currentBranch.address,
        coordinates: currentBranch.coordinates,
        distanceFromOfficeMeters: 12,
        isWithinGeofence: true,
        deviceInfo: 'iPhone 15 Pro • Enterprise ESS Mobile App',
      });
    } else if (!todayRecord.clockOutTime) {
      onClockOut(todayRecord.id, nowTime);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 mb-2 cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Dashboard
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-blue-600" />
            <span>Portal Mobile ESS (Employee Self-Service)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Antarmuka responsif mobile untuk presensi GPS real-time, pengajuan cuti, dan cek slip gaji karyawan.
          </p>
        </div>
      </div>

      {/* Centered Mobile Phone Container Mockup */}
      <div className="flex justify-center py-4">
        <div className="w-full max-w-sm bg-slate-900 rounded-[40px] p-3.5 shadow-2xl border-4 border-slate-800 relative">
          
          {/* Phone Speaker Notch */}
          <div className="w-28 h-4 bg-slate-950 rounded-full mx-auto mb-3 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
            <div className="w-10 h-1 bg-slate-800 rounded-full" />
          </div>

          {/* Phone Screen Canvas */}
          <div className="bg-slate-50 rounded-[32px] overflow-hidden min-h-[640px] flex flex-col justify-between text-slate-800">
            
            {/* App Screen Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <img
                    src={currentUser.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50"
                  />
                  <div>
                    <h3 className="font-bold text-sm leading-tight">{currentUser.name}</h3>
                    <p className="text-[10px] text-blue-200">{currentUser.position}</p>
                  </div>
                </div>
                <div className="px-2 py-1 bg-white/20 rounded-lg text-[10px] font-bold font-mono">
                  {currentBranch.code}
                </div>
              </div>

              {/* Live Clock Card */}
              <div className="mt-4 p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
                <p className="text-[10px] text-blue-100 font-medium">{formatIndonesianDate(todayStr)}</p>
                <div className="text-2xl font-extrabold font-mono tracking-tight my-1">{time} WIB</div>
                <div className="inline-flex items-center space-x-1 text-[10px] text-emerald-300 font-medium">
                  <MapPin className="w-3 h-3" />
                  <span>{currentBranch.name} (Radius Valid)</span>
                </div>
              </div>
            </div>

            {/* Middle Content */}
            <div className="p-4 space-y-4 flex-1">
              
              {/* Big Punch Button */}
              <div className="text-center pt-2">
                {!todayRecord ? (
                  <button
                    onClick={handleMobilePunch}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-blue-500/30 active:scale-95 transition cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Clock className="w-5 h-5" />
                    <span>TAP TO CLOCK IN</span>
                  </button>
                ) : !todayRecord.clockOutTime ? (
                  <button
                    onClick={handleMobilePunch}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-sm shadow-lg shadow-red-500/30 active:scale-95 transition cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Clock className="w-5 h-5" />
                    <span>TAP TO CLOCK OUT</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold text-center">
                    ✓ Presensi Selesai ({todayRecord.clockInTime} - {todayRecord.clockOutTime})
                  </div>
                )}
              </div>

              {/* Quick ESS Menu Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => onSelectModule('cuti')}
                  className="p-3 bg-white rounded-2xl border border-slate-200 text-left hover:bg-blue-50/50 transition cursor-pointer shadow-2xs"
                >
                  <Briefcase className="w-5 h-5 text-indigo-600 mb-1.5" />
                  <p className="text-xs font-bold text-slate-900">Ajukan Cuti</p>
                  <p className="text-[10px] text-slate-400">Sisa: {currentUser.leaveQuota.remaining} Hari</p>
                </button>

                <button
                  onClick={() => onSelectModule('overtime')}
                  className="p-3 bg-white rounded-2xl border border-slate-200 text-left hover:bg-amber-50/50 transition cursor-pointer shadow-2xs"
                >
                  <Flame className="w-5 h-5 text-amber-500 mb-1.5" />
                  <p className="text-xs font-bold text-slate-900">Ajukan SPL</p>
                  <p className="text-[10px] text-slate-400">Lembur Karyawan</p>
                </button>

                <button
                  onClick={() => onSelectModule('payroll')}
                  className="p-3 bg-white rounded-2xl border border-slate-200 text-left hover:bg-emerald-50/50 transition cursor-pointer shadow-2xs"
                >
                  <DollarSign className="w-5 h-5 text-emerald-600 mb-1.5" />
                  <p className="text-xs font-bold text-slate-900">Slip Gaji</p>
                  <p className="text-[10px] text-slate-400">E-Payslip Digital</p>
                </button>

                <button
                  onClick={() => onSelectModule('shift')}
                  className="p-3 bg-white rounded-2xl border border-slate-200 text-left hover:bg-blue-50/50 transition cursor-pointer shadow-2xs"
                >
                  <Calendar className="w-5 h-5 text-blue-600 mb-1.5" />
                  <p className="text-xs font-bold text-slate-900">Jadwal Shift</p>
                  <p className="text-[10px] text-slate-400">Roster Kerja</p>
                </button>
              </div>

              {/* Status Badge Footer */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-700">GPS & Face Biometric</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>

            </div>

            {/* Phone Bottom Home Bar */}
            <div className="p-3 bg-white border-t border-slate-100 flex justify-center">
              <div className="w-32 h-1 bg-slate-300 rounded-full" />
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

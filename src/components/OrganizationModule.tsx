import React, { useState } from 'react';
import { User, Branch } from '../types';
import { DEPARTMENTS, DIVISIONS } from '../data/mockData';
import {
  Building2,
  Users,
  Briefcase,
  ChevronRight,
  ArrowLeft,
  Search,
  Layers,
  MapPin,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';

interface OrganizationModuleProps {
  currentUser: User;
  allUsers: User[];
  branches: Branch[];
  onBackToDashboard: () => void;
}

export const OrganizationModule: React.FC<OrganizationModuleProps> = ({
  currentUser,
  allUsers,
  branches,
  onBackToDashboard,
}) => {
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredUsers = allUsers.filter((u) => {
    const matchDiv = selectedDivision === 'ALL' || u.division === selectedDivision;
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDiv && matchSearch;
  });

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
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Struktur Organisasi & Divisi Perusahaan</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hierarki kepemimpinan, pemetaan divisi kerja, departemen, dan alokasi personel multi-cabang.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari posisi atau nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Division Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => setSelectedDivision('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedDivision === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Divisi ({allUsers.length})
        </button>
        {DIVISIONS.map((div) => {
          const count = allUsers.filter((u) => u.division === div).length;
          return (
            <button
              key={div}
              onClick={() => setSelectedDivision(div)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedDivision === div
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {div} ({count})
            </button>
          );
        })}
      </div>

      {/* Executive Leadership Hierarchy Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-300">
              Executive Leadership & Board Level
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-white/10 rounded-full border border-white/20">
            Top Level Management
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {allUsers
            .filter((u) => u.role === 'super_admin' || u.role === 'director' || u.role === 'hr_admin')
            .slice(0, 3)
            .map((exec) => (
              <div
                key={exec.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center space-x-3.5"
              >
                <img
                  src={exec.avatar}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400/60 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">{exec.name}</h4>
                  <p className="text-xs text-amber-300 truncate font-semibold">{exec.position}</p>
                  <p className="text-[10px] text-slate-300 truncate">{exec.department}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Department Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DEPARTMENTS.map((dept) => {
          const members = filteredUsers.filter((u) => u.department === dept);
          if (members.length === 0 && selectedDivision !== 'ALL') return null;

          return (
            <div
              key={dept}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                      {dept.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{dept}</h4>
                      <p className="text-[10px] text-slate-400">{members.length} Personel Aktif</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Dept
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {members.slice(0, 4).map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <img
                          src={m.avatar}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{m.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{m.position}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-200/60 shrink-0 ml-2">
                        {m.branchName?.split(' ')[0] || 'HQ'}
                      </span>
                    </div>
                  ))}

                  {members.length > 4 && (
                    <p className="text-center text-[10px] font-bold text-blue-600 pt-1">
                      + {members.length - 4} Karyawan lainnya
                    </p>
                  )}

                  {members.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-3">Tidak ada data anggota</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Alokasi Kantor Cabang</span>
                <span className="font-bold text-slate-700">Multi-Site</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

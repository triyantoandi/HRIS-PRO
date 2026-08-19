import React, { useState } from 'react';
import { User } from '../types';
import { hasPermission, getRoleDisplayName } from '../services/rbac';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Briefcase,
  DollarSign,
  FileSpreadsheet,
  Building2,
  ShieldCheck,
  Settings,
  Flame,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Smartphone,
  X,
  Sparkles,
} from 'lucide-react';

export interface SidebarProps {
  currentUser: User;
  activeModule: string;
  onSelectModule: (module: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  pendingLeavesCount?: number;
  pendingOvertimeCount?: number;
  pendingCorrectionsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeModule,
  onSelectModule,
  isMobileOpen = false,
  onCloseMobile = () => {},
  pendingLeavesCount = 0,
  pendingOvertimeCount = 0,
  pendingCorrectionsCount = 0,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isSuperOrAdmin =
    currentUser.role === 'super_admin' || currentUser.role === 'hr_admin' || currentUser.role === 'hr_staff';
  const isDirector = currentUser.role === 'director';
  const isFinance = currentUser.role === 'finance';
  const isManagerOrSpv = currentUser.role === 'manager' || currentUser.role === 'supervisor';

  const menuSections = [
    {
      title: 'UTAMA',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard HR',
          icon: LayoutDashboard,
          show: true,
        },
        {
          id: 'executive',
          label: 'Executive Analytics',
          icon: TrendingUp,
          show: isSuperOrAdmin || isDirector || isFinance,
          badge: 'C-Level',
        },
      ],
    },
    {
      title: 'WORKFORCE & STRUKTUR',
      items: [
        {
          id: 'workforce',
          label: 'Data Karyawan (360°)',
          icon: Users,
          show: hasPermission(currentUser, 'employee.view') || isSuperOrAdmin || isManagerOrSpv,
        },
        {
          id: 'organization',
          label: 'Struktur Organisasi',
          icon: Building2,
          show: true,
        },
      ],
    },
    {
      title: 'PRESENSI & JADWAL',
      items: [
        {
          id: 'absensi',
          label: 'Presensi & Geofence',
          icon: Clock,
          show: true,
          badge: pendingCorrectionsCount > 0 ? `${pendingCorrectionsCount}` : undefined,
        },
        {
          id: 'shift',
          label: 'Jadwal Shift & Roster',
          icon: CalendarDays,
          show: true,
        },
        {
          id: 'cuti',
          label: 'Manajemen Cuti & Izin',
          icon: Briefcase,
          show: true,
          badge: pendingLeavesCount > 0 ? `${pendingLeavesCount}` : undefined,
        },
        {
          id: 'overtime',
          label: 'Lembur & SPL (Kemenaker)',
          icon: Flame,
          show: true,
          badge: pendingOvertimeCount > 0 ? `${pendingOvertimeCount}` : undefined,
        },
      ],
    },
    {
      title: 'FINANCE & PAYROLL',
      items: [
        {
          id: 'payroll',
          label: 'Payroll & Slip Gaji',
          icon: DollarSign,
          show: true,
        },
      ],
    },
    {
      title: 'LAPORAN & ADMIN',
      items: [
        {
          id: 'reports',
          label: 'Laporan & Analytics',
          icon: FileSpreadsheet,
          show: hasPermission(currentUser, 'report.view') || isSuperOrAdmin || isFinance || isDirector,
        },
        {
          id: 'mobile-ess',
          label: 'Mobile ESS Preview',
          icon: Smartphone,
          show: true,
          badge: 'Mobile',
        },
        {
          id: 'audit_trail',
          label: 'Audit Trail & Log',
          icon: ShieldCheck,
          show: hasPermission(currentUser, 'audit.view') || isSuperOrAdmin || isDirector,
        },
        {
          id: 'admin',
          label: 'Pengaturan Sistem',
          icon: Settings,
          show: hasPermission(currentUser, 'settings.manage') || isSuperOrAdmin,
        },
      ],
    },
  ];

  const handleSelect = (id: string) => {
    if (typeof onSelectModule === 'function') {
      onSelectModule(id);
    }
    if (isMobileOpen && typeof onCloseMobile === 'function') {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Aside - Deep Corporate Navy Blue */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0F2038] text-slate-200 flex flex-col transition-all duration-300 shadow-2xl border-r border-[#1E3A5F] lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-72`}
      >
        {/* Header / Brand with Blue & Green Identity */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E3A5F] bg-[#0A172A]/90">
          <div
            onClick={() => handleSelect('dashboard')}
            className="flex items-center space-x-3 overflow-hidden cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-900/30 shrink-0 group-hover:scale-105 transition">
              HR
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-white tracking-tight text-sm leading-tight truncate flex items-center gap-1.5">
                  <span>ENTERPRISE HRIS</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </span>
                <span className="text-[10px] text-emerald-300 font-semibold truncate">PT Nusa Cipta Teknologi</span>
              </div>
            )}
          </div>

          {/* Toggle Collapse for Desktop */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E3A5F] transition cursor-pointer"
            title={isCollapsed ? 'Perluas Menu Sidebar' : 'Ciutkan Menu Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Close Button for Mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E3A5F] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Link List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
          {menuSections.map((section, idx) => {
            const visibleItems = section.items.filter((item) => item.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-extrabold text-blue-300/80 uppercase tracking-wider mb-1.5">
                    {section.title}
                  </div>
                )}

                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeModule === item.id ||
                    (item.id === 'shift' && activeModule === 'shift_schedule') ||
                    (item.id === 'admin' && (activeModule === 'settings' || activeModule === 'audit_trail' && !isSuperOrAdmin));

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'
                      } rounded-xl text-xs font-semibold transition-all group relative cursor-pointer text-left ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 font-bold border border-emerald-400/40'
                          : 'text-slate-300 hover:text-emerald-300 hover:bg-[#182F4D]'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                        } ${!isCollapsed ? 'mr-3' : ''}`}
                      />
                      
                      {!isCollapsed && <span className="truncate">{item.label}</span>}

                      {/* Badge counter or tag */}
                      {!isCollapsed && item.badge && (
                        <span
                          className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/25 text-white'
                              : item.badge === 'C-Level'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                              : item.badge === 'Mobile'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Collapsed view indicator dot */}
                      {isCollapsed && item.badge && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-[#0F2038]" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Active User Card in Bottom Footer */}
        <div className="p-3 border-t border-[#1E3A5F] bg-[#0A172A]/90">
          <div
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'space-x-3'
            } p-2 rounded-xl bg-[#142944] border border-[#1E3A5F]`}
          >
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/60"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#142944]" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-emerald-400 truncate font-semibold">
                  {getRoleDisplayName(currentUser.role)}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

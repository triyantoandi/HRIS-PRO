import React, { useState, useEffect } from 'react';
import { User, Branch, NotificationItem } from '../types';
import { getRoleDisplayName } from '../services/rbac';
import {
  Bell,
  LogOut,
  MapPin,
  Menu,
  ChevronDown,
  Clock as ClockIcon,
  CheckCircle2,
  CheckCheck,
  Building,
  UserCheck,
  Flame,
  Cloud,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  branches: Branch[];
  currentBranch: Branch;
  onSelectBranch: (branch: Branch) => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onLogout: () => void;
  onSwitchUser: (user: User) => void;
  onToggleMobileSidebar: () => void;
  onNavigateModule: (module: string) => void;
  isFirebaseOnline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  branches,
  currentBranch,
  onSelectBranch,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onLogout,
  onSwitchUser,
  onToggleMobileSidebar,
  onNavigateModule,
}) => {
  const [time, setTime] = useState<string>('');
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        new Intl.DateTimeFormat('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(now) + ' WIB'
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(
    (n) => !n.isRead && (n.targetUserId === 'all' || n.targetUserId === currentUser.id)
  ).length;

  const userNotifications = notifications.filter(
    (n) => n.targetUserId === 'all' || n.targetUserId === currentUser.id
  );

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Mobile menu button & Branch Indicator */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Branch Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBranchMenu(!showBranchMenu)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <Building className="w-3.5 h-3.5 text-blue-700" />
              <span className="hidden sm:inline font-medium text-slate-600">Cabang:</span>
              <span className="font-bold text-blue-900 truncate max-w-[140px] sm:max-w-[200px]">
                {currentBranch.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
            </button>

            {showBranchMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowBranchMenu(false)} />
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Pilih Kantor Cabang
                  </div>
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSelectBranch(b);
                        setShowBranchMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition cursor-pointer ${
                        b.id === currentBranch.id ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <p className="font-semibold">{b.name}</p>
                          <p className="text-[10px] text-slate-500">{b.city} • Radius {b.radiusMeters}m</p>
                        </div>
                      </div>
                      {b.id === currentBranch.id && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Live Clock Badge with Blue panel & Emerald Pulsing Dot */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#0F2038]/5 border border-[#1E3A5F]/20 text-slate-800 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <ClockIcon className="w-3.5 h-3.5 text-blue-700" />
            <span>{time}</span>
          </div>

          {/* Firebase Real-time Cloud Status Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-medium" title="Terhubung ke Database Cloud Firebase Firestore">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
            <span className="text-[11px] font-bold text-amber-950">Firebase Sync Aktif</span>
          </div>
        </div>

        {/* Right: Notification & User Switcher */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Notifikasi Sistem"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifMenu(false)} />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="px-4 py-3 bg-[#0F2038] text-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-sm">Pusat Notifikasi</span>
                      {unreadCount > 0 && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {unreadCount} Baru
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsAsRead}
                        className="text-xs text-emerald-300 hover:text-white flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Tandai Semua Dibaca</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {userNotifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        Tidak ada notifikasi saat ini.
                      </div>
                    ) : (
                      userNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            onMarkNotificationAsRead(notif.id);
                            if (notif.actionUrlModule) {
                              onNavigateModule(notif.actionUrlModule);
                              setShowNotifMenu(false);
                            }
                          }}
                          className={`p-3.5 hover:bg-emerald-50/50 transition cursor-pointer flex items-start space-x-3 ${
                            !notif.isRead ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              !notif.isRead ? 'bg-emerald-600 ring-4 ring-emerald-100' : 'bg-transparent'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-mono">{notif.createdAt}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile & Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-1.5 pr-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-emerald-500/40"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-emerald-700 font-bold truncate">
                  {getRoleDisplayName(currentUser.role)}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{currentUser.nip} • {currentUser.email}</p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                      Role: {getRoleDisplayName(currentUser.role)}
                    </div>
                  </div>

                  {/* User Profile Summary */}
                  <div className="py-2 px-4 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Jabatan:</span>
                      <span className="font-semibold text-slate-800">{currentUser.position}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Departemen:</span>
                      <span className="font-semibold text-slate-800">{currentUser.department}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Penempatan:</span>
                      <span className="font-semibold text-blue-900">{currentBranch.name}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-2 px-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};

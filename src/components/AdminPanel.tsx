import React, { useState } from 'react';
import { User, Branch, Shift, AuditLog, Role, SystemSettings } from '../types';
import { INITIAL_SYSTEM_SETTINGS, INITIAL_SHIFTS } from '../data/mockData';
import { ROLE_PERMISSIONS, getRoleDisplayName, hasPermission, Permission } from '../services/rbac';
import { calculateDistanceMeters } from '../services/geofence';
import {
  Settings,
  Building,
  Shield,
  Plus,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowLeft,
  X,
  Building2,
  Sliders,
  Clock,
  Briefcase,
  DollarSign,
  Save,
  Check,
  Navigation,
  Compass,
  Radio,
  Edit2,
  Trash2,
  AlertTriangle,
  Globe2,
  Crosshair,
  Map,
  Eye,
  CheckCheck,
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
  branches: Branch[];
  shifts?: Shift[];
  systemSettings?: SystemSettings;
  auditLogs: AuditLog[];
  onAddBranch: (branch: Branch) => void;
  onUpdateBranch?: (branch: Branch) => void;
  onDeleteBranch?: (branchId: string) => void;
  onAddShift?: (shift: Shift) => void;
  onUpdateShift?: (shift: Shift) => void;
  onDeleteShift?: (shiftId: string) => void;
  onUpdateSettings?: (settings: SystemSettings) => void;
  onBackToDashboard: () => void;
}

// Preset Indonesian Business Districts & Major Cities
const LOCATION_PRESETS = [
  { name: 'Head Office SCBD Jakarta', city: 'Jakarta Selatan', lat: -6.2250, lng: 106.8090, radius: 150 },
  { name: 'Mega Kuningan Business Park', city: 'Jakarta Selatan', lat: -6.2297, lng: 106.8294, radius: 120 },
  { name: 'TB Simatupang Tech Hub', city: 'Jakarta Selatan', lat: -6.2942, lng: 106.8375, radius: 100 },
  { name: 'BSD Green Office Park', city: 'Tangerang Selatan', lat: -6.3015, lng: 106.6528, radius: 250 },
  { name: 'Cikarang Industrial Estate (Plant)', city: 'Bekasi', lat: -6.3267, lng: 107.1528, radius: 500 },
  { name: 'Dago Digital Valley', city: 'Bandung', lat: -6.8856, lng: 107.6141, radius: 100 },
  { name: 'Surabaya Central Tower (Gubeng)', city: 'Surabaya', lat: -7.2654, lng: 112.7521, radius: 150 },
  { name: 'Bali Innovation Hub (Kuta/Seminyak)', city: 'Badung - Bali', lat: -8.6913, lng: 115.1682, radius: 200 },
  { name: 'Medan Podomoro City', city: 'Medan', lat: 3.5952, lng: 98.6722, radius: 150 },
  { name: 'IKN Nusantara Branch (Sepaku)', city: 'Penajam Paser Utara', lat: -0.9634, lng: 116.7022, radius: 300 },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  branches,
  shifts = INITIAL_SHIFTS,
  systemSettings,
  auditLogs,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  onAddShift,
  onUpdateShift,
  onDeleteShift,
  onUpdateSettings,
  onBackToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'branches' | 'general' | 'attendance' | 'payroll_tax' | 'rbac'>('branches');
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [settings, setSettings] = useState<SystemSettings>(systemSettings || INITIAL_SYSTEM_SETTINGS);
  const [savedToast, setSavedToast] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Branch Form State
  const [bName, setBName] = useState('');
  const [bCode, setBCode] = useState('');
  const [bAddress, setBAddress] = useState('');
  const [bCity, setBCity] = useState('');
  const [bLat, setBLat] = useState('-6.2250');
  const [bLng, setBLng] = useState('106.8090');
  const [bRadius, setBRadius] = useState('150');
  const [bIsHeadOffice, setBIsHeadOffice] = useState(false);
  const [bTimezone, setBTimezone] = useState('WIB (Asia/Jakarta)');

  // Geofence Interactive Simulator State
  const [simSelectedBranchId, setSimSelectedBranchId] = useState<string>(branches[0]?.id || '');
  const [simUserLat, setSimUserLat] = useState<string>('-6.2252');
  const [simUserLng, setSimUserLng] = useState<string>('106.8092');

  const canConfigure = hasPermission(currentUser, 'system.configure') || currentUser.role === 'super_admin';

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSettings) {
      onUpdateSettings(settings);
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan pengaturan sistem ke nilai standar awal?')) {
      setSettings(INITIAL_SYSTEM_SETTINGS);
      if (onUpdateSettings) {
        onUpdateSettings(INITIAL_SYSTEM_SETTINGS);
      }
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }
  };

  // Open Modal for Create
  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setBName('');
    setBCode(`BR-${branches.length + 1}`);
    setBAddress('');
    setBCity('Jakarta');
    setBLat('-6.2250');
    setBLng('106.8090');
    setBRadius('150');
    setBIsHeadOffice(false);
    setBTimezone('WIB (Asia/Jakarta)');
    setGpsError(null);
    setShowAddBranchModal(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setBName(branch.name);
    setBCode(branch.code);
    setBAddress(branch.address);
    setBCity(branch.city);
    setBLat(branch.coordinates.lat.toString());
    setBLng(branch.coordinates.lng.toString());
    setBRadius(branch.radiusMeters.toString());
    setBIsHeadOffice(!!branch.isHeadOffice);
    setBTimezone(branch.timezone || 'WIB (Asia/Jakarta)');
    setGpsError(null);
    setShowAddBranchModal(true);
  };

  // Detect Current Device GPS Coordinates
  const handleDetectCurrentGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Browser tidak mendukung pendeteksian Geolocation.');
      return;
    }

    setIsDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        setBLat(pos.coords.latitude.toFixed(6));
        setBLng(pos.coords.longitude.toFixed(6));
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsError(`Gagal mendeteksi GPS: ${err.message}. Pastikan izin lokasi browser telah diizinkan.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Apply Preset Location
  const handleApplyPreset = (preset: typeof LOCATION_PRESETS[0]) => {
    setBName(preset.name);
    setBCity(preset.city);
    setBLat(preset.lat.toFixed(6));
    setBLng(preset.lng.toFixed(6));
    setBRadius(preset.radius.toString());
    setBAddress(`Kawasan Bisnis ${preset.name}, ${preset.city}`);
  };

  // Save or Update Branch
  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName || !bCode || !bAddress) {
      alert('Harap lengkapi Nama, Kode Cabang, dan Alamat Kantor.');
      return;
    }

    const latNum = parseFloat(bLat);
    const lngNum = parseFloat(bLng);
    const radNum = parseInt(bRadius, 10);

    if (isNaN(latNum) || isNaN(lngNum)) {
      alert('Format koordinat Latitude dan Longitude harus berupa angka yang valid.');
      return;
    }

    if (isNaN(radNum) || radNum < 10) {
      alert('Radius geofence minimal adalah 10 meter.');
      return;
    }

    if (editingBranch) {
      // Update existing
      const updated: Branch = {
        ...editingBranch,
        name: bName,
        code: bCode,
        address: bAddress,
        city: bCity || 'Jakarta',
        coordinates: { lat: latNum, lng: lngNum },
        radiusMeters: radNum,
        isHeadOffice: bIsHeadOffice,
        timezone: bTimezone,
      };
      if (onUpdateBranch) {
        onUpdateBranch(updated);
      }
    } else {
      // Create new
      const newBranch: Branch = {
        id: `br-${Date.now()}`,
        name: bName,
        code: bCode,
        address: bAddress,
        city: bCity || 'Jakarta',
        coordinates: { lat: latNum, lng: lngNum },
        radiusMeters: radNum,
        isHeadOffice: bIsHeadOffice,
        timezone: bTimezone,
        isActive: true,
      };
      onAddBranch(newBranch);
    }

    setShowAddBranchModal(false);
  };

  // Toggle Branch Status
  const handleToggleStatus = (branch: Branch) => {
    if (!onUpdateBranch) return;
    const updated: Branch = {
      ...branch,
      isActive: branch.isActive === false ? true : false,
    };
    onUpdateBranch(updated);
  };

  // Delete Branch
  const handleDelete = (branch: Branch) => {
    if (onDeleteBranch) {
      onDeleteBranch(branch.id);
    }
  };

  // Calculate live distance for Geofence Tester Simulator
  const activeSimBranch = branches.find((b) => b.id === simSelectedBranchId) || branches[0];
  const simDistance = activeSimBranch
    ? calculateDistanceMeters(
        parseFloat(simUserLat) || 0,
        parseFloat(simUserLng) || 0,
        activeSimBranch.coordinates.lat,
        activeSimBranch.coordinates.lng
      )
    : 0;
  const isSimWithinGeofence = activeSimBranch ? simDistance <= activeSimBranch.radiusMeters : false;

  const rolesList: Role[] = [
    'super_admin',
    'hr_admin',
    'hr_staff',
    'manager',
    'supervisor',
    'employee',
    'finance',
    'director',
  ];

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
            <Settings className="w-6 h-6 text-blue-600" />
            <span>Pengaturan Sistem & Multi-Lokasi Geofence</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi titik koordinat GPS kantor yang diizinkan, radius presensi (*geofencing*), dan kebijakan SDM.
          </p>
        </div>

        {savedToast && (
          <div className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-in fade-in shadow-xs">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Konfigurasi berhasil disimpan!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'branches' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Kantor Cabang & Geofence ({branches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'general' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Profil Perusahaan</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'attendance' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Kebijakan Presensi & Cuti</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll_tax')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'payroll_tax' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Gaji, Pajak PPh 21 & BPJS</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'rbac' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Matriks Role & Permissions</span>
        </button>
      </div>

      {/* Tab: Multi Branch & Geofence Management */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          
          {/* Top Actions & Info Box */}
          <div className="bg-gradient-to-r from-[#0F2038] via-[#142845] to-[#0A172A] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Multi-Location Geofence Engine v3.0</span>
              </div>
              <h2 className="text-xl font-black text-white">Manajemen Titik Lokasi Kantor & Radius Presensi</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                HR dapat mendaftarkan lokasi kantor cabang, pabrik, gudang, atau lokasi proyek tak terbatas. Karyawan hanya dapat melakukan <strong>Clock In WFO</strong> apabila perangkat GPS berada dalam radius perimeter yang ditentukan.
              </p>
            </div>

            {canConfigure && (
              <button
                onClick={handleOpenAddModal}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 flex items-center space-x-2 cursor-pointer transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Lokasi Kantor Baru</span>
              </button>
            )}
          </div>

          {/* Branch Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {branches.map((b) => (
              <div
                key={b.id}
                className={`bg-white rounded-3xl border ${
                  b.isHeadOffice ? 'border-blue-400/80 ring-2 ring-blue-100' : 'border-slate-200/80'
                } p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition`}
              >
                <div className="space-y-3">
                  {/* Top Tags */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                          {b.code}
                        </span>
                        {b.isHeadOffice && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                            Kantor Pusat
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">{b.name}</h4>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(b)}
                      title={b.isActive === false ? 'Klik untuk mengaktifkan' : 'Klik untuk menonaktifkan'}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                        b.isActive === false
                          ? 'bg-slate-100 text-slate-500 border border-slate-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${b.isActive === false ? 'bg-slate-400' : 'bg-emerald-500'}`} />
                      {b.isActive === false ? 'Nonaktif' : 'Aktif'}
                    </button>
                  </div>

                  {/* Address */}
                  <div className="flex items-start space-x-2 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="leading-snug">{b.address}</p>
                  </div>

                  {/* Geofence Details */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[11px]">Radius Geofence:</span>
                      <span className="font-extrabold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-lg">
                        {b.radiusMeters} Meter
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Koordinat GPS:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {b.coordinates.lat.toFixed(4)}, {b.coordinates.lng.toFixed(4)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Zona Waktu:</span>
                      <span className="font-semibold text-slate-700">{b.timezone || 'WIB'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{b.city}</span>
                  
                  {canConfigure && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenEditModal(b)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer text-xs font-bold flex items-center space-x-1"
                        title="Ubah Titik Koordinat & Radius"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {branches.length > 1 && (
                        <button
                          onClick={() => handleDelete(b)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          title="Hapus Lokasi Kantor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Geofence Radar Calculator */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  <span>Kalkulator & Uji Validasi Jarak Geofence Mandiri</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verifikasi akurasi radius cabang dan kalkulasi jarak (Haversine Formula) secara presisi.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-xs font-bold text-slate-600">Pilih Kantor Target:</label>
                <select
                  value={simSelectedBranchId}
                  onChange={(e) => setSimSelectedBranchId(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (Radius {b.radiusMeters}m)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Inputs */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Koordinat Latitude Uji</label>
                  <input
                    type="text"
                    value={simUserLat}
                    onChange={(e) => setSimUserLat(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Koordinat Longitude Uji</label>
                  <input
                    type="text"
                    value={simUserLng}
                    onChange={(e) => setSimUserLng(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          setSimUserLat(pos.coords.latitude.toFixed(6));
                          setSimUserLng(pos.coords.longitude.toFixed(6));
                        });
                      }
                    }}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Gunakan GPS Saya</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSimBranch) {
                        setSimUserLat(activeSimBranch.coordinates.lat.toFixed(6));
                        setSimUserLng(activeSimBranch.coordinates.lng.toFixed(6));
                      }
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                  >
                    Titik Tengah Kantor
                  </button>
                </div>
              </div>

              {/* Visual Radar Display */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0F2038] text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="space-y-2 z-10">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Hasil Validasi Geofence</span>
                  <div className="text-3xl font-black font-mono">
                    {simDistance.toFixed(1)} <span className="text-base font-normal text-slate-300">Meter dari Kantor</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Batas radius yang diizinkan untuk kantor {activeSimBranch?.name} adalah <strong>{activeSimBranch?.radiusMeters} Meter</strong>.
                  </p>
                </div>

                <div className="z-10 shrink-0">
                  {isSimWithinGeofence ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-center space-y-1">
                      <div className="inline-flex p-2 rounded-full bg-emerald-500 text-white mb-1">
                        <CheckCheck className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-black text-emerald-300">DALAM RADIUS (VALID)</p>
                      <p className="text-[10px] text-emerald-200">Presensi WFO Diizinkan</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-400 text-center space-y-1">
                      <div className="inline-flex p-2 rounded-full bg-rose-500 text-white mb-1">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-black text-rose-300">DI LUAR RADIUS (INVALID)</p>
                      <p className="text-[10px] text-rose-200">Perlu Persetujuan Override</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab: General Company Profile */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Identitas Legalitas Perusahaan</h3>
              <p className="text-xs text-slate-500">Data resmi yang tercantum pada E-Slip Gaji, laporan, dan dokumen HR.</p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Perusahaan (Brand)</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Badan Hukum (PT/Tbk)</label>
              <input
                type="text"
                value={settings.legalName}
                onChange={(e) => setSettings({ ...settings, legalName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor Pokok Wajib Pajak (NPWP)</label>
              <input
                type="text"
                value={settings.companyNpwp}
                onChange={(e) => setSettings({ ...settings, companyNpwp: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mata Uang Standar Sistem</label>
              <input
                type="text"
                disabled
                value="IDR (Rupiah Indonesia - Rp)"
                className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Alamat Kantor Pusat (Head Office)</label>
              <textarea
                rows={2}
                value={settings.companyAddress}
                onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>
        </form>
      )}

      {/* Tab: Attendance Policies */}
      {activeTab === 'attendance' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Kebijakan Presensi, Cuti & Lembur</h3>
              <p className="text-xs text-slate-500">Standar operasional kehadiran kerja dan aturan perhitungan kompensasi.</p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Kebijakan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Aturan Jam Kerja & Presensi</span>
              </h4>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jam Kerja Normal</label>
                <input
                  type="text"
                  value={settings.defaultWorkingHours}
                  onChange={(e) => setSettings({ ...settings, defaultWorkingHours: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Toleransi Keterlambatan (Menit)</label>
                <input
                  type="number"
                  value={settings.lateToleranceMinutes}
                  onChange={(e) => setSettings({ ...settings, lateToleranceMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-slate-700">Wajibkan Verifikasi Selfie / Biometrik</span>
                <input
                  type="checkbox"
                  checked={settings.enableSelfieVerification}
                  onChange={(e) => setSettings({ ...settings, enableSelfieVerification: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Aturan Cuti & Lembur (Kemenaker)</span>
              </h4>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kuota Cuti Tahunan Default (Hari)</label>
                <input
                  type="number"
                  value={settings.annualLeaveDefaultQuota}
                  onChange={(e) => setSettings({ ...settings, annualLeaveDefaultQuota: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Maksimum Carry-Forward Cuti (Hari)</label>
                <input
                  type="number"
                  value={settings.carryForwardMaxDays}
                  onChange={(e) => setSettings({ ...settings, carryForwardMaxDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Formula Lembur Per Jam</label>
                <input
                  type="text"
                  disabled
                  value="1/173 x Gaji Pokok (Standar Depnaker)"
                  className="w-full px-3 py-2 bg-slate-100 text-slate-600 font-bold border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab: Payroll, Tax & BPJS Policy */}
      {activeTab === 'payroll_tax' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Kebijakan Payroll, Pajak PPh 21 & BPJS</h3>
              <p className="text-xs text-slate-500">Konfigurasi formula pemotongan pajak, persentase BPJS, dan hari kerja efektif bulanan.</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
              >
                Reset Standar
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Payroll</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Working Days & Tax Calculation Method */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h4 className="font-extrabold text-slate-900 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Hari Kerja & Metode Pajak PPh 21</span>
              </h4>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jumlah Hari Kerja Efektif per Bulan</label>
                <select
                  value={settings.workingDaysPerMonth}
                  onChange={(e) => setSettings({ ...settings, workingDaysPerMonth: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden"
                >
                  <option value={20}>20 Hari Kerja (5 Hari Kerja/Minggu - 4 Minggu)</option>
                  <option value={21}>21 Hari Kerja (Standar Fleksibel)</option>
                  <option value={22}>22 Hari Kerja (Standar Corporate Indonesia)</option>
                  <option value={25}>25 Hari Kerja (6 Hari Kerja/Minggu - Pabrik/Shift)</option>
                  <option value={26}>26 Hari Kerja (Operasional Penuh)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">Digunakan untuk dasar perhitungan prorata gaji & uang makan harian.</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Metode Perhitungan Pajak Penghasilan (PPh 21)</label>
                <select
                  value={settings.taxCalculationMethod}
                  onChange={(e) => setSettings({ ...settings, taxCalculationMethod: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden"
                >
                  <option value="TER (Tarif Efektif Rata-rata)">TER (Tarif Efektif Rata-rata - PP 58/2023 Resmi)</option>
                  <option value="PPh 21 Progresif Standar">PPh 21 Tarif Progresif Pasal 17 UU HPP</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">Kalkulasi otomatis mengacu pada kategori PTKP (TK/0, K/0, K/1, K/2, K/3).</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mata Uang Penggajian</label>
                <input
                  type="text"
                  disabled
                  value="IDR - Indonesian Rupiah (Rp)"
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-600"
                />
              </div>
            </div>

            {/* BPJS Policies Overview */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h4 className="font-extrabold text-slate-900 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Skema Pemotongan BPJS Ketenagakerjaan & Kesehatan</span>
              </h4>

              <div className="space-y-2.5 text-[11px]">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70">
                  <span className="font-bold text-slate-800">BPJS Kesehatan:</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-blue-700">1% Karyawan</span>
                    <span className="text-slate-400 ml-1.5">| 4% Perusahaan</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70">
                  <span className="font-bold text-slate-800">BPJS Ketenagakerjaan (JHT):</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-blue-700">2% Karyawan</span>
                    <span className="text-slate-400 ml-1.5">| 3.7% Perusahaan</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70">
                  <span className="font-bold text-slate-800">Jaminan Pensiun (JP):</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-blue-700">1% Karyawan</span>
                    <span className="text-slate-400 ml-1.5">| 2% Perusahaan</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70">
                  <span className="font-bold text-slate-800">JKK & JKM (Ditanggung Perusahaan):</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700">0.24% - 1.74% (JKK) + 0.30% (JKM)</span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                *Semua nominal dan potongan dapat disesuaikan per individu karyawan pada menu <strong>Data Karyawan & Organisasi</strong>.
              </p>
            </div>

          </div>
        </form>
      )}

      {/* Tab: RBAC Matrix */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Matriks Hak Akses Peran (Role-Based Access Control)</h3>
              <p className="text-xs text-slate-500">Izin operasional otomatis sesuai hierarki dan kepatuhan peran pengguna.</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              8 Roles Terkonfigurasi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Modul / Fitur</th>
                  {rolesList.map((r) => (
                    <th key={r} className="py-3 px-3 text-center">
                      <span className="block text-[10px] font-bold text-slate-700">{getRoleDisplayName(r)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Dashboard & Data Karyawan', perm: 'employee.view' as Permission },
                  { name: 'Tambah / Edit Karyawan', perm: 'employee.create' as Permission },
                  { name: 'Presensi & Geofence GPS', perm: 'attendance.clockin' as Permission },
                  { name: 'Persetujuan Koreksi Presensi', perm: 'attendance.approve_correction' as Permission },
                  { name: 'Pengajuan Cuti / Izin', perm: 'leave.request' as Permission },
                  { name: 'Persetujuan Cuti (Approval)', perm: 'leave.approve' as Permission },
                  { name: 'Pengajuan Lembur (SPL)', perm: 'overtime.request' as Permission },
                  { name: 'Persetujuan Lembur', perm: 'overtime.approve' as Permission },
                  { name: 'Kalkulasi & Kunci Payroll', perm: 'payroll.process' as Permission },
                  { name: 'Laporan & Audit Trail Log', perm: 'audit.view' as Permission },
                  { name: 'Pengaturan Sistem & Cabang', perm: 'settings.manage' as Permission },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{row.name}</td>
                    {rolesList.map((r) => {
                      const allowed = ROLE_PERMISSIONS[r]?.includes(row.perm);
                      return (
                        <td key={r} className="py-2.5 px-3 text-center">
                          {allowed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-300 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Branch Location & Geofence */}
      {showAddBranchModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="p-5 bg-[#0F2038] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-sm">
                    {editingBranch ? 'Ubah Titik Lokasi & Radius Geofence' : 'Tambah Kantor Cabang & Geofence Baru'}
                  </h3>
                  <p className="text-xs text-slate-300">Tentukan koordinat presisi dan radius perimeter presensi.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddBranchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              
              {/* Quick Presets */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                <span className="font-bold text-blue-900 block flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-blue-700" />
                  <span>Preset Cepat Kawasan Bisnis / Kota:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {LOCATION_PRESETS.slice(0, 6).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Kantor Cabang / Lokasi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kantor Cabang Bandung"
                    value={bName}
                    onChange={(e) => setBName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode Cabang</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: BR-BDG"
                    value={bCode}
                    onChange={(e) => setBCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kota / Wilayah</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bandung"
                    value={bCity}
                    onChange={(e) => setBCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Zona Waktu Operasional</label>
                  <select
                    value={bTimezone}
                    onChange={(e) => setBTimezone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="WIB (Asia/Jakarta)">WIB (Waktu Indonesia Barat - GMT+7)</option>
                    <option value="WITA (Asia/Makassar)">WITA (Waktu Indonesia Tengah - GMT+8)</option>
                    <option value="WIT (Asia/Jayapura)">WIT (Waktu Indonesia Timur - GMT+9)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap Kantor</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Jl. Ir. H. Juanda No. 123, Dago..."
                    value={bAddress}
                    onChange={(e) => setBAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Geofence & GPS Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Crosshair className="w-4 h-4 text-emerald-600" />
                      <span>Titik Koordinat GPS & Radius Perimeter</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Koordinat titik pusat kantor yang dijadikan patokan kalkulasi jarak presensi.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDetectCurrentGPS}
                    disabled={isDetectingGps}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                    <span>{isDetectingGps ? 'Mendeteksi...' : 'Ambil Titik GPS Saya Saat Ini'}</span>
                  </button>
                </div>

                {gpsError && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                    {gpsError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Latitude (Lintang)</label>
                    <input
                      type="text"
                      required
                      placeholder="-6.2250"
                      value={bLat}
                      onChange={(e) => setBLat(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Longitude (Bujur)</label>
                    <input
                      type="text"
                      required
                      placeholder="106.8090"
                      value={bLng}
                      onChange={(e) => setBLng(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                    />
                  </div>
                </div>

                {/* Radius Slider with Visual Indicators */}
                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Radius Toleransi Geofence:</label>
                    <span className="font-extrabold text-sm text-emerald-700 bg-emerald-100 px-3 py-1 rounded-xl font-mono">
                      {bRadius} Meter
                    </span>
                  </div>

                  <input
                    type="range"
                    min="25"
                    max="1000"
                    step="25"
                    value={bRadius}
                    onChange={(e) => setBRadius(e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>25m (Minimal)</span>
                    <span>100m (Gedung)</span>
                    <span>250m (Kawasan)</span>
                    <span>500m (Pabrik)</span>
                    <span>1000m (Proyek)</span>
                  </div>
                </div>

                {/* Head office checkbox */}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isHO"
                    checked={bIsHeadOffice}
                    onChange={(e) => setBIsHeadOffice(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                  <label htmlFor="isHO" className="font-bold text-slate-700 cursor-pointer">
                    Tetapkan lokasi ini sebagai Kantor Pusat (Head Office)
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-950/20 cursor-pointer"
                >
                  {editingBranch ? 'Perbarui Lokasi' : 'Simpan Lokasi Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

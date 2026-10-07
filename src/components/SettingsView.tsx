import React, { useState } from 'react';
import {
  Check,
  Shield,
  Smartphone,
  Globe,
  Lock,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  Info,
  KeyRound,
} from 'lucide-react';
import { UserProfileSettings, AppRole } from '../types';
import {
  ALL_30_RWANDA_DISTRICTS,
  MUSANZE_RECORD,
  MUSANZE_SECTORS_CELLS,
} from '../data/musanzeData';
import { COOPERATIVE_OPTIONS } from '../data/rwandaAdminData';

interface SettingsViewProps {
  settings: UserProfileSettings;
  onSaveSettings: (newSettings: UserProfileSettings) => void;
  onUnsavedStateChange: (hasUnsaved: boolean) => void;
  role?: AppRole;
}

type SettingsTab = 'profile' | 'farm' | 'notifications' | 'security';

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings: initialSettings,
  onSaveSettings,
  onUnsavedStateChange,
  role = 'farmer',
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [formData, setFormData] = useState<UserProfileSettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Password fields state (for security tab)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const markChanged = (updated: UserProfileSettings) => {
    setFormData(updated);
    setHasChanges(true);
    onUnsavedStateChange(true);
  };

  const handleCancelChanges = () => {
    setFormData(initialSettings);
    setHasChanges(false);
    onUnsavedStateChange(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveChanges = () => {
    onSaveSettings(formData);
    setHasChanges(false);
    onUnsavedStateChange(false);
    setToastMessage('Settings saved');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // District change: Sector and Cell reset to "Select sector" / "Select cell"
  const handleDistrictChange = (newDistrict: string) => {
    const updated: UserProfileSettings = {
      ...formData,
      district: newDistrict,
      sector: '',
      cell: '',
    };
    markChanged(updated);
  };

  // Sector change: Cell resets
  const handleSectorChange = (newSector: string) => {
    const availableCells = MUSANZE_SECTORS_CELLS[newSector] || [];
    const updated: UserProfileSettings = {
      ...formData,
      sector: newSector,
      cell: availableCells.length > 0 ? availableCells[0] : '',
    };
    markChanged(updated);
  };

  // Crop toggle
  const toggleCrop = (crop: string) => {
    const exists = formData.cropsGrown.includes(crop);
    const updatedCrops = exists
      ? formData.cropsGrown.filter((c) => c !== crop)
      : [...formData.cropsGrown, crop];
    markChanged({ ...formData, cropsGrown: updatedCrops });
  };

  // SMS stop flow
  const handleConfirmStopSms = () => {
    const updated: UserProfileSettings = {
      ...formData,
      isSmsStopped: true,
      alertChannel: 'In-app only',
    };
    setShowSmsModal(false);
    markChanged(updated);
  };

  const handleTurnBackOnSms = () => {
    const updated: UserProfileSettings = {
      ...formData,
      isSmsStopped: false,
      alertChannel: 'SMS',
    };
    markChanged(updated);
  };

  const availableCells = formData.sector
    ? MUSANZE_SECTORS_CELLS[formData.sector] || ['Cell 1', 'Cell 2', 'Cell 3']
    : [];

  const allCropsOptions = [
    'Irish Potato',
    'Climbing Beans',
    'Maize',
    'Wheat',
    'Sorghum',
    'Vegetables',
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1F4A34] text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#E4ECDB]" strokeWidth={2} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-[24px] font-semibold text-[#17271D]">Settings</h1>
        <p className="text-[13px] text-[#5B665E] mt-1">
          Manage your account, farm attributes, and notification preferences.
        </p>
      </div>

      {/* Profile Summary Card (Always visible above the tabs, full width) */}
      <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-full bg-[#1F4A34] text-white flex items-center justify-center text-[18px] font-semibold flex-shrink-0 shadow-xs">
            JB
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[18px] font-semibold text-[#17271D] leading-tight">
                {formData.fullName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[11px] font-semibold border border-[rgba(31,74,52,0.10)]">
                Farmer
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-[12px] text-[#5B665E]">
              <span>+250 78• ••• •12</span>
              <span className="px-2 py-0.2 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[10.5px] font-medium">
                Verified
              </span>
              <span>·</span>
              <span>{formData.cooperative}</span>
            </div>
          </div>
        </div>

        <div className="text-[12px] text-[#5B665E] bg-[#F4F6EF] px-3.5 py-2 rounded-xl border border-[rgba(31,74,52,0.06)]">
          <span>District zone: </span>
          <span className="font-semibold text-[#17271D]">{formData.district}</span>
        </div>
      </div>

      {/* Segmented Control: [Profile] [Farm] [Notifications] [Security] */}
      <div className="inline-flex bg-[#F4F6EF] p-1 rounded-full border border-[rgba(31,74,52,0.08)]">
        {(
          [
            { id: 'profile', label: 'Profile' },
            { id: 'farm', label: 'Farm' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'security', label: 'Security' },
          ] as { id: SettingsTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 text-[12px] font-medium rounded-full transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#3E8E55] text-white shadow-xs'
                : 'text-[#5B665E] hover:text-[#17271D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROFILE */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="bg-[#FBFCF8] rounded-[16px] p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]">
          <h3 className="text-[16px] font-semibold text-[#17271D] mb-4 pb-2 border-b border-[rgba(31,74,52,0.06)]">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-[13px] text-[#5B665E] mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => markChanged({ ...formData, fullName: e.target.value })}
                className="w-full h-11 px-4 rounded-full bg-white text-[#17271D] text-[13px] border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34]"
              />
            </div>

            {/* Phone */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] text-[#5B665E]">
                  Phone number
                </label>
                <button
                  type="button"
                  onClick={() => alert('To update your phone number, an SMS verification code will be sent.')}
                  className="text-[11px] text-[#1F4A34] hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => markChanged({ ...formData, phone: e.target.value })}
                  className="w-full h-11 pl-4 pr-24 rounded-full bg-white text-[#17271D] text-[13px] border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[10.5px] font-medium">
                  Verified
                </span>
              </div>
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block text-[13px] text-[#5B665E] mb-1.5">
                Email address (optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => markChanged({ ...formData, email: e.target.value })}
                placeholder="e.g. j.ndayisaba@coop.rw"
                className="w-full h-11 px-4 rounded-full bg-white text-[#17271D] text-[13px] border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34]"
              />
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-[13px] text-[#5B665E] mb-1.5">
                Preferred language
              </label>
              <div className="inline-flex bg-[#F4F6EF] p-1 rounded-full border border-[rgba(31,74,52,0.08)]">
                {(['Kinyarwanda', 'English'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => markChanged({ ...formData, preferredLanguage: lang })}
                    className={`px-4 py-2 text-[12px] font-medium rounded-full transition-all cursor-pointer ${
                      formData.preferredLanguage === lang
                        ? 'bg-[#1F4A34] text-white shadow-xs'
                        : 'text-[#5B665E] hover:text-[#17271D]'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FARM */}
      {/* ========================================================================= */}
      {activeTab === 'farm' && (
        <div className="bg-[#FBFCF8] rounded-[16px] p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]">
          <h3 className="text-[16px] font-semibold text-[#17271D] mb-4 pb-2 border-b border-[rgba(31,74,52,0.06)]">
            Farm Characteristics & Location
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* District Dropdown (All 30 Rwanda Districts) */}
            <div>
              <label className="block text-[13px] text-[#5B665E] mb-1.5">
                District
              </label>
              <div className="relative">
                <select
                  value={formData.district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full h-11 px-4 pr-10 rounded-full bg-white text-[#17271D] text-[13px] border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34] appearance-none"
                >
                  {ALL_30_RWANDA_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist} District
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#5B665E] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-[#5B665E] mt-1.5 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#5B665E]" />
                <span>Your risk data will update to the new district.</span>
              </p>
            </div>

            {/* Sector Dropdown (Lists all 15 Musanze sectors if Musanze selected) */}
            <div>
              <label className="block text-[13px] text-[#5B665E] mb-1.5">
                Sector
              </label>
              <div className="relative">
                <select
                  value={formData.sector}
                  onChange={(e) => handleSectorChange(e.target.value)}
                  className="w-full h-11 px-4 pr-10 rounded-full bg-white text-[#17271D] text-[13px] border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34] appearance-none"
                >
                  <option value="">Select sector</option>
                  {MUSANZE_RECORD.allSectors.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec} Sector
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#5B665E] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Cell Dropdown (depends on selected sector) */}
            <div>
              <label className="block text-[13px] text-[#5B665E] mb-1.5">
                Cell
              </label>
              <div className="relative">
                <select
                  value={formData.cell}
                  onChange={(e) => markChanged({ ...formData, cell: e.target.value })}
                  disabled={!formData.sector}
                  className="w-full h-11 px-4 pr-10 rounded-full bg-white text-[#17271D] text-[13px] border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34] appearance-none disabled:opacity-50"
                >
                  <option value="">Select cell</option>
                  {availableCells.map((cell) => (
                    <option key={cell} value={cell}>
                      {cell} Cell
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#5B665E] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Farm Size */}
            <div>
              <label className="block text-[13px] text-[#5B665E] mb-1.5">
                Farm size
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.farmSizeHa}
                  onChange={(e) =>
                    markChanged({
                      ...formData,
                      farmSizeHa: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full h-11 pl-4 pr-14 rounded-full bg-white text-[#17271D] text-[13px] border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#5B665E]">
                  ha
                </span>
              </div>
            </div>

            {/* Cooperative */}
            <div className="md:col-span-2">
              <label className="block text-[13px] text-[#5B665E] mb-1.5">
                Agricultural cooperative
              </label>
              <div className="relative">
                <select
                  value={formData.cooperative}
                  onChange={(e) => markChanged({ ...formData, cooperative: e.target.value })}
                  className="w-full h-11 px-4 pr-10 rounded-full bg-white text-[#17271D] text-[13px] border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34] appearance-none"
                >
                  {COOPERATIVE_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#5B665E] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Crops Grown: Selectable chips */}
            <div className="md:col-span-2 pt-2">
              <label className="block text-[13px] text-[#5B665E] mb-2">
                Crops grown (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {allCropsOptions.map((crop) => {
                  const isSelected = formData.cropsGrown.includes(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => toggleCrop(crop)}
                      className={`px-4 py-2 rounded-full text-[12.5px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#E4ECDB] text-[#17271D] border border-[rgba(31,74,52,0.25)] font-semibold shadow-xs'
                          : 'bg-white text-[#5B665E] border border-[rgba(31,74,52,0.12)] hover:text-[#17271D]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={2} />}
                      <span>{crop}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NOTIFICATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="bg-[#FBFCF8] rounded-[16px] p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] space-y-6">
          <h3 className="text-[16px] font-semibold text-[#17271D] pb-2 border-b border-[rgba(31,74,52,0.06)]">
            Notification Preferences
          </h3>

          {/* Watch-amber banner when SMS is stopped */}
          {formData.isSmsStopped && (
            <div className="p-4 rounded-xl bg-[#D9A032]/15 border border-[#D9A032]/35 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#D9A032] flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <span className="text-[13px] font-semibold text-[#17271D] block">
                    SMS alerts are off
                  </span>
                  <span className="text-[12px] text-[#5B665E]">
                    You will still receive warnings and advisories in the web desk.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTurnBackOnSms}
                className="px-4 py-1.5 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343] transition-colors shadow-xs cursor-pointer"
              >
                Turn back on
              </button>
            </div>
          )}

          {/* Primary Alert Channel Segmented Control */}
          <div>
            <label className="block text-[13px] text-[#5B665E] mb-2">
              Primary delivery channel for early warnings
            </label>
            <div className="inline-flex bg-[#F4F6EF] p-1 rounded-full border border-[rgba(31,74,52,0.08)]">
              {(
                [
                  { id: 'SMS', label: 'SMS', disabled: formData.isSmsStopped },
                  { id: 'Voice call', label: 'Voice call', disabled: false },
                  { id: 'In-app only', label: 'In-app only', disabled: false },
                ] as const
              ).map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  disabled={ch.disabled}
                  onClick={() => markChanged({ ...formData, alertChannel: ch.id })}
                  className={`px-4 py-2 text-[12px] font-medium rounded-full transition-all cursor-pointer ${
                    ch.disabled
                      ? 'opacity-40 cursor-not-allowed text-[#5B665E]'
                      : formData.alertChannel === ch.id
                      ? 'bg-[#1F4A34] text-white shadow-xs'
                      : 'text-[#5B665E] hover:text-[#17271D]'
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Rows with one-line muted description */}
          <div className="space-y-4 pt-2">
            {[
              {
                key: 'notifyEarlyWarnings',
                title: 'Early warnings (Watch and above)',
                desc: 'Instant notifications when storm or flash flood danger occurs in Musanze.',
                val: formData.notifyEarlyWarnings,
              },
              {
                key: 'notifyCropAdvisories',
                title: 'Crop advisories',
                desc: 'Hyperlocal timing advice for fungicide spraying, staking, and furrow digging.',
                val: formData.notifyCropAdvisories,
              },
              {
                key: 'notifyCalendarReminders',
                title: 'Crop calendar reminders',
                desc: 'Key agronomic milestones for planting, weeding, and bulking periods.',
                val: formData.notifyCalendarReminders,
              },
              {
                key: 'notifyCoopMessages',
                title: 'Cooperative messages',
                desc: 'Official notices, collective purchase announcements, and collection dates.',
                val: formData.notifyCoopMessages,
              },
            ].map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between p-3.5 bg-[#F4F6EF]/50 rounded-xl border border-[rgba(31,74,52,0.06)]"
              >
                <div className="pr-4">
                  <span className="text-[13px] font-medium text-[#17271D] block">
                    {row.title}
                  </span>
                  <span className="text-[12px] text-[#5B665E]">
                    {row.desc}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    markChanged({
                      ...formData,
                      [row.key]: !row.val,
                    })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 cursor-pointer ${
                    row.val ? 'bg-[#3E8E55]' : 'bg-[#5B665E]/30'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 rounded-full bg-white transition-transform transform ${
                      row.val ? 'translate-x-6' : 'translate-x-1'
                    } top-1`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Message Language */}
          <div className="pt-2 border-t border-[rgba(31,74,52,0.06)]">
            <label className="block text-[13px] text-[#5B665E] mb-2">
              Message language
            </label>
            <div className="inline-flex bg-[#F4F6EF] p-1 rounded-full border border-[rgba(31,74,52,0.08)]">
              {(['Kinyarwanda', 'English'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => markChanged({ ...formData, messageLanguage: lang })}
                  className={`px-4 py-1.5 text-[12px] font-medium rounded-full transition-all cursor-pointer ${
                    formData.messageLanguage === lang
                      ? 'bg-[#1F4A34] text-white shadow-xs'
                      : 'text-[#5B665E] hover:text-[#17271D]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Critical Red Link: Stop all SMS messages */}
          {!formData.isSmsStopped && (
            <div className="pt-3 border-t border-[rgba(31,74,52,0.06)]">
              <button
                type="button"
                onClick={() => setShowSmsModal(true)}
                className="text-[13px] font-medium text-[#C93B3B] hover:underline cursor-pointer"
              >
                Stop all SMS messages
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SECURITY */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="bg-[#FBFCF8] rounded-[16px] p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] space-y-6">
          <h3 className="text-[16px] font-semibold text-[#17271D] pb-2 border-b border-[rgba(31,74,52,0.06)]">
            Security & Authentication
          </h3>

          {/* Change Password */}
          <div className="space-y-4 max-w-lg">
            <h4 className="text-[14px] font-semibold text-[#17271D]">Change password</h4>
            <div>
              <label className="block text-[13px] text-[#5B665E] mb-1">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setHasChanges(true);
                  onUnsavedStateChange(true);
                }}
                className="w-full h-11 px-4 rounded-full bg-white text-[#17271D] text-[13px] border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34]"
              />
            </div>

            <div>
              <label className="block text-[13px] text-[#5B665E] mb-1">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setHasChanges(true);
                  onUnsavedStateChange(true);
                }}
                className="w-full h-11 px-4 rounded-full bg-white text-[#17271D] text-[13px] border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34]"
              />
              {/* Strength indicator */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[#F4F6EF] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      newPassword.length > 8
                        ? 'w-full bg-[#3E8E55]'
                        : newPassword.length > 4
                        ? 'w-2/3 bg-[#D9A032]'
                        : newPassword.length > 0
                        ? 'w-1/3 bg-[#C93B3B]'
                        : 'w-0'
                    }`}
                  />
                </div>
                <span className="text-[11px] text-[#5B665E]">
                  {newPassword.length > 8
                    ? 'Strong'
                    : newPassword.length > 4
                    ? 'Medium'
                    : 'Minimum 8 characters'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[13px] text-[#5B665E] mb-1">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setHasChanges(true);
                  onUnsavedStateChange(true);
                }}
                className="w-full h-11 px-4 rounded-full bg-white text-[#17271D] text-[13px] border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34]"
              />
            </div>
          </div>

          {/* Phone verification status row */}
          <div className="pt-4 border-t border-[rgba(31,74,52,0.06)]">
            <h4 className="text-[14px] font-semibold text-[#17271D] mb-2">
              Phone verification status
            </h4>
            <div className="flex items-center justify-between p-3.5 bg-[#F4F6EF]/60 rounded-xl border border-[rgba(31,74,52,0.06)]">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#3E8E55]" strokeWidth={1.5} />
                <div>
                  <span className="text-[13px] font-semibold text-[#17271D] block">
                    Phone number verified (+250 78• ••• •12)
                  </span>
                  <span className="text-[12px] text-[#5B665E]">
                    Secures two-way agronomic reporting and verified advisory delivery.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert('Verification SMS dispatched.')}
                className="text-[12px] text-[#1F4A34] font-medium hover:underline cursor-pointer"
              >
                Re-verify
              </button>
            </div>
          </div>

          {/* Two-step verification row */}
          <div className="pt-4 border-t border-[rgba(31,74,52,0.06)]">
            <div className="flex items-center justify-between p-3.5 bg-[#F4F6EF]/60 rounded-xl border border-[rgba(31,74,52,0.06)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E4ECDB] flex items-center justify-center text-[#1F4A34]">
                  <KeyRound className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#17271D]">
                      Two-step verification: On
                    </span>
                    {role === 'officer' && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[10.5px] font-semibold border border-[rgba(31,74,52,0.12)]">
                        Required for officers
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] text-[#5B665E]">
                    {role === 'officer'
                      ? 'Officers require two-step verification for administrative district access.'
                      : 'Requires authentication code sent via SMS on login.'}
                  </span>
                </div>
              </div>
              <span className="text-[12px] font-semibold text-[#3E8E55] px-3 py-1 rounded-full bg-[#3E8E55]/15 border border-[#3E8E55]/20">
                On
              </span>
            </div>
          </div>

          {/* Active Sessions List (2 rows) + Sign out other devices button */}
          <div className="pt-4 border-t border-[rgba(31,74,52,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-[14px] font-semibold text-[#17271D]">
                  Active sessions
                </h4>
                <p className="text-[12px] text-[#5B665E]">
                  Devices currently signed in to your farmer account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setToastMessage('Signed out of 1 other device');
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                className="px-4 py-2 rounded-full bg-white text-[#1F4A34] border border-[rgba(31,74,52,0.20)] text-[12px] font-medium hover:bg-[#E4ECDB] transition-all cursor-pointer"
              >
                Sign out other devices
              </button>
            </div>

            <div className="space-y-2">
              {/* Row 1 */}
              <div className="p-3 bg-[#F4F6EF]/50 rounded-xl flex items-center justify-between border border-[rgba(31,74,52,0.06)]">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
                  <div>
                    <span className="text-[13px] font-medium text-[#17271D] block">
                      Mobile App (Android) · Musanze
                    </span>
                    <span className="text-[11px] text-[#3E8E55] font-medium">
                      Active now (this device)
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[10px] font-medium">
                  Current
                </span>
              </div>

              {/* Row 2 */}
              <div className="p-3 bg-[#F4F6EF]/50 rounded-xl flex items-center justify-between border border-[rgba(31,74,52,0.06)]">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[#5B665E]" strokeWidth={1.5} />
                  <div>
                    <span className="text-[13px] font-medium text-[#17271D] block">
                      Web Desk (Chrome) · Kigali
                    </span>
                    <span className="text-[11px] text-[#5B665E]">
                      Last active: 2 days ago
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-[#5B665E]">Chrome 128</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STICKY BOTTOM BAR FOR UNSAVED CHANGES */}
      {/* ========================================================================= */}
      {hasChanges && (
        <div className="fixed bottom-0 inset-x-0 bg-[#FBFCF8] border-t border-[rgba(31,74,52,0.15)] shadow-2xl p-4 z-30 animate-in slide-in-from-bottom-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#17271D]">
              You have unsaved changes
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancelChanges}
                className="px-5 py-2 rounded-full bg-white text-[#17271D] border border-[rgba(31,74,52,0.20)] text-[13px] font-medium hover:bg-[#F4F6EF] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-6 py-2 rounded-full bg-[#1F4A34] text-white text-[13px] font-medium hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STOP ALL SMS MESSAGES MODAL DIALOG */}
      {/* ========================================================================= */}
      {showSmsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowSmsModal(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />
          <div className="relative bg-[#FBFCF8] rounded-[20px] max-w-md w-full p-6 shadow-2xl border border-[rgba(31,74,52,0.12)] z-10 space-y-4">
            <h3 className="text-[18px] font-semibold text-[#17271D]">
              Stop all SMS messages?
            </h3>
            <p className="text-[13px] text-[#5B665E] leading-relaxed">
              You will no longer receive early warnings, advisories or calendar reminders by SMS. You can still see them in the app. You can turn SMS back on anytime in Settings.
            </p>
            <div className="pt-2 flex items-center justify-end gap-4 border-t border-[rgba(31,74,52,0.06)]">
              <button
                type="button"
                onClick={handleConfirmStopSms}
                className="text-[13px] font-semibold text-[#C93B3B] hover:underline cursor-pointer"
              >
                Stop all SMS
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => setShowSmsModal(false)}
                className="px-5 py-2 rounded-full bg-[#1F4A34] text-white text-[13px] font-medium hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer"
              >
                Keep SMS alerts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Check, KeyRound, Plus, Smartphone, X } from 'lucide-react';
import { UserProfileSettings, AppRole } from '../types';
import { MUSANZE_RECORD, MUSANZE_SECTORS_CELLS, ROLE_LABELS } from '../data/musanzeData';
import { COOPERATIVE_OPTIONS, CROP_OPTIONS, maskPhone } from '../data/rwandaAdminData';
import { PillSelect } from './PillSelect';
import { TEXT_INPUT, Toggle } from './coop/CoopUi';

interface SettingsViewProps {
  settings: UserProfileSettings;
  onSaveSettings: (newSettings: UserProfileSettings) => void;
  onUnsavedStateChange: (hasUnsaved: boolean) => void;
  role?: AppRole;
}

type SettingsTab = 'profile' | 'farm' | 'messages' | 'password';

const CARD = 'bg-[#FBFCF8] rounded-[16px] p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]';
const LABEL = 'block text-[13px] text-[#5B665E] mb-1.5';

/** Two or three choices as one pill row (language, channel). */
const Segmented = <T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string; disabled?: boolean }[];
  onChange: (v: T) => void;
}) => (
  <div className="inline-flex flex-wrap bg-[#F4F6EF] p-1 rounded-full border border-[rgba(31,74,52,0.08)]">
    {options.map((o) => (
      <button
        key={o.id}
        type="button"
        disabled={o.disabled}
        aria-pressed={value === o.id}
        onClick={() => onChange(o.id)}
        className={`px-4 py-2 text-[12px] font-medium rounded-full transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
          value === o.id ? 'bg-[#1F4A34] text-white shadow-xs' : 'text-[#5B665E] hover:text-[#17271D]'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

/**
 * Settings, kept short on purpose: Profile (who you are, your language), Farm (where, how big,
 * which crops — any crop can be added), Messages (how we reach you, what we send), Password.
 */
export const SettingsView: React.FC<SettingsViewProps> = ({
  settings: initialSettings,
  onSaveSettings,
  onUnsavedStateChange,
  role = 'farmer',
}) => {
  const isFarmer = role === 'farmer';
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [formData, setFormData] = useState<UserProfileSettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newCrop, setNewCrop] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

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
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Settings saved');
  };

  const setPasswordField = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setHasChanges(true);
    onUnsavedStateChange(true);
  };

  const handleSectorChange = (sector: string) => {
    const cells = MUSANZE_SECTORS_CELLS[sector] || [];
    markChanged({ ...formData, sector, cell: cells[0] || '' });
  };

  // Crops: the common Musanze crops plus anything the farmer adds
  const cropChoices = [...CROP_OPTIONS, ...formData.cropsGrown.filter((c) => !CROP_OPTIONS.includes(c))];
  const toggleCrop = (crop: string) => {
    const has = formData.cropsGrown.includes(crop);
    markChanged({ ...formData, cropsGrown: has ? formData.cropsGrown.filter((c) => c !== crop) : [...formData.cropsGrown, crop] });
  };
  const addCrop = () => {
    const name = newCrop.trim().replace(/\s+/g, ' ');
    if (!name) return;
    const existing = cropChoices.find((c) => c.toLowerCase() === name.toLowerCase());
    const crop = existing || name.charAt(0).toUpperCase() + name.slice(1);
    if (!formData.cropsGrown.includes(crop)) markChanged({ ...formData, cropsGrown: [...formData.cropsGrown, crop] });
    setNewCrop('');
  };

  // Same initials as the top bar ("Jean-Baptiste Ndayisaba" → JB)
  const initials = formData.fullName
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
  const cells = formData.sector ? MUSANZE_SECTORS_CELLS[formData.sector] || [] : [];
  const passwordsMismatch = confirmPassword !== '' && confirmPassword !== newPassword;
  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    ...(isFarmer ? [{ id: 'farm' as const, label: 'Farm' }] : []),
    { id: 'messages', label: 'Messages' },
    { id: 'password', label: 'Password' },
  ];

  return (
    <div className="space-y-6 pb-24">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1F4A34] text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#E4ECDB]" strokeWidth={2} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <h1 className="text-[24px] font-semibold text-[#17271D]">Settings</h1>
        <p className="text-[13px] text-[#5B665E] mt-1">
          {isFarmer ? 'Your details, your farm and how we reach you.' : 'Your details and how we reach you.'}
        </p>
      </div>

      {/* Who is signed in */}
      <div className={`${CARD} !p-5 flex items-center gap-4`}>
        <div className="w-14 h-14 rounded-full bg-[#1F4A34] text-white flex items-center justify-center text-[18px] font-semibold flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[18px] font-semibold text-[#17271D] leading-tight">{formData.fullName}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[11px] font-semibold border border-[rgba(31,74,52,0.10)]">
              {ROLE_LABELS[role]}
            </span>
          </div>
          <p className="mt-1 text-[12px] text-[#5B665E]">
            {maskPhone(formData.phone)}
            {isFarmer && ` · ${formData.cooperative}`}
          </p>
        </div>
      </div>

      <div className="inline-flex bg-[#F4F6EF] p-1 rounded-full border border-[rgba(31,74,52,0.08)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 text-[12px] font-medium rounded-full transition-all cursor-pointer ${
              activeTab === tab.id ? 'bg-[#3E8E55] text-white shadow-xs' : 'text-[#5B665E] hover:text-[#17271D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PROFILE */}
      {activeTab === 'profile' && (
        <div className={`${CARD} grid grid-cols-1 md:grid-cols-2 gap-5`}>
          <label className="block">
            <span className={LABEL}>Full name</span>
            <input value={formData.fullName} onChange={(e) => markChanged({ ...formData, fullName: e.target.value })} className={TEXT_INPUT} />
          </label>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] text-[#5B665E]">Phone number</span>
              <button
                type="button"
                onClick={() => showToast('We will send a code to your new number')}
                className="text-[12px] text-[#1F4A34] hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>
            <div className="relative">
              <input value={formData.phone} readOnly className={`${TEXT_INPUT} pr-24`} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[11px] font-medium">
                Verified
              </span>
            </div>
          </div>
          <label className="block">
            <span className={LABEL}>Email (optional)</span>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => markChanged({ ...formData, email: e.target.value })}
              className={TEXT_INPUT}
            />
          </label>
          <div>
            <span className={LABEL}>Language</span>
            {/* One language for the app and for SMS / voice messages */}
            <Segmented
              value={formData.preferredLanguage}
              options={[
                { id: 'Kinyarwanda', label: 'Kinyarwanda' },
                { id: 'English', label: 'English' },
              ]}
              onChange={(lang) => markChanged({ ...formData, preferredLanguage: lang, messageLanguage: lang })}
            />
            <p className="text-[12px] text-[#5B665E] mt-1.5">Used in the app and in your messages.</p>
          </div>
        </div>
      )}

      {/* FARM (farmers only) */}
      {activeTab === 'farm' && isFarmer && (
        <div className={`${CARD} space-y-5`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <PillSelect
              label={`Sector (${formData.district || MUSANZE_RECORD.districtName})`}
              value={formData.sector}
              onChange={handleSectorChange}
              placeholder="Choose sector"
              options={MUSANZE_RECORD.allSectors.map((s) => ({ value: s, label: s }))}
            />
            <PillSelect
              label="Cell"
              value={formData.cell}
              onChange={(cell) => markChanged({ ...formData, cell })}
              placeholder="Choose cell"
              disabled={!formData.sector}
              options={cells.map((c) => ({ value: c, label: c }))}
            />
            <label className="block">
              <span className={LABEL}>Farm size (hectares)</span>
              <input
                inputMode="decimal"
                value={String(formData.farmSizeHa)}
                onChange={(e) => markChanged({ ...formData, farmSizeHa: parseFloat(e.target.value.replace(',', '.')) || 0 })}
                className={TEXT_INPUT}
              />
            </label>
          </div>

          <PillSelect
            label="Cooperative"
            value={formData.cooperative}
            onChange={(cooperative) => markChanged({ ...formData, cooperative })}
            options={COOPERATIVE_OPTIONS.map((c) => ({ value: c, label: c }))}
          />

          <div>
            <span className={LABEL}>Crops you grow</span>
            <div className="flex flex-wrap gap-2">
              {cropChoices.map((crop) => {
                const on = formData.cropsGrown.includes(crop);
                return (
                  <button
                    key={crop}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleCrop(crop)}
                    className={`px-3.5 h-9 rounded-full text-[12.5px] border flex items-center gap-1.5 cursor-pointer transition-colors ${
                      on
                        ? 'bg-[#E4ECDB] text-[#17271D] border-[rgba(31,74,52,0.25)] font-semibold'
                        : 'bg-white text-[#5B665E] border-[rgba(31,74,52,0.12)] hover:text-[#17271D]'
                    }`}
                  >
                    {on && <Check className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={2} />}
                    {crop}
                  </button>
                );
              })}
            </div>
            {/* Any other crop */}
            <div className="mt-3 flex items-center gap-2 max-w-sm">
              <input
                value={newCrop}
                onChange={(e) => setNewCrop(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCrop();
                  }
                }}
                placeholder="Another crop, e.g. Sorghum"
                aria-label="Add another crop"
                className={TEXT_INPUT}
              />
              <button
                type="button"
                onClick={addCrop}
                disabled={!newCrop.trim()}
                className="h-11 px-4 rounded-full bg-white text-[#1F4A34] border border-[rgba(31,74,52,0.20)] text-[12.5px] font-medium hover:bg-[#E4ECDB] flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGES */}
      {activeTab === 'messages' && (
        <div className={`${CARD} space-y-6`}>
          {formData.isSmsStopped && (
            <div className="p-4 rounded-xl bg-[#E4ECDB]/60 border border-[rgba(31,74,52,0.12)] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[13px] font-semibold text-[#17271D] block">SMS is off</span>
                <span className="text-[12px] text-[#5B665E]">You still see warnings and advice in the app.</span>
              </div>
              <button
                type="button"
                onClick={() => markChanged({ ...formData, isSmsStopped: false, alertChannel: 'SMS' })}
                className="px-4 py-1.5 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343] cursor-pointer"
              >
                Turn SMS back on
              </button>
            </div>
          )}

          <div>
            <span className={LABEL}>How should we reach you?</span>
            <Segmented
              value={formData.alertChannel}
              options={[
                { id: 'SMS', label: 'SMS', disabled: formData.isSmsStopped },
                { id: 'Voice call', label: 'Voice call' },
                { id: 'In-app only', label: 'App only' },
              ]}
              onChange={(alertChannel) => markChanged({ ...formData, alertChannel })}
            />
          </div>

          <div>
            <span className={LABEL}>What should we send?</span>
            <div className="divide-y divide-[rgba(31,74,52,0.06)] rounded-xl border border-[rgba(31,74,52,0.08)] bg-white">
              {(
                [
                  { key: 'notifyEarlyWarnings', label: 'Weather warnings' },
                  ...(isFarmer
                    ? ([
                        { key: 'notifyCropAdvisories', label: 'Crop advice' },
                        { key: 'notifyCalendarReminders', label: 'Planting and harvest reminders' },
                        { key: 'notifyCoopMessages', label: 'Cooperative messages' },
                      ] as const)
                    : []),
                ] as const
              ).map((row) => (
                <div key={row.key} className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] text-[#17271D]">{row.label}</span>
                  <Toggle
                    label={row.label}
                    checked={formData[row.key]}
                    onChange={(v) => markChanged({ ...formData, [row.key]: v })}
                  />
                </div>
              ))}
            </div>
          </div>

          {!formData.isSmsStopped && (
            <button
              type="button"
              onClick={() => setShowSmsModal(true)}
              className="text-[13px] font-medium text-[#5B665E] hover:text-[#17271D] hover:underline cursor-pointer"
            >
              Stop all SMS
            </button>
          )}
        </div>
      )}

      {/* PASSWORD */}
      {activeTab === 'password' && (
        <div className={`${CARD} space-y-6`}>
          <div className="space-y-4 max-w-md">
            <label className="block">
              <span className={LABEL}>Current password</span>
              <input type="password" value={currentPassword} onChange={setPasswordField(setCurrentPassword)} className={TEXT_INPUT} />
            </label>
            <label className="block">
              <span className={LABEL}>New password</span>
              <input type="password" value={newPassword} onChange={setPasswordField(setNewPassword)} className={TEXT_INPUT} />
              {/* Strength: greens only (not a risk level) */}
              <span className="mt-2 flex items-center gap-2">
                <span className="flex-1 h-1.5 bg-[#F4F6EF] rounded-full overflow-hidden">
                  <span
                    className="block h-full bg-[#3E8E55] rounded-full transition-all"
                    style={{ width: `${Math.min(100, (newPassword.length / 12) * 100)}%` }}
                  />
                </span>
                <span className="text-[11.5px] text-[#5B665E]">
                  {newPassword.length >= 12 ? 'Strong' : newPassword.length >= 8 ? 'Good' : 'At least 8 characters'}
                </span>
              </span>
            </label>
            <label className="block">
              <span className={LABEL}>Confirm new password</span>
              <input type="password" value={confirmPassword} onChange={setPasswordField(setConfirmPassword)} className={TEXT_INPUT} />
              {passwordsMismatch && <span className="block mt-1.5 text-[12px] font-medium text-[#17271D]">Passwords do not match.</span>}
            </label>
          </div>

          {(role === 'officer' || role === 'admin') && (
            <div className="flex items-center gap-3 p-3.5 bg-[#F4F6EF]/60 rounded-xl border border-[rgba(31,74,52,0.06)]">
              <KeyRound className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
              <span className="text-[13px] text-[#17271D]">Two-step verification is on for your account.</span>
            </div>
          )}

          <div className="pt-4 border-t border-[rgba(31,74,52,0.06)] flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[13px] text-[#17271D]">
              <Smartphone className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
              Signed in on this device and 1 other
            </span>
            <button
              type="button"
              onClick={() => showToast('Signed out of other devices')}
              className="px-4 py-2 rounded-full bg-white text-[#1F4A34] border border-[rgba(31,74,52,0.20)] text-[12px] font-medium hover:bg-[#E4ECDB] cursor-pointer"
            >
              Sign out other devices
            </button>
          </div>
        </div>
      )}

      {hasChanges && (
        <div className="fixed bottom-0 inset-x-0 bg-[#FBFCF8] border-t border-[rgba(31,74,52,0.15)] shadow-2xl p-4 z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#17271D]">You have unsaved changes</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancelChanges}
                className="px-5 py-2 rounded-full bg-white text-[#17271D] border border-[rgba(31,74,52,0.20)] text-[13px] font-medium hover:bg-[#F4F6EF] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={passwordsMismatch}
                className="px-6 py-2 rounded-full bg-[#1F4A34] text-white text-[13px] font-medium hover:bg-[#2C6343] shadow-xs cursor-pointer disabled:opacity-50"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showSmsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowSmsModal(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="relative bg-[#FBFCF8] rounded-[20px] max-w-md w-full p-6 shadow-2xl border border-[rgba(31,74,52,0.12)] z-10 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[18px] font-semibold text-[#17271D]">Stop all SMS?</h3>
              <button type="button" aria-label="Close" onClick={() => setShowSmsModal(false)} className="p-1 rounded-full text-[#5B665E] hover:bg-[#E4ECDB] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[13px] text-[#5B665E] leading-relaxed">
              You will not get warnings or advice by SMS. You can still see them in the app, and turn SMS back on here.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[rgba(31,74,52,0.06)]">
              <button
                type="button"
                onClick={() => {
                  setShowSmsModal(false);
                  markChanged({ ...formData, isSmsStopped: true, alertChannel: 'In-app only' });
                }}
                className="px-4 py-2 rounded-full text-[13px] font-medium text-[#17271D] border border-[rgba(31,74,52,0.20)] hover:bg-[#F4F6EF] cursor-pointer"
              >
                Stop SMS
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => setShowSmsModal(false)}
                className="px-5 py-2 rounded-full bg-[#1F4A34] text-white text-[13px] font-medium hover:bg-[#2C6343] shadow-xs cursor-pointer"
              >
                Keep SMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

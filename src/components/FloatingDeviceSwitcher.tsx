import React from 'react';
import { Monitor, Smartphone, Sprout, ShieldCheck, RotateCcw, Clock, Users, UserCog } from 'lucide-react';
import { AppRole } from '../types';

export type PreviewMode = 'desktop' | 'mobile_m1' | 'mobile_m2';

interface FloatingDeviceSwitcherProps {
  role?: AppRole;
  onRoleChange?: (role: AppRole) => void;
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
  hasUnsavedBar: boolean;
  onResetDemo?: () => void;
  onSimulateTimeout?: () => void;
}

export const FloatingDeviceSwitcher: React.FC<FloatingDeviceSwitcherProps> = ({
  role = 'farmer',
  onRoleChange = () => {},
  previewMode,
  onPreviewModeChange,
  hasUnsavedBar,
  onResetDemo,
  onSimulateTimeout,
}) => {
  return (
    <aside
      aria-label="Role and Viewport Switcher"
      className={`fixed right-6 z-40 transition-all duration-300 ${
        hasUnsavedBar ? 'bottom-20' : 'bottom-5'
      }`}
    >
      <div className="bg-[#FBFCF8]/95 backdrop-blur-md p-1 rounded-full border border-[rgba(31,74,52,0.15)] shadow-[0_4px_20px_rgba(31,74,52,0.15)] flex items-center gap-1.5 text-[11px] font-medium">
        {/* Role Switcher: [Farmer] [Cooperative] [Officer] [Admin] */}
        <div className="flex items-center gap-0.5 bg-[#F4F6EF] p-0.5 rounded-full border border-[rgba(31,74,52,0.08)]">
          <button
            onClick={() => onRoleChange('farmer')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              role === 'farmer'
                ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
                : 'text-[#5B665E] hover:text-[#17271D]'
            }`}
            title="Farmer Dashboard"
          >
            <Sprout className="w-3 h-3" strokeWidth={1.75} />
            <span>Farmer</span>
          </button>
          <button
            onClick={() => onRoleChange('cooperative')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              role === 'cooperative'
                ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
                : 'text-[#5B665E] hover:text-[#17271D]'
            }`}
            title="Cooperative Dashboard (Desktop only)"
          >
            <Users className="w-3 h-3" strokeWidth={1.75} />
            <span>Cooperative</span>
          </button>
          <button
            onClick={() => onRoleChange('officer')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              role === 'officer'
                ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
                : 'text-[#5B665E] hover:text-[#17271D]'
            }`}
            title="Agricultural Officer Dashboard"
          >
            <ShieldCheck className="w-3 h-3" strokeWidth={1.75} />
            <span>Officer</span>
          </button>
          <button
            onClick={() => onRoleChange('admin')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
                : 'text-[#5B665E] hover:text-[#17271D]'
            }`}
            title="Administrator console (Desktop only)"
          >
            <UserCog className="w-3 h-3" strokeWidth={1.75} />
            <span>Admin</span>
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-4 bg-[rgba(31,74,52,0.15)]" />

        {/* Device Switcher (Desktop only in officer mode; Desktop, M1, M2 in farmer mode) */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onPreviewModeChange('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              previewMode === 'desktop'
                ? 'bg-[#1F4A34] text-white shadow-xs'
                : 'text-[#5B665E] hover:text-[#17271D]'
            }`}
            title="Full Desktop View"
          >
            <Monitor className="w-3 h-3" strokeWidth={1.5} />
            <span>Desktop</span>
          </button>

          {role === 'farmer' && (
            <>
              <button
                onClick={() => onPreviewModeChange('mobile_m1')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  previewMode === 'mobile_m1'
                    ? 'bg-[#1F4A34] text-white shadow-xs'
                    : 'text-[#5B665E] hover:text-[#17271D]'
                }`}
                title="Mobile M1 Frame"
              >
                <Smartphone className="w-3 h-3" strokeWidth={1.5} />
                <span>M1</span>
              </button>
              <button
                onClick={() => onPreviewModeChange('mobile_m2')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  previewMode === 'mobile_m2'
                    ? 'bg-[#1F4A34] text-white shadow-xs'
                    : 'text-[#5B665E] hover:text-[#17271D]'
                }`}
                title="Mobile M2 Frame"
              >
                <Smartphone className="w-3 h-3" strokeWidth={1.5} />
                <span>M2</span>
              </button>
            </>
          )}
        </div>

        {/* Reset Demo button */}
        {onResetDemo && (
          <>
            <div className="w-[1px] h-4 bg-[rgba(31,74,52,0.15)]" />
            <button
              onClick={onResetDemo}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[#5B665E] hover:text-[#17271D] hover:bg-[#E4ECDB] transition-all cursor-pointer active:scale-98"
              title="Reset demo data to initial state"
            >
              <RotateCcw className="w-3 h-3 text-[#1F4A34]" strokeWidth={1.75} />
              <span>Reset demo</span>
            </button>
          </>
        )}

        {/* Simulate Timeout button */}
        {onSimulateTimeout && (
          <>
            <div className="w-[1px] h-4 bg-[rgba(31,74,52,0.15)]" />
            <button
              onClick={onSimulateTimeout}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[#5B665E] hover:text-[#17271D] hover:bg-[#E4ECDB] transition-all cursor-pointer active:scale-98"
              title="Simulate inactivity timeout"
            >
              <Clock className="w-3 h-3 text-[#1F4A34]" strokeWidth={1.75} />
              <span>Simulate timeout</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

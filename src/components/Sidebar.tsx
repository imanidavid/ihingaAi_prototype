import React from 'react';
import {
  LayoutDashboard,
  CloudRain,
  AlertTriangle,
  Sprout,
  CalendarDays,
  Eye,
  Settings,
  ArrowRight,
  Leaf,
  FileText,
  ClipboardList,
  Users,
  MessageSquare,
  GraduationCap,
  UserCog,
  ShieldCheck,
  Database,
  Workflow,
  BellRing,
  LineChart,
  Table2,
} from 'lucide-react';
import { NavView, AppRole } from '../types';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenReportModal: () => void;
  role?: AppRole;
  reportsToReviewCount?: number;
  /** Cooperative members under an active warning (computed in App from the store). */
  coopMembersUnderWarning?: number;
  coopTotalMembers?: number;
  /** Access requests waiting for an administrator (computed in App). */
  pendingAccessRequests?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenReportModal,
  role = 'farmer',
  reportsToReviewCount = 3,
  coopMembersUnderWarning = 0,
  coopTotalMembers = 0,
  pendingAccessRequests = 0,
}) => {
  const isOfficer = role === 'officer';
  const isCoop = role === 'cooperative';
  const isAdmin = role === 'admin';
  const isResearcher = role === 'researcher';

  const farmerNavItems: { id: NavView; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'forecast', label: 'Risk forecast', icon: CloudRain },
    { id: 'warnings', label: 'Early warnings', icon: AlertTriangle },
    { id: 'recommendations', label: 'Recommendations', icon: Sprout },
    { id: 'calendar', label: 'Crop calendar', icon: CalendarDays },
    { id: 'observations', label: 'Observations', icon: Eye },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const officerNavItems: { id: NavView; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'forecast', label: 'Risk forecast', icon: CloudRain },
    { id: 'warnings', label: 'Warnings', icon: AlertTriangle },
    { id: 'observations', label: 'Observations', icon: Eye },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const coopNavItems: { id: NavView; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members & groups', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'meetings', label: 'Meetings', icon: CalendarDays },
    { id: 'training', label: 'Training', icon: GraduationCap },
    { id: 'forecast', label: 'Risk forecast', icon: CloudRain },
    { id: 'warnings', label: 'Early warnings', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const adminNavItems: { id: NavView; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users & access', icon: UserCog },
    { id: 'security', label: 'Security & audit', icon: ShieldCheck },
    { id: 'data_sources', label: 'Data sources', icon: Database },
    { id: 'processing', label: 'Data processing', icon: Workflow },
    { id: 'notifications', label: 'Notifications', icon: BellRing },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const researcherNavItems: { id: NavView; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
    { id: 'forecast', label: 'Risk forecast', icon: CloudRain },
    { id: 'model_performance', label: 'Model performance', icon: LineChart },
    { id: 'field_data', label: 'Field data', icon: Table2 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const navItems = isOfficer
    ? officerNavItems
    : isCoop
    ? coopNavItems
    : isAdmin
    ? adminNavItems
    : isResearcher
    ? researcherNavItems
    : farmerNavItems;

  return (
    <aside className="w-[220px] flex-shrink-0 h-screen sticky top-0 bg-[#F4F6EF] border-r border-[rgba(31,74,52,0.08)] flex flex-col justify-between p-3.5 select-none overflow-hidden">
      {/* Top Section */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2.5 py-2 mb-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#1F4A34] flex items-center justify-center text-white shadow-xs">
            <Leaf className="w-4 h-4 text-[#E4ECDB]" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-[#17271D]">IHINGA AI</span>
            <span className="text-[10px] text-[#5B665E] font-medium tracking-normal -mt-0.5">
              {isOfficer
                ? 'Musanze Officer Desk'
                : isCoop
                ? 'Cooperative Desk'
                : isAdmin
                ? 'Admin console'
                : isResearcher
                ? 'Research desk'
                : 'Rwanda Farmer Desk'}
            </span>
          </div>
        </div>

        {/* Navigation Items (Scrolls if needed so bottom card is always completely visible at 768px height) */}
        <nav className="space-y-1 overflow-y-auto flex-1 pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // ONLY the current page's item shows the active pill. Never two.
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-full transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-[#E4ECDB] text-[#17271D] shadow-xs font-semibold'
                    : 'text-[#5B665E] hover:text-[#17271D] hover:bg-[rgba(31,74,52,0.04)]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-[#1F4A34]' : 'text-[#5B665E]'}`}
                  strokeWidth={1.5}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Bottom Promo Card */}
      <div className="flex-shrink-0 pt-3">
        {isAdmin || isResearcher ? (
          <div className="bg-[#FBFCF8] rounded-[16px] p-3 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] relative overflow-hidden">
            <div className="w-6 h-6 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center justify-center mb-1.5">
              {isAdmin ? (
                <UserCog className="w-3 h-3 text-[#1F4A34]" strokeWidth={1.5} />
              ) : (
                <LineChart className="w-3 h-3 text-[#1F4A34]" strokeWidth={1.5} />
              )}
            </div>
            <h4 className="text-[12px] font-semibold text-[#17271D] leading-tight">
              {isAdmin
                ? pendingAccessRequests === 0
                  ? 'No access requests waiting'
                  : `${pendingAccessRequests} access ${pendingAccessRequests === 1 ? 'request' : 'requests'} waiting`
                : 'Prototype results'}
            </h4>
            <p className="text-[10.5px] text-[#5B665E] mt-0.5 leading-tight">
              {isAdmin ? 'Approve or reject new staff accounts.' : 'Forecast checks use simulated data.'}
            </p>
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => onSelectView(isAdmin ? 'users' : 'forecast')}
                title={isAdmin ? 'Review access requests' : 'Open risk forecast'}
                className="w-8 h-8 rounded-full bg-[#1F4A34] text-white flex items-center justify-center hover:bg-[#2C6343] transition-colors shadow-xs group cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ) : isOfficer ? (
          <div className="bg-[#FBFCF8] rounded-[16px] p-3 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] relative overflow-hidden">
            <div className="w-6 h-6 rounded-full bg-[#D9A032]/20 border border-[#D9A032]/30 flex items-center justify-center mb-1.5">
              <ClipboardList className="w-3 h-3 text-[#9E6905]" strokeWidth={1.5} />
            </div>
            <h4 className="text-[12px] font-semibold text-[#17271D] leading-tight">
              {reportsToReviewCount} {reportsToReviewCount === 1 ? 'report waiting' : 'reports waiting'}
            </h4>
            <p className="text-[10.5px] text-[#5B665E] mt-0.5 leading-tight">
              Farmers' field reports need your review.
            </p>
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => onSelectView('observations')}
                title="Review Observations"
                className="w-8 h-8 rounded-full bg-[#1F4A34] text-white flex items-center justify-center hover:bg-[#2C6343] transition-colors shadow-xs group cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ) : isCoop ? (
          <div className="bg-[#FBFCF8] rounded-[16px] p-3 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] relative overflow-hidden">
            <div className="w-6 h-6 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center justify-center mb-1.5">
              <AlertTriangle className="w-3 h-3 text-[#1F4A34]" strokeWidth={1.5} />
            </div>
            <h4 className="text-[12px] font-semibold text-[#17271D] leading-tight">
              {coopMembersUnderWarning === 0
                ? 'No members under warning'
                : `${coopMembersUnderWarning} of ${coopTotalMembers} members under warning`}
            </h4>
            <p className="text-[10.5px] text-[#5B665E] mt-0.5 leading-tight">
              Review group risk and broadcast advisories.
            </p>
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => onSelectView('warnings')}
                title="View early warnings"
                className="w-8 h-8 rounded-full bg-[#1F4A34] text-white flex items-center justify-center hover:bg-[#2C6343] transition-colors shadow-xs group cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#FBFCF8] rounded-[16px] p-3 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] relative overflow-hidden">
            <div className="w-6 h-6 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center justify-center mb-1.5">
              <Leaf className="w-3 h-3 text-[#1F4A34]" strokeWidth={1.5} />
            </div>
            <h4 className="text-[12px] font-semibold text-[#17271D] leading-tight">
              Seen something in your field?
            </h4>
            <p className="text-[10.5px] text-[#5B665E] mt-0.5 leading-tight">
              Report it and help improve local forecasts.
            </p>
            <div className="mt-2 flex justify-end">
              <button
                onClick={onOpenReportModal}
                title="Report Observation"
                className="w-8 h-8 rounded-full bg-[#1F4A34] text-white flex items-center justify-center hover:bg-[#2C6343] transition-colors shadow-xs group cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

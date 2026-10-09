import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Bell,
  MapPin,
  ChevronDown,
  X,
  AlertTriangle,
  Sprout,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CloudRain,
  Settings as SettingsIcon,
  Eye,
  FileText,
  LogOut,
  User,
  CalendarDays,
} from 'lucide-react';
import {
  MUSANZE_RECORD,
  MUSANZE_SECTORS_CELLS,
  OFFICER_DATA,
  COOPERATIVE_DATA,
} from '../data/musanzeData';
import { AlertItem, CropAdvisory, NavView, AppRole, NotificationItem, UserAccount } from '../types';
import { ROLE_LABELS } from '../data/musanzeData';
import { DEMO_ACCOUNT_ID_BY_ROLE } from '../data/rwandaAdminData';

type ViewType = NavView;

interface TopbarProps {
  onOpenAlertsList: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSettings?: () => void;
  onSignOut?: () => void;
  onSelectAlert?: (alert: AlertItem) => void;
  onSelectAdvisory?: (advisory: CropAdvisory) => void;
  onNavigateView?: (view: ViewType) => void;
  role?: AppRole;
  bellCount?: number;
  notifications?: NotificationItem[];
  onNotificationClick?: (item: NotificationItem) => void;
  warnings?: AlertItem[];
  /** Signed-in account (used for the administrator and researcher profile). */
  account?: UserAccount;
  /** Crop advice the search can find (farmers: only advice for their active warnings). */
  advisories?: CropAdvisory[];
  /** Sectors at Watch or above (computed), for the sector search results. */
  atRiskSectors?: string[];
}

interface SearchItem {
  id: string;
  type: 'alert' | 'advisory' | 'sector' | 'view';
  title: string;
  subtitle: string;
  categoryLabel: string;
  severity?: 'High' | 'Watch' | 'Low' | 'Critical';
  icon: React.ReactNode;
  action: () => void;
}

const FARMER_APP_VIEWS: {
  id: ViewType;
  title: string;
  subtitle: string;
  keywords: string[];
  icon: React.ReactNode;
}[] = [
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    subtitle: 'Musanze weather, KPI metrics and seasonal progress',
    keywords: ['dashboard', 'home', 'overview', 'summary', 'weather', 'kpi'],
    icon: <Layers className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'forecast',
    title: 'Risk forecast & rainfall',
    subtitle: '30-day rain series and sector risk rankings',
    keywords: ['forecast', 'rainfall', 'precipitation', 'rain', '30d', '10d', 'season', 'sectors', 'weather'],
    icon: <CloudRain className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'warnings',
    title: 'Early warnings',
    subtitle: 'Hazard alerts, downpour timing and required field precautions',
    keywords: ['warnings', 'alerts', 'hazards', 'severe', 'blight', 'downpour', 'threat', 'storm'],
    icon: <AlertTriangle className="w-3.5 h-3.5 text-[#D9772F]" />,
  },
  {
    id: 'recommendations',
    title: 'Recommendations & Advisories',
    subtitle: 'Crop-specific guidance for Irish Potato, Beans and Maize',
    keywords: ['recommendations', 'advisories', 'advice', 'potato', 'beans', 'maize', 'spraying', 'fertilizer', 'crops'],
    icon: <Sprout className="w-3.5 h-3.5 text-[#3E8E55]" />,
  },
  {
    id: 'calendar',
    title: 'Crop calendar',
    subtitle: 'Planting and harvest windows, monthly soil moisture breakdown',
    keywords: ['calendar', 'planting', 'harvest', 'soil', 'moisture', 'season', 'months', 'september', 'october'],
    icon: <Calendar className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'observations',
    title: 'Field Observations',
    subtitle: 'Community reports, rainfall measurements and extension feedback',
    keywords: ['observations', 'reports', 'report', 'officer', 'extension', 'field', 'community'],
    icon: <Eye className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'settings',
    title: 'Profile & Settings',
    subtitle: 'Farmer profile, SMS channels, languages and alert preferences',
    keywords: ['settings', 'profile', 'sms', 'notifications', 'language', 'account', 'preferences'],
    icon: <SettingsIcon className="w-3.5 h-3.5 text-[#5B665E]" />,
  },
];

const OFFICER_APP_VIEWS: {
  id: ViewType;
  title: string;
  subtitle: string;
  keywords: string[];
  icon: React.ReactNode;
}[] = [
  {
    id: 'dashboard',
    title: 'Officer Dashboard',
    subtitle: 'District risk status, sector overviews, and field review queue',
    keywords: ['dashboard', 'overview', 'officer', 'sectors', 'kpi', 'summary'],
    icon: <Layers className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'forecast',
    title: 'Risk forecast',
    subtitle: 'Rainfall series and sector vulnerability rankings for Musanze',
    keywords: ['forecast', 'risk', 'rainfall', 'precipitation', 'rain', 'sectors', 'weather'],
    icon: <CloudRain className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'warnings',
    title: 'Warnings',
    subtitle: 'District alert broadcasts and delivery acknowledgements',
    keywords: ['warnings', 'alerts', 'delivery', 'hazards', 'blight', 'rain'],
    icon: <AlertTriangle className="w-3.5 h-3.5 text-[#D9772F]" />,
  },
  {
    id: 'observations',
    title: 'Observations',
    subtitle: 'Field observations and verification pipeline',
    keywords: ['observations', 'field reports', 'review', 'verification', 'farmers'],
    icon: <Eye className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'reports',
    title: 'Reports',
    subtitle: 'District agricultural statistics and weekly summaries',
    keywords: ['reports', 'summary', 'district', 'weekly', 'statistics'],
    icon: <FileText className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Officer authentication, security preferences and profile',
    keywords: ['settings', 'profile', 'security', 'account', 'two-step', '2fa'],
    icon: <SettingsIcon className="w-3.5 h-3.5 text-[#5B665E]" />,
  },
];

const ADMIN_APP_VIEWS: {
  id: ViewType;
  title: string;
  subtitle: string;
  keywords: string[];
  icon: React.ReactNode;
}[] = [
  {
    id: 'dashboard',
    title: 'Admin dashboard',
    subtitle: 'Users by role, access requests and system status',
    keywords: ['dashboard', 'overview', 'admin', 'summary'],
    icon: <Layers className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'users',
    title: 'Users & access',
    subtitle: 'Accounts, roles, access requests, permissions and import',
    keywords: ['users', 'access', 'roles', 'permissions', 'requests', 'approve', 'import', 'accounts'],
    icon: <User className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'reports',
    title: 'Reports',
    subtitle: 'System-wide reports',
    keywords: ['reports', 'summary', 'export'],
    icon: <FileText className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Profile and security preferences',
    keywords: ['settings', 'profile', 'security', 'two-step'],
    icon: <SettingsIcon className="w-3.5 h-3.5 text-[#5B665E]" />,
  },
];

const RESEARCHER_APP_VIEWS: {
  id: ViewType;
  title: string;
  subtitle: string;
  keywords: string[];
  icon: React.ReactNode;
}[] = [
  {
    id: 'dashboard',
    title: 'Research dashboard',
    subtitle: 'Forecast hits, warning hit rate and field checks',
    keywords: ['dashboard', 'overview', 'research', 'summary'],
    icon: <Layers className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'forecast',
    title: 'Risk forecast',
    subtitle: 'Sector risk and rainfall for Musanze',
    keywords: ['forecast', 'risk', 'rain', 'sectors'],
    icon: <CloudRain className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'model_performance',
    title: 'Model performance',
    subtitle: 'Forecast vs observed, accuracy by horizon, validation',
    keywords: ['model', 'performance', 'accuracy', 'validation', 'observed', 'hit rate'],
    icon: <Layers className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'field_data',
    title: 'Field data',
    subtitle: 'Anonymised field reports and CSV export',
    keywords: ['field', 'data', 'reports', 'export', 'csv', 'anonymised'],
    icon: <FileText className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'reports',
    title: 'Reports',
    subtitle: 'Build and export reports',
    keywords: ['reports', 'export', 'pdf'],
    icon: <FileText className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
];

const COOP_APP_VIEWS: {
  id: ViewType;
  title: string;
  subtitle: string;
  keywords: string[];
  icon: React.ReactNode;
}[] = [
  {
    id: 'dashboard',
    title: 'Cooperative Dashboard',
    subtitle: 'Musanze Potato Growers overview, member risk and alerts',
    keywords: ['dashboard', 'overview', 'cooperative', 'members', 'kpi'],
    icon: <Layers className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'members',
    title: 'Members & groups',
    subtitle: 'Kinigi, Busogo, and Muhoza potato grower groups',
    keywords: ['members', 'groups', 'kinigi', 'busogo', 'muhoza', 'growers'],
    icon: <User className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'messages',
    title: 'Messages',
    subtitle: 'Broadcast alerts and SMS updates to member groups',
    keywords: ['messages', 'sms', 'broadcast', 'voice', 'members'],
    icon: <FileText className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'meetings',
    title: 'Meetings',
    subtitle: 'Cooperative meetings and member schedules',
    keywords: ['meetings', 'schedule', 'assembly'],
    icon: <Calendar className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'training',
    title: 'Training',
    subtitle: 'Agronomic workshops and cooperative training',
    keywords: ['training', 'workshop', 'field day'],
    icon: <Sprout className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'forecast',
    title: 'Risk forecast',
    subtitle: 'Rainfall series and sector vulnerability rankings for Musanze',
    keywords: ['forecast', 'risk', 'rainfall', 'precipitation', 'rain'],
    icon: <CloudRain className="w-3.5 h-3.5 text-[#1F4A34]" />,
  },
  {
    id: 'warnings',
    title: 'Early warnings',
    subtitle: 'Active hazard warnings and member acknowledgement',
    keywords: ['warnings', 'alerts', 'delivery', 'hazards', 'blight', 'rain'],
    icon: <AlertTriangle className="w-3.5 h-3.5 text-[#D9772F]" />,
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Cooperative profile, notification preferences and channels',
    keywords: ['settings', 'profile', 'cooperative', 'account'],
    icon: <SettingsIcon className="w-3.5 h-3.5 text-[#5B665E]" />,
  },
];

export const Topbar: React.FC<TopbarProps> = ({
  onOpenAlertsList,
  searchQuery,
  onSearchChange,
  onOpenSettings,
  onSignOut,
  onSelectAlert,
  onSelectAdvisory,
  onNavigateView,
  role = 'farmer',
  bellCount,
  notifications = [],
  onNotificationClick,
  warnings = [],
  account,
  advisories = [],
  atRiskSectors = [],
}) => {
  const isOfficer = role === 'officer';
  const isCoop = role === 'cooperative';
  // Administrator and researcher profiles come from the signed-in account record
  // (and for any account that is not the role's seeded demo profile, e.g. a newly approved officer)
  const fromAccount =
    account && (role === 'admin' || role === 'researcher' || account.id !== DEMO_ACCOUNT_ID_BY_ROLE[role])
      ? account
      : null;
  const appViews = isOfficer
    ? OFFICER_APP_VIEWS
    : isCoop
    ? COOP_APP_VIEWS
    : role === 'admin'
    ? ADMIN_APP_VIEWS
    : role === 'researcher'
    ? RESEARCHER_APP_VIEWS
    : FARMER_APP_VIEWS;

  const userInitials = fromAccount
    ? fromAccount.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('')
    : isOfficer
    ? OFFICER_DATA.profile.initials
    : isCoop
    ? COOPERATIVE_DATA.leader.initials
    : 'JB';

  const userFullName = fromAccount
    ? fromAccount.fullName
    : isOfficer
    ? OFFICER_DATA.profile.fullName
    : isCoop
    ? COOPERATIVE_DATA.leader.name
    : MUSANZE_RECORD.farmerFullName;

  const userRoleTitle = fromAccount
    ? `${ROLE_LABELS[fromAccount.role]} · ${fromAccount.district}`
    : isOfficer
    ? OFFICER_DATA.profile.roleTitle
    : isCoop
    ? COOPERATIVE_DATA.leader.roleTitle
    : 'Registered Farmer';

  const userContact = fromAccount
    ? fromAccount.email || fromAccount.phone
    : isOfficer
    ? 'claudine.m@ihinga.demo'
    : isCoop
    ? COOPERATIVE_DATA.leader.phone
    : '+250 788 000 012';

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Bell dropdown state
  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Avatar dropdown menu state
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Close search, bell and avatar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsBellOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global shortcut: press '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const trimmedQuery = searchQuery.trim().toLowerCase();

  // Compute matched items
  const matchedItems = useMemo<SearchItem[]>(() => {
    if (!trimmedQuery) return [];

    const items: SearchItem[] = [];

    // 1. Match Warnings / Alerts
    warnings.forEach((alert) => {
      const matchInTitle = alert.title.toLowerCase().includes(trimmedQuery);
      const matchInCategory = (alert.category || alert.riskType || '').toLowerCase().includes(trimmedQuery);
      const matchInArea = (alert.affectedArea || '').toLowerCase().includes(trimmedQuery);
      const matchInSeverity = (alert.severity || '').toLowerCase().includes(trimmedQuery);
      const matchInActions = alert.recommendedActions?.some((a) =>
        a.toLowerCase().includes(trimmedQuery)
      );

      if (matchInTitle || matchInCategory || matchInArea || matchInSeverity || matchInActions) {
        items.push({
          id: `alert-${alert.id}`,
          type: 'alert',
          title: alert.title,
          subtitle: `${alert.affectedArea} · ${alert.timeframe}`,
          categoryLabel: 'Alert',
          severity: alert.severity,
          icon: <AlertTriangle className="w-3.5 h-3.5 text-[#D9772F]" />,
          action: () => {
            onSelectAlert?.(alert);
            onSearchChange('');
            setIsOpen(false);
          },
        });
      }
    });

    // 2. Match Crop Advisories (Farmer only)
    if (!isOfficer) {
      advisories.forEach((adv) => {
        const matchInCrop = adv.crop.toLowerCase().includes(trimmedQuery);
        const matchInTitle = adv.title.toLowerCase().includes(trimmedQuery);
        const matchInCategory = adv.category.toLowerCase().includes(trimmedQuery);
        const matchInAdvice = adv.oneLineAdvice.toLowerCase().includes(trimmedQuery);
        const matchInWhy = adv.whyAdvice.toLowerCase().includes(trimmedQuery);
        const matchInSteps = adv.mitigationSteps.some((s) =>
          s.toLowerCase().includes(trimmedQuery)
        );

        if (matchInCrop || matchInTitle || matchInCategory || matchInAdvice || matchInWhy || matchInSteps) {
          items.push({
            id: `advisory-${adv.id}`,
            type: 'advisory',
            title: adv.title,
            subtitle: `${adv.crop} · ${adv.category}`,
            categoryLabel: 'Advisory',
            icon: <Sprout className="w-3.5 h-3.5 text-[#3E8E55]" />,
            action: () => {
              onSelectAdvisory?.(adv);
              onSearchChange('');
              setIsOpen(false);
            },
          });
        }
      });
    }

    // 3. Match Sectors & Cells
    Object.entries(MUSANZE_SECTORS_CELLS).forEach(([sectorName, cells]) => {
      const matchSector = sectorName.toLowerCase().includes(trimmedQuery);
      const matchCells = cells.some((c) => c.toLowerCase().includes(trimmedQuery));
      const isWatch = atRiskSectors.includes(sectorName);

      if (matchSector || matchCells) {
        items.push({
          id: `sector-${sectorName}`,
          type: 'sector',
          title: `${sectorName} Sector`,
          subtitle: `Cells: ${cells.slice(0, 3).join(', ')}${cells.length > 3 ? ` +${cells.length - 3}` : ''}`,
          categoryLabel: 'Sector',
          severity: isWatch ? 'Watch' : 'Low',
          icon: <MapPin className="w-3.5 h-3.5 text-[#1F4A34]" />,
          action: () => {
            onNavigateView?.('forecast');
            onSearchChange('');
            setIsOpen(false);
          },
        });
      }
    });

    // 4. Match App Views / Pages
    appViews.forEach((view) => {
      const matchTitle = view.title.toLowerCase().includes(trimmedQuery);
      const matchSubtitle = view.subtitle.toLowerCase().includes(trimmedQuery);
      const matchKeywords = view.keywords.some((kw) => kw.includes(trimmedQuery));

      if (matchTitle || matchSubtitle || matchKeywords) {
        items.push({
          id: `view-${view.id}`,
          type: 'view',
          title: view.title,
          subtitle: view.subtitle,
          categoryLabel: 'Page',
          icon: view.icon,
          action: () => {
            onNavigateView?.(view.id);
            onSearchChange('');
            setIsOpen(false);
          },
        });
      }
    });

    return items;
  }, [trimmedQuery, onSelectAlert, onSelectAdvisory, onNavigateView, onSearchChange, isOfficer, appViews, advisories, atRiskSectors]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [trimmedQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (matchedItems.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % matchedItems.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (matchedItems.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + matchedItems.length) % matchedItems.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (matchedItems.length > 0 && matchedItems[selectedIndex]) {
        matchedItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const quickSuggestions = isOfficer
    ? [
        { label: 'Kinigi', query: 'kinigi' },
        { label: 'Busogo', query: 'busogo' },
        { label: 'Late Blight', query: 'late blight' },
        { label: 'Heavy Rain', query: 'heavy rain' },
        { label: 'Risk forecast', query: 'forecast' },
        { label: 'Observations', query: 'observations' },
      ]
    : [
        { label: 'Late Blight', query: 'late blight' },
        { label: 'Heavy Rain', query: 'heavy rain' },
        { label: 'Irish Potato', query: 'potato' },
        { label: 'Kinigi Sector', query: 'kinigi' },
        { label: 'Risk forecast', query: 'forecast' },
        { label: 'Crop calendar', query: 'calendar' },
      ];

  const getSeverityChip = (severity?: string) => {
    if (!severity) return null;
    if (severity === 'High') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D9772F]/15 text-[#D9772F]">
          High
        </span>
      );
    }
    if (severity === 'Watch') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D9A032]/20 text-[#9E6905]">
          Watch
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E4ECDB] text-[#1F4A34]">
        Low
      </span>
    );
  };

  return (
    <header className="h-16 px-6 border-b border-[rgba(31,74,52,0.08)] bg-[#F4F6EF] flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Search Bar Container */}
      <div ref={containerRef} className="relative flex items-center gap-3 flex-1 max-w-lg">
        <div className="relative w-full">
          <Search
            className="w-4 h-4 text-[#5B665E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.5}
          />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search advisories, sectors, weather alerts... (Press /)"
            className="w-full bg-[#FBFCF8] text-[#17271D] placeholder-[#5B665E] text-[13px] rounded-full pl-9 pr-9 py-2 border border-[rgba(31,74,52,0.12)] focus:outline-none focus:border-[#1F4A34] focus:ring-1 focus:ring-[#1F4A34] shadow-xs transition-all"
          />

          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
                setIsOpen(true);
                inputRef.current?.focus();
              }}
              className="w-5 h-5 rounded-full bg-[#E4ECDB] text-[#5B665E] hover:text-[#17271D] absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer transition-colors"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-2 bg-[#FBFCF8] rounded-[20px] border border-[rgba(31,74,52,0.14)] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-[440px] flex flex-col">
            {trimmedQuery ? (
              // Results List
              matchedItems.length > 0 ? (
                <div className="flex-1 overflow-y-auto divide-y divide-[rgba(31,74,52,0.06)]">
                  <div className="px-4 py-2 bg-[#F4F6EF]/80 text-[11px] font-semibold text-[#5B665E] flex items-center justify-between">
                    <span>Matches for "{searchQuery}"</span>
                    <span className="text-[#1F4A34]">{matchedItems.length} found</span>
                  </div>

                  {matchedItems.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={item.action}
                        className={`px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#E4ECDB]/60' : 'hover:bg-[#F4F6EF]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-white border border-[rgba(31,74,52,0.10)] flex items-center justify-center flex-shrink-0 shadow-xs">
                            {item.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-medium text-[#17271D] truncate">
                                {item.title}
                              </span>
                              <span className="px-1.5 py-0.2 rounded-md bg-[#F4F6EF] text-[#5B665E] text-[10px] font-medium border border-[rgba(31,74,52,0.08)] flex-shrink-0">
                                {item.categoryLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#5B665E] truncate">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getSeverityChip(item.severity)}
                          <ArrowRight className="w-3.5 h-3.5 text-[#5B665E]/70" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Zero results state
                <div className="p-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#F4F6EF] text-[#5B665E] flex items-center justify-center mx-auto">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-[14px] font-semibold text-[#17271D]">
                    No results for "{searchQuery}"
                  </h4>
                  <p className="text-[11.5px] text-[#5B665E] max-w-xs mx-auto">
                    Try searching for crops (potato, beans, maize), hazards (blight, rain), or sector names (Kinigi, Muhoza).
                  </p>
                </div>
              )
            ) : (
              // Empty query state: Quick Suggestions
              <div className="p-4 space-y-3">
                <div className="text-[11px] font-semibold text-[#5B665E]">
                  Quick searches
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickSuggestions.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => {
                        onSearchChange(s.query);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#F4F6EF] hover:bg-[#E4ECDB] text-[#17271D] text-[11.5px] font-medium border border-[rgba(31,74,52,0.08)] transition-colors cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-[rgba(31,74,52,0.06)] flex items-center justify-between text-[11px] text-[#5B665E]">
                  <span>Navigate using ↑ ↓ arrows and Enter</span>
                  <span className="text-[10px] bg-[#F4F6EF] px-1.5 py-0.5 rounded border border-[rgba(31,74,52,0.10)]">
                    Esc to close
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* District Chip */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] text-[12px] font-medium text-[#17271D]">
          <MapPin className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
          <span>{MUSANZE_RECORD.districtName}</span>
        </div>

        {/* Bell with Unread Badge & Dropdown (FIX 5) */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setIsBellOpen((prev) => !prev)}
            title={isOfficer ? 'Notifications & warnings' : 'Notifications & warnings'}
            className="relative w-9 h-9 rounded-full bg-[#FBFCF8] border border-[rgba(31,74,52,0.12)] flex items-center justify-center text-[#17271D] hover:bg-[#E4ECDB] transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 text-[#17271D]" strokeWidth={1.5} />
            {(() => {
              const unread =
                notifications !== undefined
                  ? notifications.filter((n) => !n.isRead).length
                  : bellCount !== undefined
                  ? bellCount
                  : isOfficer
                  ? OFFICER_DATA.profile.bellCount
                  : MUSANZE_RECORD.activeWarningsCount;
              return unread > 0 ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D9772F] text-white text-[10px] font-semibold flex items-center justify-center border border-[#F4F6EF]">
                  {unread}
                </span>
              ) : null;
            })()}
          </button>

          {/* Bell Dropdown */}
          {isBellOpen && (
            <div className="absolute right-0 top-11 w-80 sm:w-96 bg-[#FBFCF8] rounded-[16px] border border-[rgba(31,74,52,0.15)] shadow-xl z-50 overflow-hidden animate-in fade-in">
              <div className="p-3.5 border-b border-[rgba(31,74,52,0.08)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#1F4A34]" strokeWidth={2} />
                  <span className="text-[13px] font-semibold text-[#17271D]">Notifications</span>
                  {(() => {
                    const unread =
                      notifications !== undefined
                        ? notifications.filter((n) => !n.isRead).length
                        : bellCount !== undefined
                        ? bellCount
                        : 0;
                    return unread > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#D9772F] text-white text-[10px] font-semibold">
                        {unread} unread
                      </span>
                    ) : null;
                  })()}
                </div>
                <span className="text-[11px] text-[#5B665E]">Tap item to open</span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[rgba(31,74,52,0.06)]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[12.5px] text-[#5B665E]">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onNotificationClick?.(item);
                        setIsBellOpen(false);
                      }}
                      className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                        !item.isRead ? 'bg-[#E4ECDB]/30 hover:bg-[#E4ECDB]/50' : 'hover:bg-[#F4F6EF]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#FBFCF8] border border-[rgba(31,74,52,0.12)] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                        {item.type === 'warning' ? (
                          <AlertTriangle
                            className={`w-4 h-4 ${
                              item.severity === 'High' ? 'text-[#D9772F]' : 'text-[#D9A032]'
                            }`}
                            strokeWidth={1.5}
                          />
                        ) : item.type === 'feedback' ? (
                          <ShieldCheck className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
                        ) : item.type === 'access_request' ? (
                          <User className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
                        ) : item.type === 'meeting' ? (
                          <CalendarDays className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
                        ) : (
                          <Eye className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-[12.5px] font-semibold text-[#17271D] truncate">
                            {item.title}
                          </h4>
                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#D9772F] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11.5px] text-[#5B665E] line-clamp-2 mt-0.5 leading-snug">
                          {item.subtitle}
                        </p>
                        <span className="text-[10.5px] text-[#5B665E] mt-1 block tabular-nums">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-[rgba(31,74,52,0.12)]" />

        {/* User Profile with Dropdown Menu */}
        <div ref={avatarRef} className="relative">
          <button
            type="button"
            onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
            className="flex items-center gap-2.5 pl-1 cursor-pointer group hover:opacity-90 transition-opacity"
            title="User account menu"
          >
            <div className="w-8 h-8 rounded-full bg-[#1F4A34] text-white flex items-center justify-center text-xs font-semibold ring-2 ring-[#E4ECDB]">
              {userInitials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[13px] font-medium text-[#17271D] group-hover:text-[#1F4A34] transition-colors">
                {userFullName}
              </span>
              <span className="text-[11px] text-[#5B665E]">
                {userRoleTitle}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#5B665E] transition-transform duration-200 ${
                isAvatarMenuOpen ? 'rotate-180 text-[#1F4A34]' : ''
              }`}
              strokeWidth={1.5}
            />
          </button>

          {/* Avatar Dropdown Menu */}
          {isAvatarMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-[rgba(31,74,52,0.12)] shadow-xl py-1.5 z-50 divide-y divide-[rgba(31,74,52,0.06)] animate-in fade-in slide-in-from-top-1 text-[12.5px]">
              <div className="px-3.5 py-2">
                <p className="font-semibold text-[#17271D] truncate">
                  {userFullName}
                </p>
                <p className="text-[11px] text-[#5B665E] truncate">
                  {userContact}
                </p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAvatarMenuOpen(false);
                    onOpenSettings?.();
                  }}
                  className="w-full px-3.5 py-2 text-left text-[#17271D] hover:bg-[#F4F6EF] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
                  <span>Profile & settings</span>
                </button>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAvatarMenuOpen(false);
                    onSignOut?.();
                  }}
                  className="w-full px-3.5 py-2 text-left text-[#C93B3B] hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-[#C93B3B]" strokeWidth={1.5} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

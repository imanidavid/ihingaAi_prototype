/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Check, Clock } from 'lucide-react';
import {
  NavView,
  WarningItem,
  CropAdvisory,
  UserProfileSettings,
  ReportItem,
  AppRole,
  ThresholdRuleItem,
  NotificationItem,
  GeneratedReport,
  UserAccount,
  AccessRequest,
  CoopGroup,
  CoopMessage,
} from './types';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { FloatingDeviceSwitcher, PreviewMode } from './components/FloatingDeviceSwitcher';
import { HeroBanner } from './components/HeroBanner';
import { KpiStrip } from './components/KpiStrip';
import { RainfallChartCard } from './components/RainfallChartCard';
import { RecentAlertsCard } from './components/RecentAlertsCard';
import { CropAdvisoriesSection } from './components/CropAdvisoriesSection';
import { RwandaRiskMapCard } from './components/RwandaRiskMapCard';
import { SeasonalCalendarCard } from './components/SeasonalCalendarCard';
import { DetailDrawer, DrawerContent } from './components/DetailDrawer';
import { ReportObservationModal } from './components/ReportObservationModal';
import { MobileFrame } from './components/MobileFrame';
import { RiskForecastView } from './components/RiskForecastView';
import { EarlyWarningsView } from './components/EarlyWarningsView';
import { OfficerWarningsView } from './components/OfficerWarningsView';
import { OfficerObservationsView } from './components/OfficerObservationsView';
import { CropCalendarView } from './components/CropCalendarView';
import { SettingsView } from './components/SettingsView';
import { RecommendationsView } from './components/RecommendationsView';
import { ObservationsView } from './components/ObservationsView';
import { OfficerDashboardView } from './components/OfficerDashboardView';
import { OfficerReportsView } from './components/OfficerReportsView';
import { CooperativeDashboardView } from './components/CooperativeDashboardView';
import { CooperativeMessagesView } from './components/CooperativeMessagesView';
import { MessageComposerModal } from './components/MessageComposerModal';
import { SignInView } from './components/SignInView';
import { PlaceholderView } from './components/PlaceholderView';
import { INITIAL_GENERATED_REPORTS } from './data/reportsModuleData';
import { INITIAL_USER_ACCOUNTS } from './data/rwandaAdminData';
import {
  INITIAL_USER_SETTINGS,
  userSettingsFromAccount,
  INITIAL_WARNINGS,
  INITIAL_THRESHOLD_RULES,
  INITIAL_52_REPORTS,
  computeSectorClimateRisk,
  isWarningRelevantToFarmer,
  COOPERATIVE_DATA,
  INITIAL_COOP_MESSAGES,
} from './data/musanzeData';

export default function App() {
  const [role, setRole] = useState<AppRole>('farmer');
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [drawerContent, setDrawerContent] = useState<DrawerContent>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasUnsavedSettings, setHasUnsavedSettings] = useState(false);

  // Authentication & session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>(INITIAL_GENERATED_REPORTS);

  // Shared cooperative broadcast messages store
  const [messages, setMessages] = useState<CoopMessage[]>(INITIAL_COOP_MESSAGES);
  const [isMessageComposerOpen, setIsMessageComposerOpen] = useState(false);
  const [messageComposerPrefill, setMessageComposerPrefill] = useState<{
    group?: string;
    en?: string;
    rw?: string;
  }>({});

  // Accounts & Access Requests in Shared Store
  const [accounts, setAccounts] = useState<UserAccount[]>(INITIAL_USER_ACCOUNTS);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);

  const handleAddNewAccount = (newAcc: UserAccount) => {
    setAccounts((prev) => [newAcc, ...prev.filter((a) => a.id !== newAcc.id)]);
  };

  const handleAddAccessRequest = (newAcc: UserAccount, newReq: AccessRequest) => {
    setAccounts((prev) => [newAcc, ...prev.filter((a) => a.id !== newAcc.id)]);
    setAccessRequests((prev) => [newReq, ...prev]);
  };

  // Inactivity timeout state (Officer 15 min, Farmer 60 min)
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(60);
  const lastActivityRef = useRef<number>(Date.now());

  const resetInactivityTimer = () => {
    lastActivityRef.current = Date.now();
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setIsTimeoutModalOpen(false);
    setDrawerContent(null);
    setIsReportModalOpen(false);
  };

  const handleSignInSuccess = (signedInRole: AppRole, userAccount?: UserAccount) => {
    setRole(signedInRole);
    setCurrentView('dashboard');
    setIsAuthenticated(true);
    if (signedInRole === 'officer' || signedInRole === 'cooperative') {
      setPreviewMode('desktop');
    }
    // If a farmer signed in:
    if (signedInRole === 'farmer' && userAccount) {
      setUserSettings((prev) => userSettingsFromAccount(userAccount, prev));
      // If a newly created farmer, start personal lists empty:
      if (userAccount.id !== 'acc-farmer-jb') {
        setSavedItemIds([]);
      }
    }
    resetInactivityTimer();
  };

  // Activity listeners to track idle duration
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleActivity = () => {
      if (!isTimeoutModalOpen) {
        lastActivityRef.current = Date.now();
      }
    };
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [isAuthenticated, isTimeoutModalOpen]);

  // Periodic check for session inactivity timeout
  useEffect(() => {
    if (!isAuthenticated || isTimeoutModalOpen) return;
    const interval = setInterval(() => {
      const idleTimeMs = Date.now() - lastActivityRef.current;
      // Inactivity timeout: officer 15 min (warn at 14 min), farmer 60 min (warn at 59 min)
      const warningThresholdMs =
        role === 'officer'
          ? (15 * 60 - 60) * 1000
          : (60 * 60 - 60) * 1000;
      if (idleTimeMs >= warningThresholdMs) {
        setIsTimeoutModalOpen(true);
        setTimeoutCountdown(60);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, role, isTimeoutModalOpen]);

  // Live 60s countdown timer when timeout modal is open
  useEffect(() => {
    if (!isTimeoutModalOpen) return;
    const timer = setInterval(() => {
      setTimeoutCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSignOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimeoutModalOpen]);

  const handleSimulateTimeout = () => {
    setIsTimeoutModalOpen(true);
    setTimeoutCountdown(60);
  };

  const handleStaySignedIn = () => {
    setIsTimeoutModalOpen(false);
    setTimeoutCountdown(60);
    resetInactivityTimer();
  };

  // =========================================================================
  // UNIFIED APPLICATION STORE (Each type of data appears exactly once)
  // =========================================================================
  // 1. WARNINGS: Single unified array for Musanze District (active + history)
  const [warnings, setWarnings] = useState<WarningItem[]>(INITIAL_WARNINGS);

  // 2. REPORTS: Single unified array for 52 field observations across Musanze
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_52_REPORTS);

  // 3. THRESHOLD RULES: Hazard detection rules
  const [thresholdRules, setThresholdRules] = useState<ThresholdRuleItem[]>(INITIAL_THRESHOLD_RULES);

  // 4. USER SETTINGS: Profile & notification preferences for Jean-Baptiste N.
  const [userSettings, setUserSettings] = useState<UserProfileSettings>(INITIAL_USER_SETTINGS);

  // 5. SAVED ITEMS: Bookmarked advisory/recommendation items
  const [savedItemIds, setSavedItemIds] = useState<string[]>(['plan-4']);

  // 6. READ NOTIFICATIONS: Notification IDs marked as read
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([
    'feedback-obs-3',
    'feedback-obs-5',
  ]);

  // =========================================================================
  // DERIVED VIEWS FOR FARMER AND OFFICER ROLES
  // =========================================================================
  // Farmer views = warnings filtered to Jean-Baptiste's area (Kinigi + crops he grows)
  const farmerWarnings = useMemo(
    () =>
      warnings.filter((w) =>
        isWarningRelevantToFarmer(w, userSettings.sector, userSettings.cropsGrown)
      ),
    [warnings, userSettings.sector, userSettings.cropsGrown]
  );
  const farmerActiveAlerts = useMemo(
    () => farmerWarnings.filter((w) => w.status === 'Active'),
    [farmerWarnings]
  );

  // Officer views = all warnings in Musanze
  const officerActiveWarnings = useMemo(
    () => warnings.filter((w) => w.status === 'Active'),
    [warnings]
  );
  const officerWarningHistory = useMemo(
    () => warnings.filter((w) => w.status === 'Expired'),
    [warnings]
  );

  // Farmer reports:
  // "My reports" = reports where farmer matches currently active farmer profile
  const farmerMyReports = useMemo(
    () =>
      reports.filter((r) =>
        r.farmer.toLowerCase().includes(userSettings.fullName.toLowerCase())
      ),
    [reports, userSettings.fullName]
  );

  // Dynamic counts computed directly from shared store
  const officerActiveCount = officerActiveWarnings.length;
  const farmerActiveCount = farmerActiveAlerts.length;
  const reportsToReviewCount = reports.filter((r) => r.status === 'Under review').length;

  // Compute climate risk for the farmer's sector from active weather warnings
  const kinigiClimateRisk = computeSectorClimateRisk(userSettings.sector || 'Kinigi', warnings);

  // =========================================================================
  // BELL & NOTIFICATIONS COMPUTATION
  // =========================================================================
  // Farmer notifications: active warnings covering Kinigi + officer feedback for Jean-Baptiste
  const farmerNotifications: NotificationItem[] = useMemo(() => {
    return [
      // 1. Active warnings covering Kinigi / farmer crops
      ...farmerActiveAlerts.map((a) => ({
        id: `warning-${a.id}`,
        type: 'warning' as const,
        title: a.title,
        subtitle: `${a.category || a.riskType || 'Weather'} · ${a.affectedArea} · ${a.timeframe}`,
        time: a.timestamp || a.issuedAt || '28/09 13:40',
        severity: a.severity,
        isRead: readNotificationIds.includes(`warning-${a.id}`),
        targetId: a.id,
        targetData: a,
      })),

      // 2. Officer feedback for Jean-Baptiste's reports
      ...farmerMyReports
        .filter((r) => r.officerFeedback && r.officerFeedback.message)
        .map((r) => {
          const notifId = `feedback-${r.id}`;
          const officerSig =
            r.officerFeedback?.officer ||
            r.officerFeedback?.officerName ||
            'Claudine M., Agricultural Officer · Musanze';
          return {
            id: notifId,
            type: 'feedback' as const,
            title: r.status === 'Verified' ? `Verified: ${r.title}` : `Feedback: ${r.title}`,
            subtitle: `${officerSig}: "${r.officerFeedback?.message}"`,
            time: r.timeline?.find((t) => t.step.includes('Verified'))?.time || r.date,
            isRead: readNotificationIds.includes(notifId),
            targetId: r.id,
            targetData: r,
          };
        }),

      // 3. Broadcast messages from Musanze Potato Growers Cooperative
      ...messages
        .filter(
          (m) =>
            m.groups.some((g) => g.toLowerCase().includes('all') || g.toLowerCase().includes('kinigi'))
        )
        .map((m) => {
          const notifId = `coop-msg-${m.id}`;
          return {
            id: notifId,
            type: 'message' as const,
            title: `Message from ${m.senderCoop || 'Musanze Potato Growers Cooperative'}`,
            subtitle: m.messageEn,
            time: m.sentAt || '28/09 14:00',
            isRead: readNotificationIds.includes(notifId),
            targetId: m.id,
            targetData: m,
          };
        }),
    ];
  }, [farmerActiveAlerts, farmerMyReports, messages, readNotificationIds]);

  // Officer notifications: reports awaiting review + active officer warnings
  const officerNotifications: NotificationItem[] = useMemo(() => {
    return [
      // 1. Reports awaiting review in Musanze
      ...reports
        .filter((r) => r.status === 'Under review')
        .map((r) => ({
          id: `review-${r.id}`,
          type: 'report_to_review' as const,
          title: `Report to review: ${r.title}`,
          subtitle: `${r.farmer} · ${r.sector}, ${r.cell} · ${r.type}`,
          time: r.date,
          isRead: readNotificationIds.includes(`review-${r.id}`),
          targetId: r.id,
          targetData: r,
        })),

      // 2. Active officer warnings in Musanze
      ...officerActiveWarnings.map((w) => ({
        id: `officer-warning-${w.id}`,
        type: 'warning' as const,
        title: w.title,
        subtitle: `${w.riskType} · ${w.affectedArea} · ${w.timeframe}`,
        time: w.issuedAt || '28/09 13:40',
        severity: w.severity,
        isRead: readNotificationIds.includes(`officer-warning-${w.id}`),
        targetId: w.id,
        targetData: w,
      })),
    ];
  }, [reports, officerActiveWarnings, readNotificationIds]);

  // Cooperative notifications: warnings covering coop sectors + broadcast messages sent
  const coopNotifications: NotificationItem[] = useMemo(() => {
    return [
      // 1. Active warnings covering coop sectors (Kinigi, Busogo, Muhoza)
      ...officerActiveWarnings
        .filter((w) =>
          ['Kinigi', 'Busogo', 'Muhoza'].some(
            (sec) => w.affectedArea.includes(sec) || w.affectedArea.includes('Musanze')
          )
        )
        .map((w) => ({
          id: `coop-warning-${w.id}`,
          type: 'warning' as const,
          title: w.title,
          subtitle: `${w.riskType} · ${w.affectedArea} · ${w.timeframe}`,
          time: w.issuedAt || '28/09 13:40',
          severity: w.severity,
          isRead: readNotificationIds.includes(`coop-warning-${w.id}`),
          targetId: w.id,
          targetData: w,
        })),

      // 2. Broadcast messages sent
      ...messages.map((m) => {
        const notifId = `coop-sent-${m.id}`;
        return {
          id: notifId,
          type: 'message' as const,
          title: `Broadcast to ${m.groups.join(', ')}`,
          subtitle: `Delivered to ${m.deliveredCount || m.recipientCount} members · ${m.channels.join(', ')}`,
          time: m.sentAt,
          isRead: readNotificationIds.includes(notifId),
          targetId: m.id,
          targetData: m,
        };
      }),
    ];
  }, [officerActiveWarnings, messages, readNotificationIds]);

  const currentRoleNotifications =
    role === 'officer'
      ? officerNotifications
      : role === 'cooperative'
      ? coopNotifications
      : farmerNotifications;

  // Unread badge count
  const unreadCount = currentRoleNotifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (item: NotificationItem) => {
    // Mark as read
    setReadNotificationIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));

    if (item.type === 'warning') {
      if (role === 'officer') {
        setCurrentView('warnings');
      } else {
        setDrawerContent({ type: 'alert', data: item.targetData });
      }
    } else if (item.type === 'feedback' || item.type === 'report_to_review') {
      setDrawerContent({ type: 'observation', data: item.targetData });
    } else if (item.type === 'message') {
      setDrawerContent({ type: 'coop_message', data: item.targetData });
    }
  };

  // Role switcher handler (demo shortcut: signs in as that demo account)
  const handleRoleChange = (newRole: AppRole) => {
    setRole(newRole);
    setCurrentView('dashboard');
    setIsAuthenticated(true);
    if (newRole === 'officer' || newRole === 'cooperative') {
      setPreviewMode('desktop');
    }
    resetInactivityTimer();
  };

  // Navigation handlers
  const handleSelectView = (view: NavView) => {
    setCurrentView(view);
  };

  // Quick actions from Hero Banner
  const handleViewForecast = () => {
    setCurrentView('forecast');
  };

  const handleGetRecommendations = () => {
    setCurrentView('recommendations');
  };

  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
  };

  // Drawer handlers
  const handleSelectAlert = (alert: WarningItem) => {
    setDrawerContent({ type: 'alert', data: alert });
    setReadNotificationIds((prev) =>
      prev.includes(`warning-${alert.id}`) ? prev : [...prev, `warning-${alert.id}`]
    );
  };

  const handleSelectAdvisory = (advisory: CropAdvisory) => {
    setDrawerContent({ type: 'advisory', data: advisory });
  };

  const handleSelectObservation = (report: ReportItem) => {
    setDrawerContent({ type: 'observation', data: report });
    setReadNotificationIds((prev) =>
      prev.includes(`feedback-${report.id}`) ? prev : [...prev, `feedback-${report.id}`]
    );
  };

  const handleCloseDrawer = () => {
    setDrawerContent(null);
  };

  // =========================================================================
  // REPORT MUTATION HANDLERS (Change the one record; both roles update)
  // =========================================================================
  const handleSubmitObservation = (report: ReportItem) => {
    setReports((prev) => [report, ...prev]);
    setToastMessage('Observation sent');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRetrySendObservation = (id: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated: ReportItem = {
          ...r,
          status: 'Under review' as const,
          statusCaption: 'Received by officer · Under review',
          timeline: [
            { step: 'Saved on your phone · 28/09 13:40', time: '28/09 13:40', status: 'completed' as const },
            { step: 'Sent', time: '28/09 13:42', status: 'completed' as const },
            { step: 'Received by officer', time: '28/09 13:42', status: 'current' as const },
            { step: 'Verified', status: 'upcoming' as const },
          ],
        };
        return updated;
      })
    );

    setDrawerContent((prev) => {
      if (prev && prev.type === 'observation' && prev.data.id === id) {
        return {
          type: 'observation',
          data: {
            ...prev.data,
            status: 'Under review',
            statusCaption: 'Received by officer · Under review',
            timeline: [
              { step: 'Saved on your phone · 28/09 13:40', time: '28/09 13:40', status: 'completed' },
              { step: 'Sent', time: '28/09 13:42', status: 'completed' },
              { step: 'Received by officer', time: '28/09 13:42', status: 'current' },
              { step: 'Verified', status: 'upcoming' },
            ],
          },
        };
      }
      return prev;
    });

    setToastMessage('Observation sent');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOfficerVerifyReport = (
    reportId: string,
    feedbackMessage?: string,
    _useForForecast: boolean = true
  ) => {
    const feedbackText =
      feedbackMessage || 'Confirmed. Field report verified against Bisoke weather telemetry.';
    const officerSignature = 'Claudine M., Agricultural Officer · Musanze';

    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        return {
          ...r,
          status: 'Verified' as const,
          statusCaption: `Verified by ${officerSignature}`,
          officerFeedback: {
            message: feedbackText,
            officer: officerSignature,
            officerName: officerSignature,
          },
          timeline: [
            { step: `Submitted by ${r.farmer}`, time: r.date, status: 'completed' as const },
            { step: 'Received by officer', time: r.date, status: 'completed' as const },
            {
              step: 'Verified by Claudine M.',
              status: 'completed' as const,
              time: '28/09 14:02',
            },
          ],
        };
      })
    );

    setDrawerContent((prev) => {
      if (prev && prev.type === 'observation' && prev.data.id === reportId) {
        return {
          type: 'observation',
          data: {
            ...prev.data,
            status: 'Verified',
            statusCaption: `Verified by ${officerSignature}`,
            officerFeedback: {
              message: feedbackText,
              officer: officerSignature,
              officerName: officerSignature,
            },
            timeline: [
              { step: `Submitted by ${prev.data.farmer}`, time: prev.data.date, status: 'completed' },
              { step: 'Received by officer', time: prev.data.date, status: 'completed' },
              {
                step: 'Verified by Claudine M.',
                status: 'completed',
                time: '28/09 14:02',
              },
            ],
          },
        };
      }
      return prev;
    });

    setToastMessage('Report verified · Farmer notified');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOfficerAskMoreInfo = (reportId: string, feedbackMessage: string) => {
    const officerSignature = 'Claudine M., Agricultural Officer · Musanze';

    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        return {
          ...r,
          status: 'Needs more info' as const,
          statusCaption: `Claudine M. requested details: ${feedbackMessage}`,
          officerFeedback: {
            message: feedbackMessage,
            officer: officerSignature,
            officerName: officerSignature,
            hasAddPhotoButton: true,
          },
          timeline: [
            { step: `Submitted by ${r.farmer}`, time: r.date, status: 'completed' as const },
            { step: 'Received by officer', time: r.date, status: 'completed' as const },
            { step: 'Needs more info', time: '28/09 14:02', status: 'current' as const },
          ],
        };
      })
    );

    setDrawerContent((prev) => {
      if (prev && prev.type === 'observation' && prev.data.id === reportId) {
        return {
          type: 'observation',
          data: {
            ...prev.data,
            status: 'Needs more info',
            statusCaption: `Claudine M. requested details: ${feedbackMessage}`,
            officerFeedback: {
              message: feedbackMessage,
              officer: officerSignature,
              officerName: officerSignature,
              hasAddPhotoButton: true,
            },
            timeline: [
              { step: `Submitted by ${prev.data.farmer}`, time: prev.data.date, status: 'completed' },
              { step: 'Received by officer', time: prev.data.date, status: 'completed' },
              { step: 'Needs more info', time: '28/09 14:02', status: 'current' },
            ],
          },
        };
      }
      return prev;
    });

    setToastMessage('Requested more info from farmer');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOfficerRejectReport = (reportId: string, reason: string) => {
    const officerSignature = 'Claudine M., Agricultural Officer · Musanze';

    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        return {
          ...r,
          status: 'Rejected' as const,
          statusCaption: `Report closed: ${reason}`,
          officerFeedback: {
            message: reason,
            officer: officerSignature,
            officerName: officerSignature,
          },
          timeline: [
            { step: `Submitted by ${r.farmer}`, time: r.date, status: 'completed' as const },
            { step: 'Received by officer', time: r.date, status: 'completed' as const },
            { step: 'Rejected', time: '28/09 14:02', status: 'completed' as const },
          ],
        };
      })
    );

    setDrawerContent((prev) => {
      if (prev && prev.type === 'observation' && prev.data.id === reportId) {
        return {
          type: 'observation',
          data: {
            ...prev.data,
            status: 'Rejected',
            statusCaption: `Report closed: ${reason}`,
            officerFeedback: {
              message: reason,
              officer: officerSignature,
              officerName: officerSignature,
            },
            timeline: [
              { step: `Submitted by ${prev.data.farmer}`, time: prev.data.date, status: 'completed' },
              { step: 'Received by officer', time: prev.data.date, status: 'completed' },
              { step: 'Rejected', time: '28/09 14:02', status: 'completed' },
            ],
          },
        };
      }
      return prev;
    });

    setToastMessage('Report rejected');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSettings = (newSettings: UserProfileSettings) => {
    setUserSettings(newSettings);
    setHasUnsavedSettings(false);
  };

  const handleToggleSaveItem = (id: string) => {
    setSavedItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // =========================================================================
  // WARNING MUTATION HANDLERS
  // =========================================================================
  const handleIssueWarning = (newWarning: WarningItem) => {
    const categoryLabel =
      newWarning.riskType === 'Weather · Excess rain' || newWarning.riskType === 'Excess rain'
        ? 'Weather · Excess rain'
        : newWarning.riskType === 'Weather · Dry spell' || newWarning.riskType === 'Dry spell'
        ? 'Weather · Dry spell'
        : newWarning.riskType === 'Weather · Temperature' || newWarning.riskType === 'Temperature'
        ? 'Weather · Temperature'
        : newWarning.riskType === 'Pest'
        ? 'Pest'
        : 'Crop disease';

    const warningToStore: WarningItem = {
      ...newWarning,
      status: 'Active',
      level: newWarning.severity,
      category: categoryLabel,
    };
    setWarnings((prev) => [warningToStore, ...prev]);
  };

  const handleEndWarning = (warningId: string) => {
    setWarnings((prev) =>
      prev.map((w) =>
        w.id === warningId
          ? {
              ...w,
              status: 'Expired' as const,
              endedDate: '28/09',
            }
          : w
      )
    );
  };

  const handleUpdateWarning = (updatedWarning: WarningItem) => {
    setWarnings((prev) =>
      prev.map((w) => (w.id === updatedWarning.id ? { ...w, ...updatedWarning } : w))
    );
  };

  const handleSaveRules = (updatedRules: ThresholdRuleItem[]) => {
    setThresholdRules(updatedRules);
  };

  const handleResetDemo = () => {
    setWarnings(INITIAL_WARNINGS);
    setReports(INITIAL_52_REPORTS);
    setThresholdRules(INITIAL_THRESHOLD_RULES);
    setUserSettings(INITIAL_USER_SETTINGS);
    setAccounts(INITIAL_USER_ACCOUNTS);
    setAccessRequests([]);
    setGeneratedReports(INITIAL_GENERATED_REPORTS);
    setMessages(INITIAL_COOP_MESSAGES);
    setSavedItemIds(['plan-4']);
    setReadNotificationIds(['feedback-obs-3', 'feedback-obs-5']);
    setDrawerContent(null);
    setIsTimeoutModalOpen(false);
    setToastMessage('Demo state reset to initial data');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // If not signed in, show split-screen Sign In View
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F6EF] relative">
        <SignInView
          onSignInSuccess={handleSignInSuccess}
          accounts={accounts}
          accessRequests={accessRequests}
          onAddNewAccount={handleAddNewAccount}
          onAddAccessRequest={handleAddAccessRequest}
        />

        {/* Floating Device Switcher stays as demo shortcut: it signs in as that demo account */}
        <FloatingDeviceSwitcher
          role={role}
          onRoleChange={handleRoleChange}
          previewMode={previewMode}
          onPreviewModeChange={setPreviewMode}
          hasUnsavedBar={false}
          onResetDemo={handleResetDemo}
          onSimulateTimeout={() => {
            setIsAuthenticated(true);
            setIsTimeoutModalOpen(true);
            setTimeoutCountdown(60);
          }}
        />

        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-[#1F4A34] text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-[#E4ECDB]" strokeWidth={2} />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6EF] text-[#17271D] flex relative">
      {/* Sidebar - Desktop Layout Shell (220px) */}
      {previewMode === 'desktop' && (
        <Sidebar
          currentView={currentView}
          onSelectView={handleSelectView}
          onOpenReportModal={handleOpenReportModal}
          role={role}
          reportsToReviewCount={reportsToReviewCount}
        />
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar
          onOpenAlertsList={() => {
            if (role === 'officer') {
              setCurrentView('warnings');
            } else {
              handleSelectAlert(farmerActiveAlerts[0] || farmerWarnings[0] || warnings[0]);
            }
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSettings={() => setCurrentView('settings')}
          onSignOut={handleSignOut}
          onSelectAlert={handleSelectAlert}
          onSelectAdvisory={handleSelectAdvisory}
          onNavigateView={(view) => {
            setCurrentView(view);
            if (previewMode !== 'desktop') {
              setPreviewMode('desktop');
            }
          }}
          role={role}
          bellCount={unreadCount}
          notifications={currentRoleNotifications}
          onNotificationClick={handleNotificationClick}
          warnings={role === 'officer' ? warnings : farmerWarnings}
        />

        {/* View Switcher: Mobile Frames vs Desktop Layout */}
        {previewMode === 'mobile_m1' || previewMode === 'mobile_m2' ? (
          <main className="flex-1 p-4 md:p-8 flex items-center justify-center pb-32">
            <MobileFrame
              alerts={farmerWarnings}
              initialSubView={previewMode === 'mobile_m1' ? 'm1' : 'm2'}
              onSubmitObservation={handleSubmitObservation}
              notifications={currentRoleNotifications}
              onNotificationClick={handleNotificationClick}
              onOpenAlertDetail={handleSelectAlert}
            />
          </main>
        ) : (
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1240px] w-full mx-auto space-y-6 pb-32">
            {/* View routing */}
            {currentView === 'dashboard' &&
              (role === 'officer' ? (
                <OfficerDashboardView
                  activeWarningsCount={officerActiveCount}
                  activeWarnings={officerActiveWarnings}
                  reportsToReviewCount={reportsToReviewCount}
                  reports={reports}
                  onNavigateView={setCurrentView}
                  onShowToast={(msg) => {
                    setToastMessage(msg);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                />
              ) : role === 'cooperative' ? (
                <CooperativeDashboardView
                  onOpenMessageComposer={(prefillGroup, prefillEn, prefillRw) => {
                    setMessageComposerPrefill({ group: prefillGroup, en: prefillEn, rw: prefillRw });
                    setIsMessageComposerOpen(true);
                  }}
                  onSelectGroup={(group) => {
                    setDrawerContent({ type: 'coop_group', data: group });
                  }}
                  onSelectMessage={(msg) => {
                    setDrawerContent({ type: 'coop_message', data: msg });
                  }}
                  onShowToast={(msg) => {
                    setToastMessage(msg);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  messages={messages}
                  warnings={warnings}
                />
              ) : (
                <div className="space-y-6">
                  {/* Band 1 — Hero Banner */}
                  <HeroBanner
                    riskLevel={kinigiClimateRisk}
                    onViewForecast={handleViewForecast}
                    onGetRecommendations={handleGetRecommendations}
                    onReportObservation={handleOpenReportModal}
                  />

                  {/* Band 2 — 4 KPI Cards with dynamic active count */}
                  <KpiStrip
                    activeWarningsCount={farmerActiveCount}
                    riskLevel={kinigiClimateRisk}
                    onSelectWarningKpi={() => setCurrentView('warnings')}
                    onSelectRiskKpi={() => setCurrentView('forecast')}
                  />

                  {/* Band 3 — 2/3 Rainfall Chart + 1/3 Recent Alerts List */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-8">
                      <RainfallChartCard />
                    </div>
                    <div className="lg:col-span-4">
                      <RecentAlertsCard
                        alerts={farmerActiveAlerts}
                        onSelectAlert={handleSelectAlert}
                        onViewAll={() => setCurrentView('warnings')}
                      />
                    </div>
                  </div>

                  {/* Band 4 — Crop Advisories (3 Photo Cards) */}
                  <CropAdvisoriesSection
                    onSelectAdvisory={handleSelectAdvisory}
                    onViewAll={() => setCurrentView('recommendations')}
                  />

                  {/* Band 5 — 2/3 Rwanda Risk Map (All 30 Districts) + 1/3 Seasonal Calendar Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-8">
                      <RwandaRiskMapCard
                        onViewFullMap={() => setCurrentView('forecast')}
                        musanzeRiskLevel={
                          computeSectorClimateRisk('Muhoza', officerActiveWarnings) === 'High'
                            ? 'High'
                            : kinigiClimateRisk
                        }
                      />
                    </div>
                    <div className="lg:col-span-4">
                      <SeasonalCalendarCard
                        onViewFullCalendar={() => setCurrentView('calendar')}
                      />
                    </div>
                  </div>
                </div>
              ))}

            {currentView === 'forecast' && (
              <RiskForecastView
                role={role}
                onSelectAdvisory={handleSelectAdvisory}
                hideUserSectorChip={role === 'officer' || role === 'cooperative'}
                onOpenWarning={() => setCurrentView('warnings')}
                activeWarnings={officerActiveWarnings}
              />
            )}

            {currentView === 'warnings' &&
              (role === 'officer' ? (
                <OfficerWarningsView
                  activeWarnings={officerActiveWarnings}
                  warningHistory={officerWarningHistory}
                  thresholdRules={thresholdRules}
                  onIssueWarning={handleIssueWarning}
                  onEndWarning={handleEndWarning}
                  onUpdateWarning={handleUpdateWarning}
                  onSaveRules={handleSaveRules}
                  onShowToast={(msg) => {
                    setToastMessage(msg);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                />
              ) : (
                <EarlyWarningsView alerts={farmerWarnings} onSelectAlert={handleSelectAlert} />
              ))}

            {currentView === 'members' && (
              <PlaceholderView
                viewId="members"
                title="Members & groups"
                onBackToDashboard={() => setCurrentView('dashboard')}
              />
            )}

            {currentView === 'messages' && (
              <CooperativeMessagesView
                messages={messages}
                onOpenMessageComposer={() => {
                  setMessageComposerPrefill({ group: 'All groups' });
                  setIsMessageComposerOpen(true);
                }}
                onSelectMessage={(msg) => {
                  setDrawerContent({ type: 'coop_message', data: msg });
                }}
              />
            )}

            {currentView === 'meetings' && (
              <PlaceholderView
                viewId="meetings"
                title="Meetings"
                onBackToDashboard={() => setCurrentView('dashboard')}
              />
            )}

            {currentView === 'training' && (
              <PlaceholderView
                viewId="training"
                title="Training"
                onBackToDashboard={() => setCurrentView('dashboard')}
              />
            )}

            {currentView === 'calendar' && <CropCalendarView />}

            {currentView === 'recommendations' && (
              <RecommendationsView
                settings={userSettings}
                onOpenSettingsNotifications={() => setCurrentView('settings')}
                onSelectAdvisory={handleSelectAdvisory}
                savedItemIds={savedItemIds}
                onToggleSaveItem={handleToggleSaveItem}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                role={role}
                settings={userSettings}
                onSaveSettings={handleSaveSettings}
                onUnsavedStateChange={setHasUnsavedSettings}
              />
            )}

            {currentView === 'observations' &&
              (role === 'officer' ? (
                <OfficerObservationsView
                  reports={reports}
                  onVerifyReport={handleOfficerVerifyReport}
                  onAskMoreInfo={handleOfficerAskMoreInfo}
                  onRejectReport={handleOfficerRejectReport}
                  onShowToast={(msg) => {
                    setToastMessage(msg);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                />
              ) : (
                <ObservationsView
                  reports={reports}
                  onOpenReportModal={handleOpenReportModal}
                  onSelectObservation={handleSelectObservation}
                  onRetrySend={handleRetrySendObservation}
                />
              ))}

            {currentView === 'reports' && (
              <OfficerReportsView
                warnings={warnings}
                reports={reports}
                reportsList={generatedReports}
                onReportsListChange={setGeneratedReports}
                onShowToast={(msg) => {
                  setToastMessage(msg);
                  setTimeout(() => setToastMessage(null), 3000);
                }}
              />
            )}
          </main>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1F4A34] text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#E4ECDB]" strokeWidth={2} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Device Switcher with Segmented Role Switcher [Farmer] [Cooperative] [Officer], [Reset demo], and [Simulate timeout] */}
      <FloatingDeviceSwitcher
        role={role}
        onRoleChange={handleRoleChange}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
        hasUnsavedBar={hasUnsavedSettings && currentView === 'settings'}
        onResetDemo={handleResetDemo}
        onSimulateTimeout={handleSimulateTimeout}
      />

      {/* Slide-over Drawer for Alerts, Crop Advisories, Observations, Coop Groups, and Messages */}
      <DetailDrawer
        content={drawerContent}
        onClose={handleCloseDrawer}
        savedItemIds={savedItemIds}
        onToggleSave={handleToggleSaveItem}
        onRetrySendObservation={handleRetrySendObservation}
        onRemindGroup={(group) => {
          setMessageComposerPrefill({
            group: group.name,
            en: `Advisory reminder for ${group.name}: Please acknowledge active hazard warnings and follow blight prevention steps.`,
            rw: `Kwibutsa abahinzi bo muri ${group.name}: Mukore kwemeza imburagihe z'akaga kandi mukurikize amabwiriza yo kwirinda imvura n'imvura y'umurengera.`,
          });
          setIsMessageComposerOpen(true);
        }}
      />

      {/* Message Composer Modal for Cooperative Member Broadcasts */}
      <MessageComposerModal
        isOpen={isMessageComposerOpen}
        onClose={() => setIsMessageComposerOpen(false)}
        onSendMessage={(newMsg) => {
          setMessages((prev) => [newMsg, ...prev]);
          const split = newMsg.channelSplit || { sms: 67, voice: 6, inApp: 9 };
          setToastMessage(
            `Sent to ${newMsg.recipientCount} members (SMS ${split.sms} · Voice ${split.voice} · In-app ${split.inApp})`
          );
          setTimeout(() => setToastMessage(null), 4000);
        }}
        prefillTargetGroup={messageComposerPrefill.group}
        prefillEn={messageComposerPrefill.en}
        prefillRw={messageComposerPrefill.rw}
      />

      {/* Report Observation Modal */}
      <ReportObservationModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitSuccess={handleSubmitObservation}
      />

      {/* Inactivity Timeout Modal (Officer 15 min, Farmer 60 min, or Simulated) */}
      {isTimeoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FBFCF8] rounded-[20px] max-w-[420px] w-full p-6 sm:p-7 border border-[rgba(31,74,52,0.15)] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E4ECDB] flex items-center justify-center text-[#1F4A34] flex-shrink-0">
                <Clock className="w-5 h-5 text-[#1F4A34]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#17271D] leading-tight">
                  You'll be signed out in {timeoutCountdown} seconds
                </h3>
                <p className="text-[12px] text-[#5B665E] mt-0.5">
                  Due to inactivity, your secure session will expire soon.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.08)] flex items-center justify-between text-[12px]">
              <span className="text-[#5B665E]">Current account</span>
              <span className="font-semibold text-[#17271D]">
                {role === 'officer'
                  ? 'Claudine Mukamana · Agricultural Officer'
                  : role === 'cooperative'
                  ? 'Aline Uwimana · Cooperative Leader'
                  : 'Jean-Baptiste Ndayisaba · Farmer'}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2 rounded-full border border-[rgba(31,74,52,0.20)] text-[#5B665E] hover:text-[#17271D] hover:bg-[#F4F6EF] text-[12.5px] font-medium transition-colors cursor-pointer"
              >
                Sign out
              </button>
              <button
                type="button"
                onClick={handleStaySignedIn}
                className="px-5 py-2 rounded-full bg-[#1F4A34] text-white hover:bg-[#2C6343] text-[12.5px] font-semibold transition-all shadow-xs cursor-pointer active:scale-98"
              >
                Stay signed in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

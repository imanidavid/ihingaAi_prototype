export type NavView =
  | 'dashboard'
  | 'users'
  | 'security'
  | 'data_sources'
  | 'processing'
  | 'notifications'
  | 'model_performance'
  | 'field_data'
  | 'forecast'
  | 'warnings'
  | 'recommendations'
  | 'calendar'
  | 'observations'
  | 'reports'
  | 'settings'
  | 'members'
  | 'messages'
  | 'meetings'
  | 'training';

/**
 * The one set of role names, used by the app shell, accounts, sign-up and access requests.
 * ('cooperative' = cooperative leader.)
 */
export type AppRole = 'farmer' | 'officer' | 'cooperative' | 'researcher' | 'admin';

export type RiskLevel = 'Low' | 'Watch' | 'High' | 'Critical';

export interface OfficerProfile {
  initials: string;
  fullName: string;
  roleTitle: string;
  district: string;
  bellCount: number;
}

export interface SectorWarningItem {
  title: string;
  level: RiskLevel;
}

export interface SectorAcknowledgedItem {
  label: string;
  level: RiskLevel;
  dotColor: string;
}

export interface SectorOverviewItem {
  id: string;
  name: string;
  risk: RiskLevel;
  activeWarningsCount: number;
  farmersCount: number;
  reports7Days: number;
  acknowledgedItems: SectorAcknowledgedItem[];
  warnings: SectorWarningItem[];
  recentReports: {
    id: string;
    title: string;
    farmer: string;
    cell: string;
    time: string;
    type: 'Rainfall' | 'Flood / damage' | 'Crop condition' | 'Pest / disease';
  }[];
}

export interface ChannelDelivery {
  channel: 'SMS' | 'Voice' | 'In-app';
  sent: number;
  delivered: number;
  failed: number;
}

export interface SectorDeliveryBreakdown {
  sector: string;
  acknowledgedCount: number;
  totalCount: number;
  percentage: number;
}

export interface WarningItem {
  id: string;
  title: string;
  severity: RiskLevel;
  level?: RiskLevel;
  category?: string;
  riskType?: string;
  status: 'Active' | 'Expired';
  timestamp?: string;
  affectedArea: string;
  area?: string;
  sectors: string[];
  crops?: string[];
  timeframe: string;
  sourceRule?: string;
  recommendedActions: string[];
  channels?: ChannelDelivery[];
  sectorBreakdown?: SectorDeliveryBreakdown[];
  totalSent?: number;
  totalDelivered?: number;
  totalAcknowledged?: number;
  unacknowledgedCount?: number;
  acknowledgedPct?: number;
  issuedAt?: string;
  issuedDate?: string;
  endedDate?: string;
  farmersReached?: number;
  confirmedByReports?: boolean;
  messageEn?: string;
  messageRw?: string;
}

export type OfficerActiveWarning = WarningItem;
export type WarningHistoryItem = WarningItem;
export type AlertItem = WarningItem;

export interface ThresholdRuleItem {
  id: string;
  name: string;
  hazardType: string;
  isEnabled: boolean;
  description: string;
  lastTriggered: string;
  thresholdsList: {
    label: string;
    level: RiskLevel;
  }[];
}

export interface OfficerCropRiskDetail {
  crop: string;
  risk: RiskLevel;
  hazard: string;
  affectedSectors: string;
  growersCount: number;
  linkedWarningTitle: string;
  linkedWarningAckPct: number;
  warningId?: string;
}

export interface OfficerWarningDelivery {
  id: string;
  title: string;
  level: RiskLevel;
  area: string;
  sent: number;
  delivered: number;
  acknowledged: number;
  acknowledgedPct: number;
  unacknowledgedCount: number;
}

export interface OfficerReviewReport {
  id: string;
  title: string;
  farmer: string;
  sector: string;
  cell: string;
  time: string;
  type: 'Rainfall' | 'Flood / damage' | 'Crop condition' | 'Pest / disease';
  description?: string;
}

export interface OfficerAttentionItem {
  id: string;
  title: string;
  actionText: string;
  actionType: 'voice_call' | 'review_report';
  toastMessage?: string;
}

export interface OfficerData {
  profile: OfficerProfile;
  districtRiskLevel: RiskLevel;
  activeWarningsCount: number;
  affectedSectorsCount: number;
  totalRegisteredFarmers: number;
  affectedFarmersTotal: number;
  reportsToReviewCount: number;
  districtFieldReports7Days: number;
  heroBadge: string;
  heroHeading: string;
  heroPhoto: string;
  sectorOverviews: SectorOverviewItem[];
  needsAttention: OfficerAttentionItem[];
  warningDeliveries: OfficerWarningDelivery[];
  reportsWaitingForReview: OfficerReviewReport[];
}

export interface DistrictData {
  id: string;
  name: string;
  province: string;
  risk: RiskLevel;
  temp: string;
  humidity: string;
  rainfall24h: number;
  soilSaturation: number;
  totalSectors: number;
  affectedSectorsCount: number;
  affectedSectorsList: string[];
  isUserDistrict: boolean;
  svgPath: string;
  labelCoord: { x: number; y: number };
}

export interface WeatherForecastDay {
  day: string;
  fullDate: string;
  rainfallMm: number;
  isPeak?: boolean;
  temp: number;
  humidity: number;
}

export interface CropAdvisory {
  id: string;
  crop: string;
  category: string;
  badgeLabel: string;
  title: string;
  oneLineAdvice: string;
  image: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  windowStatusText: string;
  progressPercent: number;
  progressLabel?: string;
  whyAdvice: string;
  location: string;
  timing: string;
  riskSummary: string;
  mitigationSteps: string[];
}

export interface PlanAheadItem {
  id: string;
  category: string;
  title: string;
  oneLineRationale: string;
  timingChip: string;
  cropTag: 'All crops' | 'Irish Potato' | 'Climbing Beans' | 'Maize';
  iconType: 'shield' | 'sprout' | 'calendar' | 'tag' | 'wheat';
  advisoryEquivalent: CropAdvisory;
}

export type ObservationStatus =
  | 'Waiting to send'
  | 'Not sent'
  | 'Under review'
  | 'Verified'
  | 'Needs more info'
  | 'Submitted'
  | 'Rejected';

export interface ObservationTimelineStep {
  step: string;
  time?: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface ReportItem {
  id: string;
  title: string;
  farmer: string;
  sector: string;
  cell: string;
  location?: string;
  type: 'Rainfall' | 'Flood / damage' | 'Crop condition' | 'Pest / disease';
  date: string;
  status: ObservationStatus;
  statusCaption?: string;
  description: string;
  photoUrl?: string;
  forecastCheck?: string;
  isConsistent?: boolean;
  officerFeedbackMessage?: string;
  officerFeedback?: {
    message: string;
    officer?: string;
    officerName?: string;
    hasAddPhotoButton?: boolean;
  };
  timeline?: ObservationTimelineStep[];
}

export type ObservationItem = ReportItem;
export type DistrictFieldReportItem = ReportItem;
export type ObservationOfficerFeedback = NonNullable<ReportItem['officerFeedback']>;

export interface ObservationReport {
  id: string;
  reportType: 'rainfall' | 'crop condition' | 'pest' | 'damage';
  district: string;
  sector: string;
  date: string;
  photoUrl?: string;
  description: string;
  createdAt: string;
}

export interface UserProfileSettings {
  fullName: string;
  phone: string;
  email: string;
  preferredLanguage: 'Kinyarwanda' | 'English';
  district: string;
  sector: string;
  cell: string;
  farmSizeHa: number;
  cropsGrown: string[];
  cooperative: string;
  alertChannel: 'SMS' | 'Voice call' | 'In-app only';
  isSmsStopped: boolean;
  notifyEarlyWarnings: boolean;
  notifyCropAdvisories: boolean;
  notifyCalendarReminders: boolean;
  notifyCoopMessages: boolean;
  messageLanguage: 'Kinyarwanda' | 'English';
}

export interface NotificationItem {
  id: string;
  type: 'warning' | 'feedback' | 'report_to_review' | 'message' | 'meeting' | 'access_request';
  title: string;
  subtitle: string;
  time: string;
  severity?: RiskLevel;
  isRead: boolean;
  targetId?: string;
  data?: any;
  targetData?: any;
}

export type CoopMemberRole = 'Leader' | 'Secretary' | 'Treasurer' | 'Group lead' | 'Member';

/** One cooperative member. `acknowledged` is keyed by warning id (missing = not acknowledged). */
export interface CoopMember {
  id: string;
  fullName: string;
  groupId: string;
  /** Sector where the member farms (field reports are matched on name + sector). */
  sector: string;
  cell: string;
  phone: string;
  role: CoopMemberRole;
  crops: string[];
  acknowledged: Record<string, boolean>;
  /** DD/MM/YYYY */
  lastActive: string;
  /**
   * First of the last four weeks (1 = oldest) from which the member has been active every week;
   * null = not active in the last 30 days.
   */
  activeFromWeek: 1 | 2 | 3 | 4 | null;
  isDemo?: boolean;
}

/** A registered Musanze farmer who is not (yet) a member — the "Add member" search pool. */
export interface RegisteredFarmer {
  id: string;
  fullName: string;
  sector: string;
  cell: string;
  phone: string;
  crops: string[];
}

export interface CoopEquipment {
  id: string;
  name: string;
  kind: string;
}

export interface TrainingMaterial {
  id: string;
  title: string;
  format: 'Audio' | 'Video' | 'Guide';
  language: 'Kinyarwanda' | 'English';
  length: string;
  summary: string;
  /** Planned file path from docs/media-manifest.md; the UI shows an icon fallback until it exists. */
  thumbnail: string;
  shareMessageEn: string;
  shareMessageRw: string;
}

export interface CoopDirectoryEntry {
  id: string;
  name: string;
  sectors: string;
  mainCrops: string;
  /** null = our own cooperative; its member count is computed from the store. */
  members: number | null;
}

/** A dated item on the cooperative calendar that is not a meeting or booking (from the crop calendar). */
export interface CropWindow {
  id: string;
  title: string;
  /** DD/MM/YYYY */
  date: string;
  /** HH:MM */
  time: string;
  note: string;
}

/** A group record in the store. Members, warnings and counts are computed, never stored here. */
export interface CoopGroupRecord {
  id: string;
  name: string;
  sector: string;
  /** Member field reports earlier this season that are not in the 7-day reports store. */
  reportsEarlierThisSeason: number;
  isDemo?: boolean;
}

/** A cooperative group as shown in the UI — computed by computeCoopGroups(). */
export interface CoopGroup {
  id: string;
  name: string;
  sector: string;
  membersCount: number;
  leadName: string | null;
  /** "Name (Cell)" of every member, officers of the group first. */
  memberNames: string[];
  warnings: {
    id: string;
    title: string;
    level: RiskLevel;
  }[];
  acknowledgement: {
    warningId: string;
    warningTitle: string;
    level: RiskLevel;
    dotColor: string;
    acknowledgedCount: number;
    totalCount: number;
    pct: number;
  }[];
  /** Member field reports in the reports store (same records the officer sees). */
  memberReports: ReportItem[];
  reports7Days: number;
  reportsThisSeason: number;
  /** Latest active warning covering the group; "not acknowledged" refers to it. */
  unacknowledgedWarningTitle: string | null;
  unacknowledgedCount: number;
  /** "Name (Cell)" of every member who has not acknowledged the latest warning. */
  unacknowledgedMembers: string[];
}

/** 'all' = every member of the cooperative. */
export type CoopAudience = 'all' | string[];

export interface CoopMeeting {
  id: string;
  title: string;
  /** DD/MM/YYYY */
  date: string;
  /** HH:MM */
  time: string;
  place: string;
  audience: CoopAudience;
  smsInvite: boolean;
  isDemo?: boolean;
}

export interface EquipmentBooking {
  id: string;
  equipmentId: string;
  /** DD/MM/YYYY */
  date: string;
  slot: string;
  bookedFor: { type: 'group' | 'member'; id: string };
  isDemo?: boolean;
}

export interface CoopMessage {
  id: string;
  senderName: string;
  senderCoop: string;
  groups: string[];
  recipientCount: number;
  channelSplit: {
    sms: number;
    voice: number;
    inApp: number;
  };
  messageEn: string;
  messageRw: string;
  sentAt: string;
  channels: ('SMS' | 'Voice' | 'In-app')[];
  deliveredCount: number;
  /** Direct message to specific members (member ids); groups then holds their names. */
  recipientMemberIds?: string[];
  isDemo?: boolean;
}

export interface CoopData {
  cooperativeName: string;
  leader: {
    name: string;
    roleTitle: string;
    phone: string;
    initials: string;
  };
  actions: {
    id: string;
    description: string;
    buttonLabel: string;
    targetGroup: string;
    prefillMessageEn?: string;
    prefillMessageRw?: string;
  }[];
}

export type GeneratedReportType =
  | 'District risk summary'
  | 'Seasonal forecast'
  | 'Warning effectiveness'
  | 'Farmer engagement'
  | 'Situation report'
  // Research report types (researcher role)
  | 'Model validation'
  | 'Field data summary';

export type GeneratedReportStatus = 'Draft' | 'Final' | 'Sent';

export interface ReportSectionConfig {
  executiveSummary: boolean;
  riskBySector: boolean;
  warnings: boolean;
  fieldReports: boolean;
  cropLossEstimate: boolean;
  engagement: boolean;
}

export interface GeneratedReport {
  id: string;
  title: string;
  type: GeneratedReportType;
  period: string;
  createdBy: string;
  date: string;
  status: GeneratedReportStatus;
  sectors: string[];
  sections: ReportSectionConfig;
}

export interface ScheduledReportItem {
  id: string;
  title: string;
  type: GeneratedReportType;
  frequency: string;
  format: 'PDF' | 'Excel' | 'PDF + Excel';
  recipients: { name: string; email: string }[];
  enabled: boolean;
}

// =========================================================================
// AUTHENTICATION & ACCESS REQUEST TYPES (Module 1, Parts 1 & 2)
// =========================================================================
export type SignUpRole = Exclude<AppRole, 'admin'>;

/** Roles that need an administrator's approval before they can sign in. */
export type ApprovalRole = 'cooperative' | 'officer' | 'researcher';

export type AccountStatus = 'active' | 'pending' | 'suspended' | 'rejected';

export interface UserAccount {
  id: string;
  role: AppRole;
  fullName: string;
  phone: string;
  email?: string;
  password?: string;
  district: string;
  preferredLanguage: 'rw' | 'en';
  status: AccountStatus;
  createdAt: string;
  /** 'DD/MM/YYYY HH:MM'; undefined = never signed in. */
  lastSignIn?: string;
  twoStepEnabled?: boolean;
  /** Geographic access: the district, optionally limited to sectors, and/or one cooperative. */
  scope?: {
    district: string;
    /** Empty = the whole district. */
    sectors: string[];
    cooperative?: string;
  };
  farmerDetails?: {
    sector: string;
    cell: string;
    farmSizeHa: number;
    cropsGrown: string[];
    cooperative?: string;
  };
  coopDetails?: {
    cooperativeName: string;
    registrationNumber: string;
    sector: string;
    membersCount: number;
  };
  officerDetails?: {
    districtOfAssignment: string;
    staffId: string;
    officePhone: string;
  };
  researcherDetails?: {
    institution: string;
    researchArea: string;
  };
}

export interface AccessRequest {
  id: string;
  accountId: string;
  role: ApprovalRole;
  fullName: string;
  phone: string;
  email: string;
  organizationOrArea: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  /** Reason given when rejected (shown to the applicant at sign-in). */
  decisionReason?: string;
  decidedAt?: string;
}

export type PermissionId =
  | 'view_forecasts'
  | 'issue_warnings'
  | 'verify_reports'
  | 'message_members'
  | 'manage_members'
  | 'view_research_data'
  | 'manage_users'
  | 'export_data';

/** Which permissions each role has (Permission matrix). */
export type RolePermissions = Record<AppRole, PermissionId[]>;

/** One recorded action (admin dashboard "latest audit events"; extended by Security & audit). */
export interface AuditEvent {
  id: string;
  /** 'DD/MM/YYYY HH:MM' */
  at: string;
  actor: string;
  actorRole: AppRole | 'system';
  action: string;
  target: string;
}

export interface DataSourceStatus {
  id: string;
  name: string;
  kind: 'Station network' | 'Satellite' | 'Forecast model' | 'File upload';
  status: 'Healthy' | 'Delayed' | 'Error';
  /** 'DD/MM HH:MM' */
  lastSync: string;
  note: string;
  /** Where the (simulated) feed comes from. */
  endpoint: string;
  schedule: string;
  recordsToday: number;
  expectedToday: number;
  isDemo?: boolean;
}

export interface LoginAttempt {
  id: string;
  /** 'DD/MM/YYYY HH:MM' */
  at: string;
  identifier: string;
  accountName?: string;
  role?: AppRole;
  success: boolean;
  device: string;
  location: string;
  reason?: string;
}

export interface SecuritySettings {
  twoStepRoles: AppRole[];
  timeoutMinutes: Record<AppRole, number>;
  passwordMinLength: number;
  passwordNeedsNumber: boolean;
  lockAfterFailed: number;
  retentionMonths: number;
}

export interface ProcessingRun {
  id: string;
  /** 'DD/MM/YYYY HH:MM' */
  startedAt: string;
  trigger: 'Scheduled' | 'Run now' | 'Reprocess';
  status: 'Completed' | 'Completed with warnings';
  durationMin: number;
  recordsIn: number;
  gapsFilled: number;
  outliersFlagged: number;
}

export interface ProcessingSettings {
  gapMethod: 'Linear between neighbours' | 'Nearest station' | 'Climatology for the day';
  outlierThresholdSd: number;
  interpolation: 'Inverse distance' | 'Nearest station' | 'Kriging (simulated)';
  aggregation: 'Daily' | 'Dekadal' | 'Monthly';
}

export interface MessageTemplate {
  id: string;
  kind: 'Warning' | 'Advisory' | 'Cooperative' | 'Meeting';
  name: string;
  en: string;
  rw: string;
}

export interface VoiceSettings {
  enabled: boolean;
  voice: 'Female voice' | 'Male voice';
  retries: number;
  callWindow: string;
}

export interface SmsReply {
  id: string;
  /** 'DD/MM/YYYY HH:MM' */
  at: string;
  fromName: string;
  phone: string;
  text: string;
  meaning: 'Acknowledged' | 'Question' | 'Stop SMS';
  relatedTo: string;
}

export interface SmsOptOut {
  id: string;
  name: string;
  phone: string;
  sector: string;
  /** DD/MM/YYYY */
  since: string;
  via: string;
}


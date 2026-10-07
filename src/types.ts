export type NavView =
  | 'dashboard'
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

export type AppRole = 'farmer' | 'officer' | 'cooperative';

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
  type: 'warning' | 'feedback' | 'report_to_review' | 'message' | 'meeting';
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
  cell: string;
  phone: string;
  role: CoopMemberRole;
  crops: string[];
  acknowledged: Record<string, boolean>;
  /** DD/MM/YYYY */
  lastActive: string;
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
  | 'Situation report';

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
export type SignUpRole = 'farmer' | 'cooperative_leader' | 'officer' | 'researcher';

export interface UserAccount {
  id: string;
  role: 'farmer' | 'officer' | 'cooperative_leader' | 'researcher' | 'admin';
  fullName: string;
  phone: string;
  email?: string;
  password?: string;
  district: string;
  preferredLanguage: 'rw' | 'en';
  status: 'active' | 'pending';
  createdAt: string;
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
  role: 'cooperative_leader' | 'officer' | 'researcher';
  fullName: string;
  phone: string;
  email: string;
  organizationOrArea: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}


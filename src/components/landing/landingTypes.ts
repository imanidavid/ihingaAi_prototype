export type UserRole =
  | 'Farmer'
  | 'CooperativeLeader'
  | 'Officer'
  | 'Agronomist'
  | 'Researcher'
  | 'Admin';

export type AppLanguage = 'EN' | 'RW' | 'FR';

export interface UserProfile {
  name: string;
  initials: string;
  roleTitle: string;
  district: string;
  sector?: string;
  cooperativeOrOrg?: string;
  role: UserRole;
}

export interface NavItemConfig {
  id: string;
  label: string;
  iconName: string;
  badge?: string;
  signatureHeading: {
    upper: string;
    connector: string;
    suffix?: string;
  };
  subtitle: string;
}

export const RWANDA_DISTRICTS = [
  'Musanze',
  'Nyagatare',
  'Huye',
  'Rubavu',
  'Bugesera',
  'Kayonza',
  'Gicumbi',
  'Rwamagana',
  'Gakenke',
  'Nyamagabe',
  'Rulindo',
  'Kigali / Gasabo',
] as const;

export const ROLE_PROFILES: Record<UserRole, UserProfile> = {
  Farmer: {
    name: 'Jean-Paul Habimana',
    initials: 'JH',
    roleTitle: 'Registered Smallholder Farmer',
    district: 'Musanze',
    sector: 'Kinigi Sector',
    cooperativeOrOrg: 'COOPAC Volcanic Potatoes',
    role: 'Farmer',
  },
  Officer: {
    name: 'Dr. Claire Mukamana',
    initials: 'CM',
    roleTitle: 'District Agricultural Officer',
    district: 'Nyagatare',
    sector: 'Nyagatare Central',
    cooperativeOrOrg: 'Ministry of Agriculture & Animal Resources (MINAGRI)',
    role: 'Officer',
  },
  CooperativeLeader: {
    name: 'Emmanuel Nkurunziza',
    initials: 'EN',
    roleTitle: 'Cooperative Union President',
    district: 'Huye',
    sector: 'Maraba Sector',
    cooperativeOrOrg: 'Abahuzamugambi Coffee Growers Co-op',
    role: 'CooperativeLeader',
  },
  Agronomist: {
    name: 'Aline Umutoni',
    initials: 'AU',
    roleTitle: 'Senior Field Agronomist',
    district: 'Rubavu',
    sector: 'Gisenyi Horticultural Basin',
    cooperativeOrOrg: 'RAB Field Extension Services',
    role: 'Agronomist',
  },
  Researcher: {
    name: 'Prof. David Kayitare',
    initials: 'DK',
    roleTitle: 'Climate & Agro-Telemetry Scientist',
    district: 'Kigali / Gasabo',
    sector: 'Remote Sensing Lab',
    cooperativeOrOrg: 'University of Rwanda & Meteo Rwanda',
    role: 'Researcher',
  },
  Admin: {
    name: 'System Administrator',
    initials: 'SA',
    roleTitle: 'Platform & Infrastructure Superadmin',
    district: 'National Grid',
    sector: 'Central Infrastructure',
    cooperativeOrOrg: 'Ihinga AI Core Network',
    role: 'Admin',
  },
};

export const ROLE_NAV_CONFIG: Record<UserRole, NavItemConfig[]> = {
  Farmer: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      iconName: 'LayoutDashboard',
      signatureHeading: { upper: 'FARM', connector: 'command' },
      subtitle: 'Real-time telemetry, daily recommendations, and farm health index.',
    },
    {
      id: 'climate-intelligence',
      label: 'Climate Intelligence',
      iconName: 'CloudSun',
      signatureHeading: { upper: 'CLIMATE', connector: 'intelligence' },
      subtitle: 'Hyperlocal microclimate forecasts and soil saturation models.',
    },
    {
      id: 'weather-alerts',
      label: 'Weather Alerts',
      iconName: 'BellRing',
      badge: 'Live',
      signatureHeading: { upper: 'WEATHER', connector: 'telemetry & alerts' },
      subtitle: 'Early warning indicators and automated SMS alert dispatch records.',
    },
    {
      id: 'crop-monitoring',
      label: 'Crop Monitoring',
      iconName: 'Sprout',
      signatureHeading: { upper: 'CROP', connector: 'vitality monitor' },
      subtitle: 'Satellite NDVI spectral tracking and phenology growth stages.',
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      iconName: 'Store',
      signatureHeading: { upper: 'AGRO', connector: 'marketplace' },
      subtitle: 'Direct farm-gate pricing, verified off-takers, and seed exchange.',
    },
    {
      id: 'cooperatives',
      label: 'Cooperatives',
      iconName: 'Users',
      signatureHeading: { upper: 'COOPERATIVE', connector: 'network' },
      subtitle: 'Shared machinery scheduling, communal storage, and harvest pools.',
    },
    {
      id: 'experts',
      label: 'Experts',
      iconName: 'UserCheck',
      signatureHeading: { upper: 'AGRONOMY', connector: 'expert desk' },
      subtitle: 'Direct consultations with certified sector extension officers.',
    },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      iconName: 'Bot',
      signatureHeading: { upper: 'IHINGA', connector: 'neural assistant' },
      subtitle: 'Natural language crop diagnostics in Kinyarwanda and English.',
    },
    {
      id: 'activity-timeline',
      label: 'Activity Timeline',
      iconName: 'Clock',
      signatureHeading: { upper: 'FIELD', connector: 'activity timeline' },
      subtitle: 'Chronological log of planting, fertilizing, weeding, and harvests.',
    },
    {
      id: 'reports',
      label: 'Reports',
      iconName: 'FileText',
      signatureHeading: { upper: 'HARVEST', connector: 'analytics & reports' },
      subtitle: 'Historical season yield comparisons and parametric insurance records.',
    },
    {
      id: 'settings',
      label: 'Settings',
      iconName: 'Settings',
      signatureHeading: { upper: 'FARMER', connector: 'preferences' },
      subtitle: 'SMS notification thresholds, USSD preferences, and field boundary coordinates.',
    },
  ],
  Officer: [
    {
      id: 'overview',
      label: 'Overview',
      iconName: 'LayoutDashboard',
      signatureHeading: { upper: 'RWANDA', connector: 'climate', suffix: 'OPERATIONS COMMAND' },
      subtitle: 'Real-time hydrological radar assimilation, automated crop drought indexing, and district-level intervention dispatch.',
    },
    {
      id: 'climate-intelligence',
      label: 'Climate Intelligence',
      iconName: 'CloudSun',
      signatureHeading: { upper: 'DISTRICT', connector: 'climate intelligence' },
      subtitle: 'Cross-sector radar assimilation and drought vulnerability indices.',
    },
    {
      id: 'district-monitoring',
      label: 'District Monitoring',
      iconName: 'MapPin',
      signatureHeading: { upper: 'DISTRICT', connector: 'monitoring grid' },
      subtitle: 'Sector-by-sector micro-zone telemetry and soil moisture maps.',
    },
    {
      id: 'farmer-activity',
      label: 'Farmer Activity',
      iconName: 'Activity',
      signatureHeading: { upper: 'FARMER', connector: 'field activity' },
      subtitle: 'Active farmer registrations, mobile telemetry responses, and USSD interactions.',
    },
    {
      id: 'alerts-interventions',
      label: 'Alerts & Interventions',
      iconName: 'AlertOctagon',
      badge: '3 Active',
      signatureHeading: { upper: 'EMERGENCY', connector: 'alerts & interventions' },
      subtitle: 'Rapid deployment triggers for localized pest outbreaks and flood risks.',
    },
    {
      id: 'cooperative-oversight',
      label: 'Cooperative Oversight',
      iconName: 'Building2',
      signatureHeading: { upper: 'COOPERATIVE', connector: 'oversight' },
      subtitle: 'Auditing yield declarations, storage capacity, and subsidy allocation.',
    },
    {
      id: 'reports',
      label: 'Reports',
      iconName: 'FileText',
      signatureHeading: { upper: 'STATUTORY', connector: 'district reports' },
      subtitle: 'Automated MINAGRI compliance documents and seasonal risk synthesis.',
    },
    {
      id: 'ai-intelligence',
      label: 'AI Intelligence',
      iconName: 'Sparkles',
      signatureHeading: { upper: 'PREDICTIVE', connector: 'ai intelligence' },
      subtitle: 'Yield gap projections, anomaly clusters, and climate adaptation forecasts.',
    },
    {
      id: 'settings',
      label: 'Settings',
      iconName: 'Settings',
      signatureHeading: { upper: 'OFFICER', connector: 'system settings' },
      subtitle: 'District boundary geofences and automated alert escalation rules.',
    },
  ],
  CooperativeLeader: [
    {
      id: 'cooperative-hub',
      label: 'Cooperative Hub',
      iconName: 'Building2',
      signatureHeading: { upper: 'MUSANZE COFFEE', connector: 'cooperative', suffix: 'HUB' },
      subtitle: '428 active members, aggregated harvest pooling, field block telemetry, and commodity sales.',
    },
    {
      id: 'members',
      label: 'Members',
      iconName: 'Users',
      signatureHeading: { upper: 'MEMBER', connector: 'roster & plots' },
      subtitle: '1,420 registered farmers across 3 sub-sectors with verified parcel coordinates.',
    },
    {
      id: 'shared-fields',
      label: 'Shared Fields',
      iconName: 'Layers',
      signatureHeading: { upper: 'SHARED', connector: 'fields & blocks' },
      subtitle: 'Communal plots, shared irrigation infrastructure, and tractor schedules.',
    },
    {
      id: 'aggregated-sales',
      label: 'Aggregated Sales',
      iconName: 'TrendingUp',
      signatureHeading: { upper: 'AGGREGATED', connector: 'sales & contracts' },
      subtitle: 'Forward contracts, buyer settlement tracking, and bulk price negotiations.',
    },
    {
      id: 'member-activity',
      label: 'Member Activity',
      iconName: 'Activity',
      signatureHeading: { upper: 'MEMBER', connector: 'telemetry activity' },
      subtitle: 'Real-time feed of planting notifications, inputs applied, and harvest milestones.',
    },
    {
      id: 'performance',
      label: 'Performance',
      iconName: 'BarChart3',
      signatureHeading: { upper: 'YIELD', connector: 'performance analytics' },
      subtitle: 'Historical hectare productivity benchmarks and quality grading distributions.',
    },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      iconName: 'Bot',
      signatureHeading: { upper: 'CO-OP', connector: 'ai strategist' },
      subtitle: 'Optimized harvest timing, logistical load balancing, and market price timing.',
    },
    {
      id: 'settings',
      label: 'Settings',
      iconName: 'Settings',
      signatureHeading: { upper: 'COOPERATIVE', connector: 'configuration' },
      subtitle: 'Bank payout accounts, SMS broadcast quotas, and cooperative bylaws.',
    },
  ],
  Agronomist: [
    {
      id: 'advisory-desk',
      label: 'Advisory Desk',
      iconName: 'FileSpreadsheet',
      signatureHeading: { upper: 'ADVISORY', connector: 'desk' },
      subtitle: '12 urgent field cases need your review today across 47 assigned farmers in Rubavu and Musanze.',
    },
    {
      id: 'farmer-cases',
      label: 'Farmer Cases',
      iconName: 'ClipboardList',
      badge: '8 Open',
      signatureHeading: { upper: 'FIELD', connector: 'cases & visits' },
      subtitle: 'Active diagnostic cases categorized by sector, crop variety, and urgency.',
    },
    {
      id: 'crop-diagnostics',
      label: 'Crop Diagnostics',
      iconName: 'Microscope',
      signatureHeading: { upper: 'CROP', connector: 'pathology & diagnostics' },
      subtitle: 'Computer vision pest identification, fungal spotting, and leaf chlorosis analyses.',
    },
    {
      id: 'soil-analysis',
      label: 'Soil Analysis',
      iconName: 'FlaskConical',
      signatureHeading: { upper: 'SOIL', connector: 'chemistry & nutrients' },
      subtitle: 'pH mapping, NPK balance calculations, and micro-nutrient replenishment prescriptions.',
    },
    {
      id: 'ai-recommendations',
      label: 'AI Recommendations',
      iconName: 'Sparkles',
      signatureHeading: { upper: 'NEURAL', connector: 'agronomy prescriptions' },
      subtitle: 'Model-generated treatment schedules calibrated to volcanic soil retention.',
    },
    {
      id: 'field-schedule',
      label: 'Field Schedule',
      iconName: 'Calendar',
      signatureHeading: { upper: 'FIELD', connector: 'itinerary & schedule' },
      subtitle: 'Optimized route navigation for on-site cooperative audits and validation visits.',
    },
    {
      id: 'reports',
      label: 'Reports',
      iconName: 'FileText',
      signatureHeading: { upper: 'TECHNICAL', connector: 'agronomy reports' },
      subtitle: 'Sector efficacy reports on bio-pesticide interventions and crop vigor.',
    },
    {
      id: 'settings',
      label: 'Settings',
      iconName: 'Settings',
      signatureHeading: { upper: 'AGRONOMIST', connector: 'profile & tools' },
      subtitle: 'Diagnostic sensor calibration profiles and mobile offline sync options.',
    },
  ],
  Researcher: [
    {
      id: 'research-lab',
      label: 'Research Lab',
      iconName: 'FlaskConical',
      signatureHeading: { upper: 'RESEARCH', connector: 'lab' },
      subtitle: 'Model performance, NDVI trends, anomaly detection and the publication pipeline for Eastern Province.',
    },
    {
      id: 'ai-models',
      label: 'AI Models',
      iconName: 'Cpu',
      signatureHeading: { upper: 'NEURAL', connector: 'model registry' },
      subtitle: 'Weights, loss curves, and validation benchmarks for Rwanda-calibrated crop models.',
    },
    {
      id: 'ndvi-analysis',
      label: 'NDVI Analysis',
      iconName: 'Satellite',
      signatureHeading: { upper: 'SPECTRAL', connector: 'ndvi & remote sensing' },
      subtitle: 'Sentinel-2 & Landsat-9 fusion with 10-meter pixel resolution vegetative indices.',
    },
    {
      id: 'anomaly-detection',
      label: 'Anomaly Detection',
      iconName: 'AlertCircle',
      signatureHeading: { upper: 'ANOMALY', connector: 'detection engine' },
      subtitle: 'Unsupervised spatial outliers in soil moisture and localized evapotranspiration.',
    },
    {
      id: 'climate-trends',
      label: 'Climate Trends',
      iconName: 'LineChart',
      signatureHeading: { upper: 'LONGITUDINAL', connector: 'climate trends' },
      subtitle: '30-year precipitation pattern shifts and temperature variance across Rwandan agro-ecological zones.',
    },
    {
      id: 'publications',
      label: 'Publications',
      iconName: 'BookOpen',
      signatureHeading: { upper: 'ACADEMIC', connector: 'publications & briefs' },
      subtitle: 'Peer-reviewed preprints, policy notes, and open dataset methodology papers.',
    },
    {
      id: 'data-export',
      label: 'Data Export',
      iconName: 'DownloadCloud',
      signatureHeading: { upper: 'DATA', connector: 'export & api' },
      subtitle: 'GeoTIFF raster streams, NetCDF climate grids, and structured JSON telemetry.',
    },
    {
      id: 'settings',
      label: 'Settings',
      iconName: 'Settings',
      signatureHeading: { upper: 'RESEARCH', connector: 'environment settings' },
      subtitle: 'HPC compute cluster keys, Jupyter workspace integration, and storage allocations.',
    },
  ],
  Admin: [
    {
      id: 'platform-health',
      label: 'Platform Health',
      iconName: 'HeartPulse',
      badge: '99.97%',
      signatureHeading: { upper: 'PLATFORM', connector: 'health' },
      subtitle: 'Real-time API performance, service health, and the platform-wide audit trail.',
    },
    {
      id: 'user-management',
      label: 'User Management',
      iconName: 'Users',
      signatureHeading: { upper: 'IDENTITY', connector: 'access management' },
      subtitle: 'Role assignments, cooperative officer authorizations, and USSD telephone bindings.',
    },
    {
      id: 'api-monitor',
      label: 'API Monitor',
      iconName: 'Server',
      signatureHeading: { upper: 'API', connector: 'traffic & telemetry' },
      subtitle: 'Meteo Rwanda gateway throughput, MTN SMS bridge status, and quota usage.',
    },
    {
      id: 'service-health',
      label: 'Service Health',
      iconName: 'CheckCircle2',
      signatureHeading: { upper: 'SERVICE', connector: 'health & microservices' },
      subtitle: 'Neural inference workers, geo-database partitions, and Redis cache clusters.',
    },
    {
      id: 'audit-log',
      label: 'Audit Log',
      iconName: 'Scroll',
      signatureHeading: { upper: 'SECURITY', connector: 'audit trail' },
      subtitle: 'Immutable cryptographic access records and administrative override history.',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      iconName: 'BarChart3',
      signatureHeading: { upper: 'PLATFORM', connector: 'growth analytics' },
      subtitle: 'District onboarding velocity, daily query volume, and farmer engagement curves.',
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      iconName: 'Sliders',
      signatureHeading: { upper: 'CORE', connector: 'configuration' },
      subtitle: 'Global backup intervals, rate limiting, and emergency broadcast failsafes.',
    },
  ],
};

export interface RiskSector {
  id: string;
  name: string;
  province: string;
  cropFocus: string;
  soilMoisture: number;
  precipitationRisk: 'Low' | 'Moderate' | 'Severe';
  ndviHealth: number; // 0 to 1.0
  activeFarmers: number;
  insuranceStatus: 'Insured' | 'Parametric Trigger Active' | 'Optimal';
}

export const RWANDA_SECTORS: RiskSector[] = [
  {
    id: 'musanze-1',
    name: 'Musanze Volcanic Belt',
    province: 'Northern Province',
    cropFocus: 'Irish Potatoes & Pyrethrum',
    soilMoisture: 78,
    precipitationRisk: 'Moderate',
    ndviHealth: 0.89,
    activeFarmers: 14200,
    insuranceStatus: 'Optimal',
  },
  {
    id: 'nyagatare-2',
    name: 'Nyagatare Agro-Pastoral',
    province: 'Eastern Province',
    cropFocus: 'Maize, Beans & Dairy',
    soilMoisture: 42,
    precipitationRisk: 'Severe',
    ndviHealth: 0.64,
    activeFarmers: 19850,
    insuranceStatus: 'Parametric Trigger Active',
  },
  {
    id: 'huye-3',
    name: 'Huye High-Altitude Slopes',
    province: 'Southern Province',
    cropFocus: 'Specialty Arabica Coffee',
    soilMoisture: 65,
    precipitationRisk: 'Low',
    ndviHealth: 0.94,
    activeFarmers: 8900,
    insuranceStatus: 'Optimal',
  },
  {
    id: 'rubavu-4',
    name: 'Rubavu Lake Kivu Basin',
    province: 'Western Province',
    cropFocus: 'Horticulture & Tea',
    soilMoisture: 72,
    precipitationRisk: 'Low',
    ndviHealth: 0.91,
    activeFarmers: 11300,
    insuranceStatus: 'Optimal',
  },
  {
    id: 'bugesera-5',
    name: 'Bugesera Lakes Region',
    province: 'Eastern Province',
    cropFocus: 'Cassava, Rice & Sorghum',
    soilMoisture: 49,
    precipitationRisk: 'Moderate',
    ndviHealth: 0.71,
    activeFarmers: 16400,
    insuranceStatus: 'Insured',
  },
];


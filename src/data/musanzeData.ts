import {
  DistrictData,
  WeatherForecastDay,
  AlertItem,
  CropAdvisory,
  ObservationItem,
  PlanAheadItem,
  RiskLevel,
  UserProfileSettings,
  OfficerData,
  SectorOverviewItem,
  OfficerWarningDelivery,
  OfficerReviewReport,
  OfficerAttentionItem,
  OfficerProfile,
  OfficerActiveWarning,
  WarningHistoryItem,
  WarningItem,
  ThresholdRuleItem,
  OfficerCropRiskDetail,
  SectorAcknowledgedItem,
  SectorWarningItem,
} from '../types';
import heroImg from '../assets/images/musanze_terraced_hero_1790594273190.jpg';
import officerHeroImg from '../assets/images/musanze_aerial_hero_1790767815128.jpg';
import potatoImg from '../assets/images/irish_potato_crop_1790594286456.jpg';
import beansImg from '../assets/images/climbing_beans_crop_1790594298767.jpg';
import maizeImg from '../assets/images/highland_maize_crop_1790594310562.jpg';

export { heroImg, officerHeroImg, potatoImg, beansImg, maizeImg };

/**
 * ============================================================================
 * SINGLE SOURCE OF TRUTH: MUSANZE SHARED DATA MODULE (src/data/musanzeData.ts)
 * Serves both Farmer and Agricultural Officer roles.
 * NOW = Mon 28/09/2026 14:00
 * ============================================================================
 */

export const NOW = {
  timestamp: 'Mon 28/09/2026 14:00',
  dateFormatted: '28/09/2026',
  timeFormatted: '14:00',
  dayOfWeek: 'Monday',
  season: 'Season 2026/27 A',
  farmerName: 'Jean-Baptiste',
  farmerFullName: 'Jean-Baptiste Ndayisaba',
  greeting: 'Good afternoon, Jean-Baptiste. Heavy rain expected Tuesday.',
  weatherSummary: 'Heavy rain expected Tuesday.',
  temp: '22°C',
  humidity: '78%',
  weatherString: '22°C / 78%',
  statusLine: 'Last updated 13:55 · available offline',
  defaultPlot: 'Kinigi · Bisoke',
  defaultSector: 'Kinigi',
  defaultCell: 'Bisoke',
};

export const MUSANZE_RECORD = {
  districtId: 'musanze',
  districtName: 'Musanze',
  province: 'Northern Province',
  farmerName: NOW.farmerName,
  farmerFullName: NOW.farmerFullName,
  season: NOW.season,
  riskLevel: 'Watch' as RiskLevel,
  weatherSummary: NOW.weatherSummary,
  greeting: NOW.greeting,
  temp: NOW.temp,
  humidity: NOW.humidity,
  weatherString: NOW.weatherString,
  rainfall24h: 12,
  rainfallDelta: '+34% vs 10-yr norm',
  soilSaturation: 68,
  activeWarningsCount: 2,
  actionRequiredCount: 2,
  affectedSectorsCount: 4,
  totalSectorsCount: 15,
  affectedSectorsCaption: 'Kinigi +3 more',
  affectedSectorsList: ['Kinigi', 'Busogo', 'Remera', 'Muhoza'],
  lowRiskSectorsCount: 11,
  lowRiskSectorsList: [
    'Cyuve',
    'Gacaca',
    'Gashaki',
    'Gataraga',
    'Kimonyi',
    'Muko',
    'Musanze',
    'Nkotsi',
    'Nyange',
    'Rwaza',
    'Shingiro',
  ],
  allSectors: [
    'Kinigi',
    'Muhoza',
    'Busogo',
    'Remera',
    'Cyuve',
    'Gacaca',
    'Gashaki',
    'Gataraga',
    'Kimonyi',
    'Muko',
    'Musanze',
    'Nkotsi',
    'Nyange',
    'Rwaza',
    'Shingiro',
  ],
  rainfallPeakMm: 48,
  rainfallPeakDay: 'Tuesday',
  plotLocation: NOW.defaultPlot,
};

export interface RiskCardHorizonData {
  label: string;
  value: string;
  badge: RiskLevel;
  subtext: string;
}

export interface HorizonPackage {
  id: '10d' | 'month' | 'season';
  label: string;
  cards: {
    excessRain: RiskCardHorizonData;
    drySpell: RiskCardHorizonData;
    temperature: RiskCardHorizonData;
    seasonOnset: RiskCardHorizonData;
  };
  chartData: WeatherForecastDay[];
  chartCaption: string;
  peakLabel?: string;
  peakX?: string;
}

/**
 * RAINFALL FORECAST DATASETS CONSISTENT ACROSS HORIZONS:
 * - 10 Days: Daily 10 points (Sep 28 – Oct 07), Tue Sep 29 is peak 48 mm.
 * - This Month: 30 daily points summing up to exactly 210 mm ("210 mm total, above normal").
 * - Season: 6 monthly totals Sep–Feb: Sep 140 mm, Oct 210 mm, Nov 185 mm (Oct-Nov wettest), Dec 110 mm, Jan 65 mm, Feb 75 mm.
 */

export const RAINFALL_10D: WeatherForecastDay[] = [
  { day: 'Mon', fullDate: 'Sep 28', rainfallMm: 12, temp: 22, humidity: 78 },
  { day: 'Tue', fullDate: 'Sep 29', rainfallMm: 48, isPeak: true, temp: 21, humidity: 88 },
  { day: 'Wed', fullDate: 'Sep 30', rainfallMm: 28, temp: 22, humidity: 82 },
  { day: 'Thu', fullDate: 'Oct 01', rainfallMm: 14, temp: 23, humidity: 76 },
  { day: 'Fri', fullDate: 'Oct 02', rainfallMm: 9, temp: 24, humidity: 71 },
  { day: 'Sat', fullDate: 'Oct 03', rainfallMm: 6, temp: 24, humidity: 68 },
  { day: 'Sun', fullDate: 'Oct 04', rainfallMm: 11, temp: 23, humidity: 72 },
  { day: 'Mon', fullDate: 'Oct 05', rainfallMm: 18, temp: 22, humidity: 77 },
  { day: 'Tue', fullDate: 'Oct 06', rainfallMm: 24, temp: 22, humidity: 80 },
  { day: 'Wed', fullDate: 'Oct 07', rainfallMm: 15, temp: 23, humidity: 75 },
];

// 30 days (28/09–27/10): starts with the same 10 days (185 mm, peak 48 mm on 29/09), then October rains (mostly 3–15 mm, with heavier days of 16 mm and 18 mm, never more than 2 consecutive days < 2 mm). Total exactly 300 mm.
export const RAINFALL_MONTH_30D: WeatherForecastDay[] = [
  ...RAINFALL_10D, // days 1-10 sum = 185 mm
  { day: 'Thu', fullDate: 'Oct 08', rainfallMm: 8, temp: 22, humidity: 78 },
  { day: 'Fri', fullDate: 'Oct 09', rainfallMm: 12, temp: 21, humidity: 82 },
  { day: 'Sat', fullDate: 'Oct 10', rainfallMm: 16, temp: 21, humidity: 84 },
  { day: 'Sun', fullDate: 'Oct 11', rainfallMm: 5, temp: 22, humidity: 78 },
  { day: 'Mon', fullDate: 'Oct 12', rainfallMm: 1, temp: 24, humidity: 70 },
  { day: 'Tue', fullDate: 'Oct 13', rainfallMm: 0, temp: 25, humidity: 68 },
  { day: 'Wed', fullDate: 'Oct 14', rainfallMm: 9, temp: 22, humidity: 77 },
  { day: 'Thu', fullDate: 'Oct 15', rainfallMm: 14, temp: 21, humidity: 81 },
  { day: 'Fri', fullDate: 'Oct 16', rainfallMm: 18, temp: 20, humidity: 85 },
  { day: 'Sat', fullDate: 'Oct 17', rainfallMm: 7, temp: 22, humidity: 76 },
  { day: 'Sun', fullDate: 'Oct 18', rainfallMm: 4, temp: 23, humidity: 72 },
  { day: 'Mon', fullDate: 'Oct 19', rainfallMm: 0, temp: 25, humidity: 66 },
  { day: 'Tue', fullDate: 'Oct 20', rainfallMm: 1, temp: 24, humidity: 69 },
  { day: 'Wed', fullDate: 'Oct 21', rainfallMm: 6, temp: 22, humidity: 75 },
  { day: 'Thu', fullDate: 'Oct 22', rainfallMm: 5, temp: 23, humidity: 73 },
  { day: 'Fri', fullDate: 'Oct 23', rainfallMm: 4, temp: 23, humidity: 71 },
  { day: 'Sat', fullDate: 'Oct 24', rainfallMm: 1, temp: 24, humidity: 68 },
  { day: 'Sun', fullDate: 'Oct 25', rainfallMm: 3, temp: 24, humidity: 70 },
  { day: 'Mon', fullDate: 'Oct 26', rainfallMm: 1, temp: 25, humidity: 67 },
  { day: 'Tue', fullDate: 'Oct 27', rainfallMm: 0, temp: 25, humidity: 65 },
];

// Season (monthly totals): Sep 130 · Oct 240 · Nov 220 · Dec 110 · Jan 45 · Feb 70 mm
export const RAINFALL_SEASON_MONTHS: WeatherForecastDay[] = [
  { day: 'Sep', fullDate: 'Sep 2026', rainfallMm: 130, temp: 22, humidity: 76 },
  { day: 'Oct', fullDate: 'Oct 2026', rainfallMm: 240, isPeak: true, temp: 21, humidity: 82 },
  { day: 'Nov', fullDate: 'Nov 2026', rainfallMm: 220, temp: 22, humidity: 80 },
  { day: 'Dec', fullDate: 'Dec 2026', rainfallMm: 110, temp: 22, humidity: 75 },
  { day: 'Jan', fullDate: 'Jan 2027', rainfallMm: 45, temp: 24, humidity: 68 },
  { day: 'Feb', fullDate: 'Feb 2027', rainfallMm: 70, temp: 24, humidity: 70 },
];

export const FORECAST_HORIZONS: Record<'10d' | 'month' | 'season', HorizonPackage> = {
  '10d': {
    id: '10d',
    label: 'Next 10 days',
    cards: {
      excessRain: {
        label: 'Excess rain',
        value: '48 mm',
        badge: 'Watch',
        subtext: 'Peak Tue 29/09, 02:00–14:00',
      },
      drySpell: {
        label: 'Dry spell',
        value: '12%',
        badge: 'Low',
        subtext: 'Chance of 7+ dry days',
      },
      temperature: {
        label: 'Temperature',
        value: '+0.6°C',
        badge: 'Low',
        subtext: 'Above normal · 19–24°C',
      },
      seasonOnset: {
        label: 'Season onset',
        value: '08/09',
        badge: 'Low',
        subtext: '4 days earlier than normal',
      },
    },
    chartData: RAINFALL_10D,
    chartCaption: '10-day rainfall series: daily precipitation for Musanze with 48 mm peak on Tuesday.',
    peakLabel: 'Peak 48 mm',
    peakX: 'Tue 29',
  },
  month: {
    id: 'month',
    label: 'This month',
    cards: {
      excessRain: {
        label: 'Excess rain',
        value: '300 mm',
        badge: 'Watch',
        subtext: 'Total this month · above normal',
      },
      drySpell: {
        label: 'Dry spell',
        value: '18%',
        badge: 'Low',
        subtext: 'Chance of 7+ dry days',
      },
      temperature: {
        label: 'Temperature',
        value: '+0.5°C',
        badge: 'Low',
        subtext: 'Above normal',
      },
      seasonOnset: {
        label: 'Season onset',
        value: '08/09',
        badge: 'Low',
        subtext: '4 days earlier than normal',
      },
    },
    chartData: RAINFALL_MONTH_30D,
    chartCaption: '30-day cumulative precipitation trend showing 300 mm monthly total for Musanze.',
    peakLabel: '300 mm total',
  },
  season: {
    id: 'season',
    label: 'Season',
    cards: {
      excessRain: {
        label: 'Excess rain',
        value: 'Oct–Nov',
        badge: 'Watch',
        subtext: 'Wettest months',
      },
      drySpell: {
        label: 'Dry spell',
        value: '41%',
        badge: 'Watch',
        subtext: 'Chance of a dry spell in January',
      },
      temperature: {
        label: 'Temperature',
        value: '+0.4°C',
        badge: 'Low',
        subtext: 'Above normal',
      },
      seasonOnset: {
        label: 'Season onset',
        value: '08/09',
        badge: 'Low',
        subtext: '4 days earlier than normal',
      },
    },
    chartData: RAINFALL_SEASON_MONTHS,
    chartCaption: 'Season 2026/27 A monthly outlook (Sep–Feb): Oct–Nov wettest window.',
    peakLabel: 'Oct–Nov peak',
  },
};

/**
 * WARNINGS (one definition, used by dashboard Recent Alerts, Early Warnings desktop and mobile, M1 alerts):
 * - Active: "Heavy Rain Influx" · Watch · Kinigi, Busogo, Remera · issued 13:35 ("25 min ago") · Tue 02:00–14:00, peak 48 mm
 * - Active: "Late Blight Threat" · High · Irish Potato plots · Muhoza & Kinigi · issued 13:00 ("1h ago") · next 48–72 hours

/**
 * CROP RISK MATRIX:
 * Maize rain = Watch (runoff).
 * Only allowed levels anywhere: Low, Watch, High, Critical.
 */
export interface CropRiskMatrixRow {
  crop: string;
  excessRain: { level: RiskLevel; chipText: string };
  drySpell: { level: RiskLevel; chipText: string };
  temperature: { level: RiskLevel; chipText: string };
  diseasePest: { level: RiskLevel; chipText: string };
  advisoryId: string;
}

export const CROP_RISK_MATRIX: CropRiskMatrixRow[] = [
  {
    crop: 'Irish Potato',
    excessRain: { level: 'Watch', chipText: 'Watch' },
    drySpell: { level: 'Low', chipText: 'Low' },
    temperature: { level: 'Low', chipText: 'Low' },
    diseasePest: { level: 'High', chipText: 'High (late blight)' },
    advisoryId: 'adv-potato',
  },
  {
    crop: 'Climbing Beans',
    excessRain: { level: 'Watch', chipText: 'Watch (lodging)' },
    drySpell: { level: 'Low', chipText: 'Low' },
    temperature: { level: 'Low', chipText: 'Low' },
    diseasePest: { level: 'Low', chipText: 'Low' },
    advisoryId: 'adv-beans',
  },
  {
    crop: 'Maize',
    excessRain: { level: 'Watch', chipText: 'Watch (runoff)' },
    drySpell: { level: 'Low', chipText: 'Low' },
    temperature: { level: 'Low', chipText: 'Low' },
    diseasePest: { level: 'Low', chipText: 'Low' },
    advisoryId: 'adv-maize',
  },
];

/**
 * ADVISORIES:
 * Titles and reasons identical on dashboard cards, Recommendations, drawer, mobile Advice, M2.
 * - Potato: "Don't spray until Tuesday 14:00" / "Heavy rain will wash the spray off your plants."
 * - Beans: "Strengthen bean stakes today" / "Wet soil and wind can knock plants over." (closes Mon 18:00 · 4h)
 * - Maize: "Clear drainage channels before Tuesday" / "Standing water damages young maize roots." (before Tue 02:00 · 12h)
 */
export const CROP_ADVISORIES_DATA: CropAdvisory[] = [
  {
    id: 'adv-potato',
    crop: 'Irish Potato',
    category: 'Disease Prevention',
    badgeLabel: 'Irish Potato · Spray warning',
    title: "Don't spray until Tuesday 14:00",
    oneLineAdvice: 'Heavy rain will wash the spray off your plants.',
    image: potatoImg,
    stat1Value: '2 days',
    stat1Label: 'Window',
    stat2Value: '48 mm',
    stat2Label: 'Rain Tue',
    windowStatusText: 'Spray window opens Tue 14:00',
    progressLabel: 'Opens in 24h',
    progressPercent: 45,
    whyAdvice:
      'Rain within 2 hours of spraying washes the spray away. Humid weather after the rain is when blight spreads fastest.',
    location: 'Kinigi · Bisoke',
    timing: 'Spray window opens Tue 14:00 · Opens in 24h',
    riskSummary: 'Late blight, High',
    mitigationSteps: [
      'Do not spray before Tuesday 14:00.',
      'Spray on a dry afternoon, Tue to Thu.',
      'Check leaves for dark spots on Wednesday.',
    ],
  },
  {
    id: 'adv-beans',
    crop: 'Climbing Beans',
    category: 'Hillside Protection',
    badgeLabel: 'Climbing Beans · Staking alert',
    title: 'Strengthen bean stakes today',
    oneLineAdvice: 'Wet soil and wind can knock plants over.',
    image: beansImg,
    stat1Value: '4 hours',
    stat1Label: 'Window',
    stat2Value: '28 km/h',
    stat2Label: 'Wind gusts',
    windowStatusText: 'closes Mon 18:00 · 4h',
    progressLabel: '4h remaining',
    progressPercent: 75,
    whyAdvice:
      'Saturated soil softens root anchor points while wind gusts from Mount Bisoke topple unsupported wooden stakes.',
    location: 'Kinigi · Bisoke',
    timing: 'closes Mon 18:00 · 4h remaining',
    riskSummary: 'Terrace runoff & lodging, Watch',
    mitigationSteps: [
      'Inspect eucalyptus stake anchors along hillside rows.',
      'Tie loose bean stems using dried banana fiber strips.',
      'Clear ridge drainage lines before evening.',
    ],
  },
  {
    id: 'adv-maize',
    crop: 'Maize',
    category: 'Water Management',
    badgeLabel: 'Maize · Furrow drainage',
    title: 'Clear drainage channels before Tuesday',
    oneLineAdvice: 'Standing water damages young maize roots.',
    image: maizeImg,
    stat1Value: '12 hours',
    stat1Label: 'Window',
    stat2Value: '48 mm',
    stat2Label: 'Peak storm',
    windowStatusText: 'before Tue 02:00 · 12h',
    progressLabel: '12h remaining',
    progressPercent: 60,
    whyAdvice:
      'Young maize roots suffocate if floodwater ponds in furrow trenches for longer than 6 hours after rainfall.',
    location: 'Kinigi · Bisoke',
    timing: 'before Tue 02:00 · 12h remaining',
    riskSummary: 'Furrow waterlogging, Watch',
    mitigationSteps: [
      'Dig 15 cm drainage outlets at slope bottoms.',
      'Clear volcanic mud blockages from trench junctions.',
      'Check seedlings after the downpour on Tuesday afternoon.',
    ],
  },
];

/**
 * PLAN AHEAD ITEMS
 */
export const PLAN_AHEAD_DATA: PlanAheadItem[] = [
  {
    id: 'plan-1',
    category: 'Soil Management',
    title: 'Clear sediment from hillside terrace contours',
    oneLineRationale: 'Maintains terrace storage capacity and prevents overflow onto lower plots.',
    timingChip: 'By Wed 30/09',
    cropTag: 'All crops',
    iconType: 'shield',
    advisoryEquivalent: CROP_ADVISORIES_DATA[1],
  },
  {
    id: 'plan-2',
    category: 'Harvest Protection',
    title: 'Inspect climbing bean poles for wind firmness',
    oneLineRationale: 'Reinforcing poles prevents crop lodging and foliage damage during wind gusts.',
    timingChip: 'By Mon 28/09 18:00',
    cropTag: 'Climbing Beans',
    iconType: 'sprout',
    advisoryEquivalent: CROP_ADVISORIES_DATA[1],
  },
  {
    id: 'plan-3',
    category: 'Fertilizer Timing',
    title: 'Delay topdress urea until storm front passes',
    oneLineRationale: 'Heavy rain will leach nitrogen below root depth and waste inputs.',
    timingChip: 'After Thu 01/10',
    cropTag: 'Maize',
    iconType: 'calendar',
    advisoryEquivalent: CROP_ADVISORIES_DATA[2],
  },
  {
    id: 'plan-4',
    category: 'Variety Selection',
    title: 'Select certified late-blight tolerant seed for next cycle',
    oneLineRationale: 'Tolerant varieties cut spray frequency and secure harvest yields.',
    timingChip: 'Pre-Season B order',
    cropTag: 'Irish Potato',
    iconType: 'tag',
    advisoryEquivalent: CROP_ADVISORIES_DATA[0],
  },
];


export const SECTORS_WATCH_LIST = [
  { name: 'Kinigi', isUserSector: true, reason: 'Volcanic foothill slope runoff' },
  { name: 'Busogo', isUserSector: false, reason: 'Hillside terraced plot overflow' },
  { name: 'Remera', isUserSector: false, reason: 'Terrace contour drainage seepage' },
  { name: 'Muhoza', isUserSector: false, reason: 'Low-lying volcanic depression ponding' },
];

export const SECTORS_LOW_LIST = [
  { name: 'Cyuve', reason: 'Well-drained volcanic ash soil structure' },
  { name: 'Gacaca', reason: 'Optimal field capacity & rapid percolation' },
  { name: 'Gashaki', reason: 'Stable lakeside topography with moderate runoff' },
  { name: 'Gataraga', reason: 'Standard hillside terraced infiltration rate' },
  { name: 'Kimonyi', reason: 'Protected foothill terrain' },
  { name: 'Muko', reason: 'Normal soil porosity & no pooling' },
  { name: 'Musanze', reason: 'Urban peripheral storm channels unobstructed' },
  { name: 'Nkotsi', reason: 'Low erosion hazard under present conditions' },
  { name: 'Nyange', reason: 'Standard terraced contour resistance' },
  { name: 'Rwaza', reason: 'Southern basin drainage flowing smoothly' },
  { name: 'Shingiro', reason: 'Upper foothill permeable volcanic cinder' },
];

/**
 * CROP RECORD — Single Source of Truth for crop stages on every page:
 * - Irish Potato: planted 05/09/2026 · now early vegetative (day 23) · tuber initiation mid-Oct · bulking Nov · harvest early Jan
 * - Climbing Beans: planted 12/09/2026 · now vegetative · staking early Oct · flowering and podding Nov · harvest mid-Dec to early Jan
 * - Maize: planted 20/09/2026 · now emergence · top-dress late Oct · harvest Feb
 */
export const CROP_RECORD = [
  {
    id: 'potato',
    crop: 'Irish Potato',
    plantedDate: '05/09/2026',
    currentStage: 'Early vegetative (day 23)',
    nextAction: 'Spray window opens Tue 14:00 · Tuber initiation mid-Oct',
    seasonProgressPercent: 20,
    harvestWindow: 'Early Jan 2027',
  },
  {
    id: 'beans',
    crop: 'Climbing Beans',
    plantedDate: '12/09/2026',
    currentStage: 'Vegetative',
    nextAction: 'Reinforce hillside trellising before staking in early October',
    seasonProgressPercent: 22,
    harvestWindow: 'Mid-Dec to early Jan 2027',
  },
  {
    id: 'maize',
    crop: 'Maize',
    plantedDate: '20/09/2026',
    currentStage: 'Emergence',
    nextAction: 'Clear volcanic furrow channels · Top-dress with urea late October',
    seasonProgressPercent: 6,
    harvestWindow: 'February 2027',
  },
];

// Seasonal calendar data for Musanze: 6 month cards (Sep–Feb, Sep highlighted)
export const MUSANZE_SEASON_CALENDAR_MONTHS = [
  {
    id: 'sep',
    month: 'September',
    shortMonth: 'Sep',
    year: '2026',
    isCurrent: true,
    activityTitle: 'Planting & emergence',
    crops: 'Irish Potato (05/09) · Beans (12/09) · Maize (20/09)',
    moistureStatus: 'Wet',
    actionAdvice: 'Hold fungicide spray until Tuesday rain clears',
  },
  {
    id: 'oct',
    month: 'October',
    shortMonth: 'Oct',
    year: '2026',
    isCurrent: false,
    activityTitle: 'Vegetative growth & staking',
    crops: 'Tuber initiation mid-Oct · Staking beans · Maize top-dress',
    moistureStatus: 'Very wet',
    actionAdvice: 'Stake climbing beans and top-dress maize with urea',
  },
  {
    id: 'nov',
    month: 'November',
    shortMonth: 'Nov',
    year: '2026',
    isCurrent: false,
    activityTitle: 'Bulking & podding',
    crops: 'Potato tuber bulking · Bean flowering & podding',
    moistureStatus: 'Very wet',
    actionAdvice: 'Inspect foliage for late blight sporulation',
  },
  {
    id: 'dec',
    month: 'December',
    shortMonth: 'Dec',
    year: '2026',
    isCurrent: false,
    activityTitle: 'Maturation & early harvest',
    crops: 'Bean harvest (mid-Dec) · Potato pre-harvest inspection',
    moistureStatus: 'Adequate',
    actionAdvice: 'Prepare drying tarps and clean post-harvest storage',
  },
  {
    id: 'jan',
    month: 'January',
    shortMonth: 'Jan',
    year: '2027',
    isCurrent: false,
    activityTitle: 'Main potato & bean harvest',
    crops: 'Potato harvest early Jan · Late bean clearing',
    moistureStatus: 'Dry',
    actionAdvice: 'Harvest tubers during dry sunny morning hours',
  },
  {
    id: 'feb',
    month: 'February',
    shortMonth: 'Feb',
    year: '2027',
    isCurrent: false,
    activityTitle: 'Maize harvest & Season B prep',
    crops: 'Maize harvest · Season B terraced land tilling',
    moistureStatus: 'Adequate',
    actionAdvice: 'Post-harvest grading and Season B land tilling',
  },
];

// Seasonal calendar overview for Musanze dashboard preview
export const MUSANZE_SEASON_CALENDAR = {
  seasonName: 'Season 2026/27 A',
  currentMonth: 'September 2026',
  currentDay: 28,
  plantingWindow: {
    startMonth: 'Sep',
    startDay: 15,
    endMonth: 'Oct',
    endDay: 10,
    dates: 'Sep 15 – Oct 10',
    status: 'Active',
    label: 'Planting Window',
    progress: 55,
  },
  harvestWindow: {
    startMonth: 'Jan',
    startDay: 10,
    endMonth: 'Feb',
    endDay: 25,
    dates: 'Jan 10 – Feb 25',
    status: 'Upcoming',
    label: 'Harvest Window',
    progress: 0,
  },
  phases: [
    { name: 'Land Preparation', dates: 'Aug 15 – Sep 14', status: 'Completed' },
    { name: 'Planting & Sowing', dates: 'Sep 15 – Oct 10', status: 'Active (Now)' },
    { name: 'Weeding & Fungicide', dates: 'Oct 15 – Nov 20', status: 'Upcoming' },
    { name: 'Bean Podding & Tuber Bulking', dates: 'Nov 25 – Dec 30', status: 'Upcoming' },
    { name: 'Harvest & Post-Harvest', dates: 'Jan 10 – Feb 25', status: 'Upcoming' },
  ],
};

// Initial user profile settings state
export const INITIAL_USER_SETTINGS: UserProfileSettings = {
  fullName: NOW.farmerFullName,
  phone: '+250 788 123 412',
  email: 'j.ndayisaba@musanzecoop.rw',
  preferredLanguage: 'Kinyarwanda',
  district: 'Musanze',
  sector: 'Kinigi',
  cell: 'Bisoke',
  farmSizeHa: 1.8,
  cropsGrown: ['Irish Potato', 'Climbing Beans', 'Maize'],
  cooperative: 'Musanze Potato Growers Cooperative',
  alertChannel: 'SMS',
  isSmsStopped: false,
  notifyEarlyWarnings: true,
  notifyCropAdvisories: true,
  notifyCalendarReminders: true,
  notifyCoopMessages: true,
  messageLanguage: 'Kinyarwanda',
};

// All 30 Districts of Rwanda
export const ALL_30_RWANDA_DISTRICTS = [
  'Musanze',
  'Burera',
  'Gicumbi',
  'Rulindo',
  'Gakenke',
  'Rubavu',
  'Nyabihu',
  'Rutsiro',
  'Karongi',
  'Ngororero',
  'Nyamasheke',
  'Rusizi',
  'Nyarugenge',
  'Gasabo',
  'Kicukiro',
  'Huye',
  'Gisagara',
  'Nyanza',
  'Ruhango',
  'Muhanga',
  'Kamonyi',
  'Nyamagabe',
  'Nyaruguru',
  'Nyagatare',
  'Gatsibo',
  'Kayonza',
  'Rwamagana',
  'Bugesera',
  'Ngoma',
  'Kirehe',
];

// Musanze sectors to cells mapping
export const MUSANZE_SECTORS_CELLS: Record<string, string[]> = {
  Kinigi: ['Bisoke', 'Kaguhu', 'Nyabigoma', 'Susa', 'Kampanga'],
  Muhoza: ['Kigombe', 'Cyivugiza', 'Mpenge', 'Ruhengeri'],
  Busogo: ['Gisesero', 'Sahara', 'Nyagisozi', 'Rwinzovu'],
  Remera: ['Murama', 'Gasiza', 'Ruvumu', 'Murambi'],
  Cyuve: ['Bukinanyana', 'Kabeza', 'Rwebeya', 'Kyenjojo'],
  Gacaca: ['Karwasa', 'Gakoro', 'Gasiza'],
  Gashaki: ['Kigabiro', 'Ndurumo', 'Rubindi'],
  Gataraga: ['Rubindi', 'Murambi', 'Rukore'],
  Kimonyi: ['Birira', 'Buruba', 'Kivumu'],
  Muko: ['Cyogo', 'Mbugangari', 'Songa'],
  Musanze: ['Garuka', 'Kabaya', 'Nyamagumba', 'Rwambogo'],
  Nkotsi: ['Bikara', 'Gashinga', 'Rwamiko'],
  Nyange: ['Kanyiranyenze', 'Ninda', 'Muhabura'],
  Rwaza: ['Bumara', 'Kabere', 'Nturo'],
  Shingiro: ['Basumba', 'Gakingo', 'Kibari', 'Mugari'],
};

export const RWANDA_DISTRICTS: DistrictData[] = [
  // NORTHERN PROVINCE
  {
    id: 'musanze',
    name: 'Musanze',
    province: 'Northern Province',
    risk: 'Watch',
    temp: '22°C',
    humidity: '78%',
    rainfall24h: 48,
    soilSaturation: 78,
    totalSectors: 15,
    affectedSectorsCount: 4,
    affectedSectorsList: ['Muhoza', 'Kinigi', 'Busogo', 'Remera'],
    isUserDistrict: true,
    svgPath: 'M 185,115 L 235,100 L 260,135 L 245,175 L 195,185 L 175,150 Z',
    labelCoord: { x: 215, y: 145 },
  },
  {
    id: 'burera',
    name: 'Burera',
    province: 'Northern Province',
    risk: 'High',
    temp: '20°C',
    humidity: '82%',
    rainfall24h: 52,
    soilSaturation: 84,
    totalSectors: 17,
    affectedSectorsCount: 7,
    affectedSectorsList: ['Rugarama', 'Cyanika', 'Kagogo', 'Nemba', 'Gitovu', 'Bungwe', 'Cyeru'],
    isUserDistrict: false,
    svgPath: 'M 235,100 L 305,80 L 325,120 L 290,150 L 260,135 Z',
    labelCoord: { x: 275, y: 115 },
  },
  {
    id: 'gakenke',
    name: 'Gakenke',
    province: 'Northern Province',
    risk: 'Watch',
    temp: '22°C',
    humidity: '76%',
    rainfall24h: 38,
    soilSaturation: 71,
    totalSectors: 19,
    affectedSectorsCount: 5,
    affectedSectorsList: ['Nemba', 'Busengo', 'Janja', 'Rushashi', 'Muzo'],
    isUserDistrict: false,
    svgPath: 'M 195,185 L 245,175 L 255,225 L 205,245 L 175,215 Z',
    labelCoord: { x: 215, y: 210 },
  },
  {
    id: 'rulindo',
    name: 'Rulindo',
    province: 'Northern Province',
    risk: 'Watch',
    temp: '22°C',
    humidity: '76%',
    rainfall24h: 35,
    soilSaturation: 69,
    totalSectors: 17,
    affectedSectorsCount: 3,
    affectedSectorsList: ['Bushoki', 'Buyoga', 'Ntarabana'],
    isUserDistrict: false,
    svgPath: 'M 255,160 L 310,150 L 315,215 L 255,225 Z',
    labelCoord: { x: 285, y: 185 },
  },
  {
    id: 'gicumbi',
    name: 'Gicumbi',
    province: 'Northern Province',
    risk: 'Low',
    temp: '21°C',
    humidity: '70%',
    rainfall24h: 18,
    soilSaturation: 62,
    totalSectors: 21,
    affectedSectorsCount: 1,
    affectedSectorsList: ['Byumba'],
    isUserDistrict: false,
    svgPath: 'M 305,80 L 375,90 L 370,165 L 310,150 L 325,120 Z',
    labelCoord: { x: 340, y: 125 },
  },

  // WESTERN PROVINCE
  {
    id: 'rubavu',
    name: 'Rubavu',
    province: 'Western Province',
    risk: 'Low',
    temp: '24°C',
    humidity: '72%',
    rainfall24h: 16,
    soilSaturation: 58,
    totalSectors: 12,
    affectedSectorsCount: 1,
    affectedSectorsList: ['Gisenyi'],
    isUserDistrict: false,
    svgPath: 'M 130,125 L 185,115 L 175,150 L 140,170 L 120,150 Z',
    labelCoord: { x: 150, y: 140 },
  },
  {
    id: 'nyabihu',
    name: 'Nyabihu',
    province: 'Western Province',
    risk: 'Watch',
    temp: '21°C',
    humidity: '80%',
    rainfall24h: 42,
    soilSaturation: 79,
    totalSectors: 12,
    affectedSectorsCount: 3,
    affectedSectorsList: ['Bigogwe', 'Jenda', 'Mukamira'],
    isUserDistrict: false,
    svgPath: 'M 140,170 L 175,150 L 195,185 L 175,215 L 135,210 Z',
    labelCoord: { x: 165, y: 185 },
  },
  {
    id: 'rutsiro',
    name: 'Rutsiro',
    province: 'Western Province',
    risk: 'Watch',
    temp: '22°C',
    humidity: '77%',
    rainfall24h: 31,
    soilSaturation: 70,
    totalSectors: 13,
    affectedSectorsCount: 2,
    affectedSectorsList: ['Gihango', 'Kivumu'],
    isUserDistrict: false,
    svgPath: 'M 115,200 L 175,215 L 165,270 L 105,255 Z',
    labelCoord: { x: 140, y: 235 },
  },
  {
    id: 'ngororero',
    name: 'Ngororero',
    province: 'Western Province',
    risk: 'High',
    temp: '22°C',
    humidity: '81%',
    rainfall24h: 44,
    soilSaturation: 82,
    totalSectors: 13,
    affectedSectorsCount: 5,
    affectedSectorsList: ['Muhanda', 'Kabaya', 'Sovu', 'Gatumba', 'Hindiro'],
    isUserDistrict: false,
    svgPath: 'M 175,215 L 215,225 L 210,285 L 165,270 Z',
    labelCoord: { x: 190, y: 250 },
  },
  {
    id: 'karongi',
    name: 'Karongi',
    province: 'Western Province',
    risk: 'Low',
    temp: '24°C',
    humidity: '68%',
    rainfall24h: 14,
    soilSaturation: 59,
    totalSectors: 13,
    affectedSectorsCount: 1,
    affectedSectorsList: ['Rubengera'],
    isUserDistrict: false,
    svgPath: 'M 95,255 L 165,270 L 155,335 L 85,320 Z',
    labelCoord: { x: 125, y: 295 },
  },
  {
    id: 'nyamasheke',
    name: 'Nyamasheke',
    province: 'Western Province',
    risk: 'Low',
    temp: '22°C',
    humidity: '72%',
    rainfall24h: 19,
    soilSaturation: 61,
    totalSectors: 15,
    affectedSectorsCount: 1,
    affectedSectorsList: ['Kagano'],
    isUserDistrict: false,
    svgPath: 'M 75,325 L 145,335 L 130,410 L 65,395 Z',
    labelCoord: { x: 105, y: 365 },
  },
  {
    id: 'rusizi',
    name: 'Rusizi',
    province: 'Western Province',
    risk: 'Low',
    temp: '25°C',
    humidity: '65%',
    rainfall24h: 12,
    soilSaturation: 54,
    totalSectors: 18,
    affectedSectorsCount: 0,
    affectedSectorsList: [],
    isUserDistrict: false,
    svgPath: 'M 55,395 L 130,410 L 115,475 L 45,465 Z',
    labelCoord: { x: 85, y: 435 },
  },

  // KIGALI CITY
  {
    id: 'nyarugenge',
    name: 'Nyarugenge',
    province: 'Kigali City',
    risk: 'Low',
    temp: '26°C',
    humidity: '62%',
    rainfall24h: 8,
    soilSaturation: 51,
    totalSectors: 10,
    affectedSectorsCount: 0,
    affectedSectorsList: [],
    isUserDistrict: false,
    svgPath: 'M 290,250 L 315,240 L 320,270 L 295,275 Z',
    labelCoord: { x: 305, y: 260 },
  },
  {
    id: 'gasabo',
    name: 'Gasabo',
    province: 'Kigali City',
    risk: 'Low',
    temp: '25°C',
    humidity: '64%',
    rainfall24h: 10,
    soilSaturation: 53,
    totalSectors: 15,
    affectedSectorsCount: 1,
    affectedSectorsList: ['Jabana'],
    isUserDistrict: false,
    svgPath: 'M 315,215 L 360,210 L 365,260 L 320,270 L 315,240 Z',
    labelCoord: { x: 338, y: 240 },
  },
  {
    id: 'kicukiro',
    name: 'Kicukiro',
    province: 'Kigali City',
    risk: 'Low',
    temp: '26°C',
    humidity: '63%',
    rainfall24h: 9,
    soilSaturation: 52,
    totalSectors: 10,
    affectedSectorsCount: 0,
    affectedSectorsList: [],
    isUserDistrict: false,
    svgPath: 'M 320,270 L 365,260 L 360,300 L 315,305 Z',
    labelCoord: { x: 340, y: 285 },
  },

  // SOUTHERN PROVINCE
  {
    id: 'kamonyi',
    name: 'Kamonyi',
    province: 'Southern Province',
    risk: 'Low',
    temp: '25°C',
    humidity: '66%',
    rainfall24h: 15,
    soilSaturation: 57,
    totalSectors: 12,
    affectedSectorsCount: 1,
    affectedSectorsList: ['Runda'],
    isUserDistrict: false,
    svgPath: 'M 255,225 L 290,250 L 295,305 L 250,295 Z',
    labelCoord: { x: 270, y: 265 },
  },
  {
    id: 'muhanga',
    name: 'Muhanga',
    province: 'Southern Province',
    risk: 'Watch',
    temp: '22°C',
    humidity: '75%',
    rainfall24h: 32,
    soilSaturation: 68,
    totalSectors: 12,
    affectedSectorsCount: 2,
    affectedSectorsList: ['Cyeza', 'Nyamabuye'],
    isUserDistrict: false,
    svgPath: 'M 210,235 L 255,225 L 250,295 L 205,305 Z',
    labelCoord: { x: 230, y: 265 },
  },
  {
    id: 'ruhango',
    name: 'Ruhango',
    province: 'Southern Province',
    risk: 'Low',
    temp: '24°C',
    humidity: '68%',
    rainfall24h: 16,
    soilSaturation: 59,
    totalSectors: 9,
    affectedSectorsCount: 0,
    affectedSectorsList: [],
    isUserDistrict: false,
    svgPath: 'M 205,305 L 265,295 L 260,350 L 200,355 Z',
    labelCoord: { x: 232, y: 325 },
  },
  {
    id: 'nyanza',
    name: 'Nyanza',
    province: 'Southern Province',
    risk: 'Low',
    temp: '25°C',
    humidity: '64%',
    rainfall24h: 14,
    soilSaturation: 56,
    totalSectors: 10,
    affectedSectorsCount: 0,
    affectedSectorsList: [],
    isUserDistrict: false,
    svgPath: 'M 200,355 L 260,350 L 255,405 L 195,405 Z',
    labelCoord: { x: 228, y: 380 },
  },
  {
    id: 'huye',
    name: 'Huye',
    province: 'Southern Province',
    risk: 'Low',
    temp: '24°C',
    humidity: '67%',
    rainfall24h: 18,
    soilSaturation: 60,
    totalSectors: 14,
    affectedSectorsCount: 1,
    affectedSectorsList: ['Tumba'],
    isUserDistrict: false,
    svgPath: 'M 195,405 L 255,405 L 245,465 L 185,460 Z',
    labelCoord: { x: 220, y: 435 },
  },
  {
    id: 'gisagara',
    name: 'Gisagara',
    province: 'Southern Province',
    risk: 'Low',
    temp: '25°C',
    humidity: '65%',
    rainfall24h: 15,
    soilSaturation: 58,
    totalSectors: 13,
    affectedSectorsCount: 0,
    affectedSectorsList: [],
    isUserDistrict: false,
    svgPath: 'M 245,405 L 295,405 L 285,480 L 240,470 Z',
    labelCoord: { x: 265, y: 440 },
  },
  {
    id: 'nyamagabe',
    name: 'Nyamagabe',
    province: 'Southern Province',
    risk: 'Watch',
    temp: '20°C',
    humidity: '79%',
    rainfall24h: 36,
    soilSaturation: 75,
    totalSectors: 17,
    affectedSectorsCount: 3,
    affectedSectorsList: ['Gasaka', 'Kitabi', 'Tare'],
    isUserDistrict: false,
    svgPath: 'M 145,335 L 205,330 L 195,410 L 130,410 Z',
    labelCoord: { x: 170, y: 370 },
  },
  {
    id: 'nyaruguru',
    name: 'Nyaruguru',
    province: 'Southern Province',
    risk: 'High',
    temp: '19°C',
    humidity: '84%',
    rainfall24h: 46,
    soilSaturation: 83,
    totalSectors: 14,
    affectedSectorsCount: 5,
    affectedSectorsList: ['Kibeho', 'Munini', 'Mata', 'Busanze', 'Nyabimata'],
    isUserDistrict: false,
    svgPath: 'M 130,410 L 185,410 L 175,485 L 115,475 Z',
    labelCoord: { x: 150, y: 445 },
  },

  // EASTERN PROVINCE
  {
    id: 'nyagatare',
    name: 'Nyagatare',
    province: 'Eastern Province',
    risk: 'Low',
    temp: '27°C',
    humidity: '55%',
    rainfall24h: 6,
    soilSaturation: 44,
    totalSectors: 14,
    affectedSectorsCount: 0,
    affectedSectorsList: [],
    isUserDistrict: false,
    svgPath: 'M 375,80 L 475,70 L 490,150 L 415,160 L 370,140 Z',
    labelCoord: { x: 430, y: 110 },
  },
  {
    id: 'gatsibo',
    name: 'Gatsibo',
    province: 'Eastern Province',
    risk: 'Low',
    temp: '26°C',
    humidity: '59%',
    rainfall24h: 9,
    soilSaturation: 48,
    totalSectors: 14,
    affectedSectorsCount: 0,
    affectedSectorsList: [],
    isUserDistrict: false,
    svgPath: 'M 370,140 L 415,160 L 490,150 L 480,225 L 390,215 L 365,185 Z',
    labelCoord: { x: 425, y: 185 },
  },
  {
    id: 'kayonza',
    name: 'Kayonza',
    province: 'Eastern Province',
    risk: 'Low',
    temp: '26°C',
    humidity: '61%',
    rainfall24h: 11,
    soilSaturation: 50,
    totalSectors: 12,
    affectedSectorsCount: 0,
    affectedSectorsList: [],
    isUserDistrict: false,
    svgPath: 'M 390,215 L 480,225 L 530,305 L 430,315 L 380,270 Z',
    labelCoord: { x: 450, y: 265 },
  },
  {
    id: 'rwamagana',
    name: 'Rwamagana',
    province: 'Eastern Province',
    risk: 'Low',
    temp: '25°C',
    humidity: '64%',
    rainfall24h: 12,
    soilSaturation: 52,
    totalSectors: 14,
    affectedSectorsCount: 1,
    affectedSectorsList: ['Muhazi'],
    isUserDistrict: false,
    svgPath: 'M 355,210 L 395,210 L 380,270 L 340,265 Z',
    labelCoord: { x: 368, y: 238 },
  },
  {
    id: 'bugesera',
    name: 'Bugesera',
    province: 'Eastern Province',
    risk: 'Low',
    temp: '27°C',
    humidity: '58%',
    rainfall24h: 7,
    soilSaturation: 46,
    totalSectors: 15,
    affectedSectorsCount: 0,
    affectedSectorsList: [],
    isUserDistrict: false,
    svgPath: 'M 295,305 L 380,290 L 395,385 L 310,380 Z',
    labelCoord: { x: 345, y: 340 },
  },
  {
    id: 'ngoma',
    name: 'Ngoma',
    province: 'Eastern Province',
    risk: 'Low',
    temp: '26°C',
    humidity: '63%',
    rainfall24h: 13,
    soilSaturation: 53,
    totalSectors: 14,
    affectedSectorsCount: 0,
    affectedSectorsList: [],
    isUserDistrict: false,
    svgPath: 'M 380,290 L 435,285 L 440,370 L 385,370 Z',
    labelCoord: { x: 410, y: 330 },
  },
  {
    id: 'kirehe',
    name: 'Kirehe',
    province: 'Eastern Province',
    risk: 'Low',
    temp: '27°C',
    humidity: '56%',
    rainfall24h: 8,
    soilSaturation: 47,
    totalSectors: 12,
    affectedSectorsCount: 0,
    affectedSectorsList: [],
    isUserDistrict: false,
    svgPath: 'M 435,285 L 530,305 L 515,410 L 440,370 Z',
    labelCoord: { x: 475, y: 350 },
  },
];

/**
 * ============================================================================
 * AGRICULTURAL OFFICER DATA MODULE (src/data/musanzeData.ts)
 * District: Musanze
 * Officer: Claudine Mukamana (CM)
 * NOW = Mon 28/09/2026 14:00
 * ============================================================================
 */

export const OFFICER_DATA: OfficerData = {
  profile: {
    initials: 'CM',
    fullName: 'Claudine Mukamana',
    roleTitle: 'Agricultural Officer · Musanze',
    district: 'Musanze',
    bellCount: 3,
  },
  districtRiskLevel: 'Watch',
  activeWarningsCount: 2,
  affectedSectorsCount: 4,
  totalRegisteredFarmers: 4120,
  affectedFarmersTotal: 2050,
  reportsToReviewCount: 3,
  districtFieldReports7Days: 52,
  heroBadge: 'Musanze District · Agricultural Officer',
  heroHeading: 'Good afternoon, Claudine. 2 active warnings across 4 sectors.',
  heroPhoto: officerHeroImg,

  sectorOverviews: [
    // 4 Watch sectors first
    {
      id: 'kinigi',
      name: 'Kinigi',
      risk: 'Watch',
      activeWarningsCount: 2,
      farmersCount: 620,
      reports7Days: 14,
      acknowledgedItems: [
        { label: '78% rain', dotColor: '#D9A032', level: 'Watch' },
        { label: '61% blight', dotColor: '#D9772F', level: 'High' },
      ],
      warnings: [
        { title: 'Heavy Rain Influx', level: 'Watch' },
        { title: 'Late Blight Threat', level: 'High' },
      ],
      recentReports: [
        {
          id: 'rep-k1',
          title: 'Steady overnight rain',
          farmer: 'Jean-Baptiste N.',
          cell: 'Bisoke cell',
          time: '28/09 09:12',
          type: 'Rainfall',
        },
        {
          id: 'rep-k2',
          title: 'Water ponding in potato furrows',
          farmer: 'Jean-Baptiste N.',
          cell: 'Bisoke cell',
          time: '26/09 11:15',
          type: 'Flood / damage',
        },
        {
          id: 'rep-k3',
          title: 'Patchy maize emergence',
          farmer: 'Jean-Baptiste N.',
          cell: 'Bisoke cell',
          time: '24/09 14:20',
          type: 'Crop condition',
        },
        {
          id: 'rep-k4',
          title: 'Aphids on climbing beans',
          farmer: 'Jean-Baptiste N.',
          cell: 'Bisoke cell',
          time: '22/09 09:30',
          type: 'Pest / disease',
        },
        {
          id: 'rep-k5',
          title: 'Terrace soil compaction',
          farmer: 'Faustin K.',
          cell: 'Kaguhu cell',
          time: '21/09 10:15',
          type: 'Crop condition',
        },
        {
          id: 'rep-k6',
          title: 'Silt deposition near road furrow',
          farmer: 'Chantal M.',
          cell: 'Susa cell',
          time: '20/09 16:30',
          type: 'Flood / damage',
        },
      ],
    },
    {
      id: 'busogo',
      name: 'Busogo',
      risk: 'Watch',
      activeWarningsCount: 1,
      farmersCount: 540,
      reports7Days: 9,
      acknowledgedItems: [
        { label: '41% rain', dotColor: '#D9A032', level: 'Watch' },
      ],
      warnings: [
        { title: 'Heavy Rain Influx', level: 'Watch' },
      ],
      recentReports: [
        {
          id: 'rep-b1',
          title: 'Flooded terrace path',
          farmer: 'Marie U.',
          cell: 'Sahara cell',
          time: '28/09 11:40',
          type: 'Flood / damage',
        },
        {
          id: 'rep-b2',
          title: 'Silt runoff near drainage ditch',
          farmer: 'Emmanuel N.',
          cell: 'Gisesero cell',
          time: '26/09 14:10',
          type: 'Flood / damage',
        },
        {
          id: 'rep-b3',
          title: 'Soil saturation in bean plot',
          farmer: 'Patrick T.',
          cell: 'Sahara cell',
          time: '25/09 08:30',
          type: 'Crop condition',
        },
      ],
    },
    {
      id: 'remera',
      name: 'Remera',
      risk: 'Watch',
      activeWarningsCount: 1,
      farmersCount: 480,
      reports7Days: 7,
      acknowledgedItems: [
        { label: '74% rain', dotColor: '#D9A032', level: 'Watch' },
      ],
      warnings: [
        { title: 'Heavy Rain Influx', level: 'Watch' },
      ],
      recentReports: [
        {
          id: 'rep-r1',
          title: 'Terrace contour drainage seepage',
          farmer: 'Alphonse B.',
          cell: 'Murama cell',
          time: '27/09 16:20',
          type: 'Flood / damage',
        },
        {
          id: 'rep-r2',
          title: 'High moisture on potato ridge',
          farmer: 'Diane M.',
          cell: 'Gasiza cell',
          time: '25/09 10:15',
          type: 'Crop condition',
        },
      ],
    },
    {
      id: 'muhoza',
      name: 'Muhoza',
      risk: 'Watch',
      activeWarningsCount: 1,
      farmersCount: 410,
      reports7Days: 8,
      acknowledgedItems: [
        { label: '55% blight', dotColor: '#D9772F', level: 'High' },
      ],
      warnings: [
        { title: 'Late Blight Threat', level: 'High' },
      ],
      recentReports: [
        {
          id: 'rep-m1',
          title: 'Dark spots on potato leaves',
          farmer: 'Eric H.',
          cell: 'Kigombe cell',
          time: '28/09 12:15',
          type: 'Pest / disease',
        },
        {
          id: 'rep-m2',
          title: 'Early blight lesions on lower canopy',
          farmer: 'Valens K.',
          cell: 'Ruhengeri cell',
          time: '27/09 09:00',
          type: 'Pest / disease',
        },
        {
          id: 'rep-m3',
          title: 'Drainage ponding in volcanic depression',
          farmer: 'Alice N.',
          cell: 'Mpenge cell',
          time: '24/09 13:40',
          type: 'Flood / damage',
        },
      ],
    },

    // 11 Low sectors (acknowledged shows "—", farmers sum = 2070, reports sum = 14)
    {
      id: 'cyuve',
      name: 'Cyuve',
      risk: 'Low',
      activeWarningsCount: 0,
      farmersCount: 210,
      reports7Days: 2,
      acknowledgedItems: [],
      warnings: [],
      recentReports: [
        {
          id: 'rep-cy1',
          title: 'Normal germination in maize plot',
          farmer: 'Jean P.',
          cell: 'Bukinanyana cell',
          time: '26/09 15:00',
          type: 'Crop condition',
        },
      ],
    },
    {
      id: 'gacaca',
      name: 'Gacaca',
      risk: 'Low',
      activeWarningsCount: 0,
      farmersCount: 190,
      reports7Days: 1,
      acknowledgedItems: [],
      warnings: [],
      recentReports: [
        {
          id: 'rep-ga1',
          title: 'Optimal field capacity',
          farmer: 'Bernadette K.',
          cell: 'Gakoro cell',
          time: '25/09 11:20',
          type: 'Crop condition',
        },
      ],
    },
    {
      id: 'gashaki',
      name: 'Gashaki',
      risk: 'Low',
      activeWarningsCount: 0,
      farmersCount: 180,
      reports7Days: 1,
      acknowledgedItems: [],
      warnings: [],
      recentReports: [
        {
          id: 'rep-gsh1',
          title: 'Stable lakefront terracing',
          farmer: 'Theogene M.',
          cell: 'Kigabiro cell',
          time: '27/09 14:10',
          type: 'Flood / damage',
        },
      ],
    },
    {
      id: 'gataraga',
      name: 'Gataraga',
      risk: 'Low',
      activeWarningsCount: 0,
      farmersCount: 195,
      reports7Days: 2,
      acknowledgedItems: [],
      warnings: [],
      recentReports: [
        {
          id: 'rep-gat1',
          title: 'Good bean seedling stand',
          farmer: 'Agnes M.',
          cell: 'Rubindi cell',
          time: '26/09 09:40',
          type: 'Crop condition',
        },
      ],
    },
    {
      id: 'kimonyi',
      name: 'Kimonyi',
      risk: 'Low',
      activeWarningsCount: 0,
      farmersCount: 175,
      reports7Days: 1,
      acknowledgedItems: [],
      warnings: [],
      recentReports: [
        {
          id: 'rep-kim1',
          title: 'Soil moisture adequate',
          farmer: 'Innocent B.',
          cell: 'Birira cell',
          time: '27/09 10:30',
          type: 'Rainfall',
        },
      ],
    },
    {
      id: 'muko',
      name: 'Muko',
      risk: 'Low',
      activeWarningsCount: 0,
      farmersCount: 185,
      reports7Days: 1,
      acknowledgedItems: [],
      warnings: [],
      recentReports: [
        {
          id: 'rep-muk1',
          title: 'No water pooling on slopes',
          farmer: 'Sosthene N.',
          cell: 'Songa cell',
          time: '25/09 16:15',
          type: 'Flood / damage',
        },
      ],
    },
    {
      id: 'musanze-sec',
      name: 'Musanze',
      risk: 'Low',
      activeWarningsCount: 0,
      farmersCount: 220,
      reports7Days: 2,
      acknowledgedItems: [],
      warnings: [],
      recentReports: [
        {
          id: 'rep-msz1',
          title: 'Storm channels clear',
          farmer: 'Claire U.',
          cell: 'Garuka cell',
          time: '26/09 13:25',
          type: 'Flood / damage',
        },
      ],
    },
    {
      id: 'nkotsi',
      name: 'Nkotsi',
      risk: 'Low',
      activeWarningsCount: 0,
      farmersCount: 165,
      reports7Days: 1,
      acknowledgedItems: [],
      warnings: [],
      recentReports: [
        {
          id: 'rep-nko1',
          title: 'Low runoff on lower terrace',
          farmer: 'Olivier H.',
          cell: 'Bikara cell',
          time: '24/09 11:00',
          type: 'Flood / damage',
        },
      ],
    },
    {
      id: 'nyange',
      name: 'Nyange',
      risk: 'Low',
      activeWarningsCount: 0,
      farmersCount: 190,
      reports7Days: 1,
      acknowledgedItems: [],
      warnings: [],
      recentReports: [
        {
          id: 'rep-nya1',
          title: 'Erosion bunds holding well',
          farmer: 'Venantie K.',
          cell: 'Ninda cell',
          time: '27/09 08:45',
          type: 'Flood / damage',
        },
      ],
    },
    {
      id: 'rwaza',
      name: 'Rwaza',
      risk: 'Low',
      activeWarningsCount: 0,
      farmersCount: 175,
      reports7Days: 1,
      acknowledgedItems: [],
      warnings: [],
      recentReports: [
        {
          id: 'rep-rwz1',
          title: 'River drainage flowing smoothly',
          farmer: 'Donat M.',
          cell: 'Bumara cell',
          time: '25/09 15:50',
          type: 'Flood / damage',
        },
      ],
    },
    {
      id: 'shingiro',
      name: 'Shingiro',
      risk: 'Low',
      activeWarningsCount: 0,
      farmersCount: 185,
      reports7Days: 1,
      acknowledgedItems: [],
      warnings: [],
      recentReports: [
        {
          id: 'rep-shi1',
          title: 'Rapid infiltration in volcanic cinder',
          farmer: 'Gisele N.',
          cell: 'Mudakama cell',
          time: '26/09 12:10',
          type: 'Rainfall',
        },
      ],
    },
  ],

  needsAttention: [
    {
      id: 'att-1',
      title: 'Busogo: only 41% acknowledged the rain warning',
      actionText: 'Resend by voice call',
      actionType: 'voice_call',
      toastMessage: 'Voice message queued for 318 farmers',
    },
    {
      id: 'att-2',
      title: 'Muhoza: new report of dark spots on potato leaves',
      actionText: 'Review report',
      actionType: 'review_report',
    },
  ],

  warningDeliveries: [
    {
      id: 'warn-del-1',
      level: 'Watch',
      title: 'Heavy Rain Influx',
      area: 'Kinigi, Busogo, Remera',
      sent: 1640,
      delivered: 1602,
      acknowledged: 1061,
      acknowledgedPct: 65,
      unacknowledgedCount: 579,
    },
    {
      id: 'warn-del-2',
      level: 'High',
      title: 'Late Blight Threat',
      area: 'Potato growers in Muhoza & Kinigi',
      sent: 690,
      delivered: 671,
      acknowledged: 402,
      acknowledgedPct: 58,
      unacknowledgedCount: 288,
    },
  ],

  reportsWaitingForReview: [
    {
      id: 'obs-2',
      title: 'Steady overnight rain',
      farmer: 'Jean-Baptiste N.',
      sector: 'Kinigi',
      cell: 'Bisoke cell',
      time: '28/09 09:12',
      type: 'Rainfall',
      description: 'Continuous gentle rain through the night. Soil moisture elevated, but no surface pooling observed.',
    },
    {
      id: 'rev-2',
      title: 'Flooded terrace path',
      farmer: 'Marie U.',
      sector: 'Busogo',
      cell: 'Sahara cell',
      time: '28/09 11:40',
      type: 'Flood / damage',
      description: 'Heavy runoff overflowed primary hillside footpath between terraced plots in Sahara cell.',
    },
    {
      id: 'rev-3',
      title: 'Dark spots on potato leaves',
      farmer: 'Eric H.',
      sector: 'Muhoza',
      cell: 'Kigombe cell',
      time: '28/09 12:15',
      type: 'Pest / disease',
      description: 'Water-soaked brown lesions with faint white mold margin observed on lower potato leaves.',
    },
  ],
};

/**
 * ============================================================================
 * MODULE 6: WARNINGS DATA (Active, History, Threshold Rules, Crop Risk Mapping)
 * ============================================================================
 */

export const INITIAL_WARNINGS: WarningItem[] = [
  {
    id: 'alert-rain',
    title: 'Heavy Rain Influx',
    severity: 'Watch',
    level: 'Watch',
    category: 'Weather · Excess rain',
    riskType: 'Excess rain',
    affectedArea: 'Kinigi, Busogo, Remera',
    area: 'Kinigi, Busogo, Remera',
    sectors: ['Kinigi', 'Busogo', 'Remera'],
    crops: ['Climbing Beans', 'Irish Potato', 'Maize'],
    timeframe: 'Tue 02:00–14:00, peak 48 mm',
    sourceRule: 'Auto-generated · Rule: rain over 40 mm in 24 h',
    recommendedActions: [
      'Clear drainage channels before Tuesday.',
      'Strengthen bean stakes today.',
      'Wait to add fertilizer until the soil drains.',
    ],
    channels: [
      { channel: 'SMS', sent: 1350, delivered: 1320, failed: 30 },
      { channel: 'Voice', sent: 120, delivered: 112, failed: 8 },
      { channel: 'In-app', sent: 170, delivered: 170, failed: 0 },
    ],
    sectorBreakdown: [
      { sector: 'Kinigi', acknowledgedCount: 484, totalCount: 620, percentage: 78 },
      { sector: 'Busogo', acknowledgedCount: 222, totalCount: 540, percentage: 41 },
      { sector: 'Remera', acknowledgedCount: 355, totalCount: 480, percentage: 74 },
    ],
    totalSent: 1640,
    totalDelivered: 1602,
    totalAcknowledged: 1061,
    unacknowledgedCount: 579,
    acknowledgedPct: 65,
    confirmedByReports: true,
    issuedAt: '28/09 13:40',
    timestamp: '13:35 (25 min ago)',
    status: 'Active',
    messageEn: 'Excessive rain forecasted: 48 mm peak expected on Tuesday afternoon. Clear drainage channels and avoid spraying.',
    messageRw: 'Imvura nyinshi iteganyijwe kuwa kabiri. Sukura imiyoboro y amazi kandi wirinde gutera imiti.',
  },
  {
    id: 'alert-blight',
    title: 'Late Blight Threat',
    severity: 'High',
    level: 'High',
    category: 'Crop disease',
    riskType: 'Pest / disease',
    affectedArea: 'Irish Potato plots · Muhoza & Kinigi',
    area: 'Irish Potato plots · Muhoza & Kinigi',
    sectors: ['Kinigi', 'Muhoza'],
    crops: ['Irish Potato'],
    timeframe: 'Next 48–72 hours',
    sourceRule: 'Auto-generated · Rule: humidity 85%+ for 48 h (Irish potato)',
    recommendedActions: [
      'Do not spray before Tuesday 14:00.',
      'Spray on a dry afternoon, Tue to Thu.',
      'Check leaves for dark spots on Wednesday.',
      'Clean your sprayer before use.',
    ],
    channels: [
      { channel: 'SMS', sent: 560, delivered: 545, failed: 15 },
      { channel: 'Voice', sent: 60, delivered: 56, failed: 4 },
      { channel: 'In-app', sent: 70, delivered: 70, failed: 0 },
    ],
    sectorBreakdown: [
      { sector: 'Kinigi', acknowledgedCount: 231, totalCount: 380, percentage: 61 },
      { sector: 'Muhoza', acknowledgedCount: 171, totalCount: 310, percentage: 55 },
    ],
    totalSent: 690,
    totalDelivered: 671,
    totalAcknowledged: 402,
    unacknowledgedCount: 288,
    acknowledgedPct: 58,
    confirmedByReports: true,
    issuedAt: '28/09 13:00',
    timestamp: '13:00 (1h ago)',
    status: 'Active',
    messageEn: 'Late Blight threat high for Irish potato growers in Kinigi & Muhoza. Do not spray before Tuesday 14:00.',
    messageRw: 'Icyorezo cya Kinigi mu birayi kiregereje muri Kinigi na Muhoza. Ntimugaterere imiti mbere ya saa munani z amanywa ku wa kabiri.',
  },
  {
    id: 'alert-wind',
    title: 'Strong Ridge Winds',
    severity: 'Watch',
    level: 'Watch',
    category: 'Weather · Excess rain',
    riskType: 'Excess rain',
    affectedArea: 'Remera',
    area: 'Remera',
    sectors: ['Remera'],
    timeframe: 'Passed 26/09',
    issuedDate: '25/09',
    endedDate: '26/09',
    timestamp: '26/09',
    farmersReached: 480,
    acknowledgedPct: 66,
    confirmedByReports: true,
    sourceRule: 'Wind gust sensor > 45 km/h on volcanic ridge',
    recommendedActions: ['Tie climbing bean trellises', 'Secure nursery shelters'],
    status: 'Expired',
  },
  {
    id: 'alert-runoff',
    title: 'Terrace Runoff',
    severity: 'Watch',
    level: 'Watch',
    category: 'Weather · Excess rain',
    riskType: 'Excess rain',
    affectedArea: 'Kinigi',
    area: 'Kinigi',
    sectors: ['Kinigi'],
    crops: ['Irish Potato', 'Climbing Beans'],
    timeframe: 'Cleared 25/09',
    issuedDate: '24/09',
    endedDate: '25/09',
    timestamp: '25/09',
    farmersReached: 620,
    acknowledgedPct: 71,
    confirmedByReports: true,
    sourceRule: 'Rainfall intensity > 20 mm/hr',
    recommendedActions: ['Deepen diversion ditches', 'Inspect lower slope bunds'],
    status: 'Expired',
  },
  {
    id: 'hist-3',
    title: 'Early-season dry spell',
    severity: 'Watch',
    level: 'Watch',
    category: 'Weather · Dry spell',
    riskType: 'Dry spell',
    affectedArea: 'All sectors',
    area: 'All sectors',
    sectors: ['Kinigi', 'Busogo', 'Remera', 'Muhoza', 'Musanze', 'Cyuve', 'Gataraga', 'Gacaca', 'Nyange', 'Muko', 'Shingiro', 'Gashaki', 'Kimonyi', 'Rwaza', 'Nkotsi'],
    timeframe: '01/09 – 08/09',
    issuedDate: '01/09',
    endedDate: '08/09',
    timestamp: '08/09',
    farmersReached: 4120,
    acknowledgedPct: 52,
    confirmedByReports: false,
    sourceRule: '7+ consecutive dry days post planting onset',
    recommendedActions: ['Mulch exposed potato mounds', 'Hold off unshaded sowing'],
    status: 'Expired',
  },
];

export function isWarningRelevantToFarmer(
  warning: WarningItem,
  farmerSector: string = 'Kinigi',
  farmerCrops: string[] = ['Irish Potato', 'Climbing Beans', 'Maize']
): boolean {
  const matchesSector =
    (warning.sectors &&
      (warning.sectors.includes(farmerSector) ||
        warning.sectors.includes('All sectors') ||
        warning.sectors.length === 15)) ||
    (warning.affectedArea &&
      (warning.affectedArea.toLowerCase().includes(farmerSector.toLowerCase()) ||
        warning.affectedArea.toLowerCase().includes('all sectors')));

  if (!matchesSector) return false;

  if (warning.crops && warning.crops.length > 0) {
    const hasMatchingCrop = warning.crops.some(
      (c: string) => farmerCrops.includes(c) || c === 'All crops'
    );
    if (!hasMatchingCrop) return false;
  }

  return true;
}

export const INITIAL_THRESHOLD_RULES: ThresholdRuleItem[] = [
  {
    id: 'rule-rain',
    name: 'Excess rain (24 h total)',
    hazardType: 'Excess rain',
    isEnabled: true,
    description: 'Triggers multi-channel early warning when forecasted or measured 24 h rainfall breaches thresholds.',
    lastTriggered: '28/09 13:35',
    thresholdsList: [
      { label: '40 mm → Watch', level: 'Watch' },
      { label: '60 mm → High', level: 'High' },
      { label: '80 mm → Critical', level: 'Critical' },
    ],
  },
  {
    id: 'rule-blight',
    name: 'Late blight (Irish potato)',
    hazardType: 'Disease / pest',
    isEnabled: true,
    description: 'Monitors consecutive hours of high humidity and leaf wetness during potato vegetative stage.',
    lastTriggered: '28/09 13:00',
    thresholdsList: [
      { label: 'Humidity 85%+ for 48 h → High', level: 'High' },
    ],
  },
  {
    id: 'rule-dry',
    name: 'Dry spell duration',
    hazardType: 'Dry spell',
    isEnabled: true,
    description: 'Alerts farmers when consecutive dry days threaten newly planted beans or maize emergence.',
    lastTriggered: '01/09',
    thresholdsList: [
      { label: '7+ days under 2 mm → Watch', level: 'Watch' },
    ],
  },
  {
    id: 'rule-temp',
    name: 'Temperature anomaly',
    hazardType: 'Temperature',
    isEnabled: true,
    description: 'Detects extreme heat spikes or cold snaps exceeding historical seasonal standard deviation.',
    lastTriggered: 'Never triggered',
    thresholdsList: [
      { label: '3°C+ above normal → Watch', level: 'Watch' },
    ],
  },
];

export const OFFICER_CROP_RISK_MAP: Record<string, OfficerCropRiskDetail> = {
  'Irish Potato-Excess rain': {
    crop: 'Irish Potato',
    risk: 'Low',
    hazard: 'Excess rain',
    affectedSectors: 'Kinigi, Busogo',
    growersCount: 690,
    linkedWarningTitle: 'Heavy Rain Influx',
    linkedWarningAckPct: 65,
    warningId: 'alert-rain',
  },
  'Irish Potato-Dry spell': {
    crop: 'Irish Potato',
    risk: 'Low',
    hazard: 'Dry spell',
    affectedSectors: 'None (moisture adequate)',
    growersCount: 690,
    linkedWarningTitle: 'None active',
    linkedWarningAckPct: 0,
  },
  'Irish Potato-Temperature': {
    crop: 'Irish Potato',
    risk: 'Low',
    hazard: 'Temperature anomaly',
    affectedSectors: 'None (optimal 15–20°C)',
    growersCount: 690,
    linkedWarningTitle: 'None active',
    linkedWarningAckPct: 0,
  },
  'Irish Potato-Disease / pest': {
    crop: 'Irish Potato',
    risk: 'High',
    hazard: 'Late blight (Phytophthora infestans)',
    affectedSectors: 'Muhoza & Kinigi',
    growersCount: 690,
    linkedWarningTitle: 'Late Blight Threat',
    linkedWarningAckPct: 58,
    warningId: 'alert-blight',
  },

  'Climbing Beans-Excess rain': {
    crop: 'Climbing Beans',
    risk: 'Watch',
    hazard: 'Excess rain & slope runoff',
    affectedSectors: 'Kinigi, Busogo, Remera',
    growersCount: 1640,
    linkedWarningTitle: 'Heavy Rain Influx',
    linkedWarningAckPct: 65,
    warningId: 'alert-rain',
  },
  'Climbing Beans-Dry spell': {
    crop: 'Climbing Beans',
    risk: 'Low',
    hazard: 'Dry spell',
    affectedSectors: 'None',
    growersCount: 1640,
    linkedWarningTitle: 'None active',
    linkedWarningAckPct: 0,
  },
  'Climbing Beans-Temperature': {
    crop: 'Climbing Beans',
    risk: 'Low',
    hazard: 'Temperature anomaly',
    affectedSectors: 'None',
    growersCount: 1640,
    linkedWarningTitle: 'None active',
    linkedWarningAckPct: 0,
  },
  'Climbing Beans-Disease / pest': {
    crop: 'Climbing Beans',
    risk: 'Low',
    hazard: 'Anthracnose & aphid monitoring',
    affectedSectors: 'Kinigi (minor isolated)',
    growersCount: 1640,
    linkedWarningTitle: 'None active',
    linkedWarningAckPct: 0,
  },

  'Maize-Excess rain': {
    crop: 'Maize',
    risk: 'Watch',
    hazard: 'Excess rain & soil saturation',
    affectedSectors: 'Kinigi, Busogo, Remera',
    growersCount: 1640,
    linkedWarningTitle: 'Heavy Rain Influx',
    linkedWarningAckPct: 65,
    warningId: 'alert-rain',
  },
  'Maize-Dry spell': {
    crop: 'Maize',
    risk: 'Low',
    hazard: 'Dry spell',
    affectedSectors: 'None',
    growersCount: 1640,
    linkedWarningTitle: 'None active',
    linkedWarningAckPct: 0,
  },
  'Maize-Temperature': {
    crop: 'Maize',
    risk: 'Low',
    hazard: 'Temperature anomaly',
    affectedSectors: 'None',
    growersCount: 1640,
    linkedWarningTitle: 'None active',
    linkedWarningAckPct: 0,
  },
  'Maize-Disease / pest': {
    crop: 'Maize',
    risk: 'Low',
    hazard: 'Fall armyworm monitoring',
    affectedSectors: 'None',
    growersCount: 1640,
    linkedWarningTitle: 'None active',
    linkedWarningAckPct: 0,
  },
};

export { INITIAL_52_DISTRICT_REPORTS, INITIAL_52_REPORTS } from './districtReportsData';

export const RISK_LEVEL_WEIGHT: Record<RiskLevel, number> = {
  Critical: 4,
  High: 3,
  Watch: 2,
  Low: 1,
};

export const SECTOR_BASE_FORECAST_RISK: Record<string, RiskLevel> = {
  Kinigi: 'Watch',
  Busogo: 'Watch',
  Remera: 'Watch',
  Muhoza: 'Watch', // forecast: basin ponding
  Cyuve: 'Low',
  Gacaca: 'Low',
  Gashaki: 'Low',
  Gataraga: 'Low',
  Kimonyi: 'Low',
  Musanze: 'Low',
  Muko: 'Low',
  Nkotsi: 'Low',
  Nyange: 'Low',
  Rwaza: 'Low',
  Shingiro: 'Low',
};

export function computeSectorClimateRisk(
  sectorName: string,
  activeWarnings: OfficerActiveWarning[]
): RiskLevel {
  // Sector climate risk = the higher of (a) the sector's forecast risk on the Risk Forecast page
  // and (b) active WEATHER warnings covering it.
  const baseForecastRisk: RiskLevel = SECTOR_BASE_FORECAST_RISK[sectorName] || 'Low';

  // Only WEATHER warnings: Excess rain, Dry spell, Temperature
  // Pest / disease warnings do NOT change climate risk
  const weatherWarnings = activeWarnings.filter((w) => {
    if (w.status !== 'Active') return false;
    const isWeather =
      (w.category && w.category.toLowerCase().includes('weather')) ||
      w.riskType === 'Excess rain' ||
      w.riskType === 'Weather · Excess rain' ||
      w.riskType === 'Dry spell' ||
      w.riskType === 'Weather · Dry spell' ||
      w.riskType === 'Temperature' ||
      w.riskType === 'Weather · Temperature' ||
      (!w.riskType && !w.title.toLowerCase().includes('blight') && !w.title.toLowerCase().includes('pest'));
    if (!isWeather) return false;

    return (
      (w.sectors && (w.sectors.includes(sectorName) || w.sectors.length === 15)) ||
      (w.affectedArea && w.affectedArea.toLowerCase().includes('all sectors'))
    );
  });

  let highest: RiskLevel = baseForecastRisk;
  for (const w of weatherWarnings) {
    if (RISK_LEVEL_WEIGHT[w.severity] > RISK_LEVEL_WEIGHT[highest]) {
      highest = w.severity;
    }
  }
  return highest;
}

export function computeDistrictClimateRisk(
  sectors: string[],
  activeWarnings: OfficerActiveWarning[]
): RiskLevel {
  let highest: RiskLevel = 'Low';
  for (const s of sectors) {
    const sRisk = computeSectorClimateRisk(s, activeWarnings);
    if (RISK_LEVEL_WEIGHT[sRisk] > RISK_LEVEL_WEIGHT[highest]) {
      highest = sRisk;
    }
  }
  return highest;
}

// =========================================================================
// COOPERATIVE DATA (Musanze Potato Growers Cooperative · 186 members)
// =========================================================================
export function computeChannelSplit(total: number): { sms: number; voice: number; inApp: number } {
  const sms = Math.round(total * 0.82);
  const voice = Math.round(total * 0.07);
  const inApp = Math.max(0, total - sms - voice);
  return { sms, voice, inApp };
}

export const COOPERATIVE_DATA: {
  cooperativeName: string;
  totalMembers: number;
  leader: {
    name: string;
    roleTitle: string;
    phone: string;
    initials: string;
  };
  groups: {
    id: string;
    name: string;
    sector: string;
    membersCount: number;
    warnings: { id: string; title: string; level: RiskLevel }[];
    acknowledgement: {
      warningTitle: string;
      level: RiskLevel;
      dotColor: string;
      acknowledgedCount: number;
      totalCount: number;
      pct: number;
    }[];
    reports7Days: number;
    unacknowledgedCount: number;
    unacknowledgedMembers: string[];
  }[];
  kpis: {
    members: number;
    underActiveWarnings: number;
    acknowledgedRainWarningPct: number;
    memberReports7d: number;
  };
  actions: {
    id: string;
    description: string;
    buttonLabel: string;
    targetGroup: string;
    prefillMessageEn: string;
    prefillMessageRw: string;
  }[];
} = {
  cooperativeName: 'Musanze Potato Growers Cooperative',
  totalMembers: 186,
  leader: {
    name: 'Aline Uwimana',
    roleTitle: 'Cooperative leader · Musanze Potato Growers',
    phone: '+250 788 000 034',
    initials: 'AU',
  },
  kpis: {
    members: 186,
    underActiveWarnings: 186,
    acknowledgedRainWarningPct: 63,
    memberReports7d: 11,
  },
  groups: [
    {
      id: 'grp-kinigi',
      name: 'Kinigi growers',
      sector: 'Kinigi',
      membersCount: 82,
      warnings: [
        { id: 'alert-rain', title: 'Heavy Rain Influx', level: 'Watch' },
        { id: 'alert-blight', title: 'Late Blight Threat', level: 'Watch' },
      ],
      acknowledgement: [
        {
          warningTitle: 'Heavy Rain Influx',
          level: 'Watch',
          dotColor: '#D9A032',
          acknowledgedCount: 64,
          totalCount: 82,
          pct: 78,
        },
        {
          warningTitle: 'Late Blight Threat',
          level: 'Watch',
          dotColor: '#D9A032',
          acknowledgedCount: 50,
          totalCount: 82,
          pct: 61,
        },
      ],
      reports7Days: 6,
      unacknowledgedCount: 18,
      unacknowledgedMembers: [
        'Emmanuel Habimana (Kaguhu)',
        'Faustin Nzeyimana (Bisoke)',
        'Daphrose Mukamana (Kaguhu)',
        'Callixte Karemera (Nyonirima)',
        'Agnes Uwera (Bisoke)',
        'Venuste Bizimana (Kaguhu)',
        'Speciose Nyiraharerimana (Nyonirima)',
        'Donat Hakizimana (Kaguhu)',
        '+10 other members',
      ],
    },
    {
      id: 'grp-busogo',
      name: 'Busogo growers',
      sector: 'Busogo',
      membersCount: 54,
      warnings: [
        { id: 'alert-rain', title: 'Heavy Rain Influx', level: 'Watch' },
      ],
      acknowledgement: [
        {
          warningTitle: 'Heavy Rain Influx',
          level: 'Watch',
          dotColor: '#D9A032',
          acknowledgedCount: 22,
          totalCount: 54,
          pct: 41,
        },
      ],
      reports7Days: 3,
      unacknowledgedCount: 32,
      unacknowledgedMembers: [
        'Innocent Nshimiyimana (Gisesero)',
        'Valens Munyaneza (Sahara)',
        'Esperance Nyirahabineza (Gisesero)',
        'Jean Damascene Manirakiza (Sahara)',
        'Beatrice Mukakarangwa (Gisesero)',
        '+27 other members',
      ],
    },
    {
      id: 'grp-muhoza',
      name: 'Muhoza growers',
      sector: 'Muhoza',
      membersCount: 50,
      warnings: [
        { id: 'alert-blight', title: 'Late Blight Threat', level: 'Watch' },
      ],
      acknowledgement: [
        {
          warningTitle: 'Late Blight Threat',
          level: 'Watch',
          dotColor: '#D9A032',
          acknowledgedCount: 28,
          totalCount: 50,
          pct: 56,
        },
      ],
      reports7Days: 2,
      unacknowledgedCount: 22,
      unacknowledgedMembers: [
        'Therese Mukamugema (Kigombe)',
        'Theogene Bagirishya (Cyivugiza)',
        'Claudine Uwamahoro (Mpenge)',
        'Aloys Nkurunziza (Kigombe)',
        '+18 other members',
      ],
    },
  ],
  actions: [
    {
      id: 'act-1',
      description: 'Plan one shared spraying schedule after Tuesday 14:00 for Kinigi plots',
      buttonLabel: 'Message Kinigi growers',
      targetGroup: 'Kinigi growers',
      prefillMessageEn:
        'Cooperative advisory: Please plan shared fungicide spraying for Kinigi plots after Tuesday 14:00 once downpour subsides. Check terrace drainage first.',
      prefillMessageRw:
        "Inama ya koperative: Muteganye gutera umuti w'ibirayi nyuma ya kuwa kabiri 14:00 imvura niba ihagaze. Banza usukure imiyoboro y'amazi.",
    },
    {
      id: 'act-2',
      description: 'Collect orders for blight-tolerant seed for Season B by 15/11',
      buttonLabel: 'Message all members',
      targetGroup: 'All groups',
      prefillMessageEn:
        'Musanze Potato Growers: Seed orders for late-blight tolerant varieties for Season B are open until 15/11 at the cooperative warehouse.',
      prefillMessageRw:
        "Koperative y'abahinzi b'ibirayi: Ibyifuzo by'imbuto yihanganira imvura n'imvura y'umwuka birakira kugeza 15/11 mu bubiko bwa koperative.",
    },
  ],
};

export const INITIAL_COOP_MESSAGES = [
  {
    id: 'msg-coop-1',
    senderName: 'Aline Uwimana',
    senderCoop: 'Musanze Potato Growers Cooperative',
    groups: ['All groups (186)'],
    recipientCount: 186,
    deliveredCount: 186,
    channelSplit: { sms: 152, voice: 13, inApp: 21 },
    channels: ['SMS', 'Voice', 'In-app'] as ('SMS' | 'Voice' | 'In-app')[],
    sentAt: '26/09 09:30',
    messageEn: 'Seed potato distribution notice for Season 2026/27 A at Kinigi central store starts tomorrow 08:00.',
    messageRw: "Kugabagaba imbuto y'ibirayi y'igihembwe 2026/27 A mu bubiko bukuru bwa Kinigi biratangira ejo saa mbiri za mugitondo.",
    isDemo: false,
  },
  {
    id: 'msg-coop-2',
    senderName: 'Aline Uwimana',
    senderCoop: 'Musanze Potato Growers Cooperative',
    groups: ['Kinigi growers (82)'],
    recipientCount: 82,
    deliveredCount: 82,
    channelSplit: { sms: 67, voice: 6, inApp: 9 },
    channels: ['SMS', 'Voice', 'In-app'] as ('SMS' | 'Voice' | 'In-app')[],
    sentAt: '24/09 15:00',
    messageEn: 'Terrace drain clearance reminder before high-intensity downpours forecast from Monday.',
    messageRw: "Kwibutsa gusukura imiferege y'amazi ku materasi mbere y'imvura nyinshi iteganyijwe kuwa mbere.",
    isDemo: false,
  },
  {
    id: 'msg-coop-3',
    senderName: 'Aline Uwimana',
    senderCoop: 'Musanze Potato Growers Cooperative',
    groups: ['Busogo & Muhoza growers (104)'],
    recipientCount: 104,
    deliveredCount: 104,
    channelSplit: { sms: 85, voice: 7, inApp: 12 },
    channels: ['SMS', 'Voice', 'In-app'] as ('SMS' | 'Voice' | 'In-app')[],
    sentAt: '21/09 10:15',
    messageEn: 'Fungicide bulk purchasing deadline extended to Wednesday 17:00 at sector collection points.',
    messageRw: "Igihe ntarengwa cyo kugurira hamwe imiti yo gutera cyongerewe kugeza kuwa gatatu 17:00.",
    isDemo: false,
  },
];



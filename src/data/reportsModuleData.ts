import { GeneratedReport, ScheduledReportItem } from '../types';

export const INITIAL_GENERATED_REPORTS: GeneratedReport[] = [
  {
    id: 'rep-lib-1',
    title: 'Weekly district risk summary',
    type: 'District risk summary',
    period: '21–27/09',
    createdBy: 'Claudine M.',
    date: '28/09',
    status: 'Sent',
    sectors: ['All'],
    sections: {
      executiveSummary: true,
      riskBySector: true,
      warnings: true,
      fieldReports: true,
      cropLossEstimate: true,
      engagement: true,
    },
  },
  {
    id: 'rep-lib-2',
    title: 'Season onset report',
    type: 'Seasonal forecast',
    period: '01–08/09',
    createdBy: 'Claudine M.',
    date: '09/09',
    status: 'Sent',
    sectors: ['All'],
    sections: {
      executiveSummary: true,
      riskBySector: true,
      warnings: true,
      fieldReports: true,
      cropLossEstimate: false,
      engagement: true,
    },
  },
  {
    id: 'rep-lib-3',
    title: 'Warning effectiveness, September',
    type: 'Warning effectiveness',
    period: '01–28/09',
    createdBy: 'Claudine M.',
    date: '28/09',
    status: 'Draft',
    sectors: ['All'],
    sections: {
      executiveSummary: true,
      riskBySector: false,
      warnings: true,
      fieldReports: true,
      cropLossEstimate: false,
      engagement: true,
    },
  },
  {
    id: 'rep-lib-4',
    title: 'Heavy Rain Influx situation report',
    type: 'Situation report',
    period: '28/09',
    createdBy: 'Claudine M.',
    date: '28/09',
    status: 'Draft',
    sectors: ['Kinigi', 'Busogo', 'Remera'],
    sections: {
      executiveSummary: true,
      riskBySector: true,
      warnings: true,
      fieldReports: true,
      cropLossEstimate: true,
      engagement: false,
    },
  },
];

export const INITIAL_SCHEDULED_REPORTS: ScheduledReportItem[] = [
  {
    id: 'sched-1',
    title: 'Weekly district risk summary',
    type: 'District risk summary',
    frequency: 'Every Monday 07:00',
    format: 'PDF',
    recipients: [
      { name: 'Director of Agriculture, Musanze District', email: 'agri.dir@musanze.gov.rw' },
      { name: 'RAB Northern Zone', email: 'rab.north@rab.gov.rw' },
    ],
    enabled: true,
  },
  {
    id: 'sched-2',
    title: 'Warning effectiveness',
    type: 'Warning effectiveness',
    frequency: '1st of each month 08:00',
    format: 'PDF + Excel',
    recipients: [
      { name: 'Director of Agriculture, Musanze District', email: 'agri.dir@musanze.gov.rw' },
    ],
    enabled: true,
  },
];

export const DEFAULT_AVAILABLE_RECIPIENTS = [
  { name: 'Director of Agriculture, Musanze District', email: 'agri.dir@musanze.gov.rw' },
  { name: 'RAB Northern Zone', email: 'rab.north@rab.gov.rw' },
  { name: 'Executive Secretary, Musanze District', email: 'es@musanze.gov.rw' },
  { name: 'Kinigi Sector Agronomist', email: 'agri.kinigi@musanze.gov.rw' },
  { name: 'Busogo Sector Agronomist', email: 'agri.busogo@musanze.gov.rw' },
  { name: 'Muhoza Sector Agronomist', email: 'agri.muhoza@musanze.gov.rw' },
];

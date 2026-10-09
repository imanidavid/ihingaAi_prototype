import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  Send,
  Download,
  Check,
  ChevronDown,
  X,
  Printer,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';
import {
  WarningItem,
  ReportItem,
  GeneratedReport,
  ScheduledReportItem,
  GeneratedReportType,
  ReportSectionConfig,
  RiskLevel,
  SectorRegisterEntry,
} from '../types';
import {
  INITIAL_GENERATED_REPORTS,
  INITIAL_SCHEDULED_REPORTS,
} from '../data/reportsModuleData';
import {
  computeSectorClimateRisk,
  computeDistrictClimateRisk,
  registeredFarmers,
  totalRegisteredFarmers,
  reportsInLastDays,
  warningCoversSector,
} from '../data/musanzeData';

interface OfficerReportsViewProps {
  warnings: WarningItem[];
  reports: ReportItem[];
  reportsList?: GeneratedReport[];
  onReportsListChange?: React.Dispatch<React.SetStateAction<GeneratedReport[]>>;
  onShowToast: (message: string) => void;
  /** Report types offered in "New report" (officer/admin: the five district types; researcher: research types). */
  reportTypes?: GeneratedReportType[];
  /** Short name of the signed-in author, e.g. "Claudine M.". */
  authorName?: string;
  /** Each sector's forecast risk (forecast series + threshold rules). */
  forecastRisk: Record<string, RiskLevel>;
  /** Registered farmers per sector (administrator's sector register). */
  sectorRegister: SectorRegisterEntry[];
}

export const DISTRICT_REPORT_TYPES: GeneratedReportType[] = [
  'District risk summary',
  'Seasonal forecast',
  'Warning effectiveness',
  'Farmer engagement',
  'Situation report',
];

// Preset section configurations and descriptions per report type
const REPORT_TYPE_PRESETS: Record<
  GeneratedReportType,
  {
    description: string;
    sections: ReportSectionConfig;
  }
> = {
  'District risk summary': {
    description: 'District risk summary — risk by sector, active warnings, field reports.',
    sections: {
      executiveSummary: true,
      riskBySector: true,
      warnings: true,
      fieldReports: true,
      cropLossEstimate: false,
      engagement: false,
    },
  },
  'Seasonal forecast': {
    description: 'Seasonal forecast — executive summary, risk by sector, crop loss estimate.',
    sections: {
      executiveSummary: true,
      riskBySector: true,
      cropLossEstimate: true,
      warnings: false,
      fieldReports: false,
      engagement: false,
    },
  },
  'Warning effectiveness': {
    description: 'Warning effectiveness — executive summary, warnings, engagement.',
    sections: {
      executiveSummary: true,
      warnings: true,
      engagement: true,
      riskBySector: false,
      fieldReports: false,
      cropLossEstimate: false,
    },
  },
  'Farmer engagement': {
    description: 'Farmer engagement — executive summary, engagement, field reports.',
    sections: {
      executiveSummary: true,
      engagement: true,
      fieldReports: true,
      riskBySector: false,
      warnings: false,
      cropLossEstimate: false,
    },
  },
  'Model validation': {
    description: 'Model validation — executive summary, warnings and whether field reports confirmed them.',
    sections: {
      executiveSummary: true,
      warnings: true,
      fieldReports: true,
      riskBySector: false,
      cropLossEstimate: false,
      engagement: false,
    },
  },
  'Field data summary': {
    description: 'Field data summary — executive summary, risk by sector, field reports (no farmer names).',
    sections: {
      executiveSummary: true,
      riskBySector: true,
      fieldReports: true,
      warnings: false,
      cropLossEstimate: false,
      engagement: false,
    },
  },
  'Situation report': {
    description: 'Situation report — executive summary, warnings, risk by sector, crop loss estimate.',
    sections: {
      executiveSummary: true,
      warnings: true,
      riskBySector: true,
      cropLossEstimate: true,
      fieldReports: false,
      engagement: false,
    },
  },
};

export const OfficerReportsView: React.FC<OfficerReportsViewProps> = ({
  warnings,
  reports,
  reportsList: propsReportsList,
  onReportsListChange,
  onShowToast,
  reportTypes = DISTRICT_REPORT_TYPES,
  authorName = 'Claudine M.',
  forecastRisk,
  sectorRegister,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'library' | 'scheduled'>('overview');
  const [internalReportsList, setInternalReportsList] = useState<GeneratedReport[]>(INITIAL_GENERATED_REPORTS);
  const reportsList = propsReportsList || internalReportsList;
  const setReportsList = onReportsListChange || setInternalReportsList;
  const [scheduledList, setScheduledList] = useState<ScheduledReportItem[]>(INITIAL_SCHEDULED_REPORTS);

  // Modals & Drawers state
  const [previewReport, setPreviewReport] = useState<GeneratedReport | null>(null);
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledReportItem | null>(null);
  const [sendReportTarget, setSendReportTarget] = useState<GeneratedReport | null>(null);

  // -------------------------------------------------------------------------
  // NEW REPORT BUILDER STATE
  // -------------------------------------------------------------------------
  const [newType, setNewType] = useState<GeneratedReportType>(reportTypes[0]);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [newPeriodType, setNewPeriodType] = useState<'season' | 'month' | 'week' | 'custom'>('season');
  const [customStartDate, setCustomStartDate] = useState('21/09/2026');
  const [customEndDate, setCustomEndDate] = useState('28/09/2026');
  const [newSectorsMode, setNewSectorsMode] = useState<'all' | 'selected'>('all');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([
    'Kinigi',
    'Busogo',
    'Remera',
    'Muhoza',
  ]);
  const [newSections, setNewSections] = useState<ReportSectionConfig>(
    REPORT_TYPE_PRESETS['District risk summary'].sections
  );
  const [isCustomizeSectionsOpen, setIsCustomizeSectionsOpen] = useState(false);
  const [reportName, setReportName] = useState('District risk summary · Season 2026/27 A');
  const [isNameManuallyEdited, setIsNameManuallyEdited] = useState(false);

  // Schedule Modal form state
  const [schedType, setSchedType] = useState<GeneratedReportType>('District risk summary');
  const [schedFrequency, setSchedFrequency] = useState('Every Monday 07:00');
  const [schedFormat, setSchedFormat] = useState<'PDF' | 'Excel' | 'PDF + Excel'>('PDF');
  const [schedRecipients, setSchedRecipients] = useState<{ name: string; email: string }[]>([
    { name: 'Director of Agriculture, Musanze District', email: 'agri.dir@musanze.gov.rw' },
  ]);
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientEmail, setNewRecipientEmail] = useState('');

  // Send Modal state
  const [sendRecipients, setSendRecipients] = useState<
    { name: string; email: string; selected: boolean }[]
  >([
    { name: 'Director of Agriculture, Musanze District', email: 'agri.dir@musanze.gov.rw', selected: true },
    { name: 'RAB Northern Zone', email: 'rab.north@rab.gov.rw', selected: true },
    { name: 'Executive Secretary, Musanze District', email: 'es@musanze.gov.rw', selected: false },
  ]);

  // =========================================================================
  // DYNAMIC COMPUTATIONS FROM SHARED STORE
  // =========================================================================
  const allSectorNames = useMemo(() => sectorRegister.map((s) => s.sector), [sectorRegister]);
  const totalFarmers = totalRegisteredFarmers(sectorRegister);
  const reports7Days = useMemo(() => reportsInLastDays(reports), [reports]);
  const activeWarnings = useMemo(() => warnings.filter((w) => w.status === 'Active'), [warnings]);
  const districtRisk = useMemo(
    () => computeDistrictClimateRisk(allSectorNames, activeWarnings, forecastRisk),
    [allSectorNames, activeWarnings, forecastRisk]
  );

  // A warning nobody has acknowledged yet (issued in this demo) is too early to measure.
  // Acknowledgement comes from the delivery records, the same ones the officer dashboard reads.
  const isDemoSessionWarning = (w: WarningItem): boolean => (w.totalAcknowledged ?? 0) === 0;

  // Warnings measurable for acknowledgment (the 5 original warnings with delivery data)
  const measurableWarnings = useMemo(
    () => warnings.filter((w) => !isDemoSessionWarning(w) && w.acknowledgedPct !== undefined),
    [warnings]
  );

  // Average acknowledged = mean of the measurable warnings' bars, computed. With original 5 warnings: 62%
  // (Heavy Rain Influx 65 + Late Blight Threat 58 + Strong Ridge Winds 66 + Terrace Runoff 71 + Early-season dry spell 52) / 5 = 62.4% -> 62%
  const avgAcknowledged = useMemo(() => {
    if (!measurableWarnings.length) return 0;
    const totalPct = measurableWarnings.reduce((acc, w) => acc + (w.acknowledgedPct || 0), 0);
    return Math.round(totalPct / measurableWarnings.length);
  }, [measurableWarnings]);

  const warningsThisSeason = warnings.length; // 5
  const activeFarmersText = `2,890 of ${totalFarmers.toLocaleString()}`;
  const fieldReportsThisSeason = 196;

  // 15 Sectors computed table data
  const sectorRows = useMemo(() => {
    return sectorRegister.map((sec) => ({
      name: sec.sector,
      risk: computeSectorClimateRisk(sec.sector, activeWarnings, forecastRisk),
      activeWarningsCount: activeWarnings.filter((w) => warningCoversSector(w, sec.sector)).length,
      reportsCount: reports7Days.filter((r) => r.sector === sec.sector).length,
      farmersCount: sec.farmers,
    }));
  }, [sectorRegister, activeWarnings, reports7Days, forecastRisk]);

  // Dynamic Executive Summary 3 sentences (updates if store changes)
  const dynamicExecutiveSummary = useMemo(() => {
    // Sentence 1: Musanze is at [districtRisk] level.
    const sentence1 = `Musanze is at ${districtRisk} level.`;

    // Sentence 2: [N] warnings are active, covering [X] of 15 sectors and [Y] farmers.
    const activeCount = activeWarnings.length;
    const coveredSectorsSet = new Set<string>();
    activeWarnings.forEach((w) => {
      if (w.sectors && (w.sectors.includes('All sectors') || w.sectors.length === 15)) {
        allSectorNames.forEach((s) => coveredSectorsSet.add(s));
      } else if (w.sectors) {
        w.sectors.forEach((s) => coveredSectorsSet.add(s));
      }
    });

    const sectorsCoveredCount = coveredSectorsSet.size;
    const farmersCovered = Array.from(coveredSectorsSet).reduce(
      (acc, s) => acc + registeredFarmers(sectorRegister, s),
      0
    );

    const sentence2 =
      activeCount > 0
        ? `${activeCount} ${activeCount === 1 ? 'warning is' : 'warnings are'} active, covering ${sectorsCoveredCount} of ${
            allSectorNames.length
          } sectors and ${farmersCovered.toLocaleString()} farmers.`
        : 'No warnings are currently active across the district.';

    // Sentence 3: Busogo has the lowest response to the Heavy Rain Influx warning at 41%.
    let sentence3 = '';
    if (activeWarnings.length > 0) {
      let lowestPct = 999;
      let lowestSector = '';
      let lowestWarningTitle = '';

      activeWarnings.filter((w) => !isDemoSessionWarning(w)).forEach((w) => {
        w.sectorBreakdown?.forEach((sb) => {
          if (sb.percentage < lowestPct) {
            lowestPct = sb.percentage;
            lowestSector = sb.sector;
            lowestWarningTitle = w.title;
          }
        });
      });

      if (lowestSector && lowestPct < 999) {
        sentence3 = `${lowestSector} has the lowest response to the ${lowestWarningTitle} warning at ${lowestPct}%.`;
      }
    }

    return [sentence1, sentence2, sentence3].filter(Boolean).join(' ');
  }, [districtRisk, activeWarnings, allSectorNames, sectorRegister]);

  // Compute period text for new report builder
  const getPeriodLabel = (pType: 'season' | 'month' | 'week' | 'custom'): string => {
    switch (pType) {
      case 'season':
        return 'Season 2026/27 A';
      case 'month':
        return 'This month (01–28/09)';
      case 'week':
        return 'Last 7 days (21–28/09)';
      case 'custom':
        return `${customStartDate} – ${customEndDate}`;
    }
  };

  // When report type changes, preset sections and update report name
  const handleSelectReportType = (selectedType: GeneratedReportType) => {
    setNewType(selectedType);
    setIsTypeDropdownOpen(false);

    // Preset the sections for this report type
    const presetConfig = REPORT_TYPE_PRESETS[selectedType];
    setNewSections({ ...presetConfig.sections });

    // Update auto-filled name if user hasn't manually edited it
    if (!isNameManuallyEdited) {
      const periodLabel = getPeriodLabel(newPeriodType);
      setReportName(`${selectedType} · ${periodLabel}`);
    }
  };

  const handlePeriodChange = (pType: 'season' | 'month' | 'week' | 'custom') => {
    setNewPeriodType(pType);
    if (!isNameManuallyEdited) {
      const periodLabel = getPeriodLabel(pType);
      setReportName(`${newType} · ${periodLabel}`);
    }
  };

  // Section count for builder summary line
  const activeSectionCount = useMemo(() => {
    return Object.values(newSections).filter(Boolean).length;
  }, [newSections]);

  const sectorsSummaryText = useMemo(() => {
    if (newSectorsMode === 'all') return 'all 15 sectors';
    return `${selectedSectors.length} selected sectors`;
  }, [newSectorsMode, selectedSectors]);

  // =========================================================================
  // ACTIONS: CSV EXPORT
  // =========================================================================
  const handleDownloadCsv = (report: GeneratedReport) => {
    const lines: string[] = [];

    // Header
    lines.push(`"IHINGA AI — Musanze District report"`);
    lines.push(`"Report title","${report.title}"`);
    lines.push(`"Report type","${report.type}"`);
    lines.push(`"Period","${report.period}"`);
    lines.push(`"Created by","${report.createdBy}"`);
    lines.push(`"Generated date","${report.date}"`);
    lines.push(`"Status","${report.status}"`);
    lines.push(``);

    // Executive summary (sentence case)
    if (report.sections.executiveSummary) {
      lines.push(`"Executive summary"`);
      lines.push(`"${dynamicExecutiveSummary.replace(/"/g, '""')}"`);
      lines.push(``);
    }

    // Risk by sector (sentence case)
    if (report.sections.riskBySector) {
      lines.push(`"Risk by sector (${sectorRows.length} sectors)"`);
      lines.push(`"Sector","Climate risk","Active warnings","Field reports (7d)","Registered farmers"`);
      sectorRows.forEach((r) => {
        lines.push(`"${r.name}","${r.risk}","${r.activeWarningsCount}","${r.reportsCount}","${r.farmersCount}"`);
      });
      lines.push(``);
    }

    // Warnings (sentence case)
    if (report.sections.warnings) {
      lines.push(`"Warnings summary"`);
      lines.push(`"Warning","Severity","Status","Category","Acknowledged %","Farmers reached","Timeframe"`);
      warnings.forEach((w) => {
        lines.push(
          `"${w.title}","${w.severity}","${w.status}","${w.category || w.riskType}","${w.acknowledgedPct || 0}%","${w.farmersReached || 0}","${w.timeframe}"`
        );
      });
      lines.push(``);
    }

    // Field reports (sentence case)
    if (report.sections.fieldReports) {
      lines.push(`"Field reports summary (last 7 days)"`);
      lines.push(`"Report type","Count"`);
      const countsByType: Record<string, number> = {
        Rainfall: reports.filter((r) => r.type === 'Rainfall').length,
        'Flood / damage': reports.filter((r) => r.type === 'Flood / damage').length,
        'Crop condition': reports.filter((r) => r.type === 'Crop condition').length,
        'Pest / disease': reports.filter((r) => r.type === 'Pest / disease').length,
      };
      Object.entries(countsByType).forEach(([t, count]) => {
        lines.push(`"${t}","${count}"`);
      });
      lines.push(`"Total 7-day reports","${reports7Days.length}"`);
      lines.push(`"Total season reports","196"`);
      lines.push(``);
    }

    // Crop loss estimate (sentence case)
    if (report.sections.cropLossEstimate) {
      lines.push(`"Crop loss estimate (prototype illustration)"`);
      lines.push(`"Crop","Area at risk","Risk level","Estimated yield loss if untreated","Note"`);
      lines.push(`"Irish potato","210 ha","High (late-blight)","10–25%","Kinigi, Muhoza"`);
      lines.push(`"Climbing beans","180 ha","Watch","Root damage prevention","Volcanic terraces"`);
      lines.push(`"Maize","150 ha","Watch","Furrow ponding mitigation","Contour channels"`);
      lines.push(``);
    }

    // Engagement (sentence case)
    if (report.sections.engagement) {
      lines.push(`"Farmer engagement"`);
      lines.push(`"Metric","Value"`);
      lines.push(`"Total registered farmers in Musanze","${totalFarmers.toLocaleString()}"`);
      lines.push(`"Active farmers (last 30 days)","2,890 (70%)"`);
      lines.push(`"Weekly active farmers W1","1,980"`);
      lines.push(`"Weekly active farmers W2","2,310"`);
      lines.push(`"Weekly active farmers W3","2,640"`);
      lines.push(`"Weekly active farmers W4","2,890"`);
      lines.push(`"Delivery channel: SMS","82%"`);
      lines.push(`"Delivery channel: In-app","11%"`);
      lines.push(`"Delivery channel: Voice","7%"`);
    }

    const csvContent = lines.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = report.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.href = url;
    link.setAttribute('download', `${safeTitle}-2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast(`Downloaded ${report.title}.csv`);
  };

  // =========================================================================
  // ACTIONS: PDF PRINT EXPORT
  // =========================================================================
  const handlePrintPdf = (report: GeneratedReport) => {
    setPreviewReport(report);
    setTimeout(() => {
      window.print();
      onShowToast('Print dialog opened for PDF export');
    }, 200);
  };

  // =========================================================================
  // ACTIONS: SEND REPORT
  // =========================================================================
  const handleOpenSendModal = (report: GeneratedReport) => {
    setSendReportTarget(report);
  };

  const handleConfirmSend = () => {
    if (!sendReportTarget) return;
    const selectedCount = sendRecipients.filter((r) => r.selected).length;

    // Update status to 'Sent' in library
    setReportsList((prev) =>
      prev.map((r) => (r.id === sendReportTarget.id ? { ...r, status: 'Sent' as const } : r))
    );

    if (previewReport && previewReport.id === sendReportTarget.id) {
      setPreviewReport((prev) => (prev ? { ...prev, status: 'Sent' } : null));
    }

    setSendReportTarget(null);
    onShowToast(`Report sent to ${selectedCount} recipients`);
  };

  // =========================================================================
  // ACTIONS: GENERATE NEW REPORT
  // =========================================================================
  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();

    const computedPeriod = getPeriodLabel(newPeriodType);

    const newReport: GeneratedReport = {
      id: `rep-lib-${Date.now()}`,
      title: reportName.trim() || `${newType} · ${computedPeriod}`,
      type: newType,
      period: computedPeriod,
      createdBy: authorName,
      date: '28/09',
      status: 'Draft',
      sectors: newSectorsMode === 'all' ? ['All'] : selectedSectors,
      sections: { ...newSections },
    };

    setReportsList((prev) => [newReport, ...prev]);
    setIsNewReportModalOpen(false);
    setPreviewReport(newReport);
    onShowToast('Report generated as Draft and opened in preview');
  };

  // =========================================================================
  // ACTIONS: SCHEDULE MANAGEMENT
  // =========================================================================
  const handleToggleSchedule = (id: string) => {
    setScheduledList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.enabled;
          onShowToast(`Schedule ${item.title} ${nextState ? 'resumed' : 'paused'}`);
          return { ...item, enabled: nextState };
        }
        return item;
      })
    );
  };

  const handleOpenScheduleModal = (item?: ScheduledReportItem) => {
    if (item) {
      setEditingSchedule(item);
      setSchedType(item.type);
      setSchedFrequency(item.frequency);
      setSchedFormat(item.format);
      setSchedRecipients([...item.recipients]);
    } else {
      setEditingSchedule(null);
      setSchedType('District risk summary');
      setSchedFrequency('Every Monday 07:00');
      setSchedFormat('PDF');
      setSchedRecipients([
        { name: 'Director of Agriculture, Musanze District', email: 'agri.dir@musanze.gov.rw' },
      ]);
    }
    setNewRecipientName('');
    setNewRecipientEmail('');
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchedule) {
      setScheduledList((prev) =>
        prev.map((item) =>
          item.id === editingSchedule.id
            ? {
                ...item,
                type: schedType,
                title: schedType,
                frequency: schedFrequency,
                format: schedFormat,
                recipients: schedRecipients,
              }
            : item
        )
      );
      onShowToast('Schedule updated');
    } else {
      const newSchedule: ScheduledReportItem = {
        id: `sched-${Date.now()}`,
        title: schedType,
        type: schedType,
        frequency: schedFrequency,
        format: schedFormat,
        recipients: schedRecipients,
        enabled: true,
      };
      setScheduledList((prev) => [...prev, newSchedule]);
      onShowToast('Schedule created');
    }
    setIsScheduleModalOpen(false);
  };

  const handleAddRecipientToSchedule = () => {
    if (!newRecipientEmail) return;
    setSchedRecipients((prev) => [
      ...prev,
      { name: newRecipientName || newRecipientEmail.split('@')[0], email: newRecipientEmail },
    ]);
    setNewRecipientName('');
    setNewRecipientEmail('');
  };

  const handleRemoveRecipientFromSchedule = (index: number) => {
    setSchedRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper for status badge styling
  const renderStatusChip = (status: 'Draft' | 'Final' | 'Sent') => {
    switch (status) {
      case 'Sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E4ECDB] text-[#1F4A34] border border-[#1F4A34]/20">
            <CheckCircle2 className="w-3 h-3 text-[#3E8E55]" strokeWidth={2} />
            <span>Sent</span>
          </span>
        );
      case 'Final':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4F6EF] text-[#17271D] border border-[rgba(31,74,52,0.18)]">
            <FileText className="w-3 h-3 text-[#1F4A34]" strokeWidth={1.5} />
            <span>Final</span>
          </span>
        );
      case 'Draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FBFCF8] text-[#5B665E] border border-[rgba(31,74,52,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5B665E]" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* HEADER BAND (No module number) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(31,74,52,0.08)]">
        <div>
          <h1 className="text-[24px] font-semibold text-[#17271D] tracking-tight">Reports</h1>
          <p className="text-[13px] text-[#5B665E] mt-0.5">
            Musanze District · Season 2026/27 A
          </p>
        </div>

        {/* Right: Primary [+ New report] action button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              // Reset builder to default preset
              setNewType('District risk summary');
              setNewSections(REPORT_TYPE_PRESETS['District risk summary'].sections);
              setNewPeriodType('season');
              setReportName('District risk summary · Season 2026/27 A');
              setIsNameManuallyEdited(false);
              setIsCustomizeSectionsOpen(false);
              setIsNewReportModalOpen(true);
            }}
            className="px-4 py-2 rounded-full bg-[#1F4A34] text-white text-[12.5px] font-medium hover:bg-[#2C6343] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New report</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEGMENTED CONTROL: [Overview] [Report library] [Scheduled] */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between">
        <div className="inline-flex p-1 rounded-full bg-[#E4ECDB]/60 border border-[rgba(31,74,52,0.12)]">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
                : 'text-[#5B665E] hover:text-[#17271D]'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
                : 'text-[#5B665E] hover:text-[#17271D]'
            }`}
          >
            <span>Report library</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-semibold ${
                activeTab === 'library'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#1F4A34]/10 text-[#1F4A34]'
              }`}
            >
              {reportsList.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'scheduled'
                ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
                : 'text-[#5B665E] hover:text-[#17271D]'
            }`}
          >
            <span>Scheduled</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-semibold ${
                activeTab === 'scheduled'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#1F4A34]/10 text-[#1F4A34]'
              }`}
            >
              {scheduledList.filter((s) => s.enabled).length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Warnings this season */}
            <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]">
              <span className="text-[12px] font-medium text-[#5B665E] block">
                Warnings this season
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold text-[#17271D] leading-none">
                  {warningsThisSeason}
                </span>
                <span className="text-[11.5px] text-[#5B665E]">
                  ({activeWarnings.length} active)
                </span>
              </div>
              <p className="text-[11.5px] text-[#5B665E] mt-2">
                Across Musanze District
              </p>
            </div>

            {/* KPI 2: Average acknowledged (Clean caption, no "+4% vs last season") */}
            <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]">
              <span className="text-[12px] font-medium text-[#5B665E] block">
                Average acknowledged
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold text-[#17271D] leading-none">
                  {avgAcknowledged}%
                </span>
              </div>
              <p className="text-[11.5px] text-[#5B665E] mt-2">
                Farmers who confirmed receiving warnings
              </p>
            </div>

            {/* KPI 3: Active farmers, last 30 days */}
            <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]">
              <span className="text-[12px] font-medium text-[#5B665E] block">
                Active farmers, last 30 days
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold text-[#17271D] leading-none">
                  {activeFarmersText}
                </span>
              </div>
              <p className="text-[11.5px] text-[#3E8E55] font-medium mt-2">
                70% registered engagement
              </p>
            </div>

            {/* KPI 4: Field reports this season (Caption: "52 in the last 7 days") */}
            <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]">
              <span className="text-[12px] font-medium text-[#5B665E] block">
                Field reports this season
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold text-[#17271D] leading-none">
                  {fieldReportsThisSeason}
                </span>
              </div>
              <p className="text-[11.5px] text-[#5B665E] mt-2">
                {reports7Days.length} in the last 7 days
              </p>
            </div>
          </div>

          {/* Row 2: Warning Effectiveness (2/3) + How farmers receive warnings (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Warning Effectiveness Chart (2/3) */}
            <div className="lg:col-span-8 bg-[#FBFCF8] rounded-[16px] p-5 md:p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.06)]">
                  <div>
                    <h2 className="text-[16px] font-semibold text-[#17271D]">
                      Warning effectiveness
                    </h2>
                    <p className="text-[12px] text-[#5B665E] mt-0.5">
                      Farmer acknowledgment rate by warning · Season 2026/27 A
                    </p>
                  </div>
                  <span className="text-[11.5px] text-[#1F4A34] font-medium bg-[#E4ECDB]/60 px-2.5 py-1 rounded-full border border-[rgba(31,74,52,0.10)]">
                    Target: 60%+
                  </span>
                </div>

                {/* Bars for warnings */}
                <div className="mt-6 space-y-4">
                  {warnings.map((w) => {
                    const isTooEarly = isDemoSessionWarning(w);
                    const pct = w.acknowledgedPct || 50;

                    return (
                      <div key={w.id} className="space-y-1.5">
                        <div className="flex items-baseline justify-between text-[12.5px]">
                          <span className="font-medium text-[#17271D] truncate max-w-[70%]">
                            {w.title}
                          </span>
                          {isTooEarly ? (
                            <span className="text-[11.5px] text-[#5B665E] font-medium">
                              Issued in session
                            </span>
                          ) : (
                            <span className="font-semibold text-[#17271D]">{pct}%</span>
                          )}
                        </div>

                        {/* If issued during demo session without delivery data, muted label "Too early to measure" instead of bar */}
                        {isTooEarly ? (
                          <div className="py-1">
                            <span className="text-[12px] font-medium text-[#5B665E] italic">
                              Too early to measure
                            </span>
                          </div>
                        ) : (
                          <div className="h-2.5 w-full bg-[#F4F6EF] rounded-full overflow-hidden border border-[rgba(31,74,52,0.06)]">
                            <div
                              className="h-full bg-[#3E8E55] rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}

                        {/* "Confirmed by reports" tick on every warning confirmed in history (4 of original 5) */}
                        {w.confirmedByReports && (
                          <div className="flex items-center gap-1 text-[11px] text-[#1F4A34] pt-0.5">
                            <Check className="w-3 h-3 text-[#3E8E55]" strokeWidth={2.5} />
                            <span>Confirmed by reports</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-[rgba(31,74,52,0.06)] flex items-center justify-between text-[11.5px] text-[#5B665E]">
                <span>Acknowledgment measured after 24h window has passed</span>
                <span>Average: {avgAcknowledged}%</span>
              </div>
            </div>

            {/* How farmers receive warnings (1/3) */}
            <div className="lg:col-span-4 bg-[#FBFCF8] rounded-[16px] p-5 md:p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-[#17271D]">
                  How farmers receive warnings
                </h2>
                <p className="text-[12px] text-[#5B665E] mt-0.5">
                  Notification channel distribution across Musanze
                </p>

                <div className="mt-6 space-y-4">
                  {/* SMS: 82% */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="font-medium text-[#17271D]">SMS</span>
                      <span className="font-semibold text-[#17271D]">82%</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#F4F6EF] rounded-full overflow-hidden border border-[rgba(31,74,52,0.06)]">
                      <div className="h-full bg-[#1F4A34] rounded-full" style={{ width: '82%' }} />
                    </div>
                    <span className="text-[11px] text-[#5B665E]">Primary feature phone reach</span>
                  </div>

                  {/* In-app: 11% */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="font-medium text-[#17271D]">In-app</span>
                      <span className="font-semibold text-[#17271D]">11%</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#F4F6EF] rounded-full overflow-hidden border border-[rgba(31,74,52,0.06)]">
                      <div className="h-full bg-[#3E8E55] rounded-full" style={{ width: '11%' }} />
                    </div>
                    <span className="text-[11px] text-[#5B665E]">Smartphones & cooperative leads</span>
                  </div>

                  {/* Voice: 7% */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="font-medium text-[#17271D]">Voice</span>
                      <span className="font-semibold text-[#17271D]">7%</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#F4F6EF] rounded-full overflow-hidden border border-[rgba(31,74,52,0.06)]">
                      <div className="h-full bg-[#D9A032] rounded-full" style={{ width: '7%' }} />
                    </div>
                    <span className="text-[11px] text-[#5B665E]">Urgent voice broadcasts</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-[rgba(31,74,52,0.06)] text-[11.5px] text-[#5B665E]">
                Total registered: {totalFarmers.toLocaleString()} farmers across {allSectorNames.length} sectors
              </div>
            </div>
          </div>

          {/* Row 3: Farmer Engagement (2/3) + Crop loss estimate (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Farmer Engagement Line Chart (2/3) */}
            <div className="lg:col-span-8 bg-[#FBFCF8] rounded-[16px] p-5 md:p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.06)]">
                  <div>
                    <h2 className="text-[16px] font-semibold text-[#17271D]">Farmer engagement</h2>
                    <p className="text-[12px] text-[#5B665E] mt-0.5">
                      Weekly active farmers · September 2026
                    </p>
                  </div>
                  <span className="text-[12px] text-[#1F4A34] font-semibold">
                    W4: 2,890 active
                  </span>
                </div>

                {/* SVG Line / Trend Graphic */}
                <div className="mt-6 relative">
                  <div className="h-44 w-full">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="engagementGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3E8E55" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#3E8E55" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid lines */}
                      <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(31,74,52,0.06)" strokeDasharray="3 3" />
                      <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(31,74,52,0.06)" strokeDasharray="3 3" />
                      <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(31,74,52,0.06)" strokeDasharray="3 3" />

                      {/* Area Fill */}
                      <polygon
                        points="20,105 140,78 260,52 380,24 380,115 20,115"
                        fill="url(#engagementGrad)"
                      />

                      {/* Path Line */}
                      <polyline
                        fill="none"
                        stroke="#1F4A34"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points="20,105 140,78 260,52 380,24"
                      />

                      {/* Dots and Value Labels */}
                      <circle cx="20" cy="105" r="4.5" fill="#1F4A34" stroke="#FBFCF8" strokeWidth="2" />
                      <text x="20" y="93" textAnchor="middle" className="text-[9.5px] font-semibold fill-[#17271D]">1,980</text>

                      <circle cx="140" cy="78" r="4.5" fill="#1F4A34" stroke="#FBFCF8" strokeWidth="2" />
                      <text x="140" y="66" textAnchor="middle" className="text-[9.5px] font-semibold fill-[#17271D]">2,310</text>

                      <circle cx="260" cy="52" r="4.5" fill="#1F4A34" stroke="#FBFCF8" strokeWidth="2" />
                      <text x="260" y="40" textAnchor="middle" className="text-[9.5px] font-semibold fill-[#17271D]">2,640</text>

                      <circle cx="380" cy="24" r="5" fill="#3E8E55" stroke="#FBFCF8" strokeWidth="2" />
                      <text x="380" y="12" textAnchor="middle" className="text-[10px] font-bold fill-[#1F4A34]">2,890</text>
                    </svg>
                  </div>

                  {/* Week Labels */}
                  <div className="flex justify-between text-[11px] text-[#5B665E] pt-2 px-2">
                    <span>W1 (01–07/09)</span>
                    <span>W2 (08–14/09)</span>
                    <span>W3 (15–21/09)</span>
                    <span className="font-semibold text-[#17271D]">W4 (22–28/09)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[rgba(31,74,52,0.06)] text-[11.5px] text-[#5B665E]">
                Growth: +46% active weekly adoption over the last 4 weeks
              </div>
            </div>

            {/* Crop loss estimate (1/3) */}
            <div className="lg:col-span-4 bg-[#FBFCF8] rounded-[16px] p-5 md:p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.06)]">
                  <h2 className="text-[16px] font-semibold text-[#17271D]">Crop loss estimate</h2>
                  <span className="px-2 py-0.5 rounded-md bg-[#F4F6EF] text-[#5B665E] text-[10.5px] font-semibold border border-[rgba(31,74,52,0.12)]">
                    Estimate
                  </span>
                </div>

                <div className="mt-4 space-y-3.5 text-[12.5px]">
                  {/* Irish Potato */}
                  <div className="p-3 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.08)] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#17271D]">Irish potato</span>
                      <span className="text-[11px] font-semibold text-[#C93B3B]">High risk</span>
                    </div>
                    <p className="text-[#5B665E] text-[11.5px] leading-relaxed">
                      210 ha at High late-blight risk (Kinigi, Muhoza) · possible loss if untreated 10–25%
                    </p>
                  </div>

                  {/* Climbing Beans */}
                  <div className="p-3 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.08)] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#17271D]">Climbing beans</span>
                      <span className="text-[11px] font-semibold text-[#9E6905]">Watch</span>
                    </div>
                    <p className="text-[#5B665E] text-[11.5px] leading-relaxed">
                      180 ha at Watch · root lodging and trellis stability in volcanic foothills
                    </p>
                  </div>

                  {/* Maize */}
                  <div className="p-3 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.08)] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#17271D]">Maize</span>
                      <span className="text-[11px] font-semibold text-[#9E6905]">Watch</span>
                    </div>
                    <p className="text-[#5B665E] text-[11.5px] leading-relaxed">
                      150 ha at Watch · furrow standing water in low depression parcels
                    </p>
                  </div>
                </div>
              </div>

              {/* Muted prototype disclaimer line */}
              <div className="mt-4 pt-3 border-t border-[rgba(31,74,52,0.06)] text-[11px] text-[#5B665E] italic">
                Illustrative estimate for the prototype, based on area at risk.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REPORT LIBRARY */}
      {/* ========================================================================= */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="bg-[#FBFCF8] rounded-[16px] border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] overflow-hidden">
            {reportsList.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-[#5B665E] mx-auto opacity-50" />
                <h3 className="text-[16px] font-semibold text-[#17271D]">No reports in the library</h3>
                <p className="text-[12.5px] text-[#5B665E]">
                  Generate a new report or restore defaults to view reports here.
                </p>
                <button
                  onClick={() => setIsNewReportModalOpen(true)}
                  className="mt-2 px-4 py-2 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343] transition-colors"
                >
                  Create report
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12.5px] border-collapse">
                  <thead>
                    <tr className="border-b border-[rgba(31,74,52,0.08)] bg-[#F4F6EF]/60 text-[#5B665E] font-medium">
                      <th className="py-3 px-4">Report</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Created by</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(31,74,52,0.06)] bg-white">
                    {reportsList.map((row) => (
                      <tr key={row.id} className="hover:bg-[#F4F6EF]/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#17271D]">
                          <button
                            onClick={() => setPreviewReport(row)}
                            className="hover:text-[#1F4A34] hover:underline text-left cursor-pointer"
                          >
                            {row.title}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-[#5B665E]">{row.type}</td>
                        <td className="py-3.5 px-4 text-[#17271D]">{row.period}</td>
                        <td className="py-3.5 px-4 text-[#5B665E]">{row.createdBy}</td>
                        <td className="py-3.5 px-4 text-[#5B665E]">{row.date}</td>
                        <td className="py-3.5 px-4">{renderStatusChip(row.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => setPreviewReport(row)}
                              className="px-2.5 py-1 rounded-md text-[11.5px] font-medium text-[#1F4A34] hover:bg-[#E4ECDB]/60 transition-colors cursor-pointer"
                              title="Preview document"
                            >
                              Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrintPdf(row)}
                              className="px-2 py-1 rounded-md text-[11.5px] font-medium text-[#5B665E] hover:text-[#17271D] hover:bg-[#F4F6EF] transition-colors cursor-pointer"
                              title="Print / Save PDF"
                            >
                              PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadCsv(row)}
                              className="px-2 py-1 rounded-md text-[11.5px] font-medium text-[#5B665E] hover:text-[#17271D] hover:bg-[#F4F6EF] transition-colors cursor-pointer"
                              title="Download Excel / CSV"
                            >
                              Excel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenSendModal(row)}
                              className="px-2.5 py-1 rounded-md text-[11.5px] font-medium bg-[#1F4A34] text-white hover:bg-[#2C6343] transition-colors shadow-2xs cursor-pointer ml-1"
                              title="Send to stakeholders"
                            >
                              Send
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SCHEDULED */}
      {/* ========================================================================= */}
      {activeTab === 'scheduled' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <p className="text-[12.5px] text-[#5B665E]">
              Automated district reporting schedules dispatched to government stakeholders
            </p>
            <button
              type="button"
              onClick={() => handleOpenScheduleModal()}
              className="px-3.5 py-1.5 rounded-full bg-white text-[#1F4A34] border border-[#1F4A34]/30 hover:bg-[#F4F6EF] text-[12px] font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule report</span>
            </button>
          </div>

          {scheduledList.length === 0 ? (
            <div className="bg-[#FBFCF8] rounded-[16px] p-12 text-center border border-[rgba(31,74,52,0.10)] space-y-3">
              <Calendar className="w-10 h-10 text-[#5B665E] mx-auto opacity-50" />
              <h3 className="text-[16px] font-semibold text-[#17271D]">No scheduled reports</h3>
              <p className="text-[12.5px] text-[#5B665E]">
                Add an automated reporting schedule to keep regional leaders aligned.
              </p>
              <button
                onClick={() => handleOpenScheduleModal()}
                className="mt-2 px-4 py-2 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343] transition-colors"
              >
                Schedule report
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledList.map((sched) => (
                <div
                  key={sched.id}
                  className="p-5 rounded-[16px] bg-[#FBFCF8] border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-[15px] font-semibold text-[#17271D]">{sched.title}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-[#F4F6EF] text-[#17271D] text-[11px] font-medium border border-[rgba(31,74,52,0.10)]">
                        {sched.format}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#5B665E]">
                      <span className="flex items-center gap-1 font-medium text-[#17271D]">
                        <Clock className="w-3.5 h-3.5 text-[#1F4A34]" />
                        <span>{sched.frequency}</span>
                      </span>
                      <span>·</span>
                      <span>
                        to: {sched.recipients.map((r) => r.name).join('; ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSchedule(sched.id)}
                      className="flex items-center gap-1.5 text-[12px] font-medium text-[#5B665E] hover:text-[#17271D] cursor-pointer"
                      title={sched.enabled ? 'Click to pause schedule' : 'Click to activate schedule'}
                    >
                      {sched.enabled ? (
                        <ToggleRight className="w-6 h-6 text-[#1F4A34]" strokeWidth={2} />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-[#5B665E]" strokeWidth={2} />
                      )}
                      <span className={sched.enabled ? 'text-[#1F4A34] font-semibold' : 'text-[#5B665E]'}>
                        {sched.enabled ? 'Active' : 'Paused'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenScheduleModal(sched)}
                      className="px-3 py-1.5 rounded-full bg-white text-[#17271D] border border-[rgba(31,74,52,0.18)] hover:bg-[#F4F6EF] text-[12px] font-medium transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DOCUMENT PREVIEW MODAL (White page, max-width 800px, Sentence Case Headers) */}
      {/* ========================================================================= */}
      {previewReport && (
        <div
          id="printable-report-backdrop"
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto"
        >
          <div className="max-w-[840px] w-full max-h-[92vh] flex flex-col bg-transparent">
            {/* Modal Controls Bar (hidden during PDF print) */}
            <div className="no-print bg-[#1F4A34] text-white px-5 py-3 rounded-t-2xl flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E4ECDB]" />
                <span className="text-[13px] font-medium truncate max-w-sm">
                  Document preview · {previewReport.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintPdf(previewReport)}
                  className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadCsv(previewReport)}
                  className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenSendModal(previewReport)}
                  className="px-3 py-1.5 rounded-full bg-white text-[#1F4A34] hover:bg-[#E4ECDB] text-[12px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewReport(null)}
                  className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors ml-2 cursor-pointer"
                  title="Close preview"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Document Content Paper */}
            <div
              id="printable-report"
              className="bg-white rounded-b-2xl shadow-xl p-8 md:p-12 overflow-y-auto max-h-[82vh] font-sans text-[#17271D] space-y-8 border-x border-b border-[rgba(31,74,52,0.12)]"
            >
              {/* Report Document Header */}
              <div className="border-b border-[#17271D]/15 pb-6">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#5B665E] mb-2">
                  <span>IHINGA AI · Musanze District</span>
                  <span>{previewReport.period}</span>
                </div>
                <h1 className="text-[26px] font-bold text-[#17271D] tracking-tight leading-tight">
                  {previewReport.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#5B665E] mt-2">
                  <span>Prepared by: {previewReport.createdBy}</span>
                  <span>·</span>
                  <span>Generated: {previewReport.date} 14:00</span>
                  <span>·</span>
                  <span>Status: {previewReport.status}</span>
                </div>
              </div>

              {/* 1. Executive summary (Sentence case) */}
              {previewReport.sections.executiveSummary && (
                <section className="space-y-2">
                  <h2 className="text-[15px] font-semibold text-[#17271D]">
                    Executive summary
                  </h2>
                  <div className="p-4 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.10)]">
                    <p className="text-[13.5px] text-[#17271D] leading-relaxed font-normal">
                      {dynamicExecutiveSummary}
                    </p>
                  </div>
                </section>
              )}

              {/* 2. Risk by sector (Sentence case) */}
              {previewReport.sections.riskBySector && (
                <section className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-[15px] font-semibold text-[#17271D]">
                      Risk by sector
                    </h2>
                    <span className="text-[11.5px] text-[#5B665E]">15 sectors of Musanze</span>
                  </div>

                  <div className="border border-[rgba(31,74,52,0.12)] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[12px] border-collapse">
                      <thead>
                        <tr className="bg-[#F4F6EF] text-[#5B665E] font-semibold border-b border-[rgba(31,74,52,0.10)]">
                          <th className="py-2.5 px-3">Sector</th>
                          <th className="py-2.5 px-3">Climate risk</th>
                          <th className="py-2.5 px-3">Active warnings</th>
                          <th className="py-2.5 px-3">Reports (7d)</th>
                          <th className="py-2.5 px-3 text-right">Farmers</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
                        {sectorRows.map((sec) => (
                          <tr key={sec.name} className="hover:bg-[#F4F6EF]/30">
                            <td className="py-2 px-3 font-semibold text-[#17271D]">{sec.name}</td>
                            <td className="py-2 px-3">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                                  sec.risk === 'Critical'
                                    ? 'bg-[#C93B3B] text-white'
                                    : sec.risk === 'High'
                                    ? 'bg-[#D9772F]/15 text-[#D9772F]'
                                    : sec.risk === 'Watch'
                                    ? 'bg-[#D9A032]/20 text-[#9E6905]'
                                    : 'bg-[#E4ECDB] text-[#1F4A34]'
                                }`}
                              >
                                {sec.risk}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-[#5B665E]">{sec.activeWarningsCount}</td>
                            <td className="py-2 px-3 text-[#5B665E]">{sec.reportsCount}</td>
                            <td className="py-2 px-3 text-right font-medium text-[#17271D]">
                              {sec.farmersCount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* 3. Early warnings (Sentence case) */}
              {previewReport.sections.warnings && (
                <section className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-[15px] font-semibold text-[#17271D]">
                      Early warnings
                    </h2>
                    <span className="text-[11.5px] text-[#5B665E]">Active + history</span>
                  </div>

                  <div className="border border-[rgba(31,74,52,0.12)] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[12px] border-collapse">
                      <thead>
                        <tr className="bg-[#F4F6EF] text-[#5B665E] font-semibold border-b border-[rgba(31,74,52,0.10)]">
                          <th className="py-2.5 px-3">Warning</th>
                          <th className="py-2.5 px-3">Severity</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Area</th>
                          <th className="py-2.5 px-3 text-right">Acknowledged</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
                        {warnings.map((w) => (
                          <tr key={w.id} className="hover:bg-[#F4F6EF]/30">
                            <td className="py-2 px-3 font-semibold text-[#17271D]">{w.title}</td>
                            <td className="py-2 px-3 text-[#5B665E]">{w.severity}</td>
                            <td className="py-2 px-3">
                              <span
                                className={`text-[11px] font-medium ${
                                  w.status === 'Active' ? 'text-[#1F4A34] font-bold' : 'text-[#5B665E]'
                                }`}
                              >
                                {w.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-[#5B665E]">{w.affectedArea}</td>
                            <td className="py-2 px-3 text-right font-medium text-[#17271D]">
                              {isDemoSessionWarning(w) ? 'Too early to measure' : `${w.acknowledgedPct}%`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* 4. Field reports summary (Sentence case) */}
              {previewReport.sections.fieldReports && (
                <section className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-[15px] font-semibold text-[#17271D]">
                      Field reports summary
                    </h2>
                    <span className="text-[11.5px] text-[#5B665E]">{reports7Days.length} reports in last 7 days</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-[#F4F6EF]/80 border border-[rgba(31,74,52,0.08)]">
                      <span className="text-[11px] text-[#5B665E] block">Rainfall</span>
                      <span className="text-[18px] font-bold text-[#17271D]">
                        {reports.filter((r) => r.type === 'Rainfall').length}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F4F6EF]/80 border border-[rgba(31,74,52,0.08)]">
                      <span className="text-[11px] text-[#5B665E] block">Flood / damage</span>
                      <span className="text-[18px] font-bold text-[#17271D]">
                        {reports.filter((r) => r.type === 'Flood / damage').length}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F4F6EF]/80 border border-[rgba(31,74,52,0.08)]">
                      <span className="text-[11px] text-[#5B665E] block">Crop condition</span>
                      <span className="text-[18px] font-bold text-[#17271D]">
                        {reports.filter((r) => r.type === 'Crop condition').length}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F4F6EF]/80 border border-[rgba(31,74,52,0.08)]">
                      <span className="text-[11px] text-[#5B665E] block">Pest / disease</span>
                      <span className="text-[18px] font-bold text-[#17271D]">
                        {reports.filter((r) => r.type === 'Pest / disease').length}
                      </span>
                    </div>
                  </div>
                </section>
              )}

              {/* 5. Crop loss estimate (Sentence case) */}
              {previewReport.sections.cropLossEstimate && (
                <section className="space-y-2">
                  <h2 className="text-[15px] font-semibold text-[#17271D]">
                    Crop loss estimate
                  </h2>
                  <div className="p-4 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.08)] space-y-2 text-[12.5px]">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#C93B3B] mt-1.5 flex-shrink-0" />
                      <p>
                        <strong className="text-[#17271D]">Irish potato:</strong> 210 ha at High late-blight risk (Kinigi, Muhoza) · possible loss if untreated 10–25%.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D9A032] mt-1.5 flex-shrink-0" />
                      <p>
                        <strong className="text-[#17271D]">Climbing beans:</strong> 180 ha at Watch.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D9A032] mt-1.5 flex-shrink-0" />
                      <p>
                        <strong className="text-[#17271D]">Maize:</strong> 150 ha at Watch.
                      </p>
                    </div>
                    <p className="text-[11px] text-[#5B665E] italic pt-1 border-t border-[rgba(31,74,52,0.06)] mt-2">
                      Illustrative estimate for the prototype, based on area at risk.
                    </p>
                  </div>
                </section>
              )}

              {/* 6. Engagement (Sentence case) */}
              {previewReport.sections.engagement && (
                <section className="space-y-2">
                  <h2 className="text-[15px] font-semibold text-[#17271D]">
                    Engagement
                  </h2>
                  <div className="p-4 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.08)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12px]">
                    <div>
                      <span className="text-[#5B665E] block">Active reach (30d)</span>
                      <span className="text-[16px] font-bold text-[#17271D]">{activeFarmersText}</span>
                      <span className="text-[11px] text-[#3E8E55] block">70% response</span>
                    </div>
                    <div>
                      <span className="text-[#5B665E] block">Weekly trend</span>
                      <span className="text-[16px] font-bold text-[#17271D]">W4: 2,890</span>
                      <span className="text-[11px] text-[#5B665E] block">W1 was 1,980 (+46%)</span>
                    </div>
                    <div>
                      <span className="text-[#5B665E] block">Delivery channels</span>
                      <span className="text-[14px] font-bold text-[#17271D]">SMS 82% · App 11%</span>
                      <span className="text-[11px] text-[#5B665E] block">Voice broadcast 7%</span>
                    </div>
                  </div>
                </section>
              )}

              {/* Document Footer */}
              <div className="pt-6 border-t border-[#17271D]/15 flex items-center justify-between text-[11px] text-[#5B665E]">
                <span>IHINGA AI Agricultural Telemetry · Musanze District</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. NEW REPORT BUILDER MODAL */}
      {/* ========================================================================= */}
      {isNewReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FBFCF8] rounded-[20px] max-w-lg w-full border border-[rgba(31,74,52,0.12)] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
              <div>
                <h3 className="text-[17px] font-semibold text-[#17271D]">New report</h3>
                <p className="text-[12px] text-[#5B665E]">
                  Select a report type to automatically configure parameters
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewReportModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F4F6EF] hover:bg-[#E4ECDB] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#5B665E]" />
              </button>
            </div>

            <form onSubmit={handleGenerateReport} className="space-y-4 text-[12.5px]">
              {/* 1. Report Type: Custom Pill Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="font-semibold text-[#17271D] block">Report type</label>

                {/* Custom Pill Dropdown Toggle Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className="w-full py-2.5 px-4 rounded-full bg-white border border-[rgba(31,74,52,0.22)] font-semibold text-[#17271D] flex items-center justify-between shadow-2xs hover:border-[#1F4A34] transition-colors cursor-pointer"
                  >
                    <span>{newType}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#1F4A34] transition-transform duration-200 ${
                        isTypeDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isTypeDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white rounded-2xl border border-[rgba(31,74,52,0.15)] shadow-xl overflow-hidden py-1 divide-y divide-[rgba(31,74,52,0.06)] animate-in fade-in slide-in-from-top-1">
                      {reportTypes.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleSelectReportType(t)}
                          className={`w-full px-4 py-2.5 text-left text-[12.5px] transition-colors flex items-center justify-between cursor-pointer ${
                            newType === t
                              ? 'bg-[#E4ECDB]/60 text-[#1F4A34] font-semibold'
                              : 'text-[#17271D] hover:bg-[#F4F6EF]'
                          }`}
                        >
                          <span>{t}</span>
                          {newType === t && <Check className="w-4 h-4 text-[#1F4A34]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Muted line describing the type and the sections it includes */}
                <p className="text-[12px] text-[#5B665E] pt-0.5">
                  {REPORT_TYPE_PRESETS[newType].description}
                </p>
              </div>

              {/* 2. Report Name: Auto-filled, editable */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#17271D] block">Report name</label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => {
                    setReportName(e.target.value);
                    setIsNameManuallyEdited(true);
                  }}
                  placeholder="e.g. District risk summary · Season 2026/27 A"
                  className="w-full py-2 px-3.5 rounded-xl bg-white border border-[rgba(31,74,52,0.18)] text-[#17271D] text-[12.5px] focus:outline-hidden focus:border-[#1F4A34]"
                  required
                />
              </div>

              {/* 3. Period */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#17271D] block">Period</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['season', 'month', 'week', 'custom'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePeriodChange(p)}
                      className={`py-1.5 px-2 rounded-lg text-center text-[12px] font-medium border transition-colors cursor-pointer ${
                        newPeriodType === p
                          ? 'bg-[#1F4A34] text-white border-[#1F4A34]'
                          : 'bg-white text-[#5B665E] border-[rgba(31,74,52,0.15)] hover:bg-[#F4F6EF]'
                      }`}
                    >
                      {p === 'season' && 'Season'}
                      {p === 'month' && 'This month'}
                      {p === 'week' && 'Last 7 days (21–28/09)'}
                      {p === 'custom' && 'Custom'}
                    </button>
                  ))}
                </div>

                {newPeriodType === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <span className="text-[11px] text-[#5B665E]">Start date (DD/MM/YYYY)</span>
                      <input
                        type="text"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-[rgba(31,74,52,0.18)] text-[12px]"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#5B665E]">End date (DD/MM/YYYY)</span>
                      <input
                        type="text"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-[rgba(31,74,52,0.18)] text-[12px]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Sectors */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#17271D] block">Sectors</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sectorsMode"
                      checked={newSectorsMode === 'all'}
                      onChange={() => setNewSectorsMode('all')}
                      className="text-[#1F4A34] focus:ring-[#1F4A34]"
                    />
                    <span>All sectors (15)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sectorsMode"
                      checked={newSectorsMode === 'selected'}
                      onChange={() => setNewSectorsMode('selected')}
                      className="text-[#1F4A34] focus:ring-[#1F4A34]"
                    />
                    <span>Selected sectors</span>
                  </label>
                </div>

                {newSectorsMode === 'selected' && (
                  <div className="mt-2 p-2.5 rounded-xl bg-white border border-[rgba(31,74,52,0.15)] max-h-32 overflow-y-auto grid grid-cols-2 gap-1.5 text-[11.5px]">
                    {allSectorNames.map((s) => (
                      <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSectors.includes(s)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSectors((prev) => [...prev, s]);
                            } else {
                              setSelectedSectors((prev) => prev.filter((x) => x !== s));
                            }
                          }}
                          className="rounded-sm text-[#1F4A34]"
                        />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Sections: Collapsed under "Customize sections" link */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsCustomizeSectionsOpen(!isCustomizeSectionsOpen)}
                    className="text-[12px] font-medium text-[#1F4A34] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Customize sections</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isCustomizeSectionsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <span className="text-[11.5px] text-[#5B665E]">
                    {activeSectionCount} of 6 included
                  </span>
                </div>

                {isCustomizeSectionsOpen && (
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white border border-[rgba(31,74,52,0.15)] text-[12px] animate-in fade-in duration-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSections.executiveSummary}
                        onChange={(e) =>
                          setNewSections((prev) => ({ ...prev, executiveSummary: e.target.checked }))
                        }
                        className="rounded-sm text-[#1F4A34]"
                      />
                      <span>Executive summary</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSections.riskBySector}
                        onChange={(e) =>
                          setNewSections((prev) => ({ ...prev, riskBySector: e.target.checked }))
                        }
                        className="rounded-sm text-[#1F4A34]"
                      />
                      <span>Risk by sector</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSections.warnings}
                        onChange={(e) =>
                          setNewSections((prev) => ({ ...prev, warnings: e.target.checked }))
                        }
                        className="rounded-sm text-[#1F4A34]"
                      />
                      <span>Warnings</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSections.fieldReports}
                        onChange={(e) =>
                          setNewSections((prev) => ({ ...prev, fieldReports: e.target.checked }))
                        }
                        className="rounded-sm text-[#1F4A34]"
                      />
                      <span>Field reports</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSections.cropLossEstimate}
                        onChange={(e) =>
                          setNewSections((prev) => ({ ...prev, cropLossEstimate: e.target.checked }))
                        }
                        className="rounded-sm text-[#1F4A34]"
                      />
                      <span>Crop loss estimate</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSections.engagement}
                        onChange={(e) =>
                          setNewSections((prev) => ({ ...prev, engagement: e.target.checked }))
                        }
                        className="rounded-sm text-[#1F4A34]"
                      />
                      <span>Engagement</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Summary line above buttons */}
              <div className="pt-2 text-[12px] text-[#5B665E] border-t border-[rgba(31,74,52,0.08)]">
                This report covers {getPeriodLabel(newPeriodType)} · {sectorsSummaryText} ·{' '}
                {activeSectionCount} {activeSectionCount === 1 ? 'section' : 'sections'}.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsNewReportModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-white border border-[rgba(31,74,52,0.18)] text-[#5B665E] hover:text-[#17271D] text-[12px] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343] transition-colors shadow-xs cursor-pointer"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCHEDULE MODAL */}
      {/* ========================================================================= */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FBFCF8] rounded-[20px] max-w-lg w-full border border-[rgba(31,74,52,0.12)] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
              <div>
                <h3 className="text-[17px] font-semibold text-[#17271D]">
                  {editingSchedule ? 'Edit schedule' : 'Schedule report'}
                </h3>
                <p className="text-[12px] text-[#5B665E]">
                  Configure recurring automated delivery to leadership
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F4F6EF] hover:bg-[#E4ECDB] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#5B665E]" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4 text-[12.5px]">
              {/* Report Type */}
              <div className="space-y-1">
                <label className="font-semibold text-[#17271D]">Report type</label>
                <select
                  value={schedType}
                  onChange={(e) => setSchedType(e.target.value as GeneratedReportType)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-[rgba(31,74,52,0.18)] text-[#17271D]"
                >
                  <option value="District risk summary">District risk summary</option>
                  <option value="Seasonal forecast">Seasonal forecast</option>
                  <option value="Warning effectiveness">Warning effectiveness</option>
                  <option value="Farmer engagement">Farmer engagement</option>
                  <option value="Situation report">Situation report</option>
                </select>
              </div>

              {/* Frequency */}
              <div className="space-y-1">
                <label className="font-semibold text-[#17271D]">Frequency, day and time</label>
                <input
                  type="text"
                  value={schedFrequency}
                  onChange={(e) => setSchedFrequency(e.target.value)}
                  placeholder="e.g. Every Monday 07:00, 1st of each month 08:00"
                  className="w-full py-2 px-3 rounded-xl bg-white border border-[rgba(31,74,52,0.18)] text-[#17271D]"
                  required
                />
              </div>

              {/* Format */}
              <div className="space-y-1">
                <label className="font-semibold text-[#17271D]">Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PDF', 'Excel', 'PDF + Excel'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSchedFormat(fmt)}
                      className={`py-1.5 px-2 rounded-lg text-center text-[12px] font-medium border transition-colors cursor-pointer ${
                        schedFormat === fmt
                          ? 'bg-[#1F4A34] text-white border-[#1F4A34]'
                          : 'bg-white text-[#5B665E] border-[rgba(31,74,52,0.15)] hover:bg-[#F4F6EF]'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipients list with add / remove */}
              <div className="space-y-2">
                <label className="font-semibold text-[#17271D]">Recipients</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {schedRecipients.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-white border border-[rgba(31,74,52,0.12)] flex items-center justify-between text-[11.5px]"
                    >
                      <div className="truncate mr-2">
                        <span className="font-semibold text-[#17271D]">{rec.name}</span>
                        <span className="text-[#5B665E] ml-1">({rec.email})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipientFromSchedule(idx)}
                        className="text-[#C93B3B] hover:text-red-700 p-1 cursor-pointer"
                        title="Remove recipient"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Recipient Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Recipient title / name"
                    value={newRecipientName}
                    onChange={(e) => setNewRecipientName(e.target.value)}
                    className="sm:col-span-6 py-1.5 px-2.5 rounded-lg bg-white border border-[rgba(31,74,52,0.18)] text-[11.5px]"
                  />
                  <input
                    type="email"
                    placeholder="email@domain.gov.rw"
                    value={newRecipientEmail}
                    onChange={(e) => setNewRecipientEmail(e.target.value)}
                    className="sm:col-span-4 py-1.5 px-2.5 rounded-lg bg-white border border-[rgba(31,74,52,0.18)] text-[11.5px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddRecipientToSchedule}
                    className="sm:col-span-2 py-1.5 px-2 rounded-lg bg-[#E4ECDB] text-[#1F4A34] text-[11.5px] font-semibold hover:bg-[#d6e2cc] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="pt-3 border-t border-[rgba(31,74,52,0.08)] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-white border border-[rgba(31,74,52,0.18)] text-[#5B665E] hover:text-[#17271D] text-[12px] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343] transition-colors shadow-xs"
                >
                  Save schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEND REPORT MODAL */}
      {/* ========================================================================= */}
      {sendReportTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FBFCF8] rounded-[20px] max-w-md w-full border border-[rgba(31,74,52,0.12)] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
              <div>
                <h3 className="text-[17px] font-semibold text-[#17271D]">Send report</h3>
                <p className="text-[12px] text-[#5B665E] truncate max-w-xs">{sendReportTarget.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSendReportTarget(null)}
                className="w-7 h-7 rounded-full bg-[#F4F6EF] hover:bg-[#E4ECDB] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#5B665E]" />
              </button>
            </div>

            <div className="space-y-2 text-[12.5px]">
              <span className="font-semibold text-[#17271D] block">
                Select recipients (prefilled from schedule)
              </span>
              <div className="space-y-2 bg-white p-3 rounded-xl border border-[rgba(31,74,52,0.12)] max-h-48 overflow-y-auto">
                {sendRecipients.map((rec, idx) => (
                  <label key={idx} className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rec.selected}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSendRecipients((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, selected: checked } : r))
                        );
                      }}
                      className="mt-0.5 rounded-sm text-[#1F4A34] focus:ring-[#1F4A34]"
                    />
                    <div>
                      <div className="font-medium text-[#17271D]">{rec.name}</div>
                      <div className="text-[11px] text-[#5B665E]">{rec.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[rgba(31,74,52,0.08)] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSendReportTarget(null)}
                className="px-4 py-2 rounded-full bg-white border border-[rgba(31,74,52,0.18)] text-[#5B665E] hover:text-[#17271D] text-[12px] font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                className="px-5 py-2 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343] transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

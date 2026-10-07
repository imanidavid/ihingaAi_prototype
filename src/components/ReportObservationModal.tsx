import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  AlertCircle,
  MapPin,
  ChevronDown,
  Calendar,
} from 'lucide-react';
import { ObservationItem } from '../types';
import {
  ALL_30_RWANDA_DISTRICTS,
  MUSANZE_RECORD,
  MUSANZE_SECTORS_CELLS,
  NOW,
} from '../data/musanzeData';

interface ReportObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (report: ObservationItem) => void;
}

export const ReportObservationModal: React.FC<ReportObservationModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [reportType, setReportType] = useState<'rainfall' | 'crop condition' | 'pest' | 'damage'>('rainfall');
  const [district, setDistrict] = useState<string>('Musanze');
  const [sector, setSector] = useState<string>('Kinigi');
  const [cell, setCell] = useState<string>('Bisoke');
  const [usedGps, setUsedGps] = useState<boolean>(false);
  const [displayDate, setDisplayDate] = useState<string>('28/09/2026'); // today is 28/09/2026
  const [selectedDay, setSelectedDay] = useState<number>(28);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleUseMyLocation = () => {
    setDistrict('Musanze');
    setSector('Kinigi');
    setCell('Bisoke');
    setUsedGps(true);
  };

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist);
    setSector('');
    setCell('');
    setUsedGps(false);
  };

  const handleSectorChange = (newSector: string) => {
    setSector(newSector);
    const cells = MUSANZE_SECTORS_CELLS[newSector] || [];
    setCell(cells.length > 0 ? cells[0] : '');
    setUsedGps(false);
  };

  const availableCells = sector
    ? MUSANZE_SECTORS_CELLS[sector] || ['Cell 1', 'Cell 2']
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please provide a brief description of what you observed.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const typeLabelMap: Record<string, ObservationItem['type']> = {
      rainfall: 'Rainfall',
      'crop condition': 'Crop condition',
      pest: 'Pest / disease',
      damage: 'Flood / damage',
    };

    const newReport: ObservationItem = {
      id: `obs-${Date.now()}`,
      farmer: 'Jean-Baptiste N.',
      type: typeLabelMap[reportType] || 'Rainfall',
      title: description.trim().length > 34 ? `${description.trim().slice(0, 34)}...` : description.trim(),
      sector: sector || 'Kinigi',
      cell: cell || 'Bisoke',
      location: `${sector || 'Kinigi'} · ${cell || 'Bisoke'}`,
      date: `${displayDate.slice(0, 5)} 14:00`,
      status: 'Submitted',
      photoUrl: photoPreview || undefined,
      description: description.trim(),
      timeline: [
        { step: 'Submitted', time: `${displayDate.slice(0, 5)} 14:00`, status: 'completed' },
        { step: 'Received by officer', status: 'current' },
        { step: 'Verified', status: 'upcoming' },
      ],
    };

    setIsSubmitting(false);
    onSubmitSuccess(newReport);
    onClose();
    setDescription('');
    setPhotoPreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-[#FBFCF8] rounded-[20px] max-w-lg w-full p-6 shadow-2xl border border-[rgba(31,74,52,0.12)] z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)] mb-4">
          <div>
            <h3 className="text-[18px] font-semibold text-[#17271D]">
              Report farm observation
            </h3>
            <p className="text-[12px] text-[#5B665E]">
              Share ground truth from {district} District to sharpen forecasts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F6EF] border border-[rgba(31,74,52,0.10)] flex items-center justify-center text-[#5B665E] hover:text-[#17271D] hover:bg-[#E4ECDB] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-[#C93B3B]/10 border border-[#C93B3B]/30 rounded-xl flex items-center gap-2 text-[#C93B3B] text-[12px]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Report Type Selector */}
          <div>
            <label className="block text-[13px] text-[#5B665E] mb-1.5">
              Report type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'rainfall', label: 'Rainfall' },
                { id: 'crop condition', label: 'Crop condition' },
                { id: 'pest', label: 'Pest / disease' },
                { id: 'damage', label: 'Flood / damage' },
              ].map((type) => (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => setReportType(type.id as typeof reportType)}
                  className={`py-2 px-2 text-[12px] font-medium rounded-full text-center transition-all cursor-pointer ${
                    reportType === type.id
                      ? 'bg-[#1F4A34] text-white shadow-xs'
                      : 'bg-[#F4F6EF] text-[#5B665E] hover:text-[#17271D] border border-[rgba(31,74,52,0.08)]'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Section Header & Use My Location button */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#5B665E]">
                Field location
              </span>
              <div className="flex items-center gap-2">
                {usedGps && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[11px] font-medium border border-[rgba(31,74,52,0.12)]">
                    GPS: Kinigi, Musanze
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="px-3 py-1 rounded-full bg-white text-[#1F4A34] border border-[rgba(31,74,52,0.20)] text-[11.5px] font-medium hover:bg-[#E4ECDB] transition-all flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                  <span>Use my location</span>
                </button>
              </div>
            </div>

            {/* District, Sector, Cell: 3 identical custom pill dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* District Dropdown */}
              <div>
                <label className="block text-[13px] text-[#5B665E] mb-1">
                  District
                </label>
                <div className="relative">
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full h-11 px-3.5 pr-8 rounded-full bg-white text-[#17271D] text-[13px] border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34] appearance-none cursor-pointer"
                  >
                    {ALL_30_RWANDA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#5B665E] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Sector Dropdown */}
              <div>
                <label className="block text-[13px] text-[#5B665E] mb-1">
                  Sector
                </label>
                <div className="relative">
                  <select
                    value={sector}
                    onChange={(e) => handleSectorChange(e.target.value)}
                    className="w-full h-11 px-3.5 pr-8 rounded-full bg-white text-[#17271D] text-[13px] border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34] appearance-none cursor-pointer"
                  >
                    <option value="">Select sector</option>
                    {MUSANZE_RECORD.allSectors.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#5B665E] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Cell Dropdown (dependent on Sector) */}
              <div>
                <label className="block text-[13px] text-[#5B665E] mb-1">
                  Cell
                </label>
                <div className="relative">
                  <select
                    value={cell}
                    onChange={(e) => setCell(e.target.value)}
                    disabled={!sector}
                    className="w-full h-11 px-3.5 pr-8 rounded-full bg-white text-[#17271D] text-[13px] border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34] appearance-none disabled:opacity-50 cursor-pointer"
                  >
                    <option value="">Select cell</option>
                    {availableCells.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#5B665E] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Observation Date: custom pill field with calendar popover, future dates disabled */}
          <div className="relative">
            <label className="block text-[13px] text-[#5B665E] mb-1">
              Observation date (DD/MM/YYYY)
            </label>
            <button
              type="button"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="w-full h-11 px-4 pr-4 rounded-full bg-white text-[#17271D] text-[13px] border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34] flex items-center justify-between cursor-pointer"
            >
              <span className="font-medium">{displayDate}</span>
              <Calendar className="w-4 h-4 text-[#5B665E]" strokeWidth={1.5} />
            </button>

            {/* Calendar Popover */}
            {isCalendarOpen && (
              <div className="absolute z-30 mt-1.5 p-3 rounded-2xl bg-[#FBFCF8] border border-[rgba(31,74,52,0.16)] shadow-xl w-64 right-0 sm:left-0 animate-in fade-in">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[rgba(31,74,52,0.08)]">
                  <span className="text-[12.5px] font-semibold text-[#17271D]">September 2026</span>
                  <span className="text-[10.5px] text-[#1F4A34] font-medium bg-[#E4ECDB] px-1.5 py-0.5 rounded-full">
                    Today: 28/09
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[#5B665E] mb-1 font-medium">
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                  <span>Su</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Empty slot for Monday (Sep 1, 2026 was Tuesday) */}
                  <span />
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                    const isFuture = day > 28;
                    const isSelected = selectedDay === day;

                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isFuture}
                        onClick={() => {
                          setSelectedDay(day);
                          setDisplayDate(`${String(day).padStart(2, '0')}/09/2026`);
                          setIsCalendarOpen(false);
                        }}
                        className={`w-7 h-7 text-[11px] rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#1F4A34] text-white font-semibold shadow-xs'
                            : isFuture
                            ? 'text-[#5B665E]/30 cursor-not-allowed'
                            : 'text-[#17271D] hover:bg-[#E4ECDB] cursor-pointer'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 pt-1.5 border-t border-[rgba(31,74,52,0.06)] text-[10px] text-[#5B665E] text-center">
                  Future dates disabled (up to 28/09/2026)
                </div>
              </div>
            )}
          </div>

          {/* Photo Attach */}
          <div>
            <label className="block text-[13px] text-[#5B665E] mb-1">
              Attach photo (optional)
            </label>
            <div className="border border-dashed border-[rgba(31,74,52,0.25)] rounded-2xl p-3 bg-[#F4F6EF]/50 text-center hover:bg-[#E4ECDB]/30 transition-colors relative">
              {photoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={photoPreview}
                    alt="Upload preview"
                    className="h-24 w-auto rounded-lg object-cover mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute -top-2 -right-2 bg-[#C93B3B] text-white rounded-full p-1 shadow-sm cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center gap-1">
                  <UploadCloud className="w-6 h-6 text-[#1F4A34]" strokeWidth={1.5} />
                  <span className="text-[12px] font-medium text-[#17271D]">
                    Click to upload crop or soil photo
                  </span>
                  <span className="text-[10px] text-[#5B665E]">PNG, JPG up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] text-[#5B665E] mb-1">
              Description and notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Saturated soil along Kinigi hillside contour terrace; water ponding in Irish potato furrows after early morning rain..."
              className="w-full bg-white text-[#17271D] placeholder-[#5B665E] text-[13px] rounded-2xl p-3.5 border border-[rgba(31,74,52,0.16)] focus:outline-none focus:border-[#1F4A34]"
            />
          </div>

          {/* Buttons: Submit & Cancel */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[rgba(31,74,52,0.08)]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-white text-[#17271D] border border-[rgba(31,74,52,0.20)] text-[13px] font-medium hover:bg-[#F4F6EF] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-full bg-[#1F4A34] text-white text-[13px] font-medium hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? 'Submitting...' : 'Submit observation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { X, Activity, ShieldCheck, CloudRain, Droplets, ArrowUpRight, Compass } from 'lucide-react';
import { RWANDA_SECTORS, RiskSector } from './landingTypes';

interface RiskMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RiskMapModal({ isOpen, onClose }: RiskMapModalProps) {
  const [selectedSector, setSelectedSector] = useState<RiskSector>(RWANDA_SECTORS[0]);

  if (!isOpen) return null;

  return (
    <div
      id="risk-map-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        id="risk-map-container"
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-neutral-950 border border-white/15 rounded-2xl shadow-2xl text-white flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 sticky top-0 bg-neutral-950/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Rwanda Agro-Telemetry Risk Map</h3>
              <p className="text-xs text-white/50">Illustrative data · simulated in this prototype</p>
            </div>
          </div>
          <button
            id="close-risk-map-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sectors list */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">
              Active Regional Telemetry Zones
            </p>
            {RWANDA_SECTORS.map((sector) => {
              const isSelected = sector.id === selectedSector.id;
              return (
                <button
                  key={sector.id}
                  onClick={() => setSelectedSector(sector)}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/10 border-white/40 shadow-inner'
                      : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-white">{sector.name}</span>
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                        sector.precipitationRisk === 'Severe'
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : sector.precipitationRisk === 'Moderate'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {sector.precipitationRisk} Risk
                    </span>
                  </div>
                  <div className="text-xs text-white/50 mt-1 flex justify-between">
                    <span>{sector.province}</span>
                    <span>{sector.cropFocus}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Zone Deep Dive */}
          <div className="lg:col-span-7 bg-white/[0.04] border border-white/10 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h4 className="text-xl font-instrument-serif italic text-white tracking-wide">
                    {selectedSector.name}
                  </h4>
                  <p className="text-xs text-white/60">{selectedSector.province} • {selectedSector.cropFocus}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/50">Active Connected Nodes</span>
                  <p className="text-base font-semibold text-white font-mono">{selectedSector.activeFarmers.toLocaleString()} Farms</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-black/40 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-white/60">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Soil Saturation</span>
                  </div>
                  <div className="text-2xl font-bold font-mono mt-1 text-white">{selectedSector.soilMoisture}%</div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${selectedSector.soilMoisture}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-black/40 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-white/60">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>NDVI Crop Health</span>
                  </div>
                  <div className="text-2xl font-bold font-mono mt-1 text-white">
                    {(selectedSector.ndviHealth * 100).toFixed(0)}%
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${selectedSector.ndviHealth * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-black/40 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-white/60">
                    <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                    <span>Precipitation Outlook</span>
                  </div>
                  <div className="text-lg font-semibold mt-1 text-white">{selectedSector.precipitationRisk} Variance</div>
                  <p className="text-[11px] text-white/40 mt-1">Next 14-day rainfall anomaly scan</p>
                </div>

                <div className="p-3 bg-black/40 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-white/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Micro-Insurance Status</span>
                  </div>
                  <div className="text-sm font-semibold mt-1 text-white">{selectedSector.insuranceStatus}</div>
                  <p className="text-[11px] text-white/40 mt-1">Smart-contract parametric payout ready</p>
                </div>
              </div>

              {/* Telemetry Log */}
              <div className="mt-4 p-3 bg-neutral-900/90 border border-white/10 rounded-lg text-xs font-mono text-white/70">
                <div className="text-[10px] text-white/40 uppercase mb-1">Live Sensor Stream (Edge Node #428)</div>
                <div className="flex justify-between py-0.5">
                  <span className="text-white/50">Spectral Band Analysis:</span>
                  <span className="text-emerald-300">Optimal Chlorophyll Reflectance</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-white/50">Evapotranspiration Index:</span>
                  <span>3.4 mm/day (Within Normal Range)</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/50">Integrated with Rwanda Agriculture and Animal Resources Board (RAB)</span>
              <button
                onClick={onClose}
                className="text-xs bg-white text-black px-4 py-2 rounded-full font-medium flex items-center gap-1.5 hover:bg-neutral-200 transition-colors"
              >
                Close Map Preview
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

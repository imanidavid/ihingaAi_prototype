import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, CloudRain, Droplets, ExternalLink, Info, MapPin, Thermometer } from 'lucide-react';
import { RiskLevel, SectorRainForecast, StationReading, WarningItem } from '../types';
import {
  FORECAST_RISK_DAYS,
  RISK_LEVEL_COLORS,
  computeSectorClimateRisk,
  latestReading,
  weatherWarningsForSector,
} from '../data/musanzeData';
import sectorBoundaries from '../data/musanzeSectorBoundaries.json';
import { CARD_CLASS } from './coop/CoopUi';

/** Bundled boundary file: geoBoundaries gbOpen RWA ADM3, simplified to Musanze's 15 sectors (credited under the map). */
const BOUNDARY_SOURCE_URL = 'https://www.geoboundaries.org/countryDownloads.html';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

const RISK_ORDER: RiskLevel[] = ['Low', 'Watch', 'High', 'Critical'];

const RiskChip: React.FC<{ risk: RiskLevel }> = ({ risk }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#E4ECDB] text-[#17271D] border border-[rgba(31,74,52,0.10)]">
    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RISK_LEVEL_COLORS[risk] }} />
    {risk}
  </span>
);

interface MusanzeRiskMapCardProps {
  warnings: WarningItem[];
  forecastRisk: Record<string, RiskLevel>;
  rainForecasts: SectorRainForecast[];
  stationReadings: StationReading[];
  /** The signed-in farmer's sector; selected first and marked "Your sector". */
  homeSector?: string;
  onViewFullMap?: () => void;
}

export const MusanzeRiskMapCard: React.FC<MusanzeRiskMapCardProps> = ({
  warnings,
  forecastRisk,
  rainForecasts,
  stationReadings,
  homeSector,
  onViewFullMap,
}) => {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const [selected, setSelected] = useState<string>(homeSector || '');
  const [tilesFailed, setTilesFailed] = useState(false);

  const sectorNames = useMemo(
    () => sectorBoundaries.features.map((f) => f.properties.sector),
    []
  );
  const riskBySector = useMemo(() => {
    const out: Record<string, RiskLevel> = {};
    for (const s of sectorNames) out[s] = computeSectorClimateRisk(s, warnings, forecastRisk);
    return out;
  }, [sectorNames, warnings, forecastRisk]);

  // Create the map once; the boundary layer is bundled, so shapes show even when tiles fail.
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, { scrollWheelZoom: false, zoomSnap: 0.25 });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: OSM_ATTRIBUTION,
    })
      .on('tileerror', () => setTilesFailed(true))
      .addTo(map);
    const layer = L.geoJSON(sectorBoundaries as GeoJSON.FeatureCollection, {
      onEachFeature: (feature, l) => {
        const name = feature.properties.sector as string;
        l.bindTooltip(name, { sticky: true, direction: 'top' });
        l.on('click', () => setSelected(name));
      },
    }).addTo(map);
    const bounds = layer.getBounds();
    map.fitBounds(bounds, { padding: [8, 8] });
    mapRef.current = map;
    layerRef.current = layer;
    // The card can be sized after first paint (grid layout, hidden tab); refit so all 15 sectors stay in view.
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [8, 8] });
    });
    observer.observe(mapEl.current);
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Recolour whenever the computed risk or the selection changes.
  useEffect(() => {
    layerRef.current?.setStyle((feature) => {
      const name = feature?.properties.sector as string;
      const isSelected = name === selected;
      return {
        color: isSelected ? '#1F4A34' : RISK_LEVEL_COLORS[riskBySector[name] || 'Low'],
        weight: isSelected ? 3 : 1.2,
        fillColor: RISK_LEVEL_COLORS[riskBySector[name] || 'Low'],
        fillOpacity: isSelected ? 0.55 : 0.4,
      };
    });
    layerRef.current?.eachLayer((l) => {
      const name = ((l as L.GeoJSON).feature as GeoJSON.Feature | undefined)?.properties?.sector;
      if (name === selected) (l as L.Path).bringToFront();
    });
  }, [riskBySector, selected]);

  const counts = RISK_ORDER.map((r) => ({ risk: r, n: sectorNames.filter((s) => riskBySector[s] === r).length }));
  const atRisk = sectorNames.filter((s) => riskBySector[s] !== 'Low').length;

  const detail = useMemo(() => {
    if (!selected) return null;
    const forecast = rainForecasts.find((f) => f.sector === selected);
    const window = forecast ? forecast.dailyMm.slice(0, FORECAST_RISK_DAYS) : [];
    const sectorReadings = stationReadings.filter((r) => r.sector === selected);
    return {
      risk: riskBySector[selected] || 'Low',
      forecastRisk: forecastRisk[selected] || 'Low',
      rainTomorrow: forecast?.dailyMm[1],
      wettestDay: window.length > 0 ? Math.max(...window) : undefined,
      warnings: weatherWarningsForSector(selected, warnings),
      reading: sectorReadings.length > 0 ? latestReading(sectorReadings, selected) : undefined,
    };
  }, [selected, rainForecasts, stationReadings, riskBySector, forecastRisk, warnings]);

  return (
    <div className={`${CARD_CLASS} p-5 flex flex-col h-full`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[rgba(31,74,52,0.06)]">
        <div className="flex items-baseline gap-2">
          <h3 className="text-[16px] font-semibold text-[#17271D]">Musanze risk map</h3>
          <span className="text-[12px] text-[#5B665E] tabular-nums">
            {atRisk} of {sectorNames.length} sectors at Watch or above
          </span>
        </div>
        {onViewFullMap && (
          <button
            type="button"
            onClick={onViewFullMap}
            className="text-[12px] font-medium text-[#1F4A34] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>See risk forecast</span>
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch flex-1">
        <div className="md:col-span-7 flex flex-col gap-2">
          {/* isolate: keep Leaflet's panes (z-index up to 1000) below drawers, menus and modals */}
          <div className="relative isolate rounded-xl overflow-hidden border border-[rgba(31,74,52,0.08)] bg-[#F4F6EF]">
            <div ref={mapEl} className="w-full h-[320px] bg-[#F4F6EF]" aria-label="Map of Musanze sectors coloured by risk" />
          </div>
          {tilesFailed && (
            <p className="flex items-center gap-1.5 text-[12px] text-[#5B665E]">
              <Info className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
              Background map did not load. Sector shapes and colours still show.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#5B665E]">
            {counts.map(({ risk, n }) => (
              <span key={risk} className="flex items-center gap-1.5 tabular-nums">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RISK_LEVEL_COLORS[risk] }} />
                {risk} · {n}
              </span>
            ))}
          </div>
          <p className="text-[12px] text-[#5B665E]">
            Sector boundaries:{' '}
            <a href={BOUNDARY_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="text-[#1F4A34] hover:underline">
              geoBoundaries
            </a>{' '}
            (Open Data Rwanda, 2012), CC BY 4.0 · Map tiles © OpenStreetMap contributors
          </p>
        </div>

        <div className="md:col-span-5 bg-[#F4F6EF] rounded-xl p-4 border border-[rgba(31,74,52,0.08)] flex flex-col gap-3">
          {!detail ? (
            <div className="flex flex-col items-center justify-center text-center gap-2 h-full py-6">
              <MapPin className="w-5 h-5 text-[#1F4A34]" strokeWidth={1.5} />
              <p className="text-[13px] text-[#5B665E]">Tap a sector to see its risk.</p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-[18px] font-semibold text-[#17271D] leading-tight">{selected}</h4>
                  <span className="text-[12px] text-[#5B665E]">
                    {selected === homeSector ? 'Your sector' : 'Sector of Musanze District'}
                  </span>
                </div>
                <RiskChip risk={detail.risk} />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#FBFCF8] p-2.5 rounded-lg border border-[rgba(31,74,52,0.06)]">
                  <span className="flex items-center gap-1 text-[12px] text-[#5B665E] mb-0.5">
                    <Droplets className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                    Rain tomorrow
                  </span>
                  <span className="block text-[14px] font-semibold text-[#17271D] tabular-nums">
                    {detail.rainTomorrow === undefined ? '—' : `${detail.rainTomorrow} mm`}
                  </span>
                </div>
                <div className="bg-[#FBFCF8] p-2.5 rounded-lg border border-[rgba(31,74,52,0.06)]">
                  <span className="flex items-center gap-1 text-[12px] text-[#5B665E] mb-0.5">
                    <CloudRain className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                    Wettest day ({FORECAST_RISK_DAYS} days)
                  </span>
                  <span className="block text-[14px] font-semibold text-[#17271D] tabular-nums">
                    {detail.wettestDay === undefined ? '—' : `${detail.wettestDay} mm`}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-[12.5px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#5B665E]">Rain forecast risk</span>
                  <RiskChip risk={detail.forecastRisk} />
                </div>
                <div>
                  <span className="block text-[#5B665E] mb-1">Weather warnings here</span>
                  {detail.warnings.length === 0 ? (
                    <span className="text-[#17271D]">None active</span>
                  ) : (
                    detail.warnings.map((w) => (
                      <span key={w.id} className="flex items-center gap-1.5 text-[#17271D] font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                        {w.title} · {w.severity}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-[rgba(31,74,52,0.08)] flex items-center gap-1.5 text-[12px] text-[#5B665E]">
                <Thermometer className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                {detail.reading ? (
                  <span className="tabular-nums">
                    {detail.reading.station}: {detail.reading.tempC}°C · {detail.reading.humidityPct}% · {detail.reading.date.slice(0, 5)}{' '}
                    {detail.reading.time}
                  </span>
                ) : (
                  <span>No weather station in this sector yet</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

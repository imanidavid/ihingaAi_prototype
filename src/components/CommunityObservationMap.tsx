import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ReportItem } from '../types';
import { FIELD_REPORT_WINDOW_DAYS, REPORT_TYPES, reportsInLastDays } from '../data/musanzeData';
import sectorBoundaries from '../data/musanzeSectorBoundaries.json';

const BOUNDARY_SOURCE_URL = 'https://www.geoboundaries.org/countryDownloads.html';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

type TypeFilter = 'All' | ReportItem['type'];

interface CommunityObservationMapProps {
  /** Every field report in the store; the map counts the last FIELD_REPORT_WINDOW_DAYS per sector. */
  reports: ReportItem[];
  /** The farmer's sector: selected first and marked "your sector". */
  homeSector: string;
}

/**
 * Community observation map: one map of Musanze's sectors, shaded by how many field reports each
 * received in the last 7 days. Type chips re-count the map; tapping a sector shows its counts by type.
 * Counts are not risk, so the shading uses greens only. No farmer names are shown.
 */
export const CommunityObservationMap: React.FC<CommunityObservationMapProps> = ({ reports, homeSector }) => {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const [type, setType] = useState<TypeFilter>('All');
  const [selected, setSelected] = useState(homeSector);

  const recent = useMemo(() => reportsInLastDays(reports), [reports]);
  const countFor = useMemo(
    () => (sector: string, t: TypeFilter) => recent.filter((r) => r.sector === sector && (t === 'All' || r.type === t)).length,
    [recent]
  );
  const sectorNames = useMemo(() => sectorBoundaries.features.map((f) => f.properties.sector as string), []);
  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const s of sectorNames) out[s] = countFor(s, type);
    return out;
  }, [sectorNames, countFor, type]);
  const max = Math.max(1, ...Object.values(counts));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  // Create the map once; shapes are bundled, so they show even when the tiles cannot load.
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, { scrollWheelZoom: false, zoomControl: false, zoomSnap: 0.25, attributionControl: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: OSM_ATTRIBUTION }).addTo(map);
    const layer = L.geoJSON(sectorBoundaries as GeoJSON.FeatureCollection, {
      onEachFeature: (feature, l) => {
        l.on('click', () => setSelected(feature.properties.sector as string));
      },
    }).addTo(map);
    const bounds = layer.getBounds();
    map.fitBounds(bounds, { padding: [4, 4] });
    mapRef.current = map;
    layerRef.current = layer;
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [4, 4] });
    });
    observer.observe(mapEl.current);
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Shade by count (greens only) and label each sector with its number.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.eachLayer((l) => {
      const path = l as L.Path & { feature?: GeoJSON.Feature };
      const name = path.feature?.properties?.sector as string;
      const n = counts[name] || 0;
      const isSelected = name === selected;
      path.setStyle({
        color: isSelected ? '#17271D' : '#1F4A34',
        weight: isSelected ? 2.5 : 0.8,
        fillColor: '#3E8E55',
        fillOpacity: n === 0 ? 0.04 : 0.15 + 0.6 * (n / max),
      });
      path.unbindTooltip();
      path.bindTooltip(String(n), { permanent: true, direction: 'center', className: 'ihinga-count-label' });
      if (isSelected) path.bringToFront();
    });
  }, [counts, max, selected]);

  const selectedByType = REPORT_TYPES.map((t) => ({ t, n: countFor(selected, t) })).filter((x) => x.n > 0);
  const selectedTotal = countFor(selected, type);

  return (
    <div className="space-y-3">
      {/* Type chips re-count the whole map */}
      <div className="flex flex-wrap gap-1.5">
        {(['All', ...REPORT_TYPES] as TypeFilter[]).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={type === t}
            onClick={() => setType(t)}
            className={`px-2.5 h-7 rounded-full text-[11.5px] font-medium border cursor-pointer transition-colors ${
              type === t
                ? 'bg-[#1F4A34] text-white border-[#1F4A34]'
                : 'bg-white text-[#17271D] border-[rgba(31,74,52,0.18)] hover:border-[#1F4A34]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* isolate: keep Leaflet's panes below drawers and modals */}
      <div className="relative isolate rounded-xl overflow-hidden border border-[rgba(31,74,52,0.08)] bg-[#F4F6EF]">
        <div
          ref={mapEl}
          className="w-full h-[240px] bg-[#F4F6EF]"
          aria-label={`Map of Musanze sectors: ${total} ${type === 'All' ? '' : `${type.toLowerCase()} `}reports in the last ${FIELD_REPORT_WINDOW_DAYS} days`}
        />
      </div>

      {/* The tapped sector */}
      <div className="text-[12.5px]">
        <p className="text-[#17271D]">
          <span className="font-semibold">{selected}</span>
          {selected === homeSector && <span className="text-[#5B665E]"> (your sector)</span>}
          <span className="tabular-nums">
            {' '}
            · {selectedTotal} {type === 'All' ? '' : `${type.toLowerCase()} `}
            {selectedTotal === 1 ? 'report' : 'reports'}
          </span>
        </p>
        {type === 'All' && selectedByType.length > 0 && (
          <p className="text-[#5B665E] tabular-nums mt-0.5">{selectedByType.map(({ t, n }) => `${t} ${n}`).join(' · ')}</p>
        )}
      </div>

      <p className="text-[11px] text-[#5B665E]">
        Tap a sector. From farmers in Musanze, names hidden. Boundaries:{' '}
        <a href={BOUNDARY_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="text-[#1F4A34] hover:underline">
          geoBoundaries
        </a>{' '}
        (CC BY 4.0) · tiles © OpenStreetMap
      </p>
    </div>
  );
};

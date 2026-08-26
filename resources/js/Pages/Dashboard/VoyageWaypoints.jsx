import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import LeafletViewer from '@/Components/LeafletViewer';
import { Head, usePoll } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Compass, MapPin, Navigation, Ship } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Lucide React MapPin Icon for Leaflet Default Markers (100% pure Lucide icon, zero PNG images)
const createLucideMarkerIcon = (IconComponent = MapPin, color = '#00629D', size = 26) => {
    const iconHtml = renderToString(
        <IconComponent
            size={size}
            style={{
                color: color,
                fill: color,
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.35))'
            }}
        />
    );

    return L.divIcon({
        className: 'custom-lucide-pin',
        html: `
            <div style="display: flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px;">
                ${iconHtml}
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2]
    });
};

L.Marker.prototype.options.icon = createLucideMarkerIcon(MapPin, '#00629D', 26);

// Custom live vessel navigation pointer icon (Direction arrow + Vessel name label)
const createVesselIcon = (vesselName = 'Vessel', heading = 0, pinColor = '#00629D') => {
    const arrowIconHtml = renderToString(
        <Navigation
            size={22}
            style={{
                color: pinColor,
                fill: pinColor,
                transform: `rotate(${heading}deg)`,
                transition: 'transform 0.4s ease-out',
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.35))'
            }}
        />
    );

    return L.divIcon({
        className: 'custom-fleet-pin',
        html: `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center;">
                    ${arrowIconHtml}
                </div>
                <div style="font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 10px; color: #141B2C; background: rgba(255,255,255,0.92); backdrop-filter: blur(4px); padding: 2px 6px; border-radius: 3px; white-space: nowrap; margin-top: 3px; border: 1px solid rgba(0,0,0,0.12); box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
                    ${vesselName}
                </div>
            </div>
        `,
        iconSize: [120, 50],
        iconAnchor: [60, 15],
        popupAnchor: [0, -15]
    });
};

function GlobalFleetMapViewer({ waypoints = [], onSelectVessel }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef(new Map());

    // Initialize Map Once
    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        mapInstance.current = L.map(mapRef.current, { minZoom: 2 }).setView([-2.5, 118.0], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 2,
            maxZoom: 18,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapInstance.current);

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Update Vessel Markers smoothly when waypoints poll updates
    useEffect(() => {
        if (!mapInstance.current || !waypoints || waypoints.length === 0) return;

        const validPoints = waypoints.filter(w => {
            if (!w.lat || !w.lng) return false;
            const lat = parseFloat(w.lat);
            const lng = parseFloat(w.lng);
            if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return false;
            if ((Math.abs(lat - 15.2) < 0.01 && Math.abs(lng - 73.8) < 0.01) || (Math.abs(lat - (-6.12)) < 0.01 && Math.abs(lng - 106.84) < 0.01)) {
                return false;
            }
            return true;
        });
        const colors = ['#00629D', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981'];

        validPoints.forEach((vessel, idx) => {
            const lat = parseFloat(vessel.lat);
            const lng = parseFloat(vessel.lng);
            const heading = vessel.cog || 0;
            const pinColor = vessel.color || colors[idx % colors.length];
            const vesselIcon = createVesselIcon(vessel.vessel || 'Vessel', heading, pinColor);

            const shipIconHtml = renderToString(<Ship size={15} style={{ color: '#00629D', display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />);

            const popupContainer = document.createElement('div');
            popupContainer.className = "font-['Hanken_Grotesk'] text-[#141B2C] p-1";
            popupContainer.innerHTML = `
                <div style="font-family: 'Hanken Grotesk', sans-serif; color: #141B2C; padding: 2px;">
                    <strong style="font-size: 13px;">${shipIconHtml}${vessel.vessel}</strong><br/>
                    <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #404750;">Speed: ${vessel.speed}</span><br/>
                    <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #00629D;">Heading: ${heading}°</span><br/>
                    <button class="view-route-btn mt-2 bg-[#00629D] hover:bg-[#004e7e] text-white text-[11px] font-semibold px-2.5 py-1 rounded-[4px] cursor-pointer w-full text-center block" style="border: none; margin-top: 8px;">
                        Inspect Voyage Route →
                    </button>
                </div>
            `;

            const btn = popupContainer.querySelector('.view-route-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    onSelectVessel(vessel);
                });
            }

            if (markersRef.current.has(vessel.id)) {
                // Update existing marker position & icon orientation smoothly
                const existingMarker = markersRef.current.get(vessel.id);
                existingMarker.setLatLng([lat, lng]);
                existingMarker.setIcon(vesselIcon);
                existingMarker.setPopupContent(popupContainer);
            } else {
                // Create new marker
                const newMarker = L.marker([lat, lng], { icon: vesselIcon }).addTo(mapInstance.current).bindPopup(popupContainer);
                markersRef.current.set(vessel.id, newMarker);
            }
        });
    }, [waypoints, onSelectVessel]);

    return (
        <div className="bg-white p-4 rounded-[8px] border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Ship className="w-4.5 h-4.5 text-[#00629D]" />
                    <h3 className="font-bold text-sm text-[#141B2C]">Live Fleet Real-Time Overview Map</h3>
                </div>
                <span className="font-['JetBrains_Mono'] text-xs text-[#404750] font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {waypoints.length} Active Fleet Vessels Tracked
                </span>
            </div>
            <div ref={mapRef} className="h-[580px] w-full rounded-[8px] overflow-hidden border border-[#E5E7EB] z-0" />
        </div>
    );
}

export default function VoyageWaypoints({ voyage_waypoints = [] }) {
    // Automatically poll backend every 3000ms for live telemetry updates
    usePoll(3000, {
        only: ['voyage_waypoints'],
    });

    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [mapWaypoint, setMapWaypoint] = useState(null);
    const [modalLogPage, setModalLogPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const totalPages = Math.ceil(voyage_waypoints.length / itemsPerPage);
    const paginatedWaypoints = voyage_waypoints.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const openMapModal = (waypoint) => {
        setMapWaypoint(waypoint);
        setModalLogPage(1);
        setIsMapModalOpen(true);
    };

    const closeMapModal = () => {
        setIsMapModalOpen(false);
        setMapWaypoint(null);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between font-['Hanken_Grotesk']">
                    <div>
                        <div className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#00629D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5" /> AIS TELEMETRY
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            Voyage Waypoints & Real-Time AIS
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Voyage Waypoints | PT. PABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">

                    {/* Top Global Fleet Map Overview (Position of all vessels) */}
                    <GlobalFleetMapViewer
                        waypoints={voyage_waypoints}
                        onSelectVessel={openMapModal}
                    />

                    {/* Table of Fleet Vessels */}
                    <div className="bg-white rounded-[8px] border border-[#E5E7EB] overflow-hidden ">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#141B2C] text-white font-['JetBrains_Mono'] uppercase">
                                <tr>
                                    <th className="p-4">Vessel Name</th>
                                    <th className="p-4">GPS Coordinates</th>
                                    <th className="p-4">Speed</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB]">
                                {(paginatedWaypoints || []).map((item) => (
                                    <tr key={item.id} className="hover:bg-[#F5F5F5] transition-colors">
                                        <td className="p-4 font-bold text-[#141B2C] text-sm">
                                            {item.vessel || 'Vessel'}
                                        </td>
                                        <td className="p-4 font-['JetBrains_Mono'] text-[#00629D]">
                                            {item.lat || '0.00'}, {item.lng || '0.00'}
                                        </td>
                                        <td className="p-4 font-['JetBrains_Mono'] text-[#404750]">
                                            {item.speed || '8.0 knots'}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase bg-emerald-100 text-emerald-800">
                                                {item.status || 'En Route'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => openMapModal(item)}
                                                className="inline-flex items-center gap-1 text-emerald-600 hover:bg-emerald-50 px-2.5 py-1 rounded-[4px] font-semibold transition-colors cursor-pointer"
                                            >
                                                <MapPin className="w-3.5 h-3.5" /> Map
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Bar */}
                        {totalPages > 1 && (
                            <div className="px-4 py-3 bg-white border-t border-[#E5E7EB] flex items-center justify-between text-xs font-['JetBrains_Mono']">
                                <div className="text-[#404750]">
                                    Showing <span className="font-bold text-[#141B2C]">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-[#141B2C]">{Math.min(currentPage * itemsPerPage, voyage_waypoints.length)}</span> of <span className="font-bold text-[#141B2C]">{voyage_waypoints.length}</span> Vessels
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 rounded-[4px] border border-[#E5E7EB] bg-white hover:bg-slate-50 text-[#141B2C] disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer"
                                    >
                                        ← Prev
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1.5 rounded-[4px] font-semibold cursor-pointer ${currentPage === page
                                                ? 'bg-[#00629D] text-white border border-[#00629D]'
                                                : 'border border-[#E5E7EB] bg-white hover:bg-slate-50 text-[#141B2C]'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 rounded-[4px] border border-[#E5E7EB] bg-white hover:bg-slate-50 text-[#141B2C] disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Live Map Modal */}
            <Modal show={isMapModalOpen} onClose={closeMapModal} maxWidth="4xl">
                <div className="p-5 sm:p-6 font-['Hanken_Grotesk'] text-[#141B2C] max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-5">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-lg font-bold text-[#141B2C]">
                                Live Location: {mapWaypoint?.vessel}
                            </h3>
                        </div>
                        <button onClick={closeMapModal} className="text-slate-400 hover:text-[#141B2C] text-xl">&times;</button>
                    </div>

                    {mapWaypoint && (
                        <div className="space-y-4">
                            {/* Map Viewer */}
                            <div className="rounded-[8px] overflow-hidden border border-[#E5E7EB] z-0 relative">
                                <LeafletViewer waypoint={mapWaypoint} height="h-[220px]" />
                            </div>

                            {/* Telemetry & Active Position Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                {/* Active Coordinates Card */}
                                <div className="p-4 bg-white rounded-[8px] border border-[#E5E7EB] space-y-2.5">
                                    <div className="border-b border-[#E5E7EB] pb-2">
                                        <span className="font-bold text-[#141B2C] uppercase tracking-wider text-[11px] font-['JetBrains_Mono'] flex items-center gap-1.5">
                                            <Navigation className="w-3.5 h-3.5 text-[#00629D]" /> Active Coordinates
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2.5 font-['JetBrains_Mono'] text-[11px]">
                                        <div>
                                            <span className="text-slate-400 block text-[10px]">Latitude</span>
                                            <span className="font-bold text-[#141B2C]">{Number(mapWaypoint.lat).toFixed(6)}°</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[10px]">Longitude</span>
                                            <span className="font-bold text-[#141B2C]">{Number(mapWaypoint.lng).toFixed(6)}°</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[10px]">Speed (SOG)</span>
                                            <span className="font-bold text-[#00629D]">{mapWaypoint.speed || '0 Knots'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[10px]">Heading (COG)</span>
                                            <span className="font-bold text-[#00629D]">{mapWaypoint.cog || 0}°</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Weather Telemetry Card */}
                                <div className="p-4 bg-white rounded-[8px] border border-[#E5E7EB] space-y-2.5">
                                    <div className="border-b border-[#E5E7EB] pb-2">
                                        <span className="font-bold text-[#141B2C] uppercase tracking-wider text-[11px] font-['JetBrains_Mono'] flex items-center gap-1.5">
                                            <Compass className="w-3.5 h-3.5 text-[#00629D]" /> Weather Telemetry
                                        </span>
                                    </div>

                                    {mapWaypoint.weather ? (
                                        <div className="grid grid-cols-3 gap-2 font-['JetBrains_Mono'] text-[11px]">
                                            <div>
                                                <span className="text-slate-400 block text-[10px]">Condition</span>
                                                <span className="font-bold text-[#141B2C]">{mapWaypoint.weather.weather || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[10px]">Temperature</span>
                                                <span className="font-bold text-[#141B2C]">{mapWaypoint.weather.temperature || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[10px]">Wind Speed</span>
                                                <span className="font-bold text-[#141B2C]">{mapWaypoint.weather.windSpeed || 'N/A'}</span>
                                            </div>
                                            {mapWaypoint.weather.windDirection && (
                                                <div>
                                                    <span className="text-slate-400 block text-[10px]">Wind Dir</span>
                                                    <span className="font-bold text-[#141B2C]">{mapWaypoint.weather.windDirection}</span>
                                                </div>
                                            )}
                                            {mapWaypoint.weather.humidity && (
                                                <div>
                                                    <span className="text-slate-400 block text-[10px]">Humidity</span>
                                                    <span className="font-bold text-[#141B2C]">{mapWaypoint.weather.humidity}</span>
                                                </div>
                                            )}
                                            {mapWaypoint.weather.waveSignificantHeight && (
                                                <div>
                                                    <span className="text-slate-400 block text-[10px]">Wave Height</span>
                                                    <span className="font-bold text-[#141B2C]">{mapWaypoint.weather.waveSignificantHeight}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-4 text-center text-slate-400 font-['JetBrains_Mono'] text-[11px] italic">
                                            Weather telemetry not available for this provider.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Historical Position Pings Log Table */}
                            <div className="bg-white rounded-[8px] border border-[#E5E7EB] overflow-hidden">
                                <div className="p-3 bg-white border-b border-[#E5E7EB] flex items-center justify-between">
                                    <span className="font-bold text-[#141B2C] uppercase tracking-wider text-[11px] font-['JetBrains_Mono'] flex items-center gap-1.5">
                                        <Compass className="w-3.5 h-3.5 text-[#00629D]" /> Historical Position Pings ({mapWaypoint.route_points?.length || 0})
                                    </span>
                                </div>

                                {mapWaypoint.route_points && mapWaypoint.route_points.length > 0 ? (
                                    <>
                                        <table className="w-full text-left text-xs font-['Hanken_Grotesk']">
                                            <thead className="bg-[#141B2C] text-white font-['JetBrains_Mono'] uppercase text-[10px]">
                                                <tr>
                                                    <th className="p-3">Seq #</th>
                                                    <th className="p-3">Recorded Time</th>
                                                    <th className="p-3">GPS Coordinates</th>
                                                    <th className="p-3">Dir (COG)</th>
                                                    <th className="p-3">Speed (SOG)</th>
                                                    <th className="p-3">Weather</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#E5E7EB] font-['JetBrains_Mono'] text-[11px]">
                                                {mapWaypoint.route_points
                                                    .slice((modalLogPage - 1) * 3, modalLogPage * 3)
                                                    .map((point, index) => {
                                                        const cogVal = point.cog !== undefined ? point.cog : (point.notes && point.notes.match(/COG:\s*([0-9.]+)/) ? parseFloat(point.notes.match(/COG:\s*([0-9.]+)/)[1]) : 0);
                                                        const speedVal = point.speed || (point.notes && point.notes.match(/SOG:\s*([0-9.]+\s*kts)/) ? point.notes.match(/SOG:\s*([0-9.]+\s*kts)/)[1] : '0 kts');
                                                        let weatherVal = 'N/A';
                                                        if (point.notes && point.notes.includes('Weather:')) {
                                                            weatherVal = point.notes.split('Weather:')[1].trim();
                                                        }
                                                        return (
                                                            <tr key={point.id || index} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="p-3 font-bold text-[#00629D]">
                                                                    #{point.sequence || (index + 1)}
                                                                </td>
                                                                <td className="p-3 text-[#404750]">
                                                                    {point.created_at || 'Recent Ping'}
                                                                </td>
                                                                <td className="p-3 text-[#141B2C]">
                                                                    {Number(point.lat).toFixed(6)}°, {Number(point.lng).toFixed(6)}°
                                                                </td>
                                                                <td className="p-3 text-[#141B2C]">
                                                                    <span className="inline-flex items-center gap-1 font-bold">
                                                                        <Navigation className="w-3 h-3 text-[#00629D]" style={{ transform: `rotate(${cogVal}deg)` }} />
                                                                        {cogVal}°
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 font-semibold text-[#00629D]">
                                                                    {speedVal}
                                                                </td>
                                                                <td className="p-3 text-emerald-600 font-semibold text-[10px]">
                                                                    {weatherVal}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>

                                        {/* Pagination for Modal Log Table */}
                                        {Math.ceil(mapWaypoint.route_points.length / 3) > 1 && (
                                            <div className="px-4 py-2 bg-white border-t border-[#E5E7EB] flex items-center justify-between text-xs font-['JetBrains_Mono']">
                                                <span className="text-slate-500 text-[11px]">
                                                    Page {modalLogPage} of {Math.ceil(mapWaypoint.route_points.length / 3)}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setModalLogPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={modalLogPage === 1}
                                                        className="px-2.5 py-1 rounded border border-[#E5E7EB] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-[11px]"
                                                    >
                                                        ← Prev
                                                    </button>
                                                    <button
                                                        onClick={() => setModalLogPage(prev => Math.min(prev + 1, Math.ceil(mapWaypoint.route_points.length / 3)))}
                                                        disabled={modalLogPage === Math.ceil(mapWaypoint.route_points.length / 3)}
                                                        className="px-2.5 py-1 rounded border border-[#E5E7EB] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-[11px]"
                                                    >
                                                        Next →
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-4 text-center text-slate-400 font-['JetBrains_Mono'] text-[11px] italic">
                                        No historical position pings recorded yet for this vessel.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex justify-end">
                        <button
                            onClick={closeMapModal}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#141B2C] text-xs font-semibold rounded-[6px]"
                        >
                            Close Map
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

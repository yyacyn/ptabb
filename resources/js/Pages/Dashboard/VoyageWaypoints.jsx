import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, usePoll } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Compass, MapPin, Navigation, Ship } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom live vessel navigation pointer icon (Standalone rotated triangle arrow)
const createVesselIcon = (heading = 0) => {
    const arrowIconHtml = renderToString(
        <Navigation 
            size={26}
            style={{ 
                color: '#00629D',
                fill: '#00629D',
                transform: `rotate(${heading}deg)`, 
                transition: 'transform 0.4s ease-out',
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.35))'
            }} 
        />
    );

    return L.divIcon({
        className: 'custom-vessel-marker',
        html: `<div style="display: flex; align-items: center; justify-content: center; width: 26px; height: 26px;">${arrowIconHtml}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -13]
    });
};

function LeafletViewer({ waypoint }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const liveMarkerRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current || !waypoint) return;

        const routePoints = waypoint.route_points || [];
        const lat = parseFloat(waypoint.lat) || 0;
        const lng = parseFloat(waypoint.lng) || 0;
        const heading = waypoint.cog || 0;

        const shipIconHtml = renderToString(<Ship size={15} style={{ color: '#00629D', display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />);
        const pinIconHtml = renderToString(<MapPin size={15} style={{ color: '#00629D', display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />);

        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([lat, lng], 6);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(mapInstance.current);

            if (routePoints.length > 0) {
                const latLngs = routePoints.map(p => [p.lat, p.lng]);

                // Draw dashed ocean blue route line connecting waypoints
                const polyline = L.polyline(latLngs, {
                    color: '#00629D',
                    weight: 4,
                    opacity: 0.85,
                    dashArray: '8, 8',
                }).addTo(mapInstance.current);

                // Identify the single live current position (sequence 1 or first point)
                const liveIndex = routePoints.findIndex(p => p.sequence === 1) >= 0 
                    ? routePoints.findIndex(p => p.sequence === 1) 
                    : 0;

                // Add markers for each waypoint/stop on the route
                routePoints.forEach((p, idx) => {
                    const isLive = idx === liveIndex;
                    const iconHeader = isLive ? shipIconHtml : pinIconHtml;
                    const popupText = `
                        <div style="font-family: 'Hanken Grotesk', sans-serif; color: #141B2C; padding: 2px;">
                            <strong style="font-size: 13px;">${iconHeader}${isLive ? `${waypoint.vessel} (Current Position)` : p.name}</strong><br/>
                            <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #404750;">Type: ${p.type}</span><br/>
                            ${isLive ? `
                                <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #00629D;">Speed: ${waypoint.speed}</span><br/>
                                <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #00629D;">Heading: ${heading}°</span>
                            ` : ''}
                        </div>
                    `;
                    
                    // Strictly only the single current position gets the vessel pointer icon
                    const markerOptions = isLive ? { icon: createVesselIcon(heading), zIndexOffset: 1000 } : {};
                    const m = L.marker([p.lat, p.lng], markerOptions).addTo(mapInstance.current).bindPopup(popupText);
                    if (isLive) {
                        m.openPopup();
                        liveMarkerRef.current = m;
                    }
                });

                // Automatically zoom and center map to show the entire route
                if (latLngs.length > 1) {
                    mapInstance.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
                }
            } else {
                const popupContent = `
                    <div style="font-family: 'Hanken Grotesk', sans-serif; color: #141B2C; padding: 2px;">
                        <strong style="font-size: 14px; font-weight: 700;">${shipIconHtml}${waypoint.vessel}</strong><br/>
                        <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #404750;">Speed: ${waypoint.speed}</span><br/>
                        <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #404750;">Heading: ${heading}°</span><br/>
                        <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #404750;">Status: ${waypoint.status}</span>
                    </div>
                `;
                liveMarkerRef.current = L.marker([lat, lng], { icon: createVesselIcon(heading) }).addTo(mapInstance.current).bindPopup(popupContent).openPopup();
            }
        } else {
            // Live position dynamic update on poll
            if (liveMarkerRef.current) {
                liveMarkerRef.current.setLatLng([lat, lng]);
                liveMarkerRef.current.setIcon(createVesselIcon(heading));
            }
        }

        return () => {
            // keep map intact for smooth updates, clean up on component unmount
        };
    }, [waypoint]);

    useEffect(() => {
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    return <div ref={mapRef} className="h-full w-full z-0" />;
}

function GlobalFleetMapViewer({ waypoints = [], onSelectVessel }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef(new Map());

    // Initialize Map Once
    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        mapInstance.current = L.map(mapRef.current).setView([-2.5, 118.0], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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

        const validPoints = waypoints.filter(w => !isNaN(parseFloat(w.lat)) && !isNaN(parseFloat(w.lng)));

        validPoints.forEach((vessel) => {
            const lat = parseFloat(vessel.lat);
            const lng = parseFloat(vessel.lng);
            const heading = vessel.cog || 0;
            const vesselIcon = createVesselIcon(heading);

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
    }, [waypoints]);

    return (
        <div className="bg-white p-4 rounded-[8px] border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Ship className="w-4.5 h-4.5 text-[#00629D]" />
                    <h3 className="font-bold text-sm text-[#141B2C]">Live Fleet Real-Time Overview Map</h3>
                </div>
                <span className="font-['JetBrains_Mono'] text-xs text-[#404750] font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {waypoints.length} Active Fleet Vessels Tracked (Live Sync)
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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const totalPages = Math.ceil(voyage_waypoints.length / itemsPerPage);
    const paginatedWaypoints = voyage_waypoints.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const openMapModal = (waypoint) => {
        setMapWaypoint(waypoint);
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
            <Head title="Voyage Waypoints — PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">
                    
                    {/* Top Global Fleet Map Overview (Position of all vessels) */}
                    <GlobalFleetMapViewer 
                        waypoints={voyage_waypoints} 
                        onSelectVessel={openMapModal} 
                    />

                    {/* Table of Fleet Vessels */}
                    <div className="bg-white rounded-[8px] border border-[#E5E7EB] overflow-hidden shadow-sm">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#141B2C] text-white font-['JetBrains_Mono'] uppercase">
                                <tr>
                                    <th className="p-4">Vessel Name</th>
                                    <th className="p-4">Current Route</th>
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
                                        <td className="p-4 text-[#404750] font-semibold">
                                            {item.origin} ➔ {item.destination}
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
                                            className={`px-3 py-1.5 rounded-[4px] font-semibold cursor-pointer ${
                                                currentPage === page
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
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
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
                        <div className="h-[520px] w-full rounded-[8px] overflow-hidden border border-[#E5E7EB] z-0 relative">
                            <LeafletViewer waypoint={mapWaypoint} />
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

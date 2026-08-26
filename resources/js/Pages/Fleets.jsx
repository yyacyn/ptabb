import { Head, Link, usePoll } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';
import CtaBanner from '@/Components/CtaBanner';
import Modal from '@/Components/Modal';
import LeafletViewer from '@/Components/LeafletViewer';
import {
    Ship,
    Anchor,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Gauge,
    Layers,
    FileText,
    TrendingUp,
    Compass,
    Navigation,
    MapPin,
    X,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronDown
} from 'lucide-react';
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

// Custom SVG waypoint marker icon for intermediate route stops
const createWaypointDotIcon = (label = 'Waypoint', color = '#00629D') => {
    const pinHtml = renderToString(
        <MapPin
            size={18}
            style={{
                color: color,
                fill: color,
                filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.3))'
            }}
        />
    );

    return L.divIcon({
        className: 'custom-waypoint-pin',
        html: `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
                ${pinHtml}
                <div style="font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 9px; color: #141B2C; background: rgba(255,255,255,0.92); padding: 1px 5px; border-radius: 2px; white-space: nowrap; margin-top: 1px; border: 1px solid rgba(0,0,0,0.12); box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
                    ${label}
                </div>
            </div>
        `,
        iconSize: [80, 34],
        iconAnchor: [40, 18],
        popupAnchor: [0, -18]
    });
};

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

const EMPTY_WAYPOINTS = [];
const EMPTY_FLEETS = [];

function RealTimeFleetMap({ waypoints = EMPTY_WAYPOINTS, onSelectVessel }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef(new Map());

    // Initialize Map Once
    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        mapInstance.current = L.map(mapRef.current, { minZoom: 2 }).setView([15, 100], 3);

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

            const weatherHtml = vessel.weather ? `<span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #059669;">Weather: ${vessel.weather.weather}, ${vessel.weather.temperature}</span><br/>` : '';
            const downWarningHtml = vessel.is_down ? `<span style="display:inline-block; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #D97706; background: #FEF3C7; border: 1px solid #FCD34D; padding: 2px 6px; border-radius: 4px; margin-top: 4px;">⚠️ Device Offline (${vessel.provider || 'Thuraya'})</span><br/>` : '';

            const popupContainer = document.createElement('div');
            popupContainer.innerHTML = `
                <div style="font-family: 'Hanken Grotesk', sans-serif; color: #141B2C; padding: 2px;">
                    <strong style="font-size: 13px;">${shipIconHtml}${vessel.vessel}</strong><br/>
                    ${downWarningHtml}
                    <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #404750;">Speed: ${vessel.speed || '11.4 knots'}</span><br/>
                    <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #00629D;">Heading: ${heading}°</span><br/>
                    ${weatherHtml}
                    <button class="view-route-btn" style="display: block; width: 100%; margin-top: 8px; padding: 6px 10px; background: linear-gradient(to right, #00629D, #3F96DD); color: white; font-family: 'Hanken Grotesk', sans-serif; font-size: 12px; font-weight: 600; border: none; border-radius: 4px; cursor: pointer; text-align: center;">
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
                const existingMarker = markersRef.current.get(vessel.id);
                existingMarker.setLatLng([lat, lng]);
                existingMarker.setIcon(vesselIcon);
                existingMarker.setPopupContent(popupContainer);
            } else {
                const newMarker = L.marker([lat, lng], { icon: vesselIcon }).addTo(mapInstance.current).bindPopup(popupContainer);
                markersRef.current.set(vessel.id, newMarker);
            }
        });
    }, [waypoints, onSelectVessel]);

    return <div ref={mapRef} className="w-full h-full z-0" />;
}

// Calculate bearing in degrees between two coordinates
const getBearing = (lat1, lng1, lat2, lng2) => {
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const y = Math.sin(dLng) * Math.cos(lat2 * (Math.PI / 180));
    const x = Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
              Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLng);
    const brng = Math.atan2(y, x) * (180 / Math.PI);
    return (brng + 360) % 360;
};

// Route segment direction arrow icon
const createRouteArrowIcon = (heading = 0, color = '#00629D') => {
    const arrowHtml = renderToString(
        <Navigation
            size={13}
            style={{
                color: color,
                fill: color,
                transform: `rotate(${heading}deg)`,
                filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))'
            }}
        />
    );

    return L.divIcon({
        className: 'custom-route-arrow',
        html: `<div style="display: flex; align-items: center; justify-content: center; width: 14px; height: 14px;">${arrowHtml}</div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });
};



export default function Fleets({ fleets = EMPTY_FLEETS, voyage_waypoints = EMPTY_WAYPOINTS }) {
    // Automatically poll backend every 3000ms for real-time AIS telemetry updates
    usePoll(3000, {
        only: ['voyage_waypoints'],
    });

    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [mapWaypoint, setMapWaypoint] = useState(null);
    const [modalLogPage, setModalLogPage] = useState(1);

    // Search and Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [openSubDropdown, setOpenSubDropdown] = useState(null);
    const filterMenuRef = useRef(null);

    // Close filter dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                setIsFilterMenuOpen(false);
                setOpenSubDropdown(null);
            }
        };

        if (isFilterMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterMenuOpen]);

    const openMapModal = (waypoint) => {
        setMapWaypoint(waypoint);
        setModalLogPage(1);
        setIsMapModalOpen(true);
    };

    const closeMapModal = () => {
        setIsMapModalOpen(false);
        setMapWaypoint(null);
    };

    const resolveFleetImage = (f, fallback = '/images/card_bulk_vessel.png') => {
        if (!f) return fallback;
        let img = f.image || f.featured_image_url || f.featured_image;
        if (!img || img === 'null' || img === 'undefined' || typeof img !== 'string' || img.trim() === '') {
            return fallback;
        }
        img = img.trim();
        if (img.startsWith('http://') || img.startsWith('https://')) return img;
        if (img.startsWith('/images/') || img.startsWith('/storage/')) return img;
        if (img.startsWith('images/') || img.startsWith('storage/')) return `/${img}`;
        const filename = img.split('/').pop();
        return `/images/fleet/${filename}`;
    };

    // Extract vessel images array from backend `fleets` prop
    const backendImages = (fleets && fleets.length > 0)
        ? fleets.map((f, idx) => resolveFleetImage(f, idx % 2 === 0 ? '/images/card_bulk_vessel.png' : '/images/asuwa1.jpg')).filter(Boolean)
        : ['/images/asuwa1.jpg', '/images/card_bulk_vessel.png'];

    const vesselImages = backendImages;
    const [currentHeroImageIdx, setCurrentHeroImageIdx] = useState(0);

    // Randomize Hero vessel image every 7 seconds
    useEffect(() => {
        if (!vesselImages || vesselImages.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentHeroImageIdx((prevIdx) => {
                let nextIdx = Math.floor(Math.random() * vesselImages.length);
                if (nextIdx === prevIdx) {
                    nextIdx = (prevIdx + 1) % vesselImages.length;
                }
                return nextIdx;
            });
        }, 7000);

        return () => clearInterval(timer);
    }, [vesselImages.length]);

    // Use actual backend fleets data only (no fake fallback objects)
    const displayFleets = fleets || [];

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Reset pagination when search query or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategories, selectedAreas, selectedStatuses]);

    // Unique options for filter controls
    const categories = ['All', ...Array.from(new Set(displayFleets.map(f => f.vessel_type || f.type).filter(Boolean))).sort()];

    // Clean, split, and format Operating Areas into individual distinct options
    const rawAreaStrings = displayFleets.map(f => f.operational_area || f.area || f.operating_area).filter(Boolean);
    const individualAreas = rawAreaStrings.flatMap(str => str.split(',').map(a => a.trim())).filter(Boolean);
    const areas = ['All', ...Array.from(new Set(individualAreas)).sort()];

    const rawStatuses = displayFleets.map(f => f.status).filter(Boolean);
    const statuses = ['All', ...Array.from(new Set(rawStatuses)).sort()];

    const formatStatusName = (st) => {
        if (!st || st === 'All') return 'All Statuses';
        return st.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const activeFiltersCount = selectedCategories.length + selectedAreas.length + selectedStatuses.length;

    // Filtered Fleets based on Search Query, Category Checkboxes, Area Checkboxes, and Status Checkboxes
    const filteredFleets = displayFleets.filter((vessel) => {
        const name = (vessel.ship_name || vessel.name || '').toLowerCase();
        const type = (vessel.vessel_type || vessel.type || '').toLowerCase();
        const imo = (vessel.imo_number || vessel.imo || vessel.imo_no || '').toString().toLowerCase();
        const areaStr = (vessel.operational_area || vessel.area || vessel.operating_area || vessel.route_name || '');
        const vesselAreas = areaStr.split(',').map(a => a.trim().toLowerCase());
        const status = (vessel.status || '').toLowerCase();
        const flag = (vessel.flag || '').toLowerCase();

        const query = searchQuery.toLowerCase().trim();

        // Search matches Name, Type, IMO Number, Area, or Flag
        const matchesQuery = !query ||
            name.includes(query) ||
            type.includes(query) ||
            imo.includes(query) ||
            areaStr.toLowerCase().includes(query) ||
            flag.includes(query);

        // 1. Vessel Type Checkboxes
        const matchesCategory = selectedCategories.length === 0 ||
            selectedCategories.includes(vessel.vessel_type || vessel.type || 'Pneumatic Bulk Carrier');

        // 2. Operational Area Checkboxes
        const matchesArea = selectedAreas.length === 0 ||
            selectedAreas.some(selectedArea =>
                vesselAreas.includes(selectedArea.toLowerCase()) || areaStr === selectedArea
            );

        // 3. Vessel Status Checkboxes
        const matchesStatus = selectedStatuses.length === 0 ||
            selectedStatuses.some(selectedStatus =>
                vessel.status === selectedStatus ||
                status === selectedStatus.toLowerCase() ||
                formatStatusName(vessel.status).toLowerCase() === selectedStatus.toLowerCase()
            );

        return matchesQuery && matchesCategory && matchesArea && matchesStatus;
    });

    const totalPages = Math.ceil(filteredFleets.length / itemsPerPage);
    const paginatedFleets = filteredFleets.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <GuestLayout>
            <Head title="Vessel Fleet Register & Live AIS Tracking | PT. ABB" />

            {/* 1. HERO BANNER SECTION WITH 7S RANDOMIZED IMAGE SLIDESHOW & BOTTOM-TO-TOP DARK BLUE GRADIENT */}
            <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative rounded-[8px] overflow-hidden border border-[#E5E7EB] h-[400px] sm:h-[450px] lg:h-[480px] flex items-end justify-center bg-[#141B2C]"
            >
                {/* Background Vessel Image with 7s Random Rotation */}
                <div className="absolute inset-0 z-0 bg-[#141B2C]">
                    <AnimatePresence initial={false}>
                        <motion.img
                            key={currentHeroImageIdx}
                            src={vesselImages[currentHeroImageIdx % vesselImages.length]}
                            alt="PT. ABB Fleet Vessel"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: 'easeInOut' }}
                            className="absolute inset-0 w-full h-full object-cover object-center"
                            onError={(e) => {
                                e.currentTarget.src = '/images/card_bulk_vessel.png';
                            }}
                        />
                    </AnimatePresence>

                    {/* Gradient Overlay: Dark Blue (#141B2C) from Bottom to Top */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141B2C] via-[#141B2C]/75 to-transparent pointer-events-none" />
                </div>

                {/* Hero Text Content (Centered Middle-Bottom) */}
                <div className="relative z-10 text-center px-6 pb-12 sm:pb-8 lg:pb-10 max-w-4xl mx-auto flex flex-col items-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[44px] lg:text-[50px] text-white tracking-tight leading-[1.12] text-center mb-4"
                    >
                        Versatile Fleet Built for Complex Maritime Voyages
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[17px] lg:text-[18px] text-white/90 text-center max-w-3xl leading-relaxed"
                    >
                        Inspect technical specifications, DWT capacities, and operational status across our active vessel lineup, engineered to deliver cargo safely and punctually to every port.
                    </motion.p>
                </div>
            </motion.section>

            {/* 2. REAL-TIME OPERATIONAL COVERAGE MAP SECTION */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-[#141B2C] text-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-10 lg:p-14 text-center "
            >
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-3 mb-8 sm:mb-10">
                    <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#8AAFC8] tracking-wider">
                        REAL-TIME COVERAGE
                    </div>
                    <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.12] lg:w-[80%] text-white tracking-tight">
                        Real-Time Ocean Visibility Across Every Voyage
                    </h2>
                    <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[17px] lg:text-[18px] text-[#8AAFC8] max-w-4xl leading-relaxed">
                        Track active vessel coordinates, voyage progress, and real-time routes. Powered by satellite AIS telemetry, PT. ABB provides complete operational transparency for charterers and cargo owners 24/7.
                    </p>
                </div>

                {/* Leaflet Real-Time Map Container */}
                <div className="max-w-[1200px] mx-auto bg-white rounded-[12px] p-1.5 sm:p-2 overflow-hidden relative shadow-lg">
                    {/* Live Telemetry Indicator Badge */}
                    <div className="absolute top-4 right-4 z-20 bg-[#16a34a] text-white px-3 py-1 rounded-full text-[12px] font-['JetBrains_Mono'] font-bold flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        LIVE
                    </div>

                    <div className="w-full h-[400px] sm:h-[460px] lg:h-[600px] rounded-[8px] overflow-hidden">
                        <RealTimeFleetMap waypoints={voyage_waypoints} onSelectVessel={openMapModal} />
                    </div>
                </div>
            </motion.section>

            {/* 3. FLEET INVENTORY GRID SECTION */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-10 lg:p-14"
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider mb-2">
                            FLEET
                        </div>
                        <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[36px] lg:text-[44px] leading-[1.12] text-[#141B2C] tracking-tight">
                            Looking for Something Specific?
                        </h2>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 relative">
                        {/* Search Input Box */}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search vessel name, IMO (e.g. 9821158), type..."
                                className="w-60 sm:w-72 lg:w-80 px-4 py-2 text-[13px] font-['JetBrains_Mono'] text-[#141B2C] placeholder-[#9CA3AF] bg-white border border-[#E5E7EB] rounded-[4px] focus:outline-none focus:border-[#00629D] focus:ring-1 focus:ring-[#00629D] transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Red Search Button */}
                        <button
                            type="button"
                            className="bg-gradient-to-r from-[#D93A2B] to-[#FF5542] hover:shadow-[0_4px_14px_rgba(217,58,43,0.35)] active:scale-[0.97] text-white p-3 rounded-[4px] transition-[colors,shadow,opacity,transform] flex items-center justify-center shadow-sm cursor-pointer"
                            title="Search"
                        >
                            <Search className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        {/* Blue Filter Button & Dropdown */}
                        <div className="relative" ref={filterMenuRef}>
                            <button
                                type="button"
                                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                                className={`relative bg-gradient-to-r from-[#00629D] to-[#3F96DD] hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] active:scale-[0.97] text-white p-3 rounded-[4px] transition-[colors,shadow,opacity,transform] flex items-center justify-center shadow-sm cursor-pointer ${activeFiltersCount > 0 ? 'ring-2 ring-offset-1 ring-[#00629D]' : ''}`}
                                title="Filter Vessels"
                            >
                                <Filter className="w-4 h-4 fill-white stroke-none" />
                                {activeFiltersCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D93A2B] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Menu for Category, Area & Status Filtering with Checkboxes inside each dropdown */}
                            {isFilterMenuOpen && (
                                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-[#E5E7EB] rounded-[8px] shadow-xl z-30 p-4 font-['Hanken_Grotesk'] space-y-4">
                                    <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                                        <span className="text-[12px] font-['JetBrains_Mono'] font-bold text-[#141B2C] uppercase tracking-wider">
                                            Filter Vessels
                                        </span>
                                        {activeFiltersCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCategories([]);
                                                    setSelectedAreas([]);
                                                    setSelectedStatuses([]);
                                                    setOpenSubDropdown(null);
                                                }}
                                                className="text-[11px] font-['JetBrains_Mono'] text-[#D93A2B] hover:underline font-semibold cursor-pointer"
                                            >
                                                Reset All ({activeFiltersCount})
                                            </button>
                                        )}
                                    </div>

                                    {/* 1. Category Multi-Select Dropdown with Checkboxes */}
                                    <div>
                                        <label className="block text-[11px] font-['JetBrains_Mono'] font-bold text-[#8AAFC8] uppercase mb-1.5">
                                            Vessel Type {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                                        </label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setOpenSubDropdown(openSubDropdown === 'category' ? null : 'category')}
                                                className="w-full flex items-center justify-between border border-[#E5E7EB] rounded-[4px] px-3 py-2 text-[13px] bg-white text-[#141B2C] hover:border-[#00629D] transition-colors cursor-pointer"
                                            >
                                                <span className="truncate font-medium text-left">
                                                    {selectedCategories.length === 0
                                                        ? "All Vessel Types"
                                                        : `${selectedCategories.length} Selected`}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openSubDropdown === 'category' ? 'rotate-180' : ''}`} />
                                            </button>

                                            {openSubDropdown === 'category' && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-[6px] shadow-lg z-40 p-2 max-h-48 overflow-y-auto space-y-1">
                                                    <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs font-bold border-b border-slate-100 pb-1.5 mb-1 text-[#00629D]">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.length === 0}
                                                            onChange={() => setSelectedCategories([])}
                                                            className="w-3.5 h-3.5 rounded text-[#00629D] focus:ring-[#00629D] border-slate-300 cursor-pointer"
                                                        />
                                                        <span>All Vessel Types</span>
                                                    </label>
                                                    {categories.filter(c => c !== 'All').map((cat) => {
                                                        const isChecked = selectedCategories.includes(cat);
                                                        return (
                                                            <label
                                                                key={cat}
                                                                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 cursor-pointer text-xs text-[#141B2C] transition-colors"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => {
                                                                        if (isChecked) {
                                                                            setSelectedCategories(prev => prev.filter(c => c !== cat));
                                                                        } else {
                                                                            setSelectedCategories(prev => [...prev, cat]);
                                                                        }
                                                                    }}
                                                                    className="w-3.5 h-3.5 rounded text-[#00629D] focus:ring-[#00629D] border-slate-300 cursor-pointer"
                                                                />
                                                                <span className={isChecked ? "font-bold text-[#00629D]" : ""}>{cat}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 2. Operating Area Multi-Select Dropdown with Checkboxes */}
                                    <div>
                                        <label className="block text-[11px] font-['JetBrains_Mono'] font-bold text-[#8AAFC8] uppercase mb-1.5">
                                            Operating Area {selectedAreas.length > 0 && `(${selectedAreas.length})`}
                                        </label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setOpenSubDropdown(openSubDropdown === 'area' ? null : 'area')}
                                                className="w-full flex items-center justify-between border border-[#E5E7EB] rounded-[4px] px-3 py-2 text-[13px] bg-white text-[#141B2C] hover:border-[#00629D] transition-colors cursor-pointer"
                                            >
                                                <span className="truncate font-medium text-left">
                                                    {selectedAreas.length === 0
                                                        ? "All Operating Areas"
                                                        : `${selectedAreas.length} Selected`}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openSubDropdown === 'area' ? 'rotate-180' : ''}`} />
                                            </button>

                                            {openSubDropdown === 'area' && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-[6px] shadow-lg z-40 p-2 max-h-48 overflow-y-auto space-y-1">
                                                    <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs font-bold border-b border-slate-100 pb-1.5 mb-1 text-[#00629D]">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedAreas.length === 0}
                                                            onChange={() => setSelectedAreas([])}
                                                            className="w-3.5 h-3.5 rounded text-[#00629D] focus:ring-[#00629D] border-slate-300 cursor-pointer"
                                                        />
                                                        <span>All Operating Areas</span>
                                                    </label>
                                                    {areas.filter(a => a !== 'All').map((area) => {
                                                        const isChecked = selectedAreas.includes(area);
                                                        return (
                                                            <label
                                                                key={area}
                                                                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 cursor-pointer text-xs text-[#141B2C] transition-colors"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => {
                                                                        if (isChecked) {
                                                                            setSelectedAreas(prev => prev.filter(a => a !== area));
                                                                        } else {
                                                                            setSelectedAreas(prev => [...prev, area]);
                                                                        }
                                                                    }}
                                                                    className="w-3.5 h-3.5 rounded text-[#00629D] focus:ring-[#00629D] border-slate-300 cursor-pointer"
                                                                />
                                                                <span className={isChecked ? "font-bold text-[#00629D]" : ""}>{area}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 3. Vessel Status Multi-Select Dropdown with Checkboxes */}
                                    <div>
                                        <label className="block text-[11px] font-['JetBrains_Mono'] font-bold text-[#8AAFC8] uppercase mb-1.5">
                                            Vessel Status {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}
                                        </label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setOpenSubDropdown(openSubDropdown === 'status' ? null : 'status')}
                                                className="w-full flex items-center justify-between border border-[#E5E7EB] rounded-[4px] px-3 py-2 text-[13px] bg-white text-[#141B2C] hover:border-[#00629D] transition-colors cursor-pointer"
                                            >
                                                <span className="truncate font-medium text-left">
                                                    {selectedStatuses.length === 0
                                                        ? "All Vessel Statuses"
                                                        : `${selectedStatuses.length} Selected`}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openSubDropdown === 'status' ? 'rotate-180' : ''}`} />
                                            </button>

                                            {openSubDropdown === 'status' && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-[6px] shadow-lg z-40 p-2 max-h-48 overflow-y-auto space-y-1">
                                                    <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs font-bold border-b border-slate-100 pb-1.5 mb-1 text-[#00629D]">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStatuses.length === 0}
                                                            onChange={() => setSelectedStatuses([])}
                                                            className="w-3.5 h-3.5 rounded text-[#00629D] focus:ring-[#00629D] border-slate-300 cursor-pointer"
                                                        />
                                                        <span>All Vessel Statuses</span>
                                                    </label>
                                                    {statuses.filter(s => s !== 'All').map((st) => {
                                                        const isChecked = selectedStatuses.includes(st);
                                                        const label = formatStatusName(st);
                                                        return (
                                                            <label
                                                                key={st}
                                                                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 cursor-pointer text-xs text-[#141B2C] transition-colors"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => {
                                                                        if (isChecked) {
                                                                            setSelectedStatuses(prev => prev.filter(s => s !== st));
                                                                        } else {
                                                                            setSelectedStatuses(prev => [...prev, st]);
                                                                        }
                                                                    }}
                                                                    className="w-3.5 h-3.5 rounded text-[#00629D] focus:ring-[#00629D] border-slate-300 cursor-pointer"
                                                                />
                                                                <span className={isChecked ? "font-bold text-[#00629D]" : ""}>{label}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Fleet Cards Grid */}
                {filteredFleets.length === 0 ? (
                    <div className="py-14 text-center bg-[#F9FAFB] rounded-[8px] border border-dashed border-[#E5E7EB]">
                        <Ship className="w-10 h-10 text-slate-400 mx-auto mb-3 stroke-[1.5]" />
                        <h3 className="font-['Hanken_Grotesk'] font-bold text-lg text-[#141B2C] mb-1">
                            No Vessels Match Your Search or Filters
                        </h3>
                        <p className="text-[14px] text-[#404750] max-w-md mx-auto mb-5 font-['Hanken_Grotesk'] leading-relaxed">
                            Try searching for another vessel name, IMO number (e.g. 9821158), or reset your active filters.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategories([]);
                                setSelectedAreas([]);
                                setSelectedStatuses([]);
                                setOpenSubDropdown(null);
                            }}
                            className="px-4 py-2 bg-[#00629D] text-white text-xs font-semibold rounded-[4px] hover:bg-[#004e7e] transition-colors cursor-pointer"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {paginatedFleets.map((vessel, idx) => (
                            <motion.div
                                key={vessel.id || idx}
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="group bg-white rounded-[8px] border border-[#E5E7EB] hover:border-[#00629D] hover:shadow-[0_6px_20px_rgba(0,98,157,0.15)] transition-[colors,shadow,opacity,transform] duration-300 overflow-hidden flex flex-col justify-between"
                            >
                                <div>
                                    {/* Vessel Image Container with Neutral Background behind */}
                                    <div className="relative h-52 bg-slate-100 overflow-hidden">
                                        <img
                                            src={resolveFleetImage(vessel)}
                                            alt={vessel.ship_name || vessel.name || 'Vessel'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.currentTarget.src = '/images/card_bulk_vessel.png';
                                            }}
                                        />
                                        <div className="absolute top-3 left-3 bg-[#141B2C]/80 backdrop-blur-md px-2.5 py-1 rounded-[4px] font-['JetBrains_Mono'] text-[11px] text-white font-bold uppercase tracking-wider">
                                            {vessel.status ? vessel.status.replace(/_/g, ' ').toUpperCase() : 'Status N/A'}
                                        </div>
                                    </div>

                                    {/* Spec Content */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-['Hanken_Grotesk'] font-bold text-[20px] text-[#141B2C] mb-1">
                                                {vessel.ship_name || vessel.name || 'Vessel Name N/A'}
                                            </h3>
                                            <div className="font-['Hanken_Grotesk'] font-medium text-[14px] text-[#404750]"> IMO: <span className="font-['JetBrains_Mono']"> {vessel.imo_number || 'IMO No. N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="font-['Hanken_Grotesk'] font-medium text-[14px] text-[#404750] mb-4">Type: <span> {vessel.vessel_type || 'Vessel Type N/A'}</span>
                                        </div>

                                        {/* Specs Box Grid */}
                                        <div className="grid grid-cols-2 gap-2 text-[12px] font-['JetBrains_Mono'] mb-4">
                                            <div>
                                                <span className="text-[#00629D] block uppercase">DEADWEIGHT</span>
                                                <span className="font-bold text-[#141B2C] text-[13px]">
                                                    {(() => {
                                                        const dwtVal = Number(vessel.dwt || vessel.deadweight || 0);
                                                        return dwtVal > 0 ? `${dwtVal.toLocaleString()} DWT` : 'Deadweight N/A';
                                                    })()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[#00629D] block uppercase">BUILD YEAR</span>
                                                <span className="font-bold text-[#141B2C] text-[13px]">
                                                    {vessel.build_year || vessel.year || 'Build Year N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[#00629D] block uppercase">CAPACITY</span>
                                                <span className="font-bold text-[#141B2C] text-[13px]">
                                                    {(() => {
                                                        if (!vessel.capacity) return 'Capacity N/A';
                                                        const strCap = String(vessel.capacity).trim();
                                                        if (!strCap || strCap === '0') return 'Capacity N/A';
                                                        const unitMatch = strCap.match(/(M3|M³|MT|CBM|Tons)/i);
                                                        const unit = unitMatch ? unitMatch[0].toUpperCase() : 'MT';
                                                        const numPart = parseFloat(strCap.replace(/[^0-9.]/g, ''));
                                                        if (isNaN(numPart) || numPart <= 0) return 'Capacity N/A';
                                                        return `${numPart.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${unit}`;
                                                    })()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[#00629D] block uppercase">CLASS. SOCIETY</span>
                                                <span className="font-bold text-[#141B2C] text-[13px] truncate block" title={vessel.vessel_type || vessel.category?.name || vessel.type || 'N/A'}>
                                                    {vessel.classification_society || 'Class N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="font-['Hanken_Grotesk'] text-[14px] text-[#404750] leading-relaxed line-clamp-3">
                                            {vessel.description || 'Description N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 pt-0">
                                    <Link
                                        href={`/fleets/${vessel.id || 1}`}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] text-white transition-colors duration-200 rounded-[4px] py-2.5 font-['Hanken_Grotesk'] font-semibold text-[17px] "
                                    >
                                        See Vessel Detail
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls Matching Welcome.jsx Featured Fleet */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 font-['Hanken_Grotesk']">
                        <div className="text-[13px] text-[#404750] font-['JetBrains_Mono']">
                            Showing <span className="font-bold text-[#141B2C]">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-[#141B2C]">{Math.min(currentPage * itemsPerPage, filteredFleets.length)}</span> of <span className="font-bold text-[#141B2C]">{filteredFleets.length}</span> vessels
                        </div>

                        <div className="flex items-center gap-2 font-['Hanken_Grotesk']">
                            <button
                                type="button"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] text-[14px] font-['Hanken_Grotesk'] font-bold flex items-center justify-center bg-white hover:bg-slate-50 text-[#141B2C] border border-[#E5E7EB] disabled:opacity-40 disabled:cursor-not-allowed transition-[colors,shadow,opacity,transform] cursor-pointer"
                                title="Previous Page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] text-[14px] font-['Hanken_Grotesk'] font-bold flex items-center justify-center transition-[colors,shadow,opacity,transform] cursor-pointer ${currentPage === page
                                        ? 'bg-gradient-to-r from-[#D93A2B] to-[#FF5542] text-white shadow-xs border border-transparent'
                                        : 'bg-white hover:bg-slate-50 text-[#141B2C] border border-[#E5E7EB]'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] text-[14px] font-['Hanken_Grotesk'] font-bold flex items-center justify-center bg-white hover:bg-slate-50 text-[#141B2C] border border-[#E5E7EB] disabled:opacity-40 disabled:cursor-not-allowed transition-[colors,shadow,opacity,transform] cursor-pointer"
                                title="Next Page"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

            </motion.section>

            {/* 3. CTA BANNER SECTION */}
            <CtaBanner
                title="Need Custom Tonnage or Dedicated Time Charter?"
                description="Our commercial desk is ready to evaluate your cargo schedule, destination ports, and volume requirements."
                buttonLabel="Request Charter Proposal"
                buttonRoute="public.contacts"
            />

            {/* 4. VOYAGE ROUTE INSPECTION MODAL */}
            <Modal show={isMapModalOpen} onClose={closeMapModal} maxWidth="4xl">
                <div className="p-5 sm:p-6 font-['Hanken_Grotesk'] text-[#141B2C] max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-5">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-lg font-bold text-[#141B2C]">
                                Live Location: {mapWaypoint?.vessel || mapWaypoint?.name}
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
                                            <span className="font-bold text-[#141B2C]">{Number(mapWaypoint.lat || 0).toFixed(6)}°</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[10px]">Longitude</span>
                                            <span className="font-bold text-[#141B2C]">{Number(mapWaypoint.lng || 0).toFixed(6)}°</span>
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
        </GuestLayout>
    );
}

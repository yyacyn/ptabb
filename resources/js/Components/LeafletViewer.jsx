import { useEffect, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import { MapPin, Navigation, Ship } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Lucide React MapPin Icon for Leaflet Default Markers
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



export default function LeafletViewer({ waypoint, height = "h-[240px]" }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const liveMarkerRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current || !waypoint) return;

        const routePoints = waypoint.route_points || [];
        const lat = parseFloat(waypoint.lat) || 0;
        const lng = parseFloat(waypoint.lng) || 0;
        const heading = waypoint.cog || 0;
        const vesselName = waypoint.vessel || waypoint.name || 'Vessel';

        const shipIconHtml = renderToString(<Ship size={15} style={{ color: '#00629D', display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />);

        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current, { minZoom: 2 }).setView([lat, lng], 6);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                minZoom: 2,
                maxZoom: 18,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(mapInstance.current);

            // Draw clean route polyline
            if (routePoints.length > 1) {
                const latLngs = routePoints.map(p => [p.lat, p.lng]);

                const polyline = L.polyline(latLngs, {
                    color: '#00629D',
                    weight: 3.5,
                    opacity: 0.85,
                    dashArray: '6, 6',
                }).addTo(mapInstance.current);

                mapInstance.current.fitBounds(polyline.getBounds(), { padding: [30, 30] });
            }

            const weatherInfo = waypoint.weather ? `<br/><span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #059669;">Weather: ${waypoint.weather.weather}, ${waypoint.weather.temperature}</span>` : '';
            const popupContent = `
                <div style="font-family: 'Hanken Grotesk', sans-serif; color: #141B2C; padding: 2px;">
                    <strong style="font-size: 14px; font-weight: 700;">${shipIconHtml}${vesselName}</strong><br/>
                    <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #404750;">Speed: ${waypoint.speed || '0 knots'}</span><br/>
                    <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #404750;">Heading: ${heading}°</span><br/>
                    <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #404750;">Status: ${waypoint.status || 'En Route'}</span>
                    ${weatherInfo}
                </div>
            `;
            liveMarkerRef.current = L.marker([lat, lng], {
                icon: createVesselIcon(vesselName, heading),
                zIndexOffset: 1000
            })
                .addTo(mapInstance.current)
                .bindPopup(popupContent)
                .openPopup();
        } else {
            // Live position dynamic update on poll
            if (liveMarkerRef.current) {
                liveMarkerRef.current.setLatLng([lat, lng]);
                liveMarkerRef.current.setIcon(createVesselIcon(vesselName, heading));
            }
        }
    }, [waypoint]);

    useEffect(() => {
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    return <div ref={mapRef} className={`${height} w-full z-0 relative`} />;
}

import WebSocket from 'ws';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.AISSTREAM_API_KEY || '666b254061b6b92bdee7c7194ae642b2d630997a';
const BACKEND_URLS = [
    'http://127.0.0.1:8000/api/ais/ingest',
    'http://ptabb.test/api/ais/ingest',
    'http://localhost:8000/api/ais/ingest'
];

console.log("====================================================");
console.log("  PT. ABB — AISStream.io Live Telemetry Sync        ");
console.log("====================================================");

const socket = new WebSocket("wss://stream.aisstream.io/v0/stream");

socket.onopen = function (_) {
    console.log(" Connected to wss://stream.aisstream.io/v0/stream");
    
    let subscriptionMessage = {
        Apikey: API_KEY,
        BoundingBoxes: [[[-90, -180], [90, 180]]],
        FilterMessageTypes: ["PositionReport", "StandardClassBPositionReport", "ExtendedClassBPositionReport"]
    };
    
    socket.send(JSON.stringify(subscriptionMessage));
    console.log(" Active Subscription Sent: Streaming Live AIS Broadcasts...");
};

async function sendToBackend(payload) {
    for (const url of BACKEND_URLS) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                if (data.status === 'success') {
                    console.log(`✔ [Updated Database Vessel] ${data.vessel} (IMO: ${data.imo || 'N/A'}) -> Lat: ${data.coordinates.lat}, Lng: ${data.coordinates.lng} | Speed: ${data.sog} kts`);
                }
                return true;
            }
        } catch (e) {
            // Try next fallback URL silently
        }
    }
    return false;
}

socket.onmessage = function (event) {
    try {
        let aisMessage = JSON.parse(event.data);
        const msgType = aisMessage.MessageType || 'PositionReport';
        const posData = aisMessage.Message?.[msgType] || {};
        const lat = posData.Latitude ?? aisMessage.MetaData?.latitude;
        const lng = posData.Longitude ?? aisMessage.MetaData?.longitude;

        if (lat !== undefined && lng !== undefined) {
            sendToBackend(aisMessage);
        }

    } catch (err) {
        // Ignore JSON parse errors
    }
};

socket.onerror = function (error) {
    console.error("AISStream WebSocket Error:", error.message || error);
};

socket.onclose = function () {
    console.log("AISStream WebSocket connection closed.");
};

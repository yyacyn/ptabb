# Real-Time Vessel Position Sync & Route Logging System

## 1. What Was Done
- **Automated GPS Logging**: Implemented a satellite position synchronization pipeline that continuously fetches live vessel coordinates and logs them as historical waypoints at 1-hour intervals.
- **Provider Fallback Handling**: Built a multi-provider fallback chain (`primary` -> `fallback_1` -> `fallback_2`) so that position and weather data remain available even if the primary satellite link is offline.
- **Leaflet Route Polylines**: Connected historical vessel waypoints on Leaflet maps using a clean ocean-blue dashed polyline with automatic bounds fitting.
- **Paginated History Log Table**: Added a modal log table displaying sequence numbers, timestamps, GPS coordinates, heading (COG), speed (SOG), and weather conditions with 5-item client-side pagination.
- **Un-tracked Vessel Filtering**: Removed hardcoded fallback coordinates to prevent vessels without live telemetry from stacking on the map.

## 2. How It Works
- **Satellite API Client**: Communicates with the remote telemetry endpoint using 15-second timeouts, Chrome browser headers, and SSL verification bypass for cPanel shared hosting compatibility.
- **Cron Sync Command**: A scheduled Artisan command runs periodically. For each vessel, it checks the `created_at` timestamp of the latest logged waypoint:
  - If the last ping is 60 minutes or older, it creates a new waypoint record (`sequence = max + 1`).
  - If within the current hour, it updates the active waypoint's coordinates and telemetry notes.
- **HTTP Endpoint**: Exposes a GET route `/api/sailink/sync` to allow cPanel HTTP cron triggers to execute the sync command.
- **Frontend Inertia React Component**: Receives route points, extracts heading and weather data, renders the rotated navigation pointer marker for live position, draws the route line, and displays the paginated log table.

## 3. Why It Was Implemented This Way
- **1-Hour Logging Interval**: Vessels cruising at 10–20 knots cover ~10–20 nautical miles per hour. A 1-hour interval creates smooth coastal route polylines that follow actual sea channels without cutting across land, while generating a lightweight database footprint of ~24 rows per vessel per day.
- **Clean Map Line (No Intermediate Pins)**: Intermediate pins clutter the map layout. Removing them leaves a clean polyline with only the active vessel pointer displayed.
- **Null Coordinates Instead of Fallbacks**: Setting missing coordinates to `null` prevents un-tracked vessels from clustering at dummy lat/lng points on the map.

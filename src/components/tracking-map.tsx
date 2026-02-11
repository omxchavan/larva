"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const currentIcon = L.divIcon({
    html: `<div style="width:16px;height:16px;background:#FC4C02;border:3px solid white;border-radius:50%;box-shadow:0 0 12px rgba(252,76,2,0.6)"></div>`,
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

const startIcon = L.divIcon({
    html: `<div style="width:12px;height:12px;background:#22c55e;border:2px solid white;border-radius:50%;box-shadow:0 0 8px rgba(34,197,94,0.5)"></div>`,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
});

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 0.5 });
    }, [center, zoom, map]);
    return null;
}

interface TrackingMapProps {
    coordinates: [number, number][];
    currentPos: [number, number] | null;
    isTracking: boolean;
}

export default function TrackingMap({ coordinates, currentPos, isTracking }: TrackingMapProps) {
    const center = currentPos || [20.5937, 78.9629];

    return (
        <MapContainer
            center={center}
            zoom={16}
            className="w-full h-full"
            zoomControl={false}
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
            />
            {currentPos && <MapUpdater center={currentPos} zoom={16} />}
            {coordinates.length > 1 && (
                <Polyline
                    positions={coordinates}
                    pathOptions={{ color: "#FC4C02", weight: 4, opacity: 0.9 }}
                />
            )}
            {coordinates.length > 0 && (
                <Marker position={coordinates[0]} icon={startIcon} />
            )}
            {currentPos && isTracking && (
                <Marker position={currentPos} icon={currentIcon} />
            )}
        </MapContainer>
    );
}

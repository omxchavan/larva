"use client";

import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const startIcon = L.divIcon({
    html: `<div style="width:14px;height:14px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(34,197,94,0.5)"></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const endIcon = L.divIcon({
    html: `<div style="width:14px;height:14px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(239,68,68,0.5)"></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

interface RouteMapProps {
    coordinates: [number, number][];
}

export default function RouteMap({ coordinates }: RouteMapProps) {
    if (!coordinates || coordinates.length === 0) return null;

    const bounds = L.latLngBounds(coordinates.map((c) => [c[0], c[1]]));

    return (
        <MapContainer
            bounds={bounds}
            boundsOptions={{ padding: [30, 30] }}
            className="w-full h-full"
            zoomControl={false}
            attributionControl={false}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
            <Polyline positions={coordinates} pathOptions={{ color: "#FC4C02", weight: 4, opacity: 0.9 }} />
            <Marker position={coordinates[0]} icon={startIcon} />
            <Marker position={coordinates[coordinates.length - 1]} icon={endIcon} />
        </MapContainer>
    );
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatDistance(meters: number): string {
    if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
    return `${Math.round(meters)} m`;
}

export function formatPace(metersPerSecond: number): string {
    if (metersPerSecond <= 0) return "--:--";
    const minPerKm = 1000 / metersPerSecond / 60;
    const mins = Math.floor(minPerKm);
    const secs = Math.round((minPerKm - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")} /km`;
}

export function formatSpeed(metersPerSecond: number): string {
    return `${(metersPerSecond * 3.6).toFixed(1)} km/h`;
}

export function calculateCalories(distanceMeters: number, durationSeconds: number, weightKg: number = 70): number {
    const hours = durationSeconds / 3600;
    const speedKmh = (distanceMeters / 1000) / hours;
    let met = 7.0;
    if (speedKmh < 8) met = 6.0;
    else if (speedKmh < 10) met = 8.3;
    else if (speedKmh < 12) met = 9.8;
    else if (speedKmh < 14) met = 11.0;
    else met = 12.8;
    return Math.round(met * weightKg * hours);
}

export function calculateElevation(coordinates: [number, number][]): { gain: number; loss: number } {
    let gain = 0;
    let loss = 0;
    for (let i = 1; i < coordinates.length; i++) {
        const diff = (coordinates[i][1] || 0) - (coordinates[i - 1][1] || 0);
        if (diff > 0) gain += diff;
        else loss += Math.abs(diff);
    }
    return { gain: Math.round(gain), loss: Math.round(loss) };
}

export function getDistanceBetweenPoints(
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function timeAgo(date: Date | string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Play,
    Pause,
    Square,
    MapPin,
    Clock,
    Gauge,
    TrendingUp,
    Loader2,
    Navigation,
    Maximize2,
} from "lucide-react";
import { formatDistance, formatDuration, formatPace, formatSpeed, getDistanceBetweenPoints, calculateCalories } from "@/lib/utils";
import dynamic from "next/dynamic";

const TrackingMap = dynamic(() => import("@/components/tracking-map"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-card flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
    ),
});

type TrackingState = "idle" | "tracking" | "paused" | "saving";

export default function TrackPage() {
    const [state, setState] = useState<TrackingState>("idle");
    const [coordinates, setCoordinates] = useState<[number, number][]>([]);
    const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState(0);
    const [speeds, setSpeeds] = useState<number[]>([]);
    const [activityType, setActivityType] = useState<"run" | "walk" | "cycle" | "hike">("run");
    const [title, setTitle] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const watchIdRef = useRef<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastPosRef = useRef<{ lat: number; lon: number; time: number } | null>(null);

    const startTracking = useCallback(() => {
        if (!navigator.geolocation) {
            alert("Geolocation not supported");
            return;
        }

        setState("tracking");
        const start = Date.now() - duration * 1000;

        timerRef.current = setInterval(() => {
            setDuration(Math.floor((Date.now() - start) / 1000));
        }, 1000);

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const newPos: [number, number] = [latitude, longitude];
                setCurrentPos(newPos);

                if (lastPosRef.current) {
                    const d = getDistanceBetweenPoints(
                        lastPosRef.current.lat,
                        lastPosRef.current.lon,
                        latitude,
                        longitude
                    );
                    const timeDiff = (Date.now() - lastPosRef.current.time) / 1000;
                    const speed = timeDiff > 0 ? d / timeDiff : 0;

                    if (d > 3) {
                        setDistance((prev) => prev + d);
                        setCoordinates((prev) => [...prev, newPos]);
                        setSpeeds((prev) => [...prev, speed]);
                        lastPosRef.current = { lat: latitude, lon: longitude, time: Date.now() };
                    }
                } else {
                    lastPosRef.current = { lat: latitude, lon: longitude, time: Date.now() };
                    setCoordinates([newPos]);
                }
            },
            (err) => console.error("Geo error:", err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, [duration]);

    const pauseTracking = () => {
        setState("paused");
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const resumeTracking = () => {
        startTracking();
    };

    const stopTracking = async () => {
        setState("saving");
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        if (timerRef.current) clearInterval(timerRef.current);

        const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
        const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
        const calories = calculateCalories(distance, duration);

        const activityTitle = title || `${activityType === "run" ? "Afternoon Run" : activityType === "walk" ? "Walk" : activityType === "cycle" ? "Ride" : "Hike"}`;

        try {
            const res = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: activityTitle,
                    type: activityType,
                    distance,
                    duration,
                    avgSpeed,
                    maxSpeed,
                    avgPace: avgSpeed > 0 ? 1000 / avgSpeed : 0,
                    calories,
                    coordinates,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                window.location.href = `/activity/${data.activity._id}`;
            }
        } catch (err) {
            console.error("Save error:", err);
            setState("paused");
        }
    };

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
    const currentSpeed = speeds.length > 0 ? speeds[speeds.length - 1] : 0;

    return (
        <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
            <div className={`${isFullscreen ? "h-screen" : "h-[calc(100vh-3.5rem)] lg:h-screen"} flex flex-col`}>
                {/* Map */}
                <div className="flex-1 relative">
                    <TrackingMap coordinates={coordinates} currentPos={currentPos} isTracking={state === "tracking"} />

                    {/* Fullscreen toggle */}
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="absolute top-4 right-4 z-30 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2 hover:bg-muted transition-colors cursor-pointer"
                    >
                        <Maximize2 className="w-5 h-5" />
                    </button>

                    {/* Live indicator */}
                    {state === "tracking" && (
                        <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 rounded-full bg-white pulse-ring" />
                            LIVE
                        </div>
                    )}
                </div>

                {/* Controls Panel */}
                <motion.div
                    layout
                    className="glass border-t border-border p-4 lg:p-6"
                >
                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                                <MapPin className="w-3 h-3" /> Distance
                            </div>
                            <div className="text-lg lg:text-2xl font-bold font-mono">{formatDistance(distance)}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                                <Clock className="w-3 h-3" /> Duration
                            </div>
                            <div className="text-lg lg:text-2xl font-bold font-mono">{formatDuration(duration)}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Pace
                            </div>
                            <div className="text-lg lg:text-2xl font-bold font-mono">{formatPace(avgSpeed)}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                                <Gauge className="w-3 h-3" /> Speed
                            </div>
                            <div className="text-lg lg:text-2xl font-bold font-mono">{formatSpeed(currentSpeed)}</div>
                        </div>
                    </div>

                    {/* Activity Type & Title (idle) */}
                    {state === "idle" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mb-4">
                            <div className="flex gap-2 justify-center">
                                {(["run", "walk", "cycle", "hike"] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setActivityType(t)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all cursor-pointer ${activityType === t
                                                ? "bg-accent text-white shadow-lg shadow-accent/20"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Activity title (optional)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                            />
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4">
                        <AnimatePresence mode="wait">
                            {state === "idle" && (
                                <motion.div key="start" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                                    <Button
                                        onClick={startTracking}
                                        size="lg"
                                        className="gradient-accent border-0 h-16 w-16 rounded-full shadow-xl shadow-accent/40 glow-accent"
                                    >
                                        <Play className="w-7 h-7 ml-0.5" />
                                    </Button>
                                </motion.div>
                            )}
                            {state === "tracking" && (
                                <motion.div key="tracking" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex gap-4">
                                    <Button onClick={pauseTracking} size="lg" variant="secondary" className="h-16 w-16 rounded-full">
                                        <Pause className="w-7 h-7" />
                                    </Button>
                                    <Button onClick={stopTracking} size="lg" className="bg-red-500 hover:bg-red-600 h-16 w-16 rounded-full">
                                        <Square className="w-6 h-6" />
                                    </Button>
                                </motion.div>
                            )}
                            {state === "paused" && (
                                <motion.div key="paused" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex gap-4">
                                    <Button onClick={resumeTracking} size="lg" className="gradient-accent border-0 h-16 w-16 rounded-full glow-accent">
                                        <Play className="w-7 h-7 ml-0.5" />
                                    </Button>
                                    <Button onClick={stopTracking} size="lg" className="bg-red-500 hover:bg-red-600 h-16 w-16 rounded-full">
                                        <Square className="w-6 h-6" />
                                    </Button>
                                </motion.div>
                            )}
                            {state === "saving" && (
                                <motion.div key="saving" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                                    <Button disabled size="lg" className="h-16 w-16 rounded-full">
                                        <Loader2 className="w-7 h-7 animate-spin" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

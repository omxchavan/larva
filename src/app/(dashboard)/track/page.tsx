"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Play,
    Pause,
    Square,
    MapPin,
    Gauge,
    Loader2,
    Maximize2,
    Minimize2,
    Footprints,
    Bike,
    MountainSnow,
} from "lucide-react";
import { formatDistance, formatDuration, formatPace, getDistanceBetweenPoints, calculateCalories } from "@/lib/utils";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const TrackingMap = dynamic(() => import("@/components/tracking-map"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-card flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
    ),
});

type TrackingState = "idle" | "tracking" | "paused" | "saving";
type ActivityType = "run" | "walk" | "cycle" | "hike";

const activityConfig: Record<ActivityType, { icon: React.ReactNode; label: string }> = {
    run: { icon: <img src="https://img.icons8.com/ios-filled/50/ffffff/running.png" className="w-5 h-5 invert" alt="run" />, label: "Run" },
    walk: { icon: <Footprints className="w-5 h-5" />, label: "Walk" },
    cycle: { icon: <Bike className="w-5 h-5" />, label: "Cycle" },
    hike: { icon: <MountainSnow className="w-5 h-5" />, label: "Hike" },
};

export default function TrackPage() {
    const [state, setState] = useState<TrackingState>("idle");
    const [coordinates, setCoordinates] = useState<[number, number][]>([]);
    const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState(0);
    const [speeds, setSpeeds] = useState<number[]>([]);
    const [activityType, setActivityType] = useState<ActivityType>("run");
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

        const activityTitle = title || `${activityType === "run" ? "Run" : activityType === "walk" ? "Walk" : activityType === "cycle" ? "Ride" : "Hike"} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

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

    return (
        <div className={cn("relative flex flex-col transition-all duration-300", isFullscreen ? "fixed inset-0 z-50 bg-background" : "h-[calc(100vh-4rem)] lg:h-screen")}>

            {/* Map Layer */}
            <div className="absolute inset-0 z-0">
                <TrackingMap coordinates={coordinates} currentPos={currentPos} isTracking={state === "tracking"} />
                {/* Gradient Overlays for integration */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background/80 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
            </div>

            {/* Header Controls */}
            <div className="relative z-10 p-4 flex justify-between items-start pointer-events-none">
                {state === "tracking" && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/10 shadow-lg"
                    >
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-bold tracking-wider">LIVE RECORDING</span>
                    </motion.div>
                )}

                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="ml-auto pointer-events-auto w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors shadow-lg"
                >
                    {isFullscreen ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
                </button>
            </div>

            {/* Main Stats Area (Center-Bottom) */}
            <div className="relative z-10 mt-auto w-full max-w-lg mx-auto p-6 pb-8">
                <AnimatePresence mode="wait">
                    {/* Activity Selection (Idle State) */}
                    {state === "idle" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="space-y-6"
                        >
                            <div className="glass rounded-2xl p-1.5 flex gap-1">
                                {(["run", "walk", "cycle", "hike"] as ActivityType[]).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setActivityType(t)}
                                        className={cn(
                                            "flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                                            activityType === t ? "text-white shadow-lg" : "text-muted-foreground hover:bg-white/5"
                                        )}
                                    >
                                        {activityType === t && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-accent gradient-accent"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-10">{activityConfig[t].icon}</span>
                                        <span className="relative z-10 text-xs font-semibold">{activityConfig[t].label}</span>
                                    </button>
                                ))}
                            </div>

                            <input
                                type="text"
                                placeholder="Give it a name (optional)..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-center"
                            />
                        </motion.div>
                    )}

                    {/* Live Metrics (Active/Paused) */}
                    {(state === "tracking" || state === "paused") && (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="grid grid-cols-2 gap-4 mb-8"
                        >
                            {/* Primary Metric - Duration */}
                            <div className="col-span-2 text-center mb-2">
                                <p className="text-white/60 text-xs font-bold tracking-widest uppercase mb-1">Time Elapsed</p>
                                <h2 className="text-7xl font-black text-white tabular-nums tracking-tighter drop-shadow-lg">
                                    {formatDuration(duration)}
                                </h2>
                            </div>

                            {/* Secondary Metrics */}
                            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10 text-center">
                                <div className="flex items-center justify-center gap-1 text-accent mb-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Distance</span>
                                </div>
                                <p className="text-2xl font-bold text-white tabular-nums">{formatDistance(distance)}</p>
                            </div>
                            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10 text-center">
                                <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                                    <Gauge className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Pace</span>
                                </div>
                                <p className="text-2xl font-bold text-white tabular-nums">{formatPace(avgSpeed)}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Control Buttons */}
                <div className="mt-8 flex justify-center items-center gap-6">
                    <AnimatePresence mode="wait">
                        {state === "idle" && (
                            <motion.div key="start" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                                <Button
                                    onClick={startTracking}
                                    size="lg"
                                    className="w-20 h-20 rounded-full gradient-accent border-0 shadow-[0_0_40px_-5px_var(--color-accent)] hover:shadow-[0_0_60px_-10px_var(--color-accent)] hover:scale-105 transition-all duration-300"
                                >
                                    <Play className="w-8 h-8 ml-1 fill-white text-white" />
                                </Button>
                            </motion.div>
                        )}

                        {(state === "tracking" || state === "paused") && (
                            <motion.div key="controls" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex gap-6">
                                {state === "tracking" ? (
                                    <Button
                                        onClick={pauseTracking}
                                        className="w-20 h-20 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black border-0 shadow-lg hover:scale-105 transition-all"
                                    >
                                        <Pause className="w-8 h-8 fill-black" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={resumeTracking}
                                        className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-400 text-black border-0 shadow-lg hover:scale-105 transition-all"
                                    >
                                        <Play className="w-8 h-8 ml-1 fill-black" />
                                    </Button>
                                )}

                                <Button
                                    onClick={stopTracking}
                                    className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 text-white border-0 shadow-lg hover:scale-105 transition-all"
                                >
                                    <Square className="w-8 h-8 fill-white" />
                                </Button>
                            </motion.div>
                        )}

                        {state === "saving" && (
                            <motion.div key="saving" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

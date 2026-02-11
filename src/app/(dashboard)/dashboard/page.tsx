"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    MapPin,
    Clock,
    Flame,
    TrendingUp,
    Activity,
    ChevronRight,
    Footprints,
    Calendar,
} from "lucide-react";
import { formatDistance, formatDuration, timeAgo } from "@/lib/utils";

interface ActivityItem {
    _id: string;
    title: string;
    type: string;
    distance: number;
    duration: number;
    calories: number;
    avgPace: number;
    createdAt: string;
}

interface Stats {
    totalDistance: number;
    totalDuration: number;
    totalActivities: number;
    totalCalories: number;
    weekDistance: number;
    weekActivities: number;
    monthDistance: number;
    monthActivities: number;
}

const typeIcons: Record<string, string> = {
    run: "🏃",
    walk: "🚶",
    cycle: "🚴",
    hike: "🥾",
};

export default function DashboardPage() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [actRes, statsRes] = await Promise.all([
                    fetch("/api/activities?limit=5"),
                    fetch("/api/stats"),
                ]);
                if (actRes.ok) {
                    const data = await actRes.json();
                    setActivities(data.activities || []);
                }
                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStats(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const statCards = [
        {
            label: "Total Distance",
            value: stats ? formatDistance(stats.totalDistance) : "0 km",
            icon: <MapPin className="w-5 h-5" />,
            color: "text-accent",
            bg: "bg-accent/10",
        },
        {
            label: "Total Time",
            value: stats ? formatDuration(stats.totalDuration) : "0:00",
            icon: <Clock className="w-5 h-5" />,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
        },
        {
            label: "Activities",
            value: stats?.totalActivities?.toString() || "0",
            icon: <Activity className="w-5 h-5" />,
            color: "text-green-400",
            bg: "bg-green-400/10",
        },
        {
            label: "Calories",
            value: stats ? `${stats.totalCalories.toLocaleString()} kcal` : "0 kcal",
            icon: <Flame className="w-5 h-5" />,
            color: "text-red-400",
            bg: "bg-red-400/10",
        },
    ];

    const weeklyCards = [
        {
            label: "This Week",
            value: stats ? formatDistance(stats.weekDistance) : "0 km",
            sub: `${stats?.weekActivities || 0} activities`,
            icon: <Calendar className="w-5 h-5" />,
        },
        {
            label: "This Month",
            value: stats ? formatDistance(stats.monthDistance) : "0 km",
            sub: `${stats?.monthActivities || 0} activities`,
            icon: <TrendingUp className="w-5 h-5" />,
        },
    ];

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 rounded-xl bg-card animate-pulse border border-border" />
                    ))}
                </div>
                <div className="h-64 rounded-xl bg-card animate-pulse border border-border" />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground text-sm mt-1">Your training overview</p>
                </div>
                <Link href="/track">
                    <Button className="gradient-accent border-0 shadow-lg shadow-accent/20">
                        <MapPin className="w-4 h-4 mr-2" />
                        Start Activity
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="hover:border-accent/20 transition-colors">
                            <CardContent className="p-4 lg:p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{card.label}</span>
                                    <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
                                        {card.icon}
                                    </div>
                                </div>
                                <div className="text-2xl lg:text-3xl font-bold">{card.value}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Weekly/Monthly Summary */}
            <div className="grid sm:grid-cols-2 gap-4">
                {weeklyCards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                    >
                        <Card className="hover:border-accent/20 transition-colors">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                    {card.icon}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{card.label}</p>
                                    <p className="text-xl font-bold mt-0.5">{card.value}</p>
                                    <p className="text-xs text-muted-foreground">{card.sub}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activities */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-lg">Recent Activities</CardTitle>
                    <Link href="/feed" className="text-sm text-accent hover:underline flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                    {activities.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Footprints className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium mb-2">No activities yet</p>
                            <p className="text-sm mb-4">Start your first activity to see it here!</p>
                            <Link href="/track">
                                <Button className="gradient-accent border-0">
                                    <MapPin className="w-4 h-4 mr-2" /> Start First Activity
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {activities.map((activity, i) => (
                                <motion.div
                                    key={activity._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link href={`/activity/${activity._id}`}>
                                        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer">
                                            <div className="text-2xl">{typeIcons[activity.type] || "🏃"}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate group-hover:text-accent transition-colors">{activity.title}</p>
                                                <p className="text-xs text-muted-foreground">{timeAgo(activity.createdAt)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold">{formatDistance(activity.distance)}</p>
                                                <p className="text-xs text-muted-foreground">{formatDuration(activity.duration)}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

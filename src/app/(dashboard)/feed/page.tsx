"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Heart,
    MessageCircle,
    MapPin,
    Clock,
    Flame,
    TrendingUp,
    Loader2,
} from "lucide-react";
import { formatDistance, formatDuration, formatPace, timeAgo } from "@/lib/utils";

interface FeedActivity {
    _id: string;
    userId: string;
    username: string;
    avatar: string;
    title: string;
    type: string;
    distance: number;
    duration: number;
    avgPace: number;
    calories: number;
    likes: string[];
    commentCount: number;
    createdAt: string;
    coordinates: [number, number][];
}

const typeEmojis: Record<string, string> = {
    run: "🏃",
    walk: "🚶",
    cycle: "🚴",
    hike: "🥾",
};

export default function FeedPage() {
    const [activities, setActivities] = useState<FeedActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchFeed = async (p: number) => {
        try {
            const res = await fetch(`/api/feed?page=${p}&limit=10`);
            if (res.ok) {
                const data = await res.json();
                if (p === 1) setActivities(data.activities);
                else setActivities((prev) => [...prev, ...data.activities]);
                setHasMore(data.activities.length === 10);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed(1);
    }, []);

    const handleLike = async (activityId: string) => {
        try {
            const res = await fetch(`/api/activities/${activityId}/like`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setActivities((prev) =>
                    prev.map((a) => (a._id === activityId ? { ...a, likes: data.likes } : a))
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-48 rounded-xl bg-card animate-pulse border border-border" />
                ))}
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold mb-2">Activity Feed</h1>

            {activities.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium mb-2">Your feed is empty</p>
                        <p className="text-sm">Follow athletes or start tracking to see activities here.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {activities.map((activity, i) => (
                        <motion.div
                            key={activity._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="overflow-hidden hover:border-accent/20 transition-colors">
                                <CardContent className="p-4">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <Link href={`/profile/${activity.userId}`}>
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={activity.avatar} />
                                                <AvatarFallback>{activity.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div className="flex-1">
                                            <Link href={`/profile/${activity.userId}`} className="font-semibold text-sm hover:text-accent transition-colors">
                                                {activity.username}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">{timeAgo(activity.createdAt)}</p>
                                        </div>
                                        <span className="text-2xl">{typeEmojis[activity.type] || "🏃"}</span>
                                    </div>

                                    {/* Title */}
                                    <Link href={`/activity/${activity._id}`}>
                                        <h3 className="font-bold text-lg mb-3 hover:text-accent transition-colors">{activity.title}</h3>
                                    </Link>

                                    {/* Stats */}
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        <div className="bg-muted rounded-lg p-2 text-center">
                                            <MapPin className="w-3 h-3 mx-auto text-accent mb-1" />
                                            <p className="text-sm font-bold">{formatDistance(activity.distance)}</p>
                                            <p className="text-[10px] text-muted-foreground">Distance</p>
                                        </div>
                                        <div className="bg-muted rounded-lg p-2 text-center">
                                            <Clock className="w-3 h-3 mx-auto text-blue-400 mb-1" />
                                            <p className="text-sm font-bold">{formatDuration(activity.duration)}</p>
                                            <p className="text-[10px] text-muted-foreground">Time</p>
                                        </div>
                                        <div className="bg-muted rounded-lg p-2 text-center">
                                            <TrendingUp className="w-3 h-3 mx-auto text-green-400 mb-1" />
                                            <p className="text-sm font-bold">{formatPace(activity.avgPace)}</p>
                                            <p className="text-[10px] text-muted-foreground">Pace</p>
                                        </div>
                                        <div className="bg-muted rounded-lg p-2 text-center">
                                            <Flame className="w-3 h-3 mx-auto text-red-400 mb-1" />
                                            <p className="text-sm font-bold">{activity.calories}</p>
                                            <p className="text-[10px] text-muted-foreground">Cal</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4 pt-3 border-t border-border">
                                        <button
                                            onClick={() => handleLike(activity._id)}
                                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                                        >
                                            <Heart className={`w-4 h-4 ${activity.likes?.length > 0 ? "fill-red-400 text-red-400" : ""}`} />
                                            {activity.likes?.length || 0}
                                        </button>
                                        <Link href={`/activity/${activity._id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors">
                                            <MessageCircle className="w-4 h-4" />
                                            {activity.commentCount || 0}
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}

                    {hasMore && (
                        <div className="text-center py-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const nextPage = page + 1;
                                    setPage(nextPage);
                                    fetchFeed(nextPage);
                                }}
                            >
                                Load More
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

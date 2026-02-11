"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    MapPin, Clock, Flame, TrendingUp, Gauge, Mountain,
    Heart, MessageCircle, Send, Loader2, Share2,
} from "lucide-react";
import { formatDistance, formatDuration, formatPace, formatSpeed, timeAgo } from "@/lib/utils";
import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("@/components/route-map"), { ssr: false });
const ActivityCharts = dynamic(() => import("@/components/activity-charts"), { ssr: false });

interface ActivityDetail {
    _id: string;
    userId: string;
    title: string;
    type: string;
    distance: number;
    duration: number;
    avgSpeed: number;
    maxSpeed: number;
    avgPace: number;
    calories: number;
    elevationGain: number;
    elevationLoss: number;
    coordinates: [number, number][];
    splits: { km: number; time: number; pace: number; elevation: number }[];
    likes: string[];
    images: string[];
    createdAt: string;
}

interface CommentItem {
    _id: string;
    userId: string;
    username: string;
    avatar: string;
    text: string;
    createdAt: string;
}

export default function ActivityDetailPage() {
    const params = useParams();
    const [activity, setActivity] = useState<ActivityDetail | null>(null);
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivity() {
            try {
                const [actRes, cmtRes] = await Promise.all([
                    fetch(`/api/activities/${params.id}`),
                    fetch(`/api/activities/${params.id}/comments`),
                ]);
                if (actRes.ok) setActivity(await actRes.json());
                if (cmtRes.ok) {
                    const data = await cmtRes.json();
                    setComments(data.comments || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchActivity();
    }, [params.id]);

    const handleLike = async () => {
        if (!activity) return;
        try {
            const res = await fetch(`/api/activities/${activity._id}/like`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setActivity({ ...activity, likes: data.likes });
            }
        } catch (err) { console.error(err); }
    };

    const handleComment = async () => {
        if (!newComment.trim() || !activity) return;
        try {
            const res = await fetch(`/api/activities/${activity._id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: newComment }),
            });
            if (res.ok) {
                const data = await res.json();
                setComments((prev) => [...prev, data.comment]);
                setNewComment("");
            }
        } catch (err) { console.error(err); }
    };

    if (loading) {
        return (
            <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
                <div className="h-64 rounded-xl bg-card animate-pulse border border-border" />
                <div className="h-48 rounded-xl bg-card animate-pulse border border-border" />
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                <p className="text-lg">Activity not found</p>
            </div>
        );
    }

    const typeEmojis: Record<string, string> = { run: "🏃", walk: "🚶", cycle: "🚴", hike: "🥾" };

    return (
        <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{typeEmojis[activity.type] || "🏃"}</span>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold">{activity.title}</h1>
                                <p className="text-sm text-muted-foreground">{new Date(activity.createdAt).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
                            {[
                                { icon: <MapPin className="w-4 h-4 text-accent" />, label: "Distance", value: formatDistance(activity.distance) },
                                { icon: <Clock className="w-4 h-4 text-blue-400" />, label: "Duration", value: formatDuration(activity.duration) },
                                { icon: <TrendingUp className="w-4 h-4 text-green-400" />, label: "Avg Pace", value: formatPace(activity.avgPace) },
                                { icon: <Gauge className="w-4 h-4 text-yellow-400" />, label: "Avg Speed", value: formatSpeed(activity.avgSpeed) },
                                { icon: <Flame className="w-4 h-4 text-red-400" />, label: "Calories", value: `${activity.calories}` },
                                { icon: <Mountain className="w-4 h-4 text-purple-400" />, label: "Elev Gain", value: `${activity.elevationGain}m` },
                            ].map((stat, i) => (
                                <div key={i} className="bg-muted rounded-lg p-3 text-center">
                                    <div className="flex justify-center mb-1">{stat.icon}</div>
                                    <p className="text-sm font-bold">{stat.value}</p>
                                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                            <button onClick={handleLike} className="flex items-center gap-2 text-sm hover:text-red-400 transition-colors cursor-pointer">
                                <Heart className={`w-5 h-5 ${activity.likes?.length > 0 ? "fill-red-400 text-red-400" : "text-muted-foreground"}`} />
                                <span className="font-medium">{activity.likes?.length || 0} likes</span>
                            </button>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MessageCircle className="w-5 h-5" />
                                <span>{comments.length} comments</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Map and Charts */}
            <Tabs defaultValue="map" className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="map" className="flex-1">Route Map</TabsTrigger>
                    <TabsTrigger value="charts" className="flex-1">Analysis</TabsTrigger>
                    <TabsTrigger value="splits" className="flex-1">Splits</TabsTrigger>
                </TabsList>

                <TabsContent value="map">
                    <Card>
                        <CardContent className="p-0 overflow-hidden rounded-xl">
                            <div className="h-80 lg:h-96">
                                {activity.coordinates.length > 0 ? (
                                    <RouteMap coordinates={activity.coordinates} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        No route data available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="charts">
                    <Card>
                        <CardContent className="p-4">
                            <ActivityCharts activity={activity} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="splits">
                    <Card>
                        <CardContent className="p-4">
                            {activity.splits?.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-4 text-xs text-muted-foreground font-medium pb-2 border-b border-border">
                                        <span>KM</span>
                                        <span>Time</span>
                                        <span>Pace</span>
                                        <span>Elevation</span>
                                    </div>
                                    {activity.splits.map((split, i) => (
                                        <div key={i} className="grid grid-cols-4 text-sm py-2 border-b border-border/50">
                                            <span className="font-medium">{split.km}</span>
                                            <span>{formatDuration(split.time)}</span>
                                            <span>{formatPace(split.pace)}</span>
                                            <span>{split.elevation}m</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No split data available</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Comments */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Comments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment._id} className="flex gap-3">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={comment.avatar} />
                                <AvatarFallback>{comment.username?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-muted rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{comment.username}</span>
                                    <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                                </div>
                                <p className="text-sm mt-1">{comment.text}</p>
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-2 pt-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                            onKeyDown={(e) => e.key === "Enter" && handleComment()}
                        />
                        <Button onClick={handleComment} size="icon" className="gradient-accent border-0">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

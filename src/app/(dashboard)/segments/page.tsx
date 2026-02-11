"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Trophy, Medal, Target, Users, Clock, MapPin, Loader2,
} from "lucide-react";
import { formatDistance } from "@/lib/utils";

interface SegmentItem {
    _id: string;
    name: string;
    description: string;
    distance: number;
    leaderboard: {
        userId: string;
        username: string;
        avatar: string;
        time: number;
    }[];
}

export default function SegmentsPage() {
    const [segments, setSegments] = useState<SegmentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/segments")
            .then((r) => r.json())
            .then((d) => setSegments(d.segments || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-40 rounded-xl bg-card animate-pulse border border-border" />
                ))}
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Segments</h1>
                    <p className="text-sm text-muted-foreground mt-1">Compete for the crown</p>
                </div>
            </div>

            {segments.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium mb-2">No segments yet</p>
                        <p className="text-sm">Segments will appear as athletes create routes.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {segments.map((seg, i) => (
                        <motion.div
                            key={seg._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="hover:border-accent/20 transition-colors">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg">{seg.name}</h3>
                                            <p className="text-sm text-muted-foreground">{seg.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">{formatDistance(seg.distance)}</p>
                                            <p className="text-xs text-muted-foreground">Distance</p>
                                        </div>
                                    </div>

                                    {seg.leaderboard?.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Leaderboard</p>
                                            {seg.leaderboard.slice(0, 5).map((entry, j) => (
                                                <div key={j} className="flex items-center gap-3 py-1.5">
                                                    <span className="w-6 text-center text-sm font-bold">
                                                        {j === 0 ? "🥇" : j === 1 ? "🥈" : j === 2 ? "🥉" : `${j + 1}`}
                                                    </span>
                                                    <Avatar className="w-6 h-6">
                                                        <AvatarImage src={entry.avatar} />
                                                        <AvatarFallback className="text-[10px]">{entry.username?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm flex-1">{entry.username}</span>
                                                    <span className="text-sm font-mono text-muted-foreground">
                                                        {Math.floor(entry.time / 60)}:{(entry.time % 60).toString().padStart(2, "0")}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

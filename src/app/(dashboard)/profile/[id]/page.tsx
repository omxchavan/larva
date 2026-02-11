"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    MapPin, Clock, Flame, Activity, UserPlus, UserCheck, ChevronRight,
} from "lucide-react";
import { formatDistance, formatDuration, timeAgo } from "@/lib/utils";
import Link from "next/link";

interface UserProfile {
    clerkId: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
    bio: string;
    totalDistance: number;
    totalDuration: number;
    totalActivities: number;
    totalCalories: number;
    followers: string[];
    following: string[];
    badges: string[];
    isFollowing?: boolean;
}

interface ActivityItem {
    _id: string;
    title: string;
    type: string;
    distance: number;
    duration: number;
    createdAt: string;
}

export default function PublicProfilePage() {
    const params = useParams();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch(`/api/users/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.user);
                    setActivities(data.activities || []);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        }
        fetchProfile();
    }, [params.id]);

    const handleFollow = async () => {
        if (!profile) return;
        try {
            const res = await fetch(`/api/users/${profile.clerkId}/follow`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setProfile({ ...profile, isFollowing: data.isFollowing });
            }
        } catch (err) { console.error(err); }
    };

    const typeEmojis: Record<string, string> = { run: "🏃", walk: "🚶", cycle: "🚴", hike: "🥾" };

    if (loading) {
        return (
            <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
                <div className="h-48 rounded-xl bg-card animate-pulse border border-border" />
            </div>
        );
    }

    if (!profile) {
        return <div className="p-6 text-center text-muted-foreground">User not found</div>;
    }

    return (
        <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Avatar className="w-24 h-24 border-4 border-accent/30">
                                <AvatarImage src={profile.avatar} />
                                <AvatarFallback className="text-2xl">{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-2xl font-bold">{profile.username}</h1>
                                <p className="text-muted-foreground text-sm mt-1">{profile.firstName} {profile.lastName}</p>
                                <p className="text-sm mt-2">{profile.bio || "No bio yet"}</p>
                                <Button
                                    onClick={handleFollow}
                                    variant={profile.isFollowing ? "secondary" : "default"}
                                    size="sm"
                                    className={`mt-3 ${profile.isFollowing ? "" : "gradient-accent border-0"}`}
                                >
                                    {profile.isFollowing ? <><UserCheck className="w-4 h-4 mr-1" /> Following</> : <><UserPlus className="w-4 h-4 mr-1" /> Follow</>}
                                </Button>
                            </div>
                            <div className="flex gap-6 text-center">
                                <div><p className="text-xl font-bold">{profile.followers?.length || 0}</p><p className="text-xs text-muted-foreground">Followers</p></div>
                                <div><p className="text-xl font-bold">{profile.following?.length || 0}</p><p className="text-xs text-muted-foreground">Following</p></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                            {[
                                { icon: <MapPin className="w-4 h-4 text-accent" />, label: "Distance", value: formatDistance(profile.totalDistance || 0) },
                                { icon: <Clock className="w-4 h-4 text-blue-400" />, label: "Time", value: formatDuration(profile.totalDuration || 0) },
                                { icon: <Activity className="w-4 h-4 text-green-400" />, label: "Activities", value: String(profile.totalActivities || 0) },
                                { icon: <Flame className="w-4 h-4 text-red-400" />, label: "Calories", value: `${(profile.totalCalories || 0).toLocaleString()}` },
                            ].map((s, i) => (
                                <div key={i} className="bg-muted rounded-lg p-3 text-center">
                                    <div className="flex justify-center mb-1">{s.icon}</div>
                                    <p className="text-lg font-bold">{s.value}</p>
                                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <Card>
                <CardHeader className="pb-3"><CardTitle className="text-lg">Activities</CardTitle></CardHeader>
                <CardContent className="px-4 pb-4">
                    {activities.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8 text-sm">No public activities</p>
                    ) : (
                        <div className="space-y-1">
                            {activities.map((a) => (
                                <Link key={a._id} href={`/activity/${a._id}`}>
                                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                        <span className="text-xl">{typeEmojis[a.type] || "🏃"}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">{a.title}</p>
                                            <p className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">{formatDistance(a.distance)}</p>
                                            <p className="text-xs text-muted-foreground">{formatDuration(a.duration)}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

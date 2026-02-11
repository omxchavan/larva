"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    MapPin, Clock, Flame, Activity, Edit2, Save, X,
    Users, Trophy, ChevronRight,
} from "lucide-react";
import { formatDistance, formatDuration, timeAgo } from "@/lib/utils";
import Link from "next/link";

interface UserProfile {
    _id: string;
    clerkId: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
    bio: string;
    weight: number;
    totalDistance: number;
    totalDuration: number;
    totalActivities: number;
    totalCalories: number;
    followers: string[];
    following: string[];
    badges: string[];
}

interface ActivityItem {
    _id: string;
    title: string;
    type: string;
    distance: number;
    duration: number;
    createdAt: string;
}

export default function ProfilePage() {
    const { user } = useUser();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [bio, setBio] = useState("");
    const [weight, setWeight] = useState(70);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const [profileRes, actRes] = await Promise.all([
                    fetch("/api/profile"),
                    fetch("/api/activities?limit=10"),
                ]);
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setProfile(data);
                    setBio(data.bio || "");
                    setWeight(data.weight || 70);
                }
                if (actRes.ok) {
                    const data = await actRes.json();
                    setActivities(data.activities || []);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        }
        fetchProfile();
    }, []);

    const saveProfile = async () => {
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bio, weight }),
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setEditing(false);
            }
        } catch (err) { console.error(err); }
    };

    const typeEmojis: Record<string, string> = { run: "🏃", walk: "🚶", cycle: "🚴", hike: "🥾" };

    if (loading) {
        return (
            <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
                <div className="h-48 rounded-xl bg-card animate-pulse border border-border" />
                <div className="h-64 rounded-xl bg-card animate-pulse border border-border" />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Avatar className="w-24 h-24 border-4 border-accent/30">
                                <AvatarImage src={profile?.avatar || user?.imageUrl} />
                                <AvatarFallback className="text-2xl">{profile?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-2xl font-bold">{profile?.username || user?.username || "Athlete"}</h1>
                                <p className="text-muted-foreground text-sm mt-1">
                                    {profile?.firstName} {profile?.lastName}
                                </p>
                                {editing ? (
                                    <div className="mt-3 space-y-3">
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Write your bio..."
                                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:border-accent"
                                        />
                                        <div className="flex items-center gap-3">
                                            <label className="text-sm text-muted-foreground">Weight (kg):</label>
                                            <input
                                                type="number"
                                                value={weight}
                                                onChange={(e) => setWeight(Number(e.target.value))}
                                                className="w-20 bg-muted border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={saveProfile} size="sm" className="gradient-accent border-0">
                                                <Save className="w-3 h-3 mr-1" /> Save
                                            </Button>
                                            <Button onClick={() => setEditing(false)} size="sm" variant="outline">
                                                <X className="w-3 h-3 mr-1" /> Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-muted-foreground mt-2">{profile?.bio || "No bio yet"}</p>
                                        <Button onClick={() => setEditing(true)} size="sm" variant="ghost" className="mt-2">
                                            <Edit2 className="w-3 h-3 mr-1" /> Edit Profile
                                        </Button>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-6 text-center">
                                <div>
                                    <p className="text-xl font-bold">{profile?.followers?.length || 0}</p>
                                    <p className="text-xs text-muted-foreground">Followers</p>
                                </div>
                                <div>
                                    <p className="text-xl font-bold">{profile?.following?.length || 0}</p>
                                    <p className="text-xs text-muted-foreground">Following</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                            {[
                                { icon: <MapPin className="w-4 h-4 text-accent" />, label: "Distance", value: formatDistance(profile?.totalDistance || 0) },
                                { icon: <Clock className="w-4 h-4 text-blue-400" />, label: "Time", value: formatDuration(profile?.totalDuration || 0) },
                                { icon: <Activity className="w-4 h-4 text-green-400" />, label: "Activities", value: String(profile?.totalActivities || 0) },
                                { icon: <Flame className="w-4 h-4 text-red-400" />, label: "Calories", value: `${(profile?.totalCalories || 0).toLocaleString()}` },
                            ].map((stat, i) => (
                                <div key={i} className="bg-muted rounded-lg p-3 text-center">
                                    <div className="flex justify-center mb-1">{stat.icon}</div>
                                    <p className="text-lg font-bold">{stat.value}</p>
                                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Badges */}
                        {profile?.badges && profile.badges.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Badges</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.badges.map((badge, i) => (
                                        <span key={i} className="text-2xl">{badge}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Activities */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Activities</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                    {activities.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8 text-sm">No activities yet</p>
                    ) : (
                        <div className="space-y-1">
                            {activities.map((activity) => (
                                <Link key={activity._id} href={`/activity/${activity._id}`}>
                                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                        <span className="text-xl">{typeEmojis[activity.type] || "🏃"}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">{activity.title}</p>
                                            <p className="text-xs text-muted-foreground">{timeAgo(activity.createdAt)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">{formatDistance(activity.distance)}</p>
                                            <p className="text-xs text-muted-foreground">{formatDuration(activity.duration)}</p>
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

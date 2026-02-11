"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Search, UserPlus, UserCheck, Loader2 } from "lucide-react";
import Link from "next/link";

interface Athlete {
    _id: string;
    clerkId: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
    bio: string;
    totalDistance: number;
    totalActivities: number;
    isFollowing?: boolean;
}

export default function AthletesPage() {
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/users")
            .then((r) => r.json())
            .then((d) => setAthletes(d.users || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleFollow = async (userId: string) => {
        try {
            const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setAthletes((prev) =>
                    prev.map((a) => (a.clerkId === userId ? { ...a, isFollowing: data.isFollowing } : a))
                );
            }
        } catch (err) { console.error(err); }
    };

    const filteredAthletes = athletes.filter(
        (a) =>
            a.username?.toLowerCase().includes(search.toLowerCase()) ||
            a.firstName?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-4 lg:p-6 max-w-4xl mx-auto">
                <div className="grid sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 rounded-xl bg-card animate-pulse border border-border" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Athletes</h1>
                <p className="text-sm text-muted-foreground mt-1">Find and follow fellow athletes</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search athletes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                />
            </div>

            {filteredAthletes.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">No athletes found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {filteredAthletes.map((athlete, i) => (
                        <motion.div
                            key={athlete._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                        >
                            <Card className="hover:border-accent/20 transition-colors">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <Link href={`/profile/${athlete.clerkId}`}>
                                        <Avatar className="w-12 h-12 cursor-pointer">
                                            <AvatarImage src={athlete.avatar} />
                                            <AvatarFallback>{athlete.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/profile/${athlete.clerkId}`} className="font-semibold text-sm hover:text-accent transition-colors block truncate">
                                            {athlete.username || `${athlete.firstName} ${athlete.lastName}`}
                                        </Link>
                                        <p className="text-xs text-muted-foreground truncate">{athlete.bio || "No bio yet"}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {athlete.totalActivities} activities · {(athlete.totalDistance / 1000).toFixed(0)} km
                                        </p>
                                    </div>
                                    <Button
                                        variant={athlete.isFollowing ? "secondary" : "default"}
                                        size="sm"
                                        onClick={() => handleFollow(athlete.clerkId)}
                                        className={athlete.isFollowing ? "" : "gradient-accent border-0"}
                                    >
                                        {athlete.isFollowing ? (
                                            <><UserCheck className="w-4 h-4 mr-1" /> Following</>
                                        ) : (
                                            <><UserPlus className="w-4 h-4 mr-1" /> Follow</>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

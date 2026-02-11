"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Target, Trophy, Clock, Users, CheckCircle } from "lucide-react";
import { formatDistance } from "@/lib/utils";

interface ChallengeItem {
    _id: string;
    title: string;
    description: string;
    type: string;
    target: number;
    unit: string;
    startDate: string;
    endDate: string;
    badge: string;
    isActive: boolean;
    participants: {
        userId: string;
        username: string;
        avatar: string;
        progress: number;
        completedAt?: string;
    }[];
    userProgress?: number;
    joined?: boolean;
}

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/challenges")
            .then((r) => r.json())
            .then((d) => setChallenges(d.challenges || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const joinChallenge = async (id: string) => {
        try {
            const res = await fetch(`/api/challenges/${id}/join`, { method: "POST" });
            if (res.ok) {
                setChallenges((prev) =>
                    prev.map((c) => (c._id === id ? { ...c, joined: true } : c))
                );
            }
        } catch (err) { console.error(err); }
    };

    if (loading) {
        return (
            <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-48 rounded-xl bg-card animate-pulse border border-border" />
                ))}
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Challenges</h1>
                <p className="text-sm text-muted-foreground mt-1">Push your limits</p>
            </div>

            {challenges.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium mb-2">No active challenges</p>
                        <p className="text-sm">Check back soon for new challenges!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {challenges.map((challenge, i) => {
                        const progress = challenge.userProgress || 0;
                        const percentage = Math.min((progress / challenge.target) * 100, 100);
                        const isCompleted = percentage >= 100;
                        const daysLeft = Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / 86400000));

                        return (
                            <motion.div
                                key={challenge._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className={`hover:border-accent/20 transition-colors ${isCompleted ? "border-green-500/30" : ""}`}>
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{challenge.badge}</span>
                                                <div>
                                                    <h3 className="font-bold text-lg">{challenge.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                                                </div>
                                            </div>
                                            {isCompleted && (
                                                <CheckCircle className="w-6 h-6 text-green-400" />
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                            <span className="flex items-center gap-1">
                                                <Target className="w-3 h-3" />
                                                {challenge.target} {challenge.unit}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {daysLeft} days left
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {challenge.participants?.length || 0} joined
                                            </span>
                                        </div>

                                        {challenge.joined ? (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>{formatDistance(progress * 1000)}</span>
                                                    <span className="text-muted-foreground">{formatDistance(challenge.target * 1000)}</span>
                                                </div>
                                                <Progress value={percentage} />
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => joinChallenge(challenge._id)}
                                                className="gradient-accent border-0 w-full mt-2"
                                            >
                                                Join Challenge
                                            </Button>
                                        )}

                                        {/* Top participants */}
                                        {challenge.participants?.length > 0 && (
                                            <div className="flex -space-x-2 mt-4">
                                                {challenge.participants.slice(0, 8).map((p, j) => (
                                                    <Avatar key={j} className="w-7 h-7 border-2 border-card">
                                                        <AvatarImage src={p.avatar} />
                                                        <AvatarFallback className="text-[9px]">{p.username?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                                {challenge.participants.length > 8 && (
                                                    <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] text-muted-foreground">
                                                        +{challenge.participants.length - 8}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

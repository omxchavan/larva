"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Heart, MessageCircle, UserPlus, Trophy, Medal, Check } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

interface NotificationItem {
    _id: string;
    fromUsername: string;
    fromAvatar: string;
    type: string;
    message: string;
    link: string;
    read: boolean;
    createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
    like: <Heart className="w-4 h-4 text-red-400" />,
    comment: <MessageCircle className="w-4 h-4 text-blue-400" />,
    follow: <UserPlus className="w-4 h-4 text-green-400" />,
    challenge: <Trophy className="w-4 h-4 text-yellow-400" />,
    achievement: <Medal className="w-4 h-4 text-purple-400" />,
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/notifications")
            .then((r) => r.json())
            .then((d) => setNotifications(d.notifications || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const markAllRead = async () => {
        try {
            await fetch("/api/notifications/read", { method: "POST" });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (err) { console.error(err); }
    };

    if (loading) {
        return (
            <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-card animate-pulse border border-border" />
                ))}
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Notifications</h1>
                {notifications.some((n) => !n.read) && (
                    <button onClick={markAllRead} className="text-sm text-accent hover:underline flex items-center gap-1 cursor-pointer">
                        <Check className="w-4 h-4" /> Mark all read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium mb-2">No notifications</p>
                        <p className="text-sm">You&apos;re all caught up!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notif, i) => (
                        <motion.div
                            key={notif._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                        >
                            <Link href={notif.link || "#"}>
                                <Card className={`hover:border-accent/20 transition-colors ${!notif.read ? "border-accent/30 bg-accent/5" : ""}`}>
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <Avatar className="w-9 h-9">
                                            <AvatarImage src={notif.fromAvatar} />
                                            <AvatarFallback>{notif.fromUsername?.[0]?.toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm">
                                                <span className="font-semibold">{notif.fromUsername}</span>{" "}
                                                <span className="text-muted-foreground">{notif.message}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(notif.createdAt)}</p>
                                        </div>
                                        {typeIcons[notif.type]}
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

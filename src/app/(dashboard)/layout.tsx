"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    MapPin,
    Activity,
    Users,
    Trophy,
    Target,
    Bell,
    User,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/track", icon: MapPin, label: "Track" },
    { href: "/feed", icon: Activity, label: "Feed" },
    { href: "/segments", icon: Trophy, label: "Segments" },
    { href: "/challenges", icon: Target, label: "Challenges" },
    { href: "/athletes", icon: Users, label: "Athletes" },
    { href: "/notifications", icon: Bell, label: "Alerts" },
    { href: "/profile", icon: User, label: "Profile" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/50 fixed h-full z-40">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gradient">LARVA</span>
                </div>
                <nav className="flex-1 px-3 py-2 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-accent text-white shadow-lg shadow-accent/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-border">
                    <UserButton
                        appearance={{
                            elements: {
                                rootBox: "flex justify-center w-full",
                                userButtonTrigger: "focus:outline-none",
                            },
                        }}
                    />
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass h-14 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md gradient-accent flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gradient">LARVA</span>
                </div>
                <div className="flex items-center gap-3">
                    <UserButton
                        appearance={{
                            elements: {
                                userButtonTrigger: "focus:outline-none",
                            },
                        }}
                    />
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground cursor-pointer">
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 25 }}
                        className="lg:hidden fixed inset-0 z-40 bg-background pt-14"
                    >
                        <nav className="p-4 space-y-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${isActive
                                                ? "bg-accent text-white"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Bottom Nav */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
                <div className="flex justify-around py-2">
                    {navItems.slice(0, 5).map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors ${isActive ? "text-accent" : "text-muted-foreground"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64">
                <div className="pt-14 lg:pt-0 pb-20 lg:pb-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

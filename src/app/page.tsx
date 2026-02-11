"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Activity,
  Trophy,
  Users,
  Zap,
  ChevronRight,
  Smartphone,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "GPS Tracking",
    desc: "Track your runs with precision GPS. See your route, pace, and splits in real-time.",
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "Live Activity",
    desc: "Share your live location with friends. Watch athletes race across the map.",
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Segments & PRs",
    desc: "Compete on segments, chase personal records, and climb the leaderboards.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Social Feed",
    desc: "Follow athletes, give kudos, comment on activities. Stay connected.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Challenges",
    desc: "Join monthly distance challenges. Earn badges and bragging rights.",
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Works Offline",
    desc: "Record activities offline. Data syncs automatically when you're back online.",
  },
];

const stats = [
  { value: "10K+", label: "Athletes" },
  { value: "1M+", label: "Activities" },
  { value: "50M+", label: "Kilometers" },
  { value: "100+", label: "Countries" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">LARVA</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="gradient-accent border-0">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/3 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Globe className="w-4 h-4 text-accent" />
              <span className="text-sm text-accent font-medium">Now available as a PWA</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6">
              Track Every
              <span className="text-gradient block">Mile You Run</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The ultimate fitness tracking platform. GPS-powered routes, real-time sharing,
              segments, challenges, and a community of passionate athletes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="gradient-accent border-0 text-lg px-10 h-14 shadow-xl shadow-accent/30">
                  Start Tracking
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="text-lg px-10 h-14">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="glass rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-gradient">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg">Designed for athletes who push limits.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 hover:border-accent/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 gradient-accent opacity-5" />
            <h2 className="text-4xl font-bold mb-4 relative z-10">Ready to Run?</h2>
            <p className="text-muted-foreground mb-8 relative z-10">
              Join thousands of athletes already tracking with LARVA.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="gradient-accent border-0 text-lg px-10 h-14 shadow-xl shadow-accent/30 relative z-10">
                Create Free Account
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-accent flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gradient">LARVA</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 LARVA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

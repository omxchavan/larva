"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
} from "recharts";

interface ActivityChartsProps {
    activity: {
        splits: { km: number; time: number; pace: number; elevation: number }[];
        distance: number;
        duration: number;
        avgSpeed: number;
        avgPace: number;
    };
}

export default function ActivityCharts({ activity }: ActivityChartsProps) {
    const splits = activity.splits || [];

    if (splits.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                <p>No analysis data available for this activity.</p>
            </div>
        );
    }

    const paceData = splits.map((s) => ({
        km: `${s.km}`,
        pace: s.pace > 0 ? parseFloat((1000 / s.pace / 60).toFixed(2)) : 0,
    }));

    const elevationData = splits.map((s) => ({
        km: `${s.km}`,
        elevation: s.elevation,
    }));

    return (
        <div className="space-y-8">
            {/* Pace Chart */}
            <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Pace per Kilometer (min/km)</h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={paceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                            <XAxis dataKey="km" stroke="#666" fontSize={12} />
                            <YAxis stroke="#666" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px" }}
                                labelStyle={{ color: "#a0a0a0" }}
                            />
                            <Bar dataKey="pace" fill="#FC4C02" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Elevation Chart */}
            <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Elevation Profile (m)</h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={elevationData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                            <XAxis dataKey="km" stroke="#666" fontSize={12} />
                            <YAxis stroke="#666" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px" }}
                                labelStyle={{ color: "#a0a0a0" }}
                            />
                            <Area type="monotone" dataKey="elevation" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Activity } from "@/models/Activity";
import { User } from "@/models/User";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const user = await User.findOne({ clerkId: userId }).lean() as Record<string, unknown> | null;

        // This week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        // This month
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const weekActivities = await Activity.find({
            userId,
            createdAt: { $gte: weekStart },
        }).lean();

        const monthActivities = await Activity.find({
            userId,
            createdAt: { $gte: monthStart },
        }).lean();

        const weekDistance = weekActivities.reduce((sum: number, a: Record<string, unknown>) => sum + (a.distance as number || 0), 0);
        const monthDistance = monthActivities.reduce((sum: number, a: Record<string, unknown>) => sum + (a.distance as number || 0), 0);

        return NextResponse.json({
            totalDistance: user?.totalDistance || 0,
            totalDuration: user?.totalDuration || 0,
            totalActivities: user?.totalActivities || 0,
            totalCalories: user?.totalCalories || 0,
            weekDistance,
            weekActivities: weekActivities.length,
            monthDistance,
            monthActivities: monthActivities.length,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

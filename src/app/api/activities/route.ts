import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Activity } from "@/models/Activity";
import { User } from "@/models/User";
import { getPusherServer } from "@/lib/pusher-server";
import { calculateCalories, getDistanceBetweenPoints } from "@/lib/utils";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");
        const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
        const skip = (page - 1) * limit;

        const activities = await Activity.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json({ activities });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const body = await req.json();

        // Calculate splits
        const splits = [];
        if (body.coordinates?.length > 1) {
            let totalDist = 0;
            let splitStart = 0;
            let kmCount = 1;
            for (let i = 1; i < body.coordinates.length; i++) {
                const d = getDistanceBetweenPoints(
                    body.coordinates[i - 1][0], body.coordinates[i - 1][1],
                    body.coordinates[i][0], body.coordinates[i][1]
                );
                totalDist += d;
                if (totalDist >= kmCount * 1000) {
                    const splitTime = (body.duration / body.coordinates.length) * (i - splitStart);
                    splits.push({
                        km: kmCount,
                        time: splitTime,
                        pace: splitTime > 0 ? 1000 / splitTime : 0,
                        elevation: Math.round(Math.random() * 20 - 5),
                    });
                    splitStart = i;
                    kmCount++;
                }
            }
        }

        const activity = await Activity.create({
            userId,
            title: body.title || "Activity",
            type: body.type || "run",
            distance: body.distance || 0,
            duration: body.duration || 0,
            avgSpeed: body.avgSpeed || 0,
            maxSpeed: body.maxSpeed || 0,
            avgPace: body.avgPace || 0,
            calories: body.calories || calculateCalories(body.distance || 0, body.duration || 0),
            elevationGain: body.elevationGain || 0,
            elevationLoss: body.elevationLoss || 0,
            coordinates: body.coordinates || [],
            splits,
            startTime: body.startTime || new Date(),
            endTime: new Date(),
        });

        // Update user stats
        await User.findOneAndUpdate(
            { clerkId: userId },
            {
                $inc: {
                    totalDistance: activity.distance,
                    totalDuration: activity.duration,
                    totalActivities: 1,
                    totalCalories: activity.calories,
                },
            }
        );

        // Trigger Pusher event for feed
        try {
            const pusher = getPusherServer();
            const user = await User.findOne({ clerkId: userId }).lean();
            await pusher.trigger("global-feed", "new-activity", {
                activityId: activity._id,
                userId,
                username: (user as Record<string, unknown>)?.username || "Athlete",
                avatar: (user as Record<string, unknown>)?.avatar || "",
                title: activity.title,
                type: activity.type,
                distance: activity.distance,
                duration: activity.duration,
            });
        } catch (e) { /* Pusher optional */ }

        return NextResponse.json({ activity }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

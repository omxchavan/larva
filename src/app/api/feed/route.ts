import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Activity } from "@/models/Activity";
import { User } from "@/models/User";
import { Comment } from "@/models/Comment";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
        const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // Get IDs of users the current user follows + own
        const currentUser = await User.findOne({ clerkId: userId }).lean() as Record<string, unknown> | null;
        const following = (currentUser?.following as string[]) || [];
        const feedUserIds = [...following, userId];

        const activities = await Activity.find({ userId: { $in: feedUserIds } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Enrich with user data and comment counts
        const userIds = [...new Set(activities.map((a: Record<string, unknown>) => a.userId as string))];
        const users = await User.find({ clerkId: { $in: userIds } }).lean();
        const userMap = new Map(users.map((u: Record<string, unknown>) => [u.clerkId as string, u]));

        const enriched = await Promise.all(
            activities.map(async (a: Record<string, unknown>) => {
                const user = userMap.get(a.userId as string) as Record<string, unknown> | undefined;
                const commentCount = await Comment.countDocuments({ activityId: (a._id as string).toString() });
                return {
                    ...a,
                    username: user?.username || "Athlete",
                    avatar: user?.avatar || "",
                    commentCount,
                };
            })
        );

        return NextResponse.json({ activities: enriched });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

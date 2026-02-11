import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Comment } from "@/models/Comment";
import { User } from "@/models/User";
import { Activity } from "@/models/Activity";
import { Notification } from "@/models/Notification";
import { getPusherServer } from "@/lib/pusher-server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const { id } = await params;
        const comments = await Comment.find({ activityId: id }).sort({ createdAt: 1 }).lean();
        return NextResponse.json({ comments });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const { id } = await params;
        const { text } = await req.json();

        const user = await User.findOne({ clerkId: userId }).lean() as Record<string, unknown> | null;

        const comment = await Comment.create({
            activityId: id,
            userId,
            username: user?.username || "Athlete",
            avatar: user?.avatar || "",
            text,
        });

        // Send notification
        const activity = await Activity.findById(id).lean() as Record<string, unknown> | null;
        if (activity && activity.userId !== userId) {
            await Notification.create({
                userId: activity.userId,
                fromUserId: userId,
                fromUsername: user?.username || "Someone",
                fromAvatar: user?.avatar || "",
                type: "comment",
                message: "commented on your activity",
                link: `/activity/${id}`,
            });

            try {
                const pusher = getPusherServer();
                await pusher.trigger(`user-${activity.userId}`, "notification", {
                    type: "comment",
                    message: `${user?.username || "Someone"} commented on your activity`,
                });
            } catch (e) { /* optional */ }
        }

        return NextResponse.json({ comment }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

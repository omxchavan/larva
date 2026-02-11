import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Activity } from "@/models/Activity";
import { getPusherServer } from "@/lib/pusher-server";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const { id } = await params;
        const activity = await Activity.findById(id);
        if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const likeIndex = activity.likes.indexOf(userId);
        if (likeIndex > -1) {
            activity.likes.splice(likeIndex, 1);
        } else {
            activity.likes.push(userId);

            // Send notification
            if (activity.userId !== userId) {
                const fromUser = await User.findOne({ clerkId: userId }).lean() as Record<string, unknown> | null;
                await Notification.create({
                    userId: activity.userId,
                    fromUserId: userId,
                    fromUsername: fromUser?.username || "Someone",
                    fromAvatar: fromUser?.avatar || "",
                    type: "like",
                    message: "liked your activity",
                    link: `/activity/${id}`,
                });

                try {
                    const pusher = getPusherServer();
                    await pusher.trigger(`user-${activity.userId}`, "notification", {
                        type: "like",
                        message: `${fromUser?.username || "Someone"} liked your activity`,
                    });
                } catch (e) { /* optional */ }
            }
        }

        await activity.save();
        return NextResponse.json({ likes: activity.likes });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

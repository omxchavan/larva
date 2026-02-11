import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { getPusherServer } from "@/lib/pusher-server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const { id: targetId } = await params;

        if (userId === targetId) {
            return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
        }

        const currentUser = await User.findOne({ clerkId: userId });
        const targetUser = await User.findOne({ clerkId: targetId });

        if (!currentUser || !targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isFollowing = currentUser.following.includes(targetId);

        if (isFollowing) {
            currentUser.following = currentUser.following.filter((id: string) => id !== targetId);
            targetUser.followers = targetUser.followers.filter((id: string) => id !== userId);
        } else {
            currentUser.following.push(targetId);
            targetUser.followers.push(userId);

            // Notification
            await Notification.create({
                userId: targetId,
                fromUserId: userId,
                fromUsername: currentUser.username,
                fromAvatar: currentUser.avatar,
                type: "follow",
                message: "started following you",
                link: `/profile/${userId}`,
            });

            try {
                const pusher = getPusherServer();
                await pusher.trigger(`user-${targetId}`, "notification", {
                    type: "follow",
                    message: `${currentUser.username} started following you`,
                });
            } catch (e) { /* optional */ }
        }

        await currentUser.save();
        await targetUser.save();

        return NextResponse.json({ isFollowing: !isFollowing });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Activity } from "@/models/Activity";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const { id } = await params;
        const user = await User.findOne({ clerkId: id }).lean() as Record<string, unknown> | null;
        if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const activities = await Activity.find({ userId: id })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const currentUser = await User.findOne({ clerkId: userId }).lean() as Record<string, unknown> | null;
        const isFollowing = ((currentUser?.following as string[]) || []).includes(id);

        return NextResponse.json({
            user: { ...user, isFollowing },
            activities,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

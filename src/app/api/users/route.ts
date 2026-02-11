import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const currentUser = await User.findOne({ clerkId: userId }).lean();
        const users = await User.find({ clerkId: { $ne: userId } })
            .select("clerkId username firstName lastName avatar bio totalDistance totalActivities")
            .sort({ totalActivities: -1 })
            .limit(50)
            .lean();

        const following = (currentUser as Record<string, unknown>)?.following as string[] || [];
        const enriched = users.map((u: Record<string, unknown>) => ({
            ...u,
            isFollowing: following.includes(u.clerkId as string),
        }));

        return NextResponse.json({ users: enriched });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

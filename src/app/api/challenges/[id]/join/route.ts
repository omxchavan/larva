import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Challenge } from "@/models/Challenge";
import { User } from "@/models/User";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const { id } = await params;
        const challenge = await Challenge.findById(id);
        if (!challenge) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const alreadyJoined = challenge.participants.some(
            (p: Record<string, unknown>) => p.userId === userId
        );
        if (alreadyJoined) {
            return NextResponse.json({ error: "Already joined" }, { status: 400 });
        }

        const user = await User.findOne({ clerkId: userId }).lean() as Record<string, unknown> | null;

        challenge.participants.push({
            userId,
            username: (user?.username as string) || "Athlete",
            avatar: (user?.avatar as string) || "",
            progress: 0,
        });

        await challenge.save();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

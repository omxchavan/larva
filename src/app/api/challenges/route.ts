import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Challenge } from "@/models/Challenge";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const challenges = await Challenge.find({ isActive: true }).sort({ endDate: 1 }).lean();

        const enriched = challenges.map((c: Record<string, unknown>) => {
            const participants = c.participants as Array<Record<string, unknown>> || [];
            const userParticipant = participants.find(
                (p) => p.userId === userId
            );
            return {
                ...c,
                joined: !!userParticipant,
                userProgress: (userParticipant?.progress as number) || 0,
            };
        });

        return NextResponse.json({ challenges: enriched });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

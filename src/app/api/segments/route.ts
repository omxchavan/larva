import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Segment } from "@/models/Segment";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const segments = await Segment.find().sort({ createdAt: -1 }).limit(50).lean();
        return NextResponse.json({ segments });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const body = await req.json();

        const segment = await Segment.create({
            name: body.name,
            description: body.description,
            creatorId: userId,
            coordinates: body.coordinates,
            distance: body.distance,
        });

        return NextResponse.json({ segment }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

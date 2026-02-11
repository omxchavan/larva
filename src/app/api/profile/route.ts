import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();

        // Ensure current user exists in DB
        let dbUser = await User.findOne({ clerkId: userId });
        if (!dbUser) {
            const clerkUser = await currentUser();
            dbUser = await User.create({
                clerkId: userId,
                email: clerkUser?.emailAddresses?.[0]?.emailAddress || "",
                username: clerkUser?.username || clerkUser?.firstName || `user_${Date.now()}`,
                firstName: clerkUser?.firstName || "",
                lastName: clerkUser?.lastName || "",
                avatar: clerkUser?.imageUrl || "",
            });
        }

        return NextResponse.json(dbUser);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const { bio, weight } = await req.json();

        const user = await User.findOneAndUpdate(
            { clerkId: userId },
            { bio, weight },
            { new: true }
        );

        return NextResponse.json(user);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

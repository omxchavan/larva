import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IUser extends Document {
    clerkId: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
    bio: string;
    weight: number;
    totalDistance: number;
    totalDuration: number;
    totalActivities: number;
    totalCalories: number;
    followers: string[];
    following: string[];
    badges: string[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        clerkId: { type: String, required: true, unique: true, index: true },
        email: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        firstName: { type: String, default: "" },
        lastName: { type: String, default: "" },
        avatar: { type: String, default: "" },
        bio: { type: String, default: "" },
        weight: { type: Number, default: 70 },
        totalDistance: { type: Number, default: 0 },
        totalDuration: { type: Number, default: 0 },
        totalActivities: { type: Number, default: 0 },
        totalCalories: { type: Number, default: 0 },
        followers: [{ type: String }],
        following: [{ type: String }],
        badges: [{ type: String }],
    },
    { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);

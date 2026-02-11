import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IChallenge extends Document {
    title: string;
    description: string;
    type: "distance" | "duration" | "activities";
    target: number;
    unit: string;
    startDate: Date;
    endDate: Date;
    participants: {
        userId: string;
        username: string;
        avatar: string;
        progress: number;
        completedAt?: Date;
    }[];
    badge: string;
    isActive: boolean;
    createdAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>(
    {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        type: { type: String, enum: ["distance", "duration", "activities"], default: "distance" },
        target: { type: Number, required: true },
        unit: { type: String, default: "km" },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        participants: [
            {
                userId: String,
                username: String,
                avatar: String,
                progress: { type: Number, default: 0 },
                completedAt: Date,
            },
        ],
        badge: { type: String, default: "🏅" },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Challenge = models.Challenge || model<IChallenge>("Challenge", ChallengeSchema);

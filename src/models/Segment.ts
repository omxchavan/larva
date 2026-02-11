import mongoose, { Schema, models, model, Document } from "mongoose";

export interface ISegment extends Document {
    name: string;
    description: string;
    creatorId: string;
    coordinates: [number, number][];
    distance: number;
    leaderboard: {
        userId: string;
        username: string;
        avatar: string;
        time: number;
        date: Date;
    }[];
    createdAt: Date;
}

const SegmentSchema = new Schema<ISegment>(
    {
        name: { type: String, required: true },
        description: { type: String, default: "" },
        creatorId: { type: String, required: true },
        coordinates: { type: [[Number]], required: true },
        distance: { type: Number, default: 0 },
        leaderboard: [
            {
                userId: String,
                username: String,
                avatar: String,
                time: Number,
                date: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

export const Segment = models.Segment || model<ISegment>("Segment", SegmentSchema);

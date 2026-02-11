import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IActivity extends Document {
    userId: string;
    title: string;
    type: "run" | "walk" | "cycle" | "hike";
    distance: number;
    duration: number;
    avgSpeed: number;
    maxSpeed: number;
    avgPace: number;
    calories: number;
    elevationGain: number;
    elevationLoss: number;
    coordinates: [number, number][];
    startTime: Date;
    endTime: Date;
    splits: {
        km: number;
        time: number;
        pace: number;
        elevation: number;
    }[];
    images: string[];
    likes: string[];
    isLive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
    {
        userId: { type: String, required: true, index: true },
        title: { type: String, default: "Afternoon Run" },
        type: { type: String, enum: ["run", "walk", "cycle", "hike"], default: "run" },
        distance: { type: Number, default: 0 },
        duration: { type: Number, default: 0 },
        avgSpeed: { type: Number, default: 0 },
        maxSpeed: { type: Number, default: 0 },
        avgPace: { type: Number, default: 0 },
        calories: { type: Number, default: 0 },
        elevationGain: { type: Number, default: 0 },
        elevationLoss: { type: Number, default: 0 },
        coordinates: { type: [[Number]], default: [] },
        startTime: { type: Date, default: Date.now },
        endTime: { type: Date },
        splits: [
            {
                km: Number,
                time: Number,
                pace: Number,
                elevation: Number,
            },
        ],
        images: [{ type: String }],
        likes: [{ type: String }],
        isLive: { type: Boolean, default: false },
    },
    { timestamps: true }
);

ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ userId: 1, createdAt: -1 });

export const Activity = models.Activity || model<IActivity>("Activity", ActivitySchema);

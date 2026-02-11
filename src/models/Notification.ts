import mongoose, { Schema, models, model, Document } from "mongoose";

export interface INotification extends Document {
    userId: string;
    fromUserId: string;
    fromUsername: string;
    fromAvatar: string;
    type: "like" | "comment" | "follow" | "challenge" | "achievement";
    message: string;
    link: string;
    read: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: { type: String, required: true, index: true },
        fromUserId: { type: String, required: true },
        fromUsername: { type: String, required: true },
        fromAvatar: { type: String, default: "" },
        type: {
            type: String,
            enum: ["like", "comment", "follow", "challenge", "achievement"],
            required: true,
        },
        message: { type: String, required: true },
        link: { type: String, default: "" },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = models.Notification || model<INotification>("Notification", NotificationSchema);

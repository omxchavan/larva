import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IComment extends Document {
    activityId: string;
    userId: string;
    username: string;
    avatar: string;
    text: string;
    createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
    {
        activityId: { type: String, required: true, index: true },
        userId: { type: String, required: true },
        username: { type: String, required: true },
        avatar: { type: String, default: "" },
        text: { type: String, required: true },
    },
    { timestamps: true }
);

export const Comment = models.Comment || model<IComment>("Comment", CommentSchema);

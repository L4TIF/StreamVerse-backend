import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({

    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    },
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet",
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }


}, { timestamps: true })

// Compound indexes for common query patterns
// Compound indexes for common query patterns
likeSchema.index(
    { likedBy: 1, video: 1 },
    { unique: true, partialFilterExpression: { video: { $exists: true } } }
)
likeSchema.index(
    { likedBy: 1, comment: 1 },
    { unique: true, partialFilterExpression: { comment: { $exists: true } } }
)
likeSchema.index(
    { likedBy: 1, tweet: 1 },
    { unique: true, partialFilterExpression: { tweet: { $exists: true } } }
)
// Individual indexes for counting likes
likeSchema.index({ video: 1 })      // Count video likes
likeSchema.index({ comment: 1 })    // Count comment likes
likeSchema.index({ tweet: 1 })      // Count tweet likes
likeSchema.index({ likedBy: 1 })    // Get user's likes



export const Like = mongoose.model("Like", likeSchema)
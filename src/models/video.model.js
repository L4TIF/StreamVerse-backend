import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({

    videoFile: { type: String, required: true }, //cloudnary url
    thumbnail: { type: String, required: true }, //cloudnary url
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true }, //cloudnary 
    views: { type: Number, required: true, default: 0 },
    isPublished: { type: Boolean, default: true }

}, { timestamps: true })

// Indexes for common queries
videoSchema.index({ owner: 1 })                    // Get user's videos
videoSchema.index({ owner: 1, isPublished: 1 })   // Get user's published videos
videoSchema.index({ isPublished: 1 })             // Get all published videos
videoSchema.index({ views: -1 })                  // Sort by popularity
videoSchema.index({ createdAt: -1 })              // Sort by newes

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video', videoSchema)
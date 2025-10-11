import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Comment } from "./comment.model.js";
import { Like } from "./like.model.js";
import { Playlist } from "./playlist.model.js";

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


videoSchema.pre('findOneAndDelete', async function () {
  const videoId = this.getQuery()._id
  const userId = this.getQuery().owner // Assuming you pass owner in query

  // Check if user is authorized to delete this video
  if (!userId) {
    throw new Error('Unauthorized: User ID required for deletion')
  }

  // Verify user owns the video
  const video = await Video.findOne({ _id: videoId, owner: userId })
  if (!video) {
    throw new Error('Unauthorized: User does not own this video')
  }

  // Proceed with cleanup
  await Comment.deleteMany({ video: videoId })
  await Like.deleteMany({ video: videoId })
})


// Indexes for common queries
videoSchema.index({ owner: 1 })                    // Get user's videos
videoSchema.index({ owner: 1, isPublished: 1 })   // Get user's published videos
videoSchema.index({ isPublished: 1 })             // Get all published videos
videoSchema.index({ views: -1 })                  // Sort by popularity
videoSchema.index({ createdAt: -1 })              // Sort by newes
videoSchema.index({ title: 1 })                   // search video by title

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video', videoSchema)
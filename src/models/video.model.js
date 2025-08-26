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

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video', videoSchema)
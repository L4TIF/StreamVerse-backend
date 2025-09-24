import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asynchandler } from "../utils/asynchandler.js"
import { isValidObjectId } from "mongoose"
import { ApiResponse } from "../utils/ApiResponse.js"


const toggleLikeComment = asynchandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid comment id")

    const isLiked = await Like.findOne({ comment: commentId, likedBy: req.user._id })
    if (isLiked) {
        await Like.findByIdAndDelete(isLiked._id)
        res.status(200).json(new ApiResponse(200, { isLiked: false }, "Comment unliked successfully"))
    } else {
        await Like.create({ comment: commentId, likedBy: req.user._id })
        res.status(201).json(new ApiResponse(201, { isLiked: true }, "Comment liked successfully"))
    }
})

const toggleLikeVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")

    const isLiked = await Like.findOne({ video: videoId, likedBy: req.user._id })
    if (isLiked) {
        await Like.findByIdAndDelete(isLiked._id)
        res.status(200).json(new ApiResponse(200, { isLiked: false }, "Video unliked successfully"))
    } else {
        await Like.create({ video: videoId, likedBy: req.user._id })
        res.status(201).json(new ApiResponse(201, { isLiked: true }, "Video liked successfully"))
    }
})

const toggleLikeTweet = asynchandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id")

    const isLiked = await Like.findOne({ tweet: tweetId, likedBy: req.user._id })
    if (isLiked) {
        await Like.findByIdAndDelete(isLiked._id)
        res.status(200).json(new ApiResponse(200, { isLiked: false }, "Tweet unliked successfully"))
    } else {
        await Like.create({ tweet: tweetId, likedBy: req.user._id })
        res.status(201).json(new ApiResponse(201, { isLiked: true }, "Tweet liked successfully"))
    }
})


const getUserLikeVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query
    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)

    const videos = await Like.find({ likedBy: req.user._id }, { video: 1 })
        .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .populate("video")

    const totalVideos = await Like.countDocuments({ likedBy: req.user._id })
    res.status(200).json(new ApiResponse(200, videos[1], totalVideos ? "Videos liked by user fetched successfully" : "no video liked by user"))
})








export { toggleLikeComment, toggleLikeVideo, toggleLikeTweet, getUserLikeVideos }
import mongoose, { isValidObjectId } from "mongoose"
import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Comment } from "../models/comment.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Like } from "../models/like.model.js"


//todo: add comment to tweet

// return all comments for a video with likes count
const getComments = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query
    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")
    const filter = { video: mongoose.Types.ObjectId.createFromHexString(videoId) }
    // const comments = await Comment.find(filter)
    //     .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
    //     .skip((pageNumber - 1) * limitNumber)
    //     .limit(limitNumber)
    //     .populate("owner","avatar userName")

    const totalComments = await Comment.countDocuments(filter)
    // const ids = comments.map(comment => comment._id)
    // const counts = await Like.aggregate([
    //     { $match: { comment: { $in: ids } } },
    //     { $group: { _id: "$comment", count: { $sum: 1 } } }
    // ])

    // const map = Object.fromEntries(counts.map(count => [count._id, count.count]))
    // const isLiked = await Like.aggregate([])

    // const result = comments.map(comment => ({
    //     ...comment.toObject(),
    //     likes: map[comment._id] || 0
    // }))

    const viewerId = (req.user && mongoose.Types.ObjectId.isValid(req.user._id))
        ? mongoose.Types.ObjectId.createFromHexString(req.user._id) : null



    const result = await Comment.aggregate([
        { $match: filter },
        { $sort: { [sortBy]: sortType === "desc" ? -1 : 1 } },
        { $skip: (pageNumber - 1) * limitNumber },
        { $limit: limitNumber },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                pipeline: [
                    { $project: { avatar: 1, userName: 1 } }
                ],
                as: "owner"
            }
        },
        { $unwind: "$owner" },
        {
            $addFields: {
                likeCount: { $size: "$likes" },
                isLiked: viewerId ? {
                    $gt: [
                        {
                            $size: {
                                $filter: {
                                    input: "$likes",
                                    cond: { $eq: ["$$this.likedBy", viewerId] }
                                }
                            }
                        },
                        0
                    ]
                } : false
            }
        },
        {
            $project: {
                content: 1,
                owner: 1,
                isLiked: 1,
                likeCount: 1,
                createdAt: 1
            }
        }
    ])
    console.log(result)

    res.status(200)
        .json(new ApiResponse(200, result, totalComments ? "comments fetched successfully" : "no comments found"))

})

const newComment = asynchandler(async (req, res) => {

    const { content } = req.body
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")
    if (!content || !content.toString().trim()) throw new ApiError(400, "content cant be empty")
    const comment = await Comment.create({
        content: content.toString().trim(),
        video: videoId,
        owner: req.user._id
    })
    if (!comment) throw new ApiError(500, "error while creating comment")
    res.status(201)
        .json(new ApiResponse(201, comment, "comment created successfully"))

})

const updateComment = asynchandler(async (req, res) => {
    const { content } = req.body
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) throw new ApiError(400, "Invaid commentId")

    const newComment = await Comment.findOneAndUpdate({ _id: commentId, owner: req.user._id },
        { content: content.toString().trim() },
        { new: true, runValidators: true })
    if (!newComment) throw new ApiError(404, "Comment not found")
    res.status(200).json(new ApiResponse(200, newComment, "comment updated successfully"))
})

const deleteComment = asynchandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid comment id")
    const deletedComment = await Comment.findOneAndDelete({ _id: commentId, owner: req.user._id })
    if (!deletedComment) throw new ApiError(404, "Comment not found")
    res.status(200).json(new ApiResponse(200, deletedComment, "comment deleted successfully"))
})
// return a comment by id with likes count
const getCommentById = asynchandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid comment id")
    const viewerId = (req.user && mongoose.Types.ObjectId.isValid(req.user._id))
        ? mongoose.Types.ObjectId.createFromHexString(req.user._id) : null

    const comment = await Comment.findById(commentId).populate("owner", "avatar userName")
    if (!comment) throw new ApiError(404, "Comment not found")
    const likes = await Like.countDocuments({ comment: commentId })
    const isLiked = viewerId && await Like.findOne({ comment: commentId, likedBy: viewerId }) ? true : false
    res.status(200).json(new ApiResponse(200, { ...comment.toObject(), likes, isLiked }, "comment fetched successfully"))
})

export {
    newComment,
    getComments,
    updateComment,
    deleteComment,
    getCommentById
}
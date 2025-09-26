import { isValidObjectId } from "mongoose"
import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Comment } from "../models/comment.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Like } from "../models/like.model.js"

//todo: add likes count in comment
//todo: add isLiked in comment
//todo: add comment to tweet

// return all comments for a video with likes count
const getComments = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query
    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")
    const filter = { video: videoId }
    const comments = await Comment.find(filter)
        .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)

    const totalComments = await Comment.countDocuments(filter)
    const ids = comments.map(comment => comment._id)
    const counts = await Like.aggregate([
        { $match: { comment: { $in: ids } } },
        { $group: { _id: "$comment", count: { $sum: 1 } } }
    ])

    const map = Object.fromEntries(counts.map(count => [count._id, count.count]))

    const result = comments.map(comment => ({
        ...comment.toObject(),
        likes: map[comment._id] || 0
    }))

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
    const comment = await Comment.findById(commentId)
    if (!comment) throw new ApiError(404, "Comment not found")
    const likes = await Like.countDocuments({ comment: commentId })
    res.status(200).json(new ApiResponse(200, { ...comment.toObject(), likes }, "comment fetched successfully"))
})

export {
    newComment,
    getComments,
    updateComment,
    deleteComment,
    getCommentById
}
import { isValidObjectId } from "mongoose"
import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Comment } from "../models/comment.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"


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

    res.status(200)
        .json(new ApiResponse(200, comments, comments.length ? "comments fetched successfully" : "no comments found"))

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


export {
    newComment,
    getComments,
    updateComment,
    deleteComment
}
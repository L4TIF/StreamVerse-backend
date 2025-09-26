import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { asynchandler } from "../utils/asynchandler.js"
import { Tweet } from "../models/tweets.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"


//create a tweet
const newTweet = asynchandler(async (req, res) => {
    const { content } = req.body
    if (!content || !content.toString().trim()) throw new ApiError(400, "content cant be empty")
    const tweet = await Tweet.create({
        owner: req.user?._id,
        content: content.toString().trim()
    })
    if (!tweet) throw new ApiError(500, "failed to create tweet")
    res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"))
})

//get user tweets
const getUserTweets = asynchandler(async (req, res) => {
    const { userId, page = 1, limit = 10, sortBy = "createdAt", sortType = "desc", query } = req.params
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id")
    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)
    const filter = { owner: mongoose.Types.ObjectId.createFromHexString(userId) }
    if (query) filter.content = new RegExp(query, "i")

    // const tweets = await Tweet.find(filter)
    //     .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
    //     .skip((pageNumber - 1) * limitNumber)
    //     .limit(limitNumber)

    // const ids = tweets.map(tweet => tweet._id)
    // const counts = await Like.aggregate([
    //     { $match: { tweet: { $in: ids } } },
    //     { $group: { _id: "$tweet", count: { $sum: 1 } } }
    // ])

    // const map = Object.fromEntries(counts.map(count => [count._id, count.count]))

    // const result = tweets.map(tweet => ({
    //     ...tweet.toObject(),
    //     likes: map[tweet._id] || 0
    // }))

    const viewerId = (req.user && mongoose.Types.ObjectId.isValid(req.user._id))
        ? mongoose.Types.ObjectId.createFromHexString(req.user._id) : null

    const tweets = await Tweet.aggregate([
        { $match: filter }, //  Filter
        { $sort: { [sortBy]: sortType === "desc" ? -1 : 1 } }, //  Sort
        { $skip: (pageNumber - 1) * limitNumber }, //  Pagination
        { $limit: limitNumber },
        { //  Lookup likes only for paginated tweets
            $lookup: {
                from: "likes",
                let: { tweetId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$tweet", "$$tweetId"] } } },
                    { $count: "count" }
                ],
                as: "likesCount"
            }
        },
        //lookup for isLiked check
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "like"
            }
        },
        { //  Flatten likes
            $addFields: {
                likes: { $ifNull: [{ $arrayElemAt: ["$likesCount.count", 0] }, 0] },
                isLiked: viewerId ? { $in: [viewerId, "$like.likedBy"] } : false
            }
        },
        { //  Project final fields
            $project: { _id: 1, content: 1, likes: 1, createdAt: 1, updatedAt: 1, isLiked: 1 }
        }
    ]);



    return res.status(200).json(new ApiResponse(200, tweets, tweets.length ? "Tweets fetched successfully" : "no tweet found"))
})

//get tweet by id
const getTweetById = asynchandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id")
    // const tweet = await Tweet.findById(tweetId)
    const viewerId = (req.user && mongoose.Types.ObjectId.isValid(req.user._id))
        ? mongoose.Types.ObjectId.createFromHexString(req.user._id) : null


    // _id owner content createdAt updatedAt
    const tweet = await Tweet.aggregate([
        {
            $match: { _id: mongoose.Types.ObjectId.createFromHexString(tweetId) }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "like"
            }
        },
        {
            $addFields: {
                likeCount: {
                    $size: "$like"
                },
                isLiked: viewerId ? { $in: [viewerId, "$like.likedBy"] } : false
            }

        },
        {
            $project: {
                owner: 1,
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                likeCount: 1,
                isLiked: 1
            }
        }
    ])

    if (!tweet) throw new ApiError(404, "Tweet not found")
    return res.status(200).json(new ApiResponse(200, tweet, "Tweet fetched successfully"))
})

//update a tweet
const updateTweet = asynchandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id")
    const { content } = req.body
    if (content === "") throw new ApiError(400, "content cant be empty")
    const tweet = await Tweet.findOneAndUpdate({ _id: tweetId, owner: req.user._id },
        { content: content.toString().trim() },
        { new: true, runValidators: true })
    if (!tweet) throw new ApiError(404, "Tweet not found")
    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"))
})

//delete a tweet
const deleteTweet = asynchandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "invalid tweet id")
    const deletedTweet = await Tweet.findOneAndDelete({ _id: tweetId, owner: req?.user?._id })
    if (!deletedTweet) throw new ApiError(500, "failed to delete tweet")
    res.status(200).json(new ApiResponse(200, deletedTweet, "tweet deleted successfully"))
})

export { getUserTweets, getTweetById, newTweet, updateTweet, deleteTweet }
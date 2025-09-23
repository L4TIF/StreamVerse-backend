import { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { asynchandler } from "../utils/asynchandler.js"
import { Tweet } from "../models/tweets.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"

//create a tweet
const newTweet = asynchandler(async (req, res) => {
    const { content } = req?.body
    if (content === "") throw new ApiError(400, "content cant be empty")
    const tweet = await Tweet.create({
        owner: req?.user?._id,
        content
    })
    if (!tweet) throw new ApiError(500, "failed to create tweet")
    res.status(200).json(new ApiResponse(200, tweet, "Tweet created successfully"))
})




//get user tweets
const getUserTweets = asynchandler(async (req, res) => {
    const { userId, page = 1, limit = 10, sortBy = "createdAt", sortType = "desc", query } = req.params
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id")
    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)
    const filter = { owner: userId }
    if (query) filter.content = new RegExp(query, "i")
    const tweets = await Tweet.find(filter).sort({ [sortBy]: sortType === "desc" ? -1 : 1 }).skip((pageNumber - 1) * limitNumber).limit(limitNumber)
    if (!tweets.length) throw new ApiError(404, "No tweets found")
    return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"))
})
//get tweet by id
const getTweetById = asynchandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id")
    const tweet = await Tweet.findById(tweetId)
    console.log(tweet)
    if (!tweet) throw new ApiError(404, "Tweet not found")
    return res.status(200).json(new ApiResponse(200, tweet, "Tweet fetched successfully"))
})

//update a tweet


const updateTweet = asynchandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id")
    const { content } = req.body
    if (content === "") throw new ApiError(400, "content cant be empty")
    const tweet = await Tweet.findOneAndUpdate({ _id: tweetId, owner: req.user._id }, { content }, { new: true, runValidators: true })
    if (!tweet) throw new ApiError(404, "Tweet not found")
    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"))
})




//delete a tweet
const deleteTweet = asynchandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "invalid tweet id")
    const deletedTweet = await Tweet.findOneAndDelete({ _id: tweetId, owner: req?.user?._id })
    if (!deleteTweet) throw new ApiError(500, "failed to delete tweet")
    res.status(200).json(new ApiResponse(200, deleteTweet, "tweet deleted successfully"))
})










export { getUserTweets, getTweetById, newTweet, updateTweet, deleteTweet }
import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { isValidObjectId, mongoose } from "mongoose"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"





const getChannelStats = asynchandler(async (req, res) => {
    const userId = req.user._id
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id")
    const channelStats = await User.aggregate([
        { $match: { _id: mongoose.Types.ObjectId.createFromHexString(userId) } },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            let: { videoId: "$_id" },
                            pipeline: [
                                { $match: { $expr: { $eq: ["$video", "$$videoId"] } } },
                                { $count: "count" }
                            ],
                            as: "likes"
                        }
                    },
                    {
                        $addFields: { likes: { $ifNull: [{ $arrayElemAt: ["$likes.count", 0] }, 0] }, }
                    }
                ],
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                totalSubscribers: {
                    $size: "$subscribers"
                },
                totalViews: { $sum: "$videos.views" },
                totalVideos: { $size: "$videos" },
                totalLikes: { $sum: "$videos.likes" }
            }
        }



    ])

    if (!channelStats) throw new ApiError(404, "Channel stats not found")
    res.status(200).json(new ApiResponse(200, channelStats, "Channel stats fetched successfully"))
})


const getChannelVideos = asynchandler(async (req, res) => {
    const userId = req.user._id
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id")
    const channelVideos = await Video.find({ owner: userId })
    if (!channelVideos) throw new ApiError(404, "Channel videos not found")
    res.status(200).json(new ApiResponse(200, channelVideos, "Channel videos fetched successfully"))
})





export {
    getChannelStats,
    getChannelVideos
}
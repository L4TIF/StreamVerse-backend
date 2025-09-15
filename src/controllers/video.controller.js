import { Video } from "../models/video.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asynchandler } from "../utils/asynchandler.js"



const getAllVideos = asynchandler(async (req, res) => {
    //get req queries
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

    //converting page and limit to number
    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)

    const filter = { isPublished: true }

    if (query) filter.title = new RegExp(query, "i") //search by title
    if (userId) filter.user = userId //search by user Id

    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)


    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

export { getAllVideos }
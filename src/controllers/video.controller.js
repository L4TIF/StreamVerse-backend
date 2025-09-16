import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asynchandler } from "../utils/asynchandler.js"
import { generateThumbnail, uploadOnCloudinary } from "../utils/cloudinary.js"



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

    if (!videos.length) throw new ApiError(404, "Videos not found")
    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"))
})


//publish a video
const publishAVideo = asynchandler(async (req, res) => {
    const { title, description, isPublished } = req.body

    // get video & thumbnail path from multer
    const videoFilePath = req.files?.videoFile?.[0]?.path
    const thumbnailPath = req.files?.thumbnail?.[0]?.path

    if ([title, description].some((field) => field?.trim() === "")) throw new ApiError(400, "All fields are required")
    if (!videoFilePath) throw new ApiError(400, "Video is not uploaded")

    //filter null fields
    const cloudinaryUploads = [
        videoFilePath ? videoFilePath : null,
        thumbnailPath ? thumbnailPath : null,
    ].filter(Boolean)

    //upload video to cloudinary
    const [videoFile, thumbnail] = await Promise.all(
        cloudinaryUploads.map(items => uploadOnCloudinary(items))
    )

    if (!videoFile) throw ApiError(500, "upload failed")

    //create video object for db
    const video = await Video.create({
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url || generateThumbnail(videoFile.public_id),
        owner: req.user._id,
        title,
        description,
        duration: videoFile.duration,
        isPublished
    })

    if (!video) throw ApiError(500, "publish failed")

    return res.status(200).json(new ApiResponse(200, video, "Video published successfully"))

})





//get video by id

//update a video

//delete a video

// togglePublishStatus


export { getAllVideos, publishAVideo }
import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asynchandler } from "../utils/asynchandler.js"
import { deleteFromCloudinary, generateThumbnail, uploadOnCloudinary } from "../utils/cloudinary.js"
import { isValidObjectId } from "mongoose"


//get all videos
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

    return res.status(201).json(new ApiResponse(200, video, "Video published successfully"))

})

//get video by id
const getVideoById = asynchandler(async (req, res) => {
    const { videoFileId } = req.params
    if (!isValidObjectId(videoFileId)) throw new ApiError(400, "invalid video id") //check if id is valid mongo id
    const video = await Video.findById(videoFileId)
    if (!video) throw new ApiError(404, "video not found")
    res.status(200).json(new ApiResponse(200, video, "video fetched successfully"))
})

//update a video
const updateVideoDetails = asynchandler(async (req, res) => {
    const { videoFileId } = req.params
    if (!isValidObjectId(videoFileId)) throw new ApiError(400, "invalid video id") //check if id is valid mongo id
    //update video details title, desc, thumbnail
    const { title, description } = req.body
    const thumbnailLocalPath = req?.file?.path

    let newThumbnail;
    if (thumbnailLocalPath) {
        //get old thumbnail id
        const oldThumbnailUrl = await Video.findOne({ _id: videoFileId, owner: req.user._id }).select("thumbnail")
        await deleteFromCloudinary(oldThumbnailUrl.thumbnail)
        //upload new thumbnail
        newThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    }

    const updatedVideoDetails = await Video.findOneAndUpdate({ _id: videoFileId, owner: req.user._id },
        { title, description, thumbnail: newThumbnail?.url }, { new: true, runValidators: true })

    if (!updatedVideoDetails) throw new ApiError(404, "Video not found")

    return res.status(200).json(new ApiResponse(200, updatedVideoDetails, "details update successfully"))
})

//delete a video
const deleteVideo = asynchandler(async (req, res) => {
    const { videoFileId } = req.params
    if (!isValidObjectId(videoFileId)) throw new ApiError(400, "Invalid video id")

    const deletedVideo = await Video.findOneAndDelete({ _id: videoFileId, owner: req.user._id }, { returnDocument: "before" })
    if (!deletedVideo) throw new ApiError(400, "video not found")
    //delete video from cloudinary
    console.log(deletedVideo)
    await deleteFromCloudinary(deletedVideo.videoFile, "video")

    res.status(200).json(new ApiResponse(200, deletedVideo, "video deleted successfully"))

})

// togglePublishStatus
const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoFileId } = req.params
    if (!isValidObjectId(videoFileId)) throw new ApiError(400, "Invalid video id")

    const updatedVideoDetails = await Video.findOne({ _id: videoFileId, owner: req.user._id })

    if (!updatedVideoDetails) throw new ApiError(404, "video not found")

    updatedVideoDetails.isPublished = !updatedVideoDetails.isPublished
    await updatedVideoDetails.save()

    res.status(200).json(new ApiResponse(200, updatedVideoDetails, "Toggled status successfully"))
})


export { getAllVideos, publishAVideo, getVideoById, updateVideoDetails, deleteVideo, togglePublishStatus }
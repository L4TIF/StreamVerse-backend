
import { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asynchandler } from "../utils/asynchandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose"

//create playlist 
//delete playlist
//update playlist
//add video to playlist
//remove video from playlist
//get playlist by id
//get all playlists of a user

const createPlaylist = asynchandler(async (req, res) => {
    const { name, description } = req.body
    if (!name) throw new ApiError(400, "Name is required")
    const playlist = await Playlist.create({ name, description, owner: req.user._id })
    if (!playlist) throw new ApiError(500, "Failed to create playlist")
    res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"))

})

const deletePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist id")
    const playlist = await Playlist.findOneAndDelete({ _id: playlistId, owner: req.user._id })
    if (!playlist) throw new ApiError(404, "Playlist not found")
    res.status(200).json(new ApiResponse(200, playlist, "Playlist deleted successfully"))
})

const updatePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist id")
    const { name, description } = req.body
    const playlist = await Playlist.findOneAndUpdate({ _id: playlistId, owner: req.user._id }, { name, description }, { new: true })
    if (!playlist) throw new ApiError(404, "Playlist not found")
    res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"))
})

const addVideoToPlaylist = asynchandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist id")
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")
    const isAlreadyExists = await Playlist.findOne({ videos: videoId, owner: req.user._id })
    if (isAlreadyExists) throw new ApiError(400, "video already in playlist")
    const playlist = await Playlist.findOneAndUpdate({ _id: playlistId, owner: req.user._id }, { $push: { videos: videoId } }, { new: true })
    console.log(playlist)
    if (!playlist) throw new ApiError(404, "Playlist not found")
    res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist id")
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")
    const playlist = await Playlist.findOneAndUpdate({ _id: playlistId, owner: req.user._id }, { $pull: { videos: videoId } }, { new: true })
    if (!playlist) throw new ApiError(404, "Playlist not found")
    res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully"))
})

const getPlaylistById = asynchandler(async (req, res) => {
    const { playlistId, page = 1, limit = 10, sortType = "asc" } = req.query
    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)
    console.log(playlistId, pageNumber, limitNumber, sortType)
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist id")
    const playlist = await Playlist.aggregate([
        {
            $match: { _id: mongoose.Types.ObjectId.createFromHexString(playlistId) }
        },
        {
            $skip: (pageNumber - 1) * limitNumber
        },
        {
            $limit: limitNumber
        },
        {
            $lookup: {
                from: "videos",
                let: { ids: "$videos" }, //video ids
                pipeline: [
                    { $match: { $expr: { $in: ["$_id", "$$ids"] } } }, //match video ids with playlist ids
                    //join creators with videos

                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "creator"
                        },
                    },
                    {
                        $unwind: { path: "$creator", preserveNullAndEmptyArrays: true }
                    },
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1,
                            duration: 1,
                            views: 1,
                            createdAt: 1,
                            creator: {
                                _id: "$creator._id",
                                fullName: "$creator.fullName",
                                avatar: "$creator.avatar",
                            }
                        }
                    }
                ],
                as: "videos"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "playList_owner"
            }
        },
        {
            $unwind: "$playList_owner"
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                createdAt: 1,
                playlist_owner: { _id: "$playList_owner._id", fullName: "$playList_owner.fullName", avatar: "$playList_owner.avatar" },
                videos: 1
            }
        },
        {
            $sort: { createdAt: sortType === "asc" ? 1 : -1 }
        }
    ])
    console.log(playlist)
    if (!playlist) throw new ApiError(404, "Playlist not found")
    res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

const getUserPlaylists = asynchandler(async (req, res) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id")
    const playlists = await Playlist.aggregate([
        {
            $match: { owner: mongoose.Types.ObjectId.createFromHexString(userId) }
        },
        {
            $lookup: {
                from: "videos",
                let: { ids: "$videos" },
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    { $match: { $expr: { $in: ["$_id", "$$ids"] } } },
                    { $addFields: { order: { $indexOfArray: ["$$ids", "$_id"] } } },
                    { $sort: { order: 1 } },
                    { $limit: 1 },
                    { $project: { _id: 1, thumbnail: 1 } }
                ],
                as: "firstVideo"
            }
        },
        {
            $addFields: {
                thumbnail: { $arrayElemAt: ["$firstVideo.thumbnail", 0] },
                totalVideos: { $size: "$videos" }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                thumbnail: 1,
                totalVideos: 1
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ])
    if (!playlists) throw new ApiError(404, "Playlists not found")
    res.status(200).json(new ApiResponse(200, playlists, "Playlists fetched successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
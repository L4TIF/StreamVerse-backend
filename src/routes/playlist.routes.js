import { Router } from "express";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()


//public routes
router.route("/u/:userId").get(getUserPlaylists)
router.route("/").get(getPlaylistById)

//private routes
router.use(verifyJWT)
router.route("/").post(createPlaylist)
router.route("/:playlistId").delete(deletePlaylist)
router.route("/:playlistId").patch(updatePlaylist)
router.route("/:playlistId/:videoId").post(addVideoToPlaylist)
router.route("/:playlistId/:videoId").delete(removeVideoFromPlaylist)

export default router
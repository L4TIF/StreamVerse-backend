import { Router } from "express";
import { optionalJWT, verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, IsLiked, publishAVideo, togglePublishStatus, updateVideoDetails } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

//public routes
router.use(optionalJWT)
router.route("/").get(getAllVideos)
router.route("/:videoFileId").get(getVideoById)

//private routes

router.use(verifyJWT)

router.route("/")
    .post(upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        }, {
            name: "thumbnail",
            maxCount: 1
        }
    ]), publishAVideo)

router.route("/:videoFileId")
    .patch(upload.single("thumbnail"), updateVideoDetails)
    .delete(deleteVideo)
router.route("/:videoFileId/is-liked").get(IsLiked)
router.route("/toggle-publish-status/:videoFileId").patch(togglePublishStatus)

export default router
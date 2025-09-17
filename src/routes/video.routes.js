import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideos, getVideoById, publishAVideo, updateVideoDetails } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route("/")
    .get(getAllVideos)
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
    .get(getVideoById)
    .patch(upload.single("thumbnail"), updateVideoDetails)


export default router
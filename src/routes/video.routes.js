import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getAllVideos } from "../controllers/video.controller";
import { upload } from "../middlewares/multer.middleware";





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
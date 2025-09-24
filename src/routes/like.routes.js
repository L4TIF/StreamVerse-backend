import { Router } from "express"
import { getUserLikeVideos, toggleLikeComment, toggleLikeTweet, toggleLikeVideo } from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

//private route
router.use(verifyJWT)
router.route("/comment/:commentId").post(toggleLikeComment)
router.route("/video/:videoId").post(toggleLikeVideo)
router.route("/tweet/:tweetId").post(toggleLikeTweet)
router.route("/videos").get(getUserLikeVideos)

export default router
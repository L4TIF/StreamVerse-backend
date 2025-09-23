import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getUserTweets, getTweetById, newTweet, updateTweet, deleteTweet } from "../controllers/tweet.controller.js"

const router = Router()

// public routes
router.route("/u/:userId").get(getUserTweets)
router.route("/:tweetId").get(getTweetById)

//private routes
router.use(verifyJWT)
router.route("/").post(newTweet)
router.route("/:tweetId")
    .patch(updateTweet)
    .delete(deleteTweet)

export default router
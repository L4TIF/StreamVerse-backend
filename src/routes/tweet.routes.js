import { Router } from "express"
import { optionalJWT, verifyJWT } from "../middlewares/auth.middleware.js"
import { getUserTweets, getTweetById, newTweet, updateTweet, deleteTweet } from "../controllers/tweet.controller.js"

const router = Router()

// public routes
//public route with optionaljwt to check if user is logged in
router.use(optionalJWT)
router.route("/:tweetId").get(getTweetById)
router.route("/u/:userId").get(getUserTweets)

//private routes
router.use(verifyJWT)
router.route("/").post(newTweet)
router.route("/:tweetId")
    .patch(updateTweet)
    .delete(deleteTweet)

export default router
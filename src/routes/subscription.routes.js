import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, toggleSubscription, getUserChannelSubscribers } from "../controllers/subscription.controller.js";

const router = Router()

router.use(verifyJWT)

router.route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription)

router.route("/u").get(getSubscribedChannels)


export default router


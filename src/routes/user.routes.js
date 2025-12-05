import { Router } from "express";
import {
    loginUser, logoutUser, registerUser, refreshAccessToken, changePassword,
    getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage,
    getUserChannelProfile, getUserWatchHistory
} from "../controllers/user.controller.js";

import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
//public routes
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser);
router.route("/refresh-token").get(refreshAccessToken);
router.route("/get-user-channel-profile/:userName").get(getUserChannelProfile)
//private routes

router.use(verifyJWT)

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update-password").post(verifyJWT, changePassword)
router.route("/get-current-user").get(verifyJWT, getCurrentUser)
router.route("/updateAccountDetails").patch(verifyJWT, updateAccountDetails)

router.route("/update-avatar").patch(verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
)
router.route("/update-coverImage").patch(verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
)


router.route("/get-user-watch-history").get(verifyJWT, getUserWatchHistory)

export default router
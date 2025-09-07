import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changePassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

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
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").get(verifyJWT, refreshAccessToken);
router.route("/update-password").put(verifyJWT, changePassword)
router.route("/get-current-user").get(verifyJWT, getCurrentUser)
router.route("/updateAccountDetails").put(verifyJWT, updateAccountDetails)

router.route("/update-avatar").put(verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
)
router.route("/update-coverImage").put(verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
)
export default router
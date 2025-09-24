import { Router } from "express";
import { getComments, newComment, updateComment, deleteComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
//public route
router.route("/:videoId").get(getComments)

//private route
router.use(verifyJWT)
router.route("/:videoId").post(newComment)
router.route("/c/:commentId")
    .patch(updateComment)
    .delete(deleteComment)

export default router
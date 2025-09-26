import { Router } from "express";
import { getComments, newComment, updateComment, deleteComment, getCommentById } from "../controllers/comment.controller.js";
import { optionalJWT, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
//public route
router.use(optionalJWT)
router.route("/:videoId").get(getComments)
router.route("/c/:commentId").get(getCommentById)

//private route
router.use(verifyJWT)
router.route("/:videoId").post(newComment)
router.route("/c/:commentId")
    .patch(updateComment)
    .delete(deleteComment)

export default router
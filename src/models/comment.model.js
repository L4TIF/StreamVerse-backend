import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Like } from "./like.model.js";

const commentSchema = new mongoose.Schema({

    content: {
        type: String,
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, { timestamps: true })

commentSchema.pre('findOneAndDelete', async function() {
    const commentId = this.getQuery()._id
    const userId = this.getQuery().owner
    
    if (!userId) {
      throw new Error('Unauthorized: User ID required for deletion')
    }
    
    // Verify user owns the comment
    const comment = await Comment.findOne({ _id: commentId, owner: userId })
    if (!comment) {
      throw new Error('Unauthorized: User does not own this comment')
    }
    
    // Proceed with cleanup
    await Like.deleteMany({ comment: commentId })
  })
commentSchema.index({ owner: 1, video: 1 })
commentSchema.index({ video: 1 })

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment", commentSchema)
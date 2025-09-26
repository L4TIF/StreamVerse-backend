import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Like } from "./like.model.js";

const tweetSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        required: [true, "tweet cant be empty"]
    }


}, { timestamps: true })

tweetSchema.index({ owner: 1 })
tweetSchema.plugin(mongooseAggregatePaginate)


tweetSchema.pre('findOneAndDelete', async function () {
    const tweetId = this.getQuery()._id
    const userId = this.getQuery().owner
    
    if (!userId) {
      throw new Error('Unauthorized: User ID required for deletion')
    }
    
    // Verify user owns the tweet
    const tweet = await Tweet.findOne({ _id: tweetId, owner: userId })
    if (!tweet) {
      throw new Error('Unauthorized: User does not own this tweet')
    }
    
    // Proceed with cleanup
    await Like.deleteMany({ tweet: tweetId })
})

export const Tweet = mongoose.model("Tweet", tweetSchema)
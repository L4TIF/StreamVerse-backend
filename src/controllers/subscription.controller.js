//toggle subscription

import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const toggleSubscription = asynchandler(async (req, res) => {
    const { channelId } = req.params
    const userId = req.user._id
    const isSubscribed = await Subscription.findOne({ subscriber: userId, channel: channelId })
    if (isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed._id)
        res.status(200).json(new ApiResponse(200, { isSubscribed: false }, "successfully Unsubscribed"))
    } else {
        await Subscription.create({ subscriber: userId, channel: channelId })
        res.status(200).json(new ApiResponse(200, { isSubscribed: true }, "successfully subscribed"))
    }
})

//get user channel subscribers  || users(channel) subscribers
const getUserChannelSubscribers = asynchandler(async (req, res) => {
    const { channelId } = req.params
    const subscriberList = await Subscription.find({ channel: channelId }).populate("subscriber", "userName email avatar")
    res.status(200).json(new ApiResponse(200, subscriberList, "successfully fetched subscribers"))
})

const getSubscribedChannels = asynchandler(async (req, res) => {
    const userId = req.user._id
    const channelList = await Subscription.find({ subscriber: userId }).populate("channel", "userName email avatar")
    res.status(200).json(new ApiResponse(200, channelList, "subscribed channel fetched successfully"))
})


// const getChannelInfo = asynchandler(async (req, res) => {
//     const { channelId } = req.params    
//     const userId = req.user._id
//     const subsCount = await Subscription.countDocuments({ channel: channelId })
//     const isSubscribed = await Subscription.findOne({ subscriber: userId, channel: channelId })
//     // const result = await User.aggregate()

//     res.status(200).json(new ApiResponse(200, { subsCount, isSubscribed: !!isSubscribed }, "successfully fetched channel info"))
// })

//get subscribed channels || user subscribed too other user(channels)



export {
    toggleSubscription,
    //  getChannelInfo,
    getSubscribedChannels,
    getUserChannelSubscribers
}
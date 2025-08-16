import { subscribe } from "diagnostics_channel"
import {Subscription} from "../models/subscription.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose from "mongoose"

const toggleSubscribe= asyncHandler(async (req,res)=>{
    const {channelId}= req.params
    console.log("channel id",channelId)
    const userId= req.user._id
    console.log(userId)
    const existingSub= await Subscription.findOne({channel:channelId,subscriber: userId})
    if(channelId===userId){
        throw new ApiError(500, "cannot subscriber your own channel")
    }
    if(existingSub){
        await Subscription.findByIdAndDelete(existingSub._id)
        return res
            .status(200)
            .json(new ApiResponse(200, [], "unsubscribed"))
    }
    const newSubscription= await Subscription.create({
        channel: channelId,
        subscriber: userId
    })
    if(!newSubscription){
        throw new ApiError(500, "something went worng")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, newSubscription, "subscribed successfully"))
})




const getSubscribers= asyncHandler(async(req, res)=>{
    const {channelId}= req.params

    const subscribersData= await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from: 'users',
                localField:'subscriber',
                foreignField: '_id',
                as:'subscriberInfo',
                pipeline:[
                    {
                        $project:{
                            _id:0,
                            username:1
                        }
                    }
                ]
            }
        },
        {
            $unwind: '$subscriberInfo'
        },
        {
            $group:{
                _id:"$channel",
                subscribers: {$push:"$subscriberInfo"},
                totalSubscribers: {$sum:1}
            }
        },
        {
            $lookup:{
                from:'users',
                localField: '_id',
                foreignField: '_id',
                as:'aboutChannel',
                pipeline:[
                    {
                        $project:{
                            _id:0,
                            username:1,
                            email:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $unwind: '$aboutChannel' 
        }

    ])
    if(!subscribersData){
        throw new ApiError(500, "No subscribers")
    }
    return res
            .status(200)
            .json(new ApiResponse(200, subscribersData, "all suscibers fetched!!"))

})


const isSubscribed=asyncHandler(async(req,res)=>{
    const {channelId}= req.params
    const userId=req.user._id
    const isSubs= await Subscription.findOne({
        channel:channelId,
        subscriber:userId
    })
    return res
            .status(200)
            .json(new ApiResponse(200, {isSubscribed: !!isSubs}, "status checked" ))
})

export {
    toggleSubscribe,
    getSubscribers,
    isSubscribed
}






// 📦 Sample Data
// Users collection (users)
// json
// Copy
// Edit
// [
//   { "_id": ObjectId("U1"), "username": "ashwani", "email": "ashwani@gmail.com", "avatar": "ash.png" },
//   { "_id": ObjectId("U2"), "username": "tanmay", "email": "tanmay@gmail.com", "avatar": "tan.png" },
//   { "_id": ObjectId("U3"), "username": "swati", "email": "swati@gmail.com", "avatar": "swa.png" }
// ]
// Subscriptions collection (subscriptions)
// json
// Copy
// Edit
// [
//   { "_id": "S1", "subscriber": ObjectId("U1"), "channel": ObjectId("U2") },
//   { "_id": "S2", "subscriber": ObjectId("U3"), "channel": ObjectId("U2") }
// ]
// 🧠 Goal:
// Get subscribers of channel U2 (tanmay), along with their usernames and also some info about the channel (tanmay).

// 🔁 Aggregation Pipeline Steps
// 1. $match
// js
// Copy
// Edit
// {
//   $match: {
//     channel: ObjectId("U2")
//   }
// }
// 🔍 Filter subscriptions where channel = U2.

// Result:

// json
// Copy
// Edit
// [
//   { "_id": "S1", "subscriber": "U1", "channel": "U2" },
//   { "_id": "S2", "subscriber": "U3", "channel": "U2" }
// ]
// 2. $lookup subscribers
// js
// Copy
// Edit
// {
//   $lookup: {
//     from: 'users',
//     localField: 'subscriber',
//     foreignField: '_id',
//     as: 'subscriberInfo',
//     pipeline: [{ $project: { _id: 0, username: 1 } }]
//   }
// }
// 🔍 Join each subscriber from users, but only keep username.

// Result:

// json
// Copy
// Edit
// [
//   {
//     "_id": "S1",
//     "subscriber": "U1",
//     "channel": "U2",
//     "subscriberInfo": [{ "username": "ashwani" }]
//   },
//   {
//     "_id": "S2",
//     "subscriber": "U3",
//     "channel": "U2",
//     "subscriberInfo": [{ "username": "swati" }]
//   }
// ]
// 3. $unwind: 'subscriberInfo'
// Flattens subscriberInfo array to a single object.

// Result:

// json
// Copy
// Edit
// [
//   {
//     "_id": "S1",
//     "subscriber": "U1",
//     "channel": "U2",
//     "subscriberInfo": { "username": "ashwani" }
//   },
//   {
//     "_id": "S2",
//     "subscriber": "U3",
//     "channel": "U2",
//     "subscriberInfo": { "username": "swati" }
//   }
// ]
// 4. $group by channel
// js
// Copy
// Edit
// {
//   $group: {
//     _id: "$channel",
//     subscribers: { $push: "$subscriberInfo" },
//     totalSubscribers: { $sum: 1 }
//   }
// }
// 🔄 Combine all subscribers of the same channel (U2), count them.

// Result:

// json
// Copy
// Edit
// [
//   {
//     "_id": "U2",
//     subscribers: [
//       { "username": "ashwani" },
//       { "username": "swati" }
//     ],
//     totalSubscribers: 2
//   }
// ]
// 5. $lookup channel info
// js
// Copy
// Edit
// {
//   $lookup: {
//     from: 'users',
//     localField: '_id',
//     foreignField: '_id',
//     as: 'aboutChannel',
//     pipeline: [
//       { $project: { _id: 0, username: 1, email: 1, avatar: 1 } }
//     ]
//   }
// }
// 🔍 Get channel’s info (user with _id U2).

// Result:

// json
// Copy
// Edit
// [
//   {
//     "_id": "U2",
//     subscribers: [
//       { "username": "ashwani" },
//       { "username": "swati" }
//     ],
//     totalSubscribers: 2,
//     aboutChannel: [
//       {
//         "username": "tanmay",
//         "email": "tanmay@gmail.com",
//         "avatar": "tan.png"
//       }
//     ]
//   }
// ]
// 6. $unwind: 'aboutChannel'
// Flatten aboutChannel.

// Final Result:

// json
// Copy
// Edit
// {
//   "_id": "U2",
//   subscribers: [
//     { "username": "ashwani" },
//     { "username": "swati" }
//   ],
//   totalSubscribers: 2,
//   aboutChannel: {
//     "username": "tanmay",
//     "email": "tanmay@gmail.com",
//     "avatar": "tan.png"
//   }
// }
// ✅ What You Get in Response
// json
// Copy
// Edit
// {
//   status: 200,
//   data: [
//     {
//       _id: "U2",
//       subscribers: [
//         { username: "ashwani" },
//         { username: "swati" }
//       ],
//       totalSubscribers: 2,
//       aboutChannel: {
//         username: "tanmay",
//         email: "tanmay@gmail.com",
//         avatar: "tan.png"
//       }
//     }
//   ],
//   message: "all subscribers fetched!!"
// }
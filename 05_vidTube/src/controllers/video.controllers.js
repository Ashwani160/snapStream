import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import { deleteFromCloudinary, uploadOnCloudinary, uploadVideoCloudinary } from "../utils/cloudinary.js";
import { getVideoDuration } from "../utils/ffmpeg.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.models.js";
import mongoose from "mongoose";

const uploadVideo=asyncHandler(async (req, res)=>{
    if(!req.user){
        throw new ApiError(400, "user not logged in");
    }
    const id=req.user._id;

    const {title, description}=req.body;

    const videoLocalPath=req.files?.video?.[0]?.path;
    const thumbnailLocalPath=req.files?.thumbnail?.[0]?.path;

    const duration= await getVideoDuration(videoLocalPath);
    let videoCloud;
    let thumbnailCloud;

    try{
        videoCloud=await uploadVideoCloudinary(videoLocalPath);
        
        console.log("video uploaded on cloudinary");
    } catch(err){
        throw new ApiError(400, "Error uploading");
    }
    try{
        thumbnailCloud= await uploadOnCloudinary(thumbnailLocalPath);
        console.log("thumbnail uploaded on cloudinary");
    } catch(err){
        throw new ApiError(400, "error uploading thumbnail");
    }


    // const user=await User.findById(id).select('-password -refreshToken');
    let video;
    try{
        video=await Video.create({
            videoFile: videoCloud.secure_url,
            thumbnail: thumbnailCloud.secure_url,
            owner:id,
            title, 
            description,
            duration
        })
    } catch(err){
        if(videoCloud){
            await deleteFromCloudinary(videoCloud.public_id)
        }
        if(thumbnailCloud){
            await deleteFromCloudinary(thumbnailCloud.public_id);
        }
        throw new ApiError(400, err)
    }

    return res.status(200)
               .json(new ApiResponse(200, "video uploaded successfully!!", video));
    

})

const getAllvideos= asyncHandler(async (req, res)=>{
    const videos= await Video.find()
        .populate("owner", "username avatar")
        .sort({createdAt: -1})
    
    return res.status(200).json(new ApiResponse(200, videos, "videos fetched successfully!!"))
})

const getVIdeoById= asyncHandler(async(req, res)=>{
    const {id}=req.params;
    const video=await Video.findById(id).populate("owner", "username avatar");
    if(!video){
        
        throw new ApiError(401, "video not found");
    }
    return res.status(200).json(new ApiResponse(200, video, "video fetched successfully!!"));
})

const subscribedChannelVideos=asyncHandler(async (req,res)=>{
    let id=req.user.id;
    // console.log("here")
    id = new mongoose.Types.ObjectId(id);
    // id= Number(id);
    const videos=await Subscription.aggregate([
        {
            $match:{subscriber: id}
        },
        {
            $group:{
                _id:"$subscriber",
                channels:{$push:"$channel"}
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"channels",
                foreignField:"owner",
                as:"subscribedVideos"
            }
        },
        {
            $project:{
                _id:0,
                subscribedVideos:1
            }
        }
    ])

    res.status(200)
        .json(new ApiResponse(200,videos, "videos fetched successfully"))
});


export {uploadVideo, getAllvideos, getVIdeoById, subscribedChannelVideos};


// for getAllvideos
// Step-by-Step Breakdown
// 1. asyncHandler(...)

// A wrapper that catches errors in async functions automatically (so you don’t have to use try/catch every time).

// Example: If the database fails, instead of crashing, it will forward the error properly to your error handler middleware.

// 2. Video.find()

// Fetches all documents from the Video collection in MongoDB.

// Example Video collection in DB:

// [
//   {
//     "_id": "vid1",
//     "title": "My First Vlog",
//     "url": "https://res.cloudinary.com/video1.mp4",
//     "owner": "user123",
//     "createdAt": "2025-08-15T10:00:00.000Z"
//   },
//   {
//     "_id": "vid2",
//     "title": "Cooking Pasta",
//     "url": "https://res.cloudinary.com/video2.mp4",
//     "owner": "user456",
//     "createdAt": "2025-08-14T08:00:00.000Z"
//   }
// ]


// Notice: owner is just an ObjectId reference to the User collection.

// 3. .populate("owner", "username avatar")

// Replaces the owner id with actual data from the User collection.

// It only selects the username and avatar fields (ignores things like password, email).

// Example User collection:

// [
//   { "_id": "user123", "username": "Ashwani", "avatar": "ashwani.png", "email": "a@gmail.com" },
//   { "_id": "user456", "username": "Neha", "avatar": "neha.png", "email": "n@gmail.com" }
// ]


// After population, your videos data becomes:

// [
//   {
//     "_id": "vid1",
//     "title": "My First Vlog",
//     "url": "https://res.cloudinary.com/video1.mp4",
//     "owner": { "_id": "user123", "username": "Ashwani", "avatar": "ashwani.png" },
//     "createdAt": "2025-08-15T10:00:00.000Z"
//   },
//   {
//     "_id": "vid2",
//     "title": "Cooking Pasta",
//     "url": "https://res.cloudinary.com/video2.mp4",
//     "owner": { "_id": "user456", "username": "Neha", "avatar": "neha.png" },
//     "createdAt": "2025-08-14T08:00:00.000Z"
//   }
// ]

// 4. .sort({ createdAt: -1 })

// Sorts videos by newest first.

// In our example:

// "My First Vlog" (Aug 15)

// "Cooking Pasta" (Aug 14)

// 5. res.status(200).json(new ApiResponse(...))

// Sends the response back to the frontend in a structured format.

// Your ApiResponse likely looks like this:

// class ApiResponse {
//   constructor(statusCode, data, message) {
//     this.statusCode = statusCode;
//     this.data = data;
//     this.message = message;
//   }
// }


// So the actual JSON response the frontend gets is:

// {
//   "statusCode": 200,
//   "data": [
//     {
//       "_id": "vid1",
//       "title": "My First Vlog",
//       "url": "https://res.cloudinary.com/video1.mp4",
//       "owner": { "_id": "user123", "username": "Ashwani", "avatar": "ashwani.png" },
//       "createdAt": "2025-08-15T10:00:00.000Z"
//     },
//     {
//       "_id": "vid2",
//       "title": "Cooking Pasta",
//       "url": "https://res.cloudinary.com/video2.mp4",
//       "owner": { "_id": "user456", "username": "Neha", "avatar": "neha.png" },
//       "createdAt": "2025-08-14T08:00:00.000Z"
//     }
//   ],
//   "message": "Videos fetched successfully"
// }


// ✅ So in summary:

// Fetch all videos from DB

// Join with owner’s username & avatar

// Sort newest first

// Send a nice JSON response

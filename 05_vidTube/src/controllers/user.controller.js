import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken= async (userID)=>{
    try {
        const user= await User.findById(userID);
        if(!user){
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        await User.findByIdAndUpdate(userID, {
            $set: { refreshToken }
        });
        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(504, error?.message)
    }
}


const registerUser= asyncHandler(async(req , res)=>{
    const {fullname, email, username, password}= req.body

    if([fullname, email, username, password].some((field)=> field?.trim()==="")){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser= await User.findOne({
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "Username or Email already exists")
    }

    const avatarLocalPath =req.files?.avatar?.[0]?.path
    const coverLocalPath= req.files?.coverImage?.[0]?.path
    // if(!avatarLocalPath){
    //     throw new ApiError(400, "Avatar file is missing")
    // }
    // const avatar = await uploadOnCloudinary(avatarLocalPath);

    // let coverImage=""
    // if(coverLocalPath){
    //     coverImage = await uploadOnCloudinary(coverLocalPath);
    // }
    
    let avatar;
    try{
        avatar= await uploadOnCloudinary(avatarLocalPath);
        console.log("uploaded avatar", avatar)
    }catch(err){
        console.log("Error uploading the avatar", err);
        throw new ApiError(500, "failed to upload avatar")
    }

    let coverImage;
    try{
        coverImage= await uploadOnCloudinary(coverLocalPath);
        console.log("coverImage uploaded", coverImage)
    }catch(err){
        console.log("Error uploading coveImage", err);
        throw new ApiError(500, "Failed to upload coverImage")
    }

    try {
        const user= await User.create({
            fullname,
            avatar:avatar.url,
            coverImage:coverImage.url ||"" ,
            email, 
            password,
            username: username.toLowerCase()
    
        })
    
        const createdUser= await User.findById(user._id).select(
            "-password -refreshToken"
        )
    
        if(!createdUser){
            throw new ApiError(500, "Something went wrong while registring the user")
        }
    
        return res.status(201).json(new ApiResponse(200, createdUser,"user registered successfully"))
    } catch (error) {
        console.log("User creation failed")
        if(avatar){
            await deleteFromCloudinary(avatar.public_id)
        }
        if(coverImage){
            await deleteFromCloudinary(coverImage.public_id)
        }

        throw new ApiError(500, "Something went wrong while registering the user")
    }
})

const loginUser= asyncHandler(async (req, res)=>{
    const {username, email, password}= req.body;

    const options={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production"
    }
    
    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new ApiError(404, "user not found");
    }
    const passwordCheck =await user.isPasswordCorrect(password);
    if(!passwordCheck){
        throw new ApiError(401, "Invalid password");
    }
    
    const {accessToken, refreshToken}=await generateAccessAndRefreshToken(user._id)
    
    const loggedInUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // console.log("check")
    console.log(accessToken)
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200,
        {user: loggedInUser, accessToken, refreshToken},
        "User logged in successfully"
    ))
})

const refreshAccessToken= asyncHandler(async (req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.header('authorization').split("Bearer")[1]
    if(!incomingRefreshToken){
        throw new ApiError(401, "No refresh token provided")
    }
    try {
        const decoded= jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user=await User.findById(decoded?._id)
        if(!user){
            throw new ApiError(401, "Refresh Token was invalid")
        }
        const {accessToken, refreshToken}=await generateAccessAndRefreshToken(user._id)
        const options={
            httpOnly:true,
            secure: process.env.NODE_ENV ==="production"
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {refreshToken, accessToken}, "access token refreshed"))
    } catch (error) {
        console.error("Refresh token error:", error);
        throw new ApiError(500, error?.message || "Error generating access token");
    }
})


const logout=asyncHandler(async(req, res)=>{

    await User.findByIdAndUpdate(req.user,
        {
            $set:{refreshToken:""}
        },
        {new: true}
    )
    const options={
        httpOnly:true,
        secure: process.env.NODE_ENV==="production"
    }

    return res
        .status(200)
        .clearCookie('refreshToken', options)
        .clearCookie('accessToken', options)
        .json(new ApiResponse(200, null, "logged out"))
})

const changePassword=asyncHandler(async (req, res)=>{
    const {oldPassword, newPassword}=req.body
    const id= req.user._id
    const user=await User.findById(id)
    if(!user){
        throw new ApiError(404, "User not found")
    }
    if(!user.isPasswordCorrect(oldPassword)){
        throw new ApiError(401, "Incorrect password")
    }
    user.password=newPassword
    await user.save()
    return res.json(new ApiResponse(200, null, "password changed"))
})

const changeAvatar=asyncHandler(async(req, res)=>{
    const id=req.user._id
    // const user=await User.findById(id)
    // if(!user){
    //     throw new ApiError(404, "User not found")
    // }
    const avatarLocalPath= req.file.path;

    const avatarCloudinary= await uploadOnCloudinary(avatarLocalPath)
    console.log("avatar cloudinary: ", avatarCloudinary?.url)
    // console.log("check")
    console.log(avatarCloudinary?.url)
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatarCloudinary?.url
            }
        },
        {new: true}
    )
    return res
        .status(200)
        .json(new ApiResponse(200, null, "avatar updated successfully"))
})


const getUser=asyncHandler(async(req,res)=>{
    const id=req.user._id
    const user= await User.findById(id).select('-password -refreshToken');
    if(!user){
        throw new ApiError(404, "User not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "user found!"))
})


const getUserChannelProfile= asyncHandler(async (req,res)=>{
    const {username}=req.params

    const channel =await User.aggregate([
        {
            $match:{
                username:username
            }
        },
        {
            $lookup:{
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'channel',
                as:'subscribers'
            }
        },
        {
            $lookup:{
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'subscriber',
                as:'subscribedTo'
            }
        },
        {
            $addFields:{
                subscribersCount:{$size:"$subscribers"},
                subscribedToCount: {$size: "$subscribedTo"},
                isSubscribed:{
                    $cond:{
                        if: {$in: [req.user._id, 
                            {
                                $map:{
                                    input: "$subscribers",
                                    as: "sub",
                                    in: "$$sub.subscriber"
                                }
                            }
                        ]},
                        then: true,
                        else: false
                    }
                },
                subscribers:{
                    $map:{
                        input: "$subscribers",
                        as: "sub",
                        in: "$$sub.subscriber"
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                avatar:1,
                subscribersCount:1,
                subscribedToCount:1,
                isSubscribed:1,
                coverImage:1,
                email:1,
                subscribers:1,
            }
        }
    ])

    console.log(channel);
    if(!channel.length){
        return res.status(404).send({message: 'Channel not found'})
    }
     
    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "Channel profile fetched succefully"))
})


const getWatchHistory = asyncHandler(async(req,res)=>{
    const id=req.user._id

    const watchHistory= await User.aggregate([
        {
            $match:{
                _id:id
            }
        },

        {
            $lookup:{
                from: 'Video',
                localField: 'watchHistory',
                foreignField: '_id',
                as: 'watchHistory',
                pipeline:[
                    {
                        $lookup:{
                            from: 'User',
                            localField: 'owner',
                            foreignField: '_id',
                            as:'owner',
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },

        {
            $addFields:{
                owner:'$owner'
            }
        }
    ])
    return res
        .status(200)
        .json(new ApiResponse(200, watchHistory[0], "Watch history fetched successfully!"))
})


const getAllusers= asyncHandler(async(req, res)=>{
    const users= await User.find().select('-password -refreshToken -createdAt -updatedAt -__v')

    if(!users){
        return res.status(404).json(new ApiResponse(404, null, "No users found"))
    }
    console.log(users)
    return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully!"))
})


export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logout,
    changePassword,
    changeAvatar,
    getUserChannelProfile,
    getWatchHistory,
    getUser,
    getAllusers
} 
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const  verifyJWT =asyncHandler(async (req , res , next)=>{
    // console.log("check")
    const token= req.cookies.accessToken 
    // console.log(token)
    if(!token){
        throw new ApiError(504, "Unauthorized. token is not there")
    }
    try{
        const decodedToken= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // console.log(decodedToken)
        const user=await User.findById(decodedToken._id)
        // console.log("user found: ", user)
        if(!user){   
            throw new ApiError(504, "Unauthorized. user is not there")
        }
        req.user=user
        next()
    }catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }
    throw new ApiError(401, "Unauthorized. Invalid access token");
  }
})
export {verifyJWT}
import mongoose,{Schema} from "mongoose";

//either of video, tweet or comment will be assigned rest will be null 
const likeSchema=new Schema(
    {
        likedby:{
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        video:{
            type: Schema.type.ObjectId,
            ref: 'Video',
        },
        tweet:{
            type: Schema.type.ObjectId,
            ref: 'Tweet'
        },
        comment:{
            type: Schema.type.ObjectId,
            ref: 'Comment'
        }
    },
    {
        timestamps: true
    }
)

export const Like= mongoose.model('Like', likeSchema)
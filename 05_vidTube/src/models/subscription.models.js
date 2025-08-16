import mongoose,{ Schema} from "mongoose";

const subscriptionSchema= new Schema(
    {
        subscriber:{
            type: Schema.Types.ObjectId,
            ref: 'User', // channel who you are subscribed to
            required: true
        },
        channel:{
            type: Schema.Types.ObjectId,
            ref: 'User', // 
            required: true
        }
    }
)
export const Subscription = mongoose.model('Subscription', subscriptionSchema)
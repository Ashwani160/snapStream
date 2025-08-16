import express from "express"
import { getSubscribers, isSubscribed, toggleSubscribe } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=express.Router();

router.route('/getsubscribers/:channelId').get(getSubscribers)



router.route('/s/:channelId').post(verifyJWT ,toggleSubscribe)
router.route('/status/:channelId').post(verifyJWT, isSubscribed)

export default router
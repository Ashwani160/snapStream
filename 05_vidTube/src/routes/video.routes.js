import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"
import { getAllvideos, getVIdeoById, subscribedChannelVideos, uploadVideo } from "../controllers/video.controllers.js";

const router = Router();

router.route('/uploadvideo').post(verifyJWT, upload.fields([
    {name:'video', maxCount:1},
    {name:'thumbnail', maxCount:1}
]), uploadVideo)

router.route('/').get(getAllvideos);
router.route("/getvideo/:id").post(verifyJWT, getVIdeoById);
router.route('/svideo').post(verifyJWT, subscribedChannelVideos);

export default router;
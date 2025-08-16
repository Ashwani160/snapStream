import {Router}from "express"
import { changeAvatar, changePassword, getAllusers, getUser, getUserChannelProfile, getWatchHistory, loginUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { logout } from "../controllers/user.controller.js";
const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name:'avatar',
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/allusers').get(getAllusers)


//secured routes
router.route('/changepassword').post(verifyJWT, changePassword)
router.route('/logout').post(verifyJWT, logout)
router.route('/c/:username').get(verifyJWT, getUserChannelProfile)
router.route('/history').get(verifyJWT, getWatchHistory)
router.route('/getuser').post(verifyJWT, getUser)

router.route('/changeavatar').post(verifyJWT,
    upload.single('avatar'),
    changeAvatar
)

export default router
import express from 'express'
import { signup , login , logOutUser , updateProfile , changeCurrentPassword , updateUserAvatar} from '../controllers/auth.controller.js';
import verifyJWT from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js';
import  arcjetProtection  from '../middlewares/arcjet.middleware.js'
const router = express.Router();

// router.get('/test', arcjetProtection , (req,res) => {
//     res.status(200).json({message:"test route"})
// })


//Public routes
router.route("/signup").post(
    upload.fields([      //Multer middleware if this route has file uploads
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    signup
)
router.route('/login').post(login)


//Private routes
router.use(verifyJWT)
router.route('/logout').post(logOutUser)
router.route('/update-profile').put(updateProfile)
router.route('/change-password').post(changeCurrentPassword)
router.route('/update-avatar').patch(
    upload.single("avatar"),
    updateUserAvatar
)
router.route('/check').get((req,res) => {res.status(200).json(req.user)})

export default router
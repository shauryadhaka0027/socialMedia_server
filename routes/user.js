// routes/authRoutes.js
import express from 'express';
import { upload } from '../utils/multer.js';

import { addFollowering, fetchUsers, login, passwordChange, profilePictureChange, register, userDetailsById, userProfileUpdate, userUnfollow } from '../controller/auth.js';
import { auth } from '../middleware/auth.js';
import { logout } from '../controller/logout.js';




const router = express.Router();

router.post("/user/signup", upload.single("profilePicture"), register)
router.post('/upload', upload.single('profilePicture'), profilePictureChange);
router.post("/user/getUsers", auth, fetchUsers)
router.post("/user/login", login)
router.post("/user/addFollowing", auth, addFollowering)
router.post("/user/getUserById", auth, userDetailsById)
router.post("/user/userUnfollow", auth, userUnfollow)
router.patch("/user/updateUser", upload.single("profilePicture"), auth, userProfileUpdate)
router.patch("/user/updatePassword", auth, passwordChange)
router.post("/user/logout",logout)

export default router;

import express from 'express';
import {  deletePost, getComments, getLikes, getPostById, getUserPost, updatePostById, userPost } from '../controller/post.js';
import { upload } from '../utils/multer.js';
import { auth } from '../middleware/auth.js';

const router= express.Router()


router.post("/user/postData",auth,upload.single("profilePicture"),userPost)
router.post("/user/getAllPost",auth,getUserPost)
router.post("/user/getLikesPost",auth,getLikes)
router.post("/user/getCommentsPost",auth,getComments)
router.post("/user/deleteUserPost",auth,deletePost)
router.post("/user/getPostById",auth,getPostById)
router.patch("/user/updateUserPost",auth,updatePostById)


export default router
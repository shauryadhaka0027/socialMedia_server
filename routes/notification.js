import express from 'express';
import { auth } from '../middleware/auth.js';
import { getNotifications } from '../controller/notification.js';


const router= express.Router();

router.post("/user/getNotifications",auth,getNotifications)

export default router;



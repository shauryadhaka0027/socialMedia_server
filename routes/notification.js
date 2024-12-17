import express from 'express';
import { auth } from '../middleware/auth.js';
import { acceptRequest, getNotifications } from '../controller/notification.js';


const router= express.Router();

router.post("/user/getNotifications",auth,getNotifications)
router.post("/user/acceptRequest",auth,acceptRequest)

export default router;



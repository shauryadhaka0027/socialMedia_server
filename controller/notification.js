import { Notification } from "../model/notification.js";

export const getNotifications = async (req, res) => {
  try {
    const { id } = req.body;
    
   
    const notifications = await Notification.find({ postUserId: id })
      .sort({ createdAt: -1 }) 
      .limit(4)  
      .populate('sender')  
      .exec();  

    // console.log("Notifications:", notifications);

    res.status(200).json({"msg":"succesfully", data: notifications });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

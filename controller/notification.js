import { Notification } from "../model/notification.js";

export const getNotifications = async (req, res) => {
  try {
    // const { id } = req.body;
    
   
    // const notifications = await Notification.find({ postUserId: id })
    //   .sort({ createdAt: -1 }) 
    //   .limit(4)  
    //   .populate('sender')  
    //   .exec();  
    const { id, readNotification } = req.body;


    const notifications = await Notification.find({ postUserId: id, read: true })
      .sort({ createdAt: -1 })
      .populate("sender")
      .exec();

    if (readNotification) {
      await Notification.updateMany(
        { postUserId: id, read: true },
        { $set: { read: false } }
      );
    }

    // console.log("Notifications:", notifications);

    res.status(200).json({"msg":"succesfully", data: notifications });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

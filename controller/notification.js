import { Notification } from "../model/notification.js";
import { User } from "../model/user.js";

export const getNotifications = async (req, res) => {
  try {
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

      const visible = await Notification.find({ postUserId: id, accept: false, type: "follow" })
      if (visible) {
        await Notification.updateMany(
          { postUserId: id, type: "follow", accept: false },
          { $set: { read: true } }
        );
      }

    }
    //  if (notifications && notifications._id) {
    //   await Notification.findByIdAndUpdate(
    //     notifications._id, 
    //     { read: true },
    //     { new: true } 
    //   );
    // } else {
    //   console.log("Invalid notification ID");
    // }

    //  if(notifications?.type == "follow"){
    //   await Notification.findByIdAndUpdate(notifications?._id,{read: false});


    //  }
    // console.log("notifications", notifications);

    res.status(200).json({ msg: "Successfully fetched notifications", data: notifications });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};


export const acceptRequest = async (req, res) => {
  try {
    const { _id } = req.body;
    const findNotification = await Notification.findById(_id);
    if (!findNotification) {
      return res.status(404).json({ msg: "Notification not found" });
    }
    const findUser = await User.findById(findNotification?.postUserId);
    // console.log("::::", findUser)
    if (!findUser) {
      return res.status(404).json({ msg: "User not found" });
    }


    const userStatus = findUser.followers.find(f => f?.userId.equals(findNotification?.sender));
    // console.log("userStatus", userStatus)
    if (!userStatus) {
      return res.status(404).json({ msg: "UserStatus not found in following array" });
    }

    await User.updateOne({
      _id: findNotification.sender, "following.userId": findNotification.postUserId
    }, {
      $set: { "following.$.status": "follow" }
    })

    await User.updateOne(
      { _id: findNotification.postUserId, "followers.userId": findNotification.sender },
      { $set: { "followers.$.status": "follow" } }
    );
    const notifications = await Notification.find({ postUserId: _id, read: true })
      .sort({ createdAt: -1 })
      .populate("sender")
      .exec();

    await Notification.findByIdAndUpdate(_id, { accept: true, read: false });

    return res.status(200).json({ msg: "Request accepted successfully", data: notifications });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


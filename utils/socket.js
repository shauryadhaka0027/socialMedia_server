import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Notification } from "../model/notification.js";
import dotenv from "dotenv"

dotenv.config();


const app = express();
const server = http.createServer(app);
const url = process.env.PRODUCTION_URL

const io = new Server(server, {
  cors: {
    origin: url,
    methods: ["GET", "POST"],
  },
});

const usersocketMap = {};

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    usersocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(usersocketMap));
  socket.on("like", async (data) => {
    const { postUserId, sender, postId } = data;

    try {

      const notification = await Notification.create({
        postUserId,
        sender,
        type: "like",
        postId,
      });


      const populatedNotification = await Notification.findById(notification._id)
        .populate('sender')
        .exec();

      // console.log("postUserId", postUserId)
      const recipientSocketId = usersocketMap[postUserId];
      // console.log("RecipientSocketId:", recipientSocketId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit(`notification_${postUserId}`, populatedNotification);
      } else {
        console.warn(`No socket connection found for user ${postUserId}`);
      }
    } catch (error) {
      console.error("Error saving like notification:", error);
    }
  });


  socket.on("follow", async (data) => {
    const { postUserId, sender } = data;
    try {

      const notification = await Notification.create({
        postUserId,
        sender,
        type: "follow",
        read:true
      });

      console.log("New follow notification saved:", notification);
      const populatedNotification = await Notification.findById(notification._id)
        .populate('sender')
        .exec();

      const recipientSocketId = usersocketMap[postUserId];
      io.to(recipientSocketId).emit(`notification_${postUserId}`, populatedNotification);

    } catch (error) {
      console.error("Error saving follow notification:", error);
    }
  });

  socket.on("comment", async (data) => {
    const { postUserId, sender, postId } = data;
    try {

      const notification = await Notification.create({
        postUserId,
        sender,
        postId,
        type: "comment",
      });

      console.log("New follow notification saved:", notification);
      const populatedNotification = await Notification.findById(notification._id)
        .populate('sender')
        .populate('postId')
        .exec();

      const recipientSocketId = usersocketMap[postUserId];
      io.to(recipientSocketId).emit(`notification_${postUserId}`, populatedNotification);

    } catch (error) {
      console.error("Error saving follow notification:", error);
    }
  });


  socket.on("Accept", async (data) => {
    const { _id, sender } = data;
    try {

      const populatedNotification = await Notification.findByIdAndUpdate(_id, { type: "accept" })
        .populate('sender')
        .exec();

      const recipientSocketId = usersocketMap[populatedNotification?.sender?._id];
      console.log("populatedNotification", populatedNotification)
      io.to(recipientSocketId).emit(`notification_${populatedNotification?.sender?._id}`, populatedNotification);

    } catch (error) {
      console.error("Error saving follow notification:", error);
    }
  });



  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    if (userId) {
      delete usersocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(usersocketMap));
  });
});


export { server, io, app };

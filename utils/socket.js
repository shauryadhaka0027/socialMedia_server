import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Notification } from "../model/notification.js";


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
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
    const { postUserId, sender,postId } = data;
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



  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    if (userId) {
      delete usersocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(usersocketMap));
  });
});


export { server, io, app };

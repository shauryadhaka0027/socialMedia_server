import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    postUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['follow', 'like', 'comment'], required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null }, 
    // message: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);

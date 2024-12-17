import mongoose, { Schema } from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  bio: { type: String, default: '' },
  followers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String
  }],
  following: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String
  }],
}, { timestamps: true });


export const User = mongoose.model("User", userSchema)
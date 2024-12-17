import bcrypt from 'bcrypt';
import { User } from '../model/user.js';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { cloudinary } from '../utils/cloudinary.js';





dotenv.config();

export const register = async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;

    if (!(username && email && password && bio)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    let imageUrl = null;
    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path);
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      bio,
      profilePicture: imageUrl,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser.id }, process.env.SECERT_KEY || "123456", { expiresIn: "2d" })
    res.cookie("token", token, {
      httpOnly: true,      
      sameSite: "None",    
      secure: true,        
      maxAge: 2 * 24 * 60 * 60 * 1000, 
    });


    return res.status(201).json({
      message: "User registered successfully",
      data: newUser,
      token: token,
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ message: err.message });
  }
};


export const fetchUsers = async (req, res) => {
  try {
    const { userId } = req.body;

    // if (!userId) {
    //   return res.status(400).json({ message: "User ID is required" });
    // }
    //  console.log("user",userId)
    //  console.log("")
    const user = await User.find({ _id: { $ne: userId } });
    return res.status(200).json({ data: user });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: error.message });
  }
};




export const userDetailsById = async (req, res) => {
  try {
    const { _id } = req.body;

  

    const user = await User.findById(_id); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   
    return res.status(200).json({ data: user });
  } catch (err) {
    console.error("User Details Error:", err)
   
      return res.status(500).json({ message: "Internal server error" });
  
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" })
      }
      
      const token = jwt.sign({ userId: user.id }, process.env.SECERT_KEY || "123456", { expiresIn: "2d" })
      // res.cookie("token", token, {
      //   httpOnly: false,
      //   sameSite:"Lax", 
      //   secure: true,                   
      //   maxAge: 2* 24 * 60 * 60 * 1000,      
      // });
      res.cookie("token", token, {
        httpOnly: true,      
        sameSite: "None",    
        secure: true,        
        maxAge: 2 * 24 * 60 * 60 * 1000, 
      });
  
      return res.status(200).json({ msg: "Login Succesfully", data: user, token: token })
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message })
  }

}
export const addFollowering = async (req, res) => {
  try {
    const { _id, userId } = req.body;
    if (!userId) return res.status(404).json({ msg: "userId not found" });

    const findUser = await User.findById(_id);
    if (!findUser) return res.status(404).json({ msg: "User not found" });

    const followers = await User.findById(userId);
    if (!followers) return res.status(404).json({ msg: "User to follow not found" });

    // Check if the user is already following
    if (findUser.following.find(f => f?.userId.equals(userId))) {
      return res.status(400).json({ msg: "User already followed" });
    }

    // Add to following and followers with "pending" status
    findUser.following.push({ userId, status: "pending" });
    followers.followers.push({ userId: _id, status: "pending" });

    await findUser.save();
    await followers.save();

    return res.status(200).json({ msg: "Followed successfully", data: findUser });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


export const userUnfollow = async (req, res) => {
  try {
    const { _id, userId } = req.body;
    if (!userId) return res.status(404).json({ msg: "userId not found in request body" });

     console.log("userrrr",userId)
     console.log("____id",_id)
    const findUser = await User.findById(_id);
    if (!findUser) return res.status(404).json({ msg: "User not found" });


    const follow = await User.findById(userId);
    if (!follow) return res.status(404).json({ msg: "User to unfollow not found" });
   


    const followingIndex = (findUser.following.find(f => f?.userId.equals(userId))) ;
    const followersIndex = (follow.followers.find(f=>f.userId.equals(_id))) ;
    if (followingIndex === -1) {
      return res.status(400).json({ msg: "You are not following this user" });
    }


    findUser.following.splice(followingIndex, 1);
    findUser.followers.splice(followingIndex, 1);
    follow.followers.splice(followersIndex, 1);

    const followerIndex = follow.followers.findIndex(f => f.userId === _id);
    if (followerIndex !== -1) {
      follow.followers.splice(followerIndex, 1);
    }


    await findUser.save();
    await follow.save();

    return res.status(200).json({ msg: "Unfollowed successfully", data: findUser });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


export const userProfileUpdate = async (req, res) => {
  try {
    const { _id } = req.body
    const findUser = await User.findById(_id)
    if (!findUser) return res.status(404).json({ msg: "User not found" })

    const updateUser = await User.findByIdAndUpdate(_id, req.body)
    return res.status(200).json({ msg: "Profile updated successfully", data: updateUser })
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

export const profilePictureChange = async (req, res) => {
  try {

    console.log("rrr", req.file, req.body)
    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path)

        const profilePicture = await User.findByIdAndUpdate(req.body._id, { profilePicture: uploadResult.secure_url })
      } catch (error) {
        console.error("Cloudinary Upload Error:", error)
        return res.status(500).json({ msg: "Failed to upload image" })
      }
    }
    res.json({ msg: "Image uploaded successfully" })
  } catch (error) {
    res.status(500).json({ msg: "Cloudinary Upload Error:", error })
  }

}


export const passwordChange = async (req, res) => {
  try {
    const { _id, password } = req.body
    const user = await User.findById(_id)
    if (!user) return res.status(404).json({ msg: "User not found" })

    // const isMatch = await bcrypt.compare(req.body.password, user.password);
    // if (!isMatch) {
    //   return res.status(400).json({ msg: "Invalid credentials" })
    // }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword
    await user.save()
    res.status(200).json({ msg: "Password changed" })
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }

}


export const searchUser=async(req,res)=>{
  try{
    const {value}=req.body
    const user=await User.find({username:{$regex:value,$options:"i"}})
    console.log(user)
    res.status(200).json({data:user})
  }catch(error){
    console.error("Search User Error:", error)
    res.status(500).json({message: error.message})
  }
}




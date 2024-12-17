import { Notification } from "../model/notification.js";
import { Post } from "../model/post.js"
import { User } from "../model/user.js";
import { cloudinary } from "../utils/cloudinary.js";

export const userPost = async (req, res) => {
    try {

        if (!req.body.user || !req.body.content) {
            return res.status(400).json({ msg: "User and content are required." });
        }

        console.log("Request body:", req.body);

        let imageUrl = null;
        console.log("Image URL:", req.file);

        if (req.file) {
            try {
                const uploadResult = await cloudinary.uploader.upload(req.file.path);
                imageUrl = uploadResult.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError.message);
                return res.status(500).json({ msg: "Image upload failed." });
            }
        }


        const newPost = new Post({
            user: req.body.user,
            content: req.body.content,
            image: imageUrl,
        });

        await newPost.save();

        res.status(201).json({
            msg: "Post created successfully.",
            post: newPost,
        });
    } catch (error) {
        console.error("Error creating post:", error.message);
        res.status(500).json({ msg: error.message });
    }
};


export const getUserPost = async (req, res) => {
    try {
        const userId = req.body.UserId;

        const findUser = await User.findById(userId).populate("following");

        if (!findUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        
        const followingUserIds = findUser.followers
            .filter((user) => user.status === "follow") 
            .map((user) => user.userId); 
        const followersUserIds = findUser.following.filter((user) => user.status === "follow") 
        .map((user) => user.userId);

        
        const queryUserIds = [...followingUserIds, userId,...followersUserIds];

       
        const posts = await Post.find({ user: { $in: queryUserIds } })
            .populate("user", "username profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json({ msg: "Posts found successfully", data: posts });
    } catch (error) {
        console.error("Error fetching posts:", error.message);
        res.status(500).json({ msg: error.message });
    }
};



export const getLikes = async (req, res) => {
    try {

        const { postId, userId, _id } = req.body;

        if (!postId || !userId) {
            return res.status(400).json({ msg: "PostId and UserId are required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        if (post.likes.includes(userId)) {
            // return res.status(400).json({ msg: "You have already liked this post" });
            const index = post.likes.indexOf(userId);
            post.likes.splice(index, 1);
            await post.save()
            return res.status(200).json({ msg: "Post Unliked" });

        }

        post.likes.push(userId);
        await post.save();
        // const notificationData = {postUserId:_id, sender: userId,postId, type: "like", read: true }
        // const notification = new Notification(notificationData)
        // await notification.save()
        res.status(200).json({ msg: "Post liked successfully", data: post });

    } catch (error) {

        res.status(500).json({ msg: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.body
        const userId = req.body.UserId;
        const findPost = await Post.findById(postId);

        // console.log(findPost.user, "===" ,userId)

        if (findPost?.user == userId) {
            const post = await Post.findByIdAndDelete(postId);
            return res.status(200).json({ msg: "Post deleted successfully" })
        } else {
            return res.status(401).json({ msg: "Unauthorized to delete this post" })
        }



        // if (!post) {
        //     return res.status(404).json({ msg: "Post not found" })
        // }

    } catch (error) {
        res.status(404).json({ msg: error.message })
    }
}

export const getComments = async (req, res) => {
    try {
        const { postId, userId } = req.body;

        if (!postId || !userId) {
            return res.status(400).json({ msg: "PostId and UserId are required" });
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        post.comments.push({ user: req.body.userId, text: req.body.content });
        await post.save();
        res.status(200).json({ msg: "Comment added successfully", data: post });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const updatePostById = async (req, res) => {
    const { postId, content } = req.body;
    // console.log("postId", postId);
    // console.log("content", content);

    try {

        const postUpdate = await Post.findByIdAndUpdate(
            postId,
            { content },
            { new: true }
        );

        console.log("postUpdate", postUpdate);
        if (!postUpdate) {
            return res.status(404).json({ msg: "Post not found" });
        }

        res.status(200).json({ msg: "Post updated successfully", data: postUpdate });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


export const getPostById = async (req, res) => {
    const { postId } = req.body;
    //   console.log("postId",postId)
    try {
        const post = await Post.findById(postId);
        res.status(200).json({ msg: "Post found successfully", data: post })
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

import { blackList } from "../blackListuser/blackListUser.js";

export const logout = async (req, res) => {
    let token = req.cookies["token"] || req.headers.authorization;

    try {
        if (token) {
    
            blackList.push(token); 
            console.log("User is logged out");
            
            res.clearCookie("token");
            return res.status(200).json({ Message: "User is logged out" });
        } else {
            return res.status(400).json({ Message: "No token found" });
        }
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

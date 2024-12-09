import { blackList } from "../blackListuser/blackListUser.js";

export const logout = async (req, res) => {
    let token = req.cookies["token"] || req.headers.authorization;
    try {
        
        if (token) {
            blackList.push(token)
            console.log("user is logout")
            res.clearCookies("token").send({ Message: "user is logout" })
            return res.status(200).json({ Message: "user is logged out" })
        }

    } catch (error) {
        res.send({ "msg": error })
    }

}
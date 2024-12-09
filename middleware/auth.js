import dotenv from "dotenv";
import jwt from "jsonwebtoken"; // Correct import
import { blackList } from "../blackListuser/blackListUser.js";
dotenv.config();

export const auth = (req, res, next) => {
    try {
        
        let token = req.cookies["token"] || req.headers.authorization;
        
        if (!token) {
            return res.status(400).json({ msg: "Token is not provided" });
        }

        if(token){
            if(blackList.includes(token)){
                res.send({"msg":"user login again"});
            }
        }

        jwt.verify(token, process.env.SECERT_KEY, (err, decode) => {
            if (err) {
                return res.status(400).json({ msg: "Invalid or expired token", error: err });
            }

           req.body.UserId = decode.userId; 
            
            // req.body.user = decode.user;
            // console.log("Decoded token data:", decode);

            next(); 
        });
    } catch (error) {
        console.error("Error in auth middleware:", error);
        res.status(500).json({ msg: "Internal Server Error", error: error.message });
    }
};

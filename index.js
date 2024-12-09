import express from 'express';
import dotenv from "dotenv"
import connection from './config/db.js';
import userRouter from "./routes/user.js"
import postRouter from "./routes/post.js"
import notificationRouter from "./routes/notification.js"
import cors from "cors"
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { app, server } from './utils/socket.js';
dotenv.config();
const port = 3000;

const url=process.env.PRODUCTION_URL
  
app.use(cors({
    origin: [url],
    credentials: true,
    methods: ["GET", "POST", "PATCH"],
}))
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser())



app.use("/api", userRouter)
app.use("/api", postRouter)
app.use("/api",notificationRouter)




server.listen(port, async () => {
    await connection
    console.log(`Server is running on port ${port} and MongoDB is running`);

})
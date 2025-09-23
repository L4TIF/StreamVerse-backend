import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.middleware.js';
import { notFoundHandler } from './middlewares/error.middleware.js';
import morgan from 'morgan';
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({ limit: "16kb" })) //for json data
app.use(express.urlencoded({ extended: true, limit: "16kb" })) //for encoding url like latif%20rahman
app.use(express.static("public")) //for setting path for static files
app.use(cookieParser())
app.use(morgan("dev"))
//routes import 
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import tweetRouter from './routes/tweet.routes.js';
//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/tweets", tweetRouter)

app.use(notFoundHandler) //not found handler middleware
app.use(errorHandler) //error handler middleware
export { app };
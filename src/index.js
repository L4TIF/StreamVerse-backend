import dotenv from 'dotenv'
import express from 'express';
import connectDB from './db/index.js';

dotenv.config({
    path: ''
})

// connect database
connectDB()






/*
---one way to connect to db and start server---

const app = express();
; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Error", error)
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log("app is listening on port :", process.env.PORT)
        })

    } catch (error) {
        console.log("error :", error)
    }

})()

*/


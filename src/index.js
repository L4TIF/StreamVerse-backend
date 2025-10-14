import 'dotenv/config'

import connectDB from './db/index.js';
import { app } from './app.js';

const PORT = process.env.PORT || 8000;


// connect database
connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("Error", error.message)
            throw error
        })
        app.listen(PORT, () => console.log("app listening on port :", PORT))
    })
    .catch(error => console.log("mongo db connection error", error.message))






/*
---one way to connect to db and start server---

const app = express();
; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Error", error.message)
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log("app is listening on port :", process.env.PORT)
        })

    } catch (error) {
        console.log("error :", error.message)
    }

})()

*/


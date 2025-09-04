import dotenv from 'dotenv'

import connectDB from './db/index.js';
import { app } from './app.js';

const PORT = process.env.PORT || 8000;
dotenv.config({
    path: "./.env"
});


// connect database
connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("Error", error)
            throw error
        })
        app.listen(PORT, () => console.log("app listening on port :", PORT))
        app.get("/", (req, res) => {
            res.send("<h1>Hello backend</h1>")
        })
    })
    .catch(error => console.log("mongo db connection error", error))






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


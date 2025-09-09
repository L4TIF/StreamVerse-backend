//create auth middleware to protect private routes

import jwt from "jsonwebtoken";
import { asynchandler } from "../utils/asynchandler.js";


export const verifyJWT = (req, res, next) => {
    const token = req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = decoded;
        next();
    })

}
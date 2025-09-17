import { ApiError } from "../utils/ApiError.js";



export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error"

    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : null
    })
}

export const notFoundHandler = (req, res, next) => {
    next(new ApiError(404, "Route not found")); // pass to error middleware
};
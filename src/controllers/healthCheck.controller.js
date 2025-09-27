import { asynchandler } from "../utils/asynchandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"

export const healthCheck = asynchandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, "Server is running", "Server is running"))
})
import { ApiError } from '../utils/ApiError.js';
import { asynchandler } from '../utils/asynchandler.js'
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import fs from 'fs'

const registerUser = asynchandler(async (req, res) => {

    //get user details form frontend
    const { fullName, userName, email, password, } = req.body
    //get images path from multer
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path
    //validate user details
    if (
        [fullName, userName, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //check if user already exists:username,email
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existedUser) {
        // unlink uploaded file in local if user is trying to re-register
        fs.unlinkSync(coverImageLocalPath)
        fs.unlinkSync(avatarLocalPath)
        throw new ApiError(409, "User already exist")
    }
    console.log("reached here")
    //check for images, check of avatar


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")

    }

    //upload image to cloudinary,avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // console.log(avatar, coverImage)

    if (!avatar) throw ApiError(400, "Avatar is required")

    //create user object  - create entry in db

    const user = await User.create({
        fullName,
        userName: userName.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",

    })

    //remove password and refresh token from response
    //check of user created successfully 
    const createdUser = await User.find(user._id).select("-password -refreshToken")
    if (!createdUser) throw new ApiError(500, "something went wrong while creating user")


    //send response

    return res.status(201).json(new ApiResponse(200, createdUser, "user registered successfully"))

})

const loginUser = asynchandler(async (req, res) => {
    //get user details
    const { userName, email, password } = req.body
    //validate user details
    if ([userName || email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    //check if user exists
    const user = await User.findOne({ $or: [{ userName: userName?.toLowerCase() }, { email }] })
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    //match password
    const isMatch = await user.isPasswordCorrect(password)
    if (!isMatch) {
        throw new ApiError(401, "Invalid credentials")
    }

    //generate token
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    //save refresh token in db
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    //remove password and refresh token from response
    const userData = await User.findById(user._id).select("-password -refreshToken -__v -createdAt -updatedAt")

    //set cookies
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
    }



    //send response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: userData, accessToken, refreshToken }, "user logged in successfully"))
})

const logoutUser = asynchandler(async (req, res) => {
    //get user id from req

    const userId = req.user._id

    //find user in db and remove refresh token
    const user = await User.findById(userId)
    if (!user) throw new ApiError(404, "User not found")

    user.refreshToken = null
    await user.save({ validateBeforeSave: false })

    //remove cookies
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    }

    res.clearCookie("accessToken", options)
    res.clearCookie("refreshToken", options)

    //send response
    return res.status(200).json(new ApiResponse(200, null, "user logged out successfully"))

})

const refreshAccessToken = asynchandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.headers?.authorization?.split(" ")[1];

    if (!refreshToken) {
        throw new ApiError(401, "Unauthorized");
    }

    //verify refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            throw new ApiError(401, "Unauthorized");
        }

        //check if refresh token is in db
        const user = await User.findById(decoded?._id)
        if (!user || user.refreshToken !== refreshToken) {
            throw new ApiError(401, "Unauthorized");
        }

        //generate new access token
        const newAccessToken = user.generateAccessToken()

        //set new access token in cookie
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
        }

        res.cookie("accessToken", newAccessToken, options)

        //send response
        return res.status(200).json(new ApiResponse(200, { accessToken: newAccessToken }, "Access token refreshed successfully"))
    })
})

const changePassword = asynchandler(async (req, res) => {
    //get old password and new password from req body
    const { oldPassword, newPassword } = req.body
    //find user in db with id
    const userId = req.user._id
    const user = await User.findById(userId)
    if (!user) throw new ApiError(404, "user not found")

    //compare old password to db password
    console.log(oldPassword, user.password)
    if (!user.isPasswordCorrect(oldPassword)) throw new ApiError(401, "Invalid current password")

    //update password
    user.password = newPassword.trim()
    await user.save()

    //send response
    return res.status(200)
        .json(new ApiResponse(200, { password: newPassword }, "Password updated successfully"))

})


export { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword }
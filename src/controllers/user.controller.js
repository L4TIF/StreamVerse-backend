import { ApiError } from '../utils/ApiError.js';
import { asynchandler } from '../utils/asynchandler.js'
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';


const registerUser = asynchandler(async (req, res) => {

    //get user details form frontend
    const { fullName, userName, email, password, } = req.body
    // console.log(req.body)
    console.log(fullName, userName, email, password);

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
    // console.log(existedUser)
    if (existedUser) {
        throw new ApiError(409, "User already exist")

    }

    //check for images, check of avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

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

export { registerUser }
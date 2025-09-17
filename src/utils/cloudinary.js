import { v2 as cloudinary } from 'cloudinary';
import { configDotenv } from 'dotenv';
import fs from 'fs';
import { ApiError } from './ApiError.js';
configDotenv()  //load env variables from .env file

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const deleteFromCloudinary = async (url, resource_type = "image") => {

    const publicId = url.split("/").pop().split(".")[0]

    try {
        await cloudinary.uploader.destroy(publicId, { resource_type })
        console.log(publicId + " " + url, "file is deleted from cloudinary");
    } catch (error) {
        throw new ApiError(500, `Error deleting cloudinary file : ${error.message} `)
    }

}

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return;
        //upload the file on cloudinary
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        console.log("file is uploaded on cloudinary");
        fs.unlinkSync(localFilePath)  //remove file from local uploads folder
        return result
    } catch (error) {
        fs.unlinkSync(localFilePath)  //remove file from local uploads folder
        console.log("error while uploading on cloudinary");
        return error
    }
}

const generateThumbnail = (publicId) => {
    const thumbnailUrl = cloudinary.url(publicId, {
        resource_type: "video",
        format: "jpg",
        transformation: [
            { width: 300, height: 200, crop: "fill" }, // resize
            { start_offset: "5" } // capture frame at 5 seconds
        ]
    })

    return thumbnailUrl
}

export {
    uploadOnCloudinary,
    deleteFromCloudinary,
    generateThumbnail
}
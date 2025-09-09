import { v2 as cloudinary } from 'cloudinary';
import { configDotenv } from 'dotenv';
import fs from 'fs';
configDotenv()  //load env variables from .env file

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const deleteFromCloudinary = async (url) => {

    const publicId = url.split("/").pop().split(".")[0]

    try {
        await cloudinary.uploader.destroy(publicId)
        console.log(publicId + " " + url, "file is deleted from cloudinary");
    } catch (error) {
        console.log("error while deleting from cloudinary");
    }

}


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return;
        //upload the file on cloudinary
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        console.log(result.url, result.public_id, "file is uploaded on cloudinary");
        fs.unlinkSync(localFilePath)  //remove file from local uploads folder
        return result
    } catch (error) {
        fs.unlinkSync(localFilePath)  //remove file from local uploads folder
        console.log("error while uploading on cloudinary");
        return error
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }
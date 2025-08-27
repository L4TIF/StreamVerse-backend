import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCoudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return;
        //upload the file on cloudinary
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        console.log(result.url, "file is uploaded on cloudinary");
        return result
    } catch (error) {
        fs.unlinkSync(localFilePath)  //remove file from local uploads folder
        console.log(error);
        return error
    }
}

export { uploadOnCoudinary }
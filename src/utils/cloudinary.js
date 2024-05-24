import {v2 as cloudinary} from 'cloudinary';

import {fs} from "fs" ;  //fs is file system

 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY , 
    api_secret: process.env.CLOUDINARY_API_SECRT // Click 'View Credentials' below to copy your API secret
});

const uploadoncloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload file on cloudinary
    const reponse = await  cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
        })
        //file has been uploaded seccessfull
        console.log("file is upload on cloudinary",reponse.url);
        return reponse;

    } catch (error) {
        fs.unlinkSync(localFilePath)// remove the locally saved temporary file as the upload opration got failed.
        return null;
    }
}

export {uploadoncloudinary}
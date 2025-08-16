import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET// Click 'View API Keys' above to copy your API secret
});
 
const uploadOnCloudinary= async (localFilePath)=>{
    try{
        if(!localFilePath) return null;
        
        console.log('reached lv1')
        const response = await cloudinary.uploader.upload(
            localFilePath, {
                resource_type: "auto"
        })
        console.log("File uploaded on cloudinary. File src: ", response.url);
        // once the file is uploaded we would like it to delete it from our server
        fs.unlinkSync(localFilePath);
        return response;
    }catch(err){
        console.log(err)
        fs.unlinkSync(localFilePath)
        return null
    }
}


const uploadVideoCloudinary = async function (filePath) {
    console.log(filePath);
  const uploadResult = await cloudinary.uploader.upload(filePath, {
    resource_type: "video" // Important for videos
  });
  if(!uploadResult || !uploadResult.secure_url) {
    throw new ApiError(500, "Cannot upload video to Cloudinary");
  }
  fs.unlinkSync(filePath);
  return uploadResult; 

};


const deleteFromCloudinary = async (publicId)=>{
    try{
        const result= await cloudinary.uploader.destroy(publicId)
        console.log("deleted from cloudinary. public Id: ",publicId);
    }catch(err){
        console.log("Error deleting from cloudinary", err);
        return null
    }
}
export {uploadOnCloudinary, deleteFromCloudinary, uploadVideoCloudinary}     
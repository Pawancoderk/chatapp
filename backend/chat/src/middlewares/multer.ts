import multer from "multer";
import {CloudinaryStorage} from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "chat-app",
        allowed_formats: ["jpg", "png", "jpeg", "gif"],
        transformation: [{width: 500, height: 500, crop: "limit"},{quality: "auto"}],
        
    } as any,
});

export const upload = multer(
    {
        storage,
        limits:{
            fileSize:5 *1024 *1024,
        },
        fileFilter:(req,file,cb)=>{
            if(file.mimetype.startsWith("image/")){
                cb(null,true);
            }else{
                cb(new Error("Please upload an image file"));
            }
        }
    }
);

 
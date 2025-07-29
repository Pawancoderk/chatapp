import TryCatch from "../config/TryCatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";

export const createNewChat = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const userId = req.user?._id;
    const {otherUserId} = req.body

    if(!otherUserId){
        res.status(400).json({
            message: "Other user ID is required to create a chat."
        })  
        return;
    }

    
})
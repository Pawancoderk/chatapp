import TryCatch from "../config/TryCatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import {Chat} from "../models/Chat.js"
import Messages from "../models/Messages.js"
import axios from "axios";



export const createNewChat = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const userId = req.user?._id;
    const {otherUserId} = req.body

    if(!otherUserId){
        res.status(400).json({
            message: "Other user ID is required to create a chat."
        })  
        return;
    }
    const existingChat = await Chat.findOne({
        users: {$all:[userId,otherUserId], $size:2},

    })

    if(existingChat){
      res.json({
        message:"Chat already exists",
        chatId:existingChat._id
      })
      return;
    }
    const newChat = await Chat.create({
        users: [userId, otherUserId]
    })

    res.status(201).json({
        message: "Chat created successfully",
        chatId: newChat._id
    })

})
 
// ! Learn this route
export const getAllChats = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const userId = req.user?._id
    if(!userId){
        res.status(400).json({
            message:"UserId missing",
            status: false
        })
        return;
    }
    const chats = await Chat.find({users:userId}).sort({updatedAt: -1})

    const chatWithUserData = await Promise.all(
        chats.map(async(chat)=>{
            const otherUserId = chat.users.find((id)=> id !== userId);

            // ! fetching useen messages count
            const unseenCount = await Messages.countDocuments({
               chatId: chat._id,
               seen: false,
                sender: {$ne: userId}
            })

            try {
                const {data} = await axios.get(
                    `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`,

                )

                return{
                    user: data,
                    chat:{
                        ...chat.toObject(),
                        latestMessage:chat.latestMessage || null,
                        unseenCount,
                    },
                };

            } catch (error) {
                console.error("Error fetching user data:", error)
                return {
                    user: {
                        _id: otherUserId,
                        name: "Unknown User",
                    },
                    chat: {
                        ...chat.toObject(),
                        latestMessage: chat.latestMessage || null,
                        unseenCount,
                    },
                };
            }
        })

        
    )

    res.status(200).json({
        message: "Chats fetched successfully",
        chats: chatWithUserData,
    })
})

export const sendMessage = TryCatch(async(req:AuthenticatedRequest,res)=>{
     const senderId = req.user?._id
     const {chatId, text} = req.body
     const image = req.file;

    if(!senderId){
        res.status(400).json({
            message: "Unauthorized",
            status: false
        })
        return;
    }

    if(!chatId){
        res.status(400).json({
            message: "Chat ID is required",
            status: false
        })
        return;
    }
    if(!text && !image){
        res.status(400).json({
            message: "Text or image is required to send a message",
            status: false
        })
        return;
    }

    const chat = await Chat.findById(chatId);
    if(!chat){
        res.status(404).json({
            message: "Chat not found",
            status: false
        })
        return;
    }

    const isUserInChat = chat.users.some(
        (userId) => userId.toString() === senderId.toString()
    );

    if(!isUserInChat){
        res.status(403).json({
            message: "User is not a participant in this chat",
            status: false
        })
        return;
    }
})
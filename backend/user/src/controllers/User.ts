import { generateToken } from "../config/GenerateToken.js";
import { publishToQueue } from "../config/Rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { UserSchema } from "../models/User.js";

export const loginUser = TryCatch(async(req,res)=>{
    const{email} = req.body;

    // Rate limiting
    const rateLimitKey = `otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    if(rateLimit){
        res.status(429).json({
            message:"Too many requests. Please try again later.",
            success:false
        })
        return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp,{
        EX: 300 
    });
    await redisClient.set(rateLimitKey,"true",{
        EX: 60
    })

    const message = {
        to: email,
        subject: "Your OTP Code",
        body: `Your OTP code is ${otp}. It is valid for 5 minutes.`
    }

    await publishToQueue("send-otp",message)
    res.status(200).json({
        message: "OTP sent successfully",
        success: true
    });
})


export const verifyUser = TryCatch(async(req,res)=>{
    const {email,otp:enteredOtp} = req.body;

    if(!email || !enteredOtp){
          res.status(400).json({
            message:"Email and Otp are required",
            status: false
          })
         return;
    }
    const otpkey = `otp:${email}`; 
    const storedOtp = await redisClient.get(otpkey)

    if(!storedOtp || storedOtp !== enteredOtp){
        res.status(400).json({
            message: "Invalid OTP",
            success: false
        });
        return;
    }
    await redisClient.del(otpkey);

    let user = await UserSchema.findOne({email})
    if(!user){
        const name = email.slice(0,14);
        user = await UserSchema.create({name,email});
    }

    const token = generateToken(user)

    res.json({
        message:"User verified successfully",
        success: true,
        token,
    })
    
})

export const myProfile = TryCatch(async(req:AuthenticatedRequest,res)=>{
     const user = req.user;
     res.json(user);
}) 

export const updateName = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = await UserSchema.findById(req.user?._id);

    if(!user){
        res.status(404).json({
            message: "Please login ",
            success: false
        });
        return;
    }

    user.name = req.body.name;
    await user.save();

    const token = generateToken(user)
    res.json({
        message:"User updated",
        user,
        token
    })
})

export const getAllUsers = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const users = await UserSchema.find();
    res.json(users)
})

export const getAUser = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = await UserSchema.findById(req.params.id);
    res.json(user);
})
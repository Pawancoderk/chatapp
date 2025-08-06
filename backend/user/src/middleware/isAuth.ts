import { NextFunction,Request,Response } from "express";
import { IUser } from "../models/User.js";
import jwt, { JwtPayload } from "jsonwebtoken"

export interface AuthenticatedRequest extends Request {
    user?:IUser | null;
}

export const isAuth = async(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>=>{
  try {
    const authHeaders = req.headers.authorization;
    if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
      res.status(401).json({
       message: "Please login - No auth header" });
      return;
    }

    const token = authHeaders.split(" ")[1];
    
    const decodedValue = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload

    if(!decodedValue || !decodedValue.user) {
      res.status(401).json({
        message: "Invalid token - No user data"
      });
      return;
    }

    req.user = decodedValue.user
    next();


  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      message: "Please Login -JWT error"
    });
    
  }
}


// import { NextFunction, Request, Response } from "express";
// import { IUser } from "../models/User.js";
// import jwt, { JwtPayload } from "jsonwebtoken";

// export interface AuthenticatedRequest extends Request {
//   user?: IUser | null;
// }

// export const isAuth = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     // ✅ Get token from cookies instead of Authorization header
//     const token = req.cookies?.token;

//     if (!token) {
//       res.status(401).json({
//         message: "Please login - No token found in cookies",
//       });
//       return;
//     }

//     // ✅ Verify token
//     const decodedValue = jwt.verify(
//       token,
//       process.env.JWT_SECRET as string
//     ) as JwtPayload;

//     // ✅ Check if token has user object
//     if (!decodedValue || !decodedValue.user) {
//       res.status(401).json({
//         message: "Invalid token - No user data in token",
//       });
//       return;
//     }

//     req.user = decodedValue.user;
//     next();
//   } catch (error) {
//     console.error("Authentication error:", error);
//     res.status(401).json({
//       message: "Please Login - JWT error",
//     });
//   }
// };

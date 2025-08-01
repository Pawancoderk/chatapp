import mongoose, {Document,Schema} from "mongoose";

export interface IUser extends Document{
    name:string;
    email:string;
}

const userSchema = new Schema<IUser>({
    name:{
        type:String,
        required: true,
        trim: true
    },
    email:{
        type:String,
        required: true,
        unique:true
    }

},{timestamps:true});

export const UserSchema = mongoose.model<IUser>("UserSchema",userSchema)
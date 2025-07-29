import mongoose,{Document,Schema} from "mongoose";

export interface IChat extends Document{
    users: string[];
    latestMessage:{
        text:string;
        sender: string;
    };

    createdAt: Date;
    updatedAt: Date;

}

const chatSchema:Schema<IChat> = new Schema({
    users:[{
        type: String,
       
    }],
    latestMessage:{
        text: {
            type: String,
           
        },
        sender: {
            type: String,
           
        }
    },
},{timestamps:true})

export const Chat = mongoose.model<IChat>("Chat",chatSchema);



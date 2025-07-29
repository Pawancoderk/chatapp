import mongoose from "mongoose";
const connectDb = async ()=>{
    const url = process.env.MONGO_URL;

    if(!url){
        throw new Error("MongoDB connection string is not defined in environment variables.");
    }

    try {
       await mongoose.connect(url,{
            dbName:"chatapp",
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); 
    }
}

export default connectDb;
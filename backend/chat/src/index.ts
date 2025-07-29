import express, { urlencoded } from "express";
import dotenv from "dotenv"
import connectDb from "./config/db.js";
import chatRoutes from "./routes/chat.js"
dotenv.config();

connectDb()

const app =  express();

app.use(express.json())
app.use("/api/v1",chatRoutes)
app.use(urlencoded({extended:true}));

const Port = process.env.PORT;

app.listen(Port,()=>{
    console.log(`App is listening on PORT: ${Port}`)
})
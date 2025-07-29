import express, { urlencoded } from "express";
import dotenv from "dotenv"
import connectDb from "./config/db.js";
dotenv.config();

connectDb()

const app =  express();
app.use(urlencoded({extended:true}));

const Port = process.env.PORT;

app.listen(Port,()=>{
    console.log(`App is listening on PORT: ${Port}`)
})
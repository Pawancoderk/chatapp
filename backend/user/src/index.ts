import express from 'express';

import dotenv from 'dotenv';
import connectDb from './config/db.js';
import userRoutes from "./routes/User.js"
import {createClient} from "redis"
import { connectRabbitMQ } from './config/Rabbitmq.js';
import cors from "cors"
dotenv.config();

connectDb();
await connectRabbitMQ()

export const redisClient = createClient({
    url: process.env.REDIS_URL
})

redisClient
.connect()
.then(()=>console.log("Connected to Redis"))
.catch(console.error)

const app = express();
app.use(express.json());

app.use(cors());

app.get("/",(req,res)=>{
    res.json({ message: "Server is working!" });
})
app.use("/api/v1",userRoutes)
const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})


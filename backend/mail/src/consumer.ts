import amqp from 'amqplib';
import nodemailer  from "nodemailer"
import dotenv from "dotenv"
dotenv.config();

export const  startSendOtpConsumer  = async ()=>{
  try {
    const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD,
    })

    const channel =  await connection.createChannel();

    const queueName = "send-otp";
    await channel.assertQueue(queueName, { durable: true });
    console.log("✅ Mail service consumer started, listening for otp emails");

   channel.consume(queueName, async(msg)=>{
    if(msg){
      try {
        const {to,subject, body} = JSON.parse(msg.content.toString());
        
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });
        await transporter.sendMail({
          from: "chatapp",
          to, 
          subject, 
          text: body, 
        });
        console.log(`✅ OTP email sent to ${to}`);
        channel.ack(msg);
      } catch (error) {
        console.error("❌ Failed to send OTP email: ", error);
      }
    }
   })
   
  } catch (error) {
    console.error("Failed to start Rabbitmq consumer: ", error);
  }
} 
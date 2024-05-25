// require ('dotenv').config({});
import dotenv from "dotenv";
import { app } from "./app.js";
import connnectDB from "./db/index.js";

dotenv.config({
  path:'./.env'
})

connnectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000,()=>{
    console.log(`Server is runing at port :${process.env.PORT}`);
})
})
.catch((error)=>{
  console.log("MongoDB connection failed !!!  " , error);
})






/*
import express from 'express'

const app = express()

( async()=>{})()
try{
  await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
  app.on("error",(error)=>{
    console.log("Error:",error);
    throw error
  })

  app.listen(process.env.PORT,()=>{
    console.log(`app is listening http:localhost${process.env.PORT}`);
  })

}catch(error){
   console.log(error);
   throw err
}
*/
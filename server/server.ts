import {app} from './app';
import connectDB from './utils/db';
require("dotenv").config();
import {v2 as cloudinary} from "cloudinary";
import * as http from 'http'; 
// cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
   });
//Creating server
app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
    connectDB();
})

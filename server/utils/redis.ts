import {Redis} from 'ioredis';
require('dotenv').config();

const redisClient=()=>{
    if(process.env.REDIS_URL){
        console.log(`Redis URL is ${process.env.REDIS_URL}`)
        return process.env.REDIS_URL;
    }
    throw new Error('Redis URL is not provided in .env file');
}

export const redis=new Redis(redisClient());
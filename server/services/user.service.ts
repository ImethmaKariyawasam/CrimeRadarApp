import { Response } from "express";
import UserModel from "../models/user.model"

export const getUserById=async(id:string,res:Response)=>{
    const user =await UserModel.findById(id);
    res.status(200).json({
        success:true,
        user
    }) 
}
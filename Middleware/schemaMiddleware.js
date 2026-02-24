// import { userRegisterSchema, userLoginSchema } from "../Schema/schema";
import jwt from "jsonwebtoken";
import "dotenv/config";
import db from "../models/index.js";
const { User } = db;

const jwtSecret = process.env.jwtSecret;

export function  schemaMiddleware(schema){
    return (req,res,next)=>{
        const {error} = schema.validate(req.body);
        if(error){
            return res.status(400).json({message:"not validated", details:error.details[0]});
        }
        next();
    }
}
export const authMiddleware = async (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if (!authHeader) { 
        return res.status(401).json({ message: "Token missing" });
    }
    try{
        const token = authHeader.split(' ')[1];
        const decode = jwt.verify(token,jwtSecret);
        req.user=decode;
        const user = await User.findOne({
            where:{email:decode.email}
        });
        if(!user) return res.status(400).json({message:"user not found"});
        if(!user.refreshToken) return res.status(400).json({message:"session logout"});
        next();
    }catch{
        res.status(400).json("invalid token");
    }
}

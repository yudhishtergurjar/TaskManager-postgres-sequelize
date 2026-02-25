// import { userRegisterSchema, userLoginSchema } from "../Schema/schema";
import jwt from "jsonwebtoken";
import "dotenv/config";
import db from "../../models/index.js";
import client from "../config/redis.js";
const { User, Session } = db;

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
        const sessionId = decode.sessionId;

        const cachedSession = await client.get(`session:${sessionId}`);
        if(!cachedSession){
            const session = await Session.findOne({
                where: { id: sessionId, isActive: true }
            });

            if(!session){
                return res.status(401).json({ message: "Invalid session" });
            }

            if(session.expiresAt < new Date()){
                return res.status(401).json({ message: "Session expired" });
            }

            await client.set(
                `session:${sessionId}`,
                JSON.stringify({ isActive:true,expiresAt:session.expiresAt }),
                {EX: 7 * 24 * 60 * 60}
            );
            cachedSession = await client.get(`session:${sessionId}`);
        }else console.log("cachedHit");
        const parsedData = JSON.parse(cachedSession);
        if(!parsedData.isActive || new Date(parsedData.expiresAt) < new Date()) return res.status(401).json({ message: "Session expired" });
        
        next();
    }catch{
        res.status(400).json("invalid token");
    }
}

import db from "../../models/index.js";
const { User, Session } = db;
import {generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken} from "../services/token.js";
import bcrypt from "bcrypt";
import client from "../config/redis.js";
import 'dotenv/config';
import { v4 as uuidv4 } from "uuid";


const registerUser = async (req,res)=>{

    try{
        const {username,email,password}= req.body;
        const existingUser = await User.findOne({
            where:{email}
        });
        if(existingUser) return res.status(400).json({message:"user already exists"});
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,  
            hashedPassword,
        });
        
        return res.status(201).json({
            message:"user created successfully",
            id:newUser.id,
            username,
            email,    
        });
    }catch(err){
        return res.status(400).json({
            message:"error occured while registering",
        })
    }    
}


const loginUser = async (req,res)=>{
    try{
        const {email,password}= req.body;
        const existingUser = await User.findOne({
            where:{email:email}
        });
        if(!existingUser) return res.status(400).json({message:"user not exists"});
        if(await bcrypt.compare(password, existingUser.hashedPassword)){

            const sessionId = uuidv4();
            const refreshToken = generateRefreshToken({sessionId, userId:existingUser.id});
            const accessToken = generateAccessToken({sessionId, userId:existingUser.id}); 

            const hashedToken = await bcrypt.hash(refreshToken,12);
            const expiresAt = new Date(Date.now()+7*24*60*60*1000);
            await Session.create({
                id:sessionId,
                userId:existingUser.id,
                refreshToken:hashedToken,
                expiresAt
            })
            await client.set(
                `session:${sessionId}`,
                JSON.stringify({ isActive:true, expiresAt }),
                {EX: 7 * 24 * 60 * 60}
            );
            return res.status(201).json({
                message:"userloggedIn",
                accessToken, 
                refreshToken
            });
        }else return res.status(400).json({message:"invalid creadientials"});  
    }catch(err){
        return res.status(400).json({
            message:"error occured while logging in",
            err
        })
    }
}

const logoutUser = async (req,res)=>{   
    try{ 
        const token = req.headers.authorization.split(' ')[1];
        const decoded = verifyAccessToken(token);   
        const userId = decoded.userId;
        const sessionId = decoded.sessionId;

        await Session.update(
            {isActive:false},
            {where:{id:sessionId}}
        )
        await client.del(`session:${sessionId}`);
        
        return res.status(200).json({message:"user logout succesffully"});
    }catch(err){
        res.status(400).json({message:"error while logging out"});
    }
}

const refreshToken = async (req,res)=>{   
    try{   
        const token = req.cookies.refreshToken;
        if(!token) return res.status(400).json({message:"token in empty"});
        const decoded = verifyRefreshToken(token);

        const sessionId = decoded.sessionId;
        const userId = decoded.userId;     
        const user = await User.findOne({
            where:{id:userId}
        })  
        if(!user) return res.status(400).json({message:"user doesnot exists"});

        const session = await Session.findOne({
            where:{id:sessionId, isActive : true}
        });
        if(!session) return res.status(400).json({message:"session not exists"});
        if(session.expiresAt<new Date()) return res.status(400).json({message:"session expires"});

        const isTokenValid = await bcrypt.compare(token, session.refreshToken);
        if(!isTokenValid) return res.status(400).json({message:"token is not valid"});     
        
        const newAccessToken = generateAccessToken({sessionId,userId});
        const newRefreshToken = generateRefreshToken({sessionId,userId});

        const newHashToken = await bcrypt.hash(newRefreshToken,12);
        await Session.update(
            {refreshToken:newHashToken},
            {where:{id:sessionId}}
        ); 
        await client.set(
            `session:${sessionId}`,
            JSON.stringify({ isActive:true,expiresAt:session.expiresAt }),
            {EX: 7 * 24 * 60 * 60}
        );
        return res.status(200).json({newAccessToken,newRefreshToken});
    }catch(err){
        console.log(err);
        return res.status(200).json({message:"error occured"});
    }
}

export {registerUser,loginUser,logoutUser,refreshToken};
import express from "express";
import bcrypt from "bcrypt";
import "dotenv/config";
import {generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken} from "../../Task-Manager/services/token.js";
import { schemaMiddleware } from "../Middleware/schemaMiddleware.js"; 
import { userRegisterSchema, userLoginSchema } from "../Schema/schema.js";
import db from "../../Task-Manager/models/index.js";
const { User, Project, Task } = db;



const router = express.Router();
router.post('/register',schemaMiddleware(userRegisterSchema),async (req,res)=>{

    try{
        const {username,email,password}= req.body;
        const existingUser = await User.findOne({
            where:{email}
        });
        if(existingUser) return res.status(400).json({message:"user already exists"});
        const hashedPassword = await bcrypt.hash(password, 12);
        const refreshToken = generateRefreshToken({username,email});
        const accessToken = generateAccessToken({username,email});
        const newUser = await User.create({
            username,
            email,
            hashedPassword,
            refreshToken
        });
        return res.status(201).json({
            message:"user created successfully",
            id:newUser.id,
            username,
            email,
            accessToken,
            refreshToken,
            
        });
    }catch(err){
        console.log("error occured while registering",err);
    }    
});

router.post('/login',schemaMiddleware(userLoginSchema),async (req,res)=>{
    try{
        const {email,password}= req.body;
        const existingUser = await User.findOne({
            where:{email:email}
        });
        if(!existingUser) return res.status(400).json({message:"user not exists"});
        if(await bcrypt.compare(password, existingUser.hashedPassword)){
            const refreshToken = generateRefreshToken({username: existingUser.username,email});
            const accessToken = generateAccessToken({username: existingUser.username,email}); 
            
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
})

router.get('/logout',async (req,res)=>{   
    try{ 
        const token = req.headers.authorization.split(' ')[1];
        const decoded = verifyAccessToken(token);   
        const email = decoded.email;
        await User.update(
            {refreshToken: null},
            {where: {email}}
        );
        return res.status(200).json({message:"user logout succesffully"});
    }catch(err){
        res.status(400).json({message:"error while logging out"});
    }
    
})

router.get('/refreshToken',async (req,res)=>{   
    try{
        const token = req.cookies.refreshToken;
        if(!token) return res.status(400).json({message:"token in empty"});
        const decoded = verifyRefreshToken(token);

        const email = decoded.email;
        const username = decoded.username;       

        const newAccessToken = generateAccessToken({username,email});
        const newRefreshToken = generateRefreshToken({username,email});

        const user = await User.update(
            {refreshToken:newRefreshToken},
            {
                where:{
                    email,
                    refreshToken:token
                }
            }
        );
        if(!user) return res.status(400).json({message:"user doesnot exists"});
        return res.status(200).json({newAccessToken,newRefreshToken});
    }catch(err){
        console.log(err);
        return res.status(200).json({message:"error occured"});
    }
});


export default router;
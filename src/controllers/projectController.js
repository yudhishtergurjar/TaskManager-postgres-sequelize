import db from "../../models/index.js";
import client from "../config/redis.js";

const { User, Project, Task } = db;
const addProj = async (req,res)=>{
    try{
        const {title,description}= req.body;
        const id = req.user.userId;
        const newProject = await Project.create({
            title,
            description,
            ownerId:id
        })
        return res.status(200).json({message:"added successfully",newProject});
    }catch(err){
        return res.status(400).json({message:"error occured",err});
    } 
}

const readProj = async (req,res)=>{
    try{
        const projectId = req.params.id;
        const userId = req.user.userId;  
        const project = await Project.findOne({
            where:{
                id:projectId, 
                ownerId:userId
            },
        });

        if(!project) return res.status(400).json({message:"invalid projectId"});
        return res.status(200).json(project);
    }catch(err){
        return res.status(400).json({message:"error occured while reading",err});
    }
}

const updateProj = async (req,res)=>{
    try{
        const {title,description} = req.body;
        const projectId = req.params.id;
        const userId = req.user.userId;  
        const project = await Project.findOne({
            where:{
                id:projectId, 
                ownerId:userId
            },
        });

        if(!project) return res.status(400).json({message:"project dont exists"});

        project.title = title || project.title;
        project.description =  description || project.description;
        const updatedProj = await project.save();
        const key1 = `user:${userId}:role:project:id:${projectId}`;
        const key2 = `user:${userId}:role:project`;
        await client.del(key1);
        await client.del(key2);

        return res.status(200).json({message:"successfully update",updatedProj}); 
    }catch(err){
        return res.status(400).json({message:"error occured while updating",err});
    }    
}

const deleteProj = async(req,res)=>{
    try{
       const projectId = req.params.id;
        const userId = req.user.userId;  
        const deletedProj = await Project.destroy({
            where:{
                id:projectId,
                ownerId:userId
            },
        })
        if(!deletedProj) return res.status(400).json({message:"project dont exists"});
        const key1 = `user:${userId}:role:project:id:${projectId}`;
        const key2 = `user:${userId}:role:project`;
        await client.del(key1);
        await client.del(key2);
        return res.status(200).json({message:"project deleted successfully"});
    }catch(err){
        return res.status(400).json({message:"error occured"});
    }
}

const listProj = async (req,res)=>{
    try{
        const {page=1, limit=10} = req.query;
        const userId = req.user.userId;

        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);

        const {rows, count} = await Project.findAndCountAll({
            where:{
                ownerId:userId
            },
            limit: pageSize,
            offset: (pageNumber-1)*pageSize
        });

        return res.status(200).json({
            total: count,
            page: pageNumber,
            data: rows
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            message:"error occured while listing"
        });
    }
}

export {addProj,readProj,updateProj,deleteProj,listProj};
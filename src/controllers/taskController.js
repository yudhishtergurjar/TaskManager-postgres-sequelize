import db from "../../models/index.js";
import client from "../config/redis.js";

const { User, Project, Task } = db;


const addTask = async (req,res)=>{
    try{
        const {title, description}=req.body;
        const userId = req.user.userId;
        const projectId = req.params.id;
        const project = await Project.findOne({
            where:{
                id:projectId,
                ownerId:userId
            }
        });
        if(!project) return res.status(400).json({message:"project dont exists"});
        const newTask = await Task.create({
            title,
            description,
            projectId,
            ownerId:userId
        })
        return res.status(200).json({message:"task added successfully",newTask});
    }
    catch(err){
        return res.status(400).json({message:"error occured while adding",err});
    }
};

const readTask = async (req,res)=>{
     try{
        const taskId = req.params.id;
        const userId = req.user.userId;  
        const task = await Task.findOne({
            where:{
                id:taskId,   
                ownerId:userId
            }
        });
        if(!task) return res.status(400).json({message:"task doesn't exists to this user"});      

        return res.status(200).json(task);
    }catch(err){
        console.log(err);
        return res.status(400).json({message:"error occured while reading",err});
    }
}

const updateTask = async (req,res)=>{
    try{
        const {title,description} = req.body;
        const taskId = req.params.id;
        const userId = req.user.userId;  
        const task = await Task.findOne({
            where:{
                id:taskId,   
                ownerId:userId
            }
        });
        
        if(!task) return res.status(400).json({message:"task dont exists"});

        task.title = title || task.title;
        task.description =  description || task.description;
        const updatedTask = await task.save();
        const key=`user:${userId}:role:task:id:${taskId}`;
        await client.del(key);       
        return res.status(200).json(updatedTask);
    }catch(err){
        console.log(err);
        return res.status(400).json({message:"error occured while updating",err});
    }    
    
}

const markCompletedTask = async (req,res)=>{
    try{    
        const taskId = req.params.id;
        const userId = req.user.userId;  
        const task = await Task.findOne({
            where:{
                id:taskId,   
                ownerId:userId
            }
        });
        
        if(!task) return res.status(400).json({message:"task dont exists"});

        const updatedTask = await task.update({
            status:"completed"
        })
        const key=`user:${userId}:role:task:id:${taskId}`;
        await client.del(key);       
        return res.status(200).json(updatedTask);

    }catch(err){
        console.log(err);
        return res.status(400).json({message:"error occured",err})
    }
}

const deleteTask = async(req,res)=>{
    try{
        const taskId = req.params.id;
        const userId = req.user.userId;  
        const task = await Task.findOne({
            where:{
                id:taskId,   
                ownerId:userId
            }
        });
        
        if(!task) return res.status(400).json({message:"task dont exists"});

        const deletedTask = task;
        await task.destroy();
        const key=`user:${userId}:role:task:id:${taskId}`;
        await client.del(key);       
        return res.status(200).json({
            message:"task deleted successfully",
            deletedTask
        });
    }catch(err){
        console.log(err);
        return res.status(400).json({message:"error occured",err})
    }
}

export {addTask,readTask,updateTask,markCompletedTask,deleteTask}
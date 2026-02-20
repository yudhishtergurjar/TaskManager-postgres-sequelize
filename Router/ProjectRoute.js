import express from "express";
import "dotenv/config";
import { schemaMiddleware, authMiddleware } from "../Middleware/schemaMiddleware.js"; 
import { createProjectSchema, userLoginSchema } from "../Schema/schema.js";
import db from "../models/index.js";
const { User, Project, Task } = db;
const router = express.Router();

router.post('/add',authMiddleware, schemaMiddleware(createProjectSchema),async (req,res)=>{
    try{
        const {title,description}= req.body;
        const email = req.user.email;
        const user= await User.findOne({
            where:{email}
        });
        const newProject = await Project.create({
            title,
            description,
            ownerId:user.id
        })
        return res.status(200).json({message:"added successfully",newProject});
    }catch(err){
        return res.status(400).json({message:"error occured",err});
    } 
})

router.get('/read/:id',authMiddleware,async (req,res)=>{
    try{
        const id = req.params.id;
        const email = req.user.email;  
        const project = await Project.findOne({
            where : {id},
            include:{
                model:User,
                as: "owner",
                where:{email}
            } 
        });

        if(!project) return res.status(400).json({message:"invalid projectId"});
        return res.status(200).json({message:"successfully read",project});
    }catch(err){
        return res.status(400).json({message:"error occured while reading",err});
    }
})

router.patch("/update/:id",authMiddleware,async (req,res)=>{
    try{
        const {title,description} = req.body;
        const id = req.params.id;
        const email = req.user.email;  
        const project = await Project.findOne({
            where:{id},
            include:{
                model:User,
                as: "owner",
                where:{email}
            }
        })
        if(!project) return res.status(400).json({message:"project dont exists"});


        project.title = title || project.title;
        project.description =  description || project.description;
        const updatedProj = await project.save();
        return res.status(200).json({message:"successfully update",updatedProj}); 
    }catch(err){
        return res.status(400).json({message:"error occured while updating",err});
    }    
})

router.delete("/delete/:id",authMiddleware,async(req,res)=>{
    try{
        const id = req.params.id;
        const email = req.user.email;  
        const user = await User.findOne({email});
        const deletedProj = await Project.destroy({
            where:{id},
            include:{
                model:User,
                as:"owner",
                where:{email}
            }
        })
        if(!deletedProj) return res.status(400).json({message:"project dont exists"});
        return res.status(200).json({message:"project deleted successfully"});
    }catch(err){
        return res.status(400).json({message:"error occured"});
    }
})

router.get("/list",authMiddleware,async (req,res)=>{
    try{
        const {page=1, limit=10} = req.query;
        const email = req.user.email;
        const user = await User.findOne({
            where:{email},
            include:{
                model:Project,
                as:"projects"
            }
        });
        console.log("\n \n \n \n \n");
        const allProjects = user.projects;
        console.log(allProjects);
              

        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber-1)*pageSize;

        const paginatedProjects = allProjects.slice(skip, skip+pageSize);
        res.status(200).json({
            total: allProjects.length,
            page: pageNumber,
            data: paginatedProjects
        });

    }catch(err){
        console.log(err);
        return res.status(400).json({message:"error occured while listing",err});
    }
});

export default router;
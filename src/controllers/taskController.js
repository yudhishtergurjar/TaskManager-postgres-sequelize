import db from "../../models/index.js";
const { User, Project, Task } = db;


const addTask = async (req,res)=>{
    try{
        const {title, description}=req.body;
        const email = req.user.email;
        const projectId = req.params.id;
        const project = await Project.findOne({
            where:{id:projectId},
            include:{
                model:User,
                as:"owner",
                where:{email}
            }
        });
        if(!project) return res.status(400).json({message:"project dont exists"});
        const newTask = await Task.create({
            title,
            description,
            projectId
        })
        return res.status(200).json({message:"task added successfully",newTask});
    }
    catch(err){
        return res.status(400).json({message:"error occured while adding",err});
    }
};

const readTask = async (req,res)=>{
     try{
        const id = req.params.id;
        const email = req.user.email;  
        const task = await Task.findOne({
            where:{id},
            include:{
                model:Project,
                as:"project",
                include:{
                    model:User,
                    as:"owner",
                    where:{email}
                }
            }
        });

        if(!task) return res.status(400).json({message:"task dont exists"});

        return res.status(200).json({
            message:"successfully read",
            title: task.title,
            description: task.description,
            status: task.status,
            project: task.projectId
        });
    }catch(err){
        console.log(err);
        return res.status(400).json({message:"error occured while reading",err});
    }
}

const updateTask = async (req,res)=>{
    try{
        const {title,description} = req.body;
        const id = req.params.id;
        const email = req.user.email;  
        const task = await Task.findOne({
            where:{id},
            include:{
                model:Project,
                as:"project",
                include:{
                    model:User,
                    as:"owner",
                    where:{email}
                }
            }
        });
        
        if(!task) return res.status(400).json({message:"task dont exists"});

        task.title = title || task.title;
        task.description =  description || task.description;
        const updatedTask = await task.save();
        
        return res.status(200).json({
            message:"successfully updated",
            title: updatedTask.title,
            description: updatedTask.description,
            status: updatedTask.status,
            projectId: updatedTask.projectId,
            // updatedTask
        });
    }catch(err){
        console.log(err);
        return res.status(400).json({message:"error occured while updating",err});
    }    
    
}

const markCompletedTask = async (req,res)=>{
    try{    
        const id = req.params.id;
        const email = req.user.email;  
        const task = await Task.findOne({
            where:{id},
            include:{
                model:Project,
                as:"project",
                include:{
                    model:User,
                    as:"owner",
                    where:{email}
                }
            }
        });
        
        if(!task) return res.status(400).json({message:"task dont exists"});

        const updatedTask = await task.update({
            status:"completed"
        })
        return res.status(200).json({
            message:"successfully marked",
            title: updatedTask.title,
            description: updatedTask.description,
            status: updatedTask.status,
            project: updatedTask.projectId
        });
    }catch(err){
        console.log(err);
        return res.status(400).json({message:"error occured",err})
    }
}

const deleteTask = async(req,res)=>{
    try{    
        const id = req.params.id;
        const email = req.user.email;  
        const task = await Task.findOne({
            where:{id},
            include:{
                model:Project,
                as:"project",
                include:{
                    model:User,
                    as:"owner",
                    where:{email}
                }
            }
        });
        if(!task) return res.status(400).json({message:"task dont exists"});
        const deletedTask = task;
        await task.destroy();
        console.log(deletedTask);
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
import db from "../../models/index.js";
import client from "../config/redis.js";
import { getIO } from "../socketHandler/initSocket.js"; 


const { User, Project, Task, ProjectMember } = db;
const addProj = async (req,res)=>{
    const transaction = await db.sequelize.transaction();
    try{
        const {title,description}= req.body;
        const id = req.user.userId;
        const newProject = await Project.create({
            title,
            description,
            ownerId:id
        },{transaction});
        await ProjectMember.create({
            projectId: newProject.id,
            userId: id,
            role: "owner",
            status: "active"
        },{transaction});

        await transaction.commit();
        
        return res.status(200).json({message:"added successfully",newProject});
    }catch(err){
        await transaction.rollback();
        console.log(err);
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
    const transaction = await db.sequelize.transaction();
    try{
        const projectId = req.params.id;
        const userId = req.user.userId;  
        const project = await Project.findOne({
            where:{
                id:projectId,
                ownerId:userId
            },
        });
        if(!project){
            await transaction.rollback();
            return res.status(404).json({message:"project not found"});
        }
        await ProjectMember.destroy({
            where:{
                projectId,
            }
        },{transaction});

        await Project.destroy({
            where:{
                id:projectId,
                ownerId:userId
            },
        },{transaction});
        await transaction.commit();
        const key1 = `user:${userId}:role:project:id:${projectId}`;
        const key2 = `user:${userId}:role:project`;
        await client.del(key1);
        await client.del(key2);
        return res.status(200).json({message:"project deleted successfully"});
    }catch(err){
        await transaction.rollback();
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

const addMember = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    const io = getIO();

    try {
        const ownerId = req.user.userId;
        const projectId = req.params.id;
        const membersArray = req.body.members || [];
        const roomName = `project:${projectId}`;

        const project = await Project.findOne({
            where: { id: projectId, ownerId }
        });

        if (!project)
            return res.status(403).json({ message: "Only owner can add members" });

        const addedMembers = [];

        for (const memberId of membersArray) {

            const user = await User.findByPk(memberId);
            if (!user) continue;

            const existing = await ProjectMember.findOne({
                where: { userId: memberId, projectId }
            });

            if (existing) continue;

            await ProjectMember.create({ 
                projectId,
                userId: memberId,
                role: "member",
            },{transaction});

            addedMembers.push(memberId);
        }

        await transaction.commit();

        for (const memberId of addedMembers) {

            io.to(roomName).emit("member:added", {
                userId: memberId,
                projectId
            });
            io.to(roomName).emit('user:presence',{ 
                message : connections==0?"offlline":"online" 
            })

            io.to(`user:${memberId}`).emit("project:added:self", {
                projectId
            });
        }

        return res.status(200).json({
            message: "Members added successfully",
            addedMembers
        });

    } catch (err) {
        await transaction.rollback();
        return res.status(500).json({ message: "Error adding members", err });
    }
};

//testing pending
const removeMember = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    const io = getIO();

    try {
        const ownerId = req.user.userId;
        const projectId = req.params.id;
        const membersArray = req.body.members || [];
        const roomName = `project:${projectId}`;

        const project = await Project.findOne({
            where: { id: projectId, ownerId }
        });

        if (!project)
            return res.status(403).json({ message: "Only owner can remove members" });

        const removedMembers = [];
        for (const memberId of membersArray) {

            const membership = await ProjectMember.findOne({
                where: { userId: memberId, projectId }
            });

            if (!membership) continue;

            await membership.destroy({ transaction });

            removedMembers.push(memberId);
        }

        await transaction.commit();

        for (const memberId of removedMembers) {

            // Remove sockets from room (all servers via redis adapter)
            await io.in(`user:${memberId}`).socketsLeave(roomName);
            await client.del(`user:${memberId}:room:${projectId}:presence`);

            // Notify remaining room members
            io.to(roomName).emit("member:removed", {
                userId: memberId,
                projectId
            });
        }

        return res.status(200).json({
            message: "Members removed successfully",
            removedMembers
        });

    } catch (err) {
        await transaction.rollback();
        return res.status(500).json({ message: "Error removing members", err });
    }
};
export {addProj,readProj,updateProj,deleteProj,listProj, addMember, removeMember};
import { socketMiddleware } from "./socketMiddleware.js";
import db from "../../models/index.js";
const { User, Project, Task, ProjectMember, Message } = db;
import client from "../config/redis.js";

async function isMember(userId,roomId){
    const presenceKey = `user:${userId}:room:${roomId}:presence`;//also delete this when owner removes member from their project . do this in rou   te
    const redisGet = await client.get(presenceKey);
    if(!redisGet){//redis me nahi mila
        const isMember = await ProjectMember.findOne({
            where:{
                projectId:roomId,
                userId
            }
        });

        if(!isMember) return false;
        await client.set(presenceKey,"1",{EX:60});
    }
    return true;
}


async function incrConnections(userId) {
    const key = `user:${userId}:connections`;
    return await client.incr(key);
}
//redis
async function decrConnections(userId) {
    const key = `user:${userId}:connections`;
    const val = await client.decr(key);
    return val;
}

export const socketHandler = (io)=>{
    io.use(socketMiddleware);

    io.on("connection",async (socket)=>{
        console.log(socket.id);

        const userId = socket.user.userId;
        const userData = await User.findbyPk(userId);

        if(!userData) return socket.disconnect();
        socket.join(`user:${userId}`);//all sockets of user present in room(all sockets from multiple devices).

        const count = await incrConnections(userId);
        //chagne krna ha
        if(count == 1){
            const userRooms = await ProjectMember.findAll({
                where:{userId}
            })
            for(const it of userRooms){
                const roomName = `project:${it.projectId}`;
                io.to(roomName).emit('presence:online',{
                    userId
                })
            }
        }
        
        socket.on("room:join", async (payload)=>{
            try{
                const roomId=payload.roomId;
                const page = 1;
                const isPresent = await isMember(userId,roomId);
                
                if(!isPresent){    
                    console.log("not present");
                    return socket.emit("error",{message:" not allowed/not found"});
                }

                console.log("joined");

                const roomName = `project:${roomId}`;
                socket.join(roomName);

                socket.to(roomName).emit('room:joined', {
                    username: userData.username,
                    userId,
                    message: `${userData.username} joined the room`,
                });

                console.log( `${userData.username} joined the room`);

                socket.emit("room:joined:self",{
                    message:"You joined the room"
                });

                console.log("\n\n\n\n joinnnnnnnnnn");
    
                const limit = 20;
                const offset = (page - 1) * limit;

                const messages = await Message.findAll({
                    where: { projectId:roomId },
                    order: [["createdAt", "DESC"]],
                    limit,
                    offset
                });

                socket.emit('chat:send',{
                    chats:chats.reverse()
                });

            }catch(err){
                console.log(err);
            }
        });


        socket.on("room:leave",async (payload)=>{
            try{
                const roomId=payload.roomId;
                const roomName = `project:${roomId}`;
                const isPresent = await isMember(userId,roomId);

                if(!isPresent){    
                    return socket.emit("error",{message:" not allowed/not found"});
                }

                if(!socket.rooms.has(roomName)){
                    console.log("room not present");
                    return socket.emit("error",{message:" socket not present in room"});
                }

                socket.leave(roomName);
                socket.to(roomName).emit("member:left", { userId });
                
            }catch(err){
                console.log("err occured",err);
            }
        });


        socket.on("message:send",async (payload)=>{
            try{
                const roomId = payload.roomId;
                const message = payload.message;
                const roomName = `project:${roomId}`;
                const isPresent = await  isMember(userId,roomId);

                if(!isPresent){    
                    return socket.emit("error",{message:" not allowed/not found"});
                }

                if(!socket.rooms.has(roomName)){
                    console.log("socket not present");
                    return socket.emit("error",{message:" socket not present in room"});
                }

                const newMessage = await Message.create({
                    projectId:roomId,
                    senderId:userId,
                    message,
                });

                io.to(roomName).emit("message:received",{
                    newMessage
                });
            }catch(err){
                console.log("err occured",err.message);
                return socket.emit("error",{message:err.message});
            }

        });


        socket.on("typing:start",async(payload)=>{
            try{
                const roomId = payload.roomId;
                const isPresent = await isMember(userId,roomId);
                const roomName = `project:${roomId}`;

                if(!isPresent){        
                    return socket.emit("error",{message:" not allowed/not found"});
                }

                if(!socket.rooms.has(roomName)){
                    console.log("socket not present");
                    return socket.emit("error",{message:" socket not present in room"});
                }

                console.log("hi");
                
                socket.to(roomName).emit('typing:started',{
                    userId,
                    username:userData.username
                });
            }catch(err){
                console.log("err occured",err.message);
                return socket.emit("error",{message:err.message});
            }
        });

        socket.on("typing:stop",async(payload)=>{
            try{
                const roomId = payload.roomId;
                const roomName = `project:${roomId}`;
                const isPresent = await isMember(userId,roomId);
                if(!isPresent){    
                    return socket.emit("error",{message:" not allowed/not found"});
                }

                if(!socket.rooms.has(roomName)){
                    console.log("socket not present");
                    return socket.emit("error",{message:" socket not present in room"});
                }

                socket.to(roomName).emit('typing:stopped',{
                    userId
                });
            }catch(err){
                console.log("err occured",err.message);
                return socket.emit("error",{message:err.message});
            }
        });
        //  only for multiserver. only if disconnect never runs..
        // socket.on("heartbeat",async ()=>{
        //     const onlineKey = `user:${userId}:online`;
        //     await client.set(onlineKey, "1", { EX: 60 });
        // });

//remaing for testing
        socket.on("disconnect",async ()=>{

            const connections = await decrConnections(userId);

            if(connections<=0){
                io.emit('offline',{
                    message:"user goes offline"
                })
            }
        });

    });
};


//how session is managed in sockets...
// ??dont know 



// Short answer:
// 👉 Anyone who can establish a WebSocket connection can send events to backend
// 👉 Backend MUST validate every event (never trust client)
// There is NO concept of "only frontend can send events".
// 🧠 Reality of WebSockets
// Backend does NOT know:

// Whether request came from React frontend

// Whether request came from mobile app

// Whether request came from Postman

// Whether request came from malicious script

// Because WebSocket is just:

// TCP Persistent Connection + Message Protocol

// Not browser-specific.

// 🚀 Example

// Anyone can do this:

// const socket = io("http://your-server");

// socket.emit("message:send", {
//    roomId: 1,
//    message: "Hello"
// });

// From:

// ✅ Browser console
// ✅ Node script
// ✅ Postman WebSocket client
// ✅ Attack scripts





// // 🧠 PART 1 — Why Do We Need Redis Pub/Sub?
// 🚨 Problem: Multi-Server Architecture

// In development, you usually have:

// 1 server

// All sockets are inside one process → life is easy.

// But in production, you have:

// Load Balancer
//       ↓
// Server A
// Server B
// Server C

// Now users connect randomly:

// User1 → Server A

// User2 → Server B

// User3 → Server C

// ❌ What Breaks Without Redis

// Let’s say:

// io.to("project:1").emit("message", data);

// If that code runs on Server A:

// Only sockets on Server A get the message

// Users on Server B & C don’t receive anything

// Your “room” is now split across machines.

// That’s a disaster for:

// Chat

// Presence

// Live collaboration

// Notifications

// 🔥 So We Need a Communication Layer Between Servers

// Servers must talk to each other.

// That’s where Redis Pub/Sub comes in.

// It acts as a middleman:

// Server A → Redis → Server B
//                     Server C

// Now all servers stay in sync.

// When you use the Redis adapter and you run:

// io.to("project:1").emit("message", data);

// on any one server, here’s what really happens:

// 🔥 What Actually Happens Internally

// Let’s say it runs on Server A.

// Step 1 — Local emit

// Server A immediately sends the message to:

// All sockets in project:1 that are connected to Server A

// Step 2 — Publish to Redis

// Server A publishes a broadcast event to Redis.

// Step 3 — Other servers receive it

// Server B and Server C (which are subscribed) receive that broadcast.

// Step 4 — They emit locally

// Each server emits the message to:

// All sockets in project:1 that are connected to them
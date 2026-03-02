// socket.js
import { Server } from "socket.io";
import { socketHandler } from "./socketHandler.js";
let io;
export const initIO = (server) => {
    io = new Server(server, {
        cors: { origin: "*" }
    });
    socketHandler(io);

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};











// socket/initSocket.js

// import { Server } from "socket.io";
// import { createClient } from "redis";
// import { createAdapter } from "@socket.io/redis-adapter";

// let io;

// export const initSocket = async (server) => {
//     io = new Server(server, {
//         cors: { origin: "*" }
//     });

//     const pubClient = createClient({ url: process.env.REDIS_URL });
//     const subClient = pubClient.duplicate();

//     await pubClient.connect();
//     await subClient.connect();

//     io.adapter(createAdapter(pubClient, subClient));
    

//     return io;
// };

// export const getIO = () => io;
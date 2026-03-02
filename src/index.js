import express from "express";
import userRoute from "./Router/userRoute.js";
import projectRoute from "./Router/ProjectRoute.js";
import taskRoute from "./Router/taskRoute.js";
import cookieParser from "cookie-parser";
import connectPostgres from "./config/postgres.js";
import 'dotenv/config';
import { connectRedis } from "./config/redis.js";
import http from "http";
import { initIO } from "./socketHandler/initSocket.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);

// initialize socket
initIO(server);

await connectPostgres();
await connectRedis();

app.use('/auth', userRoute);
app.use('/projects', projectRoute);
app.use('/tasks', taskRoute);

const PORT = process.env.PORT;

server.listen(PORT, () => {
   console.log("server is listening on port", PORT);
});
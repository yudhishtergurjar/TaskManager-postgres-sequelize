// Build Task Management API: Users, Projects, Tasks CRUD endpoints.
// Implement Joi validation for all inputs. Add pagination, sorting, filtering, error handling
// REST API with Validation
import express from "express";
import userRoute from "./Router/userRoute.js";
import projectRoute from "./Router/ProjectRoute.js";
import taskRoute from "./Router/taskRoute.js";
import cookieParser from "cookie-parser";
import connectPostgres from "./connections/postgres.js";
import 'dotenv/config';
import { connectRedis } from "./connections/redis.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

await connectPostgres();
await connectRedis();

app.use('/auth',userRoute);
app.use('/projects',projectRoute);
app.use('/tasks',taskRoute);



const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log("server is listening on port",PORT);
})
import express from "express";
import "dotenv/config";
import { schemaMiddleware } from "../Middleware/schemaMiddleware.js"; 
import { authMiddleware } from "../Middleware/authMiddleware.js"; 
import { createTaskSchema, updateTaskSchema, updateStatusSchema } from "../Schema/schema.js";
import { addTask,readTask,updateTask,markCompletedTask,deleteTask } from "../controllers/taskController.js";
import { cacheMiddleware } from "../Middleware/cacheMiddleware.js";



const router = express.Router();

router.post('/add/:id',authMiddleware, schemaMiddleware(createTaskSchema),addTask);

router.get('/read/:id',authMiddleware,cacheMiddleware("task"),readTask);

router.patch("/update/:id",authMiddleware,schemaMiddleware(updateTaskSchema),updateTask);

router.get("/markCompleted/:id",authMiddleware,markCompletedTask)

router.delete("/delete/:id",authMiddleware,deleteTask);

export default router;
import express from "express";
import "dotenv/config";
import { schemaMiddleware, authMiddleware } from "../Middleware/schemaMiddleware.js"; 
import { createTaskSchema, updateTaskSchema, updateStatusSchema } from "../Schema/schema.js";
import { addTask,readTask,updateTask,markCompletedTask,deleteTask } from "../controllers/taskController.js";


const router = express.Router();

router.post('/add/:id',authMiddleware, schemaMiddleware(createTaskSchema),addTask);

router.get('/read/:id',authMiddleware,readTask);

router.patch("/update/:id",authMiddleware,schemaMiddleware(updateTaskSchema),updateTask);

router.get("/markCompleted/:id",authMiddleware,markCompletedTask)

router.delete("/delete/:id",authMiddleware,deleteTask);

export default router;
import express from "express";
import "dotenv/config";
import { schemaMiddleware, authMiddleware } from "../Middleware/schemaMiddleware.js"; 
import { createProjectSchema, userLoginSchema } from "../Schema/schema.js";
import {addProj, readProj, updateProj,deleteProj,listProj} from "../controllers/projectController.js";
const router = express.Router();

router.post('/add',authMiddleware, schemaMiddleware(createProjectSchema),addProj);

router.get('/read/:id',authMiddleware,readProj);

router.patch("/update/:id",authMiddleware,updateProj);

router.delete("/delete/:id",authMiddleware,deleteProj)

router.get("/list",authMiddleware,listProj);

export default router;
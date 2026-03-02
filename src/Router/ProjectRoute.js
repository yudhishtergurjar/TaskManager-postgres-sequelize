import express from "express";
import "dotenv/config";
import { schemaMiddleware } from "../Middleware/schemaMiddleware.js"; 
import { authMiddleware } from "../Middleware/authMiddleware.js"; 

import { createProjectSchema, userLoginSchema } from "../Schema/schema.js";
import {addProj, readProj, updateProj,deleteProj,listProj, addMember} from "../controllers/projectController.js";
import { cacheMiddleware } from "../Middleware/cacheMiddleware.js";
const router = express.Router();

router.post('/add',authMiddleware, schemaMiddleware(createProjectSchema),addProj);

router.get('/read/:id',authMiddleware,cacheMiddleware("project"),readProj);

router.patch("/update/:id",authMiddleware,updateProj);

router.delete("/delete/:id",authMiddleware,deleteProj)

router.get("/list",authMiddleware,cacheMiddleware("project"),listProj);
router.post("/addMember/:id",authMiddleware,addMember);

export default router;
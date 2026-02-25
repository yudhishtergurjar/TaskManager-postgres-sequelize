import express from "express";
import "dotenv/config";
import { schemaMiddleware } from "../Middleware/schemaMiddleware.js"; 
import { userRegisterSchema, userLoginSchema } from "../Schema/schema.js";

import { registerUser,loginUser,logoutUser,refreshToken } from "../controllers/userController.js";

const router = express.Router();
router.post('/register',schemaMiddleware(userRegisterSchema),registerUser);

router.post('/login',schemaMiddleware(userLoginSchema),loginUser)

router.get('/logout',logoutUser);

router.get('/refreshToken',refreshToken);


export default router;
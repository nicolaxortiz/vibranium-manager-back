import express from "express";
import { signup, signin } from "../controllers/UserController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", verifyToken, signup);
router.post("/signin", signin);

export default router;

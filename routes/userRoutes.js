import express from "express";
import {
  signup,
  signin,
  validateLogin,
} from "../controllers/UserController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", verifyToken, signup);
router.post("/signin", signin);
router.get("/", verifyToken, validateLogin);

export default router;

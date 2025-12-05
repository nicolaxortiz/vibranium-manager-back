import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  downloadOrder,
  searchOrders,
} from "../controllers/orderController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

router.post("/", verifyToken, createOrder);
router.get("/", verifyToken, getOrders);
router.get("/download/:id", verifyToken, downloadOrder);
router.get("/search", verifyToken, searchOrders);
router.get("/:id", verifyToken, getOrderById);
router.put("/:id", verifyToken, updateOrder);
router.delete("/:id", verifyToken, deleteOrder);

export default router;

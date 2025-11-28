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

const router = Router();

router.post("/", createOrder); // Crear orden
router.get("/", getOrders); // Listar órdenes
router.get("/download/:id", downloadOrder);
router.get("/search", searchOrders);
router.get("/:id", getOrderById); // Obtener una orden
router.put("/:id", updateOrder); // Actualizar
router.delete("/:id", deleteOrder); // Eliminar

export default router;

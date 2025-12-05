import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  saveManyProducts,
} from "../controllers/productController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

router.get("/search", verifyToken, searchProducts);
router.get("/", verifyToken, getProducts);
router.get("/:id", verifyToken, getProductById);
router.post("/", verifyToken, createProduct);
router.post("/bulk", verifyToken, saveManyProducts);
router.put("/:id", verifyToken, updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;

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

const router = Router();

router.get("/search", searchProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.post("/bulk", saveManyProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;

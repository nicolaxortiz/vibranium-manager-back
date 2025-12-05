import express from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
} from "../controllers/costumerController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verifyToken, createCustomer);
router.get("/", verifyToken, getCustomers);
router.get("/search", verifyToken, searchCustomers);
router.get("/:id", verifyToken, getCustomerById);
router.put("/:id", verifyToken, updateCustomer);
router.delete("/:id", verifyToken, deleteCustomer);

export default router;

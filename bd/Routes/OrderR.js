import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  getOrdersByStatus,
  updateOrderStatus,
  deleteOrder,
} from "../Controller/OrderC.js";

const router = express.Router();

// Create a new order
router.post("/", createOrder);

// Get all orders (admin only)
router.get("/", getAllOrders);

// Get order by ID
router.get("/:id", getOrderById);

// Get orders by user ID
router.get("/user/:userId", getOrdersByUserId);

// Get orders by status
router.get("/status/:status", getOrdersByStatus);

// Update order status
router.put("/:id/status", updateOrderStatus);

// Delete order
router.delete("/:id", deleteOrder);

export default router;

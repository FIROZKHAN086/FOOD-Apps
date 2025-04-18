import { Router } from "express";
import { body, validationResult } from "express-validator";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderPaymentHistory,
  deleteOrder,
  getOrdersByUserId,
  getOrdersByStatus,
  createOrder
} from "../Controller/OrderC.js";

const OrderRouter = Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }
  next();
};

// Create a new order
OrderRouter.post("/", createOrder);

// Get all orders with filters
OrderRouter.get("/", getAllOrders);

// Get orders by user ID (Firebase ID) - This must come before /:id
OrderRouter.get("/user/:firebaseId", getOrdersByUserId);

// Get orders by status
OrderRouter.get("/status/:status", getOrdersByStatus);

// Get order by ID
OrderRouter.get("/:id", getOrderById);

// Update order status
OrderRouter.put("/:orderId/status", [
  body("status")
    .isIn(["pending", "processing", "delivered", "cancelled"])
    .withMessage("Invalid order status")
], validateRequest, updateOrderStatus);

// Update payment status
OrderRouter.put("/:orderId/payment-status", [
  body("status")
    .notEmpty()
    .withMessage("Payment status is required")
    .isIn(["pending", "completed", "failed"])
    .withMessage("Invalid payment status")
], validateRequest, updatePaymentStatus);

// Get payment history for an order
OrderRouter.get("/:orderId/payment-history", getOrderPaymentHistory);

// Delete order
OrderRouter.delete("/:id", deleteOrder);

// Handle 404 for order routes
OrderRouter.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

export default OrderRouter;

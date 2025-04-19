import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  getOrdersByStatus,
  updateOrderStatus,
  updatePaymentStatus,
    getOrderPaymentHistory,
    deleteOrder
} from "../Controller/OrderC.js";
import { body, check } from "express-validator";

const OrderRouter = Router();

// Validation middleware
const orderValidation = [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('products').isArray().withMessage('Products must be an array'),
    body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
    body('paymentMethod').isIn(['cash', 'card', 'upi']).withMessage('Invalid payment method'),
    body('deliveryAddress').isObject().withMessage('Delivery address is required')
];

const cardPaymentValidation = [
    body('paymentDetails.card.cardHolderName').notEmpty().withMessage('Card holder name is required'),
    body('paymentDetails.card.cardNumber').isLength({ min: 16, max: 16 }).withMessage('Invalid card number'),
    body('paymentDetails.card.expiryDate').matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/).withMessage('Invalid expiry date'),
    body('paymentDetails.card.cvv').isLength({ min: 3, max: 4 }).withMessage('Invalid CVV')
];

const upiPaymentValidation = [
    body('paymentDetails.upi.upiId').notEmpty().withMessage('UPI ID is required'),
    body('paymentDetails.upi.transactionId').notEmpty().withMessage('Transaction ID is required')
];

// Create new order with dynamic validation based on payment method
OrderRouter.post("/", 
    orderValidation,
    (req, res, next) => {
        if (req.body.paymentMethod === 'card') {
            return check('paymentDetails.card').exists().withMessage('Card payment details are required')(req, res, next);
        } else if (req.body.paymentMethod === 'upi') {
            return check('paymentDetails.upi').exists().withMessage('UPI payment details are required')(req, res, next);
        }
        next();
    },
    (req, res, next) => {
        if (req.body.paymentMethod === 'card') {
            return cardPaymentValidation[0](req, res, next);
        } else if (req.body.paymentMethod === 'upi') {
            return upiPaymentValidation[0](req, res, next);
        }
        next();
    },
    createOrder
);

// Get all orders
OrderRouter.get("/", getAllOrders);

// Get order by ID
OrderRouter.get("/:id", getOrderById);

// Get orders by user ID
OrderRouter.get("/user/:userId", getOrdersByUserId);

// Get orders by status
OrderRouter.get("/status/:status", getOrdersByStatus);

// Get payment history for an order
OrderRouter.get("/:orderId/payment-history", getOrderPaymentHistory);

// Update order status
// Update order status
OrderRouter.put("/:orderId/status", 
    body('status').isIn(['pending', 'processing', 'delivered', 'cancelled'])
        .withMessage('Invalid order status'),
    updateOrderStatus
  );
  
  // Update payment status
  OrderRouter.put("/:orderId/payment-status", updatePaymentStatus);
  


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

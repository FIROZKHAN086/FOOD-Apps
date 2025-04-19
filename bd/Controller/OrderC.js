import Order from "../Model/OderM.js";

export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      products,
      totalAmount,
      paymentMethod,
      paymentDetails,
      deliveryAddress
    } = req.body;

    // Validate payment details based on payment method
    if (paymentMethod === "card") {
      if (!paymentDetails.card || 
        !paymentDetails.card.cardHolderName ||
        !paymentDetails.card.cardNumber ||
        !paymentDetails.card.expiryDate ||
        !paymentDetails.card.cvv) {
        return res.status(400).json({
          success: false,
          message: "Invalid card payment details"
        });
      }
    } else if (paymentMethod === "upi") {
      if (!paymentDetails.upi || 
        !paymentDetails.upi.upiId ||
        !paymentDetails.upi.transactionId) {
        return res.status(400).json({
          success: false,
          message: "Invalid UPI payment details"
        });
      }
    }

    const order = await Order.create({
      userId,
      products,
      totalAmount,
      paymentMethod,
      paymentDetails,
      deliveryAddress,
      paymentStatus: "pending",
      paymentHistory: [{
        status: "pending",
        amount: totalAmount,
        timestamp: new Date()
      }]
    });

    // Process payment based on method
    if (paymentMethod === "card") {
      // Simulate card payment processing
      await processCardPayment(order);
    } else if (paymentMethod === "upi") {
      // Simulate UPI payment processing
      await processUPIPayment(order);
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message
    });
  }
};

// Simulated payment processing functions
const processCardPayment = async (order) => {
  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate successful payment
    order.paymentStatus = "completed";
    order.paymentHistory.push({
      status: "completed",
      amount: order.totalAmount,
      timestamp: new Date(),
      transactionId: `CARD_${Date.now()}`,
      notes: "Payment processed successfully"
    });

    await order.save();
  } catch (error) {
    order.paymentStatus = "failed";
    order.paymentHistory.push({
      status: "failed",
      amount: order.totalAmount,
      timestamp: new Date(),
      notes: error.message
    });
    await order.save();
    throw error;
  }
};

const processUPIPayment = async (order) => {
  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate successful payment
    order.paymentStatus = "completed";
    order.paymentHistory.push({
      status: "completed",
      amount: order.totalAmount,
      timestamp: new Date(),
      transactionId: order.paymentDetails.upi.transactionId,
      notes: "UPI payment processed successfully"
    });

    await order.save();
  } catch (error) {
    order.paymentStatus = "failed";
    order.paymentHistory.push({
      status: "failed",
      amount: order.totalAmount,
      timestamp: new Date(),
      notes: error.message
    });
    await order.save();
    throw error;
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log("Updating payment status:", { orderId, status });

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required"
      });
    }

    const validStatuses = ['pending', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    // Find and update the order in one operation
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      {
        $set: { paymentStatus: status },
        $push: {
          paymentHistory: {
            status,
            amount: 0, // This will be updated in the next step
            timestamp: new Date(),
            notes: `Payment status updated to ${status}`
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update the amount in the latest payment history entry
    const latestPaymentHistory = updatedOrder.paymentHistory[updatedOrder.paymentHistory.length - 1];
    latestPaymentHistory.amount = updatedOrder.totalAmount;
    await updatedOrder.save();

    console.log("Payment status updated successfully:", updatedOrder);

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: updatedOrder
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message
    });
  }
};

export const getOrderPaymentHistory = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      data: order.paymentHistory
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment history",
      error: error.message
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message
    });
  }
};

export const getOrdersByUserId = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user orders",
      error: error.message
    });
  }
};

export const getOrdersByStatus = async (req, res) => {
  try {
    const orders = await Order.find({ status: req.params.status });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting order",
      error: error.message
    });
  }
};

// payment status

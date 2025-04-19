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

    // Simple validation
    if (!status || !['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update payment status
    order.paymentStatus = status;
    
    // Add to payment history
    order.paymentHistory.push({
      status,
      amount: order.totalAmount,
      timestamp: new Date()
    });

    // Save the order
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: order
    });
  } catch (error) {
    console.error("Error in updatePaymentStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating payment status"
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
    const { firebaseId } = req.params;

    if (!firebaseId) {
      return res.status(400).json({
        success: false,
        message: "Firebase user ID is required"
      });
    }

    console.log('Fetching orders for user:', firebaseId); // Debug log

    const orders = await Order.find({ userId: firebaseId })
      .sort({ createdAt: -1 })
      .lean(); // Using lean() for better performance

    console.log('Found orders:', orders.length); // Debug log

    // Format the response data
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      userId: order.userId,
      products: order.products.map(product => ({
        ...product,
        price: Number(product.price),
        quantity: Number(product.quantity)
      })),
      totalAmount: Number(order.totalAmount),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || 'pending',
      orderStatus: order.orderStatus || 'pending',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    return res.status(200).json({
      success: true,
      message: orders.length ? "Orders fetched successfully" : "No orders found",
      data: formattedOrders
    });

  } catch (error) {
    console.error('Error in getOrdersByUserId:', error);
    return res.status(500).json({
      success: false,
      message: "Error fetching orders",
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



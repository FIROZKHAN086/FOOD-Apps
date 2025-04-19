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
  const { orderId } = req.params;
  const { status, transactionId, notes } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: "Payment status is required" });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.paymentStatus = status;
    if (transactionId) order.transactionId = transactionId;
    if (notes) order.notes = notes;

    order.paymentHistory.push({
      status,
      amount: order.totalAmount,
      timestamp: new Date(),
      transactionId: transactionId || undefined,
      notes: notes || ''
    });

    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};






// ✅ Update payment status controller
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;  // status should come from request body

  try {
      const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
      if (!updatedOrder) {
          return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.status(200).json({ success: true, updatedOrder });
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const getOrderPaymentHistory = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

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
    const orders = await Order.find().sort({ createdAt: -1 });
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
    const order = await Order.findById(req.params.id);
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
    if (!order) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// payment status

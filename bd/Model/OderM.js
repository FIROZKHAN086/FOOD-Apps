import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "upi"],
    required: true
  },
  paymentDetails: {
    // For card payments
    card: {
      cardHolderName: {
        type: String,
        required: function() {
          return this.paymentMethod === "card";
        }
      },
      cardNumber: {
        type: String,
        required: function() {
          return this.paymentMethod === "card";
        }
      },
      expiryDate: {
        type: String,
        required: function() {
          return this.paymentMethod === "card";
        }
      },
      cvv: {
        type: String,
        required: function() {
          return this.paymentMethod === "card";
        }
      }
    },
    // For UPI payments
    upi: {
      upiId: {
        type: String,
        required: function() {
          return this.paymentMethod === "upi";
        }
      },
      transactionId: {
        type: String,
        required: function() {
          return this.paymentMethod === "upi";
        }
      }
    }
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  },
  transactionId: {
    type: String,
    default: null,
  },
  notes: {
    type: String,
    default: "",
  },
  paymentHistory: [{
    status: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  orderStatus: {
    type: String,
    enum: ["pending", "processing", "delivered", "cancelled"],
    default: "pending"
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
orderSchema.index({ userId: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;

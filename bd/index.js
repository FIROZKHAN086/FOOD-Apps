import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import OrderRouter from "./Routes/OrderR.js";
import FoodsRouter from "./Routes/FoodR.js";
import ReviewRouter from "./Routes/ReviweR.js";
import connectDB from "./Config/db.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Food Delivery API" });
});

// API Routes
app.use("/api/foods", FoodsRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/reviews", ReviewRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something broke!",
    error: err.message
  });
});

// Connect to MongoDB
connectDB();

// Start server
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default app;


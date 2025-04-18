import express from "express";
import connectDB from "./Config/db.js";
import dotenv from "dotenv";
import FoodsRouter from "./Routes/FoodR.js";
import cors from "cors";
import OrderRouter from "./Routes/OrderR.js";
import ReviewRouter from "./Routes/ReviweR.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.use(cors({
    origin:  "*",
   
    credentials: true,
}));

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

// Handle 404 for all other routes


// Error handling middleware

// Connect to Database
connectDB();

// Start server
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


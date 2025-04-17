import express from "express";
import connectDB from "./Config/db.js";
import dotenv from "dotenv";
import FoodsRouter from "./Routes/FoodR.js";
import cors from "cors";
import OrderRouter from "./Routes/OrderR.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Food Routes
app.use("/api/foods", FoodsRouter);
app.use("/api/orders", OrderRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Connect to Database
connectDB();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 

import express from "express";
import { getAllFoods, getFoodById, createFood, updateFood, deleteFood, bulkCreateFoods } from "../Controller/Foods.js";

const FoodsRouter = express.Router();

// Get all foods
FoodsRouter.get("/", getAllFoods);

// Get a single food by ID
FoodsRouter.get("/:id", getFoodById);

// Create a new food
FoodsRouter.post("/", createFood);

// Update a food
FoodsRouter.put("/:id", updateFood);

// Delete a food
FoodsRouter.delete("/:id", deleteFood);

// Bulk Create Foods
FoodsRouter.post("/bulk", bulkCreateFoods);

export default FoodsRouter;


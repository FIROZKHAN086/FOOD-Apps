import Food from "../Model/FoodModels.js";
import mongoose from "mongoose";

// Get all foods
export const getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find();
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single food by ID
export const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid food ID format" });
    }

    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    res.status(200).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new food
export const createFood = async (req, res) => {
  try {
    const { name, price, description, image, category, isAvailable } = req.body;
    
    // Validate required fields
    if (!name || !price || !description || !image || !category) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const food = await Food.create({
      name,
      price,
      description,
      image,
      category,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });
    
    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a food
export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid food ID format" });
    }

    const { name, price, description, image, category, isAvailable } = req.body;
    
    const food = await Food.findByIdAndUpdate(
      id,
      { name, price, description, image, category, isAvailable },
      { new: true, runValidators: true }
    );
    
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    
    res.status(200).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a food
export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid food ID format" });
    }

    const food = await Food.findByIdAndDelete(id);
    
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    
    res.status(200).json({ message: "Food deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk Create Foods
export const bulkCreateFoods = async (req, res) => {
  try {
    const foods = req.body;

    if (!Array.isArray(foods) || foods.length === 0) {
      return res.status(400).json({ message: "Request body must be a non-empty array" });
    }

    const insertedFoods = await Food.insertMany(foods);
    res.status(201).json(insertedFoods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





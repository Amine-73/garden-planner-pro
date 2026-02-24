import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Plant from "./Models/Plant.js";
import Garden from "./Models/Garden.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "https://garden-planner-pro-1.onrender.com",
    credentials: true,
  }),
);
app.use(express.json());

const PORT = process.env.PORT || 5000;

// --- ROUTES ---

// SAVE A NEW GARDEN
app.post("/api/gardens", async (req, res) => {
  // 1. Add userId and userEmail to the destructuring
  const { items, totalEstimatedSavings, userId, userEmail } = req.body;

  if (!items || items.length === 0) {
    return res
      .status(400)
      .json({ message: "Cannot save an empty garden plan." });
  }

  try {
    // 2. Include the user info in the new Garden object
    let newGarden = new Garden({
      items,
      totalEstimatedSavings,
      userId,
      userEmail,
    });

    await newGarden.save();

    newGarden = await Garden.findById(newGarden._id).populate("items.plantId");
    res.status(201).json(newGarden);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL PLANTS
app.get("/api/plants", async (req, res) => {
  try {
    const plants = await Plant.find();
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET GARDEN HISTORY
app.get("/api/gardens", async (req, res) => {
  try {
    const gardens = await Garden.find({ userId: req.query.userId })
      .populate("items.plantId")
      .sort({ createdAt: -1 });
    res.json(gardens);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching history", error: err.message });
  }
});

// --------------------------------
app.get("/", async (req, res) => {
  const { userId } = req.query; // Catch the ID from the frontend request

  try {
    // Find only gardens that match this specific User ID
    const gardens = await Garden.find({ userId }).sort({ date: -1 });
    res.json(gardens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE ALL GARDENS

app.delete("/api/gardens", async (req, res) => {
  try {
    const result = await Garden.deleteMany({});
    res.json({ message: "All plans cleared", count: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE A SPECIFIC GARDEN
app.delete("/api/gardens/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGarden = await Garden.findByIdAndDelete(id);

    if (!deletedGarden) {
      return res.status(404).json({ message: "Garden plan not found" });
    }

    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting plan", error: error.message });
  }
});

// --- DATABASE & SERVER START ---

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("Database connected");
  })
  .catch((err) => console.log("Connection error"));

app.listen(PORT, () => {
  console.log(`Your server is running on port ${PORT}`);
});

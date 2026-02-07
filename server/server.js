import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Plant from "./Models/Plant.js";
import Garden from "./Models/Garden.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// 2. SAVE A NEW GARDEN (The POST route your button needs)
app.post("/api/gardens", async (req, res) => {
  try {
    const { items, totalEstimatedSavings } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Garden is empty" });
    }
    const newGarden = new Garden({
      items,
      totalEstimatedSavings,
    });

    const savedGarden = await newGarden.save();
    res.status(201).json(savedGarden);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error saving garden", error: err.message });
  }
});

app.get("/api/plants", async (req, res) => {
  try {
    const plants = await Plant.find();
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. GET GARDEN HISTORY (The GET route your table needs)
app.get("/api/gardens", async (req, res) => {
  try {
    const gardens = await Garden.find()
      .populate("items.plantId")
      .sort({ createdAt: -1 });
    res.json(gardens);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching history", error: err.message });
  }
});

// DELETE a specific garden plan
app.get("/api/gardens/test", (req, res) =>
  res.send("Delete route is reachable"),
); // Optional test

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

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Connection error:", err));

app.listen(PORT, () => {
  console.log("Your server is running");
});

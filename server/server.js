import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {
  saveGarden,
  deleteGarden,
  deleteGardens,
  getGarden,
  getAllPlants,
} from "./controllers/controllers.js";


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
app.post("/api/gardens", saveGarden);

// GET ALL PLANTS
app.get("/api/plants", getAllPlants);

// GET GARDEN HISTORY
app.get("/api/gardens", getGarden);

// --------------------------------
app.get("/", getGarden);

// DELETE ALL GARDENS

app.delete("/api/gardens", deleteGardens);

// DELETE A SPECIFIC GARDEN
app.delete("/api/gardens/:id", deleteGarden);

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

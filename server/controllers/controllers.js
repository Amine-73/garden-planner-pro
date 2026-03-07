import Garden from "../Models/Garden.js";
import Plant from "../Models/Plant.js";


// GET GARDEN HISTORY
const getGarden = async (req, res) => {
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
};

// DELETE ALL GARDENS
const deleteGardens = async (req, res) => {
  try {
    const result = await Garden.deleteMany({});
    res.json({ message: "All plans cleared", count: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE A SPECIFIC GARDEN
const deleteGarden = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGarden = await Garden.findByIdAndDelete(id);
    console.log("Backend received ID:", req.params.id);
    if (!deletedGarden) {
      return res.status(404).json({ message: "Garden plan not found" });
    }

    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting plan", error: error.message });
  }
};

// SAVE A NEW GARDEN
const saveGarden = async (req, res) => {
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
};

const getAllPlants = async (req, res) => {
  try {
    const plants = await Plant.find();
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { saveGarden, deleteGarden, deleteGardens, getGarden, getAllPlants };

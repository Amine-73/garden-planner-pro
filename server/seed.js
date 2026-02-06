import 'dotenv/config';
import mongoose from 'mongoose';
import Plant from './Models/Plant.js';

const plants = [
    { name: "Tomato", spacingInches: 18, yieldPerPlantLbs: 15, daysToHarvest: 80 },
    { name: "Carrot", spacingInches: 3, yieldPerPlantLbs: 0.2, daysToHarvest: 70 },
    { name: "Cucumber", spacingInches: 12, yieldPerPlantLbs: 10, daysToHarvest: 60 }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        await Plant.deleteMany({}); // Clears existing data so you don't double up
        await Plant.insertMany(plants);
        console.log("🌱 Database seeded successfully!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
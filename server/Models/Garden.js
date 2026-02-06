import mongoose from 'mongoose';

const gardenSchema = new mongoose.Schema({
    userId: { type: String, default: "guest_user" }, // We'll add real auth later
    name: { type: String, default: "My Dream Garden" },
    items: [
        {
            plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
            quantity: { type: Number, required: true }
        }
    ],
    totalEstimatedSavings: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Garden = mongoose.model('Garden', gardenSchema);
export default Garden;
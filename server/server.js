import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import Plant from './Models/Plant.js'
import Garden from './Models/Garden.js';

dotenv.config();


const app=express();


app.use(cors());
app.use(express.json());

const PORT=process.env.PORT  || 5000

app.get('/api/plants',async (req,res)=>{
    try {
        const plants =await Plant.find();
        res.json(plants)
    } catch (error) {
        res.status(500).json({message:error.message})
    }
})

app.get('/api/garden',async(req,res)=>{
    try {
        const {items,totalEstimatedSavings}=req.body;

        const newGarden=new Garden({
            items,totalEstimatedSavings
        });
        const savedGarden=await newGarden.save();
        res.status(201).json(savedGarden);
    } catch (error) {
        res.status(500).json({message:"Error saving garden",error:error.message})
    }
})

// Route to get all saved gardens
app.get('/api/gardens', async (req, res) => {
    try {
        // .populate('items.plantId') is the modern way to join the plant details
        const gardens = await Garden.find().populate('items.plantId').sort({ createdAt: -1 });
        res.json(gardens);
    } catch (err) {
        res.status(500).json({ message: "Error fetching gardens", error: err.message });
    }
});


mongoose.connect(process.env.MONGO_URL)
    .then(()=>console.log('Database connected'))
    .catch(err=>console.log('Connection error:',err))


app.listen(PORT,()=>{
    console.log('Your server is running');
})


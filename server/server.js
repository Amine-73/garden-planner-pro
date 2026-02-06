import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import mongoose from 'mongoose';

dotenv.config();


const app=express();


app.use(cors());
app.use(express.json());

const PORT=process.env.PORT  || 5000

app.get('/',(req,res)=>{
    res.json({message:'server is gardening'})
})


mongoose.connect(process.env.MONGO_URL)
    .then(()=>console.log('Database connected'))
    .catch(err=>console.log('Connection error:',err))


app.listen(PORT,()=>{
    console.log('Your server is running');
})


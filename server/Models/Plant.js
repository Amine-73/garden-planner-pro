import mongoose from 'mongoose';

const PlantSchema=new mongoose.Schema({
    name:{type:String,required:true},
    spacing:Number,
    expectedYield:Number,
    daysToHarvest:Number
});

module.exports=mongoose.model('Plant',PlantSchema)
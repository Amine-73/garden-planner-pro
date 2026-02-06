import mongoose from 'mongoose';

const PlantSchema=new mongoose.Schema({
    name:{type:String,required:true},
    spacingInches:{type:Number,required:true},
    yieldPerPlantLbs:{type:Number,required:true},
    daysToHarvest:{type:Number,required:true},
    image:{type:String}
});

const Plant=mongoose.model('Plant',PlantSchema);
export default Plant;
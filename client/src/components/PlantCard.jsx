import React from 'react';
import { 
  Card, CardContent, Typography, TextField, Box 
} from '@mui/material';

const PlantCard = ({ 
  plant, 
  gardenData, 
  handleQuantityChange, 
  getPlantImage, 
  getSeason, 
  getHarvestDate 
}) => {
  const season = getSeason(plant.name);
  const quantity = gardenData[plant._id] || '';
  const expectedHarvest = (quantity * plant.yieldPerPlantLbs).toFixed(1);

  return (
    <Card sx={{ 
      borderRadius: 4, 
      height: '100%', 
      position: 'relative', // Added for the absolute positioned season chip
      overflow: 'hidden', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)' 
    }}>
      {/* IMAGE SECTION */}
      <Box sx={{ 
        height: 160, 
        bgcolor: '#e8f5e9', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          src={getPlantImage(plant.name)}
          alt={plant.name}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* SEASON CHIP */}
        <Box sx={{ 
          position: 'absolute', top: 10, right: 10,
          bgcolor: season.bg,
          color: season.color,
          px: 1.5, py: 0.5, borderRadius: 2,
          fontSize: '0.65rem', fontWeight: 800,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textTransform: 'uppercase'
        }}>
          {season.label}
        </Box>

        {/* CATEGORY CHIP */}
        <Box sx={{ 
          display: 'inline-block', px: 1, py: 0.2, borderRadius: 1, 
          bgcolor: plant.category === 'Fruit' ? '#fff3e0' : '#e8f5e9', 
          color: plant.category === 'Fruit' ? '#e65100' : '#2e7d32',
          fontSize: '0.6rem', fontWeight: 800, mb: 1
        }}>
          {plant.category?.toUpperCase() || 'VEGETABLE'}
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          {plant.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Yields {plant.yieldPerPlantLbs} lbs • {plant.daysToHarvest} days
        </Typography>

        <Typography variant="body2" sx={{ color: '#ef6c00', fontWeight: 600, mt: 1, mb: 2 }}>
          ⏱️ Ready to eat by: {getHarvestDate(plant.daysToHarvest)}
        </Typography>

        <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 700, mb: 2 }}>
          Expected Harvest: {expectedHarvest} lbs
        </Typography>

        <TextField
          data-html2canvas-ignore="true"
          label="Number of Plants"
          type="number"
          fullWidth
          variant="filled"
          value={quantity}
          onChange={(e) => handleQuantityChange(plant._id, e.target.value)}
          inputProps={{ min: 0 }} 
          InputProps={{ 
            disableUnderline: true, 
            sx: { borderRadius: 2, bgcolor: '#f1f8e9' } 
          }}
        />
      </CardContent>
    </Card>
  );
};

export default PlantCard;
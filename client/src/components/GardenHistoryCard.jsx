import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Trash2 } from 'lucide-react';

const GardenHistoryCard = ({ garden, onDelete }) => {
  // Calculate total yield for this specific garden plan
  const totalYield = garden.items.reduce((sum, item) => {
    return sum + (item.quantity * (item.plantId?.yieldPerPlantLbs || 0));
  }, 0).toFixed(1);

  return (
    <Paper sx={{ p: 3, mb: 2, borderRadius: 4, border: '1px solid #e0e0e0' }}>
      {/* Header: Date and Delete Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {new Date(garden.createdAt).toLocaleDateString()}
        </Typography>
        <Button 
          onClick={() => onDelete(garden._id)} 
          color="error" 
          size="small"
        >
          <Trash2 size={18} />
        </Button>
      </Box>

      {/* Plant Tags */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {garden.items.map((item, idx) => (
          <Box 
            key={idx} 
            sx={{ 
              bgcolor: '#e8f5e9', 
              color: '#2e7d32', 
              px: 1, 
              py: 0.5, 
              borderRadius: 1, 
              fontSize: '0.7rem' 
            }}
          >
            {item.quantity}x {item.plantId?.name || 'Unknown'}
          </Box>
        ))}
      </Box>

      {/* Footer: Yield and Savings */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        borderTop: '1px solid #eee', 
        pt: 2 
      }}>
        <Box>
          <Typography variant="caption" display="block" color="text.secondary">YIELD</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {totalYield} lbs
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" display="block" color="text.secondary">SAVINGS</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#2e7d32' }}>
            ${garden.totalEstimatedSavings.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default GardenHistoryCard;
import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Trash2, Clock } from 'lucide-react';
import GardenHistoryCard from './GardenHistoryCard';

const GardenHistory = ({ savedGardens, deleteGarden, handleLoadGarden }) => {
  // Empty State
  if (savedGardens.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: '#fcfdfc', border: '1px dashed #c8e6c9' }}>
        <Typography color="text.secondary">🌱 No saved gardens yet. Create your first plan above!</Typography>
      </Paper>
    );
  }

  return (
    <>
      {/* --- DESKTOP VIEW (md and up) --- */}
      <Paper sx={{ display: { xs: 'none', md: 'block' }, borderRadius: 4, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f1f8e9' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Plants</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Total Yield</th> 
              <th style={{ padding: '16px', textAlign: 'right' }}>Total Savings</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {savedGardens.map((garden) => {
              const yieldSum = garden.items.reduce((sum, item) => 
                sum + (item.quantity * (item.plantId?.yieldPerPlantLbs || 0)), 0
              ).toFixed(1);

              return (
                <tr 
                  key={garden._id} 
                  style={{ borderTop: '1px solid #eee', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fbf9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '16px', color: '#666', fontSize: '0.875rem' }}>
                    {new Date(garden.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {garden.items.map((item, idx) => (
                        <Box key={idx} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 700 }}>
                          {item.quantity}x {item.plantId?.name || 'Plant'}
                        </Box>
                      ))}
                    </Box>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>
                    {yieldSum} lbs
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#2e7d32' }}>
                    ${garden.totalEstimatedSavings.toFixed(2)}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button onClick={() => handleLoadGarden(garden)} sx={{ color: '#2e7d32', minWidth: '40px' }}>
                        <Clock size={20} />
                      </Button>
                      <Button onClick={() => deleteGarden(garden._id)} color="error" sx={{ minWidth: '40px' }}>
                        <Trash2 size={20} />
                      </Button>
                    </Box>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Paper>

      {/* --- MOBILE VIEW (xs and sm) --- */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {savedGardens.map((garden) => (
          <GardenHistoryCard 
            key={garden._id} 
            garden={garden} 
            onDelete={deleteGarden} 
          />
        ))}
      </Box>
    </>
  );
};

export default GardenHistory;
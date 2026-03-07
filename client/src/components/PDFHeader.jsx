import React from 'react';
import { Box, Typography } from '@mui/material';

const PDFHeader = () => {
  return (
    <Box 
      id="pdf-header"
      sx={{ 
        display: 'none', // Remains hidden until html2canvas captures it
        textAlign: 'center', 
        padding: '20px', 
        borderBottom: '2px solid #2e7d32',
        marginBottom: '20px'
      }}
    >
      <img 
        src="/logo.png" 
        alt="Logo" 
        style={{ height: '60px', marginBottom: '10px' }} 
      />
      <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
        GARDEN PLANNER PRO
      </Typography>
      <Typography variant="subtitle1">
        Official Garden Layout & Savings Report
      </Typography>
      <Typography variant="body2" sx={{ color: 'gray' }}>
        Generated on: {new Date().toLocaleDateString()}
      </Typography>
    </Box>
  );
};

export default PDFHeader;
import React from 'react';
import { Paper, Box, Typography, Button,TextField ,Divider } from '@mui/material';
import { Wallet, Scale } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Sprout, FileText, Trash2, Download } from 'lucide-react';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0, 
  }).format(val);
};

const formatWeight = (val) => {
  // If yield is over 1000 lbs, show '1.2k' instead of '1200.0000004'
  return val > 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(1);
};

const FloatingStatsBar = ({ 
  totalSavings, 
  totalYield, 
  user, 
  handleDownloadPDF, 
  isGeneratingPDF, 
  handleClearSelection, 
  hasUnsavedChanges, 
  saveGarden, 
  isSaving ,
  gardenName,
  setGardenName
}) => {
  return (
    <Paper 
      className="floating-bar-class"
      elevation={12} 
      sx={{ 
        position: 'fixed', 
        bottom: { xs: 10, md: 30 }, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: 'auto', 
        p: { xs: 2, md: 3 }, 
        borderRadius: { xs: 4, md: 8 }, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        // gap: { xs: 2, md: 0 },
        justifyContent: 'space-between', 
        alignItems: 'center', 
        zIndex: 1100 ,
        maxWidth: '95vw', // Prevents it from going off-screen on mobile
        overflow: 'hidden', // Keeps everything inside the rounded corners
        gap: 2, // Space between elements
      }}
    >
      {/* STATS SECTION */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: { xs: 'space-around', md: 'flex-start' },
        width: { xs: '100%', md: 'auto' },
        gap: { xs: 1, md: 4 } 
      }}>
        
        {/* 1. SAVINGS STAT */}
        <Box sx={{minWidth: '120px', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ p: 1, bgcolor: '#e8f5e9', borderRadius: 2, display: { xs: 'none', sm: 'flex' } }}>
            <Wallet size={20} color="#2e7d32" />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', fontSize: { xs: '0.6rem', md: '0.75rem' } }}>
              EST. SAVINGS
            </Typography>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
              {formatCurrency(totalSavings)}
            </Typography>
          </Box>
        </Box>
<Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
        {/* 2. TOTAL YIELD STAT */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          borderLeft: '2px solid #eee', 
          minWidth: '100px',
          pl: { xs: 2, md: 4 } 
        }}>
          <Box sx={{ p: 1, bgcolor: '#e3f2fd', borderRadius: 2, display: { xs: 'none', sm: 'flex' } }}>
            <Scale size={20} color="#1565c0" />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', fontSize: { xs: '0.6rem', md: '0.75rem' } }}>
              TOTAL YIELD
            </Typography>
            <Typography sx={{ fontWeight: 900, color: '#1565c0', fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
              {formatWeight(totalYield)} lbs
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* BUTTONS SECTION */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        width: { xs: '100%', md: 'auto' },
        flexDirection: { xs: 'row', sm: 'row' },
      }}>

        <TextField
  size="small"
  placeholder="Name your garden..."
  value={gardenName}
  onChange={(e) => setGardenName(e.target.value)}
  InputProps={{
    startAdornment: (
      <Box sx={{ color: '#2e7d32', mr: 1, display: 'flex', opacity: 0.7 }}>
        <Sprout size={16} /> 
      </Box>
    ),
  }}
  sx={{
    width: { xs: '150px', md: '220px' },
    mx: 1, 
    '& .MuiOutlinedInput-root': {
      height: '45px', 
      borderRadius: '12px',
      backgroundColor: '#f9fbf9',
      transition: 'all 0.3s ease',
      fontSize: '0.9rem',
      '& fieldset': {
        borderColor: '#e0e0e0',
      },
      '&:hover fieldset': {
        borderColor: '#2e7d32',
      },
      '&.Mui-focused fieldset': {
        borderWidth: '2px',
        borderColor: '#2e7d32',
      },
    },
    '& .MuiInputBase-input::placeholder': {
      fontSize: '0.85rem',
      fontStyle: 'italic',
      opacity: 0.7,
    },
  }}
/>
        <Button 
          variant="outlined" 
          onClick={() => {
            if (!user) {
              toast.error("Please Sign In to download your PDF report!", {
                icon: '🔒',
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
              });
              return;
            }
            handleDownloadPDF();
          }} 
          disabled={isGeneratingPDF}
          sx={{ 
            flex: 1,
            borderRadius: 3, 
            fontWeight: 800, 
            borderColor: '#1b5e20', 
            color: '#1b5e20',
            fontSize: { xs: '0.7rem', md: '0.875rem' },
            px: { xs: 1, md: 2 },
            '&:hover': {
              bgcolor: !user ? 'transparent' : '#f1f8e9',
              borderColor: '#1b5e20'
            }
          }}
        >
          {isGeneratingPDF ? '...' : 'PDF'}
        </Button>

        <Button 
          data-html2canvas-ignore="true"
          variant="outlined" 
          onClick={handleClearSelection} 
          disabled={!hasUnsavedChanges || isGeneratingPDF}
          sx={{ 
            flex: 0.5,
            borderRadius: 3, 
            fontWeight: 800, 
            borderColor: '#d32f2f', 
            color: '#d32f2f',
            fontSize: { xs: '0.7rem', md: '0.875rem' }
          }}
        >
          Clear
        </Button>

        <Button 
          variant="contained" 
          onClick={saveGarden}
          disabled={isSaving}
          sx={{ 
            flex: 1.5, 
            bgcolor: '#1b5e20', 
            borderRadius: 3,
            fontSize: { xs: '0.8rem', md: '1rem' }, 
            fontWeight: 800,
            '&:hover': { bgcolor: '#2e7d32' }
          }}
        >
          {isSaving ? "Saving..." : "Save Garden"}
        </Button>
      </Box>
    </Paper>
  );
};

export default FloatingStatsBar;
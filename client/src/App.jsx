import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Grid, Card, CardContent, 
  TextField, Box, AppBar, Toolbar, Paper, Button 
} from '@mui/material';
// Modern, reliable icons
import { Sprout, Scale, Clock, Wallet,Trash2 } from 'lucide-react';

function App() {
 const [plants, setPlants] = useState([]);
  const [gardenData, setGardenData] = useState({});
  const [savedGardens, setSavedGardens] = useState([]);

  // 1. Fetching Logic (Plants)
  const fetchPlants = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/plants');
      setPlants(response.data);
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  };

  // 2. Fetching Logic (History)
  const fetchGardenHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/gardens');
      setSavedGardens(response.data);
    } catch (error) {
      console.error("History Error:", error);
    }
  };



  // 4. Calculation Logic
  const totalSavings = useMemo(() => {
    return plants.reduce((acc, plant) => {
      const qty = gardenData[plant._id] || 0;
      const price=plant.marketPricePerlb || 4.50;
      return acc + (qty * plant.yieldPerPlantLbs * price);
    }, 0);
  }, [gardenData, plants]);

  // 5. Input Handler
  const handleQuantityChange = (id, value) => {
    setGardenData(prev => ({
      ...prev,
      [id]: parseInt(value) || 0
    }));
  };

  // 6. Save Logic (The "Refined" Way)
    const saveGarden = async () => {
    const items = Object.entries(gardenData)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({
        plantId: id,
        quantity: qty
      }));

    if (items.length === 0) {
      alert("Please add at least one plant!");
      return;
    }

    try {
      // Make sure this URL matches your server port (5000)
      const response = await axios.post('http://localhost:5000/api/gardens', {
        items,
        totalEstimatedSavings: totalSavings
      });
      alert("✅ Garden Plan Saved!");
      fetchGardenHistory(); 
    } catch (error) {
      console.error("Full Error:", error.response?.data || error.message);
      alert("❌ Failed to save garden.");
    }
  };

  const deleteGarden = async (id) => {
  if (window.confirm("Are you sure you want to delete this plan?")) {
    try {
      await axios.delete(`http://localhost:5000/api/gardens/${id}`);
      // Refresh the list immediately after deleting
      fetchGardenHistory();
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete the plan.");
    }
  }
};
  
    // 3. Initial Load
  useEffect(() => {
    fetchPlants();
    fetchGardenHistory();
  }, []);

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: '#f8faf8', m: 0, p: 0 }}>
    
    {/* AppBar stays 100% width */}
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#2e7d32', width: '100%' }}>
      <Toolbar>
        <Sprout style={{ marginRight: '12px' }} />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          GARDEN PLANNER PRO
        </Typography>
      </Toolbar>
    </AppBar>

    {/* This is the key: Container centers the content and fills the available space */}
    <Container maxWidth="xl" sx={{ mt: 6, pb: 15 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#1b5e20', mb: 1, fontSize: { xs: '2rem', md: '3.5rem' } }}>
          Plan Your Harvest
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter the number of plants to see your estimated grocery savings.
        </Typography>
      </Box>

      {/* Grid container will now use the full width of the Container */}
      <Grid container spacing={4} justifyContent="center">
        {plants.map((plant) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={plant._id}>
            <Card sx={{ borderRadius: 4, height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>{plant.name}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
                    <Scale size={16} style={{ marginRight: '4px' }} /> {plant.yieldPerPlantLbs} lbs/ea
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
                    <Clock size={16} style={{ marginRight: '4px' }} /> {plant.daysToHarvest} days
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  label="Plant Count"
                  variant="outlined"
                  onChange={(e) => handleQuantityChange(plant._id, e.target.value)}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
            <Box sx={{ mt: 10 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1b5e20', mb: 3 }}>
          Your Saved Plans
        </Typography>
        
        <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
          {savedGardens.length === 0 ? (
            <Typography sx={{ p: 4, textAlign: 'center' }} color="text.secondary">
              No saved gardens yet. Create one above!
            </Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f1f8e9' }}>
  <tr>
    <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
    <th style={{ padding: '16px', textAlign: 'left' }}>Plants</th>
    <th style={{ padding: '16px', textAlign: 'right' }}>Total Savings</th>
    <th style={{ padding: '16px', textAlign: 'center' }}>Action</th> {/* New Header */}
  </tr>
</thead>
<tbody>
  {savedGardens.map((garden) => (
    <tr key={garden._id} style={{ borderTop: '1px solid #eee' }}>
      <td style={{ padding: '16px' }}>
        {new Date(garden.createdAt).toLocaleDateString()}
      </td>
      <td style={{ padding: '16px' }}>
        {garden.items.map(i => `${i.quantity}x ${i.plantId?.name || 'Plant'}`).join(', ')}
      </td>
      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#2e7d32' }}>
        ${garden.totalEstimatedSavings.toFixed(2)}
      </td>
      {/* New Action Cell */}
      <td style={{ padding: '16px', textAlign: 'center' }}>
        <Button 
          onClick={() => deleteGarden(garden._id)}
          sx={{ color: '#d32f2f', minWidth: 'auto', '&:hover': { bgcolor: '#ffebee' } }}
        >
          <Trash2 size={20} />
        </Button>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>

    {/* Responsive Floating Bar */}
    <Paper 
      elevation={12} 
      sx={{ 
        position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)',
        width: { xs: '95%', sm: '80%', md: '600px' }, p: 3, borderRadius: 8,
        bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        border: '1px solid rgba(0,0,0,0.05)', zIndex: 1000
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Wallet size={28} color="#2e7d32" />
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>ESTIMATED SAVINGS</Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#1b5e20' }}>${totalSavings.toFixed(2)}</Typography>
        </Box>
      </Box>
      <Button variant="contained" color="success" onClick={saveGarden} sx={{ borderRadius: 4, px: 3, py: 1.5, fontWeight: 700 }}>
        Save Plan
      </Button>
    </Paper>
  </Box>
  );
}

export default App;
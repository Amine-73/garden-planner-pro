import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Grid, Card, CardContent, 
  TextField, Box, AppBar, Toolbar, Paper, Button 
} from '@mui/material';
import { Sprout, Scale, Clock, Wallet, Trash2 } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

function App() {
  const [plants, setPlants] = useState([]);
  const [gardenData, setGardenData] = useState({});
  const [savedGardens, setSavedGardens] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchPlants = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/plants');
      setPlants(response.data);
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  };

  const fetchGardenHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/gardens');
      setSavedGardens(response.data);
    } catch (error) {
      console.error("History Error:", error);
    }
  };

  useEffect(() => {
    fetchPlants();
    fetchGardenHistory();
  }, []);

  const totalSavings = useMemo(() => {
    return plants.reduce((acc, plant) => {
      const qty = gardenData[plant._id] || 0;
      const price = plant.marketPricePerLb || 4.50;
      return acc + (qty * plant.yieldPerPlantLbs * price);
    }, 0);
  }, [gardenData, plants]);

  const filteredPlants = useMemo(() => {
  return plants.filter(plant =>{
      const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || plant.category === activeCategory;
      return matchesSearch && matchesCategory;
    }
  );
}, [plants, searchTerm,activeCategory]);

  const stats = useMemo(() => {
    const totalMoney = savedGardens.reduce((acc, g) => acc + g.totalEstimatedSavings, 0);
    const totalPlans = savedGardens.length;
    const totalPounds = savedGardens.reduce((acc, g) => {
      return acc + g.items.reduce((sum, item) => {
        return sum + (item.quantity * (item.plantId?.yieldPerPlantLbs || 0));
      }, 0);
    }, 0);
    return { totalMoney, totalPlans, totalPounds };
  }, [savedGardens]);


  const handleQuantityChange = (id, value) => {
    setGardenData(prev => ({
      ...prev,
      [id]: parseInt(value) || 0
    }));
  };
  const chartData = useMemo(() => {
  // Take the last 7 entries, reverse them to go left-to-right (oldest to newest)
  return [...savedGardens]
    .reverse()
    .slice(-7) 
    .map(garden => ({
      date: new Date(garden.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      savings: garden.totalEstimatedSavings
    }));
}, [savedGardens]);

  const saveGarden = async () => {
    const items = Object.entries(gardenData)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ plantId: id, quantity: qty }));

    if (items.length === 0) {
      alert("Please add at least one plant!");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/gardens', {
        items,
        totalEstimatedSavings: totalSavings
      });
      alert("✅ Garden Plan Saved!");
      fetchGardenHistory(); 
    } catch (error) {
      alert("❌ Failed to save garden.");
    }
  };

  const deleteGarden = async (id) => {
    if (window.confirm("Delete this plan?")) {
      try {
        await axios.delete(`http://localhost:5000/api/gardens/${id}`);
        fetchGardenHistory();
      } catch (error) {
        alert("Failed to delete.");
      }
    }
  };

  const clearAllPlans = async () => {
  if (window.confirm("Are you sure you want to delete ALL saved plans? This cannot be undone.")) {
    try {
      // We'll need to create this route in the backend next!
      await axios.delete('http://localhost:5000/api/gardens');
      fetchGardenHistory();
    } catch (error) {
      alert("Error clearing history");
    }
  }
  };

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: '#f8faf8', m: 0, p: 0 }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#2e7d32', width: '100%' }}>
        <Toolbar>
          <Sprout style={{ marginRight: '12px' }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>GARDEN PLANNER PRO</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 6, pb: 15 }}>
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#1b5e20', mb: 1 }}>Plan Your Harvest</Typography>
          <Typography variant="body1" color="text.secondary">Enter plant counts to see grocery savings.</Typography>
          <TextField
            placeholder="Search for a plant (e.g. Tomato)..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              width: { xs: '100%', md: '50%' },
              bgcolor: 'white',
              borderRadius: 4,
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                '& fieldset': { borderColor: '#e0e0e0' },
                '&:hover fieldset': { borderColor: '#2e7d32' },
              }
            }}
          />
          
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4 }}>
          {['All', 'Vegetable', 'Fruit', 'Herb'].map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "contained" : "outlined"}
              onClick={() => setActiveCategory(cat)}
              sx={{ 
                borderRadius: 5, 
                color: activeCategory === cat ? 'white' : '#2e7d32',
                bgcolor: activeCategory === cat ? '#2e7d32' : 'transparent',
                borderColor: '#2e7d32'
              }}
            >
              {cat}
            </Button>
          ))}
        </Box>

        {/* 1. Plant Grid */}
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 8 }}>
          {filteredPlants.map((plant) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={plant._id}>
              <Card sx={{ borderRadius: 4, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'inline-block', 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: 5, 
                    bgcolor: plant.category === 'Fruit' ? '#fff3e0' : '#e8f5e9', 
                    color: plant.category === 'Fruit' ? '#e65100' : '#2e7d32',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    mb: 1
                  }}>
                    {plant.category || 'Vegetable'}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>{plant.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
                      <Scale size={16} style={{ marginRight: '4px' }} /> {plant.yieldPerPlantLbs} lbs/ea
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
                      <Clock size={16} style={{ marginRight: '4px' }} /> {plant.daysToHarvest} days
                    </Box>
                  </Box>
                  <TextField fullWidth type="number" label="Plant Count" onChange={(e) => handleQuantityChange(plant._id, e.target.value)} />
                </CardContent>
              </Card>
            </Grid>
          )
          )}
          {filteredPlants.length === 0 && (
            <Box sx={{ textAlign: 'center', width: '100%', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                🌱 No plants found matching "{searchTerm}"
              </Typography>
            </Box>
          )}
        </Grid>

        {/* 2. Stats Dashboard "Performance Dashboard" */}
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1b5e20', mb: 3,textAlign:'center' }}>Performance Dashboard</Typography>
        <Grid container justifyContent="center" spacing={3} sx={{ mb: 6 }}>
          {[
            { label: 'Lifetime Savings', value: `$${stats.totalMoney.toFixed(2)}`, icon: <Wallet color="#2e7d32" />, color: '#e8f5e9' },
            { label: 'Total Harvest', value: `${stats.totalPounds.toFixed(1)} lbs`, icon: <Scale color="#1565c0" />, color: '#e3f2fd' },
            { label: 'Active Plans', value: stats.totalPlans, icon: <Sprout color="#ef6c00" />, color: '#fff3e0' },
          ].map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper sx={{ p: 3, borderRadius: 4, bgcolor: stat.color, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 3, display: 'flex' }}>{stat.icon}</Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{stat.label}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>{stat.value}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1b5e20', mb: 3 }}>
          Savings Trend
        </Typography>

        <Paper sx={{ p: 3, borderRadius: 4, mb: 6, height: 350, border: '1px solid #e0e0e0' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2e7d32" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Savings']}
              />
              <Area 
                type="monotone" 
                dataKey="savings" 
                stroke="#2e7d32" 
                fillOpacity={1} 
                fill="url(#colorSavings)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>

        {/* 3. History Table */}
        <Box sx={{ mt: 10, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1b5e20' }}>
    Your Saved Plans
  </Typography>
  
        {/* Only show the button if there is actually data to clear */}
        {savedGardens.length > 0 && (
          <Button 
            variant="outlined" 
            color="error" 
            onClick={clearAllPlans}
            startIcon={<Trash2 size={18} />}
            sx={{ borderRadius: 3, fontWeight: 700 }}
          >
            Clear All History
          </Button>
        )}
      </Box>
        <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
          {savedGardens.length === 0 ? (
            <Typography sx={{ p: 4, textAlign: 'center' }} color="text.secondary">No saved gardens yet.</Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f1f8e9' }}>
                  <tr>
                    <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '16px', textAlign: 'left' }}>Plants</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>Total Savings</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {savedGardens.map((garden) => (
                    <tr key={garden._id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '16px' }}>{new Date(garden.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '16px' }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {garden.items.map((item, idx) => (
                            <Box key={idx} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 700 }}>
                              {item.quantity}x {item.plantId?.name || 'Plant'}
                            </Box>
                          ))}
                        </Box>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#2e7d32' }}>
                        ${garden.totalEstimatedSavings.toFixed(2)}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <Button onClick={() => deleteGarden(garden._id)} color="error">
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
      </Container>

      {/* Floating Bar */}
      <Paper elevation={12} sx={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', width: { xs: '95%', md: '600px' }, p: 3, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Wallet size={28} color="#2e7d32" />
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>ESTIMATED SAVINGS</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>${totalSavings.toFixed(2)}</Typography>
          </Box>
        </Box>
        <Button variant="contained" color="success" onClick={saveGarden}>Save Plan</Button>
      </Paper>
    </Box>
  );
}

export default App;
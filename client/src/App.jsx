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
  const [isLoading, setIsLoading] = useState(true);
  const getPlantImage = (name) => {
  const images = {
    tomato: "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=300&q=80",
    pepper: "https://images.unsplash.com/photo-1563513307168-a4962fa8803c?auto=format&fit=crop&w=300&q=80",
    cucumber: "https://images.unsplash.com/photo-1694153192731-ab5445654427?q=80&w=759&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=300&q=80",
    carrot: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&q=80",
    strawberry: "https://images.unsplash.com/photo-1464965911861-746a04b05ec3?auto=format&fit=crop&w=300&q=80",
    basil: "https://images.unsplash.com/photo-1618375531912-867984ddf78d?auto=format&fit=crop&w=300&q=80"
  };
  return images[name.toLowerCase()] || "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=300&q=80";
};

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
    // const loadData = async () => {
    // setIsLoading(true);
    // await Promise.all([fetchPlants(), fetchGardenHistory()]);
    // setIsLoading(false);
    // };
    // loadData();
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


  const exportToCSV = () => {
  // 1. Create the Header row
  const headers = ["Date", "Plants", "Total Yield (lbs)", "Total Savings ($)"];
  
  // 2. Map through savedGardens to create the data rows
  const rows = savedGardens.map(garden => {
    const date = new Date(garden.createdAt).toLocaleDateString();
    // Create a string like "3x Tomato | 2x Pepper"
    const plants = garden.items
      .map(i => `${i.quantity}x ${i.plantId?.name || 'Unknown'}`)
      .join(' | ');
    const yieldLbs = garden.items
      .reduce((sum, i) => sum + (i.quantity * (i.plantId?.yieldPerPlantLbs || 0)), 0)
      .toFixed(1);
    const savings = garden.totalEstimatedSavings.toFixed(2);
    
    // Return a single comma-separated string for this row
    return [date, `"${plants}"`, yieldLbs, savings].join(",");
  });

  // 3. Combine headers and rows with new lines
  const csvContent = "data:text/csv;charset=utf-8," + 
    [headers.join(","), ...rows].join("\n");

  // 4. Create a hidden link to trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_garden_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up
  };

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: '#f8faf8', m: 0, p: 0 }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#2e7d32', width: '100%' }}>
        <Toolbar>
          <Sprout style={{ marginRight: '12px' }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>GARDEN PLANNER PRO</Typography>
        </Toolbar>
      </AppBar>
      {/* {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
          <CircularProgress sx={{ color: '#2e7d32' }} />
          <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
            Growing your garden...
          </Typography>
        </Box>
      ) :( */}
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
              <Card sx={{ borderRadius: 4, height: '100%', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            {/* PLANT IMAGE HEADER */}
            <Box sx={{ 
            height: 160, 
            width: '100%', 
            overflow: 'hidden', 
            bgcolor: '#f5f5f5', // Shows a light gray while loading
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
              <img 
                src={getPlantImage(plant.name)} 
                alt={plant.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </Box>

            <CardContent sx={{ p: 3 }}>
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

              <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 700, mb: 2 }}>
                Expected Harvest: {((gardenData[plant._id] || 0) * plant.yieldPerPlantLbs).toFixed(1)} lbs
              </Typography>

              <TextField
                label="Number of Plants"
                type="number"
                fullWidth
                variant="filled"
                value={gardenData[plant._id] || ''}
                onChange={(e) => handleQuantityChange(plant._id, e.target.value)}
                InputProps={{ disableUnderline: true, sx: { borderRadius: 2, bgcolor: '#f1f8e9' } }}
              />
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
        <Box sx={{ mt: 10 }}>
  {/* HEADER SECTION */}
  <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1b5e20' }}>
      Your Saved Plans
    </Typography>
    {/* ✅ ONLY SHOW THIS BOX IF LIST IS NOT EMPTY */}
  {savedGardens.length > 0 && (
    <Box>
      <Button 
        variant="outlined" 
        onClick={exportToCSV} 
        sx={{ borderRadius: 3, mr: 1, color: '#2e7d32', borderColor: '#2e7d32' }}
      >
        Export CSV
      </Button>
      <Button 
        variant="outlined" 
        color="error" 
        onClick={clearAllPlans}
        startIcon={<Trash2 size={18} />}
        sx={{ borderRadius: 3, fontWeight: 700 }}
      >
        Clear All
      </Button>
    </Box>
  )}
  </Box>

  {/* CONDITIONAL RENDERING: EMPTY VS DATA */}
  {savedGardens.length === 0 ? (
    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: '#fcfdfc', border: '1px dashed #c8e6c9' }}>
      <Typography color="text.secondary">🌱 No saved gardens yet. Create your first plan above!</Typography>
    </Paper>
  ) : (
    <>
      {/* --- DESKTOP VIEW (Visible on md and up) --- */}
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
            {savedGardens.map((garden) => (
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
                  {garden.items.reduce((sum, item) => sum + (item.quantity * (item.plantId?.yieldPerPlantLbs || 0)), 0).toFixed(1)} lbs
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#2e7d32' }}>
                  ${garden.totalEstimatedSavings.toFixed(2)}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <Button onClick={() => deleteGarden(garden._id)} color="error"><Trash2 size={20} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Paper>

      {/* --- MOBILE VIEW (Visible on xs and sm only) --- */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {savedGardens.map((garden) => (
          <Paper key={garden._id} sx={{ p: 3, mb: 2, borderRadius: 4, border: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                {new Date(garden.createdAt).toLocaleDateString()}
              </Typography>
              <Button onClick={() => deleteGarden(garden._id)} color="error" size="small"><Trash2 size={18} /></Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {garden.items.map((item, idx) => (
                <Box key={idx} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.7rem' }}>
                  {item.quantity}x {item.plantId?.name}
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', pt: 2 }}>
              <Box>
                <Typography variant="caption" display="block" color="text.secondary">YIELD</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {garden.items.reduce((sum, item) => sum + (item.quantity * (item.plantId?.yieldPerPlantLbs || 0)), 0).toFixed(1)} lbs
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
        ))}
      </Box>
    </>
  )}
</Box>

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
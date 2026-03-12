import  { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Container, Typography, Grid,  TextField, Box,Paper, Button ,Skeleton} from '@mui/material';
import { Sprout, Scale,  Wallet, Trash2 } from 'lucide-react';
import {  toast } from 'react-hot-toast';
import { plantImages } from './assets/images';
import { signInWithGoogle } from './firebase';
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import PlantCard from './components/PlantCard';
import Header from './components/Header';
import FloatingStatsBar from './components/FloatingStatsBar';
import PDFHeader from './components/PDFHeader';
import SavingsChart from './components/SavingsChart';
import GardenHistory from './components/GardenHistory';
import { generateGardenPDF } from './utils/pdfGenerator';
import { SkeletonGrid, SkeletonTable } from './components/SkeletonLoaders';


const getSeason = (name) => {
  const coolWeather = ['Lettuce', 'Spinach', 'Kale', 'Radish', 'Peas', 'Broccoli'];
  const hotWeather = ['Tomato', 'Pepper', 'Eggplant', 'Cucumber', 'Corn', 'Watermelon'];
  
  if (coolWeather.some(p => name.includes(p))) return { label: 'Spring/Fall', color: '#0288d1', bg: '#e1f5fe' };
  if (hotWeather.some(p => name.includes(p))) return { label: 'Summer', color: '#ef6c00', bg: '#fff3e0' };
  return { label: 'All Season', color: '#2e7d32', bg: '#e8f5e9' };
};

const getHarvestDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function App() {
  const [plants, setPlants] = useState([]);
  const [gardenData, setGardenData] = useState({});
  const [savedGardens, setSavedGardens] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [gardenName, setGardenName] = useState('');
  const open = Boolean(anchorEl);
  const hasUnsavedChanges = Object.values(gardenData).some(val => val > 0);

const handleMenuOpen = (event) => {
  setAnchorEl(event.currentTarget);
};

const handleMenuClose = () => {
  setAnchorEl(null);
};

const handleLogout = () => {
  auth.signOut();
  handleMenuClose();
};

const getPlantImage = (name) => {
  const key = name.toLowerCase().replace(/\s+/g, ''); // Removes spaces (e.g., "Bell Pepper" -> "bellpepper")
  return plantImages[key] || plantImages.default;
};

const handleDownloadPDF = async () => {
  generateGardenPDF('garden-report', setIsGeneratingPDF);
};


  const fetchGardenHistory = async () => {
  // 1. Safety Check: Only fetch if we have a logged-in user
  if (!user || !user.uid) {
    setSavedGardens([]); // Clear the list if no one is logged in
    return;
  }

  try {
    // 2. Add the userId as a query parameter (?userId=...)
    // This tells the backend exactly whose gardens to find
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/gardens?userId=${user.uid}`
    );
    
    // 3. Update the state with the list from the server
    setSavedGardens(response.data);
  } catch (error) {
    console.error("Error fetching history:", error);
    toast.error("Could not load your saved plans.");
  }
};


    const totalYield = useMemo(() => {
  return plants.reduce((acc, plant) => {
    const qty = gardenData[plant._id] || 0;
    return acc + (qty * plant.yieldPerPlantLbs);
  }, 0);
}, [gardenData, plants]);


// 4. Important: Re-fetch history whenever the user logs in
useEffect(() => {
  if (user) {
    fetchGardenHistory();
  }
}, [user]);





useEffect(() => {
  // This function runs every time the "auth state" changes (login or logout)
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
    } else {
      setUser(null);
    }
  });

  return () => unsubscribe(); // Cleanup the listener on unmount
}, []);

  useEffect(() => {
    
    const fetchPlants = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/plants`);
      setPlants(response.data);
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
    };
    const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchPlants(), fetchGardenHistory()]);
    setIsLoading(false);
    };

    

    
    loadData();
  }, []);


  useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = ''; // Standard requirement for modern browsers
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);


  const totalSavings = useMemo(() => {
    return plants.reduce((acc, plant) => {
      const qty = gardenData[plant._id] || 0;
      const price = plant.marketPricePerLb || 4.50;
      return acc + (qty * plant.yieldPerPlantLbs * price);
    }, 0);
  }, [gardenData, plants]);

  const filteredPlants = useMemo(() => {
    // Pre-calculate search term to avoid repeating .toLowerCase() inside filter
    const search = searchTerm.toLowerCase();
    
    return plants.filter(plant => {
      const matchesSearch = plant.name.toLowerCase().includes(search);
      const plantSeason = getSeason(plant.name).label;
      
      // Update logic to check both Category and Season
      const matchesCategory = 
        activeCategory === 'All' || 
        plant.category === activeCategory || 
        plantSeason === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [plants, searchTerm, activeCategory]);

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
    const val = parseInt(value);
    setGardenData(prev => ({
      ...prev,
      [id]:value === '' ? 0 : val
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
  if (!user) {
    toast.error("Please sign in to save!");
    return;
  }

  // NEW: Validation for the name
  if (!gardenName.trim()) {
    toast.error("Please give your garden a name!");
    return;
  }

  const items = Object.entries(gardenData)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => ({ plantId: id, quantity: qty }));

  if (items.length === 0) {
    toast.error("Please add at least one plant!");
    return;
  }

  setIsSaving(true);
  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/gardens`, {
      userId: user.uid,
      userEmail: user.email,
      name: gardenName, // <--- Add the name here
      items: items,
      totalEstimatedSavings: totalSavings,
      date: new Date()
    });
    
    fetchGardenHistory(); 
    setGardenName(''); // Clear the name after saving
    toast.success(`'${gardenName}' saved successfully! 🌱`);
  } catch (error) {
    console.error("Save Error:", error.response?.data);
  } finally {
    setIsSaving(false);
  }
};

  const handleLoadGarden = (garden) => {
  
  const loadedData = {};
  
  // 1. Map the items back to the gardenData state
  garden.items.forEach(item => {
    // Check if plantId is an object (populated) or just an ID string
    const plantId = item.plantId?._id || item.plantId; 
    if (plantId) {
      loadedData[plantId] = item.quantity;
    }
  });

  // 2. Update state
  setGardenData(loadedData); 
  setGardenName(garden.name || "");
  // 3. FORCE the scroll to the very top of the page
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
  toast.success("Plan loaded! Check the top of the page.");
};

  const handleClearSelection = () => {
  if (Object.values(gardenData).some(val => val > 0)) {
    setGardenData({});
    toast.success("Selection cleared!");
  }
};


const topPerformingPlants = useMemo(() => {
  return plants
    .map(plant => {
      const qty = gardenData[plant._id] || 0;
      const savings = qty * plant.yieldPerPlantLbs * (plant.marketPricePerLb || 4.50);
      return { name: plant.name, savings };
    })
    .filter(p => p.savings > 0)
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 3); // Get the top 3
}, [gardenData, plants]);




  const deleteGarden = async (id) => {
    if (window.confirm("Delete this plan?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/gardens/${id}`);
        fetchGardenHistory();
        toast.success('Plan removed from history', { icon: '🗑️' });
      } catch (error) {
        // toast.error("Failed to delete.");
      }
    }
  };

  const clearAllPlans = async () => {
  if (window.confirm("Are you sure you want to delete ALL saved plans? This cannot be undone.")) {
    try {
      
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/gardens`);
      fetchGardenHistory();
    } catch (error) {
      // toast.error("Error clearing history");
    }
  }
  };



  // ----------EXECEL-STYLE SPREADSHEET
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
    <Box id="garden-report"  sx={{ width: '100vw', minHeight: '100vh', bgcolor: '#f8faf8', m: 0, p: 0 }}>

      {/* ------------- HEADER -------------- */}
      <Header 
        user={user}
        signInWithGoogle={signInWithGoogle}
        handleLogout={handleLogout}
        anchorEl={anchorEl}
        open={open}
        handleMenuOpen={handleMenuOpen}
        handleMenuClose={handleMenuClose}
      />
      {/* ================ HEADER ================== */}

      {isLoading ? (
        <Container maxWidth="xl" sx={{ mt: 6 }}>
          {/* Mimic the Header text loading */}
          <Box sx={{ mb: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Skeleton variant="text" width="40%" height={60} />
            <Skeleton variant="text" width="25%" height={30} />
          </Box>
          
          {/* The Plant Grid Loading State */}
          <SkeletonGrid />

          {/* The History Loading State */}
          <Box sx={{ mt: 10 }}>
            <Skeleton variant="text" width="200px" height={40} />
            <SkeletonTable />
          </Box>
        </Container>
      ) :(
      <Container  maxWidth="xl" sx={{ mt: 6, pb: '200px' }}>
        
        
        
        <Box  sx={{ mb: 6, textAlign: 'center' }}>

          {/* ========= */}

          {/* This header is hidden by default and only shows during PDF generation */}
          <PDFHeader />
          {/* ----------------- */}
          <div data-html2canvas-ignore="true">
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#1b5e20', mb: 1 }}>Plan Your Harvest</Typography>
          <Typography variant="body1" color="text.secondary">Enter plant counts to see grocery savings.</Typography>
          
          <TextField
          data-html2canvas-ignore="true"
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
          </div>
        </Box>
        <Box 
  sx={{ 
    display: 'flex', 
    // On mobile: allow horizontal scroll if buttons are too wide
    // On desktop: keep them centered
    justifyContent: { xs: 'flex-start', md: 'center' }, 
    gap: 1, 
    mb: 4,
    pb: 1, 
    overflowX: 'auto', 
    whiteSpace: 'nowrap', 
    // Hide scrollbar for a cleaner look (optional)
    '&::-webkit-scrollbar': { display: 'none' },
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    px: { xs: 2, md: 0 } // Add padding on sides so buttons don't touch screen edges
  }}
>
  {['All', 'Vegetable', 'Fruit', 'Herb','Summer', 'Spring/Fall'].map((cat) => (
    <Button
      key={cat}
      variant={activeCategory === cat ? "contained" : "outlined"}
      onClick={() => setActiveCategory(cat)}
      sx={{ 
        borderRadius: 5, 
        // Ensure text doesn't wrap inside the button
        minWidth: 'fit-content',
        px: { xs: 2, md: 3 }, // More horizontal padding
        py: 1,
        fontSize: { xs: '0.8rem', md: '0.875rem' }, // Slightly smaller font on mobile
        color: activeCategory === cat ? 'white' : '#2e7d32',
        bgcolor: activeCategory === cat ? '#2e7d32' : 'transparent',
        borderColor: '#2e7d32',
        flexShrink: 0, // Prevent buttons from squishing
        '&:hover': {
          bgcolor: activeCategory === cat ? '#1b5e20' : '#f1f8e9',
          borderColor: '#2e7d32'
        }
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
              <PlantCard 
        plant={plant}
        gardenData={gardenData}
        handleQuantityChange={handleQuantityChange}
        getPlantImage={getPlantImage}
        getSeason={getSeason}
        getHarvestDate={getHarvestDate}
      />
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

        {topPerformingPlants.length > 0 && (
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2e7d32', mb: 2, letterSpacing: 1 }}>
            🔥 TOP SAVINGS GENERATORS
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
            {topPerformingPlants.map((plant, index) => (
              <Paper 
                key={index}
                elevation={0}
                sx={{ 
                  px: 3, py: 1, borderRadius: 3, 
                  border: '2px solid #e8f5e9',
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  bgcolor: 'white'
                }}
              >
                <Typography sx={{ fontWeight: 900, color: '#2e7d32' }}>#{index + 1}</Typography>
                <Typography sx={{ fontWeight: 700 }}>{plant.name}</Typography>
                <Typography sx={{ fontWeight: 800, color: '#1b5e20' }}>
                  +${plant.savings.toFixed(2)}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>

      )}

        {/* ------------------------------------ */}
        <SavingsChart chartData={chartData} />
        {/* ------------------------------------ */}


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

  <GardenHistory 
  savedGardens={savedGardens}
  deleteGarden={deleteGarden}
  handleLoadGarden={handleLoadGarden}
/>
</Box>

      </Container>)}

      {/* Floating Bar */}
<FloatingStatsBar 
  totalSavings={totalSavings}
  totalYield={totalYield}
  user={user}
  handleDownloadPDF={handleDownloadPDF}
  isGeneratingPDF={isGeneratingPDF}
  handleClearSelection={handleClearSelection}
  hasUnsavedChanges={hasUnsavedChanges}
  saveGarden={saveGarden}
  isSaving={isSaving}
  gardenName={gardenName}
  setGardenName={setGardenName}
  
/>
    </Box>
  );
}

export default App;
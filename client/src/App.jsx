import  { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Grid, Card, CardContent, 
  TextField, Box, AppBar, Toolbar, Paper, Button ,CircularProgress,Avatar,Menu,MenuItem,ListItemIcon,Divider
} from '@mui/material';
import { Sprout, Scale, Clock, Wallet, Trash2 } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { Toaster, toast } from 'react-hot-toast';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { plantImages } from './assets/images';
import { signInWithGoogle } from './firebase';
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { LogOut } from 'lucide-react';

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
  const open = Boolean(anchorEl);

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
  const loadingToast = toast.loading("Generating your high-quality PDF...");
  setIsGeneratingPDF(true);

  const element = document.getElementById('garden-report');
  const pdfHeader = document.getElementById('pdf-header');
  const floatingBar = document.querySelector('.floating-bar-class'); // Select the floating bar

  if (!element) return;

  // 1. "CAPTURE MODE" - Temporary UI Changes
  // Hide floating elements
  if (pdfHeader) pdfHeader.style.setProperty('display', 'block', 'important');
  if (floatingBar) floatingBar.style.setProperty('display', 'none', 'important');
  
  // Store original styles
  const originalStyles = {
    width: element.style.width,
    maxWidth: element.style.maxWidth,
    position: element.style.position,
    overflow: element.style.overflow
  };
  
  // Temporarily modify element for better capture
  element.style.overflow = 'visible'; // Ensure all content is visible
  
  // Force a desktop-width for the screenshot
  if (window.innerWidth < 900) {
    element.style.width = '1200px'; 
    element.style.maxWidth = '1200px';
    // Center the element to avoid cutting off edges
    element.style.marginLeft = 'auto';
    element.style.marginRight = 'auto';
  }

  // Scroll to top
  window.scrollTo(0, 0);

  // Wait for layout to stabilize
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    // Get accurate dimensions
    const elementRect = element.getBoundingClientRect();
    
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      x: 0,
      y: 0,
      allowTaint: false,
      foreignObjectRendering: false, // Set to true if you have complex CSS
      onclone: (clonedDoc, clonedElement) => {
        // Additional styling for cloned element if needed
        clonedElement.style.overflow = 'visible';
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate scaling
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const width = imgWidth * ratio;
    const height = imgHeight * ratio;
    
    // Center on page
    const xOffset = (pdfWidth - width) / 2;
    const yOffset = (pdfHeight - height) / 2;
    
    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, width, height);
    
    // If content is taller than page, add more pages
    if (height > pdfHeight) {
      // Implement multi-page logic here if needed
      // For now, just scale to fit
    }
    
    pdf.save('My_Garden_Plan.pdf');
    toast.success("Report Ready!", { id: loadingToast });
    
  } catch (error) {
    console.error("PDF Generation Error:", error);
    toast.error("Error generating PDF. Please try again.", { id: loadingToast });
  } finally {
    // 2. RESTORE UI - Back to normal
    if (pdfHeader) pdfHeader.style.display = 'none';
    if (floatingBar) floatingBar.style.display = 'flex'; // or 'block' based on original display
    
    // Restore all original styles
    element.style.width = originalStyles.width;
    element.style.maxWidth = originalStyles.maxWidth;
    element.style.position = originalStyles.position;
    element.style.overflow = originalStyles.overflow;
    
    if (window.innerWidth < 900) {
      element.style.marginLeft = '';
      element.style.marginRight = '';
    }
    
    setIsGeneratingPDF(false);
  }
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
  
  setIsSaving(true);

  const items = Object.entries(gardenData)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => ({ plantId: id, quantity: qty }));

  if (items.length === 0) {
    toast.error("Please add at least one plant!");
    return;
  }

  // MATCH THE NAMES HERE TO THE BACKEND
  const gardenPayload = {
    userId: user.uid,
    userEmail: user.email,
    items: items, // <--- Use 'items', not 'plants'
    totalEstimatedSavings: totalSavings, // <--- Match the backend name
    date: new Date()
  };

  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/gardens`, gardenPayload);
    fetchGardenHistory(); 
    toast.success('Garden plan saved successfully! 🌱');                   
  } catch (error) {
    console.error("Save Error:", error.response?.data);
    toast.error(error.response?.data?.message || "Failed to save.");
  }finally{
    setIsSaving(false);
  }
};

    const handleLoadGarden = (garden) => {
  const loadedData = {};
  
  // Convert the items array back into the format your state uses { plantId: quantity }
  garden.items.forEach(item => {
    if (item.plantId) {
      loadedData[item.plantId._id] = item.quantity;
    }
  });

  setGardenData(loadedData); // This fills the input boxes!
  window.scrollTo({ top: 0, behavior: 'smooth' });
  toast.success("Plan loaded! You can now edit and save it again.");
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
        toast.error('Plan removed from history', { icon: '🗑️' });
      } catch (error) {
        toast.error("Failed to delete.");
      }
    }
  };

  const clearAllPlans = async () => {
  if (window.confirm("Are you sure you want to delete ALL saved plans? This cannot be undone.")) {
    try {
      // We'll need to create this route in the backend next!
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/gardens`);
      fetchGardenHistory();
    } catch (error) {
      toast.error("Error clearing history");
    }
  }
  };

  const hasUnsavedChanges = Object.values(gardenData).some(val => val > 0);

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
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#2e7d32', width: '100%' }}>
      <Toolbar>
        {/* Left Side: Logo and Title */}
        <Sprout style={{ marginRight: '8px' }} size={24} />
    
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 800, 
          fontSize: { xs: '1rem', sm: '1.25rem' }, // Smaller font on mobile
          letterSpacing: '-0.5px'
        }}
      >
        {/* Shorten name on very small screens if needed, otherwise font size handles it */}
        {window.innerWidth < 400 ? "GARDEN PRO" : "GARDEN PLANNER PRO"}
      </Typography>

        {/* This Box pushes the next item to the far right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right Side: User Profile / Login */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!user ? (
            <Button 
              variant="contained" 
              onClick={signInWithGoogle} 
              sx={{ 
                bgcolor: '#1b5e20', // Darker green for contrast
                fontWeight: 700,
                borderRadius: 2,
                '&:hover': { bgcolor: '#145214' } 
              }}
            >
              Sign In
            </Button>
          ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
  <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
    <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>
      Welcome,
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 700, color: 'white' }}>
      {user.displayName.split(' ')[0]}
    </Typography>
  </Box>
  
  <Avatar 
    src={user.photoURL} 
    alt={user.displayName} 
    onClick={handleMenuOpen} // Open the menu instead of logging out
    sx={{ 
      width: { xs: 32, sm: 40 }, 
      height: { xs: 32, sm: 40 }, 
      border: '2px solid rgba(255,255,255,0.5)',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      '&:hover': { transform: 'scale(1.1)' }
    }} 
  />

  {/* The Dropdown Menu */}
  <Menu
    anchorEl={anchorEl}
    open={open}
    onClose={handleMenuClose}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    PaperProps={{
      sx: {
        mt: 1.5,
        borderRadius: 2,
        minWidth: 150,
        boxShadow: '0px 10px 25px rgba(0,0,0,0.1)',
      }
    }}
  >
    <Box sx={{ px: 2, py: 1, display: { xs: 'block', md: 'none' } }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {user.displayName}
      </Typography>
    </Box>
    <Divider sx={{ display: { xs: 'block', md: 'none' } }} />
    
    <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f', fontWeight: 600 }}>
      <ListItemIcon>
        <LogOut size={18} color="#d32f2f" />
      </ListItemIcon>
      LogOut
    </MenuItem>
  </Menu>
</Box>
            )}
          </Box>
        </Toolbar>
        <Toaster position="top-right" reverseOrder={false} />
      </AppBar>
      {/* ================ HEADER ================== */}

      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
          <CircularProgress sx={{ color: '#2e7d32' }} />
          <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
            Growing your garden...
          </Typography>
          
        </Box>
      ) :(
      <Container  maxWidth="xl" sx={{ mt: 6, pb: '200px' }}>
        
        {/* Header */}
        
        <Box  sx={{ mb: 6, textAlign: 'center' }}>

          {/* ========= */}

          {/* This header is hidden by default and only shows during PDF generation */}
          <Box 
            id="pdf-header"
            sx={{ 
              display: 'none', // Hidden on the website
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
    pb: 1, // Space for the scrollbar if it appears
    overflowX: 'auto', // Enable horizontal scrolling
    whiteSpace: 'nowrap', // Prevent buttons from jumping to a second line
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
              <Card sx={{ borderRadius: 4, height: '100%', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Box sx={{ 
            height: 160, 
            bgcolor: '#e8f5e9', // Light green "placeholder" while loading
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
              {/* CATEGORY CHIP */}
              <Box sx={{ 
                position: 'absolute', top: 10, right: 10,
                bgcolor: getSeason(plant.name).bg,
                color: getSeason(plant.name).color,
                px: 1.5, py: 0.5, borderRadius: 2,
                fontSize: '0.65rem', fontWeight: 800,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textTransform: 'uppercase'
              }}>
                {getSeason(plant.name).label}
              </Box>
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
              <Typography variant="body2" sx={{ color: '#ef6c00', fontWeight: 600, mt: 1,mb: 2 }}>
                ⏱️ Ready to eat by: {getHarvestDate(plant.daysToHarvest)}
              </Typography>

              <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 700, mb: 2 }}>
                Expected Harvest: {((gardenData[plant._id] || 0) * plant.yieldPerPlantLbs).toFixed(1)} lbs
              </Typography>

              <TextField
              data-html2canvas-ignore="true"
              label="Number of Plants"
              type="number"
              fullWidth
              variant="filled"
              value={gardenData[plant._id] || ''}
              onChange={(e) => handleQuantityChange(plant._id, e.target.value)}
              // This physically stops the "down" arrow at 0
              inputProps={{ min: 0 }} 
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
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  {/* NEW LOAD BUTTON */}
                  <Button 
                    onClick={() => handleLoadGarden(garden)} 
                    sx={{ color: '#2e7d32', minWidth: '40px' }}
                  >
                    <Clock size={20} /> {/* Or an Edit icon */}
                    
                  </Button>

                  <Button 
                    onClick={() => deleteGarden(garden._id)} 
                    color="error" 
                    sx={{ minWidth: '40px' }}
                  >
                    <Trash2 size={20} />
                  </Button>
                </Box>
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
      {/* --- MOBILE VIEW (Visible on xs and sm only) --- */}
    </>
  )}
</Box>

      </Container>)}

      {/* Floating Bar */}
<Paper 
  className="floating-bar-class"
  elevation={12} 
  sx={{ 
    position: 'fixed', 
    bottom: { xs: 10, md: 30 }, // Closer to bottom on mobile
    left: '50%', 
    transform: 'translateX(-50%)', 
    width: { xs: '92%', md: '800px' }, // Slightly wider on desktop
    p: { xs: 2, md: 3 }, // Less padding on mobile
    borderRadius: { xs: 4, md: 8 }, 
    display: 'flex', 
    flexDirection: { xs: 'column', md: 'row' }, // Stack vertically on mobile!
    gap: { xs: 2, md: 0 },
    justifyContent: 'space-between', 
    alignItems: 'center', 
    zIndex: 1000 
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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ p: 1, bgcolor: '#e8f5e9', borderRadius: 2, display: { xs: 'none', sm: 'flex' } }}>
        <Wallet size={20} color="#2e7d32" />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', fontSize: { xs: '0.6rem', md: '0.75rem' } }}>
          EST. SAVINGS
        </Typography>
        <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
          ${totalSavings.toFixed(2)}
        </Typography>
      </Box>
    </Box>

    {/* 2. TOTAL YIELD STAT */}
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1.5, 
      borderLeft: '2px solid #eee', 
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
          {totalYield.toFixed(1)} lbs
        </Typography>
      </Box>
    </Box>
  </Box>

  {/* BUTTONS SECTION */}
  <Box sx={{ 
    display: 'flex', 
    gap: 1, 
    width: { xs: '100%', md: 'auto' },
    flexDirection: { xs: 'row', sm: 'row' }, // Keep buttons in row but make them flexible
  }}>
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
        // Optional: Make it look slightly different if locked
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
      // disabled={!hasUnsavedChanges}
      sx={{ 
        flex: 1.5, // Save button is more important
        bgcolor: '#1b5e20', 
        borderRadius: 3,
        fontSize: { xs: '0.8rem', md: '1rem' }, 
        fontWeight: 800,
        '&:hover': { bgcolor: '#2e7d32' }
      }}
      // onClick={handleSaveGarden} 
  disabled={isSaving}
    >
      {isSaving ? "Saving..." : "Save Garden"}
    </Button>
  </Box>
</Paper>
    </Box>
  );
}

export default App;
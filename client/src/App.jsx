import Footer from './components/Footer';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import {  Routes, Route } from 'react-router-dom';
import MainGardenPlanner from './MainGardenPlanner'
import { Container, Typography, Grid,  TextField, Box,Paper, Button ,Skeleton} from '@mui/material';
import FloatingStatsBar from './components/FloatingStatsBar';
import ScrollToTop from './components/ScrolleToTop';



function App() {


  return (
    
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<MainGardenPlanner />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
        
        {/* <Footer /> */}
        {/* <FloatingStatsBar /> */}
      </Box>
    
  );
}

export default App;
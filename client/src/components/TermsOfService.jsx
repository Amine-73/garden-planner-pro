import { Container, Typography, Box,Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react'; // Make sure to import this
import { useNavigate } from 'react-router-dom';



function TermsOfService() {
    const navigate = useNavigate();
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
  <Button 
      startIcon={<ArrowLeft size={18} />}
      onClick={() => navigate('/')}
      sx={{ 
        mb: 4, 
        color: '#2e7d32', 
        fontWeight: 600,
        '&:hover': { backgroundColor: '#f1f8e9' }
      }}
    >
      Back to Planner
    </Button>
    <Typography variant="h3" gutterBottom sx={{ color: '#2e7d32', fontWeight: 700 }}>
      Terms of Service
    </Typography>
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">1. Usage of Calculations</Typography>
      <Typography paragraph>
        The yield and savings data provided by this tool are estimates based on average regional data. 
        Actual results may vary based on soil quality, weather, and gardening skill.
      </Typography>
      
      <Typography variant="h6" sx={{ mt: 3 }}>2. Account Responsibility</Typography>
      <Typography paragraph>
        You are responsible for maintaining the security of your account and your saved garden plans.
      </Typography>
    </Box>
  </Container>)
};

export default TermsOfService;
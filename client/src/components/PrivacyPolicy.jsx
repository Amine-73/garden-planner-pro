import { Container, Typography, Box ,Button} from '@mui/material';
import { ArrowLeft } from 'lucide-react'; // Make sure to import this
import { useNavigate } from 'react-router-dom';




function PrivacyPolicy () {
    const navigate = useNavigate();
  return(
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
      Privacy Policy
    </Typography>
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">1. Information We Collect</Typography>
      <Typography paragraph>
        We collect your email address via Firebase Authentication to save your garden plans. 
        We also use basic analytics to understand how users interact with our tool.
      </Typography>
      
      <Typography variant="h6" sx={{ mt: 3 }}>2. How We Use Data</Typography>
      <Typography paragraph>
        Your garden data is stored securely in our database so you can access it across devices. 
        We do not sell your personal data to third parties.
      </Typography>
    </Box>
  </Container>
  )
};

export default PrivacyPolicy;
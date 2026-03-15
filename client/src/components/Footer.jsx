import { Box, Typography, Link, Container } from '@mui/material';

const Footer = () => (
  <Box component="footer" sx={{ py: 4, mt: 'auto',mb: '80px', bgcolor: '#f1f8e9', borderTop: '1px solid #e0e0e0' }}>
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 2 }}>
        <Link href="/privacy" sx={{ color:'text.secondary',textDecoration:'none','&:hover':{ color: '#2e7d32' } }}>
          Privacy Policy
        </Link>
        <Link href="/terms" sx={{ color:'text.secondary', textDecoration:'none','&:hover': { color: '#2e7d32' } }}>
          Terms of Service
        </Link>
        <Link href="mailto:aminchana.business@gmail.com"
        target="_blank" 
  rel="noopener noreferrer"
   sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: '#2e7d32' } ,cursor: 'pointer'}}>
          Contact Support
        </Link>
      </Box>
      <Typography variant="body2" color="text.secondary" align="center">
        © {new Date().getFullYear()} My Garden Planner. All rights reserved.
      </Typography>
    </Container>
  </Box>
);

export default Footer;
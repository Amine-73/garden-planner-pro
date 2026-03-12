import { Grid, Box, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

// 1. Skeleton for the Plant Cards
export const SkeletonGrid = () => (
  <Grid container spacing={4} justifyContent="center">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
        <Paper sx={{ p: 0, borderRadius: 4, overflow: 'hidden' }}>
          {/* Image Area */}
          <Skeleton variant="rectangular" height={200} animation="wave" />
          <Box sx={{ p: 2 }}>
            {/* Title */}
            <Skeleton variant="text" width="60%" height={30} sx={{ mb: 1 }} />
            {/* Subtitle */}
            <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
            {/* Input box area */}
            <Skeleton variant="rounded" height={45} />
          </Box>
        </Paper>
      </Grid>
    ))}
  </Grid>
);

// 2. Skeleton for the History Table
export const SkeletonTable = () => (
  <TableContainer component={Paper} sx={{ borderRadius: 4, mt: 2 }}>
    <Table>
      <TableHead sx={{ bgcolor: '#f1f8e9' }}>
        <TableRow>
          {['Date', 'Yield', 'Savings', 'Actions'].map((h) => (
            <TableCell key={h}><Skeleton variant="text" width={50} /></TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {[1, 2, 3].map((row) => (
          <TableRow key={row}>
            <TableCell><Skeleton variant="text" width={80} /></TableCell>
            <TableCell><Skeleton variant="text" width={60} /></TableCell>
            <TableCell><Skeleton variant="text" width={100} /></TableCell>
            <TableCell><Skeleton variant="circular" width={30} height={30} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
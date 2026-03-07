import React from 'react';
import { Typography, Paper } from '@mui/material';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

const SavingsChart = ({ chartData }) => {
  // Return null or a placeholder if there's no data to prevent the chart from crashing
  if (!chartData || chartData.length === 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: 4, mb: 6, height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No savings data available yet.</Typography>
      </Paper>
    );
  }

  return (
    <>
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
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666', fontSize: 12 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666', fontSize: 12 }} 
              tickFormatter={(value) => `$${value}`} 
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
              }}
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
    </>
  );
};

export default SavingsChart;
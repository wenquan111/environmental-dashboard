// src/components/DashboardGrid.js
import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import ChartCard from './ChartCard';
import { chartOptions } from './ChartConfig';

const DashboardGrid = ({ transportDensity, mallDensity }) => {
  return (
    <Box sx={{ p: 1, height: '100%' }}>
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: '#1a3e72',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        Sydney Environmental Dashboard
      </Typography>

      <Grid container spacing={2} sx={{ height: 'calc(100% - 50px)' }}>
        <Grid item xs={12} sx={{ height: '50%', transition: 'all 0.3s ease' }}>
          <Box
            sx={{
              height: '100%',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
              }
            }}
          >
            <ChartCard
              title="Transport Density"
              data={transportDensity}
              chartType="bar"
              options={chartOptions.transportDensity}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ height: '50%', transition: 'all 0.3s ease' }}>
          <Box
            sx={{
              height: '100%',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
              }
            }}
          >
            <ChartCard
              title="Mall Density"
              data={mallDensity}
              chartType="bar"
              options={chartOptions.mallDensity}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardGrid;
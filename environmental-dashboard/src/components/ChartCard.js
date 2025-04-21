// src/components/ChartCard.js
import React from 'react';
import { Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';

const chartColors = {
  line: {
    borderColor: 'rgba(75, 192, 192, 1)',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    hoverBorderColor: 'rgba(75, 192, 192, 1)',
    hoverBackgroundColor: 'rgba(75, 192, 192, 0.4)',
  },
  bar: {
    borderColor: 'rgba(54, 162, 235, 1)',
    backgroundColor: 'rgba(54, 162, 235, 0.6)',
    hoverBorderColor: 'rgba(54, 162, 235, 1)',
    hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)',
  }
};

const ChartCard = ({ title, data, chartType, options }) => {
  const generateChartData = (data, label) => {
    const colors = chartColors[chartType];

    return {
      labels: data.map(item => item.time),
      datasets: [{
        label,
        data: data.map(item => item.value),
        borderColor: colors.borderColor,
        backgroundColor: colors.backgroundColor,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: colors.borderColor,
        pointHoverBackgroundColor: colors.hoverBackgroundColor,
        pointHoverBorderColor: colors.hoverBorderColor,
        fill: true,
        tension: 0.4,
      }]
    };
  };

  return (
    <Card sx={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)',
      border: 'none',
      overflow: 'hidden',
    }}>
      <CardContent sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
      }}>
        <Typography
          variant="h5"
          sx={{
            mb: 1,
            fontWeight: 600,
            color: '#2c3e50',
            textAlign: 'center',
          }}
        >
          {title}
        </Typography>

        {data.length > 0 ? (
          <Box sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0,
          }}>
            {chartType === 'line' ? (
              <Line
                data={generateChartData(data, title)}
                options={options}
                style={{ maxHeight: '100%' }}
              />
            ) : (
              <Bar
                data={generateChartData(data, title)}
                options={options}
                style={{ maxHeight: '100%' }}
              />
            )}
          </Box>
        ) : (
          <Box sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CircularProgress sx={{ color: chartColors[chartType].borderColor }} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  chartType: PropTypes.oneOf(['line', 'bar']).isRequired,
  options: PropTypes.object,
};

export default ChartCard;
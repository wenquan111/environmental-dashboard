// src/components/ChartConfig.js
const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: true, // Ensure the aspect ratio is maintained
  aspectRatio: 1, // Forces a square aspect ratio (1:1)
  scales: {
    x: {
      ticks: {
        autoSkip: true,
        maxTicksLimit: 5,
      },
      grid: {
        display: true,
      },
    },
    y: {
      ticks: {
        stepSize: 10,
      },
      grid: {
        display: true,
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
    tooltip: {
      enabled: true,
    },
    filler: {
      propagate: true,
    },
  },
};

export const chartOptions = {
  noisePollution: { ...baseChartOptions },
  transportDensity: { ...baseChartOptions },
  mallDensity: { 
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      tooltip: {
        ...baseChartOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            return `Mall Density: ${context.parsed.y}`;
          },
          afterLabel: function(context) {
            return 'Based on GeoJSON mall data';
          }
        }
      }
    }
  },
  congestionData: { ...baseChartOptions },
};
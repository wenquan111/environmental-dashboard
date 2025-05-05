// src/EnvironmentalDashboard.js
import React, { useEffect, useState, useCallback } from "react";
import { ThemeProvider, createTheme, CssBaseline, Grid, Paper, Box } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MapView from "./MapView";
import DashboardGrid from "./DashboardGrid";

// Register the necessary components for Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);


// changed style by wenquan
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a73e8',
      light: '#4285f4',
      dark: '#0d47a1',
    },
    secondary: {
      main: '#34a853',
      light: '#66bb6a',
      dark: '#2e7d32',
    },
    background: {
      default: '#f7f9fc',
      paper: '#ffffff',
    },
    text: {
      primary: '#3c4043',
      secondary: '#5f6368',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 500 },
    h2: { fontWeight: 500 },
    h3: { fontWeight: 500 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px 0 rgba(0,0,0,0.05)',
        },
        elevation1: {
          boxShadow: '0 2px 10px 0 rgba(0,0,0,0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

const dayMapping = {
  Mo: 1,
  Tu: 2,
  We: 3,
  Th: 4,
  Fr: 5,
  Sa: 6,
  Su: 0,
};

const default_open_hours = "Mo-We 10:00-18:00; Th 10:00-21:00; Fr 10:00-23:00; Sa 10:00-18:00; Su 11:00-17:00";

// Function to check mall opening status
const isMallOpen = (rawOpeningHours) => {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const timeBlocks = rawOpeningHours.split(";").map((block) => block.trim());

  for (const block of timeBlocks) {
    const [days, timeRange] = block.split(" ");
    const [startTime, endTime] = timeRange.split("-");

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    const dayRange = days.split("-");
    const startDay = dayMapping[dayRange[0]];
    const endDay = dayRange.length > 1 ? dayMapping[dayRange[1]] : startDay;

    const isInDayRange =
      (startDay <= endDay && currentDay >= startDay && currentDay <= endDay) ||
      (startDay > endDay && (currentDay >= startDay || currentDay <= endDay));

    if (isInDayRange && currentTime >= startMinutes && currentTime <= endMinutes) {
      return true;
    }
  }
  return false;
};

// Function to calculate mall density
const calculateMallDensity = (rawOpeningHours) => {
  if (isMallOpen(rawOpeningHours)) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    let baseDensity = 150;

    const isHoliday = [0, 6].includes(currentDay);
    if (isHoliday) {
      baseDensity *= 3;
    }

    const isWorkday = !isHoliday;
    if (isWorkday && currentHour >= 17 && currentHour <= 21) {
      baseDensity *= 1.5;
    }

    if (currentHour >= 12 && currentHour <= 14) {
      baseDensity *= 1.3;
    } else if (currentHour >= 18 && currentHour <= 20) {
      baseDensity *= 1.3;
    } else if (currentHour < 9 || currentHour > 21) {
      baseDensity /= 1.2;
    }

    const randomFactor = Math.random() * 20 - 10;
    baseDensity += randomFactor;

    return Math.floor(baseDensity);
  }

  return 0;
};

const EnvironmentalDashboard = () => {
  const [transportDensity, setTransportDensity] = useState([]);
  const [mallDensity, setMallDensity] = useState([]);
  const [selectedOpeningHours, setSelectedOpeningHours] = useState(default_open_hours);
  const [selectedTrafficStation, setSelectedTrafficStation] = useState(null);

  const fetchData = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();

    const currentHourKey = `hour_${currentHour.toString().padStart(2, "0")}`;

    const transportDensityValue = selectedTrafficStation
      ? Math.max(selectedTrafficStation[currentHourKey] + Math.random() * 20 - 10, 0) || 0 // Use the station data for the current hour with + or - 10
      : Math.floor(Math.random() * 100); // Default random value if no station is selected

    const mallDensityValue = calculateMallDensity(selectedOpeningHours);

    setTransportDensity((prevData) => [
      ...prevData.slice(-9),
      { time: new Date().toLocaleTimeString(), value: transportDensityValue },
    ]);
    setMallDensity((prevData) => [
      ...prevData.slice(-9),
      { time: new Date().toLocaleTimeString(), value: mallDensityValue },
    ]);
  }, [selectedOpeningHours, selectedTrafficStation]);

  // Fetch data every 5 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedOpeningHours, selectedTrafficStation, fetchData]);

  // Callback to handle popup 
  const handlePopupClick = (openingHours) => {
    setSelectedOpeningHours(openingHours || selectedOpeningHours);
  };

  const handleTrafficPopupClick = (station) => {
    setSelectedTrafficStation(station);
  };
// left side will be map and right side will be mall density and traffic data
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="bottom-right" theme="colored" />
      <Box
        sx={{
          minHeight: '95vh',
          backgroundColor: 'background.default',
          py: 1,
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{
            height: 'calc(95vh - 16px)',
          }}
        >
          <Grid item xs={12} md={6} sx={{ height: '100%' }}>
            <Paper
              elevation={2}
              sx={{
                height: '100%',
                overflow: 'hidden',
                borderRadius: 3,
                position: 'relative',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px 0 rgba(0,0,0,0.15)',
                },
              }}
            >
              <Box sx={{ height: '100%', p: 0 }}>
                <MapView
                  onPopupClick={handlePopupClick}
                  onTrafficPopupClick={handleTrafficPopupClick}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} sx={{ height: '100%' }}>
            <Paper
              elevation={2}
              sx={{
                height: '100%',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px 0 rgba(0,0,0,0.15)',
                },
              }}
            >
              <DashboardGrid
                transportDensity={transportDensity}
                mallDensity={mallDensity}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default EnvironmentalDashboard;

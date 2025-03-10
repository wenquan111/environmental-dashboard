import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Line, Pie } from "react-chartjs-2";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const EnvironmentalDashboard = () => {
  const [pollutionData, setPollutionData] = useState([45, 50, 55, 60]);
  const [predictedData, setPredictedData] = useState([]);
  const [pieData, setPieData] = useState([30, 25, 20, 25]);
  const [heatmapPoints, setHeatmapPoints] = useState([]);

  const handleMapClick = (e) => {
    const newPollutionData = pollutionData.map(() => Math.random() * 50 + 50);
    setPollutionData(newPollutionData);

    const newPieData = [
      Math.random() * 40 + 20,
      Math.random() * 30 + 10,
      Math.random() * 25 + 10,
      Math.random() * 25 + 10,
    ];
    setPieData(newPieData);

    setHeatmapPoints([...heatmapPoints, [e.latlng.lat, e.latlng.lng]]);
    toast.success("Pollution data updated!");
  };

  function MapClickHandler() {
    useMapEvents({ click: handleMapClick });
    return null;
  }

  // Simulate prediction for the next 5 years
  const simulatePrediction = () => {
    const lastValue = pollutionData[pollutionData.length - 1];
    const futureData = [];
    for (let i = 1; i <= 5; i++) {
      // Simple linear growth model for prediction
      futureData.push(lastValue + i * (Math.random() * 5 + 1)); // Random growth
    }
    setPredictedData(futureData);
  };

  useEffect(() => {
    simulatePrediction();
  }, [pollutionData]);

  const lineChartData = {
    labels: ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
    datasets: [
      {
        label: "Pollution Level (Historical)",
        data: pollutionData,
        borderColor: "#8884d8",
        fill: false,
      },
      {
        label: "Pollution Level (Predicted)",
        data: [...pollutionData.slice(-1), ...predictedData], // Start with the last known value
        borderColor: "#ff6384",
        fill: false,
        borderDash: [5, 5], // Dashed line for predictions
      },
    ],
  };

  const pieChartData = {
    labels: ["CO2", "NO2", "PM2.5", "O3"],
    datasets: [{
      label: "Pollution Distribution",
      data: pieData,
      backgroundColor: ["#ff6384", "#36a2eb", "#4bc0c0", "#ffce56"],
    }],
  };

  return (
    <div className="container mx-auto p-4">
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">Real-Time Environmental Map of Australia</Typography>
              <MapContainer center={[-25.2744, 133.7751]} zoom={4} style={{ height: "400px", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickHandler />
                {heatmapPoints.map((point, idx) => (
                  <Marker key={idx} position={point}>
                    <Popup>Pollution detected</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">AI Insights & Alerts</Typography>
              <div className="alert high">High: Air quality deteriorating in Zone A</div>
              <div className="alert medium">Medium: Water pollution detected near River B</div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">Historical Data Analysis</Typography>
              <Line data={lineChartData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">Pollution Distribution</Typography>
              <Pie data={pieChartData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default EnvironmentalDashboard;
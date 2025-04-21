// src/components/MapView.js
import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMapEvents } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Dialog, DialogTitle, DialogContent, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';

// solve leaflet icon's problem
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const customIcon = L.icon({
  iconUrl: "/shopping-mall.png",
  iconSize: [20, 20],
  iconAnchor: [15, 40],
  popupAnchor: [0, -40],
});


const customTrafficIcon = L.icon({
  iconUrl: "/traffic-light.png",
  iconSize: [20, 20],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25],
});

// view of sydney
const SYDNEY_CENTER = [-33.8688, 151.2093];
const ZOOM_LEVEL = 12;
const MIN_ZOOM = 10;
const MAX_ZOOM = 18;

// define the broder of sydney city
const SYDNEY_BOUNDS = [
  [-34.2, 150.8], // southwestren
  [-33.5, 151.5]  // northeastren
];

const generateHourlyTraffic = (station) => {
  const hours = Array.from({ length: 24 }, (_, i) => `hour_${String(i).padStart(2, "0")}`);
  return (
    <div>
      <strong>Hourly Traffic:</strong>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {hours.map((hour) => (
          <li key={hour}>
            <b>{hour.replace("hour_", "")}:00:</b> {station[hour] ?? "N/A"} vehicles
          </li>
        ))}
      </ul>
    </div>
  );
};

// details of charts
const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {
        color: 'rgba(0,0,0,0.05)',
      },
      ticks: {
        autoSkip: true,
        maxTicksLimit: 8,
        font: {
          size: 10,
        },
        color: '#666',
        callback: function (value, index, values) {
          // Highlight current time with bold text
          if (index === 12) {
            return '★ ' + this.getLabelForValue(value);
          }
          return this.getLabelForValue(value);
        }
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0,0,0,0.05)',
      },
      ticks: {
        font: {
          size: 10,
        },
        color: '#666',
      },
    },
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 12,
        font: {
          size: 11,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255,255,255,0.9)',
      titleColor: '#333',
      bodyColor: '#666',
      borderColor: 'rgba(0,0,0,0.1)',
      borderWidth: 1,
      padding: 10,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      cornerRadius: 4,
      displayColors: true,
      callbacks: {
        title: function (tooltipItems) {
          const item = tooltipItems[0];
          let title = item.label;

          // Highlight current time
          if (item.dataIndex === 12) {
            title += ' (Current Time)';
          }

          return title;
        }
      }
    },
  },
  animation: {
    duration: 1000,
    easing: 'easeOutQuart',
  },
};

// Generate mock data with focus on current time
const generateMockData = (base = 50, variance = 20, colors = { main: 'rgb(75, 192, 192)', bg: 'rgba(75, 192, 192, 0.2)' }, isBar = false) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  // Generate time labels focusing on current time (last 12 hours + next 12 hours)
  const hours = [];
  const data = [];

  for (let i = -12; i <= 12; i++) {
    const time = new Date(now);
    time.setHours(currentHour + i);

    // Format time label
    let timeLabel = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Highlight current time
    const isCurrent = i === 0;

    hours.push(timeLabel);

    // Generate data value with more realistic patterns
    let value;
    if (i === 0) {
      // Current hour - use exact base value with minor variation
      value = base + Math.floor(Math.random() * 5 - 2);
    } else {
      // Past and future hours - use gradually changing values
      const distanceFromNow = Math.abs(i);
      const varianceFactor = Math.min(1, distanceFromNow / 6);
      value = base + Math.floor(Math.random() * variance * 2 * varianceFactor - variance * varianceFactor);
    }

    data.push(value);
  }

  const dataset = {
    label: 'Value',
    data: data,
    borderColor: colors.main,
    backgroundColor: colors.bg,
    borderWidth: 2,
    tension: 0.4,
  };

  // Only add point styling for bar charts, remove points for line charts
  if (isBar) {
    dataset.pointRadius = 3;
    dataset.pointBackgroundColor = colors.main;
    dataset.pointBorderColor = data.map((_, index) => index === 12 ? '#ff0000' : colors.main);
    dataset.pointBorderWidth = data.map((_, index) => index === 12 ? 2 : 1);
    dataset.pointRadius = data.map((_, index) => index === 12 ? 5 : 3);
  } else {
    // For line charts, hide all points
    dataset.pointRadius = 0;
  }

  return {
    labels: hours,
    datasets: [dataset],
  };
};

// Generate specific data based on location
const generateDataForLocation = (lat, lon) => {
  // Random but seemingly regular data
  const baseCongestion = Math.abs(lat * 10 + lon) % 50 + 30;
  const baseMallDensity = Math.abs(lat * 5 + lon * 2) % 70 + 20;
  const baseAirQuality = Math.abs(lat * 3 + lon * 4) % 40 + 60;

  return {
    trafficCongestion: generateMockData(baseCongestion, 15, {
      main: 'rgb(229, 57, 53)',
      bg: 'rgba(229, 57, 53, 0.15)'
    }, false), // Line chart with no points
    mallDensity: generateMockData(baseMallDensity, 25, {
      main: 'rgb(25, 118, 210)',
      bg: 'rgba(25, 118, 210, 0.15)'
    }, true), // Bar chart with points
    airQuality: generateMockData(baseAirQuality, 10, {
      main: 'rgb(67, 160, 71)',
      bg: 'rgba(67, 160, 71, 0.15)'
    }, false), // Line chart with no points
  };
};

// Map Click Event Handling Component
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      // only available in sydney
      const { lat, lng } = e.latlng;
      if (
        lat >= SYDNEY_BOUNDS[0][0] &&
        lat <= SYDNEY_BOUNDS[1][0] &&
        lng >= SYDNEY_BOUNDS[0][1] &&
        lng <= SYDNEY_BOUNDS[1][1]
      ) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

// data dialog when click on the map
const DataDialog = ({ open, onClose, position, data }) => {
  if (!open || !data || !position) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'linear-gradient(to right, #f8f9fa, #ffffff)',
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        background: 'linear-gradient(to right, #e3f2fd, #f5f8ff)',
        py: 2
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1565c0' }}>
            Location Data ({position.lat.toFixed(4)}, {position.lng.toFixed(4)})
          </Typography>
          <Button
            onClick={onClose}
            sx={{
              minWidth: '36px',
              height: '36px',
              borderRadius: '18px',
              p: 0,
              color: '#5f6368',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.05)',
              }
            }}
          >
            X
          </Button>
        </div>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center', fontWeight: 500, color: '#555' }}>
          Data generated at: {new Date().toLocaleTimeString()}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
              },
              overflow: 'hidden',
            }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{
                  fontWeight: 600,
                  color: '#e53935',
                  textAlign: 'center',
                  borderBottom: '2px solid rgba(229, 57, 53, 0.3)',
                  pb: 1
                }}>
                  Traffic Congestion
                </Typography>
                <div style={{ height: 240 }}>
                  <Line data={data.trafficCongestion} options={baseChartOptions} />
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
              },
              overflow: 'hidden',
            }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{
                  fontWeight: 600,
                  color: '#1976d2',
                  textAlign: 'center',
                  borderBottom: '2px solid rgba(25, 118, 210, 0.3)',
                  pb: 1
                }}>
                  Mall Density
                </Typography>
                <div style={{ height: 240 }}>
                  <Bar data={data.mallDensity} options={baseChartOptions} />
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
              },
              overflow: 'hidden',
            }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{
                  fontWeight: 600,
                  color: '#43a047',
                  textAlign: 'center',
                  borderBottom: '2px solid rgba(67, 160, 71, 0.3)',
                  pb: 1
                }}>
                  Air Quality
                </Typography>
                <div style={{ height: 240 }}>
                  <Line data={data.airQuality} options={baseChartOptions} />
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

const MapView = ({ onPopupClick, onTrafficPopupClick }) => {
  const [geoJsonData, setGeoJsonData] = useState(null); // Mall data
  const [trafficData, setTrafficData] = useState([]); // Traffic data

  // Data Visualisation Dialogue Box Status
  const [dataDialog, setDataDialog] = useState({
    open: false,
    position: null,
    data: null
  });

  useEffect(() => {
    fetch('/data/mall density.geojson')
      .then((response) => response.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error('Error loading GeoJSON data:', err));
  }, []);

  useEffect(() => {
    fetch("/data/traffic_all.json")
      .then((response) => response.json())
      .then((data) => {
        // Remove duplicates based on station_id
        const uniqueStations = Array.from(
          new Map(data.rows.map((station) => [station.station_id, station])).values()
        );
        setTrafficData(uniqueStations);
      })
      .catch((err) => console.error("Error loading traffic data:", err));
  }, []);

  // Stricter filtering of Sydney city data
  const filterSydneyFeatures = (feature) => {
    if (!feature.geometry || !feature.geometry.coordinates) return false;

    const [lon, lat] = feature.geometry.coordinates;

    return (
      lat >= SYDNEY_BOUNDS[0][0] &&
      lat <= SYDNEY_BOUNDS[1][0] &&
      lon >= SYDNEY_BOUNDS[0][1] &&
      lon <= SYDNEY_BOUNDS[1][1]
    );
  };

  // Equally more stringent filtering of traffic stops
  const filterSydneyTraffic = (station) => {
    if (!station.wgs84_latitude || !station.wgs84_longitude) return false;

    return (
      station.wgs84_latitude >= SYDNEY_BOUNDS[0][0] &&
      station.wgs84_latitude <= SYDNEY_BOUNDS[1][0] &&
      station.wgs84_longitude >= SYDNEY_BOUNDS[0][1] &&
      station.wgs84_longitude <= SYDNEY_BOUNDS[1][1]
    );
  };

  // handle the click
  const handleMapClick = useCallback((position) => {
    // generate Data For Location
    const { lat, lng } = position;
    const locationData = generateDataForLocation(lat, lng);

    setDataDialog({
      open: true,
      position: { lat, lng },
      data: locationData
    });
  }, []);

  // close data dialog
  const handleCloseDialog = () => {
    setDataDialog(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={SYDNEY_CENTER}
        zoom={ZOOM_LEVEL}
        style={{ height: '100%', width: '100%' }}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        zoomControl={false}
        maxBounds={SYDNEY_BOUNDS} // Add Maximum Boundary Limits
        maxBoundsViscosity={0.8} // Set Boundary Drag Resistance
      >
        <ZoomControl position="topright" />

        {/* add map clicker */}
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Use brighter coloured map tile sources */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={MAX_ZOOM}
        />

        {/* Mall Marker */}
        {geoJsonData &&
          geoJsonData.features
            .filter(filterSydneyFeatures)
            .map((feature) => {
              const { geometry, properties } = feature;
              const { coordinates } = geometry;
              const [lon, lat] = coordinates;

              return (
                <Marker key={feature.id} position={[lat, lon]} icon={customIcon}>
                  <Popup>
                    <strong>{properties.name || 'Unnamed Mall'}</strong>
                    <br />
                    {properties.operator && <p><b>Operator:</b> {properties.operator}</p>}
                    {properties['addr:street'] && properties['addr:housenumber'] && (
                      <p><b>Address:</b> {properties['addr:housenumber']} {properties['addr:street']}</p>
                    )}
                    {properties['addr:postcode'] && <p><b>Postcode:</b> {properties['addr:postcode']}</p>}
                    {properties.opening_hours && <p><b>Opening Hours:</b> {properties.opening_hours || "Data Not Available"}</p>}
                    {<button
                      onClick={() => onPopupClick(properties.opening_hours || '')}
                      style={{
                        marginTop: "10px",
                        padding: "5px 10px",
                        backgroundColor: "#36a2eb",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Check Mall Density
                    </button>
                    }
                    {properties.website && (
                      <p>
                        <b>Website:</b>{' '}
                        <a href={properties.website} target="_blank" rel="noopener noreferrer">
                          Visit Website
                        </a>
                      </p>
                    )}
                  </Popup>
                </Marker>
              );
            })}

        {/* Traffic markers */}
        {trafficData
          .filter(filterSydneyTraffic)
          .map((station) => {
            if (station.wgs84_latitude && station.wgs84_longitude) {
              return (
                <Marker
                  key={station.station_id}
                  position={[station.wgs84_latitude, station.wgs84_longitude]}
                  icon={customTrafficIcon}
                >
                  <Popup>
                    <strong>{station.name || "Unnamed Station"}</strong>
                    <br />
                    <p><b>Road:</b> {station.road_name || "Unknown"}</p>
                    <p><b>Daily Traffic:</b> {station.daily_total || "N/A"} vehicles</p>
                    {station.intersection && <p><b>Intersection:</b> {station.intersection}</p>}
                    {generateHourlyTraffic(station)}
                    <button
                      onClick={() => onTrafficPopupClick(station)}
                      style={{
                        marginTop: "10px",
                        padding: "5px 10px",
                        backgroundColor: "#36a2eb",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Check Traffic Density
                    </button>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
      </MapContainer>

      {/* use the dialog */}
      <DataDialog
        open={dataDialog.open}
        onClose={handleCloseDialog}
        position={dataDialog.position}
        data={dataDialog.data}
      />
    </div>
  );
};

export default MapView;
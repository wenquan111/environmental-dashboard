// src/App.js
import React from "react";
import EnvironmentalDashboard from "./components/EnvironmentalDashboard"; // Ensure the path is correct
import { CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <div style={{ textAlign: "center" }}>
      <CssBaseline />
      <ToastContainer />
      <EnvironmentalDashboard />
    </div>
  );
}

export default App;
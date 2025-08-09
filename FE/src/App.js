// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Container, Box, CssBaseline } from "@mui/material";

// Import các component layout và trang
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // Giả sử bạn đã tạo file này
import PrivateRoute from "./components/PrivateRoute";

import JobList from "./pages/JobList";
import JobDetail from "./pages/JobDetail";
import Profile from "./pages/Profile";
import MyApplications from "./pages/MyApplications";
import FavoriteJobs from "./pages/FavoriteJobs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployerRoute from "./components/EmployerRoute";
import EmployerDashboard from "./pages/EmployerDashboard";
import JobApplicants from "./pages/JobApplicants";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JobForm from "./pages/JobForm";

function App() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: {
          xs: '#e3f2fd',
          md: 'linear-gradient(90deg, #e3f2fd 60%, #fff 100%)',
        },
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <CssBaseline />
      {/* Ảnh trang trí hai bên */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 120,
        height: '100vh',
        background: 'url(/images/side-bg-left.png) no-repeat left top',
        backgroundSize: 'cover',
        zIndex: 0,
        display: { xs: 'none', md: 'block' }
      }} />
      <Box sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 120,
        height: '100vh',
        background: 'url(/images/side-bg-right.png) no-repeat right top',
        backgroundSize: 'cover',
        zIndex: 0,
        display: { xs: 'none', md: 'block' }
      }} />
      <div className="App" style={{ zIndex: 2, position: 'relative' }}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
      <Navbar />
      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1, zIndex: 2, position: 'relative' }}>
        <Routes>
          <Route path="/" element={
            <>
              <JobList />
            </>
          } />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/employer/dashboard" element={<EmployerRoute><EmployerDashboard /></EmployerRoute>} />
          <Route path="/employer/jobs/:jobId/applicants" element={<EmployerRoute><JobApplicants /></EmployerRoute>} />
          <Route path="/employer/jobs/new" element={<EmployerRoute><JobForm /></EmployerRoute>} />
          <Route path="/employer/jobs/:jobId/edit" element={<EmployerRoute><JobForm /></EmployerRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/my-applications" element={<PrivateRoute><MyApplications /></PrivateRoute>} />
          <Route path="/favorites" element={<PrivateRoute><FavoriteJobs /></PrivateRoute>} />
        </Routes>
      </Container>
      <Footer />
    </Box>
  );
}

// Nhớ bọc App trong Router và AuthProvider ở file index.js
export default App;

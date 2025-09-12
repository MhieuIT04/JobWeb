// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import "./index.css";

// Import các component layout và trang
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-100 to-white relative overflow-x-hidden">
      {/* Ảnh trang trí hai bên */}
      <div className="hidden md:block fixed top-0 left-0 w-[120px] h-full bg-left-top bg-cover z-0" style={{ backgroundImage: "url(/images/side-bg-left.png)" }} />
      <div className="hidden md:block fixed top-0 right-0 w-[120px] h-full bg-right-top bg-cover z-0" style={{ backgroundImage: "url(/images/side-bg-right.png)" }} />
      <div className="App relative z-10">
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
      <main className="flex-grow container mx-auto mt-8 mb-8 px-4 z-10 relative">
        <Routes>
          <Route path="/" element={<JobList />} />
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
      </main>
      <Footer />
    </div>
  );
}

// Nhớ bọc App trong Router và AuthProvider ở file index.js
export default App;

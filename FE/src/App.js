// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import "./index.css"; // Đảm bảo bạn đã import file CSS của Tailwind

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import các component
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import EmployerRoute from "./components/EmployerRoute";
// ... import tất cả các trang ...
import JobList from "./pages/JobList";
import JobDetail from "./pages/JobDetail";
import Profile from "./pages/Profile";
import MyApplications from "./pages/MyApplications";
import FavoriteJobs from "./pages/FavoriteJobs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployerDashboard from "./pages/EmployerDashboard";
import JobApplicants from "./pages/JobApplicants";
import JobForm from "./pages/JobForm";

function App() {
  return (
    // Container chính với ảnh nền trang trí
    <div className="relative min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Ảnh trang trí - z-index thấp nhất */}
      <div className="hidden md:block fixed top-0 left-0 w-[120px] h-full bg-left-top bg-cover z-0" style={{ backgroundImage: "url(/images/side-bg-left.png)" }} />
      <div className="hidden md:block fixed top-0 right-0 w-[120px] h-full bg-right-top bg-cover z-0" style={{ backgroundImage: "url(/images/side-bg-right.png)" }} />

      {/* Toast Container đặt ở cấp cao nhất */}
      <ToastContainer position="bottom-right" autoClose={5000} theme="colored" />

      {/* Container cho nội dung chính, có z-index cao hơn */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto mt-8 mb-8 px-4">
          <Routes>
            {/* Tất cả các Route của bạn */}
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
    </div>
  );
}

export default App;
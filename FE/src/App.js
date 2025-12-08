// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import "./index.css"; // Đảm bảo bạn đã import file CSS của Tailwind

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import các component
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import EmployerRoute from "./components/EmployerRoute";

// Import các trang
import HomePage from "./pages/HomePage";
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
import EmployerAnalytics from "./pages/EmployerAnalytics";
import CVMatch from "./pages/CVMatch";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Messages from "./pages/Messages";
import CandidateDashboard from "./pages/CandidateDashboard";

function App() {
  return (
    // Container chính với ảnh nền trang trí
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
      {/* Ảnh trang trí - z-index thấp nhất */}
      <div className="hidden md:block fixed top-0 left-0 w-[120px] h-full bg-left-top bg-cover z-0 dark:opacity-20" style={{ backgroundImage: "url(/images/side-bg-left.png)" }} />
      <div className="hidden md:block fixed top-0 right-0 w-[120px] h-full bg-right-top bg-cover z-0 dark:opacity-20" style={{ backgroundImage: "url(/images/side-bg-right.png)" }} />

      {/* Toast Container đặt ở cấp cao nhất */}
      <ToastContainer position="bottom-right" autoClose={5000} theme="colored" />

      {/* Container cho nội dung chính, có z-index cao hơn */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        {/* spacer to account for fixed navbar height */}
              <div className="h-16" aria-hidden="true" />
        <main className="flex-grow mt-8 mb-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/cv-match" element={<CVMatch />} />
            
            {/* Candidate Routes */}
            <Route path="/dashboard" element={<PrivateRoute><CandidateDashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/my-applications" element={<PrivateRoute><MyApplications /></PrivateRoute>} />
            <Route path="/favorites" element={<PrivateRoute><FavoriteJobs /></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
            
            {/* Employer Routes */}
            <Route path="/employer/dashboard" element={<EmployerRoute><EmployerDashboard /></EmployerRoute>} />
            <Route path="/employer/analytics" element={<EmployerRoute><EmployerAnalytics /></EmployerRoute>} />
            <Route path="/employer/jobs/:jobId/applicants" element={<EmployerRoute><JobApplicants /></EmployerRoute>} />
            <Route path="/employer/jobs/new" element={<EmployerRoute><JobForm /></EmployerRoute>} />
            <Route path="/employer/jobs/:jobId/edit" element={<EmployerRoute><JobForm /></EmployerRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
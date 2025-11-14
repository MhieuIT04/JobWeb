// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider
<<<<<<< HEAD
import { ThemeProvider } from './contexts/ThemeContext';
=======
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
<<<<<<< HEAD
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
=======
      <AuthProvider> 
        <App />
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals


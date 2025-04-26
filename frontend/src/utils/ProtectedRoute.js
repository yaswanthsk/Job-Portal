// src/utils/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token'); // Assuming you store it like this

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role; // Make sure your token includes 'role' field

    if (allowedRoles.includes(userRole)) {
      return children;
    } else {
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    console.error('Token decoding failed', error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;

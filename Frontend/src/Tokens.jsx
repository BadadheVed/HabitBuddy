import React from "react";
import { Navigate } from "react-router-dom";
const Tokens = ({ children }) => {
  const token = localStorage.getItem("token");

  // If token exists, render the children; otherwise, redirect to /login
  return token ? children : <Navigate to="/login" />;
};

export default Tokens;

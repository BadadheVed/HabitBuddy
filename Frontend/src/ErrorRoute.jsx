import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Bell,
  Target,
  Calendar,
  Clock,
  ChevronDown,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import jwtDecode from "jwt-decode";
const Error = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="p-4 bg-white shadow-lg">
        <div className="container mx-auto flex items-center gap-4">
          <Link to="/" className="text-blue-500 hover:text-blue-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <Target className="w-8 h-8 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-800">404 Not Found</h1>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-6xl font-bold text-gray-800 mb-4">404</h2>
          <p className="text-2xl text-gray-600 mb-8">Oops! Page not found</p>
          <p className="text-gray-500 mb-8">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <Target className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error;

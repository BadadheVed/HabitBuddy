"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Target,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from "lucide-react";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check system preference on component mount
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/User/resetPassword",
        {
          email,
          newPassword,
        }
      );

      if (response.data.message) {
        setSuccess(response.data.message);
        setEmail("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } flex flex-col transition-colors duration-300`}
    >
      <nav
        className={`p-4 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg transition-colors duration-300`}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className={`${
                isDarkMode
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-500 hover:text-blue-600"
              } transition-colors duration-300`}
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <Target
              className={`w-8 h-8 ${
                isDarkMode ? "text-indigo-400" : "text-indigo-600"
              } transition-colors duration-300`}
            />
            <h1
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              } transition-colors duration-300`}
            >
              Reset Password
            </h1>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${
              isDarkMode
                ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition-all duration-300`}
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className={`w-full max-w-md ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } rounded-lg shadow-xl p-8 transition-colors duration-300`}
        >
          <h2
            className={`text-2xl font-bold text-center mb-6 ${
              isDarkMode ? "text-white" : "text-gray-800"
            } transition-colors duration-300`}
          >
            Reset Your Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } mb-2 transition-colors duration-300`}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300`}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } mb-2 transition-colors duration-300`}
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-2 border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300`}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-400 hover:text-gray-600"
                  } transition-colors duration-300`}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } mb-2 transition-colors duration-300`}
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300`}
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            {error && (
              <div
                className={`p-3 ${
                  isDarkMode
                    ? "bg-red-900/30 border-red-800 text-red-300"
                    : "bg-red-100 border-red-400 text-red-700"
                } border rounded-lg transition-colors duration-300`}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className={`p-3 ${
                  isDarkMode
                    ? "bg-green-900/30 border-green-800 text-green-300"
                    : "bg-green-100 border-green-400 text-green-700"
                } border rounded-lg transition-colors duration-300`}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                loading
                  ? isDarkMode
                    ? "bg-blue-600/50 cursor-not-allowed"
                    : "bg-blue-400 cursor-not-allowed"
                  : isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } transition-colors duration-300`}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className={`text-sm ${
                  isDarkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-500 hover:text-blue-600"
                } transition-colors duration-300`}
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

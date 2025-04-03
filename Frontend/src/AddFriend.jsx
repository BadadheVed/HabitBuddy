import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Bell,
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Search,
  UserPlus,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { Link } from "react-router-dom";

function AddFriend() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userName =
        decoded.name || decoded.user?.name || decoded.username || "User";
      setName(userName);

      if (window.location.pathname !== `/dashboard/${userName}/add-friend`) {
        navigate(`/dashboard/${userName}/add-friend`);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/User/AddFriend", {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data);
      if (response.data.length === 0) {
        setError("No users found.");
      }
    } catch (err) {
      setError("Error fetching users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900" : "bg-gray-100"
      }`}
    >
      <nav className={`p-4 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity
              className={`h-6 w-6 ${darkMode ? "text-white" : "text-gray-800"}`}
            />
            <h1
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Dashboard
            </h1>
            <a
              href="/dashboard/:name"
              className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Go To Dashboard
            </a>
          </div>
          {/* <Link to="/dashboard/:name"> Go To Homepage</Link> */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
            >
              {darkMode ? (
                <Sun className="text-white" />
              ) : (
                <Moon className="text-gray-800" />
              )}
            </button>
            <button
              className={`p-2 rounded-full ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
            >
              <Bell className={darkMode ? "text-white" : "text-gray-800"} />
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Hi! {name}
              </span>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-8">
        <div className="flex flex-col items-center mb-8">
          <div
            className={`w-full max-w-2xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-xl shadow-lg p-6`}
          >
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search friends by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                onClick={searchUsers}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors duration-200"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddFriend;

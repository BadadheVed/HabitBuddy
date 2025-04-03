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
import { useNavigate, Link } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";

function AddFriend() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // Initialize Socket.IO
  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("friendRequest", (data) => {
      toast.success(`New friend request from ${data.senderName}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
      const name = decoded.name || "User";
      setUserName(name);
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
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/User/getUsers", {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data);
      if (response.data.length === 0) {
        setError("No users found.");
      }
    } catch (err) {
      setError("Error fetching users. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId, userName) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User not authenticated");
        return;
      }
      const response = await axios.post(
        "http://localhost:3000/User/AddFriend",
        { userId, userName }, // ✅ Sending both userId and userName
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Friend request sent to ${userName}!`);
    } catch (error) {
      console.error("Error sending friend request:", error);

      if (error.response) {
        toast.error(
          error.response.data.message || "Failed to send friend request."
        );
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900" : "bg-gray-100"
      }`}
    >
      <Toaster position="top-right" />
      <nav className={`p-4 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Activity
              className={`h-6 w-6 ${darkMode ? "text-white" : "text-gray-800"}`}
            />
            <h1
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Find Friends
            </h1>
            <Link
              to={`/dashboard/${userName}`}
              className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Go To Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>{formatDate(currentTime)}</span>
              <Clock className="w-5 h-5 ml-4" />
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>
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
                Hi! {userName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
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
                placeholder="Search friends by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className={`px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Search className="w-4 h-4" />
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
            {error && (
              <p
                className={`mt-4 text-center ${
                  darkMode ? "text-red-400" : "text-red-600"
                }`}
              >
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className={`flex items-center justify-between p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div>
                <h3
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {user.name}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  ID: {user._id}
                </p>
              </div>
              <button
                onClick={() => handleAddFriend(user._id, user.name)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-colors duration-200"
              >
                <UserPlus className="w-4 h-4" />
                Add Friend
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AddFriend;

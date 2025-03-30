import React, { useState, useEffect } from "react";
import {
  Sun as Run,
  Flame,
  UserPlus,
  Zap,
  UserCircle2,
  LineChart,
  Bell,
  LogOut,
  X,
  Moon,
  Sun,
  ArrowRight,
} from "lucide-react";
import jwtDecode from "jwt-decode";

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasNotification] = useState(true);
  const username = "John"; // This would come from your auth context

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if no token
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUsername(decoded.name || "User"); // Use "name" field from token, fallback to "User"
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token"); // Remove invalid token
      navigate("/login");
    }
  }, [navigate]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const topTiles = [
    { icon: Run, title: "Add Activity", color: "blue" },
    { icon: Flame, title: "My Activities", color: "orange" },
    { icon: UserPlus, title: "Add a Friend", color: "teal" },
  ];

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "dark bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-md z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Dashboard
              </h1>
              <span
                className={`text-lg ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Hi! {username}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                }`}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-white" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <div className="relative">
                <Bell
                  className={`w-6 h-6 ${
                    darkMode ? "text-white" : "text-gray-700"
                  }`}
                />
                {hasNotification && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </div>
              <UserCircle2
                className={`w-6 h-6 ${
                  darkMode ? "text-white" : "text-gray-700"
                }`}
              />
              <button
                className={`flex items-center px-3 py-2 rounded-md ${
                  darkMode
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-500 hover:bg-red-600"
                } text-white`}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Welcome Message */}
      {showWelcome && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div
            className={`${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            } rounded-lg shadow-lg p-4 flex items-center`}
          >
            <span className="text-lg">Hi, {username}! 👋</span>
            <button
              onClick={() => setShowWelcome(false)}
              className="ml-4 p-1 hover:bg-gray-200 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Row */}
            {topTiles.map((tile, index) => (
              <div
                key={index}
                className={`
                  aspect-square
                  ${
                    darkMode
                      ? "bg-gray-800/80 hover:bg-gray-700/90"
                      : "bg-white/80 hover:bg-white/90"
                  }
                  rounded-xl shadow-lg backdrop-blur-sm
                  transition-all duration-300 ease-in-out
                  transform hover:scale-105 cursor-pointer
                  group
                `}
              >
                <div className="h-full flex flex-col items-center justify-center">
                  <tile.icon
                    className={`w-12 h-12 ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    } transition-colors duration-300 hover:text-${tile.color}-${
                      darkMode ? "400" : "600"
                    }`}
                  />
                  <div className="flex items-center space-x-2 mt-4 transition-transform duration-300 transform group-hover:translate-x-2">
                    <h3
                      className={`text-lg font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      } 
                      transition-all duration-300 group-hover:text-xl`}
                    >
                      {tile.title}
                    </h3>
                    <ArrowRight
                      className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom Row */}
            <div
              className={`
              aspect-square
              ${
                darkMode
                  ? "bg-gray-800/80 hover:bg-gray-700/90"
                  : "bg-white/80 hover:bg-white/90"
              }
              rounded-xl shadow-lg backdrop-blur-sm
              transition-all duration-300 ease-in-out
              transform hover:scale-105 cursor-pointer
              group
            `}
            >
              <div className="h-full flex flex-col items-center justify-center">
                <Zap
                  className={`w-12 h-12 ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  } transition-colors duration-300 hover:text-lime-${
                    darkMode ? "400" : "600"
                  }`}
                />
                <div className="flex items-center space-x-2 mt-4 transition-transform duration-300 transform group-hover:translate-x-2">
                  <h3
                    className={`text-lg font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    } 
                    transition-all duration-300 group-hover:text-xl`}
                  >
                    Challenge a Friend
                  </h3>
                  <ArrowRight
                    className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Heatmap Tile - Double Width */}
            <div
              className={`
              md:col-span-2
              aspect-square md:aspect-[2/1]
              ${
                darkMode
                  ? "bg-gray-800/80 hover:bg-gray-700/90"
                  : "bg-white/80 hover:bg-white/90"
              }
              rounded-xl shadow-lg backdrop-blur-sm
              transition-all duration-300 ease-in-out
              transform hover:scale-105 cursor-pointer
              group
            `}
            >
              <div className="h-full flex flex-col items-center justify-center">
                <LineChart
                  className={`w-12 h-12 ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  } transition-colors duration-300 hover:text-orange-${
                    darkMode ? "400" : "600"
                  }`}
                />
                <div className="flex items-center space-x-2 mt-4 transition-transform duration-300 transform group-hover:translate-x-2">
                  <h3
                    className={`text-lg font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    } 
                    transition-all duration-300 group-hover:text-xl`}
                  >
                    See Heatmap
                  </h3>
                  <ArrowRight
                    className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

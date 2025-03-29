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

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasNotification] = useState(true);
  const username = "John";

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
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
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-white" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-700 dark:text-white" />
                {hasNotification && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </div>
              <UserCircle2 className="w-6 h-6 text-gray-700 dark:text-white" />
              <button className="flex items-center px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showWelcome && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white rounded-lg shadow-lg p-4 flex items-center">
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

      <main className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {topTiles.map((tile, index) => (
            <div
              key={index}
              className="aspect-square bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-700/90 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-105 cursor-pointer group"
            >
              <div className="h-full flex flex-col items-center justify-center">
                <tile.icon className="w-12 h-12 text-gray-700 dark:text-gray-200" />
                <div className="flex items-center space-x-2 mt-4 group-hover:translate-x-2 transition-transform">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-xl transition-all">
                    {tile.title}
                  </h3>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

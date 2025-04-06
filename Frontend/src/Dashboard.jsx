"use client";

import { useState, useEffect } from "react";
import {
  PlayIcon as Run,
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
  Users,
  Target,
} from "lucide-react";
import "./index.css";
import jwtDecode from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import { LineChartIcon } from "lucide-react";
import axios from "axios";

const Dashboard = () => {
  // const [darkMode, setDarkMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasNotification, setHasNotification] = useState(false);
  const [name, setName] = useState("User");
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem("darkmode");
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkmode", JSON.stringify(newMode));
      return newMode;
    });
  };

  useEffect(() => {
    const currmode = localStorage.getItem("darkmode");
    if (currmode !== null) {
      setDarkMode(JSON.parse(currmode));
    }
  }, []);

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if no token
      return;
    }

    try {
      const decoded = jwtDecode(token);
      //  console.log("Decoded Token:", decoded);

      const userName =
        decoded.name || decoded.user?.name || decoded.username || "User";

      setName(userName);

      if (window.location.pathname !== `/dashboard/${userName}`) {
        navigate(`/dashboard/${userName}`);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch friend requests
      const friendReqRes = await axios.get(
        "http://localhost:3000/User/getRequest",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch challenges
      const challengeRes = await axios.get(
        "http://localhost:3000/User/getChallenges",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const hasFriendRequests =
        friendReqRes.data.friendRequests &&
        friendReqRes.data.friendRequests.length > 0;

      const hasChallenges =
        challengeRes.data.challenges && challengeRes.data.challenges.length > 0;

      setHasNotification(hasFriendRequests || hasChallenges);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 1000); // 1 second polling

    return () => clearInterval(interval);
  }, []);

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
              <Target
                className={`w-8 h-8 ${
                  darkMode ? "text-indigo-400" : "text-indigo-600"
                }`}
              />
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
                Hi! {name} 👋
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <label className="switch">
                <span className="sun">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g fill="#ffd43b">
                      <circle r={5} cy={12} cx={12} />
                      <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z" />
                    </g>
                  </svg>
                </span>
                <span className="moon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    <path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" />
                  </svg>
                </span>
                <input
                  type="checkbox"
                  className="input"
                  onChange={toggleDarkMode}
                />
                <span className="slider" />
              </label>
              <Link to="/dashboard/:name/notifications">
                <div className="relative">
                  <button
                    className={`p-2 rounded-full ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                    }`}
                  >
                    <Bell
                      className={darkMode ? "text-white" : "text-gray-800"}
                    />
                  </button>
                  {hasNotification && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </div>
              </Link>
              <Link to={"/dashboard/:name/profile"}>
                <div className="relative">
                  <button
                    className={`p-2 rounded-full ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                    }`}
                  >
                    <UserCircle2
                      className={`w-6 h-6 ${
                        darkMode ? "text-white" : "text-gray-700"
                      }`}
                    />
                  </button>
                </div>
              </Link>
              <button className="Btn" onClick={handleLogout}>
                <div className="sign">
                  <svg viewBox="0 0 512 512">
                    <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                  </svg>
                </div>

                <div className="text">Logout</div>
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
            <span className="text-lg">Hi, {name}! 👋</span>
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
            {/* Top Row - Hardcoded Tiles */}
            {/* Tile 1 - Add Activity */}
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
              <Link to="/dashboard/:name/add">
                <div className="h-full flex flex-col items-center justify-center">
                  <LineChartIcon
                    className={`w-12 h-12 ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    } transition-colors duration-300 hover:text-blue-${
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
                      Add Activity
                    </h3>
                    <ArrowRight
                      className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    />
                  </div>
                </div>
              </Link>
            </div>

            {/* Tile 2 - My Activities */}
            <Link to="/dashboard/:name/activities">
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
                  <Flame
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
                      My Activities
                    </h3>
                    <ArrowRight
                      className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </Link>

            {/* Tile 3 - Add a Friend */}
            <Link to="/dashboard/:name/add-friend">
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
                  <Users
                    className={`w-12 h-12 ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    } transition-colors duration-300 hover:text-teal-${
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
                      Manage Friends
                    </h3>
                    <ArrowRight
                      className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </Link>

            {/* Bottom Row */}
            <Link to="/dashboard/:name/challenge">
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
            </Link>

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
              <Link to="/dashboard/:name/heatmap">
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
                </div>{" "}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Bell,
  Activity,
  CheckCircle2,
  ArrowLeft,
  Check,
  Calendar,
  Clock,
  ChevronDown,
  Target,
} from "lucide-react";
import confetti from "canvas-confetti";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./index.css";
function MyActivities() {
  const [darkMode, setDarkMode] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeFilter, setTimeFilter] = useState("today");
  const [showTimeFilterDropdown, setShowTimeFilterDropdown] = useState(false);
  const [activities, setActivities] = useState([]);
  const [name, setName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const [hasNotification, setHasNotification] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming JWT token is stored in localStorage
        const response = await axios.get(
          "http://localhost:3000/User/activities",
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setActivities(response.data);
        // Set the fetched activities
      } catch (error) {
        console.error("Error fetching activities", error);
      }
    };

    fetchActivities();
  }, []);
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const decoded = jwtDecode(token);
        const userName =
          decoded.name || decoded.user?.name || decoded.username || "User";
        setName(userName);

        const expectedPath = `/dashboard/${userName}/activities`;
        if (window.location.pathname !== expectedPath) {
          navigate(expectedPath);
        }
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target.closest(".time-filter-dropdown")) {
        setShowTimeFilterDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const getCurrentDayName = () => {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
      currentTime.getDay()
    ];
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

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000,
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      origin: { x: 0.2 },
    });

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      origin: { x: 0.8 },
    });
  };

  const handleActivityComplete = async (id) => {
    try {
      const activityToUpdate = activities.find(
        (activity) => activity._id === id
      );
      console.log("Clicked Activity ID:", id);
      console.log("All Activities:", activities);
      if (!activityToUpdate.completed) {
        triggerConfetti();
        activityToUpdate.completed = true;
        activityToUpdate.lastCompletedDate = new Date().toISOString();

        // Update on the backend
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:3000/User/activities/${id}`,
          {
            completed: true,
            lastCompletedDate: activityToUpdate.lastCompletedDate,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        // Update state locally
        setActivities((prev) =>
          prev.map((activity) =>
            activity._id === id
              ? {
                  ...activity,
                  completed: true,
                  lastCompletedDate: activityToUpdate.lastCompletedDate,
                }
              : activity
          )
        );
      }
    } catch (error) {
      console.error("Error marking activity as completed", error);
    }
  };

  const isActivityDue = (activity) => {
    const today = getCurrentDayName();
    return activity.frequency.includes(today);
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesCompletionStatus = activity.completed === showCompleted;
    const matchesTimeFilter =
      timeFilter === "today" ? isActivityDue(activity) : true;
    return matchesCompletionStatus && matchesTimeFilter;
  });

  const calculateProgress = (activities) => {
    if (activities.length === 0) return 0;

    const totalDueActivities = activities.filter((activity) =>
      isActivityDue(activity)
    );
    if (totalDueActivities.length === 0) return 0; // Avoid division by zero

    const completedCount = totalDueActivities.filter((a) => a.completed).length;
    return Math.round((completedCount / totalDueActivities.length) * 100);
  };
  const progress = calculateProgress(activities);
  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3000/User/getRequest",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (
        response.data.friendRequests &&
        response.data.friendRequests.length > 0
      ) {
        setHasNotification(true);
      } else {
        setHasNotification(false);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFriendRequests();
    }, 1000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Navbar */}
      <nav className={`p-4 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              to={`/dashboard/${name}`}
              className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <Target
                className={`w-8 h-8 ${
                  darkMode ? "text-indigo-400" : "text-indigo-600"
                }`}
              />
            </Link>
            <h1
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              My Activities
            </h1>
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
                onChange={() => setDarkMode(!darkMode)}
              />
              <span className="slider" />
            </label>

            <div className="flex items-center gap-2">
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
              <span
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Hi! {name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-8 relative min-h-[calc(100vh-80px)]">
        {/* Toggle Switch */}
        <div className="flex flex-col items-center mb-8">
          <div
            className={`relative w-80 h-12 rounded-full p-1 ${
              darkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <div
              className={`absolute inset-y-1 w-[9.5rem] rounded-full transition-all duration-300 transform ${
                showCompleted ? "translate-x-[9.75rem]" : "translate-x-0"
              } ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
            />
            <div className="relative flex h-full">
              <button
                onClick={() => setShowCompleted(false)}
                className={`flex-1 flex items-center justify-center gap-2 ${
                  !showCompleted
                    ? "text-blue-500 font-medium"
                    : darkMode
                    ? "text-gray-400"
                    : "text-gray-600"
                } transition-colors duration-300 z-10`}
              >
                <Activity className="w-4 h-4" />
                Activities
              </button>
              <button
                onClick={() => setShowCompleted(true)}
                className={`flex-1 flex items-center justify-center gap-2 ${
                  showCompleted
                    ? "text-green-500 font-medium"
                    : darkMode
                    ? "text-gray-400"
                    : "text-gray-600"
                } transition-colors duration-300 z-10`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </button>
            </div>
          </div>
          {!showCompleted && (
            <p
              className={`mt-4 text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              You can see completed activities at{" "}
              <span className="font-medium">My Activities → Completed</span>
            </p>
          )}
        </div>

        {/* Activities List */}
        <div className="space-y-4 mb-40">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-center justify-between p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex-1">
                <h3
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {activity.name}
                </h3>
                <div className="flex gap-2 mt-2">
                  {activity.frequency.map((day) => {
                    const isToday = day === getCurrentDayName();
                    const isCompleted = activity.completed && isToday;
                    return (
                      <span
                        key={day}
                        className={`px-2 py-1 rounded-full text-sm ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isToday
                            ? "bg-blue-500 text-white"
                            : darkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              </div>
              {isActivityDue(activity) && !activity.completed && (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activity.completed}
                    onChange={() => handleActivityComplete(activity._id)}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                      activity.completed
                        ? "bg-green-500 border-green-500"
                        : darkMode
                        ? "border-gray-600"
                        : "border-gray-300"
                    }`}
                  >
                    {activity.completed && (
                      <Check className="w-5 h-5 text-white" />
                    )}
                  </div>
                </label>
              )}
            </div>
          ))}
        </div>

        {/* Progress Tracker */}
        <div className="fixed bottom-8 right-8">
          <div
            className={`w-48 h-48 ${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-lg shadow-lg p-4 flex flex-col items-center justify-center relative time-filter-dropdown`}
          >
            <div className="relative w-32 h-32">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={darkMode ? "#374151" : "#E5E7EB"}
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeDasharray={`${progress}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {progress}%
                </span>
                <button
                  onClick={() =>
                    setShowTimeFilterDropdown(!showTimeFilterDropdown)
                  }
                  className={`mt-2 flex items-center gap-1 text-sm font-medium ${
                    darkMode
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {timeFilter === "today" ? "Today" : "This Week"}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
            {showTimeFilterDropdown && (
              <div
                className={`absolute bottom-full mb-2 right-0 w-36 ${
                  darkMode ? "bg-gray-700" : "bg-white"
                } rounded-lg shadow-lg py-2 z-50`}
              >
                <button
                  onClick={() => {
                    setTimeFilter("today");
                    setShowTimeFilterDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                    timeFilter === "today"
                      ? "text-blue-500 font-medium"
                      : darkMode
                      ? "text-white hover:bg-gray-600"
                      : "text-gray-800"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    setTimeFilter("this-week");
                    setShowTimeFilterDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                    timeFilter === "this-week"
                      ? "text-blue-500 font-medium"
                      : darkMode
                      ? "text-white hover:bg-gray-600"
                      : "text-gray-800"
                  }`}
                >
                  This Week
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyActivities;

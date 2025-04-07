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
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import jwtDecode from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";

function HeatMap() {
  // const [darkMode, setDarkMode] = useState(
  //   localStorage.getItem("darkMode") === "true"
  // );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activityData, setActivityData] = useState([]);
  const [registrationYear, setRegistrationYear] = useState(
    new Date().getFullYear()
  );
  const [hasNotification, setHasNotification] = useState(false);
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
  const surl = import.meta.env.VITE_SURL;
  const burl = import.meta.env.VITE_BURL;

  useEffect(() => {
    const currmode = localStorage.getItem("darkmode");
    if (currmode !== null) {
      setDarkMode(JSON.parse(currmode));
    }
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
      setUserName(decoded.name || "User");
      setUserId(decoded.id || "");
      // Get registration date from token or user data
      const regDate = new Date(decoded.iat * 1000);
      setRegistrationYear(regDate.getFullYear());
      fetchActivityData(decoded.id, selectedYear);
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate, selectedYear]);

  const fetchActivityData = async (userId, year) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${burl}/User/activityHeatmap`, {
        params: { year },
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivityData(response.data.activities);
    } catch (error) {
      console.error("Error fetching activity data:", error);
      toast.error("Failed to fetch activity data");
    }
  };

  const getColorForCount = (count) => {
    if (count === 0) return darkMode ? "bg-gray-300" : "bg-gray-100";
    if (count === 1) return "bg-[#1F7D53]"; // Light green
    if (count >= 2 && count <= 3) return "bg-[#85A947]"; // Medium green
    return "bg-[#C2FFC7]"; // Bright green
  };

  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${burl}/User/getRequest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    }, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Generate GitHub-style contribution graph
  const generateGitHubStyleGraph = () => {
    const startDate = new Date(selectedYear, 0, 1); // January 1st of selected year
    const endDate = new Date(selectedYear, 11, 31); // December 31st of selected year

    // Calculate total days in the year
    const totalDays =
      Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    // Create array of all dates in the year
    const allDates = Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return date;
    });

    // Group dates by month for display
    const monthsData = {};
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    months.forEach((month) => {
      monthsData[month] = [];
    });

    allDates.forEach((date) => {
      const month = months[date.getMonth()];
      monthsData[month].push(date);
    });

    // Count total submissions
    const totalSubmissions = activityData.reduce(
      (sum, day) => sum + day.count,
      0
    );

    // Calculate total active days
    const activeDays = activityData.filter((day) => day.count > 0).length;

    // Calculate max streak (this is simplified - a real implementation would need to check consecutive days)
    let maxStreak = 0;
    let currentStreak = 0;
    let previousDate = null;

    activityData
      .filter((day) => day.count > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((day) => {
        const currentDate = new Date(day.date);

        if (previousDate) {
          const dayDiff = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
          if (dayDiff === 1) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }

        maxStreak = Math.max(maxStreak, currentStreak);
        previousDate = currentDate;
      });

    return (
      <div
        className={`p-6 rounded-xl ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <span
              className={`text-lg font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {totalSubmissions} activities in the past one year
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Total active days: {activeDays}
            </span>
            <span className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Max streak: {maxStreak}
            </span>
            <div className="relative inline-block">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className={`appearance-none px-4 py-2 pr-8 rounded-lg ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-gray-800 border-gray-200"
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value={selectedYear}>Current</option>
                {Array.from(
                  { length: new Date().getFullYear() - registrationYear + 1 },
                  (_, i) => new Date().getFullYear() - i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex">
            {months.map((month) => (
              <div key={month} className="flex flex-col mr-1">
                <div
                  className={`text-xs mb-1 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {month}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({
                    length: Math.ceil(monthsData[month].length / 7),
                  }).map((_, weekIndex) => (
                    <div
                      key={`${month}-week-${weekIndex}`}
                      className="flex flex-col gap-1"
                    >
                      {monthsData[month]
                        .slice(weekIndex * 7, (weekIndex + 1) * 7)
                        .map((date) => {
                          const dateStr = date.toISOString().split("T")[0];
                          const dayData = activityData.find(
                            (d) => d.date === dateStr
                          );
                          const count = dayData?.count || 0;

                          return (
                            <div
                              key={dateStr}
                              className={`w-3 h-3 rounded-sm ${getColorForCount(
                                count
                              )}`}
                              title={`${dateStr}: ${count} activities completed`}
                            />
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-sm ${
                darkMode ? "bg-gray-300" : "bg-gray-100"
              }`}
            />
            <span
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No activities
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#1F7D53]" />
            <span
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              1 activity
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#85A947]" />
            <span
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              2-3 activities
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#C2FFC7]" />
            <span
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              4+ activities
            </span>
          </div>
        </div>
      </div>
    );
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
            <Link
              to={`/dashboard/${userName}`}
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
              Activity Heatmap
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
                checked={darkMode}
                onChange={() => {
                  const newMode = !darkMode;
                  setDarkMode(newMode);
                  localStorage.setItem("darkMode", newMode);
                }}
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
                Hi! {userName}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {userName}'s Activity Heatmap
          </h1>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            ID: {userId}
          </p>
        </div>

        {generateGitHubStyleGraph()}
      </div>
    </div>
  );
}

export default HeatMap;

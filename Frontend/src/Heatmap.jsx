import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Bell,
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  ChevronDown,
  Target,
} from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import jwtDecode from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";

function HeatMap() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
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
      const response = await axios.get(
        `http://localhost:3000/User/activityHeatmap`,
        {
          params: { year },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setActivityData(response.data.activities);
    } catch (error) {
      console.error("Error fetching activity data:", error);
      toast.error("Failed to fetch activity data");
    }
  };

  const getColorForCount = (count) => {
    if (count === 0) return darkMode ? "bg-gray-800" : "bg-gray-100";
    if (count === 1) return "bg-[#1F7D53]";
    if (count >= 2 && count <= 4) return "bg-[#85A947]";
    return "bg-[#C2FFC7]";
  };
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
    }, 100); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const generateCalendar = () => {
    const today = new Date();
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

    // Generate array of days (1-31)
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
      <div className="relative">
        {/* Month headers */}
        <div className="grid grid-cols-12 gap-1 mb-2">
          {months.map((month) => (
            <div
              key={month}
              className={`text-center text-sm font-medium ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {month}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-rows-31 gap-1">
          {days.map((day) => (
            <div key={day} className="grid grid-cols-12 gap-1">
              {months.map((month, monthIndex) => {
                const date = new Date(selectedYear, monthIndex, day);
                const isValidDate = date.getDate() === day; // Check if day exists in month
                const isPastDate = date <= today;
                const isSelectedYearCurrent =
                  selectedYear === today.getFullYear();
                const shouldShow =
                  isValidDate && (!isSelectedYearCurrent || isPastDate);

                if (!isValidDate)
                  return <div key={`${month}-${day}`} className="w-4 h-4" />;

                if (!shouldShow) {
                  return (
                    <div
                      key={`${month}-${day}`}
                      className={`w-4 h-4 rounded-sm ${
                        darkMode ? "bg-gray-900" : "bg-gray-50"
                      }`}
                    />
                  );
                }

                const dateStr = date.toISOString().split("T")[0];
                const dayData = activityData.find((d) => d.date === dateStr);

                return (
                  <div
                    key={`${month}-${day}`}
                    className={`w-4 h-4 rounded-sm ${getColorForCount(
                      dayData?.count || 0
                    )}`}
                    title={`${dateStr}: ${
                      dayData?.count || 0
                    } activities completed`}
                  />
                );
              })}
            </div>
          ))}
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

  const availableYears = Array.from(
    { length: new Date().getFullYear() - registrationYear + 1 },
    (_, i) => new Date().getFullYear() - i
  );

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
          <h3
            className={`text-lg ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            ID: {userId}
          </h3>
        </div>

        <div className="mb-6">
          <div className="relative inline-block">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={`appearance-none px-4 py-2 pr-8 rounded-lg ${
                darkMode
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-800 border-gray-300"
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {availableYears.map((year) => (
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

        <div
          className={`p-8 rounded-xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg overflow-x-auto`}
        >
          {generateCalendar()}

          <div className="mt-6 flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-sm ${
                  darkMode ? "bg-gray-800" : "bg-gray-100"
                }`}
              />
              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                No activities
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-[#1F7D53]" />
              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                1 activity
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-[#85A947]" />
              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                2-4 activities
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-[#C2FFC7]" />
              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                4+ activities
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeatMap;

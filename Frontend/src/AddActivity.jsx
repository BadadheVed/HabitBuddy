import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Timer,
  Bell,
  Check,
  X,
  Activity,
  ArrowLeft,
  Target,
} from "lucide-react";
import "./index.css";
import { Link } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddActivity() {
  const [darkMode, setDarkMode] = useState(false);
  const [step, setStep] = useState(1);
  const [activityName, setActivityName] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasNotification, setHasNotification] = useState(false);

  const navigate = useNavigate();

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleDayClick = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleNext = () => {
    if (step === 1 && activityName) {
      setCurrentActivity({
        name: activityName,
        frequency: [],
        reminder: false,
      });
      setStep(2);
    } else if (step === 2 && selectedDays.length > 0) {
      if (selectedDays.length === 0) {
        setErrorMessage("Please select at least one day.");
        return;
      }
      setCurrentActivity((prev) =>
        prev ? { ...prev, frequency: selectedDays } : null
      );
      setStep(3);
    }
  };

  const handleReminderChoice = (choice) => {
    setCurrentActivity((prev) => (prev ? { ...prev, reminder: choice } : null));
    setStep(1);
    setActivityName("");
    setSelectedDays([]);
  };
  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem("token");
    //   console.log(token);
    if (!token) {
      navigate("/login"); // Redirect to login if no token
      return;
    }

    try {
      const decoded = jwtDecode(token);
      // console.log("Decoded Token:", decoded);

      const userName =
        decoded.name || decoded.user?.name || decoded.username || "User";

      setName(userName);

      if (window.location.pathname !== `/dashboard/${userName}/add`) {
        navigate(`/dashboard/${userName}/add`);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmitActivity = async () => {
    const token = localStorage.getItem("token"); // Get the token from localStorage
    if (!token) {
      navigate("/login"); // If no token, redirect to login
      return;
    }

    const decoded = jwtDecode(token);
    const username = decoded.name;

    const activityData = {
      name: currentActivity.name,
      frequency: selectedDays, // Use selectedDays as the frequency
      wantReminders: currentActivity.reminder,
    };
    console.log("Submitting activity data:", activityData);

    try {
      const response = await axios.post(
        `http://localhost:3000/User/addActivity`, // Adjust this URL if needed
        activityData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 401) {
      }
      console.log("Activity added:", response.data); // Log response from backend
      navigate(`/dashboard/${username}`); // Redirect to the user's dashboard
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response.data);
        setErrorMessage(error.response.data.message || "An error occurred");
      }
      console.error("Error adding activity:", error);
    }
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
    }, 1000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900" : "bg-gray-100"
      }`}
    >
      <nav className={`p-4 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
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
              Add Activity
            </h1>
          </div>
          {/* <Link to="/dashboard/:name"> Go To Homepage</Link> */}
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
                onChange={() => toggleDarkMode(!darkMode)}
              />
              <span className="slider" />
            </label>

            <div className="flex items-center gap-2">
              {" "}
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

      <div className="container mx-auto p-8 min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div
          className={`w-full max-w-3xl p-8 rounded-2xl shadow-2xl ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
          }`}
        >
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= num
                      ? "bg-blue-500 text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-400"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>
          </div>

          {step === 1 && (
            <div className="flex flex-col items-center gap-6 animate-fadeIn">
              <h2 className="text-3xl font-bold text-center">
                What activity would you like to track?
              </h2>
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="Enter activity name"
                className={`w-full max-w-md p-4 rounded-lg border text-lg ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
              <button
                onClick={handleNext}
                disabled={!activityName}
                className={`px-8 py-3 rounded-lg text-lg font-medium ${
                  activityName ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400"
                } text-white transition-colors duration-200`}
              >
                Continue
              </button>
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center gap-8 transform transition-all duration-300 animate-fadeIn">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold">Set Your Frequency</h2>
                <Timer className="w-8 h-8 text-blue-500" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                {weekDays.map((day) => (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`relative p-4 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                      selectedDays.includes(day)
                        ? "bg-blue-500 text-white shadow-lg"
                        : darkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <span className="text-lg font-medium">{day}</span>
                    {selectedDays.includes(day) && (
                      <Check className="absolute top-2 right-2 w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={handleNext}
                disabled={selectedDays.length === 0}
                className={`px-8 py-3 rounded-lg text-lg font-medium ${
                  selectedDays.length > 0
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-400"
                } text-white transition-colors duration-200`}
              >
                Continue
              </button>
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            </div>
          )}

          {step === 3 && currentActivity && (
            <div className="flex flex-col items-center gap-8 transform transition-all duration-300 animate-fadeIn">
              <h2 className="text-3xl font-bold text-center">
                Would you like reminders for {currentActivity.name}?
              </h2>
              <div className="flex gap-6">
                <button
                  onClick={() => {
                    handleReminderChoice(true);
                    handleSubmitActivity();
                  }}
                  className="group relative w-40 h-40 rounded-2xl bg-gray-100 hover:bg-green-500 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 transition-all duration-300 group-hover:transform group-hover:translate-y-0 group-hover:text-white">
                    <span className="text-2xl font-bold">Yes</span>
                    <Check className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </button>
                {/* {errorMessage && <p className="text-red-500">{errorMessage}</p>} */}
                <button
                  onClick={() => {
                    handleReminderChoice(false);
                    handleSubmitActivity();
                  }}
                  className="group relative w-40 h-40 rounded-2xl bg-gray-100 hover:bg-red-500 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 transition-all duration-300 group-hover:transform group-hover:translate-y-0 group-hover:text-white">
                    <span className="text-2xl font-bold">No</span>
                    <X className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </button>
              </div>
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddActivity;

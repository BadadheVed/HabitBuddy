import React, { useState } from "react";
import {
  Sun,
  Moon,
  Bell,
  Activity,
  CheckCircle2,
  ArrowLeft,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";

function MyActivity() {
  const [darkMode, setDarkMode] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [activities, setActivities] = useState([
    {
      id: "1",
      name: "Morning Workout",
      frequency: ["Mon", "Wed", "Fri"],
      completed: false,
    },
    {
      id: "2",
      name: "Read a Book",
      frequency: ["Tue", "Thu", "Sat"],
      completed: false,
    },
    {
      id: "3",
      name: "Meditate",
      frequency: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      completed: true,
    },
    {
      id: "4",
      name: "Learn Programming",
      frequency: ["Mon", "Wed", "Fri", "Sun"],
      completed: true,
    },
  ]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
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

  const handleActivityComplete = (id) => {
    setActivities((prev) =>
      prev.map((activity) => {
        if (activity.id === id) {
          if (!activity.completed) {
            triggerConfetti();
          }
          return { ...activity, completed: !activity.completed };
        }
        return activity;
      })
    );
  };

  const filteredActivities = activities.filter(
    (activity) => activity.completed === showCompleted
  );

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
            <Activity
              className={`h-6 w-6 ${darkMode ? "text-white" : "text-gray-800"}`}
            />
            <h1
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              My Activities
            </h1>
            <a
              href="#"
              className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Go To Dashboard
            </a>
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
                Hi! User
              </span>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-8">
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
        <div className="space-y-4">
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
                  {activity.frequency.map((day) => (
                    <span
                      key={day}
                      className={`px-2 py-1 rounded-full text-sm ${
                        darkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={activity.completed}
                  onChange={() => handleActivityComplete(activity.id)}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyActivity;

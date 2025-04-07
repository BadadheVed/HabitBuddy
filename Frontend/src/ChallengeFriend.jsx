import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Bell,
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  Edit,
  Send,
  Target,
} from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";

import "./index.css";

function ChallengeActivity() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState("");
  const [showChallenges, setShowChallenges] = useState(false);
  const [step, setStep] = useState(1);
  const [friends, setFriends] = useState([]);
  const [activities, setActivities] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: "",
    frequency: [],
    wantReminders: false,
  });
  const [hasNotification, setHasNotification] = useState(false);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem("darkmode");
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });
  const surl = import.meta.env.VITE_SURL;
  const burl = import.meta.env.VITE_BURL;

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;

      localStorage.setItem("darkmode", JSON.stringify(newMode));
      return newMode;
    });
  };

  useEffect(() => {
    const currMode = localStorage.getItem("darkmode");
    if (currMode !== null) {
      setDarkMode(JSON.parse(currMode));
    }
  }, []);

  // Initialize Socket.IO
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SURL, {
      transports: ["websocket"], // Disable polling completely
      withCredentials: true,
    });
    socket.on("connect", () => {
      console.log("Socket connected!");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      toast.error("Realtime connection failed");
    });

    socket.on("challengeReceived", (data) => {
      toast.success(`New challenge from ${data.senderName}!`);
      fetchChallenges();
    });

    socket.on("challengeAccepted", (data) => {
      toast.success(`${data.friendName} accepted your challenge!`);
    });
    socket.on("connect_error", (err) => {
      console.error("Connection error:", {
        message: err.message,
        type: err.type,
        stack: err.stack,
      });
      toast.error(`Realtime connection failed: ${err.message}`);
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

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${burl}/User/getFriends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(response.data.friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Failed to fetch friends list");
    }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${burl}/User/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(response.data);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to fetch activities");
    }
  };

  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${burl}/User/getChallenges`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChallenges(response.data.challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      toast.error("Failed to fetch challenges");
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchActivities();
    if (showChallenges) {
      fetchChallenges();
    }
  }, [showChallenges]);

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

  const handleCreateActivity = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${burl}/User/addActivity`, newActivity, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Activity created successfully!");
      fetchActivities();
      setShowNewActivity(false);
      setNewActivity({ name: "", frequency: [], wantReminders: false });
    } catch (error) {
      console.error("Error creating activity:", error);
      toast.error("Failed to create activity");
    }
  };

  const handleSendChallenge = async () => {
    if (!selectedActivity || selectedFriends.length === 0) {
      toast.error("Please select an activity and at least one friend");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${burl}/User/sendChallenge`,
        {
          activityId: selectedActivity._id,
          friendIds: selectedFriends.map((f) => f._id),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Challenge sent successfully!");
      setStep(1);
      setSelectedActivity(null);
      setSelectedFriends([]);
    } catch (error) {
      console.error("Error sending challenge:", error);
      toast.error("Failed to send challenge");
    }
  };

  const handleAcceptChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem("token"); // Make sure the token is set properly in localStorage

      if (!token) {
        throw new Error("Token not found");
      }

      const response = await axios.post(
        `${burl}/User/acceptChallenge`,
        { challengeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Challenge accepted!");
      fetchChallenges(); // Assuming this fetches the updated list of challenges
    } catch (error) {
      console.error("Error accepting challenge:", error);
      toast.error("Failed to accept challenge");
    }
  };

  const handleRejectChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${burl}/User/rejectChallenge`,
        { challengeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Challenge rejected");
      fetchChallenges();
    } catch (error) {
      console.error("Error rejecting challenge:", error);
      toast.error("Failed to reject challenge");
    }
  };
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch friend requests
      const friendReqRes = await axios.get(`${burl}/User/getRequest`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch challenges
      const challengeRes = await axios.get(`${burl}/User/getChallenges`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const renderStepContent = () => {
    if (showChallenges) {
      return (
        <div className="space-y-4 max-w-2xl mx-auto">
          {challenges.length === 0 ? (
            <div
              className={`p-8 rounded-xl text-center ${
                darkMode
                  ? "bg-gray-800 text-gray-400"
                  : "bg-white text-gray-600"
              }`}
            >
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No challenges yet</p>
              <p className="mt-2">
                When someone challenges you, it will appear here
              </p>
            </div>
          ) : (
            challenges.map((challenge) => (
              <div
                key={challenge._id}
                className={`p-6 rounded-xl shadow-lg ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3
                      className={`text-xl font-semibold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {challenge.activityName}
                    </h3>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      From: {challenge.senderName}
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Sent: {new Date(challenge.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {challenge.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptChallenge(challenge._id)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectChallenge(challenge._id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    switch (step) {
      case 1:
        return (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div
              className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={() => setShowNewActivity(false)}
            >
              <h3
                className={`text-xl font-semibold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Challenge with Existing Activity
              </h3>
              <p
                className={`mt-2 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Choose from your current activities to challenge friends
              </p>
            </div>
            <div
              className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={() => setShowNewActivity(true)}
            >
              <h3
                className={`text-xl font-semibold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Create New Activity Challenge
              </h3>
              <p
                className={`mt-2 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Create a new activity to challenge your friends
              </p>
            </div>
            {showNewActivity ? (
              <div
                className={`p-6 rounded-xl shadow-lg ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h3
                  className={`text-xl font-semibold mb-4 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Create New Activity
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Activity Name"
                    value={newActivity.name}
                    onChange={(e) =>
                      setNewActivity({ ...newActivity, name: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-lg ${
                      darkMode
                        ? "bg-gray-700 text-white placeholder-gray-400"
                        : "bg-white text-gray-800 placeholder-gray-500"
                    } border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <div className="flex flex-wrap gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <button
                          key={day}
                          onClick={() => {
                            const newFrequency = newActivity.frequency.includes(
                              day
                            )
                              ? newActivity.frequency.filter((d) => d !== day)
                              : [...newActivity.frequency, day];
                            setNewActivity({
                              ...newActivity,
                              frequency: newFrequency,
                            });
                          }}
                          className={`px-3 py-1 rounded-full ${
                            newActivity.frequency.includes(day)
                              ? "bg-blue-500 text-white"
                              : darkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {day}
                        </button>
                      )
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newActivity.wantReminders}
                      onChange={(e) =>
                        setNewActivity({
                          ...newActivity,
                          wantReminders: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <label
                      className={darkMode ? "text-white" : "text-gray-800"}
                    >
                      Enable Reminders
                    </label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowNewActivity(false)}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateActivity}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    >
                      Create & Continue
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`p-6 rounded-xl shadow-lg ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h3
                  className={`text-xl font-semibold mb-4 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Select Activity
                </h3>
                <div className="space-y-2">
                  {activities.map((activity) => (
                    <div
                      key={activity._id}
                      onClick={() => {
                        setSelectedActivity(activity);
                        setStep(2);
                      }}
                      className={`p-4 rounded-lg cursor-pointer ${
                        darkMode
                          ? "hover:bg-gray-700 bg-gray-750"
                          : "hover:bg-gray-50 bg-white"
                      } border ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <h4
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {activity.name}
                      </h4>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {activity.frequency.map((day) => (
                          <span
                            key={day}
                            className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div
              className={`p-6 rounded-xl shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3
                className={`text-xl font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Select Friends to Challenge
              </h3>
              <div className="space-y-2">
                {friends.map((friend) => (
                  <div
                    key={friend._id}
                    onClick={() => {
                      setSelectedFriends((prev) =>
                        prev.find((f) => f._id === friend._id)
                          ? prev.filter((f) => f._id !== friend._id)
                          : [...prev, friend]
                      );
                    }}
                    className={`p-4 rounded-lg cursor-pointer ${
                      selectedFriends.find((f) => f._id === friend._id)
                        ? "bg-blue-500 text-white"
                        : darkMode
                        ? "bg-gray-750 text-white"
                        : "bg-white text-gray-800"
                    } border ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{friend.name}</span>
                      {selectedFriends.find((f) => f._id === friend._id) && (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={() => selectedFriends.length > 0 && setStep(3)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    selectedFriends.length > 0
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={selectedFriends.length === 0}
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div
              className={`p-6 rounded-xl shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3
                className={`text-xl font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Challenge Summary
              </h3>
              <div
                className={`space-y-4 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                <div>
                  <h4 className="font-medium">Selected Activity:</h4>
                  <p className="mt-1">{selectedActivity?.name}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedActivity?.frequency.map((day) => (
                      <span
                        key={day}
                        className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Selected Friends:</h4>
                  <ul className="mt-1 space-y-1">
                    {selectedFriends.map((friend) => (
                      <li key={friend._id}>{friend.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Modify
                  </button>
                  <button
                    onClick={handleSendChallenge}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Challenge
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
              {showChallenges ? "My Challenges" : "Challenge Friends"}
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
                onChange={toggleDarkMode}
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

      {/* Toggle Switch */}
      <div className="flex flex-col items-center mt-8">
        <div
          className={`relative w-[30rem] h-12 rounded-full p-1 ${
            darkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        >
          <div
            className={`absolute inset-y-1 w-[14.5rem] rounded-full transition-all duration-300 transform ${
              showChallenges ? "translate-x-[15rem]" : "translate-x-0"
            } ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
          />
          <div className="relative flex h-full">
            <button
              onClick={() => {
                setShowChallenges(false);
                setStep(1);
              }}
              className={`flex-1 flex items-center justify-center gap-2 text-sm whitespace-nowrap px-4 ${
                !showChallenges
                  ? "text-blue-500 font-medium"
                  : darkMode
                  ? "text-gray-400"
                  : "text-gray-600"
              } transition-colors duration-300 z-10`}
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Challenge Friend</span>
            </button>
            <button
              onClick={() => setShowChallenges(true)}
              className={`flex-1 flex items-center justify-center gap-2 text-sm whitespace-nowrap px-4 ${
                showChallenges
                  ? "text-blue-500 font-medium"
                  : darkMode
                  ? "text-gray-400"
                  : "text-gray-600"
              } transition-colors duration-300 z-10`}
            >
              <Activity className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Challenges</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">{renderStepContent()}</div>
    </div>
  );
}

export default ChallengeActivity;

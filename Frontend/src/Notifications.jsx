import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Bell,
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Check,
  X,
  Target,
} from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function Notifications() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("friendRequest", () => {
      fetchFriendRequests();
    });

    socket.on("challengeReceived", () => {
      fetchChallenges();
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
      setUserName(decoded.name || "User");
      fetchFriendRequests();
      fetchChallenges();
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3000/User/getRequest",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFriendRequests(response.data.friendRequests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3000/User/getChallenges",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChallenges(response.data.challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  const handleAcceptFriendRequest = async (senderId, senderName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/User/acceptFriendRequest",
        { senderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`You are now friends with ${senderName}!`);
      fetchFriendRequests();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request");
    }
  };

  const handleRejectFriendRequest = async (senderId, senderName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/User/rejectFriendRequest",
        { senderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Friend request from ${senderName} rejected`);
      fetchFriendRequests();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast.error("Failed to reject friend request");
    }
  };

  const handleAcceptChallenge = async (
    challengeId,
    senderName,
    activityName
  ) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/User/acceptChallenge",
        { challengeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Activity "${activityName}" added to your activities!`);
      fetchChallenges();
    } catch (error) {
      console.error("Error accepting challenge:", error);
      toast.error("Failed to accept challenge");
    }
  };

  const handleRejectChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/User/rejectChallenge",
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
              Notifications
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
            <button
              onClick={() => setDarkMode(!darkMode)}
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

            <div className="flex items-center gap-2">
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
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Friend Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Friend Requests
            </h2>
            <AnimatePresence>
              {friendRequests.length === 0 ? (
                <div
                  className={`p-6 rounded-xl ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } shadow-lg text-center`}
                >
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                    No friend requests
                  </p>
                </div>
              ) : (
                friendRequests.map((request) => (
                  <motion.div
                    key={request.senderId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-6 rounded-xl ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    } shadow-lg mb-4`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p
                          className={`text-lg font-medium ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {request.senderName}
                        </p>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          wants to be your friend
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleAcceptFriendRequest(
                              request.senderId,
                              request.senderName
                            )
                          }
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleRejectFriendRequest(
                              request.senderId,
                              request.senderName
                            )
                          }
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>

          {/* Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Activity Challenges
            </h2>
            <AnimatePresence>
              {challenges.length === 0 ? (
                <div
                  className={`p-6 rounded-xl ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } shadow-lg text-center`}
                >
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                    No challenges
                  </p>
                </div>
              ) : (
                challenges.map((challenge) => (
                  <motion.div
                    key={challenge._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-6 rounded-xl ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    } shadow-lg mb-4`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p
                          className={`text-lg font-medium ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {challenge.senderName} has challenged you
                        </p>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Activity: {challenge.activityName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleAcceptChallenge(
                              challenge._id,
                              challenge.senderName,
                              challenge.activityName
                            )
                          }
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectChallenge(challenge._id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;

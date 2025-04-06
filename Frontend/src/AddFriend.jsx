import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Bell,
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Search,
  UserPlus,
  Check,
  X,
  UserCheck,
  Users,
  UserMinus,
  User,
  Target,
} from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import "./index.css";

function AddFriend() {
  // const [darkMode, setDarkMode] = useState(
  //   localStorage.getItem("darkMode") === "true"
  // );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showMyFriends, setShowMyFriends] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
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

  useEffect(() => {
    const currmode = localStorage.getItem("darkmode");
    if (currmode !== null) {
      setDarkMode(JSON.parse(currmode));
    }
  }, []);
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

  // Initialize Socket.IO
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

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3000/User/getFriends",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFriends(response.data.friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Failed to fetch friends list");
    }
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

  useEffect(() => {
    if (showFriendRequests) {
      fetchFriendRequests();
    }
  }, [showFriendRequests]);

  useEffect(() => {
    if (showMyFriends) {
      fetchFriends();
    }
  }, [showMyFriends]);

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/User/getUsers", {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data);
      if (response.data.length === 0) {
        setError("No users found.");
      }
    } catch (err) {
      setError("Error fetching users. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId, userName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/User/AddFriend",
        { userId, userName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Friend request sent to ${userName}!`);
    } catch (error) {
      console.error("Error sending friend request:", error);

      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Failed to send friend request. Please try again.";

      toast.error(errorMessage);
    }
  };

  const handleRemoveFriend = async (friendId, friendName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/User/removeFriend",
        { friendId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${friendName} has been removed from your friends list`);
      fetchFriends();
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Failed to remove friend. Please try again.");
    }
  };

  const handleAcceptRequest = async (senderId, senderName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/User/acceptFriendRequest",
        { senderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`You are now friends with ${senderName}!`);
      fetchFriendRequests();
      fetchFriends();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request. Please try again.");
    }
  };

  const handleRejectRequest = async (senderId, senderName) => {
    try {
      if (!senderId) {
        toast.error("Invalid sender ID");
        return;
      }

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
      toast.error("Failed to reject friend request. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const renderContent = () => {
    if (showMyFriends) {
      return (
        <div className="space-y-4 max-w-2xl mx-auto">
          {friends.length === 0 ? (
            <div
              className={`p-8 rounded-xl text-center ${
                darkMode
                  ? "bg-gray-800 text-gray-400"
                  : "bg-white text-gray-600"
              }`}
            >
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No friends yet</p>
              <p className="mt-2">Start adding friends to see them here</p>
            </div>
          ) : (
            friends.map((friend) => (
              <div
                key={friend._id}
                className={`flex items-center justify-between p-6 rounded-xl shadow-lg ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div>
                  <h3
                    className={`text-xl font-semibold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {friend.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    ID: {friend._id}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveFriend(friend._id, friend.name)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
                >
                  <UserMinus className="w-4 h-4" />
                  Remove Friend
                </button>
              </div>
            ))
          )}
        </div>
      );
    }

    if (showFriendRequests) {
      return (
        <div className="space-y-4 max-w-2xl mx-auto">
          {friendRequests.length === 0 ? (
            <div
              className={`p-8 rounded-xl text-center ${
                darkMode
                  ? "bg-gray-800 text-gray-400"
                  : "bg-white text-gray-600"
              }`}
            >
              <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No friend requests yet</p>
              <p className="mt-2">
                When someone sends you a friend request, it will appear here
              </p>
            </div>
          ) : (
            friendRequests.map((request) => (
              <div
                key={request.senderId}
                className={`flex items-center justify-between p-6 rounded-xl shadow-lg ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div>
                  <h3
                    className={`text-xl font-semibold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {request.senderName}
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Wants to be your friend
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleAcceptRequest(request.senderId, request.senderName)
                    }
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      handleRejectRequest(request.senderId, request.senderName)
                    }
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col items-center mb-8">
          <div
            className={`w-full max-w-2xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-xl shadow-lg p-6`}
          >
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search friends by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className={`px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Search className="w-4 h-4" />
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
            {error && (
              <p
                className={`mt-4 text-center ${
                  darkMode ? "text-red-400" : "text-red-600"
                }`}
              >
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className={`flex items-center justify-between p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div>
                <h3
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {user.name}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  ID: {user._id}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => handleAddFriend(user._id, user.name)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-colors duration-200"
              >
                <UserPlus className="w-4 h-4" />
                Add Friend
              </button>
            </div>
          ))}
        </div>
      </>
    );
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
              Friends
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

      {/* Toggle Switch */}
      <div className="flex flex-col items-center mt-8">
        <div
          className={`relative w-[30rem] h-12 rounded-full p-1 ${
            darkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        >
          <div
            className={`absolute inset-y-1 w-[9.5rem] rounded-full transition-all duration-300 transform ${
              showMyFriends
                ? "translate-x-[19.5rem]"
                : showFriendRequests
                ? "translate-x-[9.75rem]"
                : "translate-x-0"
            } ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
          />
          <div className="relative flex h-full">
            <button
              onClick={() => {
                setShowFriendRequests(false);
                setShowMyFriends(false);
              }}
              className={`flex-1 flex items-center justify-center gap-2 ${
                !showFriendRequests && !showMyFriends
                  ? "text-blue-500 font-medium"
                  : darkMode
                  ? "text-gray-400"
                  : "text-gray-600"
              } transition-colors duration-300 z-10`}
            >
              <UserPlus className="w-4 h-4" />
              Add Friends
            </button>
            <button
              onClick={() => {
                setShowFriendRequests(true);
                setShowMyFriends(false);
              }}
              className={`flex-1 flex items-center justify-center gap-2 ${
                showFriendRequests
                  ? "text-blue-500 font-medium"
                  : darkMode
                  ? "text-gray-400"
                  : "text-gray-600"
              } transition-colors duration-300 z-10`}
            >
              <UserCheck className="w-4 h-4" />
              Friend Requests
            </button>
            <button
              onClick={() => {
                setShowFriendRequests(false);
                setShowMyFriends(true);
              }}
              className={`flex-1 flex items-center justify-center gap-2 ${
                showMyFriends
                  ? "text-blue-500 font-medium"
                  : darkMode
                  ? "text-gray-400"
                  : "text-gray-600"
              } transition-colors duration-300 z-10`}
            >
              <Users className="w-4 h-4" />
              My Friends
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">{renderContent()}</div>
    </div>
  );
}

export default AddFriend;

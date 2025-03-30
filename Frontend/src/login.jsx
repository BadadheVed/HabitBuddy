import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  Check,
  Loader2,
  Facebook,
  Chrome,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const Login = () => {
  const [activeForm, setActiveForm] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState("");
  const [password, setPassword] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);
  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setLoading(type);
    setError("");
    setSuccessMessage("");

    try {
      let endpoint = "";
      let body = {};

      if (type === "signup") {
        // Signup validation
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        endpoint = "http://localhost:3000/User/Signup";
        body = {
          username,
          email,
          password,
          confirmPassword,
        };
      } else if (type === "login") {
        endpoint = "http://localhost:3000/User/Login";
        body = {
          email, // email as login
          password,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      // Handle successful responses
      if (type === "signup") {
        setSuccessMessage("Signup successful! Please login.");
        handleFormSwitch("login");
      } else if (type === "login") {
        setSuccessMessage("Login successful! Redirecting...");
        localStorage.setItem("token", data.token);
        const decoded = jwtDecode(data.token);
        navigate(`/dashboard/${decoded.username}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading("");
    }
  };

  const handleFormSwitch = (form) => {
    setIsFormVisible(false);
    setTimeout(() => {
      setActiveForm(form);
      setIsFormVisible(true);
      // Clear form fields and messages when switching
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError("");
      setSuccessMessage("");
    }, 300);
  };
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900"
      }`}
    >
      <button
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 p-2 rounded-full ${
          isDarkMode ? "bg-gray-700 text-yellow-400" : "bg-white text-gray-800"
        } shadow-lg transition-all duration-300 hover:scale-110`}
      >
        {isDarkMode ? (
          <Sun className="w-6 h-6" />
        ) : (
          <Moon className="w-6 h-6" />
        )}
      </button>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className={`w-full max-w-md ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } rounded-2xl shadow-xl p-8 transition-all duration-300`}
        >
          <div className="text-center mb-8">
            <h1
              className={`text-3xl font-bold ${
                isDarkMode ? "text-indigo-400" : "text-indigo-600"
              } flex items-center justify-center gap-2`}
            >
              <User className="w-8 h-8" />
              HabitBuddy
            </h1>
          </div>

          <div
            className={`flex rounded-lg ${
              isDarkMode ? "bg-gray-700" : "bg-gray-100"
            } p-1 mb-8`}
          >
            <button
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeForm === "login"
                  ? isDarkMode
                    ? "bg-gray-600 text-white shadow"
                    : "bg-white shadow text-indigo-600"
                  : isDarkMode
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleFormSwitch("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeForm === "signup"
                  ? isDarkMode
                    ? "bg-gray-600 text-white shadow"
                    : "bg-white shadow text-indigo-600"
                  : isDarkMode
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleFormSwitch("signup")}
            >
              Sign Up
            </button>
          </div>

          <div
            className={`transition-opacity duration-300 ${
              isFormVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {activeForm === "login" && (
              <form
                onSubmit={(e) => handleSubmit(e, "login")}
                className="space-y-4"
              >
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    } mb-1`}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-400"
                      } w-5 h-5`}
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg transition-colors duration-300 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white focus:border-indigo-500"
                          : "bg-white border-gray-300 focus:border-indigo-500"
                      } focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    } mb-1`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-400"
                      } w-5 h-5`}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 rounded-lg transition-colors duration-300 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white focus:border-indigo-500"
                          : "bg-white border-gray-300 focus:border-indigo-500"
                      } focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        isDarkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <a
                    href="#"
                    className={`text-sm ${
                      isDarkMode
                        ? "text-indigo-400 hover:text-indigo-300"
                        : "text-indigo-600 hover:text-indigo-500"
                    }`}
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading !== ""}
                  className={`w-full py-2 px-4 rounded-lg transition-all duration-300 ${
                    isDarkMode
                      ? "bg-indigo-500 hover:bg-indigo-600"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center`}
                >
                  {loading === "login" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Login"
                  )}
                </button>

                {(error || successMessage) && (
                  <div
                    className={`mt-4 p-3 rounded-lg ${
                      error
                        ? isDarkMode
                          ? "bg-red-900/30 text-red-300"
                          : "bg-red-100 text-red-700"
                        : isDarkMode
                        ? "bg-green-900/30 text-green-300"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {error || successMessage}
                  </div>
                )}

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div
                      className={`w-full border-t ${
                        isDarkMode ? "border-gray-700" : "border-gray-300"
                      }`}
                    ></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span
                      className={`px-2 ${
                        isDarkMode
                          ? "bg-gray-800 text-gray-400"
                          : "bg-white text-gray-500"
                      }`}
                    >
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Full-width Google button */}
                <div className="w-full">
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, "google")}
                    disabled={loading !== ""}
                    className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-300 ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-white hover:bg-gray-50 text-gray-700"
                    } border ${
                      isDarkMode ? "border-gray-600" : "border-gray-300"
                    } shadow-sm text-sm font-medium`}
                  >
                    {loading === "google" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Chrome className="w-5 h-5 text-red-500 mr-2" />
                        Continue with Google
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {activeForm === "signup" && (
              <form
                onSubmit={(e) => handleSubmit(e, "signup")}
                className="space-y-4"
              >
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    } mb-1`}
                  >
                    Name
                  </label>
                  <div className="relative">
                    <User
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-400"
                      } w-5 h-5`}
                    />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg transition-colors duration-300 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white focus:border-indigo-500"
                          : "bg-white border-gray-300 focus:border-indigo-500"
                      } focus:ring-2 focus:ring-indigo-500`}
                      placeholder=" Ex:- John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    } mb-1`}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-400"
                      } w-5 h-5`}
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg transition-colors duration-300 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white focus:border-indigo-500"
                          : "bg-white border-gray-300 focus:border-indigo-500"
                      } focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    } mb-1`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-400"
                      } w-5 h-5`}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 rounded-lg transition-colors duration-300 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white focus:border-indigo-500"
                          : "bg-white border-gray-300 focus:border-indigo-500"
                      } focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        isDarkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                              i < getPasswordStrength(password)
                                ? [
                                    "bg-red-500",
                                    "bg-orange-500",
                                    "bg-yellow-500",
                                    "bg-green-500",
                                  ][getPasswordStrength(password) - 1]
                                : isDarkMode
                                ? "bg-gray-600"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          {password.length >= 8 ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertCircle
                              className={`w-3 h-3 ${
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                            />
                          )}
                          <span
                            className={
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }
                          >
                            8+ characters
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {/[A-Z]/.test(password) ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertCircle
                              className={`w-3 h-3 ${
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                            />
                          )}
                          <span
                            className={
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }
                          >
                            Uppercase
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {/[0-9]/.test(password) ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertCircle
                              className={`w-3 h-3 ${
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                            />
                          )}
                          <span
                            className={
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }
                          >
                            Number
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    } mb-1`}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-400"
                      } w-5 h-5`}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 rounded-lg transition-colors duration-300 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white focus:border-indigo-500"
                          : "bg-white border-gray-300 focus:border-indigo-500"
                      } focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        isDarkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading !== ""}
                  className={`w-full py-2 px-4 rounded-lg transition-all duration-300 ${
                    isDarkMode
                      ? "bg-indigo-500 hover:bg-indigo-600"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center`}
                >
                  {loading === "signup" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Sign Up"
                  )}
                </button>

                {(error || successMessage) && (
                  <div
                    className={`mt-4 p-3 rounded-lg ${
                      error
                        ? isDarkMode
                          ? "bg-red-900/30 text-red-300"
                          : "bg-red-100 text-red-700"
                        : isDarkMode
                        ? "bg-green-900/30 text-green-300"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {error || successMessage}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

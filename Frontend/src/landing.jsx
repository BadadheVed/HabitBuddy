import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sun,
  Moon,
  CheckCircle,
  Users,
  Bell,
  TrendingUp,
  Calendar,
  MessageCircle,
  Target,
  ArrowRight,
} from "lucide-react";

const Landing = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem("darkmode");
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });
  const formurl = import.meta.env.VITE_FORMURL;

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkmode", JSON.stringify(newMode));
      return newMode;
    });
  };

  useEffect(() => {
    const currmode = localStorage.getItem("darkmode");
    if (currmode !== null) {
      setIsDarkMode(JSON.parse(currmode));
    }
  }, []);

  // Define toggleDarkMode function

  const features = [
    {
      title: "Habit Tracking Made Simple",
      description:
        "Create, update, and delete habits with ease. Whether it's exercising daily or reading 20 pages, HabitBuddy helps you stay on track.",
      icon: <CheckCircle className="w-6 h-6" />,
      image:
        "https://plus.unsplash.com/premium_photo-1712761999986-0686ec32ad91?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Progress Visualization",
      description:
        "Watch your progress come to life with intuitive Heatmap and streak tracking. Visualize your journey and stay motivated.",
      icon: <TrendingUp className="w-6 h-6" />,
      image:
        "https://plus.unsplash.com/premium_photo-1682309580199-12b830e35008?q=80&w=2112&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Buddy System",
      description:
        "Connect with friends by searching via UID or username. Share Challenges & More and motivate each other on your journey.",
      icon: <Users className="w-6 h-6" />,
      image:
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 p-2 rounded-full ${
          isDarkMode
            ? "bg-gray-700 text-yellow-400"
            : "bg-gray-100 text-gray-800"
        } shadow-lg transition-all duration-300 hover:scale-110 z-50`}
      >
        {isDarkMode ? (
          <Sun className="w-6 h-6" />
        ) : (
          <Moon className="w-6 h-6" />
        )}
      </button>

      {/* Navigation */}
      <nav
        className={`fixed w-full ${
          isDarkMode ? "bg-gray-800/80" : "bg-white/80"
        } backdrop-blur-md shadow-md z-40`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Target
                className={`w-8 h-8 ${
                  isDarkMode ? "text-indigo-400" : "text-indigo-600"
                }`}
              />
              <span className="ml-2 text-xl font-bold">HabitBuddy</span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="#features"
                className="hover:text-indigo-500 transition-colors"
              >
                Features
              </a>
              <Link to="/login">
                <button
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? "bg-indigo-500 hover:bg-indigo-600"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white transition-colors`}
                >
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-[75px] font-thin tracking-wide">
              Build Better Habits <br />
              <span className="text-indigo-400">Together</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              Transform your daily routines with HabitBuddy. Track habits,
              connect with friends, and achieve your goals together.
            </p>
            {/* <div className="flex justify-center gap-4">
              <button
                className={`px-6 py-3 rounded-lg ${
                  isDarkMode
                    ? "bg-indigo-500 hover:bg-indigo-600"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } text-white transition-colors flex items-center`}
              >
                Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className={`py-20 px-4 ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Everything you need to build better habits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl ${
                  isDarkMode ? "bg-gray-700" : "bg-white"
                } shadow-xl transition-transform hover:scale-105`}
              >
                <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 ${
                      isDarkMode ? "bg-gray-900" : "bg-gray-900"
                    } opacity-20`}
                  ></div>
                  <div
                    className={`absolute top-4 left-4 p-2 rounded-full ${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    } shadow-lg`}
                  >
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p
                  className={`${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to transform your habits?
          </h2>
          <p
            className={`text-xl mb-8 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Join With Users Who Are Already Building Better Habits With
            HabitBuddy.
          </p>
          <Link to="/login">
            <button
              className={`px-8 py-4 rounded-lg text-lg ${
                isDarkMode
                  ? "bg-indigo-500 hover:bg-indigo-600"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } text-white transition-colors flex items-center mx-auto`}
            >
              Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Target
              className={`w-6 h-6 ${
                isDarkMode ? "text-indigo-400" : "text-indigo-600"
              }`}
            />
            <span className="ml-2 text-lg font-bold">HabitBuddy</span>
          </div>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            HabitBuddy. Have A Complaint / Suggestions{" "}
            <a href={formurl} target="_blank" rel="noopener noreferrer">
              {" "}
              Click here
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

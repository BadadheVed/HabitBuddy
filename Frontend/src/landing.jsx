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
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Optionally set dark mode on mount based on system preferences
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Define toggleDarkMode function
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const features = [
    {
      title: "Habit Tracking Made Simple",
      description:
        "Create, update, and delete habits with ease. Whether it's exercising daily or reading 20 pages, HabitBuddy helps you stay on track.",
      icon: <CheckCircle className="w-6 h-6" />,
      image:
        "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      title: "Progress Visualization",
      description:
        "Watch your progress come to life with intuitive charts and streak tracking. Visualize your journey and stay motivated.",
      icon: <TrendingUp className="w-6 h-6" />,
      image:
        "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      title: "Buddy System",
      description:
        "Connect with friends by searching via email or username. Share progress and motivate each other on your journey.",
      icon: <Users className="w-6 h-6" />,
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      title: "Smart Reminders",
      description:
        "Never miss a habit with customizable reminders. Get notified about incomplete habits and stay on track.",
      icon: <Bell className="w-6 h-6" />,
      image:
        "https://images.unsplash.com/photo-1594080090697-02a63e9f4fcd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      title: "Daily Progress Tracking",
      description:
        "Mark habits as completed and maintain your streak. Build consistency with daily tracking.",
      icon: <Calendar className="w-6 h-6" />,
      image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      title: "Motivational Messages",
      description:
        "Send and receive encouraging messages with your buddies. Celebrate achievements together.",
      icon: <MessageCircle className="w-6 h-6" />,
      image:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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

      {/* Hero Section */}
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
            <div className="flex justify-center gap-4">
              <button
                className={`px-6 py-3 rounded-lg ${
                  isDarkMode
                    ? "bg-indigo-500 hover:bg-indigo-600"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } text-white transition-colors flex items-center`}
              >
                Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
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
            © 2024 HabitBuddy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

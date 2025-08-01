import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaMoon, FaSun, FaHome, FaSignOutAlt, FaUserPlus, FaList, FaPills
} from "react-icons/fa";
import axios from "axios";
import logo from "./assets/logo1.png";
import { server_url } from "./config/url";

export default function NeedyDashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [needyList, setNeedyList] = useState([]);
  const [medicineList, setMedicineList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode.toString());
    loadNeedyData();
    loadMedicineData();
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const loadNeedyData = async () => {
    try {
      const res = await axios.get(server_url + "/needy/getall");
      setNeedyList(res.data.obj || []);
    } catch (err) {
      console.error("Failed to load needy data", err);
      setNeedyList([]);
    }
  };

  const loadMedicineData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(server_url + "/medicine/fetch");
      setMedicineList(res.data.data || []);
    } catch (err) {
      console.error("Error loading medicine data", err);
      setMedicineList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <div className={`min-h-screen w-full overflow-x-hidden ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-indigo-50 via-blue-50 to-violet-50"} bg-fixed`}>
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 shadow-lg sticky top-0 z-50 w-full">
        <div className="w-full px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2 md:gap-3">
              <img src={logo} alt="NGO Logo" className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
              <h1 className="text-lg md:text-2xl font-bold text-white">
                <span className="hidden sm:inline">Needy </span>Dash
              </h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Link
                to="/"
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm md:text-base min-h-[44px]"
              >
                <FaHome className="text-xs md:text-sm" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm md:text-base min-h-[44px]"
              >
                <FaSignOutAlt className="text-xs md:text-sm" />
                <span className="hidden sm:inline">Logout</span>
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all min-h-[44px] min-w-[44px]"
                title={darkMode ? "Light Mode" : "Dark Mode"}
              >
                {darkMode ? <FaSun className="text-sm md:text-base" /> : <FaMoon className="text-sm md:text-base" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Link to="/needy/register" className="group">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all group-hover:-translate-y-2">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                  <FaUserPlus className="text-white text-lg md:text-2xl" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2">Register Needy</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">Add new needy person</p>
              </div>
            </div>
          </Link>

          <Link to="/needy/list" className="group">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all group-hover:-translate-y-2">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                  <FaList className="text-white text-lg md:text-2xl" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2">View List</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">All registered needy people</p>
              </div>
            </div>
          </Link>

          <Link to="/listed-medicines" className="group">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all group-hover:-translate-y-2">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                  <FaPills className="text-white text-lg md:text-2xl" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2">Request Medicine</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">Explore available medicines</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Medicines */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">Available Medicines</h2>

          {loading ? (
            <div className="text-center py-6 md:py-8">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-300 mt-3 md:mt-4 text-sm md:text-base">Loading medicines...</p>
            </div>
          ) : medicineList.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <FaPills className="text-4xl md:text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-3 md:mb-4" />
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-3 md:mb-4">No medicines available</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">Check back later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {medicineList.slice(0, 6).map((med, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex-1 pr-2">
                      <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-2 break-words">{med.medicine}</h3>
                      <div className="space-y-1 text-xs md:text-sm">
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Company:</span> <span className="truncate inline-block max-w-[120px] md:max-w-none">{med.company}</span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Quantity:</span> {med.qty}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Expires:</span> <span className="truncate inline-block max-w-[100px] md:max-w-none">{med.expdate}</span>
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 md:ml-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <FaPills className="text-white text-sm md:text-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

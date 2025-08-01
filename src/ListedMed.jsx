import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun, FaHome, FaArrowLeft, FaPills, FaSearch, FaFilter, FaBuilding, FaCalendarAlt, FaPhone, FaTimes, FaUser, FaEnvelope, FaMapMarkerAlt, FaGraduationCap } from 'react-icons/fa';
import axios from 'axios';
import logo from "./assets/logo1.png";
import { server_url } from './config/url';

function ListedMed() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [donors, setDonors] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [emailFilter, setEmailFilter] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    loadMedicines();
    loadDonors();
  }, [darkMode]);

  useEffect(() => {
    filterMedicines();
  }, [medicines, searchTerm, filterBy, emailFilter]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const response = await axios.get(server_url + '/medicine/fetch');
      if (response.data.status === true) {
        setMedicines(response.data.data || []);
      } else {
        console.error("Failed to fetch medicines:", response.data.msg);
        setMedicines([]);
      }
    } catch (error) {
      console.error("Error loading medicines:", error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDonors = async () => {
    try {
      const response = await axios.get(server_url + '/donor/fetch');
      if (response.data.status === true) {
        // Create a map of email to donor details for quick lookup
        const donorMap = {};
        response.data.data.forEach(donor => {
          if (donor.emailid) {
            donorMap[donor.emailid] = donor;
          }
        });
        setDonors(donorMap);
      } else {
        console.error("Failed to fetch donors:", response.data.msg);
        setDonors({});
      }
    } catch (error) {
      console.error("Error loading donors:", error);
      setDonors({});
    }
  };

  // Function to get donor name by email
  const getDonorName = (email) => {
    if (email && donors[email]) {
      return donors[email].name || 'Anonymous Donor';
    }
    return 'Anonymous Donor';
  };

  const filterMedicines = () => {
    let filtered = medicines;

    // Filter by email if provided
    if (emailFilter.trim()) {
      filtered = filtered.filter(medicine => 
        medicine.emailid && medicine.emailid.toLowerCase().includes(emailFilter.toLowerCase())
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(medicine =>
        (medicine.medicine && medicine.medicine.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (medicine.company && medicine.company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (filterBy !== 'all') {
      const today = new Date();
      filtered = filtered.filter(medicine => {
        if (!medicine.expdate) return true; // If no expiry date, consider it valid
        const expiryDate = new Date(medicine.expdate);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        switch (filterBy) {
          case 'expiring':
            return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
          case 'expired':
            return daysUntilExpiry <= 0;
          case 'valid':
            return daysUntilExpiry > 30;
          default:
            return true;
        }
      });
    }

    setFilteredMedicines(filtered);
  };

  const handleFetchByEmail = () => {
    filterMedicines();
  };

  const clearEmailFilter = () => {
    setEmailFilter('');
  };

  const handleMedicineClick = (medicine) => {
    setSelectedMedicine(medicine);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMedicine(null);
  };

  // Calculate statistics
  const totalMedicines = medicines.length;
  const expiringSoon = medicines.filter(medicine => {
    if (!medicine.expdate) return false;
    const expiryDate = new Date(medicine.expdate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;
  const expired = medicines.filter(medicine => {
    if (!medicine.expdate) return false;
    const expiryDate = new Date(medicine.expdate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 0;
  }).length;

  return (
    <div className={`min-h-screen w-full overflow-x-hidden ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50"} bg-fixed`}>
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-700 dark:to-purple-800 shadow-lg sticky top-0 z-50 w-full">
        <div className="w-full px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2 md:gap-3">
              <img src={logo} alt="NGO Logo" className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
              <h1 className="text-lg md:text-2xl font-bold text-white">
                <span className="hidden sm:inline">Available </span>Medicines
              </h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={handleGoBack}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all hover:scale-105 text-sm md:text-base min-h-[44px]"
              >
                <FaArrowLeft className="text-xs md:text-sm" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <Link
                to="/donor/dashboard"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
              >
                <FaHome />
                Dashboard
              </Link>
              <Link
                to="/"
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm md:text-base min-h-[44px]"
              >
                <FaHome className="text-xs md:text-sm" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <button
                onClick={toggleDarkMode}
                className="p-2 md:p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all min-h-[44px] min-w-[44px]"
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
        {/* Header Section */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3 md:mb-4">
            <FaPills className="inline-block mr-2 md:mr-3 text-pink-500" />
            Medicine Repository
          </h1>
          <p className="text-sm md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse available medicines donated by the community. Search by medicine name, company, or filter by your email to see specific donations.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-blue-500 mb-1 md:mb-2">{totalMedicines}</div>
              <div className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-medium">Total Medicines</div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-orange-500 mb-1 md:mb-2">{expiringSoon}</div>
              <div className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-medium">Expiring Soon</div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 col-span-2 md:col-span-1">
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-red-500 mb-1 md:mb-2">{expired}</div>
              <div className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-medium">Expired</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6 md:mb-8">
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
            {/* Email Filter */}
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by Email (Donor)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter donor email..."
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm md:text-base"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleFetchByEmail}
                    className="flex-1 sm:flex-initial px-4 md:px-6 py-2 md:py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-all text-sm md:text-base font-medium whitespace-nowrap min-h-[40px] md:min-h-[44px]"
                  >
                    Fetch
                  </button>
                  {emailFilter && (
                    <button
                      onClick={clearEmailFilter}
                      className="flex-1 sm:flex-initial px-4 md:px-6 py-2 md:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all text-sm md:text-base font-medium whitespace-nowrap min-h-[40px] md:min-h-[44px]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                Search Medicines
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search by medicine or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 md:pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by Status
              </label>
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full pl-10 pr-3 md:pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                >
                  <option value="all">All Medicines</option>
                  <option value="valid">Valid (30+ days)</option>
                  <option value="expiring">Expiring Soon (≤30 days)</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Medicines Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
            <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
              {emailFilter ? `Medicines from: ${emailFilter}` : 'All Available Medicines'}
            </h2>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
              Showing {filteredMedicines.length} of {totalMedicines} medicines
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 md:py-12">
              <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-pink-500 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-300 mt-4 text-sm md:text-base">Loading medicines...</p>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <FaPills className="text-4xl md:text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-4">
                {emailFilter ? `No medicines found from ${emailFilter}` : 'No medicines match your search criteria'}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                {emailFilter ? 'Try a different email address' : 'Try adjusting your search or filter criteria'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredMedicines.map((medicine, index) => {
                const expiryDate = medicine.expdate ? new Date(medicine.expdate) : null;
                const today = new Date();
                const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)) : Infinity;
                const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                const isExpired = daysUntilExpiry <= 0;

                return (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="flex-1 pr-3">
                        <h3 className="text-base md:text-xl font-bold text-gray-800 dark:text-white mb-2 break-words">
                          {medicine.medicine || 'Unknown Medicine'}
                        </h3>
                        <div className="space-y-1 text-xs md:text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <FaBuilding className="text-gray-400 text-xs flex-shrink-0" />
                            <span className="truncate">{medicine.company || 'Unknown Company'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <FaCalendarAlt className="text-gray-400 text-xs flex-shrink-0" />
                            <span className="truncate">Expires: {medicine.expdate ? new Date(medicine.expdate).toLocaleDateString() : 'No expiry date'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <FaPhone className="text-gray-400 text-xs flex-shrink-0" />
                            <span className="truncate">{medicine.contactno || 'No contact number'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                          <FaPills className="text-white text-sm md:text-xl" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <span className="text-sm md:text-lg font-semibold text-gray-800 dark:text-white">
                          Qty: {medicine.qty || 0}
                        </span>
                        <span className={`px-2 md:px-3 py-1 text-xs rounded-full font-medium ${
                          isExpired 
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            : isExpiringSoon 
                            ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                            : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        }`}>
                          {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Valid'}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleMedicineClick(medicine)}
                        className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white py-2 md:py-3 px-4 rounded-lg font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-base"
                        disabled={isExpired}
                      >
                        {isExpired ? 'Expired' : (
                          <>
                            <span className="md:hidden">View Details</span>
                            <span className="hidden md:inline">View Details & Request</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Medicine Details Modal */}
      {showModal && selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto mx-2 md:mx-4">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-pink-500 to-red-500 p-4 md:p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
                  <FaPills className="text-white text-sm md:text-base" />
                  <span className="hidden sm:inline">Medicine </span>Details
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 md:p-2 hover:bg-white/20 rounded-full transition-all"
                >
                  <FaTimes className="text-white text-lg md:text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-6">
              {/* Medicine Name and Status */}
              <div className="mb-4 md:mb-6">
                <h3 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2 break-words">
                  {selectedMedicine.medicine || 'Unknown Medicine'}
                </h3>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className={`px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm rounded-full font-medium ${
                    selectedMedicine.expdate && new Date(selectedMedicine.expdate) <= new Date()
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      : selectedMedicine.expdate && Math.ceil((new Date(selectedMedicine.expdate) - new Date()) / (1000 * 60 * 60 * 24)) <= 30
                      ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  }`}>
                    {selectedMedicine.expdate && new Date(selectedMedicine.expdate) <= new Date()
                      ? 'Expired'
                      : selectedMedicine.expdate && Math.ceil((new Date(selectedMedicine.expdate) - new Date()) / (1000 * 60 * 60 * 24)) <= 30
                      ? 'Expiring Soon'
                      : 'Valid'
                    }
                  </span>
                  <span className="text-lg md:text-2xl font-bold text-pink-500">
                    Qty: {selectedMedicine.qty || 0}
                  </span>
                </div>
              </div>

              {/* Medicine Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-lg">
                    <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                      <FaBuilding className="text-pink-500 text-sm" />
                      <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base">Company</span>
                    </div>
                    <p className="text-gray-800 dark:text-white text-sm md:text-lg">
                      {selectedMedicine.company || 'Unknown Company'}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-lg">
                    <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                      <FaCalendarAlt className="text-pink-500 text-sm" />
                      <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base">Expiry Date</span>
                    </div>
                    <p className="text-gray-800 dark:text-white text-sm md:text-lg">
                      {selectedMedicine.expdate ? new Date(selectedMedicine.expdate).toLocaleDateString() : 'No expiry date'}
                    </p>
                  </div>

                  {/* Packing Information */}
                  {selectedMedicine.packing && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-lg">
                      <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                        <FaPills className="text-pink-500 text-sm" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base">Packing</span>
                      </div>
                      <p className="text-gray-800 dark:text-white text-sm md:text-lg">
                        {selectedMedicine.packing}
                      </p>
                    </div>
                  )}
                  
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-lg">
                    <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                      <FaPhone className="text-pink-500 text-sm" />
                      <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base">Contact Number</span>
                    </div>
                    <p className="text-gray-800 dark:text-white text-sm md:text-lg">
                      {selectedMedicine.contactno || 'No contact number'}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-lg">
                    <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                      <FaUser className="text-pink-500 text-sm" />
                      <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base">Donor Name</span>
                    </div>
                    <p className="text-gray-800 dark:text-white text-sm md:text-lg">
                      {getDonorName(selectedMedicine.emailid)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {selectedMedicine.emailid && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-lg mb-4 md:mb-6">
                  <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                    <FaEnvelope className="text-pink-500 text-sm" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base">Donor Email</span>
                  </div>
                  <p className="text-gray-800 dark:text-white text-sm md:text-lg break-all">
                    {selectedMedicine.emailid}
                  </p>
                </div>
              )}

              {/* Additional donor phone if different from medicine contact */}
              {selectedMedicine.emailid && donors[selectedMedicine.emailid] && donors[selectedMedicine.emailid].phoneNo && 
               donors[selectedMedicine.emailid].phoneNo !== selectedMedicine.contactno && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-lg mb-4 md:mb-6">
                  <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                    <FaPhone className="text-pink-500 text-sm" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base">Donor Phone</span>
                  </div>
                  <p className="text-gray-800 dark:text-white text-sm md:text-lg">
                    {donors[selectedMedicine.emailid].phoneNo}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all text-sm md:text-base"
                >
                  Close
                </button>
                <button
                  disabled={selectedMedicine.expdate && new Date(selectedMedicine.expdate) <= new Date()}
                  className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {selectedMedicine.expdate && new Date(selectedMedicine.expdate) <= new Date()
                    ? 'Medicine Expired'
                    : 'Request This Medicine'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListedMed;
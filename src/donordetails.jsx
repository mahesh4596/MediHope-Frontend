import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun, FaArrowLeft } from 'react-icons/fa';
import logo from "./assets/logo1.png";
import { server_url } from "./config/url";

function DonorDetails() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
      document.documentElement.classList.toggle("dark", darkMode);
      localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const [formData, setFormData] = useState({ emailid: "", name: "", age: "", gender: "", curcity: "", curaddress: "", qualification: "", occupation: "", contact: "", adhaarpic: "", profilepic: "" });
  const [originalData, setOriginalData] = useState({ emailid: "", name: "", age: "", gender: "", curcity: "", curaddress: "", qualification: "", occupation: "", contact: "", adhaarpic: "", profilepic: "" });

  const [previewAadhaar, setPreviewAadhaar] = useState("");
  const [previewProfile, setPreviewProfile] = useState("");
  const [originalPreviewAadhaar, setOriginalPreviewAadhaar] = useState("");
  const [originalPreviewProfile, setOriginalPreviewProfile] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  // Function to check if data has changed
  const hasDataChanged = () => {
    // Check if form data has changed
    const formChanged = Object.keys(formData).some(key => {
      if (key === 'adhaarpic' || key === 'profilepic') return false; // Skip file fields
      return formData[key] !== originalData[key];
    });
    
    // Check if images have changed
    const imagesChanged = 
      (previewAadhaar !== originalPreviewAadhaar) || 
      (previewProfile !== originalPreviewProfile) ||
      (formData.adhaarpic && typeof formData.adhaarpic === 'object') || 
      (formData.profilepic && typeof formData.profilepic === 'object');
    
    return formChanged || imagesChanged;
  };

  const handleGoBack = () => {
      navigate(-1); // Go back to previous page
  };

  function handleImage(event) {
    const file = event.target.files[0];
    setFormData({ ...formData, adhaarpic: file });
    setPreviewAadhaar(URL.createObjectURL(file));
  }

  function handleImage2(event) {
    const file = event.target.files[0];
    setFormData({ ...formData, profilepic: file });
    setPreviewProfile(URL.createObjectURL(file));
  }

  async function fetchData() {
    if (!formData.emailid) {
      alert("Please enter email first");
      return;
    }

    try {
      const resp = await fetch( server_url + `/donor/fetch/${formData.emailid}`);
      const data = await resp.json();
      
      if (data.status === true) {
        setFormData(data.obj);
        setOriginalData(data.obj); // Store original data for comparison
        setPreviewAadhaar(data.obj.adhaarpic);
        setPreviewProfile(data.obj.profilepic);
        setOriginalPreviewAadhaar(data.obj.adhaarpic);
        setOriginalPreviewProfile(data.obj.profilepic);
        alert("Data loaded successfully!");
      } else {
        alert(data.msg || "No existing data found for this email");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching data: " + error.message);
    }
  }

  async function doSave() {
    // Validate required fields
    if (!formData.emailid || !formData.name) {
      alert("Please fill in email and name fields");
      return;
    }

    try {
      let fd = new FormData();
      for (let prop in formData) {
        fd.append(prop, formData[prop]);
      }

      // For donor signup, we don't require authentication (it's a public route)
      // Use regular axios for this public endpoint to avoid JWT requirement
      const resp = await fetch(server_url + '/donor/save', {
        method: 'POST',
        body: fd,
      });

      const data = await resp.json();

      if (data.status === true) {
        alert(data.msg);
        navigate('/donor/dashboard');
      } else {
        alert(data.msg);
      }
    } catch (error) {
      console.error("Error saving donor:", error);
      alert("Error saving data: " + error.message);
    }
  }

  async function doUpdate() {
    try {
      let fd = new FormData();
      for (let prop in formData) {
        fd.append(prop, formData[prop]);
      }

      const resp = await fetch(server_url +'/donor/update', {
        method: 'POST',
        body: fd,
      });

      const data = await resp.json();

      if (data.status === true) {
        alert(data.msg);
        navigate('/donor/dashboard');
      } else {
        alert(data.msg);
      }
    } catch (error) {
      console.error("Error updating donor:", error);
      alert("Error updating data: " + (error.response?.data?.message || error.message));
    }
  }

  return (
    <div className={`min-h-screen overflow-x-hidden ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-indigo-50 via-blue-50 to-violet-50"}`}>
      {/* Navbar */}
      <nav className="fixed w-full z-50 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center backdrop-blur-md bg-white/90 dark:bg-gray-900/90 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
        <div className="flex items-center gap-2 md:gap-3">
          <Link to="/" className="flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform">
            <img src={logo} alt="MediHope Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-full shadow-md" />
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              MediHope
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-1 md:gap-2 text-gray-700 dark:text-gray-200 hover:text-indigo-500 transition hover:scale-105"
          >
            <FaArrowLeft className="text-xs md:text-sm" />
            <span className="text-xs md:text-sm hidden sm:inline">Back</span>
          </button>
          <Link to="/" className="hidden md:flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-indigo-500 transition">
            <FaArrowLeft className="text-sm" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <button
              onClick={toggleDarkMode}
              className="p-1 md:p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 md:pt-24 pb-6 md:pb-10 px-3 md:px-6 flex items-center justify-center w-full">
        <form className="w-full max-w-5xl bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl shadow-2xl p-4 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl space-y-4 md:space-y-6 border border-white/20 dark:border-gray-700/50 transition-all duration-300">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 bg-clip-text text-transparent mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
              🤝 Donor Registration
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base px-2">
              Join our community of donors and help make a difference in someone's life. Your contribution matters.
            </p>
          </div>

          {/* Email + Fetch */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center">
            <input
              name="emailid"
              value={formData.emailid}
              onChange={handleChange}
              placeholder="Email Address"
              className="flex-1 p-2 md:p-3 rounded-lg md:rounded-xl bg-white/20 dark:bg-gray-700/50 placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-sm md:text-base"
            />
            <input 
              type="button" 
              value="🔍 Fetch" 
              onClick={fetchData} 
              className="px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer text-sm md:text-base whitespace-nowrap" 
            />
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="p-2 md:p-3 rounded-lg md:rounded-xl bg-white/20 dark:bg-gray-700/50 placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-sm md:text-base"
            />
            <input
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age"
              className="p-2 md:p-3 rounded-lg md:rounded-xl bg-white/20 dark:bg-gray-700/50 placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-sm md:text-base"
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="p-2 md:p-3 rounded-lg md:rounded-xl bg-white/20 dark:bg-gray-700/50 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-sm md:text-base"
            >
              <option value="" className="text-gray-800">Select Gender</option>
              <option value="Male" className="text-gray-800">Male</option>
              <option value="Female" className="text-gray-800">Female</option>
              <option value="Other" className="text-gray-800">Other</option>
            </select>
            <input
              name="curcity"
              value={formData.curcity}
              onChange={handleChange}
              placeholder="Current City"
              className="p-2 md:p-3 rounded-lg md:rounded-xl bg-white/20 dark:bg-gray-700/50 placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-sm md:text-base"
            />
            <input
              name="curaddress"
              value={formData.curaddress}
              onChange={handleChange}
              placeholder="Current Address"
              className="md:col-span-2 p-2 md:p-3 rounded-lg md:rounded-xl bg-white/20 dark:bg-gray-700/50 placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-sm md:text-base"
            />

            {/* Qualification Dropdown */}
            <select
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className="p-2 md:p-3 rounded-lg md:rounded-xl bg-white/20 dark:bg-gray-700/50 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-sm md:text-base"
            >
              <option className="text-gray-800" value="">Select Qualification</option>
              <option className="text-gray-800" value="Below 10th">Below 10th</option>
              <option className="text-gray-800" value="10th Pass">10th Pass</option>
              <option className="text-gray-800" value="12th Pass">12th Pass</option>
              <option className="text-gray-800" value="Diploma">Diploma</option>
              <option className="text-gray-800" value="Graduate">Graduate</option>
              <option className="text-gray-800" value="Postgraduate">Postgraduate</option>
              <option className="text-gray-800" value="PhD">PhD</option>
              <option className="text-gray-800" value="MBBS">MBBS</option>
              <option className="text-gray-800" value="MD">MD</option>
              <option className="text-gray-800" value="Other">Other</option>
            </select>

            {/* Occupation Dropdown */}
            <select
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="p-2 md:p-3 rounded-lg md:rounded-xl bg-white/20 dark:bg-gray-700/50 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-sm md:text-base"
            >
              <option className="text-gray-800" value="">Select Occupation</option>
              <option className="text-gray-800" value="Student">Student</option>
              <option className="text-gray-800" value="Unemployed">Unemployed</option>
              <option className="text-gray-800" value="Self-employed">Self-employed</option>
              <option className="text-gray-800" value="Private Job">Private Job</option>
              <option className="text-gray-800" value="Government Job">Government Job</option>
              <option className="text-gray-800" value="Business">Business</option>
              <option className="text-gray-800" value="Retired">Retired</option>
              <option className="text-gray-800" value="Other">Other</option>
            </select>

            <input
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Contact Number"
              className="p-2 md:p-3 rounded-lg md:rounded-xl bg-white/20 dark:bg-gray-700/50 placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-sm md:text-base"
            />
          </div>

          {/* File Uploads + Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-xs md:text-sm font-semibold mb-1 md:mb-2 text-gray-700 dark:text-gray-300">Aadhaar Card</label>
              <input type="file" accept="image/*" name="adhaarpic"
                onChange={handleImage}
                className="w-full p-2 md:p-3 rounded-lg md:rounded-xl bg-white/20 dark:bg-gray-700/50 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 file:bg-emerald-500 file:text-white file:rounded-md file:px-2 md:file:px-4 file:py-1 md:file:py-2 file:border-0 file:font-medium hover:file:bg-emerald-600 transition-all text-xs md:text-sm"
              />
              {(previewAadhaar || formData.adhaarpic) && (
                <img src={previewAadhaar} alt="Aadhaar Preview" className="mt-2 md:mt-3 w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover border-2 border-emerald-500 shadow-md" />
              )}
            </div>
            <div>
              <label className="block text-xs md:text-sm font-semibold mb-1 md:mb-2 text-gray-700 dark:text-gray-300">Profile Picture</label>
              <input type="file" accept="image/*" name="profilepic"
                onChange={handleImage2}
                className="w-full p-2 md:p-3 rounded-lg md:rounded-xl bg-white/20 dark:bg-gray-700/50 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 file:bg-pink-500 file:text-white file:rounded-md file:px-2 md:file:px-4 file:py-1 md:file:py-2 file:border-0 file:font-medium hover:file:bg-pink-600 transition-all text-xs md:text-sm"
              />
              {(previewProfile || formData.profilepic) && (
                <img src={previewProfile} alt="Profile Preview" className="mt-2 md:mt-3 w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover border-2 border-pink-500 shadow-md" />
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row justify-between gap-3 md:gap-4 pt-4 md:pt-6">
            <input 
              type="button" 
              value="💾 Save" 
              onClick={doSave} 
              disabled={!formData.profilepic && !previewProfile}
              className={`w-full md:w-1/2 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold shadow-lg transition-all text-sm md:text-base ${
                (!formData.profilepic && !previewProfile) 
                  ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'
              }`}
            />
            <input 
              type="button" 
              value="✏️ Update" 
              onClick={doUpdate} 
              disabled={!hasDataChanged()}
              className={`w-full md:w-1/2 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold shadow-lg transition-all text-sm md:text-base ${
                !hasDataChanged() 
                  ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'
              }`}
            />
          </div>

          {/* Help message for disabled save button */}
          {(!formData.profilepic && !previewProfile) && (
            <div className="mt-3 md:mt-4 text-center px-2">
              <p className="text-red-500 dark:text-red-400 text-xs md:text-sm font-medium">
                ⚠️ Please upload a profile picture to enable save button
              </p>
            </div>
          )}

          {/* Help message for disabled update button */}
          {!hasDataChanged() && originalData.emailid && (
            <div className="mt-3 md:mt-4 text-center px-2">
              <p className="text-yellow-600 dark:text-yellow-400 text-xs md:text-sm font-medium">
                ℹ️ Make changes to the form or images to enable update button
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default DonorDetails;
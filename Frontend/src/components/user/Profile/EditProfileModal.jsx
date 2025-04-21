import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { XIcon, CameraIcon, AlertCircleIcon, PhoneIcon, MapPinIcon } from "lucide-react";

const EditProfileModal = ({ user, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    profilePhoto: user?.profilePhoto || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || ""
  });
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || "");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size validation (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    setError("");

    try {
      // Read file as base64
      const base64 = await readFileAsBase64(file);
      setPhotoPreview(base64);

      // Don't compress during preview - we'll compress when submitting
      setFormData({
        ...formData,
        profilePhoto: base64,
      });
    } catch (err) {
      setError("Failed to process image");
    }
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded-lg flex items-center">
            <AlertCircleIcon className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={triggerFileInput}
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600 transition-colors"
              >
                <CameraIcon className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={user?.provider !== "email"} // Disable for social logins
              />
              {user?.provider !== "email" && (
                <p className="mt-1 text-sm text-neutral-500">
                  Email cannot be changed for accounts linked with {user?.provider}
                </p>
              )}
            </div>
            
            {/* New Phone Number Field */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="12345 67890"
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            {/* New Address Field */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Address
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-3 text-neutral-500 h-4 w-4" />
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Your address"
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditProfileModal;
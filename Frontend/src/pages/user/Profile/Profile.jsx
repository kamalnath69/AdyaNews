import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { MailIcon, CalendarIcon, TagIcon, PencilIcon, CheckCircleIcon, CameraIcon, AlertCircleIcon, PhoneIcon, MapPinIcon } from "lucide-react";
import { fetchProfile, updateUserProfile } from "../../../redux/userSlice";
import Navbar from "../../../components/user/Navbar";
import Footer from "../../../components/user/Footer";
import EditProfileModal from "../../../components/user/Profile/EditProfileModal";
import LoadingSpinner from "../../../components/auth/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  const { user, isLoading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const handleUpdateProfile = async (updatedData) => {
    setUpdateLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // If there's a profile photo, compress it
      if (updatedData.profilePhoto && updatedData.profilePhoto !== user?.profilePhoto) {
        try {
          updatedData.profilePhoto = await compressImage(updatedData.profilePhoto);
        } catch (err) {
          throw new Error('Failed to compress image. Please try a smaller photo.');
        }
      }
      
      await dispatch(updateUserProfile(updatedData)).unwrap();
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ 
        type: 'error', 
        text: typeof error === 'string' ? error : 'Failed to update profile. Image may be too large.' 
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size validation (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 2MB' });
      return;
    }

    setPhotoLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Convert to base64 and compress
      const base64 = await readFileAsBase64(file);
      const compressedBase64 = await compressImage(base64);
      
      await dispatch(updateUserProfile({ 
        profilePhoto: compressedBase64 
      })).unwrap();
      
      setMessage({ type: 'success', text: 'Profile photo updated' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error("Error updating photo:", error);
      setMessage({ type: 'error', text: 'Failed to update profile photo. Try a smaller image.' });
    } finally {
      setPhotoLoading(false);
    }
  };

  // Function to read file as base64
  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Function to compress image
  const compressImage = (base64) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        
        // Calculate new dimensions (maintaining aspect ratio)
        let width = img.width;
        let height = img.height;
        
        // Maximum dimensions
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get compressed data URL (JPEG at 70% quality)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedDataUrl);
      };
      img.onerror = (error) => reject(error);
    });
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          {message.text && (
            <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'} flex items-center`}>
              <AlertCircleIcon className="h-5 w-5 mr-2" />
              {message.text}
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="bg-primary-500/10 px-4 sm:px-8 py-6 sm:py-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden group cursor-pointer mx-auto sm:mx-0" onClick={handlePhotoClick}>
                    {photoLoading ? (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <>
                        {user?.profilePhoto ? (
                          <img
                            src={user.profilePhoto}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                            {getInitials(user?.name)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <CameraIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handlePhotoChange} 
                          className="hidden" 
                          accept="image/*"
                        />
                      </>
                    )}
                  </div>
                  
                  <div className="ml-0 sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">
                      {user?.name !== undefined ? user.name : ''}
                    </h1>
                    <div className="flex flex-wrap justify-center sm:justify-start items-center mt-2">
                      <MailIcon className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-500 mr-1 sm:mr-2" />
                      <span className="text-sm sm:text-base text-neutral-600">{user?.email}</span>
                      {user?.isVerified && (
                        <span className="ml-2 sm:ml-3 flex items-center text-primary-600 text-xs sm:text-sm">
                          <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 sm:p-3 rounded-lg bg-white hover:bg-neutral-100 transition-colors text-neutral-700 hover:text-primary-600 mt-4 sm:mt-0 mx-auto sm:mx-0"
                >
                  <PencilIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-800 mb-3 sm:mb-4">Account Details</h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center text-neutral-600">
                      <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-neutral-400 flex-shrink-0" />
                      <span className="text-sm sm:text-base">
                        Joined{" "}
                        {user?.createdAt
                          ? format(new Date(user.createdAt), "MMMM yyyy")
                          : "Unknown"}
                      </span>
                    </div>
                    
                    {/* Phone Number */}
                    {user?.phoneNumber && (
                      <div className="flex items-center text-neutral-600">
                        <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-neutral-400 flex-shrink-0" />
                        <span className="text-sm sm:text-base">{user.phoneNumber}</span>
                      </div>
                    )}
                    
                    {/* Address */}
                    {user?.address && (
                      <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-neutral-400 mt-1 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-neutral-600">{user.address}</span>
                      </div>
                    )}
                    
                    {/* Interests */}
                    <div className="flex items-start">
                      <TagIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-neutral-400 mt-1 flex-shrink-0" />
                      <div>
                        <span className="text-sm sm:text-base text-neutral-600">Interests</span>
                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                          {user?.interests && user.interests.length > 0 ? (
                            user.interests.map((interest) => (
                              <span
                                key={interest}
                                className="px-2 sm:px-3 py-0.5 sm:py-1 bg-primary-50 text-primary-600 rounded-full text-xs sm:text-sm"
                              >
                                {interest.charAt(0).toUpperCase() + interest.slice(1)}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs sm:text-sm text-neutral-500">No interests selected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {isEditing && (
          <EditProfileModal
            user={user}
            onClose={() => setIsEditing(false)}
            onSubmit={handleUpdateProfile}
            isLoading={updateLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
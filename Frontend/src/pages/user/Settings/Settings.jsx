import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings2Icon, UserIcon, GlobeIcon, TagsIcon, BellIcon, ShieldIcon, AlertCircleIcon } from 'lucide-react';
import { updateUserProfile, fetchProfile, deleteAccount } from '../../../redux/userSlice';
import Navbar from '../../../components/user/Navbar';
import Footer from '../../../components/user/Footer';
import { LANGUAGES, INTERESTS } from '../../../constants/userPreferences';
import { fetchArticles } from '../../../redux/articleSlice';

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.user);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    language: 'en',
    interests: [],
    notifications: {
      email: true,
      push: true,
      newsletter: false
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [prevLanguage, setPrevLanguage] = useState(null);

  // Load user data when component mounts
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Update formData when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        // Use fullName or fall back to name if fullName isn't available
        fullName:  user.name || '',
        email: user.email || '',
        language: user.language || 'en',
        interests: user.interests || [],
        notifications: {
          // Use the notifications from user if they exist, otherwise use defaults
          email: user.notifications?.email !== undefined ? user.notifications.email : true,
          push: user.notifications?.push !== undefined ? user.notifications.push : true,
          newsletter: user.notifications?.newsletter !== undefined ? user.notifications.newsletter : false
        }
      });
      
      // Store previous language to check for changes
      setPrevLanguage(user.language);
    }
  }, [user]);

  const handleSave = async () => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      console.log("Saving settings with data:", formData);
      const languageChanged = formData.language !== prevLanguage;
      const interestsChanged = user && JSON.stringify(formData.interests) !== JSON.stringify(user.interests);
      
      await dispatch(updateUserProfile(formData)).unwrap();
      
      // Refresh user profile data
      await dispatch(fetchProfile()).unwrap();
      
      // If language or interests changed, reload articles with new preferences
      if (languageChanged || interestsChanged) {
        dispatch(fetchArticles({ query: '', topic: 'latest', page: 1 }));
      }
      
      setMessage({ type: 'success', text: 'Settings saved successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
      // Update the previous language
      setPrevLanguage(formData.language);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to save settings' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    // For social login accounts, password might not be required
    if (user?.provider === 'email' && !deletePassword) {
        setMessage({ type: 'error', text: 'Please enter your password to confirm deletion' });
        return;
    }
    
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
        console.log("Attempting account deletion with password:", deletePassword ? "provided" : "not provided");
        
        // Call the delete account action
        await dispatch(deleteAccount({ password: deletePassword })).unwrap();
        
        // Clear auth data
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Show success message
        setMessage({ type: 'success', text: 'Account deleted successfully. Redirecting...' });
        
        // Force redirection after a short delay
        setTimeout(() => {
            window.location.href = '/login'; // Use direct browser navigation instead of React Router
        }, 1000);
    } catch (error) {
        console.error("Delete account error:", error);
        setMessage({ 
            type: 'error', 
            text: error || 'Failed to delete account' 
        });
        setIsSubmitting(false);
    }
  };

  const toggleInterest = (interestId) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'interests', label: 'Interests', icon: TagsIcon },
    { id: 'language', label: 'Language', icon: GlobeIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldIcon },
  ];

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
              <Settings2Icon className="h-6 w-6 text-primary-500 mr-3" />
              <h1 className="text-3xl font-bold text-neutral-800">Settings</h1>
            </div>

            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'} flex items-center`}>
                <AlertCircleIcon className="h-5 w-5 mr-2" />
                {message.text}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-glass overflow-hidden">
              {/* Tabs - responsive design */}
              <div className="flex flex-col md:flex-row">
                {/* Sidebar - horizontal scrolling on mobile, vertical on desktop */}
                <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-200 p-4">
                  <nav className="flex md:flex-col overflow-x-auto md:overflow-visible scrollbar-hide space-x-2 md:space-x-0 md:space-y-1">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-shrink-0 md:flex-shrink flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <tab.icon className="h-5 w-5 mr-3" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Content - improved spacing for mobile */}
                <div className="flex-1 p-4 sm:p-6">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {activeTab === 'profile' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            disabled={user?.provider !== 'email'} // Disable for social logins
                          />
                          {user?.provider !== 'email' && (
                            <p className="mt-1 text-sm text-neutral-500">
                              Email cannot be changed for accounts linked with {user?.provider}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {activeTab === 'interests' && (
                      <div className="space-y-4">
                        <p className="text-neutral-600">
                          Select the topics you're interested in to personalize your news feed
                        </p>
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                          {INTERESTS.map((interest) => (
                            <button
                              key={interest.id}
                              type="button"
                              onClick={() => toggleInterest(interest.id)}
                              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                formData.interests.includes(interest.id)
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                              }`}
                            >
                              {interest.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'language' && (
                      <div className="space-y-4">
                        <p className="text-neutral-600">
                          Choose your preferred language for news articles
                        </p>
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                          {LANGUAGES.map((lang) => (
                            <button
                              key={lang.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, language: lang.id })}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                formData.language === lang.id
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                              }`}
                            >
                              {lang.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'notifications' && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.notifications.email}
                              onChange={(e) => setFormData({
                                ...formData,
                                notifications: {
                                  ...formData.notifications,
                                  email: e.target.checked
                                }
                              })}
                              className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-neutral-700">Email notifications</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.notifications.push}
                              onChange={(e) => setFormData({
                                ...formData,
                                notifications: {
                                  ...formData.notifications,
                                  push: e.target.checked
                                }
                              })}
                              className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-neutral-700">Push notifications</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.notifications.newsletter}
                              onChange={(e) => setFormData({
                                ...formData,
                                notifications: {
                                  ...formData.notifications,
                                  newsletter: e.target.checked
                                }
                              })}
                              className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-neutral-700">Weekly newsletter</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {activeTab === 'privacy' && (
                      <div className="space-y-6">
                        <div className="p-4 bg-neutral-50 rounded-lg">
                          <h3 className="text-lg font-medium text-neutral-800 mb-2">
                            Data Privacy
                          </h3>
                          <p className="text-neutral-600 text-sm">
                            Your data is securely stored and never shared with third parties.
                            You can request a copy of your data or delete your account at any time.
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium text-neutral-800 mb-2">
                            Export Data
                          </h3>
                          <p className="text-neutral-600 text-sm mb-2">
                            Download a copy of all your personal data and content.
                          </p>
                          <button
                            type="button"
                            onClick={() => setMessage({ 
                              type: 'success', 
                              text: 'Data export requested. You will receive an email with download instructions.' 
                            })}
                            className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 text-sm font-medium"
                          >
                            Export Data
                          </button>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-neutral-800 mb-2">
                            Delete Account
                          </h3>
                          <p className="text-neutral-600 text-sm mb-2">
                            Permanently delete your account and all associated data.
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                          >
                            Delete Account
                          </button>
                        </div>

                        {showDeleteConfirm && (
                          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                            <h3 className="text-lg font-medium text-red-800 mb-2">
                              Confirm Account Deletion
                            </h3>
                            <p className="text-red-600 text-sm mb-3">
                              This action cannot be undone. All your data will be permanently deleted.
                            </p>
                            
                            {user?.provider === 'email' ? (
                                <>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Enter your password to confirm
                                    </label>
                                    <input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        placeholder="Your password"
                                    />
                                </>
                            ) : (
                                <p className="text-neutral-600 mb-3">
                                    Your account is linked with {user?.provider}. Click confirm to permanently delete it.
                                </p>
                            )}
                            
                            <div className="mt-4 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeletePassword('');
                                    }}
                                    className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    disabled={isSubmitting || (user?.provider === 'email' && !deletePassword)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Processing...' : 'Confirm Delete'}
                                </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
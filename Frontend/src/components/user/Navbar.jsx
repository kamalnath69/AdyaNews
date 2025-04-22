import React, { useState, useEffect } from 'react';
import { NewspaperIcon, BookmarkIcon, LogOutIcon, Settings2Icon, MenuIcon, XIcon, HomeIcon, UserIcon, ShieldIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = {}; // Replace with actual user data

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleLogout = async () => {
    try {
      // Wait for logout action to complete
      await dispatch(logout()).unwrap();
      // Force clear any remaining auth data
      localStorage.removeItem('token');
      sessionStorage.clear();
      // Only navigate after successful logout
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      // Still attempt to navigate on error
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-md py-2' 
          : 'bg-transparent py-3'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <NewspaperIcon className="h-7 w-7 sm:h-8 sm:w-8 text-primary-500" />
            <span className="ml-2 text-lg sm:text-xl font-bold text-primary-500">AdyaNews</span>
          </Link>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-8">
            <NavLink to="/" active={location.pathname === '/'}>
              Home
            </NavLink>
            <NavLink to="/saved" active={location.pathname === '/saved'}>
              Saved Articles
            </NavLink>
            <NavLink to="/profile" active={location.pathname === '/profile'}>
              Profile
            </NavLink>
          </div>
          
          {/* Desktop quick actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/saved"
              className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Saved Articles"
            >
              <BookmarkIcon className="h-5 w-5 text-neutral-600" />
            </Link>
            <Link
              to="/settings"
              className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Settings"
            >
              <Settings2Icon className="h-5 w-5 text-neutral-600" />
            </Link>
            <button
              onClick={handleLogout}
              className="bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center"
            >
              <LogOutIcon className="h-4 w-4 mr-1" />
              <span>Logout</span>
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <XIcon className="h-6 w-6 text-neutral-700" />
              ) : (
                <MenuIcon className="h-6 w-6 text-neutral-700" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-neutral-200 shadow-md overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3 space-y-1">
              <MobileNavLink 
                to="/" 
                active={location.pathname === '/'} 
                icon={<HomeIcon className="h-5 w-5 mr-3" />}
              >
                Home
              </MobileNavLink>
              <MobileNavLink 
                to="/saved" 
                active={location.pathname === '/saved'} 
                icon={<BookmarkIcon className="h-5 w-5 mr-3" />}
              >
                Saved Articles
              </MobileNavLink>
              <MobileNavLink 
                to="/profile" 
                active={location.pathname === '/profile'} 
                icon={<UserIcon className="h-5 w-5 mr-3" />}
              >
                Profile
              </MobileNavLink>
              <MobileNavLink 
                to="/settings" 
                active={location.pathname === '/settings'} 
                icon={<Settings2Icon className="h-5 w-5 mr-3" />}
              >
                Settings
              </MobileNavLink>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShieldIcon className="h-4 w-4 mr-2 inline" />
                  Admin Dashboard
                </Link>
              )}
              <div className="pt-2 mt-2 border-t border-neutral-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-left text-neutral-700 hover:bg-neutral-50 rounded-lg"
                >
                  <LogOutIcon className="h-5 w-5 mr-3 text-neutral-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`text-sm font-medium hover:text-primary-500 transition-colors ${
      active ? 'text-primary-500' : 'text-neutral-600'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, children, active, icon }) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-3 rounded-lg ${
      active 
        ? 'bg-primary-50 text-primary-600' 
        : 'text-neutral-700 hover:bg-neutral-50'
    }`}
  >
    {icon}
    <span className="font-medium">{children}</span>
  </Link>
);

export default Navbar;
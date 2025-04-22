import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Newspaper,
  BarChart2,
  LogOut,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    
    // Set initial state
    handleResize();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on navigation (mobile only)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  
  // Redirect non-admins
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Access Denied</h1>
          <p className="text-neutral-600 mb-6">
            You don't have permission to access the admin area.
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }
  
  const navigationItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: "User Management",
      path: "/admin/users",
      icon: <Users className="h-5 w-5" />
    },
    {
      name: "Content",
      path: "/admin/content",
      icon: <Newspaper className="h-5 w-5" />
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: <BarChart2 className="h-5 w-5" />
    }
  ];
  
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-neutral-100 relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          lg:flex-shrink-0 bg-white shadow-lg z-30
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "fixed inset-y-0 left-0 w-64" : "hidden"} 
          lg:static lg:block lg:w-64
        `}
      >
        <div className="py-4 px-6 border-b border-neutral-200 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-600">Admin Dashboard</h1>
          <button 
            className="lg:hidden p-1.5 rounded-md text-neutral-500 hover:bg-neutral-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="h-full overflow-y-auto">
          <nav className="py-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-6 py-3 text-neutral-600 hover:bg-neutral-100 hover:text-primary-600 transition-colors ${
                      location.pathname === item.path ? "bg-neutral-100 text-primary-600 border-r-4 border-primary-500" : ""
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
              <li className="mt-6">
                <Link
                  to="/"
                  className="flex items-center px-6 py-3 text-neutral-600 hover:bg-neutral-100 hover:text-primary-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-3">Back to Site</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="p-1.5 mr-3 rounded-md text-neutral-500 hover:bg-neutral-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
              {navigationItems.find(item => item.path === location.pathname)?.name || "Admin"}
            </h2>
          </div>
          
          <div className="flex items-center">
            <div className="text-xs sm:text-sm text-neutral-600">
              Logged in as <span className="font-medium text-primary-600">{user?.name}</span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
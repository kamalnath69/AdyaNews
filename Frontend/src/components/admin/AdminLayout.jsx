import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Newspaper,
  BarChart2,
  LogOut,
  AlertTriangle
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
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
    <div className="flex h-screen bg-neutral-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg h-full flex-shrink-0">
        <div className="py-4 px-6 border-b border-neutral-200">
          <h1 className="text-xl font-bold text-primary-600">Admin Dashboard</h1>
        </div>
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
      
      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-800">
            {navigationItems.find(item => item.path === location.pathname)?.name || "Admin"}
          </h2>
          <div className="flex items-center">
            <div className="text-sm text-neutral-600">
              Logged in as <span className="font-medium text-primary-600">{user?.name}</span>
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
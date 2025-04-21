import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserStats, fetchContentStats } from '../../../redux/adminSlice';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const { userStats, contentStats, status } = useSelector(state => state.admin);
  
  useEffect(() => {
    dispatch(fetchUserStats());
    dispatch(fetchContentStats());
  }, [dispatch]);
  
  // Format user registration data for chart
  const registrationData = [];
  if (userStats?.usersByDate) {
    // Fill in missing dates with 0 users
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const existingData = userStats.usersByDate.find(item => item._id === dateString);
      registrationData.push({
        date: dateString,
        users: existingData ? existingData.count : 0
      });
    }
  }
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Format category data for pie chart
  const categoryData = contentStats?.articlesByCategory?.map((category, idx) => ({
    name: category._id || 'Uncategorized',
    value: category.count,
    color: COLORS[idx % COLORS.length]
  })) || [];
  
  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-neutral-800">Analytics</h1>
      
      {status === 'loading' ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {/* User Registration Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6">User Registrations (Last 30 Days)</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 12}}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth()+1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} users`, 'Registrations']}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString();
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" name="New Users" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Statistics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6">User Demographics</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Verified', value: userStats?.verifiedUsers || 0 },
                        { name: 'Unverified', value: (userStats?.totalUsers || 0) - (userStats?.verifiedUsers || 0) }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#0088FE" />
                      <Cell fill="#FF8042" />
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Content Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6">Content Distribution</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => [`${value} articles`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Interest Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6">Top User Interests</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={userStats?.topInterests?.slice(0, 8).map(interest => ({
                      name: interest._id,
                      users: interest.count
                    })) || []}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} users`, 'Users']} />
                    <Legend />
                    <Bar dataKey="users" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Tag Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6">Top Tags</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={contentStats?.topTags?.slice(0, 8).map(tag => ({
                      name: tag._id,
                      articles: tag.count
                    })) || []}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} articles`, 'Articles']} />
                    <Legend />
                    <Bar dataKey="articles" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  UsersIcon, 
  NewspaperIcon, 
  TrendingUpIcon, 
  CheckCircleIcon 
} from 'lucide-react';
import { fetchUserStats, fetchContentStats } from '../../../redux/adminSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { userStats, contentStats, status } = useSelector(state => state.admin);
  
  useEffect(() => {
    dispatch(fetchUserStats());
    dispatch(fetchContentStats());
  }, [dispatch]);
  
  const statsCards = [
    {
      title: "Total Users",
      value: userStats?.totalUsers || 0,
      icon: <UsersIcon className="h-8 w-8 text-blue-500" />,
      color: "bg-blue-100"
    },
    {
      title: "Verified Users",
      value: userStats?.verifiedUsers || 0,
      icon: <CheckCircleIcon className="h-8 w-8 text-green-500" />,
      color: "bg-green-100"
    },
    {
      title: "Saved Articles",
      value: contentStats?.totalSavedArticles || 0,
      icon: <NewspaperIcon className="h-8 w-8 text-purple-500" />,
      color: "bg-purple-100"
    },
    {
      title: "Active Interests",
      value: userStats?.topInterests?.length || 0,
      icon: <TrendingUpIcon className="h-8 w-8 text-orange-500" />,
      color: "bg-orange-100"
    }
  ];
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">Dashboard Overview</h1>
      
      {status === "loading" ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-sm p-6 flex items-center"
              >
                <div className={`p-3 rounded-full ${stat.color} mr-4`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-neutral-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-neutral-800">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Interests */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Popular User Interests</h2>
              <div className="max-h-80 overflow-y-auto">
                {userStats?.topInterests?.length > 0 ? (
                  <ul className="space-y-2">
                    {userStats.topInterests.map((interest) => (
                      <li 
                        key={interest._id} 
                        className="flex items-center justify-between p-2 border-b border-neutral-100"
                      >
                        <span className="font-medium capitalize">{interest._id}</span>
                        <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                          {interest.count} {interest.count === 1 ? 'user' : 'users'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-500">No interests data available</p>
                )}
              </div>
            </div>
            
            {/* Top Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Popular Article Categories</h2>
              <div className="max-h-80 overflow-y-auto">
                {contentStats?.articlesByCategory?.length > 0 ? (
                  <ul className="space-y-2">
                    {contentStats.articlesByCategory.map((category) => (
                      <li 
                        key={category._id} 
                        className="flex items-center justify-between p-2 border-b border-neutral-100"
                      >
                        <span className="font-medium capitalize">{category._id}</span>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                          {category.count} {category.count === 1 ? 'article' : 'articles'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-500">No category data available</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
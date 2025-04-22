import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContentStats } from '../../../redux/adminSlice';
import { fetchSavedArticles } from '../../../redux/articleSlice';
import { 
  SearchIcon, 
  FilterIcon, 
  TagIcon, 
  FolderIcon,
  PieChartIcon,
  BarChart2Icon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const ContentManagement = () => {
  const dispatch = useDispatch();
  const { contentStats, status } = useSelector(state => state.admin);
  const { savedArticles } = useSelector(state => state.articles);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  useEffect(() => {
    dispatch(fetchContentStats());
    dispatch(fetchSavedArticles());
  }, [dispatch]);
  
  const filteredArticles = savedArticles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        article.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? article.category === filterCategory : true;
    
    return matchesSearch && matchesCategory;
  });
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Format category data for charts
  const categoryData = contentStats?.articlesByCategory?.map((category, idx) => ({
    name: category._id || 'Uncategorized',
    value: category.count,
    color: COLORS[idx % COLORS.length]
  })) || [];
  
  // Format tag data for charts
  const tagData = contentStats?.topTags?.slice(0, 10).map((tag, idx) => ({
    name: tag._id || 'No Tag',
    count: tag.count,
    color: COLORS[idx % COLORS.length]
  })) || [];
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">Content Management</h1>
      
      <div className="flex border-b border-neutral-200">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'overview' 
              ? 'text-primary-600 border-b-2 border-primary-600' 
              : 'text-neutral-600 hover:text-neutral-800'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'articles' 
              ? 'text-primary-600 border-b-2 border-primary-600' 
              : 'text-neutral-600 hover:text-neutral-800'
          }`}
          onClick={() => setActiveTab('articles')}
        >
          Saved Articles
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'analytics' 
              ? 'text-primary-600 border-b-2 border-primary-600' 
              : 'text-neutral-600 hover:text-neutral-800'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>
      
      {status === 'loading' && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}
      
      {/* Overview Tab */}
      {activeTab === 'overview' && status === 'succeeded' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Categories card */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold">Categories</h3>
                <FolderIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <div className="h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
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
            
            {/* Tags card */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold">Top Tags</h3>
                <TagIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <div className="h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tagData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8">
                      {tagData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Articles Tab */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
            </div>
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="">All Categories</option>
                {contentStats?.articlesByCategory?.map(category => (
                  <option key={category._id} value={category._id}>
                    {category._id}
                  </option>
                ))}
              </select>
              <FilterIcon className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-neutral-50 text-neutral-700">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold text-sm">Title</th>
                  <th className="py-3 px-4 text-left font-semibold text-sm">Category</th>
                  <th className="py-3 px-4 text-left font-semibold text-sm">Tags</th>
                  <th className="py-3 px-4 text-left font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredArticles.map(article => (
                  <tr key={article._id} className="hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-neutral-800">{article.title}</div>
                      <div className="text-xs text-neutral-500">{article.source}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {article.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {article.tags?.length > 0 ? (
                          article.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-neutral-500">No tags</span>
                        )}
                        {article.tags?.length > 3 && (
                          <span className="text-xs text-neutral-500">
                            +{article.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        article.isRead
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.isRead ? 'Read' : 'Unread'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredArticles.length === 0 && (
              <div className="text-center py-10">
                <p className="text-neutral-600">No articles match your search criteria</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Analytics Tab */}
      {activeTab === 'analytics' && status === 'succeeded' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Category Distribution</h3>
              <PieChartIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
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
          
          {/* Tag Usage */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tag Usage</h3>
              <BarChart2Icon className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    {tagData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllUsers, 
  updateUserRole, 
  deleteUserById 
} from '../../../redux/adminSlice';
import { 
  SearchIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  EditIcon,
  TrashIcon,
  UsersIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, status, error } = useSelector(state => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleRoleChange = async (userId, newRole) => {
    try {
      await dispatch(updateUserRole({ userId, role: newRole })).unwrap();
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error(error || 'Failed to update user role');
    }
    setIsRoleModalOpen(false);
    setSelectedUser(null);
  };
  
  const handleDeleteUser = async (userId) => {
    try {
      await dispatch(deleteUserById(userId)).unwrap();
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error(error || 'Failed to delete user');
    }
    setIsConfirmDeleteOpen(false);
    setSelectedUser(null);
  };
  
  const openRoleModal = (user) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };
  
  const openDeleteConfirmation = (user) => {
    setSelectedUser(user);
    setIsConfirmDeleteOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-800">User Management</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
        </div>
      </div>
      
      {status === 'loading' && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}
      
      {status === 'failed' && (
        <div className="text-center py-10">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-neutral-600">{error || 'Failed to load users'}</p>
        </div>
      )}
      
      {status === 'succeeded' && filteredUsers.length === 0 && (
        <div className="text-center py-10">
          <UsersIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600">No users match your search criteria</p>
        </div>
      )}
      
      {status === 'succeeded' && filteredUsers.length > 0 && (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-neutral-50 text-neutral-700">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold text-xs sm:text-sm">Name</th>
                  <th className="py-3 px-4 text-left font-semibold text-xs sm:text-sm">Email</th>
                  <th className="py-3 px-4 text-left font-semibold text-xs sm:text-sm hidden sm:table-cell">Status</th>
                  <th className="py-3 px-4 text-left font-semibold text-xs sm:text-sm">Role</th>
                  <th className="py-3 px-4 text-left font-semibold text-xs sm:text-sm hidden md:table-cell">Joined</th>
                  <th className="py-3 px-4 text-left font-semibold text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-neutral-50">
                    <td className="py-3 px-4 text-xs sm:text-sm">
                      <div className="font-medium text-neutral-800">{user.name}</div>
                    </td>
                    <td className="py-3 px-4 text-xs sm:text-sm text-neutral-600 max-w-[120px] sm:max-w-none truncate">{user.email}</td>
                    <td className="py-3 px-4 text-xs sm:text-sm hidden sm:table-cell">
                      {user.isVerified ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-3 w-3 mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          <XCircleIcon className="h-3 w-3 mr-1" /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs sm:text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs sm:text-sm text-neutral-600 hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-xs sm:text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openRoleModal(user)}
                          className="p-1.5 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="Change role"
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirmation(user)}
                          className="p-1.5 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete user"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Role Change Modal */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 mx-4">
            <h3 className="text-lg font-semibold mb-4">Change User Role</h3>
            <p className="text-neutral-600 mb-6">
              Change role for <span className="font-medium">{selectedUser.name}</span>
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => handleRoleChange(selectedUser._id, 'user')}
                className={`w-full p-3 rounded-lg border ${
                  selectedUser.role === 'user' ? 'border-primary-500 bg-primary-50' : 'border-neutral-300'
                } hover:bg-neutral-50`}
              >
                <span className="font-medium">User</span>
                <p className="text-sm text-neutral-500">Regular user access</p>
              </button>
              <button
                onClick={() => handleRoleChange(selectedUser._id, 'admin')}
                className={`w-full p-3 rounded-lg border ${
                  selectedUser.role === 'admin' ? 'border-primary-500 bg-primary-50' : 'border-neutral-300'
                } hover:bg-neutral-50`}
              >
                <span className="font-medium">Admin</span>
                <p className="text-sm text-neutral-500">Full administrative access</p>
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isConfirmDeleteOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Confirm Delete</h3>
            <p className="text-neutral-600 mb-6">
              Are you sure you want to delete user <span className="font-medium">{selectedUser.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser._id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
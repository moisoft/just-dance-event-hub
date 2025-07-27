import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/api';
import { User } from '../types';

interface AdminScreenProps {
  onLogout: () => void;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getUsers();
      if (response.success && response.data) {
        setUsers(response.data as User[]);
      } else {
        setError(response.error || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await adminApi.deleteUser(userId);
        if (response.success) {
          alert('User deleted successfully');
          fetchUsers(); // Refresh the list
        } else {
          alert(response.error || 'Failed to delete user');
        }
      } catch (err: any) {
        alert(err.message || 'Network error');
      }
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await adminApi.updateUser(userId, { papel: newRole });
      if (response.success) {
        alert('User role updated successfully');
        fetchUsers(); // Refresh the list
      } else {
        alert(response.error || 'Failed to update user role');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  if (loading) return <div className="text-center text-white">Loading users...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-pink-400">Admin Panel</h1>
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Logout
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700">
        <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
        {users.length === 0 ? (
          <p className="text-gray-400">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg">
              <thead>
                <tr>
                  <th className="py-3 px-4 text-left text-gray-300">Email</th>
                  <th className="py-3 px-4 text-left text-gray-300">Nickname</th>
                  <th className="py-3 px-4 text-left text-gray-300">Role</th>
                  <th className="py-3 px-4 text-left text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-600">
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.nickname}</td>
                    <td className="py-3 px-4">
                      <select
                        value={user.papel}
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded py-1 px-2 text-white"
                      >
                        <option value="jogador">Jogador</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm transition-colors duration-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminScreen;
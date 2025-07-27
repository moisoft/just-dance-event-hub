import React, { useState } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';

interface ManageUsersScreenProps {
  onBack: () => void;
}

const ManageUsersScreen: React.FC<ManageUsersScreenProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>(mockUsers);

  const handleRoleChange = (userId: string, newRole: 'jogador' | 'staff' | 'admin') => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, papel: newRole } : user
      )
    );
    alert(`Função do usuário ${userId} alterada para ${newRole}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 pt-16 pb-20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 text-pink-400">Gerenciar Usuários</h2>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700">
          <ul className="space-y-4">
            {users.map((user) => (
              <li key={user.id} className="flex flex-col md:flex-row items-center justify-between bg-gray-700 p-4 rounded-md border border-gray-600">
                <div className="flex items-center mb-4 md:mb-0">
                  <img src={user.avatar_ativo_url} alt={user.nickname} className="w-12 h-12 object-cover rounded-full mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold text-pink-300">{user.nickname}</h3>
                    <p className="text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300">Função:</span>
                  <select
                    value={user.papel}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as 'jogador' | 'staff' | 'admin')}
                    className="bg-gray-900 border border-gray-700 text-gray-200 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="jogador">Jogador</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 text-lg"
          >
            Voltar para o Painel do Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersScreen;
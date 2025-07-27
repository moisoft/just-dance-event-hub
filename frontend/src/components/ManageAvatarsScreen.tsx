import React, { useState } from 'react';
import { Avatar } from '../types';
import { mockAvatars } from '../data/mockData';

interface ManageAvatarsScreenProps {
  onBack: () => void;
}

const ManageAvatarsScreen: React.FC<ManageAvatarsScreenProps> = ({ onBack }) => {
  const [avatars, setAvatars] = useState<Avatar[]>(mockAvatars);
  const [newAvatarName, setNewAvatarName] = useState('');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

  const handleAddAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAvatarName.trim() && newAvatarUrl.trim()) {
      const newAvatar: Avatar = {
        id: `avatar${avatars.length + 1}`,
        name: newAvatarName,
        image_url: newAvatarUrl,
      };
      setAvatars([...avatars, newAvatar]);
      setNewAvatarName('');
      setNewAvatarUrl('');
    } else {
      alert('Por favor, preencha todos os campos para adicionar um novo avatar.');
    }
  };

  const handleDeleteAvatar = (avatarId: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este avatar?')) {
      setAvatars(avatars.filter(avatar => avatar.id !== avatarId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 pt-16 pb-20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 text-pink-400">Gerenciar Avatares</h2>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700 mb-8">
          <h3 className="text-2xl font-semibold mb-4 text-cyan-400">Adicionar Novo Avatar</h3>
          <form onSubmit={handleAddAvatar} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="newAvatarName">Nome do Avatar:</label>
              <input
                type="text"
                id="newAvatarName"
                value={newAvatarName}
                onChange={(e) => setNewAvatarName(e.target.value)}
                className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="newAvatarUrl">URL da Imagem:</label>
              <input
                type="text"
                id="newAvatarUrl"
                value={newAvatarUrl}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
                className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-900"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-lg"
            >
              Adicionar Avatar
            </button>
          </form>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700">
          <h3 className="text-2xl font-semibold mb-4 text-pink-400">Avatares Existentes</h3>
          {avatars.length === 0 ? (
            <p className="text-gray-400 text-center">Nenhum avatar encontrado.</p>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {avatars.map((avatar) => (
                <li key={avatar.id} className="bg-gray-700 p-3 rounded-lg border border-gray-600 text-center">
                  <img src={avatar.image_url} alt={avatar.name} className="w-24 h-24 object-cover rounded-full mx-auto mb-2" />
                  <p className="text-lg font-semibold text-cyan-300 truncate">{avatar.name}</p>
                  <button
                    onClick={() => handleDeleteAvatar(avatar.id)}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm transition-colors duration-300"
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          )}
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

export default ManageAvatarsScreen;
import React from 'react';

interface AdminPanelScreenProps {
  onManageSongs: () => void;
  onManageAvatars: () => void;
  onManageUsers: () => void;
}

const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({
  onManageSongs,
  onManageAvatars,
  onManageUsers,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 pt-16 pb-20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 text-pink-400">Painel do Administrador</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700 cursor-pointer transform transition-transform duration-300 hover:scale-105"
            onClick={onManageSongs}
          >
            <h3 className="text-2xl font-semibold text-cyan-400 mb-3">Gerenciar Músicas</h3>
            <p className="text-gray-300">Adicione, edite ou remova músicas do catálogo.</p>
          </div>

          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700 cursor-pointer transform transition-transform duration-300 hover:scale-105"
            onClick={onManageAvatars}
          >
            <h3 className="text-2xl font-semibold text-cyan-400 mb-3">Gerenciar Avatares</h3>
            <p className="text-gray-300">Adicione ou edite avatares disponíveis para os jogadores.</p>
          </div>

          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700 cursor-pointer transform transition-transform duration-300 hover:scale-105"
            onClick={onManageUsers}
          >
            <h3 className="text-2xl font-semibold text-cyan-400 mb-3">Gerenciar Usuários</h3>
            <p className="text-gray-300">Visualize e modifique as informações e funções dos usuários.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelScreen;
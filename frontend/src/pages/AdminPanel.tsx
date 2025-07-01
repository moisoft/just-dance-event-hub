import React from 'react';
import ScreenWrapper from '../components/ScreenWrapper';

interface AdminPanelProps {
  onNavigate: (screen: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate }) => (
  <ScreenWrapper title="Painel do Administrador">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button onClick={() => onNavigate('admin_songs')} className="p-6 bg-pink-600 rounded-lg text-left hover:bg-pink-700 transition-colors">
        <h3 className="text-2xl font-bold">Gerir Músicas</h3>
        <p>Adicionar ou editar músicas.</p>
      </button>
      <button onClick={() => onNavigate('admin_avatars')} className="p-6 bg-cyan-600 rounded-lg text-left hover:bg-cyan-700 transition-colors">
        <h3 className="text-2xl font-bold">Gerir Avatares</h3>
        <p>Adicionar novos avatares.</p>
      </button>
      <button onClick={() => onNavigate('admin_users')} className="p-6 bg-yellow-500 rounded-lg text-left hover:bg-yellow-600 transition-colors">
        <h3 className="text-2xl font-bold">Gerir Usuários</h3>
        <p>Ver e alterar papéis de usuários.</p>
      </button>
    </div>
  </ScreenWrapper>
);

export default AdminPanel; 
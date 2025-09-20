import React, { useState } from 'react';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { useStorage } from '../../hooks/useStorage';
import FileUpload from '../FileUpload';

const AvatarUpload: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const { uploadAvatar, uploading } = useStorage({
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    onSuccess: (url) => {
      setAvatarUrl(url);
      setError('');
    },
    onError: (err) => {
      setError(err.message || 'Erro ao fazer upload do avatar');
    }
  });

  const handleUploadSuccess = (url: string) => {
    setAvatarUrl(url);
    setError('');
    
    // Aqui você pode atualizar o perfil do usuário no banco
    // Exemplo: atualizar o campo avatar_ativo_url na tabela users
  };

  const handleUploadError = (err: any) => {
    setError(err.message || 'Erro ao fazer upload do avatar');
  };

  if (!user) {
    return <div>Você precisa estar logado para fazer upload de avatar</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload de Avatar</h2>
      
      {avatarUrl && (
        <div className="mb-4">
          <img
            src={avatarUrl}
            alt="Avatar atual"
            className="w-24 h-24 rounded-full mx-auto object-cover"
          />
        </div>
      )}

      <FileUpload
        bucket="avatars"
        entityId={user.id}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        accept="image/*"
        maxSizeMB={5}
        className="mb-4"
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            {uploading ? 'Enviando...' : 'Clique para selecionar um avatar'}
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF até 5MB
          </p>
        </div>
      </FileUpload>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {avatarUrl && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Avatar enviado com sucesso!
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;

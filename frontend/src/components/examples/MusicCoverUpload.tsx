import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import FileUpload from '../FileUpload';

interface MusicCoverUploadProps {
  musicId: string;
  currentCoverUrl?: string;
  onCoverUploaded: (url: string) => void;
}

const MusicCoverUpload: React.FC<MusicCoverUploadProps> = ({
  musicId,
  currentCoverUrl,
  onCoverUploaded
}) => {
  const [error, setError] = useState<string>('');

  const { uploadMusicCover, uploading } = useStorage({
    maxSizeMB: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    onSuccess: (url) => {
      onCoverUploaded(url);
      setError('');
    },
    onError: (err) => {
      setError(err.message || 'Erro ao fazer upload da capa');
    }
  });

  const handleUploadSuccess = (url: string) => {
    onCoverUploaded(url);
    setError('');
  };

  const handleUploadError = (err: any) => {
    setError(err.message || 'Erro ao fazer upload da capa');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Capa da Música</h3>
      
      {currentCoverUrl && (
        <div className="relative">
          <img
            src={currentCoverUrl}
            alt="Capa atual"
            className="w-32 h-32 rounded-lg object-cover mx-auto"
          />
        </div>
      )}

      <FileUpload
        bucket="music-covers"
        entityId={musicId}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        accept="image/*"
        maxSizeMB={10}
        className="w-full"
      >
        <div className="text-center p-4">
          <svg
            className="mx-auto h-8 w-8 text-gray-400"
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
            {uploading ? 'Enviando capa...' : 'Upload da capa'}
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG, WebP até 10MB
          </p>
        </div>
      </FileUpload>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default MusicCoverUpload;

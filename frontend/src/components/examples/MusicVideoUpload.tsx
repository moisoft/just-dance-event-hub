import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import FileUpload from '../FileUpload';

interface MusicVideoUploadProps {
  musicId: string;
  currentVideoUrl?: string;
  onVideoUploaded: (url: string) => void;
}

const MusicVideoUpload: React.FC<MusicVideoUploadProps> = ({
  musicId,
  currentVideoUrl,
  onVideoUploaded
}) => {
  const [error, setError] = useState<string>('');

  const { uploadMusicVideo, uploading } = useStorage({
    maxSizeMB: 100, // Vídeos podem ser grandes
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    onSuccess: (url) => {
      onVideoUploaded(url);
      setError('');
    },
    onError: (err) => {
      setError(err.message || 'Erro ao fazer upload do vídeo');
    }
  });

  const handleUploadSuccess = (url: string) => {
    onVideoUploaded(url);
    setError('');
  };

  const handleUploadError = (err: any) => {
    setError(err.message || 'Erro ao fazer upload do vídeo');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Vídeo da Música (Just Dance)</h3>
      
      {currentVideoUrl && (
        <div className="relative">
          <video
            src={currentVideoUrl}
            controls
            className="w-full max-w-md mx-auto rounded-lg"
            poster={currentVideoUrl.replace('.mp4', '-poster.jpg')} // Thumbnail do vídeo
          >
            Seu navegador não suporta vídeos.
          </video>
        </div>
      )}

      <FileUpload
        bucket="music-videos"
        entityId={musicId}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        accept="video/*"
        maxSizeMB={100}
        className="w-full"
      >
        <div className="text-center p-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M15 6v6a3 3 0 003 3h6a3 3 0 003-3V6a3 3 0 00-3-3h-6a3 3 0 00-3 3zM12 18h24a3 3 0 013 3v12a3 3 0 01-3 3H12a3 3 0 01-3-3V21a3 3 0 013-3z"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 24l8 4-8 4v-8z"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            {uploading ? 'Enviando vídeo...' : 'Upload do vídeo Just Dance'}
          </p>
          <p className="text-xs text-gray-500">
            MP4, WebM, MOV até 100MB
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Recomendado: 1920x1080, 30fps, H.264
          </p>
        </div>
      </FileUpload>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {uploading && (
        <div className="p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Enviando vídeo... Isso pode demorar alguns minutos.
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicVideoUpload;

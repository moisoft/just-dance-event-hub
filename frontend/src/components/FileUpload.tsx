import React, { useRef, useState } from 'react';
import { useStorage } from '../hooks/useStorage';
import { StorageService } from '../services/supabaseService';

interface FileUploadProps {
  bucket: 'avatars' | 'music-covers' | 'music-videos' | 'event-images' | 'user-uploads';
  entityId: string;
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: any) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  children?: React.ReactNode;
  folder?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  entityId,
  onUploadSuccess,
  onUploadError,
  accept = 'image/*,audio/*',
  maxSizeMB = 10,
  className = '',
  children,
  folder
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const { uploading, progress, uploadAvatar, uploadMusicCover, uploadMusicVideo, uploadEventImage, uploadUserFile } = useStorage({
    maxSizeMB,
    allowedTypes: accept.split(',').map(type => type.trim()),
    onSuccess: onUploadSuccess,
    onError: onUploadError
  });

  const handleFileSelect = async (file: File) => {
    try {
      let result;

      switch (bucket) {
        case 'avatars':
          result = await uploadAvatar(entityId, file);
          break;
        case 'music-covers':
          result = await uploadMusicCover(entityId, file);
          break;
        case 'music-videos':
          result = await uploadMusicVideo(entityId, file);
          break;
        case 'event-images':
          result = await uploadEventImage(entityId, file);
          break;
        case 'user-uploads':
          result = await uploadUserFile(entityId, file, folder);
          break;
        default:
          throw new Error('Bucket não suportado');
      }

      if (result.error) {
        onUploadError?.(result.error);
      }
    } catch (error) {
      onUploadError?.(error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`file-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {uploading ? (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">Enviando... {progress}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            {children || (
              <>
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
                <p className="text-sm text-gray-600">
                  Clique para selecionar ou arraste um arquivo aqui
                </p>
                <p className="text-xs text-gray-500">
                  Máximo {maxSizeMB}MB • {accept}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

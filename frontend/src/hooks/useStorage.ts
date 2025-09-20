import { useState, useCallback } from 'react';
import { StorageService } from '../services/supabaseService';

interface UseStorageOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  onSuccess?: (url: string) => void;
  onError?: (error: any) => void;
}

export const useStorage = (options: UseStorageOptions = {}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'audio/wav'],
    onSuccess,
    onError
  } = options;

  const validateFile = useCallback((file: File) => {
    if (!StorageService.validateFileType(file, allowedTypes)) {
      throw new Error(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`);
    }

    if (!StorageService.validateFileSize(file, maxSizeMB)) {
      throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
    }

    return true;
  }, [allowedTypes, maxSizeMB]);

  const uploadAvatar = useCallback(async (userId: string, file: File) => {
    try {
      validateFile(file);
      setUploading(true);
      setProgress(0);

      const { data, error } = await StorageService.uploadAvatar(userId, file);
      
      if (error) throw error;
      
      setProgress(100);
      onSuccess?.(data.url);
      return { data, error: null };
    } catch (error) {
      onError?.(error);
      return { data: null, error };
    } finally {
      setUploading(false);
    }
  }, [validateFile, onSuccess, onError]);

  const uploadMusicCover = useCallback(async (musicId: string, file: File) => {
    try {
      validateFile(file);
      setUploading(true);
      setProgress(0);

      const { data, error } = await StorageService.uploadMusicCover(musicId, file);
      
      if (error) throw error;
      
      setProgress(100);
      onSuccess?.(data.url);
      return { data, error: null };
    } catch (error) {
      onError?.(error);
      return { data: null, error };
    } finally {
      setUploading(false);
    }
  }, [validateFile, onSuccess, onError]);

  const uploadMusicVideo = useCallback(async (musicId: string, file: File) => {
    try {
      validateFile(file);
      setUploading(true);
      setProgress(0);

      const { data, error } = await StorageService.uploadMusicVideo(musicId, file);
      
      if (error) throw error;
      
      setProgress(100);
      onSuccess?.(data.url);
      return { data, error: null };
    } catch (error) {
      onError?.(error);
      return { data: null, error };
    } finally {
      setUploading(false);
    }
  }, [validateFile, onSuccess, onError]);

  const uploadEventImage = useCallback(async (eventId: string, file: File) => {
    try {
      validateFile(file);
      setUploading(true);
      setProgress(0);

      const { data, error } = await StorageService.uploadEventImage(eventId, file);
      
      if (error) throw error;
      
      setProgress(100);
      onSuccess?.(data.url);
      return { data, error: null };
    } catch (error) {
      onError?.(error);
      return { data: null, error };
    } finally {
      setUploading(false);
    }
  }, [validateFile, onSuccess, onError]);

  const uploadUserFile = useCallback(async (userId: string, file: File, folder?: string) => {
    try {
      validateFile(file);
      setUploading(true);
      setProgress(0);

      const { data, error } = await StorageService.uploadUserFile(userId, file, folder);
      
      if (error) throw error;
      
      setProgress(100);
      onSuccess?.(data.url);
      return { data, error: null };
    } catch (error) {
      onError?.(error);
      return { data: null, error };
    } finally {
      setUploading(false);
    }
  }, [validateFile, onSuccess, onError]);

  const deleteFile = useCallback(async (bucket: string, path: string) => {
    try {
      setUploading(true);
      const { error } = await StorageService.deleteFile(bucket, path);
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      onError?.(error);
      return { error };
    } finally {
      setUploading(false);
    }
  }, [onError]);

  const getPublicUrl = useCallback((bucket: string, path: string) => {
    return StorageService.getPublicUrl(bucket, path);
  }, []);

  const getSignedUrl = useCallback(async (bucket: string, path: string, expiresIn?: number) => {
    try {
      const { data, error } = await StorageService.getSignedUrl(bucket, path, expiresIn);
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      onError?.(error);
      return { data: null, error };
    }
  }, [onError]);

  return {
    uploading,
    progress,
    uploadAvatar,
    uploadMusicCover,
    uploadMusicVideo,
    uploadEventImage,
    uploadUserFile,
    deleteFile,
    getPublicUrl,
    getSignedUrl,
    validateFile
  };
};

export default useStorage;

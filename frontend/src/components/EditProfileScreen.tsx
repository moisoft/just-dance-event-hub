import React, { useState } from 'react';
import { User } from '../types';
import { authApi } from '../api/api';

interface EditProfileScreenProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onBack: () => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ user, onSave, onBack }) => {
  const [formData, setFormData] = useState({
    nickname: user.nickname,
    email: user.email,
    avatar_ativo_url: user.avatar_ativo_url || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({
            ...prev,
            avatar_ativo_url: event.target!.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Nickname é obrigatório';
    } else if (formData.nickname.length < 3) {
      newErrors.nickname = 'Nickname deve ter pelo menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authApi.updateProfile({
        nickname: formData.nickname,
        email: formData.email,
        avatar_ativo_url: formData.avatar_ativo_url
      });
      
      if (response.success && response.data) {
        const updatedUser: User = {
          ...user,
          ...response.data
        };
        
        onSave(updatedUser);
        alert('Perfil atualizado com sucesso!');
      } else {
        alert(response.error || 'Erro ao atualizar perfil. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-pink-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-20 right-10 w-18 h-18 bg-blue-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 pt-16 pb-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mb-6 shadow-2xl">
              <span className="text-3xl">✏️</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Editar Perfil
            </h2>
            <p className="text-white/70 text-lg">
              Atualize suas informações pessoais
            </p>
          </div>

          {/* Form */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl mx-auto mb-4">
                    {formData.avatar_ativo_url ? (
                      <img 
                        src={formData.avatar_ativo_url} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                        <span className="text-4xl text-white">👤</span>
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-all duration-300 transform hover:scale-110">
                    <span className="text-lg">📷</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-white/60 text-sm">
                  Clique na câmera para alterar sua foto
                </p>
              </div>

              {/* Nickname Field */}
              <div>
                <label htmlFor="nickname" className="block text-white/80 text-sm font-medium mb-2">
                  Nickname *
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  className={`w-full bg-white/10 border rounded-xl py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-300 ${
                    errors.nickname ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-cyan-500'
                  }`}
                  placeholder="Seu nickname"
                  required
                />
                {errors.nickname && (
                  <p className="text-red-400 text-sm mt-1">{errors.nickname}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-white/10 border rounded-xl py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-300 ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-cyan-500'
                  }`}
                  placeholder="seu@email.com"
                  required
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* User Info */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">Informações da Conta</h4>
                <div className="space-y-1 text-sm text-white/70">
                  <p>Papel: <span className="capitalize font-medium text-cyan-400">{user.papel}</span></p>
                  <p>XP: <span className="font-medium text-purple-400">{user.xp}</span></p>
                  <p>Nível: <span className="font-medium text-yellow-400">{user.nivel}</span></p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-lg">←</span>
                    Voltar
                  </span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <span className="text-lg">💾</span>
                        Salvar Alterações
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileScreen;
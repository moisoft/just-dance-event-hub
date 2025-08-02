import React, { useState, useEffect } from 'react';
import { Coach } from '../types';
import { adminApi } from '../api/api';

interface ManageCoachesScreenProps {
  onBack: () => void;
}

const ManageCoachesScreen: React.FC<ManageCoachesScreenProps> = ({ onBack }) => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCoach, setCurrentCoach] = useState<Partial<Coach>>({});
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getCoaches();
      if (response.success) {
        setCoaches(response.data as Coach[] || []);
      }
    } catch (error) {
      console.error('Erro ao carregar treinadores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoach = () => {
    setCurrentCoach({});
    setImagePreview(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditCoach = (coach: Coach) => {
    setCurrentCoach({ ...coach });
    setImagePreview(coach.image_url || null);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteCoach = async (coachId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este treinador?')) return;

    try {
      const response = await adminApi.deleteCoach(coachId);
      if (response.success) {
        await loadCoaches();
      } else {
        console.error('Erro ao excluir treinador:', response.error);
      }
    } catch (error) {
      console.error('Erro ao excluir treinador:', error);
    }
  };

  const handleSaveCoach = async () => {
    try {
      let response;

      if (modalMode === 'create') {
        response = await adminApi.createCoach(currentCoach);
      } else {
        response = await adminApi.updateCoach(currentCoach.id!, currentCoach);
      }

      if (response.success) {
        setIsModalOpen(false);
        await loadCoaches();
      } else {
        console.error('Erro ao salvar treinador:', response.error);
      }
    } catch (error) {
      console.error('Erro ao salvar treinador:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCoach(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Atualizar o preview da imagem
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Aqui você pode implementar o upload da imagem para um servidor
    // e atualizar o currentCoach com a URL da imagem
    // Por enquanto, vamos apenas simular isso com um timeout
    setTimeout(() => {
      const fakeImageUrl = `https://example.com/coach-images/${file.name}`;
      setCurrentCoach(prev => ({ ...prev, image_url: fakeImageUrl }));
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 pt-16 pb-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 text-pink-400">Gerenciar Treinadores</h2>

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={handleCreateCoach}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Adicionar Novo Treinador
          </button>

          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Voltar
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {coaches.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-12">
                Nenhum treinador encontrado
              </div>
            ) : (
              coaches.map((coach) => (
                <div key={coach.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="h-48 bg-gray-700 flex items-center justify-center overflow-hidden">
                    {coach.image_url ? (
                      <img 
                        src={coach.image_url} 
                        alt={coach.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-500 text-5xl">👤</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-pink-300 mb-2">{coach.name}</h3>
                    <div className="flex justify-end mt-4 space-x-2">
                      <button
                        onClick={() => handleEditCoach(coach)}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCoach(coach.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal para criar/editar treinador */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-pink-400 mb-4">
                {modalMode === 'create' ? 'Adicionar Novo Treinador' : 'Editar Treinador'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                    Nome do Treinador
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={currentCoach.name || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="image">
                    Imagem do Treinador
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {imagePreview && (
                    <div className="mt-2 h-40 bg-gray-700 rounded-lg overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="image_url">
                    URL da Imagem (opcional)
                  </label>
                  <input
                    type="text"
                    id="image_url"
                    name="image_url"
                    value={currentCoach.image_url || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCoach}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCoachesScreen;
import React, { useState, useEffect } from 'react';
import { Song } from '../types';

interface EditSongModalProps {
  song: Song;
  onSave: (song: Song) => void;
  onClose: () => void;
}

const EditSongModal: React.FC<EditSongModalProps> = ({ song, onSave, onClose }) => {
  const [formData, setFormData] = useState<Song>(song);

  useEffect(() => {
    const initialNumCoaches = getNumberOfCoaches(song.game_mode);
    const updatedCoachImages = song.coach_images.length < initialNumCoaches
      ? [...song.coach_images, ...Array(initialNumCoaches - song.coach_images.length).fill('')]
      : song.coach_images;

    setFormData({
      ...song,
      coach_images: updatedCoachImages
    });
  }, [song]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'artwork_url' | 'video_file_url') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        [field]: URL.createObjectURL(file),
      }));
    }
  };

  const handleCoachImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newCoachImages = [...formData.coach_images];
      newCoachImages[index] = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        coach_images: newCoachImages,
      }));
    }
  };

  const handleAddCoachImage = () => {
    setFormData(prev => ({
      ...prev,
      coach_images: [...prev.coach_images, ''],
    }));
  };

  const handleRemoveCoachImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      coach_images: prev.coach_images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getNumberOfCoaches = (gameMode: string) => {
    switch (gameMode) {
      case 'Solo': return 1;
      case 'Dueto': return 2;
      case 'Team': return 4; // Example for team mode
      default: return 1;
    }
  };

  const numCoaches = getNumberOfCoaches(formData.game_mode);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl border border-purple-700 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold">
          &times;
        </button>
        <h2 className="text-3xl font-bold text-pink-400 mb-6 text-center">
          {song.id ? 'Editar Música' : 'Adicionar Nova Música'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">Nome:</label>
            <input type="text" id="name" value={formData.name} onChange={handleChange} required
              className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-900" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="artist">Artista:</label>
            <input type="text" id="artist" value={formData.artist} onChange={handleChange} required
              className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-900" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="artwork_url">Arte da Música:</label>
            <input type="file" id="artwork_url" accept="image/*" onChange={(e) => handleFileChange(e, 'artwork_url')} 
              className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
            {formData.artwork_url && <img src={formData.artwork_url} alt="Artwork Preview" className="mt-2 w-24 h-24 object-cover rounded-md" />}
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="video_file_url">Arquivo de Vídeo:</label>
            <input type="file" id="video_file_url" accept="video/*" onChange={(e) => handleFileChange(e, 'video_file_url')} 
              className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
            {formData.video_file_url && <video controls src={formData.video_file_url} className="mt-2 w-full h-48 object-cover rounded-md" />}
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="game_mode">Modo de Jogo:</label>
            <select id="game_mode" value={formData.game_mode} onChange={handleChange} required
              className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-900 bg-no-repeat bg-right-2 bg-center-y"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 8l6 6 6-6'/%3e%3c/svg%3e")`,
                       backgroundSize: '1.5em 1.5em' }}>
              <option value="Solo">Solo</option>
              <option value="Dueto">Dueto</option>
              <option value="Team">Team</option>
            </select>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-cyan-400">Imagens dos Coaches:</h3>
            {formData.coach_images.map((coachImage, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCoachImageChange(index, e)}
                  required={index < numCoaches} // Make required only for the initial numCoaches
                  className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                {coachImage && <img src={coachImage} alt={`Coach ${index + 1} Preview`} className="ml-2 w-16 h-16 object-cover rounded-md" />}
                {formData.coach_images.length > numCoaches && (
                  <button type="button" onClick={() => handleRemoveCoachImage(index)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-lg text-sm">
                    Remover
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddCoachImage}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm">
              Adicionar Coach
            </button>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
              Cancelar
            </button>
            <button type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSongModal;
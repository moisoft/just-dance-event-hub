import React, { useState, useEffect } from 'react';
import { Module } from '../types';
import { adminApi } from '../api/api';

interface ManageModulesScreenProps {
  onBack: () => void;
}

const ManageModulesScreen: React.FC<ManageModulesScreenProps> = ({ onBack }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<Partial<Module>>({});
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.module.getModules();
      if (response.success) {
        setModules(response.data as Module[] || []);
      }
    } catch (error) {
      console.error('Erro ao carregar módulos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateModule = () => {
    setCurrentModule({ active: true });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setCurrentModule({ ...module });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este módulo?')) return;

    try {
      const response = await adminApi.module.deleteModule(moduleId);
      if (response.success) {
        await loadModules();
      } else {
        console.error('Erro ao excluir módulo:', response.error);
      }
    } catch (error) {
      console.error('Erro ao excluir módulo:', error);
    }
  };

  const handleToggleModuleStatus = async (module: Module) => {
    try {
      const updatedModule = { ...module, active: !module.active };
      const response = await adminApi.module.updateModule(module.id, updatedModule);
      if (response.success) {
        await loadModules();
      } else {
        console.error('Erro ao atualizar status do módulo:', response.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar status do módulo:', error);
    }
  };

  const handleSaveModule = async () => {
    try {
      let response;

      if (modalMode === 'create') {
        response = await adminApi.module.createModule(currentModule);
      } else {
        response = await adminApi.module.updateModule(currentModule.id!, currentModule);
      }

      if (response.success) {
        setIsModalOpen(false);
        await loadModules();
      } else {
        console.error('Erro ao salvar módulo:', response.error);
      }
    } catch (error) {
      console.error('Erro ao salvar módulo:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentModule(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCurrentModule(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 pt-16 pb-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 text-pink-400">Gerenciar Módulos</h2>

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={handleCreateModule}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Criar Novo Módulo
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-12">
                Nenhum módulo encontrado
              </div>
            ) : (
              modules.map((module) => (
                <div key={module.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-pink-300">{module.name}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${module.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {module.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">{module.description}</p>
                    <div className="text-sm text-gray-400 mb-4">
                      <div><span className="font-semibold">Código:</span> {module.code}</div>
                      <div><span className="font-semibold">Versão:</span> {module.version}</div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => handleToggleModuleStatus(module)}
                        className={`${module.active ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-1 px-3 rounded-lg transition-colors duration-300 text-sm`}
                      >
                        {module.active ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => handleEditModule(module)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded-lg transition-colors duration-300 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg transition-colors duration-300 text-sm"
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

        {/* Modal para criar/editar módulo */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-pink-400 mb-4">
                {modalMode === 'create' ? 'Criar Novo Módulo' : 'Editar Módulo'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                    Nome do Módulo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={currentModule.name || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="code">
                    Código do Módulo
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={currentModule.code || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="description">
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={currentModule.description || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="version">
                    Versão
                  </label>
                  <input
                    type="text"
                    id="version"
                    name="version"
                    value={currentModule.version || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1.0.0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={currentModule.active || false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-gray-300 text-sm font-bold" htmlFor="active">
                    Módulo Ativo
                  </label>
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
                  onClick={handleSaveModule}
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

export default ManageModulesScreen;
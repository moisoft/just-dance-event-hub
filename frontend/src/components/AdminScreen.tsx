import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/api';
import { Song, Coach, QueueItem } from '../types';
import './AdminScreen.css';

interface AdminScreenProps {
  onLogout: () => void;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('musics');
  const [musics, setMusics] = useState<Song[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [currentEntity, setCurrentEntity] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [musicsResponse, coachesResponse, queueResponse] = await Promise.all([
        adminApi.getMusics(),
        adminApi.getCoaches(),
        adminApi.getQueue()
      ]);

      setMusics(musicsResponse.data as Song[] || []);
      setCoaches(coachesResponse.data as Coach[] || []);
      setQueue(queueResponse.data as QueueItem[] || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const openModal = (entity: string, type: 'create' | 'edit', item?: any) => {
    setCurrentEntity(entity);
    setModalType(type);
    setCurrentItem(item || {});
    setIsModalOpen(true);
    setVideoPreview('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setVideoPreview('');
  };

  const handleSave = async () => {
    try {
      let response;
      const apiMap: any = {
        musics: adminApi,
        coaches: adminApi,
        queue: adminApi
      };

      if (modalType === 'create') {
        switch (currentEntity) {
          case 'musics':
            response = await apiMap.musics.createMusic(currentItem);
            break;
          case 'coaches':
            response = await apiMap.coaches.createCoach(currentItem);
            break;
          case 'queue':
            response = await apiMap.queue.createQueueItem(currentItem);
            break;
        }
      } else {
        switch (currentEntity) {
          case 'musics':
            response = await apiMap.musics.updateMusic(currentItem.id, currentItem);
            break;
          case 'coaches':
            response = await apiMap.coaches.updateCoach(currentItem.id, currentItem);
            break;
          case 'queue':
            response = await apiMap.queue.updateQueueItem(currentItem.id, currentItem);
            break;
        }
      }

      if (response?.success) {
        await loadData();
        closeModal();
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleDelete = async (entity: string, id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este item?')) return;

    try {
      let response;
      switch (entity) {
        case 'musics':
          response = await adminApi.deleteMusic(id);
          break;
        case 'coaches':
          response = await adminApi.deleteCoach(id);
          break;
        case 'queue':
          response = await adminApi.deleteQueueItem(id);
          break;
      }

      if (response?.success) {
        await loadData();
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const handleVideoPreview = (url: string) => {
    setVideoPreview(url);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'musics':
        return (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Gerenciar Músicas & Coaches</h2>
              <div className="header-actions">
                <button className="btn-primary" onClick={() => openModal('musics', 'create')}>
                  Adicionar Música
                </button>
                <button className="btn-secondary" onClick={() => openModal('coaches', 'create')}>
                  Adicionar Coach
                </button>
              </div>
            </div>
            
            <div className="music-coach-grid">
              <div className="musics-section">
                <h3>Músicas Disponíveis</h3>
                <div className="songs-grid">
                  {musics.map(song => (
                    <div key={song.id} className="song-card">
                      <div className="song-artwork">
                        <img src={song.artwork_url} alt={song.name} />
                        {song.video_preview_url && (
                          <button 
                            className="preview-btn"
                            onClick={() => handleVideoPreview(song.video_preview_url!)}
                          >
                            ▶️
                          </button>
                        )}
                      </div>
                      <div className="song-info">
                        <h4>{song.name}</h4>
                        <p className="artist">{song.artist}</p>
                        <div className="song-details">
                          <span className={`difficulty ${song.difficulty?.toLowerCase()}`}>{song.difficulty}</span>
                          <span className="duration">{song.duration}</span>
                          <span className="year">{song.year}</span>
                        </div>
                        <div className="song-coaches">
                          {song.coaches?.map(coach => (
                            <span key={coach.id} className="coach-tag">{coach.name}</span>
                          ))}
                        </div>
                        <div className="song-actions">
                          <button className="btn-edit" onClick={() => openModal('musics', 'edit', song)}>Editar</button>
                          <button className="btn-delete" onClick={() => handleDelete('musics', song.id)}>Deletar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="coaches-section">
                <h3>Coaches Disponíveis</h3>
                <div className="coaches-grid">
                  {coaches.map(coach => (
                    <div key={coach.id} className="coach-card">
                      <div className="coach-avatar">
                        <img src={coach.image_url} alt={coach.name} />
                      </div>
                      <div className="coach-info">
                        <h4>{coach.name}</h4>
                        <p className="coach-style">{coach.specialty}</p>
                        <div className="coach-actions">
                          <button className="btn-edit" onClick={() => openModal('coaches', 'edit', coach)}>Editar</button>
                          <button className="btn-delete" onClick={() => handleDelete('coaches', coach.id)}>Deletar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );



      case 'queue':
        return (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Gerenciar Fila</h2>
              <button className="btn-primary" onClick={() => openModal('queue', 'create')}>
                Adicionar à Fila
              </button>
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Jogador(es)</th>
                    <th>Música</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map(item => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td><span className={`type-badge ${item.type}`}>{item.type}</span></td>
                      <td>
                        {item.player ? item.player.nickname : 
                         item.players ? item.players.map(p => p.nickname).join(', ') : 'N/A'}
                      </td>
                      <td>{item.song.name} - {item.song.artist}</td>
                      <td><span className={`status-badge ${item.status}`}>{item.status}</span></td>
                      <td>
                        <button className="btn-edit" onClick={() => openModal('queue', 'edit', item)}>Editar</button>
                        <button className="btn-delete" onClick={() => handleDelete('queue', item.id)}>Deletar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );



      default:
        return <div>Selecione uma aba</div>;
    }
  };

  const renderModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>{modalType === 'create' ? 'Criar' : 'Editar'} {currentEntity}</h2>
            <button className="modal-close" onClick={closeModal}>×</button>
          </div>
          <div className="modal-body">
            {renderModalForm()}
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={closeModal}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave}>Salvar</button>
          </div>
        </div>
      </div>
    );
  };

  const renderModalForm = () => {
    switch (currentEntity) {
      case 'musics':
        return (
          <div className="form-grid">
            <div className="form-group">
              <label>Nome da Música</label>
              <input
                type="text"
                value={currentItem.name || ''}
                onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Artista</label>
              <input
                type="text"
                value={currentItem.artist || ''}
                onChange={(e) => setCurrentItem({...currentItem, artist: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>URL da Capa</label>
              <input
                type="url"
                value={currentItem.artwork_url || ''}
                onChange={(e) => setCurrentItem({...currentItem, artwork_url: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>URL do Vídeo</label>
              <input
                type="url"
                value={currentItem.video_file_url || ''}
                onChange={(e) => setCurrentItem({...currentItem, video_file_url: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>URL do Preview</label>
              <input
                type="url"
                value={currentItem.video_preview_url || ''}
                onChange={(e) => setCurrentItem({...currentItem, video_preview_url: e.target.value})}
              />
              {currentItem.video_preview_url && (
                <button 
                  type="button" 
                  className="btn-preview"
                  onClick={() => handleVideoPreview(currentItem.video_preview_url)}
                >
                  Testar Preview
                </button>
              )}
            </div>
            <div className="form-group">
              <label>Modo de Jogo</label>
              <select
                value={currentItem.game_mode || 'Solo'}
                onChange={(e) => setCurrentItem({...currentItem, game_mode: e.target.value})}
              >
                <option value="Solo">Solo</option>
                <option value="Dueto">Dueto</option>
                <option value="Team">Team</option>
              </select>
            </div>
            <div className="form-group">
              <label>Dificuldade</label>
              <select
                value={currentItem.difficulty || 'Fácil'}
                onChange={(e) => setCurrentItem({...currentItem, difficulty: e.target.value})}
              >
                <option value="Fácil">Fácil</option>
                <option value="Médio">Médio</option>
                <option value="Difícil">Difícil</option>
                <option value="Extremo">Extremo</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duração (segundos)</label>
              <input
                type="number"
                value={currentItem.duration || ''}
                onChange={(e) => setCurrentItem({...currentItem, duration: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>Ano</label>
              <input
                type="number"
                value={currentItem.year || ''}
                onChange={(e) => setCurrentItem({...currentItem, year: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>Gênero</label>
              <input
                type="text"
                value={currentItem.genre || ''}
                onChange={(e) => setCurrentItem({...currentItem, genre: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={currentItem.approved || false}
                  onChange={(e) => setCurrentItem({...currentItem, approved: e.target.checked})}
                />
                Aprovada
              </label>
            </div>
          </div>
        );

      case 'coaches':
        return (
          <div className="form-grid">
            <div className="form-group">
              <label>Nome do Coach</label>
              <input
                type="text"
                value={currentItem.name || ''}
                onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>URL da Imagem</label>
              <input
                type="url"
                value={currentItem.image_url || ''}
                onChange={(e) => setCurrentItem({...currentItem, image_url: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Especialidade</label>
              <input
                type="text"
                value={currentItem.specialty || ''}
                onChange={(e) => setCurrentItem({...currentItem, specialty: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={currentItem.description || ''}
                onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
              />
            </div>
          </div>
        );

      case 'queue':
        return (
          <div className="form-grid">
            <div className="form-group">
              <label>Tipo de Entrada</label>
              <select
                value={currentItem.type || 'solo'}
                onChange={(e) => setCurrentItem({...currentItem, type: e.target.value})}
              >
                <option value="solo">Solo</option>
                <option value="dueto">Dueto</option>
                <option value="team">Team</option>
              </select>
            </div>
            <div className="form-group">
              <label>Música</label>
              <select
                value={currentItem.song_id || ''}
                onChange={(e) => setCurrentItem({...currentItem, song_id: e.target.value})}
              >
                <option value="">Selecione uma música</option>
                {musics.map(music => (
                  <option key={music.id} value={music.id}>
                    {music.name} - {music.artist}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={currentItem.status || 'pending'}
                onChange={(e) => setCurrentItem({...currentItem, status: e.target.value})}
              >
                <option value="pending">Pendente</option>
                <option value="playing">Jogando</option>
                <option value="completed">Concluído</option>
                <option value="skipped">Pulado</option>
              </select>
            </div>
          </div>
        );

      default:
        return <div>Formulário não implementado para {currentEntity}</div>;
    }
  };

  const renderVideoPreview = () => {
    if (!videoPreview) return null;

    return (
      <div className="video-preview-overlay">
        <div className="video-preview-content">
          <div className="video-preview-header">
            <h3>Preview do Vídeo</h3>
            <button className="close-preview" onClick={() => setVideoPreview('')}>×</button>
          </div>
          <video controls autoPlay className="preview-video">
            <source src={videoPreview} type="video/mp4" />
            Seu navegador não suporta o elemento de vídeo.
          </video>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-content">
          <h1>Painel de Administração</h1>
          <button className="logout-btn" onClick={onLogout}>
            Sair
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'musics' ? 'active' : ''}`}
          onClick={() => setActiveTab('musics')}
        >
          🎵 Músicas & Coaches
        </button>
        <button 
          className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          📋 Fila de Eventos
        </button>
      </div>

      <div className="admin-content">
        {renderTabContent()}
      </div>

      {renderModal()}
      {renderVideoPreview()}
    </div>
  );
};

export default AdminScreen;
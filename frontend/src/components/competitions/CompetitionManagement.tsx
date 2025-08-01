import React, { useState, useEffect } from 'react';
import './CompetitionManagement.css';

interface Competition {
  id: number;
  id_evento: number;
  nome: string;
  tipo: 'individual' | 'team';
  formato: 'eliminacao_simples' | 'round_robin' | 'suico';
  status: 'criada' | 'inscricoes_abertas' | 'em_andamento' | 'finalizada' | 'cancelada';
  max_participantes: number;
  participantes_atuais: number;
  data_inicio: string;
  data_fim?: string;
  premio?: string;
  taxa_inscricao?: number;
  regras?: string;
  chaveamento?: any;
}

interface CompetitionParticipant {
  id: number;
  id_competition: number;
  id_usuario?: number;
  id_team?: number;
  tipo_participacao: 'individual' | 'team';
  status: 'inscrito' | 'confirmado' | 'eliminado' | 'desistente';
  posicao_final?: number;
  pontuacao_total?: number;
  data_inscricao: string;
  usuario?: {
    id: number;
    nome: string;
    avatar?: string;
  };
  team?: {
    id: number;
    nome: string;
  };
}

interface CompetitionManagementProps {
  eventId: number;
  userId: number;
  userRole: string;
}

const CompetitionManagement: React.FC<CompetitionManagementProps> = ({ eventId, userId, userRole }) => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [participants, setParticipants] = useState<CompetitionParticipant[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [newCompetition, setNewCompetition] = useState({
    nome: '',
    tipo: 'individual' as 'individual' | 'team',
    formato: 'eliminacao_simples' as 'eliminacao_simples' | 'round_robin' | 'suico',
    max_participantes: 16,
    data_inicio: '',
    premio: '',
    taxa_inscricao: 0,
    regras: ''
  });

  useEffect(() => {
    loadCompetitions();
  }, [eventId]);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/competitions/event/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompetitions(data);
      } else {
        setError('Erro ao carregar competições');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (competitionId: number) => {
    try {
      const response = await fetch(`/api/competitions/${competitionId}/participants`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
      }
    } catch (err) {
      console.error('Erro ao carregar participantes:', err);
    }
  };

  const createCompetition = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/competitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newCompetition,
          id_evento: eventId
        })
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewCompetition({
          nome: '',
          tipo: 'individual',
          formato: 'eliminacao_simples',
          max_participantes: 16,
          data_inicio: '',
          premio: '',
          taxa_inscricao: 0,
          regras: ''
        });
        loadCompetitions();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao criar competição');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const registerForCompetition = async (competitionId: number) => {
    try {
      const response = await fetch(`/api/competitions/${competitionId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tipo_participacao: 'individual'
        })
      });

      if (response.ok) {
        loadCompetitions();
        if (selectedCompetition?.id === competitionId) {
          loadParticipants(competitionId);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao se inscrever na competição');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  const startCompetition = async (competitionId: number) => {
    try {
      const response = await fetch(`/api/competitions/${competitionId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        loadCompetitions();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao iniciar competição');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'criada': return '#ffa500';
      case 'inscricoes_abertas': return '#00ff00';
      case 'em_andamento': return '#0066cc';
      case 'finalizada': return '#666666';
      case 'cancelada': return '#ff0000';
      default: return '#cccccc';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'criada': return 'Criada';
      case 'inscricoes_abertas': return 'Inscrições Abertas';
      case 'em_andamento': return 'Em Andamento';
      case 'finalizada': return 'Finalizada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const canRegister = (competition: Competition) => {
    return competition.status === 'inscricoes_abertas' && 
           competition.participantes_atuais < competition.max_participantes;
  };

  const canStart = (competition: Competition) => {
    return userRole === 'admin' && 
           (competition.status === 'criada' || competition.status === 'inscricoes_abertas') &&
           competition.participantes_atuais >= 2;
  };

  return (
    <div className="competition-management">
      <div className="competition-header">
        <h2>Gerenciamento de Competições</h2>
        {userRole === 'admin' && (
          <button 
            className="btn-create-competition"
            onClick={() => setShowCreateModal(true)}
          >
            Criar Competição
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="competitions-container">
          <div className="competitions-list">
            <h3>Competições do Evento</h3>
            {competitions.length === 0 ? (
              <p className="no-competitions">Nenhuma competição encontrada</p>
            ) : (
              competitions.map(competition => (
                <div 
                  key={competition.id} 
                  className={`competition-card ${selectedCompetition?.id === competition.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCompetition(competition);
                    loadParticipants(competition.id);
                  }}
                >
                  <div className="competition-info">
                    <h4>{competition.nome}</h4>
                    <div className="competition-details">
                      <span className="competition-type">
                        {competition.tipo === 'individual' ? 'Individual' : 'Equipe'}
                      </span>
                      <span className="competition-format">
                        {competition.formato.replace('_', ' ').toUpperCase()}
                      </span>
                      <span 
                        className="competition-status"
                        style={{ color: getStatusColor(competition.status) }}
                      >
                        {getStatusText(competition.status)}
                      </span>
                    </div>
                    <div className="competition-participants">
                      {competition.participantes_atuais}/{competition.max_participantes} participantes
                    </div>
                    {competition.data_inicio && (
                      <div className="competition-date">
                        Início: {new Date(competition.data_inicio).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="competition-actions">
                    {canRegister(competition) && (
                      <button 
                        className="btn-register"
                        onClick={(e) => {
                          e.stopPropagation();
                          registerForCompetition(competition.id);
                        }}
                      >
                        Inscrever-se
                      </button>
                    )}
                    {canStart(competition) && (
                      <button 
                        className="btn-start"
                        onClick={(e) => {
                          e.stopPropagation();
                          startCompetition(competition.id);
                        }}
                      >
                        Iniciar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedCompetition && (
            <div className="competition-details-panel">
              <h3>Detalhes da Competição</h3>
              <div className="competition-info-detailed">
                <h4>{selectedCompetition.nome}</h4>
                <p><strong>Tipo:</strong> {selectedCompetition.tipo === 'individual' ? 'Individual' : 'Equipe'}</p>
                <p><strong>Formato:</strong> {selectedCompetition.formato.replace('_', ' ')}</p>
                <p><strong>Status:</strong> {getStatusText(selectedCompetition.status)}</p>
                <p><strong>Participantes:</strong> {selectedCompetition.participantes_atuais}/{selectedCompetition.max_participantes}</p>
                {selectedCompetition.premio && (
                  <p><strong>Prêmio:</strong> {selectedCompetition.premio}</p>
                )}
                {selectedCompetition.taxa_inscricao && selectedCompetition.taxa_inscricao > 0 && (
                  <p><strong>Taxa de Inscrição:</strong> R$ {selectedCompetition.taxa_inscricao}</p>
                )}
                {selectedCompetition.regras && (
                  <div>
                    <strong>Regras:</strong>
                    <p className="competition-rules">{selectedCompetition.regras}</p>
                  </div>
                )}
              </div>

              <div className="participants-list">
                <h4>Participantes</h4>
                {participants.length === 0 ? (
                  <p>Nenhum participante inscrito</p>
                ) : (
                  <div className="participants">
                    {participants.map(participant => (
                      <div key={participant.id} className="participant-item">
                        <div className="participant-info">
                          {participant.tipo_participacao === 'individual' ? (
                            <span>{participant.usuario?.nome}</span>
                          ) : (
                            <span>{participant.team?.nome}</span>
                          )}
                        </div>
                        <div className="participant-status">
                          {participant.status}
                        </div>
                        {participant.posicao_final && (
                          <div className="participant-position">
                            {participant.posicao_final}º lugar
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Criar Nova Competição</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome da Competição:</label>
                <input
                  type="text"
                  value={newCompetition.nome}
                  onChange={(e) => setNewCompetition({...newCompetition, nome: e.target.value})}
                  placeholder="Digite o nome da competição"
                />
              </div>
              <div className="form-group">
                <label>Tipo:</label>
                <select
                  value={newCompetition.tipo}
                  onChange={(e) => setNewCompetition({...newCompetition, tipo: e.target.value as 'individual' | 'team'})}
                >
                  <option value="individual">Individual</option>
                  <option value="team">Equipe</option>
                </select>
              </div>
              <div className="form-group">
                <label>Formato:</label>
                <select
                  value={newCompetition.formato}
                  onChange={(e) => setNewCompetition({...newCompetition, formato: e.target.value as any})}
                >
                  <option value="eliminacao_simples">Eliminação Simples</option>
                  <option value="round_robin">Round Robin</option>
                  <option value="suico">Sistema Suíço</option>
                </select>
              </div>
              <div className="form-group">
                <label>Máximo de Participantes:</label>
                <input
                  type="number"
                  value={newCompetition.max_participantes}
                  onChange={(e) => setNewCompetition({...newCompetition, max_participantes: parseInt(e.target.value)})}
                  min="2"
                  max="64"
                />
              </div>
              <div className="form-group">
                <label>Data de Início:</label>
                <input
                  type="datetime-local"
                  value={newCompetition.data_inicio}
                  onChange={(e) => setNewCompetition({...newCompetition, data_inicio: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Prêmio (opcional):</label>
                <input
                  type="text"
                  value={newCompetition.premio}
                  onChange={(e) => setNewCompetition({...newCompetition, premio: e.target.value})}
                  placeholder="Ex: R$ 500,00 ou Troféu"
                />
              </div>
              <div className="form-group">
                <label>Taxa de Inscrição (opcional):</label>
                <input
                  type="number"
                  value={newCompetition.taxa_inscricao}
                  onChange={(e) => setNewCompetition({...newCompetition, taxa_inscricao: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Regras (opcional):</label>
                <textarea
                  value={newCompetition.regras}
                  onChange={(e) => setNewCompetition({...newCompetition, regras: e.target.value})}
                  placeholder="Descreva as regras da competição"
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-create"
                onClick={createCompetition}
                disabled={!newCompetition.nome || !newCompetition.data_inicio}
              >
                Criar Competição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitionManagement;
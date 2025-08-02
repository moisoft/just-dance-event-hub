import React, { useState, useEffect, useCallback } from 'react';
import { Song, User, Team, TeamMember, QueueItem } from '../../types';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useEvent } from '../../contexts/EventContext';
import { useAuth } from '../../contexts/AuthContext';
import './TeamQueueModal.css';

interface TeamQueueModalProps {
  team: Team;
  song: Song;
  onClose: () => void;
}

interface TeamMemberCoachSelection {
  userId: string;
  nickname: string;
  coachImageUrl: string | null;
  isLeader: boolean;
  avatar: string;
}

const TeamQueueModal: React.FC<TeamQueueModalProps> = ({ team, song, onClose }) => {
  const { user } = useAuth();
  const { state } = useEvent();
  const { addQueueItem, sendMessage } = useWebSocket({
    eventId: state.currentEvent?.id,
    userRole: 'player',
    userId: user?.id || ''
  });

  const [isLeader, setIsLeader] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [teamMemberSelections, setTeamMemberSelections] = useState<TeamMemberCoachSelection[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Verificar se o usuário atual é o líder da equipe
  useEffect(() => {
    if (team && user) {
      const isUserLeader = team.lider_id.toString() === user.id;
      setIsLeader(isUserLeader);

      // Inicializar as seleções dos membros da equipe
      if (team.membros) {
        const initialSelections = team.membros.map(member => ({
          userId: member.id_usuario.toString(),
          nickname: member.usuario?.nickname || 'Usuário',
          coachImageUrl: null,
          isLeader: member.papel === 'lider',
          avatar: member.usuario?.avatar_ativo_url || '/default-avatar.png'
        }));
        setTeamMemberSelections(initialSelections);
      }
    }

    // Trigger entrance animation
    setTimeout(() => setAnimateIn(true), 50);
  }, [team, user]);

  // Função para lidar com a seleção de coach pelo líder
  const handleLeaderCoachSelect = (coachImageUrl: string) => {
    if (isLeader) {
      setSelectedCoach(coachImageUrl);
      
      // Atualizar a seleção do líder na lista de membros
      setTeamMemberSelections(prev => 
        prev.map(member => 
          member.userId === user?.id 
            ? { ...member, coachImageUrl } 
            : member
        )
      );

      // Notificar outros membros da equipe sobre a seleção do líder
      sendMessage('TEAM_LEADER_SELECTED_SONG', {
        teamId: team.id,
        songId: song.id,
        songName: song.name,
        leaderId: user?.id
      });
    }
  };

  // Função para lidar com a seleção de coach pelos membros
  const handleMemberCoachSelect = (coachImageUrl: string) => {
    if (!isLeader) {
      setSelectedCoach(coachImageUrl);
      
      // Notificar o líder e outros membros sobre a seleção
      sendMessage('TEAM_MEMBER_SELECTED_COACH', {
        teamId: team.id,
        userId: user?.id,
        nickname: user?.nickname,
        coachImageUrl
      });
    }
  };

  // Ouvir mensagens de seleção de coach dos membros da equipe
  useEffect(() => {
    const handleTeamMemberSelection = (data: { teamId: number, userId: string, coachImageUrl: string }) => {
      if (data.teamId === team.id) {
        setTeamMemberSelections(prev => 
          prev.map(member => 
            member.userId === data.userId 
              ? { ...member, coachImageUrl: data.coachImageUrl } 
              : member
          )
        );
      }
    };

    // Função para lidar com a seleção de música pelo líder
    const handleLeaderSongSelection = (data: { teamId: number, songId: string, songName: string, leaderId: string }) => {
      // Se o líder selecionou uma música, atualizar a interface para os membros
      if (data.teamId === team.id && !isLeader) {
        // Lógica para atualizar a interface quando o líder seleciona uma música
      }
    };

    // Obter as funções on e off do hook useWebSocket
    const { on: wsOn, off: wsOff } = useWebSocket({
      eventId: state.currentEvent?.id,
      userRole: 'player',
      userId: user?.id || ''
    });

    // Registrar ouvintes para mensagens WebSocket
    if (wsOn && wsOff) {
      wsOn('TEAM_MEMBER_SELECTED_COACH', handleTeamMemberSelection);
      wsOn('TEAM_LEADER_SELECTED_SONG', handleLeaderSongSelection);

      return () => {
        wsOff('TEAM_MEMBER_SELECTED_COACH', handleTeamMemberSelection);
        wsOff('TEAM_LEADER_SELECTED_SONG', handleLeaderSongSelection);
      };
    }
    return undefined;
  }, [team.id, isLeader, state.currentEvent?.id, user?.id]);

  // Verificar se todos os membros selecionaram seus coaches
  const allMembersSelected = teamMemberSelections.every(member => member.coachImageUrl !== null);

  // Adicionar a música à fila quando todos os membros selecionarem seus coaches
  const handleAddToQueue = () => {
    if (isLeader && allMembersSelected) {
      setIsSubmitting(true);
      
      // Criar um novo item de fila para a equipe
      const newQueueItem: QueueItem = {
        id: `temp-${Date.now()}`, // ID temporário que será substituído pelo servidor
        type: 'team',
        players: teamMemberSelections.map(member => ({
          id: member.userId,
          nickname: member.nickname,
          avatar_ativo_url: member.avatar,
          papel: 'jogador',
          email: '',
          xp: 0,
          nivel: 0
        })),
        song: song,
        coach_image_url: '', // Não usado para equipes, já que cada membro tem seu próprio coach
        status: 'pending'
      };
      
      // Enviar para o WebSocket
      addQueueItem(newQueueItem);
      
      // Notificar todos os membros da equipe
      sendMessage('TEAM_QUEUE_ITEM_ADDED', {
        teamId: team.id,
        queueItem: newQueueItem,
        memberSelections: teamMemberSelections
      });
      
      // Fechar o modal após um breve delay para feedback visual
      setTimeout(() => {
        onClose();
      }, 800);
    }
  };

  return (
    <div className={`team-queue-modal-overlay ${animateIn ? 'active' : ''}`} onClick={onClose}>
      <div className="team-queue-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{song.name} - {song.artist}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="song-info">
            <img src={song.artwork_url} alt={song.name} className="song-artwork" />
            <div className="song-details">
              <p className="song-difficulty">Dificuldade: {song.difficulty}</p>
              <p className="song-mode">Modo: {song.game_mode}</p>
              <p className="song-year">Ano: {song.year}</p>
            </div>
          </div>
          
          {isLeader ? (
            <div className="leader-section">
              <h3>Você é o líder da equipe</h3>
              <p>Escolha a música para sua equipe:</p>
              
              <div className="coach-selection">
                <h4>Escolha seu Coach:</h4>
                <div className="coach-grid">
                  {song.coach_images.map((coachUrl, index) => (
                    <div 
                      key={index}
                      className={`coach-item ${selectedCoach === coachUrl ? 'selected' : ''}`}
                      onClick={() => handleLeaderCoachSelect(coachUrl)}
                    >
                      <img src={coachUrl} alt={`Coach ${index + 1}`} />
                      <span className="coach-number">Coach {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="team-members-status">
                <h4>Status da Equipe:</h4>
                <div className="members-status-list">
                  {teamMemberSelections.map(member => (
                    <div key={member.userId} className="member-status">
                      <img 
                        src={member.avatar} 
                        alt={member.nickname} 
                        className="member-avatar"
                      />
                      <span className="member-name">{member.nickname}</span>
                      {member.isLeader && <span className="leader-badge">Líder</span>}
                      <span className={`selection-status ${member.coachImageUrl ? 'selected' : 'pending'}`}>
                        {member.coachImageUrl ? 'Coach Selecionado' : 'Aguardando Seleção'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                className={`add-to-queue-button ${allMembersSelected ? 'ready' : 'disabled'}`}
                disabled={!allMembersSelected || isSubmitting}
                onClick={handleAddToQueue}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Adicionando à Fila...
                  </>
                ) : allMembersSelected ? (
                  'Adicionar à Fila de Dança'
                ) : (
                  'Aguardando seleção de todos os membros'
                )}
              </button>
            </div>
          ) : (
            <div className="member-section">
              <h3>Seleção de Coach</h3>
              <p>O líder da equipe escolheu esta música. Selecione seu coach:</p>
              
              <div className="coach-selection">
                <div className="coach-grid">
                  {song.coach_images.map((coachUrl, index) => (
                    <div 
                      key={index}
                      className={`coach-item ${selectedCoach === coachUrl ? 'selected' : ''}`}
                      onClick={() => handleMemberCoachSelect(coachUrl)}
                    >
                      <img src={coachUrl} alt={`Coach ${index + 1}`} />
                      <span className="coach-number">Coach {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="team-members-status">
                <h4>Status da Equipe:</h4>
                <div className="members-status-list">
                  {teamMemberSelections.map(member => (
                    <div key={member.userId} className="member-status">
                      <img 
                        src={member.avatar} 
                        alt={member.nickname} 
                        className="member-avatar"
                      />
                      <span className="member-name">{member.nickname}</span>
                      {member.isLeader && <span className="leader-badge">Líder</span>}
                      <span className={`selection-status ${member.coachImageUrl ? 'selected' : 'pending'}`}>
                        {member.coachImageUrl ? 'Coach Selecionado' : 'Aguardando Seleção'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="waiting-message">
                {selectedCoach ? (
                  <p>Coach selecionado! Aguardando os outros membros da equipe...</p>
                ) : (
                  <p>Selecione seu coach para continuar</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamQueueModal;
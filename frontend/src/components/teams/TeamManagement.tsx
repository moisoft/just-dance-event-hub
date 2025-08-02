// frontend/src/components/teams/TeamManagement.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import './TeamManagement.css';

interface Team {
    id: string;
    nome: string;
    lider_id: string;
    max_membros: number;
    status: string;
    codigo_convite: string;
    membros?: TeamMember[];
}

interface TeamMember {
    id: string;
    id_usuario: string;
    papel: 'lider' | 'membro';
    status: string;
    data_entrada: string;
    usuario: {
        id: string;
        nickname: string;
        avatar_ativo_url?: string;
    };
}

interface TeamManagementProps {
    eventId: number;
    userId?: number;
    userRole?: string;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ eventId }) => {
    const { user } = useAuth();
    const { emit, on, off } = useWebSocket(); // Removendo 'socket' não utilizado
    const [teams, setTeams] = useState<Team[]>([]);
    const [userTeam, setUserTeam] = useState<Team | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para formulários
    const [newTeamName, setNewTeamName] = useState('');
    const [maxMembers, setMaxMembers] = useState(4);
    const [inviteCode, setInviteCode] = useState('');

    const loadTeams = React.useCallback(async () => {
        try {
            setLoading(true);
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
            const response = await fetch(`${API_BASE_URL}/api/teams/events/${eventId.toString()}/teams`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTeams(data.data);
            } else {
                setError('Erro ao carregar equipes');
            }
        } catch (error) {
            setError('Erro ao carregar equipes');
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    const loadUserTeam = React.useCallback(async () => {
        try {
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
            const response = await fetch(`${API_BASE_URL}/api/teams/events/${eventId.toString()}/teams?user=${user?.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const userTeamData = data.data.find((team: Team) => 
                    team.membros?.some(member => member.id_usuario === user?.id)
                );
                setUserTeam(userTeamData || null);
            }
        } catch (error) {
            console.error('Erro ao carregar equipe do usuário:', error);
        }
    }, [eventId, user]);

    useEffect(() => {
        loadTeams();
        loadUserTeam();
    }, [eventId, loadTeams, loadUserTeam]);

    // Define WebSocket event handlers
    const handleTeamUpdate = React.useCallback((data: any) => {
        if (data.eventId === eventId) {
            loadTeams();
            if (userTeam && data.teamId === userTeam.id) {
                loadUserTeam();
            }
        }
    }, [eventId, userTeam, loadTeams, loadUserTeam]);

    const handleMemberJoined = React.useCallback((data: any) => {
        if (data.eventId === eventId) {
            loadTeams();
        }
    }, [eventId, loadTeams]);

    const handleMemberLeft = React.useCallback((data: any) => {
        if (data.eventId === eventId) {
            loadTeams();
        }
    }, [eventId, loadTeams]);

    useEffect(() => {
        on('team_updated', handleTeamUpdate);
        on('team_member_joined', handleMemberJoined);
        on('team_member_left', handleMemberLeft);

        return () => {
            off('team_updated', handleTeamUpdate);
            off('team_member_joined', handleMemberJoined);
            off('team_member_left', handleMemberLeft);
        };
    }, [on, off, handleTeamUpdate, handleMemberJoined, handleMemberLeft]);

    // These functions are defined above

    const createTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            // Corrigindo a URL para usar a URL base da API configurada no .env
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
            const response = await fetch(`${API_BASE_URL}/api/teams/events/${eventId.toString()}/teams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    nome: newTeamName,
                    max_membros: maxMembers
                })
            });

            if (response.ok) {
                const data = await response.json();
                setUserTeam(data.data);
                setShowCreateForm(false);
                setNewTeamName('');
                setMaxMembers(4);
                loadTeams();
                
                // Notificar via WebSocket
                emit('team_created', {
                    eventId,
                    team: data.data
                });
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Erro ao criar equipe');
            }
        } catch (error) {
            setError('Erro ao criar equipe');
        }
    };

    const joinTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
            const response = await fetch(`${API_BASE_URL}/api/teams/teams/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    codigo_convite: inviteCode
                })
            });

            if (response.ok) {
                const data = await response.json();
                setUserTeam(data.data.team);
                setShowJoinForm(false);
                setInviteCode('');
                loadTeams();
                
                // Notificar via WebSocket
                emit('team_member_joined', {
                    eventId,
                    teamId: data.data.team.id,
                    member: data.data.member
                });
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Erro ao entrar na equipe');
            }
        } catch (error) {
            setError('Erro ao entrar na equipe');
        }
    };

    const leaveTeam = async () => {
        if (!userTeam || !window.confirm('Tem certeza que deseja sair da equipe?')) {
            return;
        }

        try {
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
            const response = await fetch(`${API_BASE_URL}/api/teams/teams/${userTeam.id.toString()}/leave`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setUserTeam(null);
                loadTeams();
                
                // Notificar via WebSocket
                emit('team_member_left', {
                    eventId,
                    teamId: userTeam.id,
                    userId: user?.id
                });
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Erro ao sair da equipe');
            }
        } catch (error) {
            setError('Erro ao sair da equipe');
        }
    };

    const copyInviteCode = (code: string) => {
        navigator.clipboard.writeText(code);
        // Mostrar feedback visual
    };

    // Handler functions are defined above using useCallback

    if (loading) {
        return (
            <div className="team-management loading">
                <div className="loading-spinner">Carregando equipes...</div>
            </div>
        );
    }

    return (
        <div className="team-management">
            <div className="team-header">
                <h2>Gerenciamento de Equipes</h2>
                {error && <div className="error-message">{error}</div>}
            </div>

            {userTeam ? (
                <div className="user-team-section">
                    <div className="team-card user-team">
                        <div className="team-info">
                            <h3>{userTeam.nome}</h3>
                            <p>Membros: {userTeam.membros?.length || 0}/{userTeam.max_membros}</p>
                            <p>Status: {userTeam.status}</p>
                        </div>
                        
                        <div className="team-members">
                            <h4>Membros:</h4>
                            <div className="members-list">
                                {userTeam.membros?.map(member => (
                                    <div key={member.id} className={`member ${member.papel}`}>
                                        <img 
                                            src={member.usuario.avatar_ativo_url || '/default-avatar.png'} 
                                            alt={member.usuario.nickname}
                                            className="member-avatar"
                                        />
                                        <span className="member-name">{member.usuario.nickname}</span>
                                        {member.papel === 'lider' && <span className="leader-badge">Líder</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {userTeam.lider_id === user?.id && (
                            <div className="team-actions">
                                <div className="invite-section">
                                    <label>Código de Convite:</label>
                                    <div className="invite-code-container">
                                        <input 
                                            type="text" 
                                            value={userTeam.codigo_convite} 
                                            readOnly 
                                            className="invite-code"
                                        />
                                        <button 
                                            onClick={() => copyInviteCode(userTeam.codigo_convite)}
                                            className="copy-button"
                                        >
                                            Copiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="team-controls">
                            <button onClick={leaveTeam} className="leave-button">
                                Sair da Equipe
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="no-team-section">
                    <p>Você não faz parte de nenhuma equipe neste evento.</p>
                    
                    <div className="team-actions">
                        <button 
                            onClick={() => setShowCreateForm(true)}
                            className="create-team-button"
                        >
                            Criar Equipe
                        </button>
                        
                        <button 
                            onClick={() => setShowJoinForm(true)}
                            className="join-team-button"
                        >
                            Entrar em Equipe
                        </button>
                    </div>

                    {showCreateForm && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h3>Criar Nova Equipe</h3>
                                <form onSubmit={createTeam}>
                                    <div className="form-group">
                                        <label>Nome da Equipe:</label>
                                        <input
                                            type="text"
                                            value={newTeamName}
                                            onChange={(e) => setNewTeamName(e.target.value)}
                                            required
                                            maxLength={50}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Máximo de Membros:</label>
                                        <select
                                            value={maxMembers}
                                            onChange={(e) => setMaxMembers(Number(e.target.value))}
                                        >
                                            {[2, 3, 4].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="form-actions">
                                        <button type="submit">Criar Equipe</button>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowCreateForm(false)}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {showJoinForm && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h3>Entrar em Equipe</h3>
                                <form onSubmit={joinTeam}>
                                    <div className="form-group">
                                        <label>Código de Convite:</label>
                                        <input
                                            type="text"
                                            value={inviteCode}
                                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                            required
                                            maxLength={8}
                                            placeholder="Ex: ABC12345"
                                        />
                                    </div>
                                    
                                    <div className="form-actions">
                                        <button type="submit">Entrar na Equipe</button>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowJoinForm(false)}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="all-teams-section">
                <h3>Todas as Equipes do Evento</h3>
                <div className="teams-grid">
                    {teams.map(team => (
                        <div key={team.id} className="team-card">
                            <div className="team-info">
                                <h4>{team.nome}</h4>
                                <p>Membros: {team.membros?.length || 0}/{team.max_membros}</p>
                                <p>Status: {team.status}</p>
                            </div>
                            
                            <div className="team-members-preview">
                                {team.membros?.slice(0, 3).map(member => (
                                    <img 
                                        key={member.id}
                                        src={member.usuario.avatar_ativo_url || '/default-avatar.png'} 
                                        alt={member.usuario.nickname}
                                        className="member-avatar-small"
                                        title={member.usuario.nickname}
                                    />
                                ))}
                                {(team.membros?.length || 0) > 3 && (
                                    <span className="more-members">+{(team.membros?.length || 0) - 3}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamManagement;
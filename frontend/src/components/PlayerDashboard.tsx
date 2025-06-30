import React from 'react';
import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { authAPI } from '../services/api';

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 10px ${({ theme }) => theme.colors.primary}; }
  50% { box-shadow: 0 0 20px ${({ theme }) => theme.colors.secondary}; }
  100% { box-shadow: 0 0 10px ${({ theme }) => theme.colors.primary}; }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.title};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: 2rem;
  font-size: 3rem;
  text-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
`;

const WelcomeCard = styled.div`
  background: rgba(46, 46, 46, 0.8);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  animation: ${floatAnimation} 3s ease-in-out infinite;
  border: 2px solid ${({ theme }) => theme.colors.border};
`;

const PlayerName = styled.h2`
  font-family: ${({ theme }) => theme.fonts.title};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 1rem;
  font-size: 2rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const StatCard = styled.div`
  background: rgba(75, 0, 130, 0.3);
  padding: 1.5rem;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
  animation: ${pulseGlow} 2s infinite;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const StatLabel = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.p`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 2rem;
  font-weight: bold;
  font-family: ${({ theme }) => theme.fonts.title};
`;

const ProgressList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
`;

const ProgressItem = styled.li`
  background: rgba(255, 255, 255, 0.1);
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  
  &:hover {
    transform: translateX(10px);
    background: rgba(255, 255, 255, 0.2);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  text-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
`;

interface PlayerData {
    nickname: string;
    xp: number;
    level: number;
    progress: string[];
}

const PlayerDashboard: React.FC = () => {
    const [playerData, setPlayerData] = useState<PlayerData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayerData = async () => {
            try {
                const data = await authAPI.getProfile();
                setPlayerData(data);
            } catch (error) {
                console.error("Error fetching player data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerData();
    }, []);

    if (loading) {
        return <LoadingContainer>Carregando seu perfil...</LoadingContainer>;
    }

    return (
        <DashboardContainer>
            <Title>Dashboard do Jogador</Title>
            {playerData ? (
                <>
                    <WelcomeCard>
                        <PlayerName>Bem-vindo, {playerData.nickname}!</PlayerName>
                        <StatsContainer>
                            <StatCard>
                                <StatLabel>XP Total</StatLabel>
                                <StatValue>{playerData.xp}</StatValue>
                            </StatCard>
                            <StatCard>
                                <StatLabel>Nível</StatLabel>
                                <StatValue>{playerData.level}</StatValue>
                            </StatCard>
                        </StatsContainer>
                    </WelcomeCard>
                    
                    <Title as="h3">Seu Progresso</Title>
                    <ProgressList>
                        {playerData.progress.map((item: any, index: number) => (
                            <ProgressItem key={index}>{item}</ProgressItem>
                        ))}
                    </ProgressList>
                </>
            ) : (
                <WelcomeCard>
                    <PlayerName>Nenhum dado disponível</PlayerName>
                </WelcomeCard>
            )}
        </DashboardContainer>
    );
};

export default PlayerDashboard;
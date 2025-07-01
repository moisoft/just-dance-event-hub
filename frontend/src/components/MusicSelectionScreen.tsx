import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { musicAPI } from '../services/api';
import { Music } from '../types';

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const Container = styled.div`
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

const MusicGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
`;

const MusicCard = styled.div`
  background: rgba(46, 46, 46, 0.8);
  border-radius: 15px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 2px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 0 20px ${({ theme }) => theme.colors.primary};
  }
`;

const MusicTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.title};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 1rem;
`;

const MusicInfo = styled.p`
  color: ${({ theme }) => theme.colors.text};
  margin: 0.5rem 0;
  font-size: 1.1rem;
`;

const DifficultyBadge = styled.span<{ difficulty: number }>`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: linear-gradient(45deg, 
    ${({ theme, difficulty }) => {
      if (difficulty <= 2) return `${theme.colors.secondary}, #4CAF50`;
      if (difficulty <= 3) return `#FFA500, #FF6B6B`;
      return `${theme.colors.primary}, #FF4444`;
    }}
  );
  color: white;
  font-weight: bold;
  margin-top: 1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.5rem;
  background: linear-gradient(90deg, #2E2E2E, #3E3E3E, #2E2E2E);
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 15px;
  margin: 2rem auto;
  max-width: 600px;
`;

const MusicSelectionScreen: React.FC = () => {
    const [musicList, setMusicList] = useState<Music[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMusic = async () => {
            try {
                const musicData = await musicAPI.getAll();
                setMusicList(musicData);
            } catch (err) {
                setError('Failed to load music list');
            } finally {
                setLoading(false);
            }
        };

        loadMusic();
    }, []);

    if (loading) {
        return <LoadingContainer>Carregando músicas...</LoadingContainer>;
    }

    if (error) {
        return <ErrorContainer>{error}</ErrorContainer>;
    }

    return (
        <Container>
            <Title>Selecione uma Música</Title>
            <MusicGrid>
                {musicList.map((music) => (
                    <MusicCard key={music.id}>
                        <MusicTitle>{music.name}</MusicTitle>
                        <MusicInfo>Artista: {music.artist || 'Desconhecido'}</MusicInfo>
                        <DifficultyBadge difficulty={music.difficulty}>
                            {music.difficulty} ★
                        </DifficultyBadge>
                    </MusicCard>
                ))}
            </MusicGrid>
        </Container>
    );
};

export default MusicSelectionScreen;
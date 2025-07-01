import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { eventAPI, queueAPI } from '../services/api';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const neonPulse = keyframes`
  0% { box-shadow: 0 0 10px #FF007F; }
  50% { box-shadow: 0 0 20px #00FFFF; }
  100% { box-shadow: 0 0 10px #FF007F; }
`;

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.title};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: 2rem;
  font-size: 3rem;
  text-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
`;

const Subtitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.title};
  color: ${({ theme }) => theme.colors.secondary};
  margin: 2rem 0 1rem;
  font-size: 2rem;
`;

const EventList = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const EventItem = styled.li`
  background: rgba(46, 46, 46, 0.8);
  padding: 1rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${({ theme }) => theme.colors.border};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 0 15px ${({ theme }) => theme.colors.primary};
  }
`;

const EventName = styled.h3`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.title};
  margin: 0;
  text-align: center;
`;

const SelectedEventPanel = styled.div`
  background: rgba(75, 0, 130, 0.3);
  padding: 2rem;
  border-radius: 20px;
  margin-top: 2rem;
  animation: ${neonPulse} 2s infinite;
`;

const InputGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 0.8rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  width: 100%;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Button = styled.button`
  background: linear-gradient(45deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  border: none;
  border-radius: 25px;
  padding: 1rem 2rem;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  width: 100%;
  margin-top: 1rem;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255, 0, 127, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }
`;

interface Event {
    id: number;
    nome_evento: string;
}

interface Score {
    player1: number;
    player2: number;
}

const StaffPanel: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [matchId, setMatchId] = useState('');
    const [score, setScore] = useState<Score>({ player1: 0, player2: 0 });

    useEffect(() => {
        const fetchEvents = async () => {
            const fetchedEvents = await eventAPI.getAll();
            setEvents(fetchedEvents);
        };
        fetchEvents();
    }, []);

    const handleFinishMatch = async () => {
        if (selectedEvent && matchId) {
            await queueAPI.markAsPlayed(matchId, score.player1); // Assuming player1's score is the primary score to be saved.
            // Optionally refresh events or match data here
        }
    };

    return (
        <Container>
            <Title>Painel de Staff</Title>
            <Subtitle>Eventos Disponíveis</Subtitle>
            <EventList>
                {events.map(event => (
                    <EventItem key={event.id} onClick={() => setSelectedEvent(event)}>
                        <EventName>{event.nome_evento}</EventName>
                    </EventItem>
                ))}
            </EventList>
            {selectedEvent && (
                <SelectedEventPanel>
                    <Subtitle>Evento: {selectedEvent.nome_evento}</Subtitle>
                    <InputGroup>
                        <Input
                            type="text"
                            placeholder="ID da Partida"
                            value={matchId}
                            onChange={(e) => setMatchId(e.target.value)}
                        />
                        <Input
                            type="number"
                            placeholder="Pontuação Jogador 1"
                            value={score.player1}
                            onChange={(e) => setScore({ ...score, player1: Number(e.target.value) })}
                        />
                        <Input
                            type="number"
                            placeholder="Pontuação Jogador 2"
                            value={score.player2}
                            onChange={(e) => setScore({ ...score, player2: Number(e.target.value) })}
                        />
                    </InputGroup>
                    <Button onClick={handleFinishMatch}>Finalizar Partida</Button>
                </SelectedEventPanel>
            )}
        </Container>
    );
};

export default StaffPanel;
import React, { useEffect, useState } from 'react';
import { getEvents, finishMatch } from '../services/api';

const StaffPanel: React.FC = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [matchId, setMatchId] = useState('');
    const [score, setScore] = useState({ player1: 0, player2: 0 });

    useEffect(() => {
        const fetchEvents = async () => {
            const fetchedEvents = await getEvents();
            setEvents(fetchedEvents);
        };
        fetchEvents();
    }, []);

    const handleFinishMatch = async () => {
        if (selectedEvent && matchId) {
            await finishMatch(matchId, score);
            // Optionally refresh events or match data here
        }
    };

    return (
        <div>
            <h1>Painel de Staff</h1>
            <h2>Eventos</h2>
            <ul>
                {events.map(event => (
                    <li key={event.id} onClick={() => setSelectedEvent(event)}>
                        {event.nome_evento}
                    </li>
                ))}
            </ul>
            {selectedEvent && (
                <div>
                    <h3>Evento Selecionado: {selectedEvent.nome_evento}</h3>
                    <input
                        type="text"
                        placeholder="ID da Partida"
                        value={matchId}
                        onChange={(e) => setMatchId(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Pontuação Jogador 1"
                        value={score.player1}
                        onChange={(e) => setScore({ ...score, player1: Number(e.target.value) })}
                    />
                    <input
                        type="number"
                        placeholder="Pontuação Jogador 2"
                        value={score.player2}
                        onChange={(e) => setScore({ ...score, player2: Number(e.target.value) })}
                    />
                    <button onClick={handleFinishMatch}>Finalizar Partida</button>
                </div>
            )}
        </div>
    );
};

export default StaffPanel;
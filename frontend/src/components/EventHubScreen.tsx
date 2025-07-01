import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { eventAPI } from '../services/api';

// Contexto global para eventId
export const EventContext = React.createContext<{ eventId: string | null, setEventId: (id: string) => void }>({ eventId: null, setEventId: () => {} });

interface EventHubScreenProps {
    user: { nickname: string };
}

const EventHubScreen: React.FC<EventHubScreenProps> = ({ user }) => {
    const [eventCode, setEventCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const { setEventId } = useContext(EventContext);

    const handleEnterEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!eventCode.trim()) {
            setError('Digite o código do evento.');
            return;
        }
        setLoading(true);
        try {
            await eventAPI.getByCode(eventCode.trim());
            setEventId(eventCode.trim());
            history.push(`/player-dashboard`);
        } catch (err) {
            setError('Código inválido ou evento não encontrado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#101624] px-2">
            <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-2 mt-8">Bem-vindo(a), {user.nickname}!</h1>
            <p className="text-cyan-400 text-lg text-center mb-10">Pronto(a) para o show?</p>
            <div className="w-full max-w-md bg-[#181f2e] rounded-2xl shadow-2xl p-8 border border-[#232a3a] flex flex-col items-center">
                <form className="w-full flex flex-col items-center" onSubmit={handleEnterEvent}>
                    <label className="block text-sm font-medium text-gray-400 mb-2 text-center w-full">Insira o Código do Evento</label>
                    <input
                        type="text"
                        className="w-full text-center text-2xl tracking-widest bg-[#232a3a] border border-[#232a3a] rounded-lg uppercase px-4 py-6 mb-6 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        placeholder="CÓDIGO"
                        value={eventCode}
                        onChange={e => setEventCode(e.target.value)}
                        maxLength={12}
                        autoFocus
                    />
                    {error && <div className="text-red-400 text-center font-semibold mb-4 w-full">{error}</div>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 text-lg font-bold rounded-lg bg-pink-600 hover:bg-pink-700 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                        <span className="mr-2">🎵</span> Entrar no Evento
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EventHubScreen;
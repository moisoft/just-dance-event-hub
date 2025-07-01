import React, { useEffect, useState, useContext } from 'react';
import { authAPI, queueAPI } from '../services/api';

// Contexto para fornecer eventId globalmente (pode ser adaptado para seu fluxo)
const EventContext = React.createContext<{ eventId: string | null }>({ eventId: null });

const PlayerDashboard = () => {
    const { eventId } = useContext(EventContext);
    const [user, setUser] = useState<any>(null);
    const [eventData, setEventData] = useState<any>(null);
    const [performanceTip, setPerformanceTip] = useState('');
    const [isLoadingTip, setIsLoadingTip] = useState(false);
    const [loading, setLoading] = useState(true);

    // Buscar perfil do usuário
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await authAPI.getProfile();
                setUser(res.user);
            } catch (err) {
                setUser(null);
            }
        }
        fetchUser();
    }, []);

    // Buscar dados do evento/fila periodicamente
    useEffect(() => {
        let interval: any;
        async function fetchEventData() {
            if (eventId) {
                try {
                    const res = await queueAPI.getEventQueue(eventId);
                    setEventData(res);
                } catch (err) {
                    setEventData(null);
                }
            }
        }
        if (eventId) {
            fetchEventData();
            interval = setInterval(fetchEventData, 10000); // Atualiza a cada 10s
        }
        return () => clearInterval(interval);
    }, [eventId]);

    const generateTip = async () => {
        setIsLoadingTip(true);
        setPerformanceTip('');
        // Aqui você pode chamar uma API real de dicas
        setTimeout(() => {
            setPerformanceTip("Dance como se ninguém estivesse olhando! ✨");
            setIsLoadingTip(false);
        }, 1200);
    };

    if (loading || !user || !eventData) return <div className="text-white text-center mt-10">Carregando...</div>;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#101624] px-2 py-8">
            <div className="w-full max-w-xs flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white">{user.nickname}</h1>
                <img src={user.avatar_ativo_url || user.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full border-4 border-cyan-400" />
            </div>
            <div className="w-full max-w-xs space-y-4">
                <div className="bg-pink-500 rounded-xl p-4 flex items-center mb-2">
                    <div className="w-10 h-10 flex items-center justify-center bg-pink-400 rounded-full text-white text-2xl mr-4">-</div>
                    <div>
                        <p className="text-white text-sm">Most Danced</p>
                        <p className="text-white text-2xl font-bold">{eventData.mostDanced || '-'}</p>
                    </div>
                </div>
                <div className="bg-[#232a3a] rounded-xl p-4 text-white text-center text-3xl font-bold mb-2">
                    <p className="text-base text-gray-400 mb-1">High Score</p>
                    {eventData.highScore || '-'}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#232a3a] rounded-xl p-4 text-white text-center">
                        <p className="text-base text-gray-400 mb-1">Stars</p>
                        <div className="flex justify-center">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-2xl ${i < (eventData.stars || 0) ? 'text-yellow-400' : 'text-gray-500'}`}>★</span>
                            ))}
                        </div>
                    </div>
                    <div className="bg-[#232a3a] rounded-xl p-4 text-white text-center">
                        <p className="text-base text-gray-400 mb-1">Position</p>
                        <p className="text-4xl font-bold">{eventData.queuePosition || '-'}</p>
                    </div>
                </div>
                <div className="bg-cyan-800 bg-opacity-90 text-cyan-100 rounded-xl p-4 text-center font-semibold text-lg mb-2 animate-pulse">
                    Tempo estimado de espera: <span className="font-bold">{eventData.estimatedWait || '-'}</span>
                </div>
                <button
                    onClick={generateTip}
                    disabled={isLoadingTip}
                    className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg flex items-center justify-center text-lg transition-colors mb-2 disabled:opacity-50"
                >
                    <span className="mr-2">✨</span> Gerar Dica de Performance
                </button>
                {performanceTip && <div className="bg-gray-900 text-cyan-300 rounded-lg p-3 text-center animate-fade-in">{performanceTip}</div>}
            </div>
            {/* Barra de navegação inferior */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm flex justify-around items-center p-2 bg-[#232a3a] rounded-full mt-8 shadow-lg">
                <button className="p-3 rounded-full bg-pink-600 text-white"><svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></button>
                <button className="p-3 rounded-full text-gray-400 hover:bg-gray-700"><svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg></button>
                <button className="p-3 rounded-full text-gray-400 hover:bg-gray-700"><svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg></button>
                <button className="p-3 rounded-full text-gray-400 hover:bg-gray-700"><svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
            </div>
        </div>
    );
};

export default PlayerDashboard;
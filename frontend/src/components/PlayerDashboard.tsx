import React, { useState } from 'react';
import { User } from '../types';

interface PlayerDashboardProps {
  user: User;
}

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ user }) => {
  const [tip, setTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);

  const generatePerformanceTip = async () => {
    setLoadingTip(true);
    setTip(null);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const tips = [
      "Mantenha seus joelhos flexionados para um melhor fluxo!",
      "Use todo o seu corpo para expressar a música!",
      "Pratique as partes mais difíceis em câmera lenta primeiro!",
      "Sinta o ritmo e deixe a música te guiar!",
      "Não tenha medo de adicionar seu próprio estilo!",
      "Hidrate-se bem antes e depois de dançar!",
      "Alongue-se para evitar lesões e melhorar sua flexibilidade!",
      "Assista aos coaches para pegar os movimentos mais sutis!",
      "Divirta-se! A alegria é a chave para uma ótima performance!"
    ];
    setTip(tips[Math.floor(Math.random() * tips.length)]);
    setLoadingTip(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 pt-16 pb-20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 text-pink-400">Olá, {user.nickname}!</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700">
            <h3 className="text-2xl font-semibold mb-3 text-cyan-400">Seu Desempenho</h3>
            <p className="text-lg">🏆 Recorde: <span className="font-bold">12,500</span> (Blinding Lights)</p>
            <p className="text-lg">✨ Estrelas Totais: <span className="font-bold">{user.xp}</span></p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700">
            <h3 className="text-2xl font-semibold mb-3 text-cyan-400">Fila de Dança</h3>
            <p className="text-lg">Posição na Fila: <span className="font-bold">#3</span></p>
            <p className="text-lg">Próxima Música: <span className="font-bold">Bad Romance</span></p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700 mb-8">
          <h3 className="text-2xl font-semibold mb-4 text-pink-400">Recursos Gemini</h3>
          <button
            onClick={generatePerformanceTip}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 text-lg flex items-center justify-center"
            disabled={loadingTip}
          >
            {loadingTip ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              '✨ Gerar Dica de Performance'
            )}
          </button>
          {tip && (
            <p className="mt-4 p-4 bg-gray-700 rounded-lg text-lg italic border border-cyan-500">{tip}</p>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700">
          <h3 className="text-2xl font-semibold mb-4 text-pink-400">Músicas Mais Dançadas</h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center bg-gray-700 p-3 rounded-md border border-gray-600">
              <span className="text-lg">1. Blinding Lights</span>
              <span className="text-cyan-300">50 vezes</span>
            </li>
            <li className="flex justify-between items-center bg-gray-700 p-3 rounded-md border border-gray-600">
              <span className="text-lg">2. Bad Romance</span>
              <span className="text-cyan-300">45 vezes</span>
            </li>
            <li className="flex justify-between items-center bg-gray-700 p-3 rounded-md border border-gray-600">
              <span className="text-lg">3. Despacito</span>
              <span className="text-cyan-300">30 vezes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
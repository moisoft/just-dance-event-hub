import React, { useState } from 'react';
import { User } from '../types';

interface EventHubScreenProps {
  user: User;
  onEnterEvent: (eventCode: string) => void;
}

const EventHubScreen: React.FC<EventHubScreenProps> = ({ user, onEnterEvent }) => {
  const [eventCode, setEventCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventCode.trim()) {
      onEnterEvent(eventCode);
    } else {
      alert('Por favor, insira um código de evento.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-purple-700 text-center">
        <h2 className="text-3xl font-bold mb-4 text-pink-400">
          Bem-vindo, {user.nickname}!
        </h2>
        <p className="text-lg text-gray-300 mb-6">
          Insira o código do evento para começar a dançar!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="eventCode" className="sr-only">Código do Evento</label>
            <input
              type="text"
              id="eventCode"
              className="shadow appearance-none border border-gray-700 rounded-lg w-full py-3 px-4 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-900 text-center text-xl uppercase tracking-wider"
              placeholder="Código do Evento"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 text-xl"
          >
            Entrar no Evento
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventHubScreen;
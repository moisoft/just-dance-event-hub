import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await authAPI.login(email, password);
            if (response.token && response.user) {
                localStorage.setItem('token', response.token);
                switch (response.user.papel) {
                    case 'admin':
                        history.push('/admin/plugins');
                        break;
                    case 'staff':
                    case 'organizador':
                        history.push('/staff-panel');
                        break;
                    case 'jogador':
                    default:
                        history.push('/event-hub/' + (response.user.eventCode || ''));
                        break;
                }
            }
        } catch (err) {
            setError('Email ou senha incorretos.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#101624]">
            <div className="w-full max-w-md bg-[#181f2e] rounded-2xl shadow-2xl p-8 border border-[#232a3a] relative animate-fade-in">
                <div className="flex flex-col items-center mb-8">
                    <div className="inline-block p-2 bg-[#232a3a] rounded-full mb-2">
                        <div className="w-12 h-12 flex items-center justify-center bg-pink-500 rounded-full">
                            <span className="text-3xl text-[#181f2e]">-</span>
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mt-2 tracking-wider text-white text-center">Just Dance Hub</h1>
                    <p className="text-cyan-400 mt-2 text-center">Sua Fila. Seu Progresso. Sua Pista de Dança.</p>
                </div>
                <div className="flex justify-center mb-6 border-b border-pink-400">
                    <button className="w-1/2 py-3 text-lg font-semibold text-pink-400 border-b-2 border-pink-400">Entrar</button>
                    <Link to="/register" className="w-1/2 py-3 text-lg font-semibold text-gray-500 text-center">Criar Conta</Link>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        className="w-full px-4 py-3 bg-[#232a3a] border border-[#232a3a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        placeholder="exemplo@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="w-full px-4 py-3 bg-[#232a3a] border border-[#232a3a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    {error && <div className="text-red-400 text-center font-semibold">{error}</div>}
                    <button type="submit" className="w-full py-4 text-lg font-bold rounded-lg bg-pink-600 hover:bg-pink-700 transition-colors">Entrar no Ritmo!</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
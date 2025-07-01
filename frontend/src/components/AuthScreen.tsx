import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthScreen: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const history = useHistory();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isLoginView) {
                await authAPI.login(email, password);
                history.push('/event-hub');
            } else {
                await authAPI.register(nickname, email, password);
                // Após o registro, redireciona para a tela de login para que o usuário possa entrar
                setIsLoginView(true);
            }
        } catch (error) {
            console.error('Error during authentication:', error);
            // Aqui você pode adicionar um feedback para o usuário, como um toast ou uma mensagem de erro.
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden [&>*]:!bg-gray-900">
            <div className="absolute top-0 left-0 w-full h-full z-0">
                <div className="absolute w-96 h-96 bg-pink-500 rounded-full -top-20 -left-20 filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-cyan-500 rounded-full -bottom-20 -right-20 filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-md mx-auto bg-gray-800/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl p-8 z-10 neon-glow">
                <div className="text-center mb-8">
                    {/* Placeholder for the stylized dancer logo */}
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-cyan-400 rounded-full flex items-center justify-center">
                        <p className="text-white font-bold text-4xl">JD</p>
                    </div>
                    <h1 className="text-4xl font-bold">Just Dance Hub</h1>
                </div>

                <div className="relative overflow-hidden h-auto md:h-80">
                    {/* Login Form */}
                    <div className={`transition-transform duration-700 ease-in-out ${isLoginView ? 'transform translate-x-0' : 'transform -translate-x-full'}`}>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="login-email" className="block mb-2 text-sm font-medium">Email</label>
                                <input type="email" id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-pink-500 focus:border-pink-500" placeholder="you@example.com" required />
                            </div>
                            <div>
                                <label htmlFor="login-password" className="block mb-2 text-sm font-medium">Password</label>
                                <input type="password" id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-pink-500 focus:border-pink-500" placeholder="••••••••" required />
                            </div>
                            <button type="submit" className="w-full p-3 font-semibold text-white bg-pink-600 rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 shadow-lg shadow-pink-500/50 transition-all duration-300 transform hover:scale-105">Login</button>
                            <p className="text-sm text-center">Don't have an account? <button onClick={() => setIsLoginView(false)} className="text-cyan-400 hover:underline">Sign up</button></p>
                        </form>
                    </div>

                    {/* Registration Form */}
                    <div className={`absolute top-0 left-0 w-full transition-transform duration-700 ease-in-out ${!isLoginView ? 'transform translate-x-0' : 'transform translate-x-full'}`}>
                        <form onSubmit={handleSubmit} className="space-y-6">
                             <div>
                                <label htmlFor="register-nickname" className="block mb-2 text-sm font-medium">Nickname</label>
                                <input type="text" id="register-nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500" placeholder="YourDancerName" required />
                            </div>
                            <div>
                                <label htmlFor="register-email" className="block mb-2 text-sm font-medium">Email</label>
                                <input type="email" id="register-email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500" placeholder="you@example.com" required />
                            </div>
                            <div>
                                <label htmlFor="register-password" className="block mb-2 text-sm font-medium">Password</label>
                                <input type="password" id="register-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500" placeholder="••••••••" required />
                            </div>
                            <button type="submit" className="w-full p-3 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 shadow-lg shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105">Sign Up</button>
                            <p className="text-sm text-center">Already have an account? <button onClick={() => setIsLoginView(true)} className="text-pink-400 hover:underline">Login</button></p>
                        </form>
                    </div>
                </div>
            </div>
        </div>);
};

export default AuthScreen;
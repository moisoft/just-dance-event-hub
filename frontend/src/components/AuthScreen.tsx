import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { registerUser, loginUser } from '../services/api';

const AuthScreen: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const history = useHistory();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await loginUser(email, password);
                history.push('/event-hub');
            } else {
                await registerUser(nickname, email, password);
                history.push('/login');
            }
        } catch (error) {
            console.error('Error during authentication:', error);
        }
    };

    return (
        <div className="auth-screen">
            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            <form onSubmit={handleSubmit}>
                {!isLogin && (
                    <div>
                        <label>Nickname:</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            required
                        />
                    </div>
                )}
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Create an account' : 'Already have an account?'}
            </button>
        </div>
    );
};

export default AuthScreen;
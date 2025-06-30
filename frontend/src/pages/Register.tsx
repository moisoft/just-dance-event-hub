import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import styled from 'styled-components';
import { authAPI } from '../services/api';

const RegisterContainer = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
`;

const RegisterCard = styled.div.attrs({
    className: 'card'
})`
    max-width: 400px;
    width: 100%;
`;

const Title = styled.h2.attrs({
    className: 'gradient-text'
})`
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-align: center;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text};
`;

const ErrorMessage = styled.p.attrs({
    className: 'neon-text'
})`
    color: ${({ theme }) => theme.colors.primary};
    text-align: center;
    margin: 1rem 0;
`;

const LoginLink = styled(Link)`
    text-align: center;
    margin-top: 1rem;
    color: ${({ theme }) => theme.colors.text};
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
        color: ${({ theme }) => theme.colors.primary};
        text-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
    }
`;

const DancerIcon = styled.div.attrs({
    className: 'floating-element'
})`
    font-size: 3rem;
    margin-bottom: 2rem;
    &::after {
        content: '🕺';
    }
`;

const Register = () => {
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await authAPI.register(nickname, email, password);
            history.push('/login');
        } catch (err) {
            setError('Erro ao registrar. Tente novamente.');
        }
    };

    return (
        <RegisterContainer>
            <RegisterCard>
                <DancerIcon />
                <Title>Registrar</Title>
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>Nickname:</Label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Email:</Label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Senha:</Label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </FormGroup>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    <button type="submit" className="pulse-element">Registrar</button>
                    <LoginLink to="/login" className="neon-text">
                        Já tem uma conta? Entre aqui!
                    </LoginLink>
                </Form>
            </RegisterCard>
        </RegisterContainer>
    );
};

export default Register;
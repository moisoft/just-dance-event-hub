import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthScreen from '../../components/AuthScreen';

// Mock do AuthContext
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockLogout = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
    isLoading: false,
    isAuthenticated: false,
  }),
}));

// Mock do authApi
jest.mock('../../api/api', () => ({
  authApi: {
    mockLogin: jest.fn(),
    register: jest.fn(),
  },
}));

describe('AuthScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(<AuthScreen />);
    
    expect(screen.getByText('Entrar')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('switches to register form when clicking register link', () => {
    render(<AuthScreen />);
    
    const registerLink = screen.getByText('Criar conta');
    fireEvent.click(registerLink);
    
    expect(screen.getByText('Criar Conta')).toBeInTheDocument();
    expect(screen.getByLabelText('Nickname')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar Conta' })).toBeInTheDocument();
  });

  it('switches back to login form when clicking login link', () => {
    render(<AuthScreen />);
    
    // Switch to register
    fireEvent.click(screen.getByText('Criar conta'));
    
    // Switch back to login
    fireEvent.click(screen.getByText('Já tem uma conta?'));
    
    expect(screen.getByText('Entrar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('calls login function when login form is submitted', async () => {
    mockLogin.mockResolvedValue({ success: true });
    
    render(<AuthScreen />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('calls register function when register form is submitted', async () => {
    mockRegister.mockResolvedValue({ success: true });
    
    render(<AuthScreen />);
    
    // Switch to register form
    fireEvent.click(screen.getByText('Criar conta'));
    
    const nicknameInput = screen.getByLabelText('Nickname');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Criar Conta' });
    
    fireEvent.change(nicknameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
    });
  });

  it('shows error message when login fails', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });
    
    render(<AuthScreen />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows error message when register fails', async () => {
    mockRegister.mockResolvedValue({ success: false, error: 'Email already exists' });
    
    render(<AuthScreen />);
    
    // Switch to register form
    fireEvent.click(screen.getByText('Criar conta'));
    
    const nicknameInput = screen.getByLabelText('Nickname');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Criar Conta' });
    
    fireEvent.change(nicknameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('validates required fields in login form', async () => {
    render(<AuthScreen />);
    
    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
    });
  });

  it('validates required fields in register form', async () => {
    render(<AuthScreen />);
    
    // Switch to register form
    fireEvent.click(screen.getByText('Criar conta'));
    
    const submitButton = screen.getByRole('button', { name: 'Criar Conta' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Nickname é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<AuthScreen />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  it('validates password length', async () => {
    render(<AuthScreen />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
    });
  });

  it('shows loading state during login', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<AuthScreen />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Entrando...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Entrando...')).not.toBeInTheDocument();
    });
  });

  it('shows loading state during register', async () => {
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<AuthScreen />);
    
    // Switch to register form
    fireEvent.click(screen.getByText('Criar conta'));
    
    const nicknameInput = screen.getByLabelText('Nickname');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Criar Conta' });
    
    fireEvent.change(nicknameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Criando conta...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Criando conta...')).not.toBeInTheDocument();
    });
  });
});


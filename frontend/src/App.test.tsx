import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import AuthScreen from './components/AuthScreen';
import { User } from './types';

// Mock the AuthScreen to immediately call onLogin with a specific user
jest.mock('./components/AuthScreen', () => ({
  __esModule: true,
  default: ({ onLogin }: { onLogin: (user: User) => void }) => (
    <button onClick={() => onLogin({ id: '1', nickname: 'TestPlayer', papel: 'jogador', email: 'player@test.com', xp: 0, nivel: 1, avatar_ativo_url: '' })}>Login as Player</button>
  ),
}));

describe('App Component Routing', () => {
  beforeEach(() => {
    // Reset the mock before each test
    jest.clearAllMocks();
  });

  test('renders AuthScreen initially', () => {
    render(<App />);
    expect(screen.getByText(/Login as Player/i)).toBeInTheDocument();
  });

  test('routes to EventHubScreen for a player after login', () => {
    jest.mock('./components/AuthScreen', () => ({
      __esModule: true,
      default: ({ onLogin }: { onLogin: (user: User) => void }) => (
        <button onClick={() => onLogin({ id: '1', nickname: 'TestPlayer', papel: 'jogador', email: 'player@test.com', xp: 0, nivel: 1, avatar_ativo_url: '' })}>Login as Player</button>
      ),
    }));
    render(<App />);
    fireEvent.click(screen.getByText(/Login as Player/i));
    // Assuming EventHubScreen has a distinct text like 'Event Hub'
    expect(screen.getByText(/Bem-vindo ao Just Dance Event Hub!/i)).toBeInTheDocument();
  });

  test('routes to AdminScreen for an admin after login', () => {
    jest.mock('./components/AuthScreen', () => ({
      __esModule: true,
      default: ({ onLogin }: { onLogin: (user: User) => void }) => (
        <button onClick={() => onLogin({ id: '2', nickname: 'TestAdmin', papel: 'admin', email: 'admin@test.com', xp: 0, nivel: 1, avatar_ativo_url: '' })}>Login as Admin</button>
      ),
    }));
    render(<App />);
    fireEvent.click(screen.getByText(/Login as Admin/i));
    // Assuming AdminScreen has a distinct text like 'Admin Panel'
    expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
  });

  test('routes to StaffPanelScreen for staff after login', () => {
    jest.mock('./components/AuthScreen', () => ({
      __esModule: true,
      default: ({ onLogin }: { onLogin: (user: User) => void }) => (
        <button onClick={() => onLogin({ id: '3', nickname: 'TestStaff', papel: 'staff', email: 'staff@test.com', xp: 0, nivel: 1, avatar_ativo_url: '' })}>Login as Staff</button>
      ),
    }));
    render(<App />);
    fireEvent.click(screen.getByText(/Login as Staff/i));
    // Assuming StaffPanelScreen has a distinct text like 'Staff Panel'
    expect(screen.getByText(/Staff Panel/i)).toBeInTheDocument();
  });
});

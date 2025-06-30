import React from 'react';
import type { LinkProps } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const NavContainer = styled.nav`
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    padding: 1rem 2rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Logo = styled(Link)`
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 1rem;
    class-name: gradient-text;
    font-size: 1.5rem;
    font-weight: bold;
`;

const DancerLogo = styled.span`
    font-size: 2rem;
    class-name: floating-element;
`;

const NavLinks = styled.div`
    display: flex;
    gap: 2rem;
    align-items: center;
`;

const NavLink = styled(Link)<{ active: boolean }>`
    text-decoration: none;
    color: ${({ theme }) => theme.colors.text};
    position: relative;
    padding: 0.5rem 1rem;
    transition: all 0.3s ease;
    class-name: ${({ active }) => active ? 'neon-text' : ''};

    &:hover {
        color: ${({ theme }) => theme.colors.primary};
        text-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
    }

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(
            to right,
            ${({ theme }) => theme.colors.primary},
            ${({ theme }) => theme.colors.secondary}
        );
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.3s ease;
    }

    &:hover::after {
        transform: scaleX(1);
        transform-origin: left;
    }
`;

const Navbar: React.FC = () => {
    const location = useLocation();

    return (
        <NavContainer>
            <Logo to="/">
                <DancerLogo>💃</DancerLogo>
                Just Dance Hub
            </Logo>
            <NavLinks>
                <NavLink to="/event-hub" active={location.pathname === '/event-hub'}>
                    Eventos
                </NavLink>
                <NavLink to="/player-dashboard" active={location.pathname === '/player-dashboard'}>
                    Dashboard
                </NavLink>
                <NavLink to="/music-selection" active={location.pathname === '/music-selection'}>
                    Músicas
                </NavLink>
                <NavLink to="/tournament-bracket" active={location.pathname === '/tournament-bracket'}>
                    Torneios
                </NavLink>
            </NavLinks>
        </NavContainer>
    );
};

export default Navbar;
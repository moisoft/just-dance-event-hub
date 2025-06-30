import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h1.attrs({
    className: 'gradient-text'
})`
  font-size: 4rem;
  margin-bottom: 2rem;
`;

const Subtitle = styled.p.attrs({
    className: 'neon-text'
})`
  font-size: 1.5rem;
  margin-bottom: 3rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const DancerIcon = styled.div.attrs({
    className: 'floating-element'
})`
  font-size: 5rem;
  margin: 2rem 0;
  &::after {
    content: '💃';
  }
`;

const Card = styled.div.attrs({
    className: 'card pulse-element'
})`
  max-width: 600px;
  width: 100%;
  margin: 2rem 0;
`;

const Home: React.FC = () => {
    return (
        <HomeContainer>
            <Title>Bem-vindo ao Just Dance Event Hub!</Title>
            <DancerIcon />
            <Card>
                <Subtitle>Gerencie seus eventos de Just Dance de forma fácil e divertida.</Subtitle>
                <p>Organize torneios, acompanhe pontuações e crie momentos inesquecíveis!</p>
            </Card>
            <ButtonContainer>
                <StyledLink to="/login">
                    <button>Entrar</button>
                </StyledLink>
                <StyledLink to="/register">
                    <button>Registrar</button>
                </StyledLink>
            </ButtonContainer>
        </HomeContainer>
    );
};

export default Home;
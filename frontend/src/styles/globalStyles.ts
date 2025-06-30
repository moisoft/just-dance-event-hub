import { createGlobalStyle, keyframes } from 'styled-components';

const glowAnimation = keyframes`
  0% { text-shadow: 0 0 10px #FF007F, 0 0 20px #FF007F, 0 0 30px #FF007F; }
  50% { text-shadow: 0 0 20px #00FFFF, 0 0 30px #00FFFF, 0 0 40px #00FFFF; }
  100% { text-shadow: 0 0 10px #FF007F, 0 0 20px #FF007F, 0 0 30px #FF007F; }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const rotateGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Montserrat', sans-serif;
    background: linear-gradient(
      45deg,
      ${({ theme }) => theme.colors.background},
      #1a1a1a,
      #4B0082,
      ${({ theme }) => theme.colors.background}
    );
    background-size: 400% 400%;
    animation: ${rotateGradient} 15s ease infinite;
    color: ${({ theme }) => theme.colors.text};
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Righteous', cursive;
    letter-spacing: 2px;
    &:hover {
      animation: ${glowAnimation} 2s ease-in-out infinite;
    }
  }

  button {
    background: linear-gradient(45deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    border: none;
    border-radius: 25px;
    padding: 12px 24px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 0 15px rgba(255, 0, 127, 0.5);

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 0 25px rgba(0, 255, 255, 0.7);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .card {
    background: rgba(46, 46, 46, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    padding: 20px;
    margin: 15px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 10px 30px rgba(255, 0, 127, 0.3);
    }
  }

  .floating-element {
    animation: ${floatAnimation} 3s ease-in-out infinite;
  }

  .pulse-element {
    animation: ${pulseAnimation} 2s ease-in-out infinite;
  }

  input, select, textarea {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    padding: 12px;
    color: ${({ theme }) => theme.colors.text};
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 15px rgba(255, 0, 127, 0.3);
    }
  }

  .neon-text {
    color: ${({ theme }) => theme.colors.primary};
    text-shadow: 0 0 10px ${({ theme }) => theme.colors.primary},
                0 0 20px ${({ theme }) => theme.colors.primary},
                0 0 30px ${({ theme }) => theme.colors.primary};
  }

  .gradient-text {
    background: linear-gradient(45deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    border-radius: 5px;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
  }
`;
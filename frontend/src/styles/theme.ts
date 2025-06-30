import { DefaultTheme } from 'styled-components';

const theme: DefaultTheme = {
  colors: {
    primary: '#FF007F', // Néon Rosa
    secondary: '#00FFFF', // Ciano
    background: '#2E2E2E', // Cinza escuro
    text: '#FFFFFF', // Branco
    border: '#4B0082', // Roxo
  },
  fonts: {
    main: '"Montserrat", sans-serif',
    title: '"Righteous", cursive',
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1440px',
  },
};

export default theme;
/**
 * Open Design Tokens
 * Brand-grade color palette and spacing for Chiu Gor French
 */

export const tokens = {
  colors: {
    brand: {
      red: '#CC0000',
      redLight: '#FF3333',
      teal: '#4ECDC4',
      tealDark: '#38B2AC',
      coral: '#FF6B6B',
    },
    neutral: {
      bg: {
        light: '#F7F4EF',
        dark: '#0E0818',
      },
      text: {
        light: '#1A1410',
        dark: '#E8E0F5',
        mutedLight: '#7A7068',
        mutedDark: '#C4A8E8',
      },
      surface: {
        light: '#FFFFFF',
        dark: '#1E0D38',
      }
    }
  },
  typography: {
    fontFamily: "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', Arial, sans-serif",
    fontFamilyEn: "Candara, 'Nunito', 'Segoe UI', Arial, sans-serif",
  },
  animations: {
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    snappy: 'cubic-bezier(0.22, 1, 0.36, 1)',
    float: 'float 6s ease-in-out infinite',
  }
};

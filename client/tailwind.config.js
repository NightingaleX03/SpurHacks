/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark Mode Colors
        'dark-bg': '#0D0D0D',
        'dark-surface': '#1A1A1D',
        'neon-purple': '#8E2DE2',
        'electric-blue': '#4A00E0',
        'highlight': '#00FFF7',
        'dark-text': '#FFFFFF',
        
        // Light Mode Colors
        'light-bg': '#F8F9FA',
        'light-card': '#FFFFFF',
        'primary': '#8E2DE2',
        'accent': '#5DE1FF',
        'light-text': '#1A1A1D',
        
        // Glassmorphism
        'glass': 'rgba(255, 255, 255, 0.1)',
        'glass-dark': 'rgba(0, 0, 0, 0.2)',
        'glass-light': 'rgba(255, 255, 255, 0.8)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-neon': 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
        'gradient-highlight': 'linear-gradient(135deg, #00FFF7 0%, #5DE1FF 100%)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.6s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #8E2DE2, 0 0 10px #8E2DE2, 0 0 15px #8E2DE2' },
          '100%': { boxShadow: '0 0 10px #8E2DE2, 0 0 20px #8E2DE2, 0 0 30px #8E2DE2' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
} 
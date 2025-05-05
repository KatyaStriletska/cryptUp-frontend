/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'selector',
  theme: {
    extend: {
      // typography: (theme) => ({
      //   DEFAULT: {
      //     css: {
      //       color: 'white',
      //     },
      //   },
      // }),
      fontFamily: {
        sans: ['Nunito', ...(defaultTheme.fontFamily.serif ?? [])],
        serif: ['Nunito', ...(defaultTheme.fontFamily.serif ?? [])],
        mono: ['Orbitron', ...(defaultTheme.fontFamily.mono ?? [])],
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(90deg, #23B8FF 0%, #8F4FFF 25.25%, #D423F9 50%, #8F4FFF 75.25%, #23B8FF 100%)',
        'primary-gradient-half': 'linear-gradient(90deg, #23B8FF 0%, #8F4FFF 50%, #D423F9 100%)',
        'gradient-white-purple': 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(79,22,180,0.5) 100%)',
        'gradient-purple-white': 'linear-gradient(90deg, rgba(79,22,180,0.5) 0%, rgba(255,255,255,0) 100%)',
      },
      colors: {
        dark: {
          primary: '#0B0315',
          secondary: '#110525',
        },
        green: {
          primary: '#1EFFD6',
          secondary: '#006352',
        },
        grey: {
          primary: '#77777766',
          secondary: '#2C2C2C66',
          tertiary: '#91919133',
        },
        light: {
          primary: '#FFFFFF',
          secondary: '#FFFFFF33',
          tertiary: '#FFFFFF99',
        },
        blue: {
          primary: '#23B8FF',
        },
        purple: {
          primary: '#8F4FFF',
          dark: '#4f16b480',
        },
        pink: {
          primary: '#D423F9',
        },
      },
    },
  },
  // plugins: [
  //   require('@tailwindcss/typography'),
  // ],
};

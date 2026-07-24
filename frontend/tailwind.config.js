/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // 'class' = o tema escuro é ativado adicionando a classe "dark" no <html>.
  // Damos controle total ao usuário, em vez de seguir só a preferência do SO.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta da marca, usada em botões, links e destaques.
        brand: {
          50: '#eef6ff', 100: '#d9ebff', 200: '#bcdcff', 300: '#8ec5ff',
          400: '#59a4ff', 500: '#3182f6', 600: '#1d63e0',
          700: '#194fb5', 800: '#1a448f', 900: '#1b3b72',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
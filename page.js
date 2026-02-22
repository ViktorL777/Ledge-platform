/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-blue': '#1a2b4a',
        'deep-blue-90': '#243558',
        'mountain-grey': '#6b7b8d',
        'mountain-grey-light': '#8a97a6',
        'copper': '#b87333',
        'copper-light': '#d4935a',
        'copper-dark': '#96592a',
        'off-white': '#f7f6f3',
        'warm-white': '#fefdfb',
        'light-stone': '#e8e4de',
        'pale-blue': '#edf1f5',
        'text-primary': '#1a2b4a',
        'text-secondary': '#5a6978',
        'text-muted': '#8a97a6',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

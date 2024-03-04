/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  prefix: 'tw-',
  theme: {
    extend: {
      colors: {
        'app-primary': 'rgb(var(--app-theme-color-primary) / <alpha-value>)',
        'app-secondary': 'rgb(var(--app-theme-color-secondary) / <alpha-value>)',
        'app-tertiary': 'rgb(var(--app-theme-color-tertiary) / <alpha-value>)',
      }
    },
  },
  plugins: [],
}


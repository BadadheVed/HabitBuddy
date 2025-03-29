module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'hover:text-blue-400',
    'hover:text-blue-600',
    'hover:text-orange-400',
    'hover:text-orange-600',
    'hover:text-teal-400',
    'hover:text-teal-600',
    'hover:text-lime-400',
    'hover:text-lime-600',
  ],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary:  "#55a5ec",
        primaryD: "#1570c0",
        teal:     "#0bacee",
        tealD:    "#0993cc",
        navy:     "#041524",
        surface:  "#f0f8ff",
        surface2: "#e1f0fc",
        border1:  "#b8d9f0",
        border2:  "#7ab8e0",
        muted:    "#4a7fa0",
        sub:      "#246386",
        danger:   "#e05a2b",
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
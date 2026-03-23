/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#070b18",
        panel: "#0f1728",
        card: "#121d33",
        line: "rgba(255,255,255,0.08)",
        text: "#f7f9fc",
        muted: "#8ea0c7",
        brand: "#6c7cff",
        brand2: "#3dc6ff",
        green: "#39d98a",
        red: "#ff6b7a",
        yellow: "#ffcc66",
      },
      boxShadow: {
        glow: "0 18px 60px rgba(76, 96, 255, 0.18)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

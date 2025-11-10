/**
 * Tailwind configuration that adds the project brand colors.
 * - azul:  #0151A1
 * - naranjo: #FF6B35
 *
 * This file defines both direct names (azul, naranjo) and a small
 * 'brand' namespace so you can use either `bg-azul` / `text-naranjo`
 * or `bg-brand-blue` / `text-brand-orange` depending on preference.
 */
module.exports = {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand namespace
        brand: {
          blue: "#006AAF",
          blue_hover: "#004385",
          orange: "#FF6B35",
        },
      },
    },
  },
  plugins: [],
};

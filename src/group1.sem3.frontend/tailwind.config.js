/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
  theme: {
      extend: {
            colors: {
                primary: "var(--color-primary)",
                secondary: "var(--color-secondary)",
                accent: "var(--color-accent)",
                background: "var(--color-bg)",
                danger: {
                    50: "var(--color-danger-50)",
                    100: "var(--color-danger-100)",
                    500: "var(--color-danger-500)",
                    600: "var(--color-danger-600)",
                    700: "var(--color-danger-700)",
                },
                accent: "rgb(var(--color-accent) / <alpha-value>)",
          },
      },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Shadcn/UI base colors
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Celestial Elegance custom colors
                'cosmic-gold': 'var(--cosmic-gold)',
                'astral-blue': 'var(--astral-blue)',
                'astral-red': 'var(--astral-red)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'text-tertiary': 'var(--text-tertiary)',
                cosmic: {
                    dark: '#0D0F21',
                    navy: '#191A3D',
                    gold: '#FFC700',
                    text: '#EAE8FF',
                    accent: '#7C3AED',
                    glass: "rgba(255, 255, 255, 0.05)", // Keeping this for glass panels
                    void: "#0a0a1a", // Deepest black-blue (kept for compatibility)
                    nebula: "#6d28d9", // Vibrant purple (kept for compatibility)
                    starlight: "#ffd700", // Gold (kept for compatibility)
                    silver: "#e2e8f0",
                }
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                heading: ['Lora', 'serif'],
                body: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'cosmic-gradient': 'linear-gradient(135deg, #0D0F21 0%, #191A3D 100%)',
                'stars': "url('/images/backgrounds/stars-bg.png')",
            }
        },
    },
    plugins: [require("tailwindcss-animate")],
}

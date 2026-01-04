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
                skyblue: {
                    50: '#F8FCFE',
                    100: '#E8F4F8',
                    200: '#D4E8F0',
                    300: '#A3D1E8',
                    400: '#7BB8DC',
                    500: '#5BA3D0',
                    600: '#4A8AB8',
                    700: '#3A6F99',
                    800: '#2A5475',
                    900: '#1A3A52',
                },
                violet: {
                    50: '#F4F1F8',
                    100: '#E8E3F0',
                    200: '#C4B8DC',
                    300: '#A594C8',
                    400: '#8B7AB8',
                    500: '#6F5E99',
                    600: '#5A4C7D',
                    700: '#463A61',
                    800: '#322845',
                    900: '#1E1629',
                },
                neutral: {
                    50: '#F8FCFE',
                    100: '#E8F4F8',
                    200: '#D4E8F0',
                    300: '#A3D1E8',
                    400: '#636E72',
                    500: '#2D3436',
                    600: '#1F2426',
                    700: '#141719',
                    800: '#0A0C0D',
                    900: '#000000',
                },
                'status': {
                    success: '#6BA87C',
                    warning: '#E8A87C',
                    error: '#D97777',
                    info: '#5BA3D0',
                },
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

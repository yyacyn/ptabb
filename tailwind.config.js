import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'harbor-ink': '#0E3A5C',
                'deep-water': '#0A2540',
                'navy-700': '#1A4A6E',
                'navy-600': '#2A5F87',
                'steel': '#4A6A85',
                'iron': '#6B8FA8',
                'mist': '#8AAFC8',
                'cloud': '#C5D5E0',
                'frost': '#DDE8F0',
                'canvas': '#F7F9FB',
                'flag-red': '#D93A2B',
                'fleet-blue': '#1C7FC4',
            },
            boxShadow: {
                'subtle': 'rgba(0,0,0,0.08) 0px 1px 3px 0px, rgba(0,0,0,0.08) 0px 1px 2px -1px',
            },
            borderRadius: {
                'lg': '8px',
            },
        },
    },

    plugins: [forms],
};

module.exports = {
    prefix: '',
    important:true,
    purge: {
        // enabled: true,
      content: [
        './src/**/*.{html,ts}',
      ]
    },
    darkMode: 'class', // or 'media' or 'class'
    theme: {
      maxWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
       },
      extend: {},
    },
    variants: {
      extend: {
      },
      display: ["group-hover"]
    },
    plugins: [require('@tailwindcss/forms'),require('@tailwindcss/typography')],
};
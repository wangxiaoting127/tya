module.exports = {
    head: {
        title: 'starter',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: 'Nuxt.js project' }
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
        ]
    },
    css: ['~assets/css/main.css', 'element-ui/lib/theme-default/index.css'],
    vendor: ['element-ui'],
    loading: { color: '#3B8070' },
    plugins: ['~plugins/iview.js']
};
//# sourceMappingURL=nuxt.js.map
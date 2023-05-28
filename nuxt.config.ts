export default defineNuxtConfig({
    app: {
        head: {
            charset: "utf-8",
            viewport: "width=device-width, initial-scale=1",
            title: "Loading",
            titleTemplate: "%s - NoSadNile Network",

            link: [
                {
                    href: "/favicon.ico",
                    rel: "shortcut icon",
                    type: "image/vnd.microsoft.icon",
                },
            ],
        },

        layoutTransition: {
            name: "layout",
            mode: "out-in",
        },
    },

    devtools: {
        enabled: true,
    },

    devServer: {
        port: 4000,
    },

    postcss: {
        plugins: {
            autoprefixer: {},

            cssnano: {
                preset: "default",
            },
        },
    },

    modules: [
        "@pinia/nuxt",
        "@nuxtjs/i18n",
        "@nuxtjs/robots",
        "@vite-pwa/nuxt",
        "nuxt-typed-router",
        "@nuxtjs/color-mode",
        "nuxt-simple-sitemap",
    ],

    plugins: ["~/plugins/bluemap"],

    i18n: {
        locales: [
            {
                code: "hu",
                name: "Magyar",
                file: "hu.json",
            },
            {
                code: "de",
                name: "Deutsch",
                file: "de.json",
            },
            {
                code: "zh_TW",
                name: "中文(台灣)",
                file: "zh_TW.json",
            },
            {
                code: "it",
                name: "Italiano",
                file: "it.json",
            },
            {
                code: "pt_PT",
                name: "Português (Portugal)",
                file: "pt_PT.json",
            },
            {
                code: "zh_HK",
                name: "中文(香港)",
                file: "zh_HK.json",
            },
            {
                code: "es",
                name: "Spanish",
                file: "es.json",
            },
            {
                code: "hi",
                name: "हिन्दी",
                file: "hi.json",
            },
            {
                code: "fr",
                name: "French",
                file: "fr.json",
            },
            {
                code: "ua",
                name: "Українська",
                file: "ua.json",
            },
            {
                code: "cs",
                name: "Czech",
                file: "cs.json",
            },
            {
                code: "zh_CN",
                name: "简体中文",
                file: "zh_CN.json",
            },
            {
                code: "ko",
                name: "한국어",
                file: "ko.json",
            },
            {
                code: "fi",
                name: "Suomi",
                file: "fi.json",
            },
            {
                code: "no_nb",
                name: "Norsk bokmål",
                file: "no_nb.json",
            },
            {
                code: "lv",
                name: "Latviešu",
                file: "lv.json",
            },
            {
                code: "settings",
                name: "settings",
                file: "settings.json",
            },
            {
                code: "pl",
                name: "Polski",
                file: "pl.json",
            },
            {
                code: "en",
                name: "English",
                file: "en.json",
            },
            {
                code: "th",
                name: "ภาษาไทย",
                file: "th.json",
            },
            {
                code: "sv",
                name: "Svenska",
                file: "sv.json",
            },
            {
                code: "tr",
                name: "Türkçe",
                file: "tr.json",
            },
            {
                code: "ru",
                name: "Русский",
                file: "ru.json",
            },
            {
                code: "nl",
                name: "Nederlands",
                file: "nl.json",
            },
        ],

        lazy: true,
        langDir: "public/lang",
        defaultLocale: "en",

        precompile: {
            escapeHtml: false,
            strictMessage: false,
        },
    },

    ssr: false,

    vite: {
        server: {
            hmr: {
                port: 4001,
                clientPort: 443,
                protocol: "wss",
            },
        },
    },
});

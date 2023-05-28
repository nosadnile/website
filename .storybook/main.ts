import type { StorybookConfig } from "@storybook/vue3-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
    stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|ts|tsx,vue)"],
    
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
    ],

    framework: {
        name: "@storybook/vue3-vite",
        options: {},
    },
    
    docs: {
        autodocs: "tag",
    },

    async viteFinal(config) {
        return mergeConfig(config, {
            server: {
                hmr: {
                    port: 4000,
                    clientPort: 443,
                    protocol: "wss",
                },
            },
        });
    },
};

export default config;

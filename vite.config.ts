import { defineConfig } from "vite";

export default defineConfig({
    server: {
        port: 4000,
        strictPort: true,

        hmr: {
            port: 4000,
            clientPort: 443,
            protocol: "wss",
        },
    }
});

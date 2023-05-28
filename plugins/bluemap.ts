import { BlueMapApp } from "~/lib/BlueMap/BlueMapApp";

declare module "vue" {
    interface ComponentCustomProperties {
        $bluemap: BlueMapApp;
        $mapContainer: HTMLDivElement;
    }
}

export default defineNuxtPlugin(
    async (nuxt) => {
        const container = document.createElement("div");

        container.id = "map-container";

        const bluemap = new BlueMapApp(container);

        (window as any).bluemap = bluemap;

        nuxt.vueApp.config.globalProperties.$bluemap = bluemap;
        nuxt.vueApp.provide("bluemap", bluemap);
        nuxt.vueApp.provide("mapContainer", container);

        return {
            provide: {
                bluemap,
                mapContainer: container,
            },
        };
    },

    { name: "BlueMap", enforce: "post", order: 0 }
);

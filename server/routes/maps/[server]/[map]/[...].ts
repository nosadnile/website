import { getPort } from "../../../../lib/server";

export default defineEventHandler(async (event) => {
    const server = event.context.params?.server!;
    const map = event.context.params?.map!;
    const path = event.context.params?._!;

    const port = getPort(server);

    const response = await fetch(`http://dns2.nosadnile.net:${port}/maps/${map}/${path}`, {
        method: "GET",

        headers: {
            "User-Agent": "NoSadNile Network - Website - Nuxt + Nitro",
        },
    });

    return send(event, new Uint8Array(await response.arrayBuffer()));
});

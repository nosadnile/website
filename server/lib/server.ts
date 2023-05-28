export const getPort = (server: string) => {
    switch (server.toLowerCase()) {
        case "smp":
            return 5001;
    }

    return -1;
};

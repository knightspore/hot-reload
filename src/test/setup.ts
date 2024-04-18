import { Server } from "bun";

export function createTestServer(onMessage: (message: string | Buffer) => void) {
    return Bun.serve({
        port: 3000,
        fetch: (req: Request, server: Server) => {
            if (server.upgrade(req)) return;
            return new Response("Upgrade failed", {
                status: 500
            });
        },
        websocket: {
            message: async (_, message) => onMessage(message),
            open: () => { },
        },
    });
}

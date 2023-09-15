import { ServerWebSocket } from "bun";
import { watch } from "fs";
import { EXAMPLE_HTML, EXAMPLE_PATH } from "./example_constants";

const PORT = 3000
const PATH = EXAMPLE_PATH

Bun.serve({
    port: PORT,
    fetch(req, server) {
        // Example UI
        if (new URL(req.url).pathname === "/ui") {
            return new Response(EXAMPLE_HTML, {
                headers: {
                    "Content-Type": "text/html"
                }
            });
        }
        // WebSocket Upgrade
        if (server.upgrade(req)) {
            return;
        }
        return new Response("Upgrade failed :(", { status: 500 });
    },
    websocket: {
        message: handleMessage,
        open: handleOpen,
    }
})

async function handleMessage(ws: ServerWebSocket, message: string | Buffer) {
    console.log("Message received: " + message);
}

async function handleOpen(ws: ServerWebSocket) {
    console.log("Socket opened");
    const watcher = watch(EXAMPLE_PATH, (event, filename) => {
        console.log(`Detected '${event}' event in '${filename ?? "unknown file"}'`);
        ws.send("");
    })
    process.on("SIGINT", () => {
        watcher.close();
        process.exit();
    })
}

console.log(`WebSocket Server Listening on :${PORT}`);
console.log("Watching for file changes in /example");
console.log(`Open http://localhost:${PORT}/ui to see the example UI`);


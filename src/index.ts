import { Server, ServerWebSocket } from "bun";
import { reqLog, wssLog } from "./log";

const PORT = process.env.PORT || "3000";
const WATCH_PATH = process.env.WATCH_PATH || "./example";

async function handleMessage(ws: ServerWebSocket, message: string | Buffer) {
    wssLog(`Message: ${message}`);
    ws.send(message);
}

async function handleOpen() {
    wssLog(`Connection opened`);
}

const listenerScript = `const ws = new WebSocket("ws://localhost:${PORT}");
ws.onmessage = () => location.reload();`

const listenerResponse = new Response(listenerScript, {
    headers: {
        "Content-Type": "application/javascript",
    }
})

const failedResponse = new Response("Upgrade failed", { status: 500 });

const exampleResponse = new Response(`
<!DOCTYPE html><html>
    <head>
        <title>WebSocket Listener Example</title>
        <script src="http://localhost:${PORT}/listener.js"></script> <!-- Include the listener script -->
    </head>
    <body>
        <p>Try editing me in ${import.meta.dir}${import.meta.file}</p>
        <p>${new Date()}</p>
    </body>
</html>
`, {
    headers: {
        "Content-Type": "text/html"
    }
})

const serverConfig = {
    port: PORT,
    fetch: (req: Request, server: Server) => {
        const url = new URL(req.url)
        reqLog(`Request for ${url.pathname}`);
        if (url.pathname === "/example") return exampleResponse;
        else if (url.pathname === "/listener.js") return listenerResponse;
        else if (server.upgrade(req)) return;
        else return failedResponse;
    },
    websocket: {
        message: handleMessage,
        open: handleOpen,
    }
}

Bun.serve(serverConfig)

wssLog(`Listening on http://localhost:${PORT}`);

const watcher = Bun.spawn(["bun", "run", "watcher.ts"], {
    stdout: "inherit",
    stderr: "inherit",
    env: {
        WATCH_PATH,
        PORT,
    }
})

wssLog(`Spawned watcher with PID: ${watcher.pid}`)


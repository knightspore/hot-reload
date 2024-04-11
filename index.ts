import { Server, ServerWebSocket } from "bun";
import chalk from "chalk";
import { watch } from "fs";

const PORT = process.env.PORT || 3000;
const WATCH_PATH = process.env.WATCH_PATH || "./example";

function log(message: string) {
    const time = new Date().toLocaleTimeString();
    process.stdout.write(`[${chalk.dim(time)}] ${message}`);
}
function tagLog(tag: string, message: string) {
    log(`<${chalk.bold(tag)}> ${message}\n`);
}

function wssLog(message: string) {
    tagLog(chalk.blue("WSS"), message);
}

function reqLog(message: string) {
    tagLog(chalk.green("Req"), message);
}

function hotLog(message: string) {
    tagLog(chalk.red("Hot"), message);
}

async function handleMessage(ws: ServerWebSocket, message: string | Buffer) {
    log(`Received message: ${message}\n`);
}

async function handleOpen(ws: ServerWebSocket) {
    wssLog("Connection opened");
    const watcher = watch(WATCH_PATH, {
        recursive: true,
    })
    let lastEvent = Date.now();
    watcher.on("change", (eventType, filename: string) => {
        const isTempFile = filename.endsWith("~");
        const isTempVimFile = filename.match(/[0-9]/)
        if (isTempFile || isTempVimFile) return;
        lastEvent = Date.now();
        hotLog(`Detected change in '${filename}' (${eventType})`);
        ws.send("");
    })
    hotLog(`Watching for changes in ${WATCH_PATH}/*`)
    process.on("SIGINT", () => {
        watcher.close()
        process.exit(0);
    })
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
        close: (ws: ServerWebSocket) => {
            wssLog("Connection closed");
            // Kill the watcher
        }
    }
}

Bun.serve(serverConfig)
wssLog(`Listening on http://localhost:${PORT}`);


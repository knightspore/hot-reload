import { watch } from "node:fs"
import { hotLog } from "./log";

const PORT = process.env.PORT || 3000;
const WATCH_PATH = process.env.WATCH_PATH || "./example";
const SOCKET = new WebSocket(`ws://localhost:${PORT}`)

let lastEvent = Date.now();
function newEvent() { lastEvent = Date.now(); }

const isTempFile = (filename: string) => filename.endsWith("~");
const isTempVimFile = (filename: string) => filename.match(/[0-9]/);

SOCKET.onopen = () => {

    const watcher = watch(WATCH_PATH, {
        recursive: true,
    })

    watcher.on("change", (_, filename) => {
        if (isTempFile(filename.toString()) || isTempVimFile(filename.toString())) return;
        newEvent();
        SOCKET.send(`reload.${Date.now()}`);
        hotLog(`Sent event for change in: '${filename}'`);
    })

    hotLog(`Watching for changes in ${WATCH_PATH}/*`)

    process.on("SIGINT", () => {
        watcher.close()
        process.exit(0);
    })
}

import { rmSync } from "node:fs"
import { describe, it, expect, beforeAll, afterAll, test } from "bun:test";

const projectDir = "/tmp/project_dir"
const projectFile = `${projectDir}/index.ts`
const projectFileText = 'console.log("Hello World");\n'

beforeAll(async () => {
    // Create watch directory, and file
    await Bun.write(projectFile, projectFileText)
    console.log(`File created with contents: ${(await Bun.file(projectFile).text()).trim()}`)

    // Spawn server process
    const proc = Bun.spawn(["bun", "run", "index.ts"], {
        stdout: "inherit",
        stderr: "inherit",
        env: { WATCH_PATH: projectDir, PORT: "4999" }
    })
    console.log(`Server - Live PID: ${proc.pid}`)
})

afterAll(async () => {
    rmSync(projectDir, { recursive: true });
    console.log(`Removed project directory: ${projectDir}`)
})

describe("hot-reload service", async () => {
    // Connect websocket to server
    let message: null | string = null;
    const socket = new WebSocket("ws://localhost:4999");
    socket.onmessage = ((event) => {
        message = event.data.toString();
    })
    console.log("Socket - Connected to server")

    // Edit file
    const newFileText = 'console.log("Hello World! Updated");\n'
    await Bun.write(projectFile, newFileText)
    console.log(`File updated with contents: ${(await Bun.file(projectFile).text()).trim()}`)
    const contents = await Bun.file(projectFile).text()

    // Wait for message
    it("should receive a reload message", async () => {
        expect(message).not.toBeNull();
        expect(message).toBeTypeOf("string");
        expect(contents).toBe(newFileText)
    })

})

test.todo("listener.js", async () => {
    // Check that listener script works
})

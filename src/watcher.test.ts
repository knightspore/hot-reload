import { createTestServer } from "./test/setup";
import { Server, Subprocess } from "bun";
import { beforeAll, afterAll, describe, expect, it } from "bun:test";

// Setup

let watcherProc: Subprocess | null = null;
let serverProc: Server | null = null;
let counter = 0

beforeAll(async () => {
    serverProc = createTestServer((message) => {
        if (message.includes("reload.")) {
            counter++
        }
    })

    watcherProc = Bun.spawn(["bun", "run", `${import.meta.dir}/watcher.ts`], {
        stdout: Bun.file("/tmp/watcher.log"),
        env: {
            PORT: "3000",
            WATCH_PATH: "./example",
        }
    });
})

afterAll(() => {
    serverProc?.stop();
    watcherProc?.kill();
})

// Tests

describe("watcher", async () => {

    it("spawns as bun subprocess", async () => {
        expect(watcherProc).not.toBe(null);
        expect(watcherProc?.pid).toBeTypeOf("number");
    });


    it("has available test server", async () => {
        let connected = false;
        const ws = new WebSocket("ws://localhost:3000");
        ws.onopen = () => {
            connected = true;
        }
        await Bun.sleep(1000);
        expect(connected).toBeTrue();
    })



    it("respond to changes in ./example", async () => {
        await Bun.write("example/index.html", "<h1>hello</h1>");
        await Bun.sleep(1000);
        expect(counter).toBeGreaterThan(0);
    });

});

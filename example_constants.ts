export const EXAMPLE_HTML = `
<html>
    <title>Websocket example</title>
    <body>
        <h1>Edit <pre>example/test.js</pre> for hot reloading</h1>
        <script>
            const ws = new WebSocket("ws://localhost:3000");
            ws.onmessage = () => location.reload();
        </script>
    </body>
</html>
`

export const EXAMPLE_PATH = `./example`

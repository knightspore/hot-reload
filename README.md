# Hot Reloading Example

A simple WebSocket server which watches a directory for changes, triggering a simple message send to the client. 

The client has a simple event listener:
```html
<script type="text/javascript">
  const ws = new WebSocket("ws://localhost:3000");
  ws.onmessage = () => location.reload();
</script>
```

Which will refresh the browser whenever a new message is recieved. 

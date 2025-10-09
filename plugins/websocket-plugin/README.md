# @loggical/websocket-plugin

WebSocket transport plugin for [Loggical](https://github.com/ilancohen/loggical) logging library.

Adds real-time log streaming capabilities with automatic reconnection and buffering.

## Installation

```bash
npm install @loggical/websocket-plugin
# or
pnpm add @loggical/websocket-plugin
```

**Note**: This plugin requires the `ws` package for Node.js WebSocket support.

## Usage

### Basic Usage

```typescript
import { Logger } from 'loggical'
import { WebSocketPlugin } from '@loggical/websocket-plugin'

const logger = new Logger({
  plugins: [
    new WebSocketPlugin({
      url: 'ws://localhost:3001/logs'
    })
  ]
})

// All logs are now streamed to WebSocket server
logger.info('This will be sent via WebSocket')
```

### Advanced Configuration

```typescript
import { Logger } from 'loggical'
import { WebSocketPlugin } from '@loggical/websocket-plugin'

const logger = new Logger({
  plugins: [
    new WebSocketPlugin({
      url: 'ws://localhost:3001/logs',
      protocols: ['logging-v1'],
      reconnect: true,
      reconnectDelay: 1000,
      maxReconnectAttempts: 5,
      maxBufferSize: 100,
      includeMetadata: true,
      headers: {
        'Authorization': 'Bearer token123'
      }
    })
  ]
})
```

### Dynamic Plugin Management

```typescript
import { Logger } from 'loggical'
import { WebSocketPlugin } from '@loggical/websocket-plugin'

const logger = new Logger()

// Install plugin at runtime
const wsPlugin = new WebSocketPlugin({ url: 'ws://localhost:3001' })
await logger.installPlugin(wsPlugin)

// Check plugin status
console.log(logger.hasPlugin('websocket')) // true

// Get connection status
console.log(wsPlugin.getStatus())

// Uninstall plugin
await logger.uninstallPlugin('websocket')
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | **required** | WebSocket server URL |
| `protocols` | `string \| string[]` | `undefined` | WebSocket protocols to request |
| `reconnect` | `boolean` | `true` | Enable automatic reconnection |
| `reconnectDelay` | `number` | `1000` | Reconnection delay in milliseconds |
| `maxReconnectAttempts` | `number` | `5` | Maximum reconnection attempts |
| `maxBufferSize` | `number` | `1000` | Maximum buffer size for offline messages |
| `includeMetadata` | `boolean` | `true` | Include metadata in JSON format |
| `headers` | `Record<string, string>` | `undefined` | Custom headers for Node.js connections |

## Features

- **Automatic Reconnection**: Reconnects with exponential backoff
- **Message Buffering**: Buffers messages during disconnections
- **JSON Metadata**: Streams structured log data with metadata
- **Error Handling**: Graceful degradation on connection failures
- **Node.js Only**: Uses the `ws` package for WebSocket support

## WebSocket Message Format

When `includeMetadata` is `true` (default), messages are sent as JSON:

```json
{
  "message": "14:32:18.456 ℹ️ User logged in",
  "level": 1,
  "timestamp": "2023-06-24T14:32:18.456Z",
  "namespace": "app:auth",
  "context": { "userId": "123" },
  "prefix": ["AUTH"]
}
```

When `includeMetadata` is `false`, only the formatted message string is sent.

## Connection States

The plugin tracks connection state through the `WebSocketState` enum:

- `DISCONNECTED`: Not connected
- `CONNECTING`: Attempting to connect
- `CONNECTED`: Successfully connected
- `RECONNECTING`: Attempting to reconnect
- `ERROR`: Connection failed (max attempts reached)

## Server Example

Simple WebSocket server for testing:

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', (ws) => {
  console.log('Logger connected');
  
  ws.on('message', (data) => {
    const log = JSON.parse(data.toString());
    console.log(`[${log.level}] ${log.message}`);
  });
});
```

## Migration from Built-in Transport

```typescript
// Before (built-in)
import { Logger, WebSocketTransport } from 'loggical'
const logger = new Logger({
  transports: [new WebSocketTransport({ url: 'ws://localhost:3001' })]
})

// After (plugin)
import { Logger } from 'loggical'
import { WebSocketPlugin } from '@loggical/websocket-plugin'
const logger = new Logger({
  plugins: [new WebSocketPlugin({ url: 'ws://localhost:3001' })]
})
```

## License

MIT

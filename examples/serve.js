// Simple server to serve the browser examples
import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
}

const server = createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url
  filePath = join(__dirname, filePath)

  // Security: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  if (!existsSync(filePath)) {
    res.writeHead(404)
    res.end('File not found')
    return
  }

  try {
    const content = readFileSync(filePath)
    const ext = extname(filePath)
    const contentType = mimeTypes[ext] || 'text/plain'

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*', // Enable CORS for local development
      'Cache-Control': 'no-cache' // Disable caching for development
    })
    res.end(content)
  } catch (error) {
    res.writeHead(500)
    res.end('Server error: ' + error.message)
  }
})

server.listen(PORT, () => {
  console.log(`🚀 Examples server running at http://localhost:${PORT}`)
  console.log(`📁 Serving files from: ${__dirname}`)
  console.log(`🌐 Open http://localhost:${PORT} to view examples`)
  console.log(`⏹️  Press Ctrl+C to stop`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...')
  server.close(() => {
    console.log('✅ Server stopped')
    process.exit(0)
  })
})

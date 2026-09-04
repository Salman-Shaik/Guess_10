const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'build');
const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent((request.url || '/').split('?')[0]);
  const requested = path.resolve(root, `.${pathname}`);
  const safePath = requested.startsWith(root) && fs.existsSync(requested) && fs.statSync(requested).isFile()
    ? requested
    : path.join(root, 'index.html');
  response.setHeader('Content-Type', types[path.extname(safePath)] || 'application/octet-stream');
  fs.createReadStream(safePath).pipe(response);
});

server.listen(Number(process.env.PORT) || 4173, '127.0.0.1');
const close = () => {
  server.close();
  server.closeAllConnections?.();
  process.exit(0);
};
process.on('SIGINT', close);
process.on('SIGTERM', close);

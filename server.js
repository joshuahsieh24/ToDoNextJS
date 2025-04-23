const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Get port from environment variable or default to 10000 (Render's default)
const port = process.env.PORT || 10000;

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    // Set higher timeout values to prevent 502 errors
    server.keepAliveTimeout = 120000; // 120 seconds
    server.headersTimeout = 120000; // 120 seconds

    // Listen on all network interfaces (0.0.0.0)
    server.listen(port, '0.0.0.0', (err) => {
        if (err) throw err;
        console.log(`> Ready on http://0.0.0.0:${port}`);
    });
}); 
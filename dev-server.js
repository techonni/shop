#!/usr/bin/env node
// Local development server for the Techonni shop.
// Serves the static site from the repo root and runs the Vercel-style
// serverless functions in ./api using a small request/response shim so the
// production handlers (e.g. api/checkout.js) run unmodified.

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

// Add Express-style helpers Vercel provides on top of Node's ServerResponse.
function decorateResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.send = (body) => {
    if (body === undefined || body === null) {
      res.end();
    } else if (Buffer.isBuffer(body) || typeof body === "string") {
      res.end(body);
    } else {
      if (!res.getHeader("Content-Type")) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      res.end(JSON.stringify(body));
    }
    return res;
  };
  res.json = (body) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(body));
    return res;
  };
  return res;
}

async function handleApi(req, res, url) {
  const name = url.pathname.replace(/^\/api\//, "").replace(/\/+$/, "");
  const handlerPath = path.join(ROOT, "api", `${name}.js`);
  if (!name || !fs.existsSync(handlerPath)) {
    res.statusCode = 404;
    res.end("Function not found");
    return;
  }

  req.query = Object.fromEntries(url.searchParams.entries());
  decorateResponse(res);

  try {
    // Load fresh each request so edits to the function are picked up.
    delete require.cache[require.resolve(handlerPath)];
    const handler = require(handlerPath);
    const fn = typeof handler === "function" ? handler : handler.default;
    await fn(req, res);
  } catch (err) {
    console.error(`[api] ${name} threw:`, err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end(String((err && err.message) || err));
    }
  }
}

function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";

  let filePath = path.join(ROOT, pathname);
  // Prevent path traversal outside the repo root.
  if (!filePath.startsWith(ROOT)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end("<h1>404 Not Found</h1>");
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
      res.statusCode = 200;
      res.end(data);
    });
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  console.log(`${req.method} ${url.pathname}${url.search}`);
  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url);
  } else {
    serveStatic(req, res, url);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Techonni shop dev server running at http://${HOST}:${PORT}`);
  console.log(`Static site + /api functions served from ${ROOT}`);
});

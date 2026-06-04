import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// If HOST is unset, we intentionally *don't* pass a host to `listen()`.
// This lets Node/OS choose the best local bind target and avoids cases where
// explicitly binding to 127.0.0.1/localhost is disallowed in some environments.
const HOST = process.env.HOST || "";
const PORT = Number(process.env.PORT || 5173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf"
};

function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const cleaned = decoded.replace(/\0/g, "");
  const rel = cleaned.replace(/^\/+/, "");
  const full = path.join(root, rel);
  const normalizedRoot = path.resolve(root) + path.sep;
  const normalizedFull = path.resolve(full);
  if (!normalizedFull.startsWith(normalizedRoot)) return null;
  return normalizedFull;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Cache-Control": "no-store",
    ...headers
  });
  res.end(body);
}

function createServer() {
  return http.createServer((req, res) => {
    try {
      const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
      let pathname = url.pathname || "/";
      if (pathname === "/") pathname = "/index.html";
      const filePath = safeJoin(__dirname, pathname);
      if (!filePath) return send(res, 403, "Forbidden");
      if (!fs.existsSync(filePath)) return send(res, 404, "Not found");
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        const indexFile = path.join(filePath, "index.html");
        if (!fs.existsSync(indexFile) || !fs.statSync(indexFile).isFile()) return send(res, 404, "Not found");
        const ext = ".html";
        return send(res, 200, fs.readFileSync(indexFile), { "Content-Type": MIME[ext] });
      }
      if (!stat.isFile()) return send(res, 404, "Not found");
      const ext = path.extname(filePath).toLowerCase();
      const type = MIME[ext] || "application/octet-stream";
      send(res, 200, fs.readFileSync(filePath), { "Content-Type": type });
    } catch {
      send(res, 500, "Server error");
    }
  });
}

function canRetry(err) {
  return (
    err &&
    (err.code === "EACCES" ||
      err.code === "EPERM" ||
      err.code === "ENOBUFS" ||
      err.code === "EADDRINUSE" ||
      err.code === "EADDRNOTAVAIL")
  );
}

async function listenWithFallback() {
  let attempts = 0;
  let port = PORT;
  const hostChoices = HOST ? [HOST] : [undefined, "127.0.0.1", "localhost"];

  while (attempts < 3) {
    for (const host of hostChoices) {
      const server = createServer();
      const result = await new Promise((resolve) => {
        server.once("listening", () => resolve({ ok: true, server }));
        server.once("error", (err) => resolve({ ok: false, err }));
        if (host === undefined) server.listen(port);
        else server.listen(port, host);
      });

      if (result.ok) {
        const addr = result.server.address();
        const actualPort = typeof addr === "object" && addr ? addr.port : port;
        const displayHost =
          typeof addr === "object" && addr && addr.address && addr.address !== "::" ? addr.address : "localhost";
        console.log(`Static server running at http://${displayHost}:${actualPort}`);
        return;
      }

      const err = result.err;
      if (canRetry(err)) {
        continue;
      }

      console.error(err);
      process.exitCode = 1;
      return;
    }

    // If we got here, all host choices failed with retryable errors.
    if (attempts === 0) {
      // First fallback: pick an ephemeral port.
      port = 0;
      attempts += 1;
      continue;
    }

    console.log("Static server could not bind to a local port in this environment.");
    console.log(`Error codes included: EACCES/EPERM/EADDRINUSE/EADDRNOTAVAIL (or similar).`);
    console.log(`Open ${path.join(__dirname, "index.html")} directly in your browser (file://).`);
    process.exitCode = 0;
    return;
  }
}

listenWithFallback();

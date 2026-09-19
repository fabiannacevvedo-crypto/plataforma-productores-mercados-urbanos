import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUERTO = Number(process.env.FRONTEND_PORT) || 5175;
const API = process.env.BACKEND_URL || 'http://localhost:4000';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json'
};

const servirArchivo = (ruta, res) => {
  const abs = path.normalize(path.join(__dirname, ruta));
  if (!abs.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Acceso denegado.');
  }

  fs.stat(abs, (err, stats) => {
    if (err || !stats.isFile()) {
      const notFound = path.join(__dirname, '404.html');
      fs.stat(notFound, (err2) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('404 - Recurso no encontrado.');
        }
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        return fs.createReadStream(notFound).pipe(res);
      });
      return;
    }

    const ext = path.extname(abs).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(abs).pipe(res);
  });
};

const proxyApi = (req, res) => {
  const destino = `${API}${req.url}`;
  const proxy = http.request(
    destino,
    {
      method: req.method,
      headers: { ...req.headers, host: new URL(API).host }
    },
    (respuesta) => {
      res.writeHead(respuesta.statusCode || 502, { 'Content-Type': 'application/json; charset=utf-8', ...respuesta.headers });
      respuesta.pipe(res);
    }
  );

  proxy.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, message: 'El backend no está disponible. Iniciá el servidor en el puerto 4000.' }));
  });

  req.pipe(proxy);
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const ruta = decodeURIComponent(url.pathname);

  if (ruta.startsWith('/api/')) {
    return proxyApi(req, res);
  }

  const archivo = ruta === '/' ? '/index.html' : ruta;
  return servirArchivo(archivo, res);
});

server.listen(PUERTO, () => {
  console.log(`Frontend vanilla disponible en http://localhost:${PUERTO}`);
  console.log(`Proxy de API hacia ${API}`);
});
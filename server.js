const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PUBLIC_DIR = path.join(__dirname, 'public');
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function createApp() {
  const students = [];
  let nextId = 1;

  return http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const { pathname } = requestUrl;

    if (pathname === '/api/students' && req.method === 'GET') {
      return json(res, 200, students);
    }

    if (pathname === '/api/students' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const input = JSON.parse(body || '{}');
          if (!input.name || !input.email || !input.course) {
            return json(res, 400, { error: 'name, email and course are required' });
          }

          const student = {
            id: nextId++,
            name: String(input.name).trim(),
            email: String(input.email).trim(),
            course: String(input.course).trim()
          };

          if (!EMAIL_PATTERN.test(student.email)) {
            return json(res, 400, { error: 'invalid email format' });
          }

          students.push(student);
          return json(res, 201, student);
        } catch {
          return json(res, 400, { error: 'invalid json body' });
        }
      });
      return;
    }

    const studentIdMatch = pathname.match(/^\/api\/students\/(\d+)$/);
    if (studentIdMatch && req.method === 'PUT') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const id = Number(studentIdMatch[1]);
          const idx = students.findIndex((student) => student.id === id);
          if (idx === -1) {
            return json(res, 404, { error: 'student not found' });
          }

          const input = JSON.parse(body || '{}');
          if (!input.name || !input.email || !input.course) {
            return json(res, 400, { error: 'name, email and course are required' });
          }

          const updated = {
            id,
            name: String(input.name).trim(),
            email: String(input.email).trim(),
            course: String(input.course).trim()
          };

          if (!EMAIL_PATTERN.test(updated.email)) {
            return json(res, 400, { error: 'invalid email format' });
          }

          students[idx] = updated;
          return json(res, 200, updated);
        } catch {
          return json(res, 400, { error: 'invalid json body' });
        }
      });
      return;
    }

    if (studentIdMatch && req.method === 'DELETE') {
      const id = Number(studentIdMatch[1]);
      const idx = students.findIndex((student) => student.id === id);
      if (idx === -1) {
        return json(res, 404, { error: 'student not found' });
      }

      students.splice(idx, 1);
      return json(res, 204, {});
    }

    if (req.method === 'GET') {
      const filePath = pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, pathname);
      const normalizedPath = path.normalize(filePath);
      if (!normalizedPath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Forbidden');
      }

      fs.readFile(normalizedPath, (err, content) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('Not Found');
        }

        let type = 'text/plain; charset=utf-8';
        if (normalizedPath.endsWith('.html')) type = 'text/html; charset=utf-8';
        if (normalizedPath.endsWith('.css')) type = 'text/css; charset=utf-8';
        if (normalizedPath.endsWith('.js')) type = 'application/javascript; charset=utf-8';

        res.writeHead(200, { 'Content-Type': type });
        res.end(content);
      });
      return;
    }

    return json(res, 404, { error: 'route not found' });
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  createApp().listen(port, () => {
    console.log(`Student portal server running at http://localhost:${port}`);
  });
}

module.exports = { createApp };

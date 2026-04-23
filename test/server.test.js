const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server');

let server;
let baseUrl;

test.before(async () => {
  server = createApp();
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('student CRUD flow', async () => {
  let res = await fetch(`${baseUrl}/api/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sara',
      email: 'sara@example.com',
      course: 'Math'
    })
  });
  assert.equal(res.status, 201);
  const created = await res.json();
  assert.equal(created.name, 'Sara');

  res = await fetch(`${baseUrl}/api/students`);
  const list = await res.json();
  assert.equal(list.length, 1);

  res = await fetch(`${baseUrl}/api/students/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sara Khan',
      email: 'sara.khan@example.com',
      course: 'Physics'
    })
  });
  assert.equal(res.status, 200);

  res = await fetch(`${baseUrl}/api/students/${created.id}`, { method: 'DELETE' });
  assert.equal(res.status, 204);

  res = await fetch(`${baseUrl}/api/students`);
  const afterDelete = await res.json();
  assert.equal(afterDelete.length, 0);
});

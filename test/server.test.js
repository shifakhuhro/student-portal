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

test('returns expected errors for invalid input and missing records', async () => {
  let res = await fetch(`${baseUrl}/api/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{'
  });
  assert.equal(res.status, 400);

  res = await fetch(`${baseUrl}/api/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Missing fields' })
  });
  assert.equal(res.status, 400);

  res = await fetch(`${baseUrl}/api/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Bad Email',
      email: 'not-an-email',
      course: 'Math'
    })
  });
  assert.equal(res.status, 400);

  res = await fetch(`${baseUrl}/api/students/999`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'No One',
      email: 'noone@example.com',
      course: 'History'
    })
  });
  assert.equal(res.status, 404);

  res = await fetch(`${baseUrl}/api/students/999`, { method: 'DELETE' });
  assert.equal(res.status, 404);

  res = await fetch(`${baseUrl}/api/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'x'.repeat(1024 * 1024 + 1),
      email: 'large@example.com',
      course: 'Load'
    })
  });
  assert.equal(res.status, 413);
});

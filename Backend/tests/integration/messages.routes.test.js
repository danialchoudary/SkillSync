import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import jwt from 'jsonwebtoken';
import app from '../../app.js';
import User from '../../models/User.js';
import Message from '../../models/Message.js';

let server;
let baseUrl;

const originalUserFindById = User.findById;
const originalUserExists = User.exists;
const originalMessageCreate = Message.create;
const originalMessageFind = Message.find;
const originalMessageFindById = Message.findById;

function restoreModelStubs() {
  User.findById = originalUserFindById;
  User.exists = originalUserExists;
  Message.create = originalMessageCreate;
  Message.find = originalMessageFind;
  Message.findById = originalMessageFindById;
}

before(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-messages-secret';

  server = app.listen(0);
  await once(server, 'listening');
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  restoreModelStubs();

  if (!server) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const raw = await response.text();

  let body = raw;
  try {
    body = JSON.parse(raw);
  } catch {
    // Keep raw text when body is not JSON.
  }

  return { response, body };
}

function bearerToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET);
}

async function withMockedUser(user, fn) {
  User.findById = async () => user;
  try {
    await fn();
  } finally {
    restoreModelStubs();
  }
}

test('POST /api/messages/send validates required fields', async () => {
  await withMockedUser(
    { _id: '507f1f77bcf86cd799439011', id: '507f1f77bcf86cd799439011' },
    async () => {
      const token = bearerToken('507f1f77bcf86cd799439011');
      const { response, body } = await request('/api/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      assert.equal(response.status, 400);
      assert.equal(body.error, 'Missing required fields');
    },
  );
});

test('POST /api/messages/send rejects invalid receiverId', async () => {
  await withMockedUser(
    { _id: '507f1f77bcf86cd799439012', id: '507f1f77bcf86cd799439012' },
    async () => {
      const token = bearerToken('507f1f77bcf86cd799439012');
      const { response, body } = await request('/api/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: 'not-an-object-id',
          content: 'hello',
        }),
      });

      assert.equal(response.status, 400);
      assert.equal(body.error, 'Invalid receiverId');
    },
  );
});

test('POST /api/messages/send blocks sending to self', async () => {
  await withMockedUser(
    { _id: '507f1f77bcf86cd799439013', id: '507f1f77bcf86cd799439013' },
    async () => {
      const token = bearerToken('507f1f77bcf86cd799439013');
      const { response, body } = await request('/api/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: '507f1f77bcf86cd799439013',
          content: 'hello',
        }),
      });

      assert.equal(response.status, 400);
      assert.equal(body.error, 'You cannot send messages to yourself');
    },
  );
});

test('POST /api/messages/send returns 404 when receiver is missing', async () => {
  await withMockedUser(
    { _id: '507f1f77bcf86cd799439014', id: '507f1f77bcf86cd799439014' },
    async () => {
      User.exists = async () => null;

      const token = bearerToken('507f1f77bcf86cd799439014');
      const { response, body } = await request('/api/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: '507f1f77bcf86cd799439015',
          content: 'hello',
        }),
      });

      assert.equal(response.status, 404);
      assert.equal(body.error, 'Receiver not found');
    },
  );
});

test('POST /api/messages/send creates a message', async () => {
  await withMockedUser(
    { _id: '507f1f77bcf86cd799439016', id: '507f1f77bcf86cd799439016' },
    async () => {
      User.exists = async () => ({ _id: '507f1f77bcf86cd799439017' });
      Message.create = async (payload) => ({
        _id: 'message-1',
        ...payload,
      });

      const token = bearerToken('507f1f77bcf86cd799439016');
      const { response, body } = await request('/api/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: '507f1f77bcf86cd799439017',
          content: 'hello there',
        }),
      });

      assert.equal(response.status, 201);
      assert.equal(body.senderId, '507f1f77bcf86cd799439016');
      assert.equal(body.receiverId, '507f1f77bcf86cd799439017');
      assert.equal(body.content, 'hello there');
      assert.equal(body.messageType, 'text');
    },
  );
});

test('POST /api/messages/upload returns 400 when file is missing', async () => {
  await withMockedUser(
    { _id: '507f1f77bcf86cd799439018', id: '507f1f77bcf86cd799439018' },
    async () => {
      const token = bearerToken('507f1f77bcf86cd799439018');
      const { response, body } = await request('/api/messages/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assert.equal(response.status, 400);
      assert.equal(body.error, 'No file uploaded');
    },
  );
});

test('GET /api/messages/conversation/:userId validates userId', async () => {
  await withMockedUser(
    { _id: '507f1f77bcf86cd799439019', id: '507f1f77bcf86cd799439019' },
    async () => {
      const token = bearerToken('507f1f77bcf86cd799439019');
      const { response, body } = await request('/api/messages/conversation/not-a-valid-id', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assert.equal(response.status, 400);
      assert.equal(body.error, 'Invalid userId');
    },
  );
});

test('GET /api/messages/conversation/:userId returns empty list for self-conversation', async () => {
  await withMockedUser(
    { _id: '507f1f77bcf86cd799439020', id: '507f1f77bcf86cd799439020' },
    async () => {
      const token = bearerToken('507f1f77bcf86cd799439020');
      const { response, body } = await request('/api/messages/conversation/507f1f77bcf86cd799439020', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assert.equal(response.status, 200);
      assert.deepEqual(body, []);
    },
  );
});

test('GET /api/messages/conversation/:userId returns conversation messages', async () => {
  await withMockedUser(
    { _id: '507f1f77bcf86cd799439021', id: '507f1f77bcf86cd799439021' },
    async () => {
      Message.find = () => ({
        sort: async () => ([
          { _id: 'm1', content: 'a' },
          { _id: 'm2', content: 'b' },
        ]),
      });

      const token = bearerToken('507f1f77bcf86cd799439021');
      const { response, body } = await request('/api/messages/conversation/507f1f77bcf86cd799439022', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assert.equal(response.status, 200);
      assert.equal(body.length, 2);
      assert.equal(body[0].content, 'a');
      assert.equal(body[1].content, 'b');
    },
  );
});

test('PUT /api/messages/:id/seen returns 404 for missing message', async () => {
  await withMockedUser(
    { _id: '507f1f77bcf86cd799439023', id: '507f1f77bcf86cd799439023' },
    async () => {
      Message.findById = async () => null;

      const token = bearerToken('507f1f77bcf86cd799439023');
      const { response, body } = await request('/api/messages/507f1f77bcf86cd799439024/seen', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assert.equal(response.status, 404);
      assert.equal(body.error, 'Message not found');
    },
  );
});

test('PUT /api/messages/:id/seen returns 403 when current user is not receiver', async () => {
  await withMockedUser(
    { _id: '507f1f77bcf86cd799439025', id: '507f1f77bcf86cd799439025' },
    async () => {
      Message.findById = async () => ({
        _id: '507f1f77bcf86cd799439026',
        receiverId: { toString: () => '507f1f77bcf86cd799439027' },
        seen: false,
      });

      const token = bearerToken('507f1f77bcf86cd799439025');
      const { response, body } = await request('/api/messages/507f1f77bcf86cd799439026/seen', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assert.equal(response.status, 403);
      assert.equal(body.error, 'Not allowed to mark this message as seen');
    },
  );
});

test('PUT /api/messages/:id/seen marks message as seen', async () => {
  await withMockedUser(
    { _id: '507f1f77bcf86cd799439028', id: '507f1f77bcf86cd799439028' },
    async () => {
      const message = {
        _id: '507f1f77bcf86cd799439029',
        receiverId: { toString: () => '507f1f77bcf86cd799439028' },
        seen: false,
        saveCalls: 0,
        async save() {
          this.saveCalls += 1;
        },
      };
      Message.findById = async () => message;

      const token = bearerToken('507f1f77bcf86cd799439028');
      const { response, body } = await request('/api/messages/507f1f77bcf86cd799439029/seen', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assert.equal(response.status, 200);
      assert.equal(body.seen, true);
      assert.equal(message.saveCalls, 1);
    },
  );
});

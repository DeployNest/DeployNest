const { Hono } = require('hono');

const users = new Hono();

users.get('/', (c) => {
  return c.text("OK");
});

module.exports = users;
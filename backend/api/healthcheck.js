const { Hono } = require('hono');

const routes = new Hono();

routes.get('/', (c) => {
  return c.text("OK");
});

module.exports = routes;
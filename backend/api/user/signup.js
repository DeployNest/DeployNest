const { Hono } = require('hono');
const { z } = require('zod');
const { validator } = require("hono/validator");;
const User = require("../../types/user")

const routes = new Hono();

const schema = z.object({
    username: z.string().min(1, "You must provide a username!"),
    email: z.string().email("This is not a valid email."),
    password: z.string().min(1, "You must set a password!"),
})

routes.post(
    '/',
    validator("json", (value, c) => {
        const parsed = schema.safeParse(value)
        if (!parsed.success) {
            return c.text('Invalid Body', 400)
        }
    }),
    async (c) => {
        const { username, email, password } = await c.req.json()

        const user = new User(username)
        return await user.signup(email, password).then((success) => {
            if (!success) {
                throw Error("Failed to create user!");
            }
            return c.text("OK");
        }).catch((err) => {
            return c.text(err.message, 500);
        })
    });

module.exports = routes
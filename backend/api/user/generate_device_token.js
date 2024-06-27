const { Hono } = require('hono');
const { validator } = require("hono/validator");

const ZodSchemas = require("../../modules/zod-schemas");
const { z } = require('zod');

const User = require("../../types/user");
const users = require("../../modules/users");

const routes = new Hono();

const schema = z.object({
    user: ZodSchemas.get_userIdentifier,
    authObject: ZodSchemas.authObject,
})

routes.post(
    '/',
    validator("json", (value, c) => {
        const parsed = schema.safeParse(value)
        if (!parsed.success) {
            const errors = []

            if (parsed.error?.issues) {
                parsed.error?.issues.forEach((err) => {
                    errors.push(err.message)
                })
            }

            return c.json({
                success: false,
                summary: 'Invalid body',
                errors: errors,
            }, 400)
        }
    }),
    async (c) => {
        const { user: userIdentifier, authObject } = await c.req.json()

        const username = await users.getUserFromIdentifier(userIdentifier).catch((err) => {
            return c.json({
                success: false,
                errors: [err.message],
            }, 500)
        })

        const user = new User(username)
        
        return await user.authenticate(authObject).then((success) => {
            if (!success) {
                throw Error("Failed to authenticate!")
            }

            return user.generateDeviceToken()
        }).then((deviceToken) => {
            return c.json({
                success: true,
                token: deviceToken,
            })
        }).catch((err) => {
            return c.json({
                success: false,
                errors: [err.message],
            }, 500)
        })
    }
);

module.exports = routes
const { z } = require('zod');

const schemas = {}

schemas.set_username = z.string().min(1, "You must provide a username!");
schemas.set_email = z.string().email("This is not a valid email.");
schemas.set_password = z.string().min(1, "You must set a password!");

schemas.get_userIdentifier = z.string().min(1, "You must provide a user!");

schemas.authObject = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("password"),
        password: z.string(),
    }),
    z.object({
        type: z.literal("oneTimeCode"),
        oneTimeCode: z.string(),
    }),
]);


module.exports = schemas
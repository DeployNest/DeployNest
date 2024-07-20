import { Hono } from "hono";
import { validator } from "hono/validator";
import { ZodSchemas } from "modules/zod-schemas";
import { z } from "zod";
import User from "classes/user";

const routes = new Hono();

const schema = z.object({
	username: ZodSchemas.set_username,
	email: ZodSchemas.set_email,
	password: ZodSchemas.set_password,
});

routes.post(
	"/",
	validator("json", (value, c) => {
		const parsed = schema.safeParse(value);
		if (!parsed.success) {
			const errors = [];

			if (parsed.error?.issues) {
				parsed.error?.issues.forEach((err) => {
					errors.push(err.message);
				});
			}

			return c.json(
				{
					success: false,
					summary: "Invalid body",
					errors: errors,
				},
				400
			);
		}
	}),
	async (c) => {
		const { email, password } = await c.req.json();

		const user = new User(email);
		return await user
			.create(password)
			.then((success) => {
				if (!success) {
					throw Error("Failed to create user!");
				}

				return c.json({
					success: true,
					summary: "Created user",
				});
			})
			.catch((err) => {
				return c.json(
					{
						success: false,
						summary: "Failed to create user",
						errors: [err.message],
					},
					500
				);
			});
	}
);

export { routes };

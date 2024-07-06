import { z } from "zod";

const schemas = {
	set_username: z.string().min(1, "You must provide a username!"),
	set_email: z.string().email("This is not a valid email."),
	set_password: z.string().min(1, "You must set a password!"),
	get_userIdentifier: z.string().min(1, "You must provide a user!"),
	authObject: z.discriminatedUnion("type", [
		z.object({
			type: z.literal("password"),
			password: z.string(),
		}),
		z.object({
			type: z.literal("oneTimeCode"),
			oneTimeCode: z.string(),
		}),
	]),
};

// Define types based on the schemas
type UserSchemas = {
	[K in keyof typeof schemas]: z.infer<(typeof schemas)[K]>;
};

export { schemas as ZodSchemas };
export type { UserSchemas };

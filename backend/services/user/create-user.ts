import { User } from "@prisma/client";
import tokenCollection from "collections/token.collection";
import userCollection from "collections/user.collection";
import HashService from "utils/hash";

export async function signup(
	email: string,
	password: string
): Promise<Pick<User, "email" | "id" | "username">> {
	const user = await userCollection.getUserByEmail(email);
	if (user) throw new Error("User already exists");

	const hashedPassword = await HashService.hashPassword(password);
	const newUser = await userCollection.signup({
		email,
		username: email,
		hash: hashedPassword,
        verified: true,
	});

	return {
		email: newUser.email,
		id: newUser.id,
		username: newUser.username,
	};
}

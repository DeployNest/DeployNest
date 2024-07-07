import { User } from "@prisma/client";
import userCollection from "src/collections/user.collection";
import HashService from "src/utils/hash";

export async function create_user(
	email: string,
	password: string
): Promise<Pick<User, "email" | "id" | "username">> {
	const user = await userCollection.getUserByEmail(email, {
		select: { email: true },
	});
	if (user) throw new Error("User already exists");

	const hashedPassword = await HashService.hashPassword(password);
	const newUser = await userCollection.create({
		email,
		username: this.username,
		hash: hashedPassword,
		verified: true,
	});

	return {
		email: newUser.email,
		id: newUser.id,
		username: newUser.username,
	};
}

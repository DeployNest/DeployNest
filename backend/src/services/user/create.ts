import { User } from "@prisma/client";
import userCollection from "collections/user.collection";
import HashService from "utils/hash";

export async function create_user(
	password: string
): Promise<Pick<User, "email" | "id">> {
	const user = await userCollection.getUserByEmail(this.email);
	if (user) throw new Error("User already exists");

	const hashedPassword = await HashService.hashPassword(password);
	const newUser = await userCollection.create({
		email: this.email,
		hash: hashedPassword,
	});

	return {
		email: newUser.email,
		id: newUser.id,
	};
}
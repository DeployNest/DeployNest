import { Token } from "@prisma/client";
import tokenCollection from "collections/token.collection";
import userCollection from "collections/user.collection";
import HashService from "utils/hash";

type Props = {
	email: string;
	password: string;
};

export async function LoginService({
	email,
	password,
}: Props): Promise<Pick<Token, "token" | "expiresAt">> {
	const user = await userCollection.getUserByEmail(email, {
		select: { id: true, passwordHash: true },
	});
	if (!user) throw new Error("User not found");

	const passwordMatch = await HashService.comparePasswords(
		password,
		user.passwordHash
	);
	if (!passwordMatch) throw new Error("Invalid password");

	const token = await tokenCollection.generateToken({
		userId: user.id,
		type: "email_verification",
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
	});

	return token;
}

import { Token } from "@prisma/client";
import tokenCollection from "src/collections/token.collection";
import userCollection from "src/collections/user.collection";
import HashService from "src/utils/hash";

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

	// TODO store token in session-storage along with user id or data

	return token;
}

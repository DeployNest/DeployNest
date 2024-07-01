import { User } from "@prisma/client";
import tokenCollection from "collections/token.collection";
import userCollection from "collections/user.collection";
import HashService from "utils/hash";
import Mailer from "utils/mailer";

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
	});

	const verificationToken = await tokenCollection.generateToken({
		userId: newUser.id,
		type: "email_verification",
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
	});

	// TODO udpate this link
	const verificationLink = `https://example.com/verify-email?token=${verificationToken.id}`;

	// TODO add email verification template
	const mailer = new Mailer();
	await mailer.sendMail(
		email,
		"Verify your email",
		`Click here to verify your email: ${verificationLink}`,
		`<a href="${verificationLink}">Click here to verify your email</a>`
	);

	return {
		email: newUser.email,
		id: newUser.id,
		username: newUser.username,
	};
}

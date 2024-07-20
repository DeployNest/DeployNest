import { User } from "@prisma/client";
import userCollection from "collections/user.collection";
import HashService from "utils/hash";

type Props = {
	username: string;
	name?: string;
	email: string;
	password: string;
};

export async function SignupService({
	username,
	name,
	email,
	password,
}: Props): Promise<Pick<User, "email" | "id" | "username">> {
	const user = await userCollection.getUserByEmail(email, {
		select: { id: true },
	});
	if (user) throw new Error("User already exists");

	const hashedPassword = await HashService.hashPassword(password);
	const newUser = await userCollection.signup({
		email,
		username,
		hash: hashedPassword,
	});

	// NOTE as this is self-hosted, we don't have to send verification email
	// // TODO create a mailer instance from user config
	// const mailer = new Mailer({
	// 	type: "user",
	// 	service: "nodemailer",
	// 	config: {
	// 		host: "",
	// 		port: 587,
	// 		secure: false,
	// 		auth: {
	// 			user: "",
	// 			pass: "",
	// 		},
	// 	},
	// });
	// // TODO add email verification template
	// await mailer.nodemailerSendMail(
	// 	email,
	// 	"Verify your email",
	// 	`Click here to verify your email: ${verificationLink}`,
	// 	`<a href="${verificationLink}">Click here to verify your email</a>`
	// );

	return {
		email: newUser.email,
		id: newUser.id,
		username: newUser.username,
	};
}

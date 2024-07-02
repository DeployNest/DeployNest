import { Token } from "@prisma/client";
import tokenCollection from "collections/token.collection";

type Props = {
	token: string;
};

export async function VerifyEmailTokenService({ token }: Props): Promise<Token> {
	const tokenRecord = await tokenCollection.validateToken({
		token,
		deleteOnSuccess: true,
	});
	if (!tokenRecord) throw new Error("Invalid token");

	return tokenRecord;
}

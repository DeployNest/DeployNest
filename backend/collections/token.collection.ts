import { PrismaClient, Token } from "@prisma/client";
import { prisma } from "modules/databases";
import HashService from "utils/hash";

class TokenCollection {
	constructor(private prisma: PrismaClient) {}

	async generateToken({
		userId,
		type,
		expiresAt,
	}: {
		userId: string;
		type: "password_reset" | "email_verification" | "api_key";
		expiresAt?: Date;
	}) {
		try {
			const token = await HashService.generateToken();
			const newToken = await this.prisma.token.create({
				data: {
					userId,
					type,
					token,
					expiresAt,
				},
			});
			return newToken;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async validateToken({
		token,
		deleteOnSuccess = false,
	}: {
		token: string;
		deleteOnSuccess?: boolean;
	}): Promise<Token | null> {
		try {
			const tokenRecord = await this.prisma.token.findFirst({
				where: {
					id: token,
				},
			});

			if (!tokenRecord) {
				return null;
			}

			if (deleteOnSuccess) {
				await this.deleteToken({
					token,
					userId: tokenRecord.userId,
				});
			}

			return tokenRecord;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async deleteToken({
		userId,
		token,
	}: {
		userId: string;
		token: string;
	}): Promise<void> {
		try {
			await this.prisma.token.delete({
				where: {
					id: token,
					userId,
				},
			});
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
}

export default new TokenCollection(prisma);

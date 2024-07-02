import { PrismaClient, User } from "@prisma/client";
import { prisma } from "modules/databases";

class UserCollection {
	constructor(private prisma: PrismaClient) {}

	async signup({
		username,
		email,
		hash,
	}: {
		username: string;
		email: string;
		hash: string;
	}) {
		try {
			const user = await this.prisma.user.create({
				data: {
					username,
					email,
					passwordHash: hash,
				},
			});
			return user;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async getUserById(userId: string) {
		try {
			const user = await this.prisma.user.findUnique({
				where: { id: userId },
			});
			return user;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async getUserByEmail(
		email: string,
		{
			select,
		}: {
			select?: { [fieldName: string]: true };
		}
	): Promise<User | null> {
		try {
			const user = await this.prisma.user.findFirst({
				where: { email },
				// select,
			});
			return user;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async changePassword({
		userId,
		newPasswordHash,
	}: {
		userId: string;
		newPasswordHash: string;
	}) {
		try {
			const updatedUser = await this.prisma.user.update({
				where: { id: userId },
				data: { passwordHash: newPasswordHash },
			});
			return updatedUser;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
}

export default new UserCollection(prisma);

import { PrismaClient, User } from "@prisma/client";
import { prisma } from "modules/databases";
import tokenCollection from "collections/token.collection";

class UserCollection {
	constructor(private prisma: PrismaClient) {}

	async signup({
		email,
		hash,
	}: {
		email: string;
		hash: string;
	}) {
		try {
			const user = await this.prisma.user.create({
				data: {
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
		email: string
	): Promise<User | null> {
		try {
			const user = await this.prisma.user.findFirst({
				where: { email },
			});
			return user;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async setPassword({
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

	async create({
		email,
		hash,
	}: {
		email: string;
		hash: string;
	}) {
		try {
			const newUser = await this.prisma.user.create({
				data: {
					email,
					passwordHash: hash,
				},
			});
			return newUser;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
}

export default new UserCollection(prisma);

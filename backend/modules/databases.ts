import { PrismaClient } from "@prisma/client";

class Databases {
	private static instance: PrismaClient;

	//? Private constructor to prevent instantiation
	private constructor() {}

	public static getInstance(): PrismaClient {
		if (!Databases.instance) {
			Databases.instance = new PrismaClient();
		}

		return Databases.instance;
	}
}

const prisma = Databases.getInstance();

export { prisma };

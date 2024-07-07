import bcrypt from "bcrypt";

class HashService {
	private static readonly saltRounds = 10;

	static async generateToken(): Promise<string> {
		const token = await bcrypt.genSalt(this.saltRounds);
		return token;
	}

	static async hashPassword(password: string): Promise<string> {
		const salt = await bcrypt.genSalt(this.saltRounds);
		const hashedPassword = await bcrypt.hash(password, salt);
		return hashedPassword;
	}

	static async comparePasswords(
		password: string,
		hashedPassword: string
	): Promise<boolean> {
		const isMatch = await bcrypt.compare(password, hashedPassword);
		return isMatch;
	}
}

export default HashService;

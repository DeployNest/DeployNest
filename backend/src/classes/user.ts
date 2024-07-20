import { create_user } from "services/user/create";

class User {
	private email: string;

	constructor(email: string) {
		this.email = email;
	}

	create: typeof create_user = create_user.bind(this);
}

export default User;
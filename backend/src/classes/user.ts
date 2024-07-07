import { create_user } from "src/services/user/create-user";
import { signup } from "src/services/user/signup";

class User {
	private username: string;

	constructor(username: string) {
		this.username = username;
	}

	create_user: typeof create_user = create_user.bind(this);
	signup: typeof signup = signup.bind(this);
}

export default User;

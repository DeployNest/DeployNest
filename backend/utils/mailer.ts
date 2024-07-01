import nodemailer from "nodemailer";

class Mailer {
	private transporter: nodemailer.Transporter;

	constructor() {
		// TODO add email configuration to environment variables
		this.transporter = nodemailer.createTransport({
			host: "smtp.example.com",
			port: 587,
			secure: false,
			auth: {
				user: "agent@deploynest.com",
				pass: "keyboard-cat",
			},
		});
	}

	async sendMail(
		to: string,
		subject: string,
		text: string,
		html: string
	): Promise<void> {
		const mailOptions = {
			from: '"Deploynest Agent" <agent@deploynest.com>',
			to: to,
			subject: subject,
			text: text,
			html: html,
		};

		try {
			const info = await this.transporter.sendMail(mailOptions);
			console.log("Message sent: %s", info.messageId);
		} catch (error) {
			console.error("Error sending email: ", error);
		}
	}
}

export default Mailer;

/**
 * Mailer class to send emails using different services
 *
 * There can be two types of mailer configurations:
 * 1. User mailer configuration: This configuration is used to send emails on behalf of the user, using the user's email service provider.
 * 2. System mailer configuration: This configuration is used to send emails on behalf of the system.
 *
 ** INFO
 * - System mailer configuration is used to send system-generated emails like email verification, password reset, etc.
 *   The system mailer configuration is set up once during the application startup. // TODO
 *
 * - User mailer configuration is used to send notification emails or other alerts setup by the user on our platform.
 *
 ** EXTENDABILITY
 *
 * - We can add support for other mail services like SendGrid, MailGun, MailChimp, etc.
 * - To add support for a new mailer service, do the following:
 * 1. Add a new type in the mailer config type.
 * 2. Add a new method to setup the new mailer service.
 * 3. Add a new method to send emails using the new mailer service.
 * 4. Update the setup method to call the new setup method based on the service type.
 * 5. Update the sendMail method to call the new sendMail method based on the service type.
 *
 */

import nodemailer from "nodemailer";
import { MailerConfig } from "types/mailer";

class Mailer {
	private nodemailerTransporter: nodemailer.Transporter;

	constructor(private readonly config: MailerConfig) {
		this.setup();
	}

	async setup() {
		switch (this.config.service) {
			case "nodemailer":
				await this.nodemailerSetup();
				break;
			// TODO add other mail services as we support them
			default:
				// TODO add proper error logging for user and system
				throw new Error("Invalid mail service");
		}
	}

	async sendMail({
		to,
		subject,
		text,
		html,
	}: {
		to: string;
		subject: string;
		text: string;
		html: string;
	}): Promise<void> {
		switch (this.config.service) {
			case "nodemailer":
				await this.nodemailerSendMail(to, subject, text, html);
				break;
			// TODO add other mail services as we support them
			default:
				// TODO add proper error logging for user and system
				throw new Error("Invalid mail service");
		}
	}

	async nodemailerSetup() {
		if (this.config.type !== "system") {
			throw new Error("Invalid config type");
		}
		const { config } = this.config;
		this.nodemailerTransporter = nodemailer.createTransport({
			host: config.host,
			port: config.port,
			secure: config.secure,
			auth: {
				user: config.auth.user,
				pass: config.auth.pass,
			},
		});
	}

	async nodemailerSendMail(
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
			const info = await this.nodemailerTransporter.sendMail(mailOptions);
			console.log("Message sent: %s", info.messageId);
		} catch (error) {
			console.error("Error sending email: ", error);
		}
	}
}

export default Mailer;

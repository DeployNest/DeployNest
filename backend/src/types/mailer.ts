export type NodeMailerConfig = {
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
};

export type SendGridConfig = {
	apiKey: string;
};

export type MailGunConfig = {
	apiKey: string;
	domain: string;
};

export type MailChimpConfig = {
	apiKey: string;
};

export type MailJetConfig = {
	apiKey: string;
	secretKey: string;
};

export type UserNodemailerConfig = {
	type: "user";
	service: "nodemailer";
	config: NodeMailerConfig;
};

export type UserSendGridConfig = {
	type: "user";
	service: "sendgrid";
	config: SendGridConfig;
};

export type UserMailGunConfig = {
	type: "user";
	service: "mailgun";
	config: MailGunConfig;
};

export type UserMailChimpConfig = {
	type: "user";
	service: "mailchimp";
	config: MailChimpConfig;
};

export type UserMailJetConfig = {
	type: "user";
	service: "mailjet";
	config: MailJetConfig;
};

export type UserMailerConfig =
	| UserNodemailerConfig
	| UserSendGridConfig
	| UserMailGunConfig
	| UserMailChimpConfig
	| UserMailJetConfig;

export type SystemMailerConfig = {
	type: "system";
	service: "nodemailer";
	config: NodeMailerConfig;
};

export type MailerConfig =
	// SystemMailerConfig |
	UserMailerConfig;

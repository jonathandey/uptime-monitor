"use strict";

var MailgunTransport = require('./mail/MailgunTransport');

class Mail {

	constructor(transport)
	{
		this.transport = transport;

		if(this.transport === undefined)
		{
			this.transport = new MailgunTransport(process.env.MAILGUN_KEY, process.env.MAILGUN_DOMAIN);
		}
	}

	setTo(emails)
	{
		this.to = emails;

		return this;
	}

	setSubject(subject)
	{
		this.subject = subject;

		return this;
	}

	setFrom(from)
	{
		this.from = from;

		return this;
	}

	setBody(msg)
	{
		this.body = msg;

		return this;
	}

	send()
	{
		var to = this.to || process.env.MAIL_TO;
		var from = this.from || process.env.MAIL_FROM;
		var subject = this.subject || process.env.MAIL_SUBJECT;

		var data = {
			to: to,
			from: from,
			subject: subject,
			html: this.body
		}

		this.transport.send(data);
	}

}

module.exports = Mail;
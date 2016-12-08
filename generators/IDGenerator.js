"use strict";

class IDGenerator {

	constructor(str)
	{
		this.str = str;

		return this;
	}

	make()
	{
		return this.encode()
	}

	encode()
	{
		var buff = new Buffer(this.str);

		return buff.toString('base64');
	}

	decode()
	{
		return Buffer.from(this.str, 'base64').toString();
	}

}

module.exports = IDGenerator;
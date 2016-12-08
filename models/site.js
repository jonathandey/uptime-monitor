"use strict";

var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

const Collection = require('./Collection');
const IDGenerator = require('../generators/IDGenerator');

class Site {

	constructor(attributes)
	{
		attributes = (attributes === undefined) ? {} : attributes;

		var sitesFolder = process.env.SITES_FOLDER || 'storage/sites';
		this.sitesPath = path.join(__dirname, '/../', sitesFolder);

		this._defaultAttributes = {
			interval: 300000,
			pause: false,
			notifications: ['mail', 'console']
		}

		if(attributes !== null)
		{
			this.attributes = attributes;
		}
	}

	makeKey()
	{
		return new IDGenerator(this.attributes.url).make();
	}

	getKey()
	{
		if(this.attributes.id !== undefined)
		{
			return this.attributes.id;
		}

		return this.makeKey();
	}

	create(attributes)
	{
		attributes = Object.assign(this._defaultAttributes, {
			id: this.makeKey()
		}, attributes);

		var site = new Site(attributes);

		return site.save();
	}

	update(attributes)
	{
		this.attributes = Object.assign(this.attributes, attributes);

		console.log('updating', this)

		return this.save();
	}

	save()
	{
		try {
			var data = yaml.safeDump(this.attributes);

			fs.writeFileSync(path.join(this.sitesPath, this.getKey()), data);

			return this;
		} catch(error)
		{
			// The file possibly exists. If so we want to overwrite it
			console.log(error);
		}
	}

	all()
	{
		// Todo: loop through folders and extract files
		var sites = new Collection();

		var siteFiles = fs.readdirSync(this.sitesPath).filter(function(file)
		{
			// Filter out anything but files. Ignore files begining with a .
			return fs.statSync(path.join(this.sitesPath, file)).isFile() && file.indexOf('.') !== 0;
		}.bind(this));

		siteFiles.forEach(function(id) {
			sites.push(this.find(id));
		}.bind(this));

		return sites.getItems();
	}

	find(id)
	{
		try {
			var data = fs.readFileSync(path.join(this.sitesPath, id));
			var site = new Site(yaml.safeLoad(data));

			return site;
		} catch (error) {
			return null;
		}
	}

	exists(id, encoded)
	{
		encoded = (encoded === undefined) ? true : false;

		this.attributes.id = id;

		if(!encoded)
		{
			this.attributes.url = id;
			this.attributes.id = this.makeKey();
		}

		try {
			return fs.statSync(path.join(this.sitesPath, this.getKey()));
		} catch (error) {
			return false;
		}		
	}

	getAttribute(attr)
	{
		return this.attributes[attr];
	}

}

module.exports = Site;